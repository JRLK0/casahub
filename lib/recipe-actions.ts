"use server";

import { z } from "zod";
import prisma from "./prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

// --- Schemas ---

const ingredientSchema = z.object({
  id: z.string().optional(),
  productId: z.string().optional().nullable(),
  name: z.string().min(1, "El nombre del ingrediente es requerido"),
  quantity: z.number().min(0),
  unit: z.string().min(1),
});

const recipeSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "El nombre de la receta es requerido"),
  description: z.string().optional().nullable(),
  instructions: z.string().optional().nullable(),
  servings: z.number().optional().nullable(),
  prepTime: z.number().optional().nullable(),
  cookTime: z.number().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  ingredients: z.array(ingredientSchema),
});

// --- Auth Helper ---

async function requireAuth() {
  const session = await auth();
  if (!session?.user) {
    throw new Error("No autorizado");
  }
  return session.user;
}

// --- Recipe Actions ---

export async function getRecipes() {
  try {
    await requireAuth();
    const recipes = await prisma.recipe.findMany({
      include: {
        ingredients: {
          include: {
            product: true,
          }
        },
      },
      orderBy: {
        name: 'asc',
      },
    });
    return { success: true, recipes };
  } catch (error) {
    return { error: "Error al obtener las recetas" };
  }
}

export async function getRecipe(id: string) {
  try {
    await requireAuth();
    const recipe = await prisma.recipe.findUnique({
      where: { id },
      include: {
        ingredients: {
          include: {
            product: {
              include: {
                location: true,
              }
            },
          }
        },
      },
    });
    if (!recipe) return { error: "Receta no encontrada" };
    return { success: true, recipe };
  } catch (error) {
    return { error: "Error al obtener la receta" };
  }
}

export async function createRecipe(data: z.infer<typeof recipeSchema>) {
  try {
    await requireAuth();
    const validatedData = recipeSchema.parse(data);

    const recipe = await prisma.recipe.create({
      data: {
        name: validatedData.name,
        description: validatedData.description,
        instructions: validatedData.instructions,
        servings: validatedData.servings,
        prepTime: validatedData.prepTime,
        cookTime: validatedData.cookTime,
        imageUrl: validatedData.imageUrl,
        ingredients: {
          create: validatedData.ingredients.map(ing => ({
            name: ing.name,
            quantity: ing.quantity,
            unit: ing.unit,
            productId: ing.productId,
          })),
        },
      },
    });

    revalidatePath("/app/cocina/recetas");
    return { success: true, recipe };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.errors[0]?.message || "Error de validación" };
    }
    return { error: "Error al crear la receta" };
  }
}

export async function updateRecipe(data: z.infer<typeof recipeSchema>) {
  try {
    await requireAuth();
    if (!data.id) return { error: "ID de receta requerido" };
    
    const validatedData = recipeSchema.parse(data);

    // Actualizar receta y sus ingredientes
    // Para simplificar, eliminamos los ingredientes existentes y creamos los nuevos
    await prisma.$transaction([
      prisma.recipeIngredient.deleteMany({
        where: { recipeId: data.id },
      }),
      prisma.recipe.update({
        where: { id: data.id },
        data: {
          name: validatedData.name,
          description: validatedData.description,
          instructions: validatedData.instructions,
          servings: validatedData.servings,
          prepTime: validatedData.prepTime,
          cookTime: validatedData.cookTime,
          imageUrl: validatedData.imageUrl,
          ingredients: {
            create: validatedData.ingredients.map(ing => ({
              name: ing.name,
              quantity: ing.quantity,
              unit: ing.unit,
              productId: ing.productId,
            })),
          },
        },
      }),
    ]);

    revalidatePath("/app/cocina/recetas");
    revalidatePath(`/app/cocina/recetas/${data.id}`);
    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.errors[0]?.message || "Error de validación" };
    }
    return { error: "Error al actualizar la receta" };
  }
}

export async function deleteRecipe(id: string) {
  try {
    await requireAuth();
    await prisma.recipe.delete({
      where: { id },
    });
    revalidatePath("/app/cocina/recetas");
    return { success: true };
  } catch (error) {
    return { error: "Error al eliminar la receta" };
  }
}

export async function checkRecipeAvailability(recipeId: string) {
  try {
    await requireAuth();
    const recipe = await prisma.recipe.findUnique({
      where: { id: recipeId },
      include: {
        ingredients: {
          include: {
            product: true,
          }
        }
      }
    });

    if (!recipe) return { error: "Receta no encontrada" };

    const availability = recipe.ingredients.map(ing => {
      if (!ing.productId || !ing.product) {
        return { name: ing.name, available: false, missing: ing.quantity, status: 'unknown' };
      }
      
      const isAvailable = ing.product.quantity >= ing.quantity;
      return {
        name: ing.name,
        available: isAvailable,
        currentQuantity: ing.product.quantity,
        requiredQuantity: ing.quantity,
        unit: ing.unit,
        status: isAvailable ? 'available' : 'insufficient'
      };
    });

    const totalIngredients = availability.length;
    const availableIngredients = availability.filter(a => a.available).length;
    
    let status: 'green' | 'yellow' | 'red' = 'red';
    if (availableIngredients === totalIngredients) status = 'green';
    else if (availableIngredients >= totalIngredients / 2) status = 'yellow';

    return { success: true, availability, status };
  } catch (error) {
    return { error: "Error al comprobar disponibilidad" };
  }
}

