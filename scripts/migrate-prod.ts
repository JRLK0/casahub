import { execSync } from "child_process";

/**
 * Script para aplicar migraciones en producción
 * Usa 'prisma migrate deploy' que solo aplica migraciones existentes
 * NO crea nuevas migraciones (solo para producción)
 */
async function migrateProduction() {
  const nodeEnv = process.env.NODE_ENV || "development";
  
  // Advertencia si no está en producción
  if (nodeEnv !== "production") {
    console.log("⚠️  Advertencia: NODE_ENV no está configurado como 'production'");
    console.log("   Este script está diseñado para producción. ¿Deseas continuar? (S/N)");
    // En scripts automatizados, continuar de todas formas
  }

  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.error("❌ DATABASE_URL no está definida en las variables de entorno");
    process.exit(1);
  }

  try {
    console.log("🔄 Aplicando migraciones en producción...");
    console.log("📋 Usando: prisma migrate deploy");
    console.log("   (Este comando solo aplica migraciones existentes, no crea nuevas)");
    
    // Generar Prisma Client primero
    console.log("📦 Generando Prisma Client...");
    execSync("npx prisma generate", { stdio: "inherit" });
    
    // Verificar estado de migraciones
    console.log("🔍 Verificando estado de migraciones...");
    try {
      const statusOutput = execSync("npx prisma migrate status", {
        stdio: "pipe",
        encoding: "utf-8",
      }).toString();
      
      console.log(statusOutput);
      
      if (statusOutput.includes("Database schema is up to date")) {
        console.log("✅ La base de datos ya está actualizada. No hay migraciones pendientes.");
        return;
      }
    } catch (statusError: any) {
      const statusOutput = statusError.stdout?.toString() || statusError.stderr?.toString() || "";
      
      if (statusOutput.includes("database is not up to date") || statusOutput.includes("migrations are pending")) {
        console.log("📦 Hay migraciones pendientes. Aplicando...");
      } else {
        console.log("⚠️  No se pudo verificar el estado. Continuando con la aplicación...");
      }
    }
    
    // Aplicar migraciones
    console.log("🚀 Aplicando migraciones pendientes...");
    execSync("npx prisma migrate deploy", { stdio: "inherit" });
    
    console.log("✅ Migraciones aplicadas correctamente");
    
  } catch (error: any) {
    console.error("❌ Error al aplicar migraciones:", error.message);
    
    if (error.stdout) {
      console.error("Salida estándar:", error.stdout.toString());
    }
    if (error.stderr) {
      console.error("Salida de error:", error.stderr.toString());
    }
    
    console.error("\n💡 Verifica:");
    console.error("   - Que la base de datos esté disponible");
    console.error("   - Que las credenciales sean correctas");
    console.error("   - Que no haya conflictos en las migraciones");
    
    process.exit(1);
  }
}

migrateProduction();

