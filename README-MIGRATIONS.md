# Sistema de Migraciones Automáticas

Este proyecto incluye un sistema completo para gestionar migraciones de base de datos tanto en desarrollo como en producción.

## 🚀 Inicio Rápido

### Desarrollo Local

```bash
# Iniciar servidor de desarrollo (aplica migraciones automáticamente)
npm run dev
```

### Producción con Docker

```bash
# Iniciar todos los servicios (aplica migraciones automáticamente)
npm run docker:up

# Ver logs
npm run docker:logs
```

## 📋 Scripts Disponibles

### Desarrollo

- `npm run dev` - Inicia servidor de desarrollo y aplica migraciones pendientes
- `npm run migrate` - Crea y aplica una nueva migración
- `npm run migrate:status` - Verifica el estado de las migraciones
- `npm run db:seed` - Ejecuta el seed de la base de datos

### Producción

- `npm run migrate:prod` - Aplica migraciones pendientes (solo aplica, no crea)
- `npm run migrate:wait` - Espera a que la base de datos esté disponible
- `npm run migrate:prod:seed` - Aplica migraciones y ejecuta seed

### Docker

- `npm run docker:up` - Inicia todos los servicios
- `npm run docker:down` - Detiene todos los servicios
- `npm run docker:logs` - Muestra logs de todos los servicios
- `npm run docker:build` - Reconstruye las imágenes Docker

## 🐳 Docker Compose

El `docker-compose.yml` está configurado con tres servicios:

1. **db** - Base de datos PostgreSQL
2. **migrate** - Aplica migraciones automáticamente antes de iniciar la app
3. **app** - Aplicación Next.js (solo inicia después de migraciones exitosas)

### Flujo Automático

```
docker-compose up -d
  ↓
1. Se inicia PostgreSQL (db)
  ↓
2. Healthcheck verifica que BD esté lista
  ↓
3. Se ejecuta migrate (espera BD y aplica migraciones)
  ↓
4. Si migrate es exitoso, se inicia app (Next.js)
```

## 📝 Flujo de Trabajo

### Cuando la IA crea migraciones

1. La IA modifica `prisma/schema.prisma`
2. La IA ejecuta `npm run migrate` para crear la migración
3. La migración se guarda en `prisma/migrations/`
4. **Tú solo necesitas hacer commit de las migraciones**

### En Producción

#### Con Docker (Recomendado)

```bash
# 1. Obtener nuevas migraciones
git pull

# 2. Iniciar servicios (migraciones se aplican automáticamente)
docker-compose up -d

# 3. Verificar que todo esté bien
docker-compose logs migrate
docker-compose logs app
```

#### Sin Docker (Manual)

```bash
# 1. Obtener nuevas migraciones
git pull

# 2. Aplicar migraciones
npm run migrate:prod

# 3. Iniciar aplicación
npm start
```

## 🔧 Configuración

### Variables de Entorno

Copia `env.example` a `.env` y configura:

```env
# IMPORTANTE: Reemplaza 'your-password' con tu contraseña real
DATABASE_URL="postgresql://postgres:your-password@localhost:5432/casahub?schema=public"
NODE_ENV="development"
NEXTAUTH_SECRET="tu-clave-secreta-aqui"
NEXTAUTH_URL="http://localhost:3000"
```

### Docker Compose

Las variables de entorno para Docker se configuran automáticamente en `docker-compose.yml`. Si necesitas cambiarlas, edita el archivo directamente.

## 📚 Documentación Adicional

- [Guía de Producción](./scripts/PRODUCTION.md) - Guía detallada para producción
- [Scripts de Migración](./scripts/README.md) - Documentación de scripts

## ❓ Troubleshooting

### Las migraciones no se aplican en Docker

1. Verifica logs: `docker-compose logs migrate`
2. Verifica que el servicio `db` esté saludable: `docker-compose ps`
3. Intenta ejecutar manualmente:
   ```bash
   docker-compose run migrate npm run migrate:prod
   ```

### Error de conexión a la base de datos

1. Verifica que `DATABASE_URL` esté configurada correctamente
2. En Docker, verifica que el servicio `db` esté corriendo
3. Verifica credenciales en `docker-compose.yml`

### Migraciones se aplican dos veces

Esto no debería pasar. Si ocurre:
1. Verifica la tabla `_prisma_migrations` en la BD
2. El servicio `migrate` tiene `restart: "no"` para evitar esto

## 🎯 Mejores Prácticas

1. ✅ Siempre prueba migraciones en desarrollo primero
2. ✅ Haz backup de la BD antes de aplicar en producción
3. ✅ Revisa logs después de aplicar migraciones
4. ✅ Usa `migrate:status` para verificar el estado
5. ✅ En Docker, verifica que `migrate` se complete antes de considerar el despliegue completo

## 🔒 Seguridad

- Los scripts de producción **NO crean nuevas migraciones**, solo aplican existentes
- Las credenciales deben estar en variables de entorno, nunca en el código
- No commitees archivos `.env` con credenciales reales

