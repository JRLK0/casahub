import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";
import bcrypt from "bcryptjs";
import "dotenv/config";

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  // Crear roles iniciales
  const adminRole = await prisma.role.upsert({
    where: { name: "ADMIN" },
    update: {},
    create: {
      name: "ADMIN",
      description: "Administrador con acceso completo al sistema",
    },
  });

  const userRole = await prisma.role.upsert({
    where: { name: "USER" },
    update: {},
    create: {
      name: "USER",
      description: "Usuario estándar con acceso básico",
    },
  });

  console.log("Roles creados:", { adminRole, userRole });

  // Crear usuario administrador por defecto
  // IMPORTANTE: En producción, usa la variable de entorno ADMIN_PASSWORD
  // Para desarrollo local, puedes usar el valor por defecto (cambiar después del primer login)
  const adminPassword = process.env.ADMIN_PASSWORD || "admin123";
  const hashedPassword = await bcrypt.hash(adminPassword, 10);
  
  const adminUser = await prisma.user.upsert({
    where: { email: "admin@casahub.local" },
    update: {},
    create: {
      email: "admin@casahub.local",
      name: "Admin CasaHub",
      password: hashedPassword,
      roles: {
        create: {
          roleId: adminRole.id,
        },
      },
    },
    include: {
      roles: {
        include: {
          role: true,
        },
      },
    },
  });

  console.log("Usuario administrador creado:", adminUser);

  // Crear ubicaciones por defecto para la cocina
  const locations = [
    { name: "Nevera", icon: "IceCream" },
    { name: "Congelador", icon: "Snowflake" },
    { name: "Despensa", icon: "Archive" },
    { name: "Frutero", icon: "Apple" },
    { name: "Armario Especias", icon: "Flame" },
  ];

  for (const loc of locations) {
    await prisma.productLocation.upsert({
      where: { name: loc.name },
      update: { icon: loc.icon },
      create: loc,
    });
  }

  // Crear categorías por defecto para la cocina
  const categories = [
    "Lácteos",
    "Carnes",
    "Pescados",
    "Verduras/Frutas",
    "Bebidas",
    "Pasta/Arroz/Legumbres",
    "Conservas",
    "Congelados",
    "Dulces/Snacks",
    "Especias/Aceites",
  ];

  for (const catName of categories) {
    await prisma.productCategory.upsert({
      where: { name: catName },
      update: {},
      create: { name: catName },
    });
  }

  console.log("Ubicaciones y categorías de cocina creadas");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
