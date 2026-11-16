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
- Git.
- PowerShell en Windows.

## Inicio rápido en Windows

Desde `C:\vision-ai`:

```powershell
powershell -ExecutionPolicy Bypass -File scripts/bootstrap.ps1
npm.cmd run dev
```

Abre `http://localhost:3000`.

El script de preparación instala el frontend, crea `.env.local` desde el ejemplo y valida la estructura. Las credenciales reales deben completarse localmente y nunca confirmarse en Git.

## Comandos principales

```powershell
npm.cmd run dev
npm.cmd run typecheck
npm.cmd run build
npm.cmd run check:structure
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
3. Verificación de TypeScript.
4. Compilación de producción del frontend.

## Estado

La estructura inicial está completa. El frontend visual está avanzado; backend, Supabase, agente Edge, modelos de IA y reportes funcionales se implementan en las siguientes fases.
