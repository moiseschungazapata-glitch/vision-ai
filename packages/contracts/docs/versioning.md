# Versionado y compatibilidad

La versión del contrato usa SemVer y vive en `packages/contracts/VERSION`.

- **PATCH**: documentación, ejemplos o restricciones que no cambian mensajes válidos.
- **MINOR**: campos opcionales, endpoints o mensajes nuevos compatibles.
- **MAJOR**: eliminar o renombrar campos, cambiar tipos, valores de enum o semántica existente.

Todo mensaje WebSocket incluye `contractVersion`. REST se publica bajo `/api/v1`. El frontend, API y agente edge deben aceptar la misma versión mayor. Una versión incompatible se rechaza con un error explícito, nunca se interpreta parcialmente.

Antes de integrar un cambio se ejecuta `npm run check:contracts`. Los esquemas JSON son la fuente canónica; TypeScript y Python deben conservar nombres serializados en `camelCase`.
