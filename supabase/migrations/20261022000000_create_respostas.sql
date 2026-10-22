begin;

create table if not exists public.respostas (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null default auth.uid(),
  entrada text,
  resposta text,
  criado_em timestamptz default now()
);

alter table public.respostas enable row level security;

drop policy if exists "cada uma ve as suas" on public.respostas;

create policy "cada uma ve as suas"
on public.respostas for select
to authenticated
using (auth.uid() = user_id);

drop policy if exists "cada uma salva as suas" on public.respostas;

create policy "cada uma salva as suas"
on public.respostas for insert
to authenticated
with check (auth.uid() = user_id);

grant select, insert on public.respostas to authenticated;

commit;
