import { execSync } from "child_process";

/**
 * Script que espera a que la base de datos esté disponible
 * Útil para Docker Compose donde el servicio de BD puede tardar en iniciar
 * Usa reintentos con backoff exponencial
 */
async function waitForDatabase(maxRetries = 30, delayMs = 1000) {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.error("❌ DATABASE_URL no está definida en las variables de entorno");
    process.exit(1);
  }

  console.log("🔄 Esperando a que la base de datos esté disponible...");
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      // Intentar conectar usando psql o una consulta simple
      execSync("npx prisma db execute --stdin", {
        input: "SELECT 1;",
        stdio: "pipe",
        env: { ...process.env, DATABASE_URL: databaseUrl },
      });
      
      console.log("✅ Base de datos está disponible");
      return true;
    } catch (error) {
      if (attempt < maxRetries) {
        const waitTime = delayMs * Math.pow(1.5, attempt - 1);
        console.log(`⏳ Intento ${attempt}/${maxRetries} fallido. Reintentando en ${Math.round(waitTime)}ms...`);
        await new Promise((resolve) => setTimeout(resolve, waitTime));
      } else {
        console.error(`❌ No se pudo conectar a la base de datos después de ${maxRetries} intentos`);
        process.exit(1);
      }
    }
  }
  
  return false;
}

// Alternativa más simple usando pg directamente
async function waitForDatabaseSimple(maxRetries = 30, delayMs = 1000) {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.error("❌ DATABASE_URL no está definida en las variables de entorno");
    process.exit(1);
  }

  console.log("🔄 Esperando a que la base de datos esté disponible...");
  
  // Intentar importar pg dinámicamente
  let Pool: any;
  try {
    const pgModule = await import("pg");
    Pool = pgModule.Pool || (pgModule.default && pgModule.default.Pool);
    if (!Pool) {
      // Fallback a require para compatibilidad
      const pg = require("pg");
      Pool = pg.Pool;
    }
  } catch (error) {
    console.error("❌ No se pudo importar 'pg'. Asegúrate de que esté instalado.");
    console.error("   Ejecuta: npm install pg");
    process.exit(1);
  }

  const pool = new Pool({ connectionString: databaseUrl });

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const client = await pool.connect();
      await client.query("SELECT 1");
      client.release();
      console.log("✅ Base de datos está disponible");
      await pool.end();
      return true;
    } catch (error: any) {
      if (attempt < maxRetries) {
        const waitTime = delayMs * Math.pow(1.5, attempt - 1);
        console.log(`⏳ Intento ${attempt}/${maxRetries} fallido. Reintentando en ${Math.round(waitTime)}ms...`);
        await new Promise((resolve) => setTimeout(resolve, waitTime));
      } else {
        console.error(`❌ No se pudo conectar a la base de datos después de ${maxRetries} intentos`);
        console.error(`Error: ${error.message}`);
        await pool.end();
        process.exit(1);
      }
    }
  }
  
  await pool.end();
  return false;
}

// Ejecutar la función de espera
waitForDatabaseSimple()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error("❌ Error inesperado:", error);
    process.exit(1);
  });

