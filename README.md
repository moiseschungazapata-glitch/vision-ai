# VISION AI

Plataforma de análisis visual en tiempo real con procesamiento de video en el borde, backend operativo, dashboard web y cuatro casos de uso:

- Seguridad industrial: EPP y zonas de riesgo.
- Calidad en línea: defectos y piezas faltantes.
- Retail y almacén: aforo, filas y congestión.
- Acceso vehicular: flujo, cola y sentido.

## Estructura

- `apps/web`: frontend web.
- `apps/api`: backend y contratos REST/WebSocket.
- `services/edge-agent`: captura, inferencia, tracking y reglas en el nodo edge.
- `packages/contracts`: contratos compartidos.
- `infrastructure`: Supabase, Docker y Vercel.
- `tests`: pruebas de integración, rendimiento y extremo a extremo.
- `documentation`: arquitectura, API, operación y aceptación.

El alcance base procesa cámaras USB o RTSP en vivo. No incluye carga de imágenes ni almacenamiento continuo de video.
