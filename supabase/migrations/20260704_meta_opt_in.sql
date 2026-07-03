-- Meta de recaudación opcional (opt-in por el admin). Aplicada vía Management API.
ALTER TABLE public.athletes ADD COLUMN IF NOT EXISTS show_goal boolean NOT NULL DEFAULT false;
-- (La columna athletes.team ya existía; las selecciones nacionales usan ese campo.)
