export type CameraRecord = {
  id: string;
  name: string;
  place: string;
  status: "En línea" | "Degradada" | "Fuera de línea";
  fps: string;
  latency: string;
  profile: string;
  source: string;
};

export type EventRecord = {
  id: string;
  type: string;
  place: string;
  time: string;
  severity: "Crítica" | "Alta" | "Media" | "Baja";
  status: "Nuevo" | "En revisión" | "Resuelto" | "Atendido" | "Descartado";
  module: string;
  comment?: string;
};

export type ReportRecord = {
  id: string;
  date: string;
  title: string;
  events: string;
  status: "Entregado" | "Revisar";
  time: string;
  format: string;
};

export type UiSettings = {
  animations: boolean;
  sounds: boolean;
  dense: boolean;
  language: string;
};

export type UserProfile = {
  name: string;
  email: string;
  role: string;
  timezone: string;
};

export type VisionState = {
  cameras: CameraRecord[];
  events: EventRecord[];
  reports: ReportRecord[];
  settings: UiSettings;
  profile: UserProfile;
};
