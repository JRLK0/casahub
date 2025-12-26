"use server";

import { z } from "zod";
import prisma from "./prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

// --- Schemas ---

const productSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, "El nombre es requerido"),
  quantity: z.number().min(0, "La cantidad no puede ser negativa"),
  unit: z.string().min(1, "La unidad es requerida"),
  locationId: z.string().min(1, "La ubicación es requerida"),
  categoryId: z.string().optional().nullable(),
  expiryDate: z.date().optional().nullable(),
  openedAt: z.date().optional().nullable(),
  minStock: z.number().optional().nullable(),
  notes: z.string().optional().nullable(),
});

// --- Auth Helper ---

async function requireAuth() {
  const session = await auth();
  if (!session?.user) {
    throw new Error("No autorizado");
  }
  return session.user;
}

// --- Product Actions ---

export async function getProducts(filters?: { 
  locationId?: string; 
  categoryId?: string;
  search?: string;
}) {
  try {
    await requireAuth();

    const where: any = {};
    if (filters?.locationId) where.locationId = filters.locationId;
    if (filters?.categoryId) where.categoryId = filters.categoryId;
    if (filters?.search) {
      where.name = { contains: filters.search, mode: 'insensitive' };
    }

    const products = await prisma.product.findMany({
      where,
      include: {
        location: true,
        category: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    return { success: true, products };
  } catch (error) {
    console.error("Error fetching products:", error);
    return { error: "Error al obtener los productos" };
  }
}

export async function createProduct(data: z.infer<typeof productSchema>) {
  try {
    await requireAuth();
    const validatedData = productSchema.parse(data);

    const product = await prisma.product.create({
      data: {
        name: validatedData.name,
        quantity: validatedData.quantity,
        unit: validatedData.unit,
        locationId: validatedData.locationId,
        categoryId: validatedData.categoryId,
        expiryDate: validatedData.expiryDate,
        openedAt: validatedData.openedAt,
        minStock: validatedData.minStock,
        notes: validatedData.notes,
      },
    });

    revalidatePath("/app/cocina/inventario");
    return { success: true, product };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.errors[0]?.message || "Error de validación" };
    }
    return { error: "Error al crear el producto" };
  }
}

export async function updateProduct(data: z.infer<typeof productSchema>) {
  try {
    await requireAuth();
    if (!data.id) return { error: "ID de producto requerido" };
    
    const validatedData = productSchema.parse(data);

    const product = await prisma.product.update({
      where: { id: data.id },
      data: {
        name: validatedData.name,
        quantity: validatedData.quantity,
        unit: validatedData.unit,
        locationId: validatedData.locationId,
        categoryId: validatedData.categoryId,
        expiryDate: validatedData.expiryDate,
        openedAt: validatedData.openedAt,
        minStock: validatedData.minStock,
        notes: validatedData.notes,
      },
    });

    revalidatePath("/app/cocina/inventario");
    return { success: true, product };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.errors[0]?.message || "Error de validación" };
    }
    return { error: "Error al actualizar el producto" };
  }
}

export async function deleteProduct(id: string) {
  try {
    await requireAuth();
    await prisma.product.delete({
      where: { id },
    });
    revalidatePath("/app/cocina/inventario");
    return { success: true };
  } catch (error) {
    return { error: "Error al eliminar el producto" };
  }
}

export async function markProductAsOpened(id: string) {
  try {
    await requireAuth();
    await prisma.product.update({
      where: { id },
      data: { openedAt: new Date() },
    });
    revalidatePath("/app/cocina/inventario");
    return { success: true };
  } catch (error) {
    return { error: "Error al marcar el producto como abierto" };
  }
}

// --- Meta Actions ---

export async function getKitchenMetadata() {
  try {
    await requireAuth();
    const [locations, categories] = await Promise.all([
      prisma.productLocation.findMany({ orderBy: { name: 'asc' } }),
      prisma.productCategory.findMany({ orderBy: { name: 'asc' } }),
    ]);
    return { success: true, locations, categories };
  } catch (error) {
    return { error: "Error al obtener metadatos" };
  }
}

// --- Alerts / Dashboard Actions ---

export async function getKitchenAlerts() {
  try {
    await requireAuth();
    
    const today = new Date();
    const threeDaysFromNow = new Date();
    threeDaysFromNow.setDate(today.getDate() + 3);

    const [expiringSoon, lowStock, openedLongAgo] = await Promise.all([
      // Próximos a caducar (3 días)
      prisma.product.findMany({
        where: {
          expiryDate: {
            lte: threeDaysFromNow,
            gte: today,
          },
        },
        include: { location: true },
      }),
      // Stock bajo
      prisma.product.findMany({
        where: {
          OR: [
            {
              quantity: 0,
            },
            {
              minStock: {
                not: null,
              },
            }
          ]
        },
        include: { location: true },
      }).then(products => products.filter(p => p.quantity <= (p.minStock ?? 0))),
      // Abiertos hace más de 7 días (por defecto si no hay regla específica)
      prisma.product.findMany({
        where: {
          openedAt: {
            lt: new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000),
          },
        },
        include: { location: true },
      }),
    ]);

    return { 
      success: true, 
      alerts: {
        expiringSoon,
        lowStock,
        openedLongAgo
      } 
    };
  } catch (error) {
    console.error("Error getting kitchen alerts:", error);
    return { error: "Error al obtener alertas" };
  }
}

