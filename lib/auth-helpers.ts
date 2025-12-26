import { auth } from "@/auth";
import prisma from "./prisma";

export async function getUserRoles(userId: string) {
  const userRoles = await prisma.userRole.findMany({
    where: { userId },
    include: { role: true },
  });
  return userRoles.map((ur) => ur.role);
}

export async function isAdmin(userId: string): Promise<boolean> {
  const roles = await getUserRoles(userId);
  return roles.some((role) => role.name === "ADMIN");
}

export async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("No autenticado");
  }

  const userIsAdmin = await isAdmin(session.user.id);
  if (!userIsAdmin) {
    throw new Error("No autorizado: se requieren permisos de administrador");
  }

  return session;
}

