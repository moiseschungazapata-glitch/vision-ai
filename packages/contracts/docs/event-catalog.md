# Catálogo de eventos

Los nombres son estables y se transportan en `eventType` y `ruleType`. Cada evento conserva confianza, severidad, cámara, sesión, instante y metadatos del caso de uso.

| Caso de uso | Tipo | Regla mínima |
|---|---|---|
| Seguridad | `ppe_missing` | EPP obligatorio ausente durante el número de cuadros configurado. |
| Seguridad | `restricted_zone` | Una trayectoria entra a un polígono restringido. |
| Seguridad | `dwell_time` | Permanencia superior al umbral de segundos. |
| Manufactura/calidad | `quality_defect` | Clase de defecto por encima de la confianza configurada. |
| Manufactura/calidad | `missing_part` | Componente esperado ausente en la región de inspección. |
| Retail | `occupancy` | Aforo supera el máximo de la zona. |
| Retail | `queue` | Longitud o espera de fila supera el umbral. |
| Retail | `congestion` | Densidad permanece alta durante el intervalo configurado. |
| Logística/movilidad | `wrong_way` | Trayectoria cruza líneas en dirección no permitida. |
| Logística/movilidad | `vehicle_access` | Vehículo entra o sale de una zona controlada. |

## Reglas comunes

- La confianza es un decimal entre 0 y 1.
- El agente aplica `cooldown` antes de emitir otro evento equivalente para la misma cámara, regla y trayectoria.
- La severidad se define en la regla; no se infiere en el navegador.
- Las coordenadas de cajas y zonas están normalizadas entre 0 y 1.
- Solo se guarda evidencia asociada al evento. La grabación continua queda fuera del alcance inicial.
- Un evento se crea como `new`; revisión y resolución quedan auditadas en el backend.
