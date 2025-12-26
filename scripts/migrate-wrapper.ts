#!/usr/bin/env node
/**
 * Wrapper para ejecutar comandos de Prisma con carga automática de .env
 */
import "dotenv/config";
import { execSync } from "child_process";
import { join } from "path";

const command = process.argv.slice(2).join(" ");

if (!command) {
  console.error("❌ Debes proporcionar un comando de Prisma");
  console.log("\nUso: tsx scripts/migrate-wrapper.ts <comando-prisma>");
  console.log("\nEjemplos:");
  console.log("  tsx scripts/migrate-wrapper.ts migrate dev");
  console.log("  tsx scripts/migrate-wrapper.ts migrate status");
  process.exit(1);
}

// Verificar que DATABASE_URL esté configurada
if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URL no está definida");
  console.log("\n💡 Asegúrate de tener un archivo .env con:");
  console.log('   DATABASE_URL="postgresql://postgres:grespost@localhost:5432/casahub?schema=public"');
  process.exit(1);
}

console.log("🔄 Ejecutando: prisma", command);
console.log(`📋 DATABASE_URL: ${process.env.DATABASE_URL.replace(/:[^:@]+@/, ":****@")}\n`);

try {
  execSync(`npx prisma ${command}`, {
    stdio: "inherit",
    cwd: process.cwd(),
  });
} catch (error: any) {
  process.exit(error.status || 1);
}

