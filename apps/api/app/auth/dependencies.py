from dataclasses import dataclass
from hmac import compare_digest
from typing import Annotated, cast
from uuid import UUID

from fastapi import Depends, Header, Request
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from ..config import Settings, get_settings
from ..errors import AppError
from ..supabase import SupabaseGateway

bearer = HTTPBearer(auto_error=False)


@dataclass(frozen=True)
class AuthenticatedUser:
    id: UUID
    email: str | None
    access_token: str


def get_gateway(request: Request) -> SupabaseGateway:
    return cast(SupabaseGateway, request.app.state.supabase)


async def get_current_user(
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer)],
    gateway: Annotated[SupabaseGateway, Depends(get_gateway)],
) -> AuthenticatedUser:
    if credentials is None or credentials.scheme.lower() != "bearer":
        raise AppError(401, "authentication_required", "Debes iniciar sesión para continuar.")
    data = await gateway.authenticate(credentials.credentials)
    return AuthenticatedUser(
        id=UUID(data["id"]),
        email=data.get("email"),
        access_token=credentials.credentials,
    )


async def require_site_member(
    site_id: UUID,
    user: AuthenticatedUser,
    gateway: SupabaseGateway,
) -> str:
    rows, _ = await gateway.rows(
        "site_members",
        access_token=user.access_token,
        params={
            "select": "role",
            "site_id": f"eq.{site_id}",
            "user_id": f"eq.{user.id}",
            "limit": 1,
        },
    )
    if not rows:
        raise AppError(403, "site_access_denied", "No tienes acceso a este sitio.")
    role = rows[0].get("role")
    if not isinstance(role, str):
        raise AppError(502, "invalid_membership", "La membresía del sitio no tiene un rol válido.")
    return role


async def require_edge_token(
    settings: Annotated[Settings, Depends(get_settings)],
    x_edge_token: Annotated[str | None, Header()] = None,
) -> None:
    configured = settings.edge_api_token.get_secret_value()
    if not configured or not x_edge_token or not compare_digest(configured, x_edge_token):
        raise AppError(401, "invalid_edge_token", "La credencial del agente edge no es válida.")
