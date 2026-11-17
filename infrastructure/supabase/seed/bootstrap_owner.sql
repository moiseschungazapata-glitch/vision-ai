-- Sustituye ambos valores antes de ejecutar este archivo en un entorno de desarrollo.
-- El UUID de usuario está disponible en Authentication > Users.
with new_site as (
  insert into public.sites (name, timezone)
  values ('Planta Central', 'America/Lima')
  returning id
)
insert into public.site_members (site_id, user_id, role)
select id, '00000000-0000-0000-0000-000000000000'::uuid, 'owner'
from new_site;
