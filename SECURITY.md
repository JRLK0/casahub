# Seguridad - Información Importante

## ⚠️ ANTES DE SUBIR A UN REPOSITORIO PÚBLICO

Este documento lista las medidas de seguridad que debes seguir antes de hacer público este repositorio.

## Archivos que NUNCA deben subirse

Los siguientes archivos están protegidos por `.gitignore` y **NO deben subirse**:

- `.env` - Contiene credenciales reales
- `.env.local` - Variables de entorno locales
- `.env.production` - Credenciales de producción
- Cualquier archivo que contenga credenciales reales

## Variables de Entorno Requeridas

Crea un archivo `.env` basado en `env.example` con tus credenciales reales:

```bash
# Base de datos
DATABASE_URL="postgresql://usuario:contraseña@host:5432/casahub?schema=public"

# NextAuth
NEXTAUTH_SECRET="genera-una-clave-secreta-con-openssl-rand-base64-32"
NEXTAUTH_URL="http://localhost:3000"

# Contraseña del admin inicial (opcional, solo para seed)
ADMIN_PASSWORD="tu-contraseña-segura-aqui"
```

## Generar NEXTAUTH_SECRET

```bash
openssl rand -base64 32
```

## Docker Compose

El archivo `docker-compose.yml` usa variables de entorno. Crea un archivo `.env` en la raíz del proyecto con:

```bash
POSTGRES_USER=postgres
POSTGRES_PASSWORD=tu-contraseña-segura
POSTGRES_DB=casahub
DATABASE_URL=postgresql://postgres:tu-contraseña-segura@db:5432/casahub?schema=public
NEXTAUTH_SECRET=tu-clave-secreta-generada
NEXTAUTH_URL=http://localhost:3000
```

## Cambios de Seguridad Implementados

1. ✅ Credenciales removidas de `docker-compose.yml` (ahora usa variables de entorno)
2. ✅ Contraseña de admin removida de `seed.ts` (ahora usa variable `ADMIN_PASSWORD`)
3. ✅ `env.example` actualizado con placeholders seguros
4. ✅ `.gitignore` configurado para proteger archivos `.env*`

## Verificación Pre-Commit

Antes de hacer commit, verifica:

```bash
# Verificar que no hay archivos .env en el staging area
git status | grep .env

# Verificar que docker-compose.yml no tiene contraseñas hardcodeadas
grep -i "password\|secret" docker-compose.yml

# Verificar que seed.ts no tiene contraseñas hardcodeadas
grep -i "admin123\|password" prisma/seed.ts
```

## Usuario Administrador Inicial

Después del primer despliegue:

1. **CAMBIA INMEDIATAMENTE** la contraseña del usuario admin desde la interfaz web
2. El usuario inicial es: `admin@casahub.local`
3. La contraseña por defecto (solo desarrollo) es: `admin123`
4. En producción, usa la variable `ADMIN_PASSWORD` con una contraseña segura

## Mejores Prácticas

1. **Nunca** commitees archivos `.env` con credenciales reales
2. **Siempre** usa variables de entorno para credenciales
3. **Rota** las contraseñas regularmente en producción
4. **Usa** contraseñas fuertes y únicas para cada entorno
5. **Revisa** los logs antes de hacer commit para asegurarte de que no hay información sensible

