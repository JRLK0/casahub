"use server";

import { z } from "zod";
import prisma from "./prisma";
import { requireAdmin } from "./auth-helpers";

const roleSchema = z.object({
  name: z.string().min(1, "El nombre del rol es requerido").transform(v => v.toUpperCase()),
  description: z.string().optional().nullable(),
});

const updateRoleSchema = roleSchema.extend({
  id: z.string(),
});

export async function getRoles() {
  try {
    await requireAdmin();

    const roles = await prisma.role.findMany({
      include: {
        _count: {
          select: { users: true }
        }
      },
      orderBy: {
        name: "asc",
      },
    });

    return { success: true, roles };
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: "Error al obtener los roles" };
  }
}

export async function createRole(data: z.infer<typeof roleSchema>) {
  try {
    await requireAdmin();

    const validatedData = roleSchema.parse(data);

    // Verificar si el rol ya existe
    const existingRole = await prisma.role.findUnique({
      where: { name: validatedData.name },
    });

    if (existingRole) {
      return { error: "El nombre del rol ya está en uso" };
    }

    const role = await prisma.role.create({
      data: {
        name: validatedData.name,
        description: validatedData.description || null,
      },
    });

    return { success: true, role };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.errors[0]?.message || "Error de validación" };
    }
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: "Error al crear el rol" };
  }
}

export async function updateRole(data: z.infer<typeof updateRoleSchema>) {
  try {
    await requireAdmin();

    const validatedData = updateRoleSchema.parse(data);

    // No permitir cambiar el nombre de roles básicos del sistema si fuera necesario
    // Pero por ahora permitimos edición general

    const role = await prisma.role.update({
      where: { id: validatedData.id },
      data: {
        name: validatedData.name,
        description: validatedData.description || null,
      },
    });

    return { success: true, role };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { error: error.errors[0]?.message || "Error de validación" };
    }
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: "Error al actualizar el rol" };
  }
}

export async function deleteRole(roleId: string) {
  try {
    await requireAdmin();

    // 1. Verificar si es un rol protegido
    const role = await prisma.role.findUnique({
      where: { id: roleId },
      include: {
        _count: {
          select: { users: true }
        }
      }
    });

    if (!role) {
      return { error: "Rol no encontrado" };
    }

    if (role.name === "ADMIN" || role.name === "USER") {
      return { error: "No se pueden eliminar los roles del sistema (ADMIN/USER)" };
    }

    // 2. Verificar si tiene usuarios asignados
    if (role._count.users > 0) {
      return { error: `No se puede eliminar el rol porque tiene ${role._count.users} usuarios asignados` };
    }

    await prisma.role.delete({
      where: { id: roleId },
    });

    return { success: true };
  } catch (error) {
    if (error instanceof Error) {
      return { error: error.message };
    }
    return { error: "Error al eliminar el rol" };
  }
}

