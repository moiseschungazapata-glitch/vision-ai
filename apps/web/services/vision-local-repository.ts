import type { VisionState } from "@/types/vision";

const STORAGE_KEY = "vision-ai-functional-state-v1";

export const DEFAULT_VISION_STATE: VisionState = {
  cameras: [
    { id: "cam-01", name: "CAM-01", place: "Zona de carga", status: "En línea", fps: "12.4 FPS", latency: "74 ms", profile: "Seguridad", source: "RTSP" },
    { id: "cam-02", name: "CAM-02", place: "Línea de empaque", status: "En línea", fps: "11.9 FPS", latency: "81 ms", profile: "Calidad", source: "RTSP" },
    { id: "cam-03", name: "CAM-03", place: "Almacén norte", status: "En línea", fps: "13.1 FPS", latency: "68 ms", profile: "Retail", source: "USB" },
    { id: "cam-04", name: "CAM-04", place: "Acceso principal", status: "Degradada", fps: "7.2 FPS", latency: "218 ms", profile: "Logística", source: "RTSP" },
    { id: "cam-05", name: "CAM-05", place: "Andén logístico", status: "En línea", fps: "12.0 FPS", latency: "90 ms", profile: "Logística", source: "RTSP" },
    { id: "cam-06", name: "CAM-06", place: "Área de despacho", status: "Fuera de línea", fps: "—", latency: "—", profile: "Seguridad", source: "USB" },
  ],
  events: [
    { id: "EVT-2048", type: "EPP incompleto", place: "Zona de carga 02", time: "10:42:08", severity: "Alta", status: "Nuevo", module: "Seguridad" },
    { id: "EVT-2047", type: "Acceso a zona crítica", place: "Línea de empaque", time: "10:39:31", severity: "Crítica", status: "En revisión", module: "Seguridad" },
    { id: "EVT-2046", type: "Casco verificado", place: "Almacén norte", time: "10:35:14", severity: "Baja", status: "Resuelto", module: "Seguridad" },
    { id: "EVT-2045", type: "Permanencia extendida", place: "Andén 04", time: "10:28:52", severity: "Media", status: "Atendido", module: "Retail" },
    { id: "EVT-2044", type: "Chaleco no visible", place: "Acceso principal", time: "10:21:03", severity: "Alta", status: "Descartado", module: "Seguridad" },
    { id: "EVT-2043", type: "Cola vehicular", place: "Garita sur", time: "10:18:11", severity: "Media", status: "Nuevo", module: "Logística" },
    { id: "EVT-2042", type: "Defecto superficial", place: "Línea de calidad", time: "10:12:40", severity: "Alta", status: "En revisión", module: "Calidad" },
  ],
  reports: [
    { id: "REP-1114", date: "14 NOV 2026", title: "Resumen diario · Planta Central", events: "116 eventos", status: "Entregado", time: "01:15", format: "PDF" },
    { id: "REP-1113", date: "13 NOV 2026", title: "Resumen diario · Planta Central", events: "94 eventos", status: "Entregado", time: "01:15", format: "PDF" },
    { id: "REP-1112", date: "12 NOV 2026", title: "Resumen diario · Planta Central", events: "Sin eventos", status: "Entregado", time: "01:15", format: "PDF" },
    { id: "REP-1111", date: "11 NOV 2026", title: "Resumen diario · Planta Central", events: "132 eventos", status: "Revisar", time: "01:16", format: "PDF" },
  ],
  settings: { animations: true, sounds: false, dense: true, language: "Español" },
  profile: { name: "Moises Chungaza", email: "moises@vision-ai.local", role: "Administrador", timezone: "America/Lima" },
};

export function loadVisionState(): VisionState {
  if (typeof window === "undefined") return DEFAULT_VISION_STATE;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return DEFAULT_VISION_STATE;
    const stored = JSON.parse(raw) as Partial<VisionState>;
    return {
      cameras: stored.cameras ?? DEFAULT_VISION_STATE.cameras,
      events: stored.events ?? DEFAULT_VISION_STATE.events,
      reports: stored.reports ?? DEFAULT_VISION_STATE.reports,
      settings: { ...DEFAULT_VISION_STATE.settings, ...stored.settings },
      profile: { ...DEFAULT_VISION_STATE.profile, ...stored.profile },
    };
  } catch {
    return DEFAULT_VISION_STATE;
  }
}

export function saveVisionState(state: VisionState) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function downloadCsv(filename: string, rows: Array<Record<string, string>>) {
  const headers = Object.keys(rows[0] ?? { message: "Sin datos" });
  const escape = (value: string) => `"${value.replaceAll('"', '""')}"`;
  const csv = [headers.join(","), ...rows.map(row => headers.map(header => escape(row[header] ?? "")).join(","))].join("\n");
  const url = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: "text/csv;charset=utf-8" }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
