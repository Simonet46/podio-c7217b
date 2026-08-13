# PODIO

Plataforma web donde cualquier persona del mundo puede aportar plata directo a
atletas argentinos en proceso de clasificación a **Los Ángeles 2028**.

Modelo: donación **única** o **mensual**. La plataforma retiene **7%**; el **93%**
va al atleta (modelo Stripe Connect *pass-through* — la plataforma nunca custodia
los fondos).

> **PODIO** es un nombre placeholder. Toda la marca, la comisión y la fecha de
> LA 2028 viven en un solo archivo: [`src/config/site.ts`](src/config/site.ts).

---

## Stack

- **Next.js 14** (App Router) + **TypeScript**
- **Tailwind CSS** (design tokens del brief en `tailwind.config.ts` + `globals.css`)
- **Supabase** (Postgres + Storage) — *modular, opcional*
- **Stripe Connect** (Express, pass-through) — *modular, opcional*

## Correr en local

```bash
npm install
npm run dev          # http://localhost:3000
```

**La app corre sin ninguna credencial.** Sin Supabase usa 8 atletas sembrados
([`src/lib/data/seed.ts`](src/lib/data/seed.ts)); sin Stripe el botón de aporte
corre en *modo demo* y redirige a la página de gracias sin cobro real.

## Conectar los servicios (cuando estén las claves)

1. Copiá `.env.example` a `.env.local` y completá los valores.
2. **Supabase:** aplicá [`supabase/schema.sql`](supabase/schema.sql) y, si querés
   los atletas de demo, [`supabase/seed.sql`](supabase/seed.sql). Al detectar
   `NEXT_PUBLIC_SUPABASE_URL`, la capa de datos
   ([`src/lib/data/athletes.ts`](src/lib/data/athletes.ts)) lee de Postgres en vez
   del seed — sin tocar el front.
3. **Stripe Connect:** cargá las claves. Cada atleta necesita un
   `stripe_account_id` (cuenta conectada Express) para cobrar de verdad; si no lo
   tiene, ese atleta sigue en modo demo.
4. **Webhook:** apuntá Stripe a `/api/webhook` con `STRIPE_WEBHOOK_SECRET`. Registra
   cada donación y actualiza `raised_amount`.

## Estructura

```
src/
  config/
    site.ts          # marca, comisión 7%, fecha LA 2028, presets, disclaimer
    sports.ts        # catálogo de deportes + color de panel
  lib/
    money.ts         # formateo USD, desglose 7%/93%, % de progreso
    supabase.ts      # cliente modular (null si no hay env)
    stripe.ts        # cliente modular (null si no hay env)
    data/            # types, seed, capa de acceso (Supabase → seed)
  components/         # Header, Footer, Countdown, AthleteCard/Grid,
                     # DonationWidget, ProgressBar, Monogram, Ribbon
  app/
    page.tsx                 # home (hero, grid, cómo funciona)
    atleta/[slug]/page.tsx   # perfil + widget de donación sticky
    gracias/page.tsx         # éxito post-pago
    api/checkout/route.ts    # crea Checkout Session (o URL demo)
    api/webhook/route.ts     # registra donación, actualiza recaudado
supabase/
  schema.sql         # FOTO real de la base (generada 13/08/2026); cambios nuevos → migrations/ + db push
  seed.sql           # 8 atletas de demo
```

## Notas de diseño

Estética ceremonia premium + albiceleste. Fondo *midnight*, oro de medalla como
acento, tipografía condensada (Oswald) tipo scoreboard. Firma visual: **franja
decorativa de 5 colores** (NO los aros olímpicos), barras de progreso "camino al
podio", contador regresivo real a LA 2028, monograma de iniciales como placeholder.

**Restricción legal:** sin aros olímpicos, sin logo COI/COA, sin la palabra
"Olímpico" como marca. "Los Ángeles 2028" solo descriptivo. Disclaimer de no
afiliación en el footer.

## Seguridad / pendientes conocidos

- `npm audit` reporta avisos que solo se resuelven saltando a Next 16 (breaking).
  Esta app está en la última 14.2.x parcheada (14.2.35); migrar a 16 es una tarea
  aparte.
- La página de gracias en modo Stripe real debería recuperar la sesión por
  `session_id` para confirmar el pago (hoy confía en los query params). Marcado en
  el código.
