-- Configurable deadlines that drive the pack/caparra flow, editable from admin.
--   deposit_purchase_deadline : last day a pack can be bought WITH a caparra
--   deposit_balance_deadline  : last day a paid caparra can be settled
--   pack_purchase_deadline    : last day a pack can be bought at all
-- Masterclasses have no end date. Stored as ISO dates (YYYY-MM-DD) in the
-- site_settings key/value table (public read, admin write).
--
-- Self-contained & idempotent: creates site_settings if migration 015 never ran.

create table if not exists site_settings (
  key        text primary key,
  value      text not null,
  updated_at timestamptz default now()
);

alter table site_settings enable row level security;

drop policy if exists "Public read settings" on site_settings;
create policy "Public read settings"
  on site_settings for select using (true);

drop policy if exists "Admin write settings" on site_settings;
create policy "Admin write settings"
  on site_settings for all using (
    exists (select 1 from profiles where id = auth.uid() and role = 'admin')
  );

insert into site_settings (key, value) values
  ('deposit_purchase_deadline', '2026-07-31'),
  ('deposit_balance_deadline',  '2026-08-07'),
  ('pack_purchase_deadline',    '2026-09-10')
on conflict (key) do nothing;
