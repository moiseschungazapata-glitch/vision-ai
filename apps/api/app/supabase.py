from __future__ import annotations

from typing import Any, cast

import httpx

from .config import Settings
from .errors import AppError


class SupabaseGateway:
    def __init__(self, settings: Settings) -> None:
        self.settings = settings
        self.client = httpx.AsyncClient(timeout=15.0)
        self.connections: Any = None

    async def close(self) -> None:
        await self.client.aclose()

    def _ensure_configured(self) -> None:
        if not self.settings.supabase_configured:
            raise AppError(503, "supabase_not_configured", "Supabase todavía no está configurado.")

    def _headers(
        self,
        access_token: str | None = None,
        prefer: str | None = None,
    ) -> dict[str, str]:
        self._ensure_configured()
        service_key = self.settings.supabase_secret_key.get_secret_value()
        headers = {
            "apikey": self.settings.supabase_apikey,
            "Authorization": f"Bearer {access_token or service_key}",
            "Content-Type": "application/json",
        }
        if prefer:
            headers["Prefer"] = prefer
        return headers

    async def authenticate(self, access_token: str) -> dict[str, Any]:
        self._ensure_configured()
        response = await self.client.get(
            f"{self.settings.supabase_url.rstrip('/')}/auth/v1/user",
            headers=self._headers(access_token),
        )
        if response.status_code != 200:
            raise AppError(401, "invalid_token", "La sesión de Supabase no es válida o expiró.")
        data = response.json()
        if not isinstance(data, dict):
            raise AppError(
                502,
                "invalid_supabase_response",
                "Supabase devolvió una sesión inválida.",
            )
        return cast(dict[str, Any], data)

    @staticmethod
    def _single_object(response: httpx.Response) -> dict[str, Any]:
        data = response.json()
        if isinstance(data, list) and data and isinstance(data[0], dict):
            return cast(dict[str, Any], data[0])
        if isinstance(data, dict):
            return cast(dict[str, Any], data)
        raise AppError(502, "invalid_supabase_response", "Supabase devolvió datos inesperados.")

    async def request(
        self,
        method: str,
        resource: str,
        *,
        access_token: str | None = None,
        params: dict[str, Any] | None = None,
        body: Any = None,
        prefer: str | None = None,
    ) -> httpx.Response:
        response = await self.client.request(
            method,
            f"{self.settings.supabase_url.rstrip('/')}/rest/v1/{resource.lstrip('/')}",
            params=params,
            json=body,
            headers=self._headers(access_token, prefer),
        )
        if response.status_code >= 400:
            try:
                error = response.json()
            except ValueError:
                error = {"message": response.text}
            accepted_statuses = {400, 401, 403, 404, 409, 422}
            status = response.status_code if response.status_code in accepted_statuses else 502
            raise AppError(
                status,
                "supabase_request_failed",
                error.get("message", "Supabase rechazó la operación."),
                {"status": response.status_code, "code": error.get("code")},
            )
        return response

    async def rows(
        self,
        resource: str,
        *,
        access_token: str | None,
        params: dict[str, Any],
        count: bool = False,
    ) -> tuple[list[dict[str, Any]], int | None]:
        response = await self.request(
            "GET",
            resource,
            access_token=access_token,
            params=params,
            prefer="count=exact" if count else None,
        )
        rows = response.json()
        total = None
        if count:
            content_range = response.headers.get("content-range", "")
            if "/" in content_range and content_range.rsplit("/", 1)[1] != "*":
                total = int(content_range.rsplit("/", 1)[1])
        return rows, total

    async def one(
        self,
        resource: str,
        *,
        access_token: str | None,
        params: dict[str, Any],
    ) -> dict[str, Any]:
        rows, _ = await self.rows(
            resource,
            access_token=access_token,
            params={**params, "limit": 1},
        )
        if not rows:
            raise AppError(404, "not_found", "El recurso solicitado no existe o no es accesible.")
        return rows[0]

    async def insert(
        self,
        resource: str,
        body: dict[str, Any],
        *,
        access_token: str | None = None,
    ) -> dict[str, Any]:
        response = await self.request(
            "POST",
            resource,
            access_token=access_token,
            body=body,
            prefer="return=representation",
        )
        return self._single_object(response)

    async def upsert(self, resource: str, body: dict[str, Any]) -> dict[str, Any]:
        response = await self.request(
            "POST",
            resource,
            body=body,
            prefer="resolution=merge-duplicates,return=representation",
        )
        return self._single_object(response)

    async def update(
        self,
        resource: str,
        body: dict[str, Any],
        *,
        access_token: str | None,
        params: dict[str, Any],
    ) -> dict[str, Any]:
        response = await self.request(
            "PATCH",
            resource,
            access_token=access_token,
            params=params,
            body=body,
            prefer="return=representation",
        )
        return self._single_object(response)

    async def delete(
        self,
        resource: str,
        *,
        access_token: str,
        params: dict[str, Any],
    ) -> None:
        await self.request("DELETE", resource, access_token=access_token, params=params)

    async def rpc(
        self,
        function: str,
        body: dict[str, Any],
        *,
        access_token: str,
    ) -> Any:
        response = await self.request(
            "POST",
            f"rpc/{function}",
            access_token=access_token,
            body=body,
        )
        return response.json()
