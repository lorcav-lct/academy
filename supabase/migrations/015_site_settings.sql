-- Site-wide key-value settings (editable from admin)
create table if not exists site_settings (
  key        text primary key,
  value      text not null,
  updated_at timestamptz default now()
);

alter table site_settings enable row level security;

-- Anyone can read settings (needed for the public widget)
create policy "Public read settings"
  on site_settings for select using (true);

-- Only admins can write
create policy "Admin write settings"
  on site_settings for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

-- Default CTA floater values
insert into site_settings (key, value) values
  ('cta_phone',    '+390521607870'),
  ('cta_label',    'Chiamaci ora'),
  ('cta_sublabel', 'Siamo qui per aiutarti')
on conflict (key) do nothing;
