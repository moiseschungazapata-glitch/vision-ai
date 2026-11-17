# VISION AI

Plataforma de análisis visual en tiempo real con procesamiento de video en el borde, backend operativo y dashboard web.

## Casos de uso

- Seguridad industrial: EPP y zonas de riesgo.
- Calidad en línea: defectos y piezas faltantes.
- Retail y almacén: aforo, filas y congestión.
- Acceso vehicular: flujo, cola y sentido.

El alcance base utiliza cámaras USB o RTSP en vivo. No contempla carga manual de imágenes ni almacenamiento continuo de video.

## Requisitos de desarrollo

- Node.js 22 y npm 10 o superior.
- Python 3.12.
- uv para instalar y ejecutar el entorno Python.
- Git.
- PowerShell en Windows.

## Inicio rápido en Windows

Desde `C:\vision-ai`:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/bootstrap.ps1
npm.cmd run dev
```

En otra terminal ejecuta `npm.cmd run dev:api`. Abre `http://localhost:3000` para el frontend y `http://localhost:8000/docs` para la documentación de la API.

El script de preparación instala el frontend, crea `.env.local` desde el ejemplo y valida la estructura. Las credenciales reales deben completarse localmente y nunca confirmarse en Git.

## Comandos principales

```powershell
npm.cmd run dev
npm.cmd run dev:api
npm.cmd run typecheck
npm.cmd run build
npm.cmd run check:structure
npm.cmd run check:contracts
npm.cmd run check:backend
npm.cmd run check
```

## Estructura

```text
vision-ai/
├── apps/
│   ├── web/                 Frontend Next.js
│   └── api/                 REST, WebSocket y reportes
├── services/
│   └── edge-agent/          Captura, inferencia, tracking y reglas
├── packages/
│   └── contracts/           Contratos compartidos
├── infrastructure/
│   ├── supabase/            Migraciones, RLS y datos iniciales
│   ├── vercel/              Despliegue y tareas programadas
│   └── docker/              Entorno reproducible
├── tests/                   Integración, E2E y rendimiento
├── documentation/           Arquitectura, API, operación y aceptación
└── scripts/                 Preparación y validación del repositorio
```

Consulta [la descripción completa de la estructura](documentation/architecture/repository-structure.md) y [las reglas de contribución](CONTRIBUTING.md).

## Variables de entorno

`.env.example` contiene el contrato inicial de configuración para frontend, API, Supabase, Resend y agente Edge. Copia el archivo como `.env.local` y completa únicamente las variables requeridas para la fase en desarrollo.

Las variables con prefijo `NEXT_PUBLIC_` pueden llegar al navegador. Las claves privadas de Supabase, Resend y el agente Edge son exclusivamente de servidor.

## Integración continua

GitHub Actions ejecuta automáticamente:

1. Validación de la estructura.
2. Instalación reproducible con `npm ci`.
3. Contratos REST/WebSocket y modelos compartidos.
4. Estilo, tipos y pruebas del backend.
5. Verificación de TypeScript.
6. Compilación de producción del frontend.

## Estado

La estructura, el frontend visual y funcional, los contratos y el backend REST/WebSocket están implementados. La conexión real queda activa al aplicar la migración y configurar las claves del proyecto Supabase. El agente Edge, los modelos de IA y la generación/envío de reportes corresponden a las fases siguientes.
