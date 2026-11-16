# Contribuir a VISION AI

## Preparación local

1. Instala Node.js 22 y Python 3.12.
2. Ejecuta `powershell -ExecutionPolicy Bypass -File scripts/bootstrap.ps1`.
3. Completa `.env.local` únicamente con credenciales de desarrollo.
4. Inicia el frontend con `npm.cmd run dev`.

## Convenciones

- Las ramas de trabajo usan `feature/`, `fix/`, `docs/` o `chore/`.
- Los commits siguen Conventional Commits: `feat:`, `fix:`, `docs:`, `test:` y `chore:`.
- Las credenciales nunca se guardan en Git.
- Los contratos compartidos viven en `packages/contracts`.
- El frontend no accede directamente a claves privadas de Supabase o Resend.
- El agente Edge debe continuar operando temporalmente cuando pierde conexión.

## Antes de confirmar cambios

Ejecuta:

```powershell
npm.cmd run check
```

La comprobación valida la estructura, TypeScript y la compilación del frontend.

## Pull requests

Cada cambio debe indicar qué fase modifica, cómo se probó y si introduce variables de entorno, migraciones o cambios de contratos.
