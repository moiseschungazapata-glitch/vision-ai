from fastapi.testclient import TestClient

from app.main import app


def test_health_reports_contract_version() -> None:
    with TestClient(app) as client:
        response = client.get("/api/v1/health")
    assert response.status_code == 200
    assert response.json()["contractVersion"] == "1.1.0"
    assert response.json()["status"] in {"ok", "degraded"}


def test_private_endpoint_requires_bearer_token() -> None:
    with TestClient(app) as client:
        response = client.get(
            "/api/v1/cameras",
            params={"siteId": "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa"},
        )
    assert response.status_code == 401
    assert response.json()["code"] == "authentication_required"


def test_edge_endpoint_rejects_missing_token() -> None:
    with TestClient(app) as client:
        response = client.post("/api/v1/edge/events", json={})
    assert response.status_code == 401
    assert response.json()["code"] == "invalid_edge_token"
