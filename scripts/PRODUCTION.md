# Guía de Migraciones en Producción

Esta guía explica cómo aplicar migraciones de base de datos en producción usando los scripts proporcionados.

## Scripts Disponibles

### Scripts de Producción

#### `migrate-prod.ts`
Aplica migraciones pendientes en producción usando `prisma migrate deploy`.

**Uso:**
```bash
npm run migrate:prod
```

**Características:**
- Solo aplica migraciones existentes (no crea nuevas)
- Verifica el estado antes de aplicar
- Genera Prisma Client automáticamente
- Manejo robusto de errores

#### `migrate-wait-db.ts`
Espera a que la base de datos esté disponible antes de continuar.

**Uso:**
```bash
npm run migrate:wait
```

**Características:**
- Reintentos con backoff exponencial
- Máximo 30 intentos por defecto
- Útil para Docker Compose donde la BD puede tardar en iniciar

#### `migrate-and-seed.ts`
Aplica migraciones y ejecuta el seed de la base de datos.

**Uso:**
```bash
npm run migrate:prod:seed
```

**Características:**
- Útil para entornos nuevos
- Aplica migraciones primero, luego ejecuta seed
- Ideal para reseteo de base de datos

## Uso con Docker Compose

### Configuración Automática

El `docker-compose.yml` está configurado para aplicar migraciones automáticamente:

1. **Servicio `db`**: Base de datos PostgreSQL con healthcheck
2. **Servicio `migrate`**: Espera a que BD esté lista y aplica migraciones
3. **Servicio `app`**: Inicia después de que las migraciones se completen

### Comandos Docker Compose

```bash
# Iniciar todos los servicios (aplica migraciones automáticamente)
npm run docker:up
# o
docker-compose up -d

# Ver logs de migraciones
docker-compose logs migrate

# Ver logs de la aplicación
docker-compose logs app

# Detener todos los servicios
npm run docker:down
# o
docker-compose down

# Reconstruir imágenes
npm run docker:build
# o
docker-compose build
```

### Flujo Automático

Cuando ejecutas `docker-compose up -d`:

1. ✅ Se inicia el servicio `db` (PostgreSQL)
2. ✅ El healthcheck verifica que la BD esté lista
3. ✅ Se inicia el servicio `migrate` que:
   - Espera a que la BD esté disponible
   - Aplica todas las migraciones pendientes
   - Se detiene después de completar
4. ✅ Se inicia el servicio `app` (Next.js) solo después de migraciones exitosas

## Uso Manual (sin Docker)

### Aplicar Migraciones en Producción

```bash
# 1. Asegúrate de tener las variables de entorno configuradas
export DATABASE_URL="postgresql://user:password@host:5432/database?schema=public"
export NODE_ENV="production"

# 2. Aplicar migraciones
npm run migrate:prod
```

### Verificar Estado de Migraciones

```bash
npm run migrate:status
```

### Aplicar Migraciones y Seed

```bash
npm run migrate:prod:seed
```

## Flujo de Trabajo Recomendado

### Desarrollo

1. La IA crea migraciones en `prisma/migrations/`
2. Desarrollador ejecuta `npm run migrate` para aplicar en desarrollo
3. Verifica que todo funcione correctamente
4. Hace commit de las migraciones

### Producción con Docker

1. Desarrollador hace commit de migraciones
2. En producción: `docker-compose pull` (si hay imágenes remotas)
3. En producción: `docker-compose up -d`
4. Las migraciones se aplican automáticamente
5. La aplicación inicia después de migraciones exitosas

### Producción Manual

1. Desarrollador hace commit de migraciones
2. En producción: `git pull` para obtener nuevas migraciones
3. En producción: `npm run migrate:prod`
4. Si hay errores, revisar logs y corregir
5. Iniciar aplicación: `npm start`

## Troubleshooting

### Error: "DATABASE_URL no está definida"

**Solución:** Asegúrate de tener la variable `DATABASE_URL` en tu entorno:
```bash
export DATABASE_URL="postgresql://user:password@host:5432/database"
```

O crea un archivo `.env` con:
```
DATABASE_URL=postgresql://user:password@host:5432/database
```

### Error: "No se pudo conectar a la base de datos"

**Solución:** 
- Verifica que la base de datos esté corriendo
- Verifica las credenciales en `DATABASE_URL`
- Verifica que el puerto sea correcto
- En Docker, verifica que el servicio `db` esté saludable: `docker-compose ps`

### Error: "Migration failed" en Docker

**Solución:**
1. Ver logs del servicio migrate: `docker-compose logs migrate`
2. Verifica que las migraciones estén en el directorio correcto
3. Verifica permisos de archivos
4. Intenta aplicar manualmente: `docker-compose run migrate npm run migrate:prod`

### Migraciones se aplican dos veces

**Solución:** Esto no debería pasar porque `prisma migrate deploy` verifica el estado. Si ocurre:
1. Verifica la tabla `_prisma_migrations` en la BD
2. Asegúrate de que no haya duplicados
3. El servicio `migrate` tiene `restart: "no"` para evitar ejecuciones múltiples

### El servicio migrate no se completa

**Solución:**
- Verifica logs: `docker-compose logs migrate`
- Verifica que la BD esté saludable: `docker-compose ps`
- Intenta ejecutar manualmente: `docker-compose run migrate sh -c "tsx scripts/migrate-wait-db.ts && tsx scripts/migrate-prod.ts"`

## Mejores Prácticas

1. **Siempre prueba migraciones en desarrollo primero**
2. **Haz backup de la BD antes de aplicar migraciones en producción**
3. **Revisa los logs después de aplicar migraciones**
4. **Usa `migrate:status` para verificar el estado antes y después**
5. **En Docker, siempre verifica que el servicio `migrate` se complete exitosamente antes de considerar el despliegue completo**

## Seguridad

- Los scripts de producción **NO crean nuevas migraciones**, solo aplican existentes
- Las credenciales de BD deben estar en variables de entorno, nunca en el código
- Usa `.env` para desarrollo local y variables de entorno del sistema para producción
- No commitees archivos `.env` con credenciales reales

