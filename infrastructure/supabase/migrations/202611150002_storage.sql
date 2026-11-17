insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('event-evidence', 'event-evidence', false, 10485760, array['image/jpeg', 'image/png', 'image/webp']),
  ('daily-reports', 'daily-reports', false, 20971520, array['application/pdf'])
on conflict (id) do nothing;

create policy "members read event evidence"
on storage.objects for select to authenticated
using (
  bucket_id = 'event-evidence'
  and public.is_site_member((storage.foldername(name))[1]::uuid)
);

create policy "members read daily reports"
on storage.objects for select to authenticated
using (
  bucket_id = 'daily-reports'
  and public.is_site_member((storage.foldername(name))[1]::uuid)
);

-- Las escrituras quedan reservadas al backend mediante service_role.
