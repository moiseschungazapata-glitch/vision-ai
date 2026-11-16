# Estructura del repositorio

VISION AI separa responsabilidades para evitar que el procesamiento de video, la API y la interfaz queden acoplados.

| Ruta | Responsabilidad |
| --- | --- |
| `apps/web` | Interfaz Next.js y comunicación con REST/WebSocket. |
| `apps/api` | API, autenticación, persistencia, reglas operativas y reportes. |
| `services/edge-agent` | Captura, inferencia, tracking, reglas locales y envío confiable. |
| `packages/contracts` | Modelos y contratos compartidos entre componentes. |
| `infrastructure/supabase` | Migraciones, políticas RLS y datos iniciales. |
| `infrastructure/vercel` | Configuración de frontend y tareas programadas. |
| `infrastructure/docker` | Orquestación local y despliegues reproducibles. |
| `tests` | Pruebas que cruzan más de un componente. |
| `documentation` | Arquitectura, API, operación y aceptación. |

## Reglas de dependencia

- El frontend consume contratos públicos; nunca importa código del agente Edge.
- El agente Edge no depende del frontend.
- La API es la autoridad para usuarios, cámaras, sesiones, eventos, revisiones y reportes.
- Supabase no se consulta con claves privadas desde el navegador.
- Los contratos deben versionarse antes de cambiar mensajes REST o WebSocket.
