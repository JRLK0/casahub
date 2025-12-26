import { execSync } from "child_process";

/**
 * Script para verificar el estado de las migraciones sin aplicarlas
 * Útil para CI/CD o verificaciones previas al build
 */
async function checkMigrations() {
  try {
    console.log("🔍 Verificando estado de migraciones...");
    execSync("npx prisma migrate status", { stdio: "inherit" });
    console.log("✅ Migraciones verificadas");
  } catch (error: any) {
    const output = error.stdout?.toString() || error.stderr?.toString() || "";
    
    if (output.includes("database is not up to date") || output.includes("migrations are pending")) {
      console.error("❌ Hay migraciones pendientes. Ejecuta 'npx prisma migrate deploy' antes de continuar.");
      process.exit(1);
    } else {
      console.error("❌ Error al verificar migraciones:", error.message);
      process.exit(1);
    }
  }
}

checkMigrations();

