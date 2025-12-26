import { writeFileSync, existsSync, readFileSync } from "fs";
import { join } from "path";

/**
 * Script para crear o verificar el archivo .env
 */
const envPath = join(process.cwd(), ".env");
const envExamplePath = join(process.cwd(), "env.example");

console.log("🔍 Verificando archivo .env...\n");

// Leer el ejemplo si existe
let envContent = "";
if (existsSync(envExamplePath)) {
  envContent = readFileSync(envExamplePath, "utf-8");
} else {
  // Contenido por defecto
  envContent = `# Base de datos
# Para desarrollo local (sin Docker)
DATABASE_URL="postgresql://postgres:grespost@localhost:5432/casahub?schema=public"

# Para Docker Compose (se configura automáticamente)
# DATABASE_URL="postgresql://postgres:grespost@db:5432/casahub?schema=public"

# Entorno
NODE_ENV="development"

# NextAuth
# Genera una clave secreta con: openssl rand -base64 32
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# Opcional: Variables adicionales de la aplicación
# APP_URL="http://localhost:3000"
`;
}

if (existsSync(envPath)) {
  console.log("✅ Archivo .env existe");
  
  // Verificar si tiene DATABASE_URL
  const currentContent = readFileSync(envPath, "utf-8");
  if (currentContent.includes("DATABASE_URL")) {
    console.log("✅ DATABASE_URL está configurada en .env");
    
    // Extraer DATABASE_URL
    const match = currentContent.match(/DATABASE_URL\s*=\s*["']?([^"'\n]+)["']?/);
    if (match) {
      const dbUrl = match[1];
      console.log(`\n📋 DATABASE_URL actual: ${dbUrl.replace(/:[^:@]+@/, ":****@")}`);
    }
  } else {
    console.log("⚠️  DATABASE_URL no está en .env");
    console.log("💡 Agregando DATABASE_URL al archivo .env...");
    
    const updatedContent = currentContent + "\n" + 'DATABASE_URL="postgresql://postgres:grespost@localhost:5432/casahub?schema=public"';
    writeFileSync(envPath, updatedContent);
    console.log("✅ DATABASE_URL agregada");
  }
} else {
  console.log("⚠️  Archivo .env NO existe");
  console.log("💡 Creando archivo .env desde env.example...");
  
  writeFileSync(envPath, envContent);
  console.log("✅ Archivo .env creado");
}

console.log("\n✅ Configuración completada");
console.log("\n💡 Próximos pasos:");
console.log("   1. Verifica que la base de datos esté corriendo");
console.log("   2. Verifica las credenciales en .env si son diferentes");
console.log("   3. Ejecuta: npm run migrate");

