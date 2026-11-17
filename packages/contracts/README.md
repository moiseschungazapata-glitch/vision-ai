# Contratos compartidos de VISION AI

Este paquete es la fuente única de verdad entre el frontend, la API y el agente edge. Su versión actual es **1.1.0**.

## Contenido

- `schemas/`: entidades canónicas en JSON Schema 2020-12.
- `openapi/`: operaciones REST bajo `/api/v1`.
- `asyncapi/`: mensajes WebSocket por sitio y política de reconexión.
- `typescript/`: tipos para la aplicación web.
- `python/`: modelos Pydantic para API y edge.
- `examples/`: mensajes completos, sin credenciales reales.
- `docs/`: catálogo de eventos y reglas de compatibilidad.

## Entidades

Se definen cámara, sesión de visión, detección, evento, revisión, regla, telemetría y reporte diario. Los identificadores son UUID; fechas y horas usan ISO 8601; las cajas se normalizan entre 0 y 1; la confianza está entre 0 y 1.

`sourceRef` es una referencia opaca a un secreto administrado por el backend. Nunca se envían usuarios o contraseñas RTSP al navegador. `evidencePath` apunta a evidencia de un evento; el video continuo no forma parte del alcance inicial.

## REST y tiempo real

OpenAPI cubre cámaras, sesiones, eventos y revisiones, reglas, telemetría y reportes. Todos los recursos operativos exigen JWT y `siteId`; `/health` es público.

WebSocket usa `/ws/sites/{siteId}`. Cada mensaje incluye `contractVersion`, `messageId`, `sequence` y `occurredAt`. Al reconectar, el cliente intenta continuar desde el último `sequence`; si ya no está disponible, recupera el estado por REST.

## Uso

TypeScript importa desde `@vision-ai/contracts`. Python instala `packages/contracts/python` e importa desde `vision_contracts`. Antes de integrar cambios:

```text
npm run check:contracts
```

Las reglas de cambio están en `docs/versioning.md` y el vocabulario funcional en `docs/event-catalog.md`.
