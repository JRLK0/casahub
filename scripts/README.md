# Scripts de Migración

Este directorio contiene scripts para gestionar las migraciones de Prisma de forma automática.

## Scripts Disponibles

### `migrate-dev.ts`
Ejecuta automáticamente antes de `npm run dev`. Verifica y aplica migraciones pendientes sin bloquear el inicio del servidor si la base de datos no está disponible.

**Uso:** Se ejecuta automáticamente con `npm run dev`

### `migrate-check.ts`
Verifica el estado de las migraciones antes del build. Falla si hay migraciones pendientes.

**Uso:** Se ejecuta automáticamente con `npm run build`

## Comandos NPM

- `npm run dev` - Ejecuta migraciones automáticamente y luego inicia el servidor de desarrollo
- `npm run build` - Verifica que no haya migraciones pendientes antes de construir
- `npm run migrate` - Crea y aplica una nueva migración (equivalente a `prisma migrate dev`)
- `npm run migrate:deploy` - Aplica migraciones pendientes sin crear nuevas (para producción)
- `npm run migrate:status` - Muestra el estado actual de las migraciones
- `npm run db:generate` - Regenera el Prisma Client
- `npm run db:seed` - Ejecuta el seed de la base de datos
- `npm run db:reset` - Resetea la base de datos y ejecuta todas las migraciones y el seed

## Flujo de Trabajo Recomendado

### Desarrollo Local
1. Modifica `prisma/schema.prisma`
2. Ejecuta `npm run migrate` para crear la migración
3. Ejecuta `npm run dev` - las migraciones se aplicarán automáticamente si hay pendientes

### Producción
1. Las migraciones deben aplicarse manualmente antes del despliegue:
   ```bash
   npm run migrate:deploy
   ```
2. O como parte del proceso de CI/CD antes del build

## Notas

- En desarrollo, si la base de datos no está disponible, el servidor iniciará de todas formas
- En producción, siempre ejecuta `migrate:deploy` antes del build o como parte del despliegue
- Nunca ejecutes `migrate dev` en producción, usa `migrate:deploy` en su lugar

