from uuid import UUID

import pytest
from pydantic import ValidationError

from app.schemas import CameraCreate, TelemetryCreate


def test_camera_request_accepts_contract_camel_case() -> None:
    camera = CameraCreate.model_validate({
        "siteId": "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
        "name": "CAM-01",
        "location": "Zona de carga",
        "sourceType": "rtsp",
        "sourceRef": "camera-secret-ref:cam-01",
        "activeProfile": "security",
    })
    assert camera.site_id == UUID("aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa")
    assert camera.model_dump(mode="json", by_alias=True)["sourceType"] == "rtsp"


def test_telemetry_rejects_invalid_percentage() -> None:
    with pytest.raises(ValidationError):
        TelemetryCreate.model_validate({
            "edgeNodeId": "22222222-2222-4222-8222-222222222222",
            "cameraId": "11111111-1111-4111-8111-111111111111",
            "timestamp": "2026-11-15T10:00:00-05:00",
            "connectionStatus": "online",
            "fps": 12,
            "latencyMs": 70,
            "inferenceMs": 50,
            "droppedFramesPercent": 101,
            "activeDetections": 2,
        })
