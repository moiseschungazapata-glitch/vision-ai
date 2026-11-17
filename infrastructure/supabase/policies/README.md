# Seguridad de Supabase

Las políticas RLS se instalan con la migración inicial. Un usuario solo puede leer datos de sitios presentes en `site_members`. Los roles `owner`, `admin` y `operator` pueden operar cámaras, sesiones y reglas; `viewer` es de solo lectura.

El agente edge no usa una sesión de usuario. Envía `X-Edge-Token` al backend y únicamente el backend utiliza `service_role` para insertar eventos y telemetría. Esa clave nunca debe publicarse como variable `NEXT_PUBLIC_*`.
