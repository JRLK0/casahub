#!/usr/bin/env node
/**
 * Script para resolver drift en migraciones sin perder datos
 * Marca las migraciones existentes como aplicadas
 */
import "dotenv/config";
import { execSync } from "child_process";

console.log("🔧 Resolviendo drift en migraciones...\n");

const migrations = [
  "20251226211713_init",
  "20251226213226_add_roles_and_user_management",
];

try {
  for (const migration of migrations) {
    console.log(`✅ Marcando migración '${migration}' como aplicada...`);
    try {
      execSync(`npx prisma migrate resolve --applied ${migration}`, {
        stdio: "pipe",
      });
      console.log(`   ✓ Migración '${migration}' marcada como aplicada\n`);
    } catch (error: any) {
      const output = error.stdout?.toString() || error.stderr?.toString() || "";
      if (output.includes("already applied") || output.includes("not found")) {
        console.log(`   ⚠ Migración '${migration}' ya está aplicada o no existe\n`);
      } else {
        console.error(`   ✗ Error: ${output}\n`);
      }
    }
  }

  console.log("✅ Verificando estado final...\n");
  execSync("npx prisma migrate status", { stdio: "inherit" });
  
  console.log("\n✅ Drift resuelto. Las migraciones están sincronizadas.");
} catch (error: any) {
  console.error("❌ Error:", error.message);
  process.exit(1);
}

