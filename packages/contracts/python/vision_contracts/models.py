from __future__ import annotations

from datetime import date, datetime
from enum import StrEnum
from typing import Any, Generic, Literal, TypeVar
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

CONTRACT_VERSION = "1.0.0"


class ContractModel(BaseModel):
    model_config = ConfigDict(alias_generator=lambda value: "".join(
        word if index == 0 else word.title() for index, word in enumerate(value.split("_"))
    ), populate_by_name=True, extra="forbid")


class UseCase(StrEnum):
    SECURITY = "security"
    QUALITY = "quality"
    RETAIL = "retail"
    MOBILITY = "mobility"


class Severity(StrEnum):
    INFO = "info"
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"


class CameraStatus(StrEnum):
    ONLINE = "online"
    OFFLINE = "offline"
    DEGRADED = "degraded"


class SessionStatus(StrEnum):
    STARTING = "starting"
    RUNNING = "running"
    PAUSED = "paused"
    STOPPING = "stopping"
    STOPPED = "stopped"
    FAILED = "failed"


class EventStatus(StrEnum):
    NEW = "new"
    IN_REVIEW = "in_review"
    CONFIRMED = "confirmed"
    RESOLVED = "resolved"
    DISMISSED = "dismissed"


class ReportStatus(StrEnum):
    PENDING = "pending"
    GENERATING = "generating"
    READY = "ready"
    SENT = "sent"
    FAILED = "failed"


class BoundingBox(ContractModel):
    x: float = Field(ge=0, le=1)
    y: float = Field(ge=0, le=1)
    width: float = Field(gt=0, le=1)
    height: float = Field(gt=0, le=1)


class Camera(ContractModel):
    id: UUID
    site_id: UUID
    name: str = Field(min_length=1, max_length=80)
    location: str = Field(min_length=1, max_length=160)
    source_type: Literal["usb", "rtsp"]
    source_ref: str
    status: CameraStatus
    enabled: bool
    active_profile: UseCase
    created_at: datetime
    updated_at: datetime


class VisionSession(ContractModel):
    id: UUID
    camera_id: UUID
    edge_node_id: UUID
    use_case: UseCase
    status: SessionStatus
    model_version: str = Field(min_length=1)
    rule_set_version: str = Field(min_length=1)
    started_at: datetime
    ended_at: datetime | None = None
    failure_reason: str | None = Field(default=None, max_length=500)


class Detection(ContractModel):
    id: UUID
    session_id: UUID
    camera_id: UUID
    frame_id: str = Field(min_length=1)
    captured_at: datetime
    class_name: str = Field(min_length=1)
    confidence: float = Field(ge=0, le=1)
    bounding_box: BoundingBox
    track_id: str | None = None
    attributes: dict[str, str | int | float | bool | None] = Field(default_factory=dict)


class VisionEvent(ContractModel):
    id: UUID
    site_id: UUID
    camera_id: UUID
    session_id: UUID
    use_case: UseCase
    rule_id: UUID
    event_type: str = Field(min_length=1)
    title: str = Field(min_length=1, max_length=160)
    severity: Severity
    status: EventStatus
    occurred_at: datetime
    ended_at: datetime | None = None
    duration_ms: int | None = Field(default=None, ge=0)
    confidence: float = Field(ge=0, le=1)
    track_ids: list[str] = Field(default_factory=list)
    zone_id: UUID | None = None
    evidence_path: str | None = None
    metadata: dict[str, Any] = Field(default_factory=dict)


class EventReview(ContractModel):
    id: UUID
    event_id: UUID
    reviewer_id: UUID
    decision: Literal["confirmed", "false_positive", "dismissed", "escalated"]
    comment: str | None = Field(default=None, max_length=2000)
    reviewed_at: datetime


class VisionRule(ContractModel):
    id: UUID
    site_id: UUID
    name: str = Field(min_length=1, max_length=120)
    use_case: UseCase
    rule_type: Literal[
        "ppe_missing", "restricted_zone", "dwell_time", "quality_defect",
        "missing_part", "occupancy", "queue", "congestion", "wrong_way",
        "vehicle_access",
    ]
    enabled: bool
    version: int = Field(ge=1)
    parameters: dict[str, Any] = Field(default_factory=dict)
    created_at: datetime
    updated_at: datetime


class EdgeTelemetry(ContractModel):
    edge_node_id: UUID
    camera_id: UUID
    session_id: UUID | None = None
    timestamp: datetime
    connection_status: CameraStatus
    fps: float = Field(ge=0)
    latency_ms: float = Field(ge=0)
    inference_ms: float = Field(ge=0)
    dropped_frames_percent: float = Field(ge=0, le=100)
    gpu_utilization_percent: float | None = Field(default=None, ge=0, le=100)
    temperature_celsius: float | None = None
    active_detections: int = Field(ge=0)


class DailyReport(ContractModel):
    id: UUID
    site_id: UUID
    report_date: date
    timezone: str
    status: ReportStatus
    event_count: int = Field(ge=0)
    metrics: dict[str, float] = Field(default_factory=dict)
    recipients: list[str] = Field(min_length=1)
    file_path: str | None = None
    provider_message_id: str | None = None
    generated_at: datetime | None = None
    sent_at: datetime | None = None
    error_message: str | None = None


class ApiError(ContractModel):
    code: str
    message: str
    details: dict[str, Any] | None = None
    request_id: str


PayloadT = TypeVar("PayloadT")


class RealtimeEnvelope(ContractModel, Generic[PayloadT]):
    contract_version: Literal["1.0.0"] = CONTRACT_VERSION
    message_id: UUID
    type: Literal[
        "event.created", "event.updated", "telemetry.updated",
        "camera.status_changed", "session.status_changed", "report.ready",
    ]
    site_id: UUID
    sequence: int = Field(ge=0)
    occurred_at: datetime
    payload: PayloadT
