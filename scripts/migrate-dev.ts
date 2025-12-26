import { execSync } from "child_process";

/**
 * Script para ejecutar migraciones en desarrollo
 * Verifica si hay migraciones pendientes y las aplica automáticamente
 * No bloquea el inicio si la base de datos no está disponible
 */
async function migrateDev() {
  try {
    console.log("🔄 Verificando migraciones de base de datos...");
    
    // Generar Prisma Client primero (necesario para migraciones)
    try {
      execSync("npx prisma generate", { stdio: "pipe" });
    } catch (error) {
      console.log("⚠️  No se pudo generar Prisma Client. Continuando...");
    }

    // Verificar estado de migraciones
    try {
      const statusOutput = execSync("npx prisma migrate status", { 
        stdio: "pipe",
        encoding: "utf-8"
      }).toString();
      
      if (statusOutput.includes("Database schema is up to date")) {
        console.log("✅ Base de datos está actualizada");
        return;
      }
    } catch (error: any) {
      const output = error.stdout?.toString() || error.stderr?.toString() || "";
      
      if (output.includes("database is not up to date") || output.includes("migrations are pending")) {
        console.log("📦 Hay migraciones pendientes. Aplicando...");
        try {
          execSync("npx prisma migrate deploy", { stdio: "inherit" });
          console.log("✅ Migraciones aplicadas correctamente");
        } catch (migrateError) {
          console.log("⚠️  Error al aplicar migraciones. Verifica la conexión a la base de datos.");
          console.log("💡 Ejecuta 'npm run migrate' manualmente cuando la BD esté lista.");
        }
      } else if (output.includes("drift detected")) {
        console.log("⚠️  Se detectó drift en las migraciones.");
        console.log("💡 Ejecuta 'npm run migrate' manualmente para resolver el drift.");
      } else if (output.includes("Can't reach database server") || output.includes("connection")) {
        // Si hay un error de conexión, no bloqueamos el inicio en desarrollo
        console.log("⚠️  No se pudo conectar a la base de datos.");
        console.log("💡 El servidor iniciará, pero asegúrate de ejecutar 'npm run migrate' cuando la BD esté disponible.");
      } else {
        console.log("⚠️  No se pudo verificar el estado de las migraciones.");
        console.log("💡 Ejecuta 'npm run migrate' manualmente cuando la BD esté lista.");
      }
    }
  } catch (error: any) {
    // En desarrollo, no bloqueamos el inicio por errores de migración
    console.log("⚠️  Error al ejecutar migraciones:", error.message);
    console.log("💡 El servidor iniciará. Ejecuta 'npm run migrate' manualmente más tarde.");
  }
}

migrateDev();

