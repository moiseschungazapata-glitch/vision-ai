export const CONTRACT_VERSION = "1.0.0" as const;

export type EntityId = string;
export type IsoDateTime = string;
export type UseCase = "security" | "quality" | "retail" | "mobility";
export type Severity = "critical" | "high" | "medium" | "low" | "info";
export type CameraStatus = "online" | "degraded" | "offline";
export type SessionStatus = "starting" | "running" | "paused" | "stopping" | "stopped" | "failed";
export type EventStatus = "new" | "in_review" | "confirmed" | "resolved" | "dismissed";
export type ReportStatus = "pending" | "generating" | "ready" | "sent" | "failed";

export type BoundingBox = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type Camera = {
  id: EntityId;
  siteId: EntityId;
  name: string;
  location: string;
  sourceType: "usb" | "rtsp";
  sourceRef: string;
  enabled: boolean;
  status: CameraStatus;
  activeProfile: UseCase;
  createdAt: IsoDateTime;
  updatedAt: IsoDateTime;
};

export type VisionSession = {
  id: EntityId;
  cameraId: EntityId;
  edgeNodeId: EntityId;
  useCase: UseCase;
  status: SessionStatus;
  modelVersion: string;
  ruleSetVersion: string;
  startedAt: IsoDateTime;
  endedAt?: IsoDateTime | null;
  failureReason?: string | null;
};

export type Detection = {
  id: EntityId;
  sessionId: EntityId;
  cameraId: EntityId;
  frameId: string;
  capturedAt: IsoDateTime;
  className: string;
  confidence: number;
  boundingBox: BoundingBox;
  trackId?: string | null;
  attributes: Record<string, string | number | boolean | null>;
};

export type VisionEvent = {
  id: EntityId;
  siteId: EntityId;
  sessionId: EntityId;
  cameraId: EntityId;
  useCase: UseCase;
  ruleId: EntityId;
  eventType: string;
  title: string;
  severity: Severity;
  status: EventStatus;
  occurredAt: IsoDateTime;
  endedAt?: IsoDateTime | null;
  durationMs?: number | null;
  confidence: number;
  trackIds: string[];
  zoneId?: EntityId | null;
  evidencePath?: string | null;
  metadata: Record<string, unknown>;
};

export type EventReview = {
  id: EntityId;
  eventId: EntityId;
  reviewerId: EntityId;
  decision: "confirmed" | "false_positive" | "dismissed" | "escalated";
  comment?: string | null;
  reviewedAt: IsoDateTime;
};

export type VisionRule = {
  id: EntityId;
  siteId: EntityId;
  name: string;
  useCase: UseCase;
  ruleType: string;
  enabled: boolean;
  version: number;
  parameters: Record<string, unknown>;
  createdAt: IsoDateTime;
  updatedAt: IsoDateTime;
};

export type EdgeTelemetry = {
  edgeNodeId: EntityId;
  cameraId: EntityId;
  sessionId?: EntityId | null;
  timestamp: IsoDateTime;
  connectionStatus: CameraStatus;
  fps: number;
  latencyMs: number;
  inferenceMs: number;
  droppedFramesPercent: number;
  gpuUtilizationPercent?: number | null;
  temperatureCelsius?: number | null;
  activeDetections: number;
};

export type DailyReport = {
  id: EntityId;
  siteId: EntityId;
  reportDate: string;
  timezone: string;
  status: ReportStatus;
  eventCount: number;
  metrics: Record<string, number>;
  recipients: string[];
  filePath?: string | null;
  providerMessageId?: string | null;
  generatedAt?: IsoDateTime | null;
  sentAt?: IsoDateTime | null;
  errorMessage?: string | null;
};

export type ApiError = {
  code: string;
  message: string;
  details?: Record<string, unknown>;
  requestId: string;
};

export type Page<T> = {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
};

export type RealtimeMessageType =
  | "event.created"
  | "event.updated"
  | "telemetry.updated"
  | "camera.status_changed"
  | "session.status_changed"
  | "report.ready";

export type RealtimeEnvelope<T = unknown> = {
  contractVersion: typeof CONTRACT_VERSION;
  messageId: EntityId;
  type: RealtimeMessageType;
  siteId: EntityId;
  sequence: number;
  occurredAt: IsoDateTime;
  payload: T;
};
