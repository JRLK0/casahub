"use server";

import { z } from "zod";
import bcrypt from "bcryptjs";
import prisma from "./prisma";
import { requireAdmin } from "./auth-helpers";
import { getRoles } from "./role-actions";

export { getRoles };

const createUserSchema = z.object({
  name: z.string().min(1, "El nombre es requerido"),
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres"),
  phone: z.string().optional(),
  image: z.string().url().optional().or(z.literal("")),
  roleIds: z.array(z.string()).min(1, "Debe asignar al menos un rol"),
});

const updateUserSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "El nombre es requerido").optional(),
  email: z.string().email("Email inválido").optional(),
  password: z.string().min(6, "La contraseña debe tener al menos 6 caracteres").optional(),
  phone: z.string().optional(),
  image: z.string().url().optional().or(z.literal("")),
  roleIds: z.array(z.string()).optional(),
});

export async function createUser(data: z.infer<typeof createUserSchema>) {
  try {
    await requireAdmin();

    const validatedData = createUserSchema.parse(data);

    // Verificar si el email ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return { error: "El email ya está en uso" };
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(validatedData.password, 10);

    // Crear usuario
    const user = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        password: hashedPassword,
        phone: validatedData.phone || null,
        image: validatedData.image || null,
        roles: {
          create: validatedData.roleIds.map((roleId) => ({
            roleId,
          })),
        },
      },
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    });

    return { success: true, user };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.errors[0]?.message || "Error de validación" };
    }
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: "Error al crear el usuario" };
  }
}

export async function updateUser(data: z.infer<typeof updateUserSchema>) {
  try {
    await requireAdmin();

    const validatedData = updateUserSchema.parse(data);

    const updateData: any = {};
    if (validatedData.name) updateData.name = validatedData.name;
    if (validatedData.email) updateData.email = validatedData.email;
    if (validatedData.password) {
      updateData.password = await bcrypt.hash(validatedData.password, 10);
    }
    if (validatedData.phone !== undefined) updateData.phone = validatedData.phone || null;
    if (validatedData.image !== undefined) updateData.image = validatedData.image || null;

    // Si se proporcionan roleIds, actualizar roles
    if (validatedData.roleIds) {
      // Eliminar roles existentes
      await prisma.userRole.deleteMany({
        where: { userId: validatedData.id },
      });

      // Crear nuevos roles
      await prisma.userRole.createMany({
        data: validatedData.roleIds.map((roleId) => ({
          userId: validatedData.id,
          roleId,
        })),
      });
    }

    const user = await prisma.user.update({
      where: { id: validatedData.id },
      data: updateData,
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
    });

    return { success: true, user };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.errors[0]?.message || "Error de validación" };
    }
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: "Error al actualizar el usuario" };
  }
}

export async function deleteUser(userId: string) {
  try {
    await requireAdmin();

    await prisma.user.delete({
      where: { id: userId },
    });

    return { success: true };
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: "Error al eliminar el usuario" };
  }
}

export async function getUsers() {
  try {
    await requireAdmin();

    const users = await prisma.user.findMany({
      include: {
        roles: {
          include: {
            role: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return { success: true, users };
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: "Error al obtener los usuarios" };
  }
}

