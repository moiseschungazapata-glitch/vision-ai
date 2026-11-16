# Frontend VISION AI

El frontend funciona actualmente en modo local autónomo. Las cámaras, eventos, reportes, preferencias y perfil se conservan en `localStorage` mediante `services/vision-local-repository.ts`.

## Funciones disponibles

- Navegación, búsqueda y filtrado.
- Registro persistente de cámaras.
- Revisión y actualización de eventos.
- Generación y descarga de reportes CSV.
- Paginación de eventos.
- Preferencias, perfil, temas y menú persistentes.
- Estados vacíos, confirmaciones y validación de formularios.

## Ejecución

```powershell
npm.cmd run dev
```

## Integración futura

`use-vision-store.ts` concentra el estado funcional. En la fase de integración, el repositorio local se sustituirá por adaptadores REST/WebSocket sin rediseñar las pantallas.
