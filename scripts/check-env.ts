/**
 * Script para verificar que las variables de entorno estén configuradas correctamente
 */
import "dotenv/config";

console.log("🔍 Verificando variables de entorno...\n");

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error("❌ DATABASE_URL no está definida");
  console.log("\n💡 Solución:");
  console.log("   1. Crea un archivo .env en la raíz del proyecto");
  console.log("   2. Agrega la siguiente línea (reemplaza 'your-password' con tu contraseña real):");
  console.log('   DATABASE_URL="postgresql://postgres:your-password@localhost:5432/casahub?schema=public"');
  console.log("\n   O copia el archivo env.example:");
  console.log("   cp env.example .env");
  console.log("   Luego edita .env y reemplaza 'your-password' con tu contraseña real");
  process.exit(1);
}

console.log("✅ DATABASE_URL está definida");
console.log(`   ${databaseUrl.replace(/:[^:@]+@/, ":****@")}`); // Ocultar password

// Verificar formato
try {
  const url = new URL(databaseUrl.replace(/^postgresql:\/\//, "http://"));
  console.log("\n📋 Detalles de conexión:");
  console.log(`   Host: ${url.hostname}`);
  console.log(`   Puerto: ${url.port || "5432"}`);
  console.log(`   Base de datos: ${url.pathname.replace("/", "")}`);
  console.log(`   Usuario: ${url.username}`);
} catch (error) {
  console.error("⚠️  El formato de DATABASE_URL parece incorrecto");
}

console.log("\n✅ Verificación completada");

