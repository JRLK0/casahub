import { execSync } from "child_process";

/**
 * Script combinado que aplica migraciones y ejecuta seed
 * Útil para entornos nuevos o reseteo de base de datos
 */
async function migrateAndSeed() {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.error("❌ DATABASE_URL no está definida en las variables de entorno");
    process.exit(1);
  }

  try {
    console.log("🔄 Aplicando migraciones y ejecutando seed...");
    
    // Paso 1: Generar Prisma Client
    console.log("📦 Paso 1/3: Generando Prisma Client...");
    execSync("npx prisma generate", { stdio: "inherit" });
    
    // Paso 2: Aplicar migraciones
    console.log("📦 Paso 2/3: Aplicando migraciones...");
    try {
      execSync("npx prisma migrate deploy", { stdio: "inherit" });
      console.log("✅ Migraciones aplicadas");
    } catch (migrateError: any) {
      // Si no hay migraciones pendientes, está bien
      const output = migrateError.stdout?.toString() || migrateError.stderr?.toString() || "";
      if (output.includes("No pending migrations")) {
        console.log("✅ No hay migraciones pendientes");
      } else {
        throw migrateError;
      }
    }
    
    // Paso 3: Ejecutar seed
    console.log("📦 Paso 3/3: Ejecutando seed...");
    execSync("npm run db:seed", { stdio: "inherit" });
    
    console.log("✅ Proceso completado: migraciones y seed aplicados correctamente");
    
  } catch (error: any) {
    console.error("❌ Error durante el proceso:", error.message);
    
    if (error.stdout) {
      console.error("Salida estándar:", error.stdout.toString());
    }
    if (error.stderr) {
      console.error("Salida de error:", error.stderr.toString());
    }
    
    process.exit(1);
  }
}

migrateAndSeed();

