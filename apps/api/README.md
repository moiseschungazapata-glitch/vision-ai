# Backend REST y WebSocket

FastAPI valida los contratos compartidos y usa Supabase Auth, PostgREST, PostgreSQL, RLS y Storage.

## Preparación

1. Crea un proyecto en Supabase.
2. Ejecuta, en orden, los archivos de `infrastructure/supabase/migrations` desde SQL Editor.
3. Copia `.env.example` como `.env.local` y completa `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY` y `EDGE_API_TOKEN`.
4. Instala Python 3.12 y las dependencias.

```powershell
uv sync --project apps/api --extra dev --python 3.12
uv run --project apps/api uvicorn app.main:app --reload --port 8000
```

La documentación interactiva estará en `http://localhost:8000/docs` y la salud en `http://localhost:8000/api/v1/health`.

## Autenticación

Los endpoints de usuario reciben `Authorization: Bearer <access_token de Supabase>`. Las rutas `/api/v1/edge/*` reciben `X-Edge-Token`; nunca deben recibir la clave secreta de Supabase desde el dispositivo.

WebSocket se conecta a `ws://localhost:8000/ws/sites/{siteId}?access_token=...`. El token se obtiene justo antes de conectar y no debe aparecer en registros.

## Docker

```powershell
docker build -f apps/api/Dockerfile -t vision-ai-api .
docker run --env-file .env.local -p 8000:8000 vision-ai-api
```
