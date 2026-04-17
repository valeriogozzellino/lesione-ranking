-- Esegui questo script nell'editor SQL di Supabase

-- 1. Crea la tabella dei profili
create table public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text not null,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Trigger per creare automaticamente il profilo dopo la registrazione
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 3. Crea la tabella delle Serate (Gare)
create table public.serate (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  date date not null,
  is_active boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Crea la tabella dei voti (Punteggi Lesione)
create table public.lesione_votes (
  id uuid default gen_random_uuid() primary key,
  serata_id uuid references public.serate on delete cascade not null,
  voter_id uuid references public.profiles on delete cascade not null,
  voted_user_id uuid references public.profiles on delete cascade not null,
  score numeric not null check (score >= 1 and score <= 10),
  comment text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (serata_id, voter_id, voted_user_id) -- Permette un solo voto per persona a serata
);

-- 5. Abilita la Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.serate enable row level security;
alter table public.lesione_votes enable row level security;

-- 6. Policy per le tabelle
-- Profili
create policy "Profili visibili a tutti" on public.profiles for select using (true);
create policy "Gli utenti possono aggiornare il proprio profilo" on public.profiles for update using (auth.uid() = id);

-- Serate
create policy "Serate visibili a tutti" on public.serate for select using (true);
create policy "Solo admin possono modificare le serate" on public.serate for all using (
  false
);

-- Voti
create policy "Voti visibili a tutti" on public.lesione_votes for select using (true);
create policy "Utenti autenticati possono inserire i loro voti" on public.lesione_votes for insert with check (auth.uid() = voter_id);
create policy "Utenti autenticati possono aggiornare i loro voti" on public.lesione_votes for update using (auth.uid() = voter_id);
