import type { NextAuthConfig } from "next-auth";

export const authConfig = {
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn = !!auth?.user;
      const isOnDashboard = nextUrl.pathname.startsWith("/app");
      const isOnAdmin = nextUrl.pathname.startsWith("/app/admin");
      
      if (isOnDashboard) {
        if (isLoggedIn) {
          // Verificar si es ruta de admin
          if (isOnAdmin) {
            const userRoles = (auth.user as any)?.roles || [];
            const isAdmin = userRoles.some((role: any) => role.name === "ADMIN");
            if (!isAdmin) {
              return Response.redirect(new URL("/app", nextUrl));
            }
          }
          return true;
        }
        return false; // Redirigir a login
      } else if (isLoggedIn) {
        return Response.redirect(new URL("/app", nextUrl));
      }
      return true;
    },
    async session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub;
        // Usar roles del token si están disponibles
        if ((token as any).roles) {
          (session.user as any).roles = (token as any).roles;
        }
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.sub = user.id;
        // Almacenar roles en el token para evitar consultas repetidas
        if ((user as any).roles) {
          token.roles = (user as any).roles;
        }
      }
      return token;
    },
  },
  providers: [], // Configurado en auth.ts
} satisfies NextAuthConfig;

