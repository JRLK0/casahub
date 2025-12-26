import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { authConfig } from "./auth.config";
import { z } from "zod";
import prisma from "./lib/prisma";
import bcrypt from "bcryptjs";

export const { auth, signIn, signOut, handlers } = NextAuth({
  ...authConfig,
  session: {
    strategy: "jwt",
  },
  callbacks: {
    ...authConfig.callbacks,
    async session({ session, token }) {
      // Llamar al callback original de authConfig para obtener la base (incluyendo id)
      const s = await authConfig.callbacks!.session!({ session, token } as any);
      
      // Forzar la carga de roles desde la base de datos si no están presentes o están vacíos
      // Esto asegura que si el rol cambia en la BD, se refleje al refrescar la sesión
      if (s.user && token.sub) {
        const userRoles = await prisma.userRole.findMany({
          where: { userId: token.sub as string },
          include: { role: true },
        });
        
        (s.user as any).roles = userRoles.map((ur) => ({
          id: ur.role.id,
          name: ur.role.name,
          description: ur.role.description,
        }));
      }
      
      return s;
    },
  },
  providers: [
    Credentials({
      async authorize(credentials) {
        const parsedCredentials = z
          .object({ email: z.string().email(), password: z.string().min(6) })
          .safeParse(credentials);

        if (parsedCredentials.success) {
          const { email, password } = parsedCredentials.data;
          try {
            const user = await prisma.user.findUnique({ 
              where: { email },
              include: {
                roles: {
                  include: {
                    role: true,
                  },
                },
              },
            });

            if (!user) return null;
            
            const passwordsMatch = await bcrypt.compare(password, user.password);

            if (passwordsMatch) {
              return {
                id: user.id,
                email: user.email,
                name: user.name,
                image: user.image,
                roles: user.roles.map((ur) => ur.role),
              };
            }
          } catch (error) {
            console.error("Error en authorize:", error);
            return null;
          }
        }

        return null;
      },
    }),
  ],
});

