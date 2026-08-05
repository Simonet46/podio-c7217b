"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { Athlete, Team } from "@/lib/data/types";
import { SPORT_LIST } from "@/config/sports";
import { getSport } from "@/config/sports";
import { asset } from "@/config/site";
import { breakdown, formatMoney } from "@/lib/money";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { recordAcceptance } from "@/lib/legal";
import { AthleteCard } from "./AthleteCard";
import { Reveal } from "./Reveal";

/** Máximo de atletas por aporte repartido: con más, las comisiones fijas de
 *  Mercado Pago se comen los montos chicos. */
const MAX_SELECCION = 3;

/** Carrusel de campañas (atletas individuales + equipos) con filtro por deporte.
 *  3 filas que se deslizan juntas en horizontal: en desktop se ven 4 columnas
 *  (12 tarjetas) + media columna asomada, para invitar a deslizar con la flecha. */
export function AthleteGrid({
  athletes,
  teams = [],
}: {
  athletes: Athlete[];
  teams?: Team[];
}) {
  const [active, setActive] = useState<string | null>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  // Selección múltiple para "Tu aporte".
  const [seleccion, setSeleccion] = useState<Athlete[]>([]);
  const [avisoLimite, setAvisoLimite] = useState(false);
  const [aporteAbierto, setAporteAbierto] = useState(false);

  function toggleAtleta(a: Athlete) {
    setSeleccion((prev) => {
      if (prev.some((x) => x.id === a.id)) return prev.filter((x) => x.id !== a.id);
      if (prev.length >= MAX_SELECCION) {
        setAvisoLimite(true);
        setTimeout(() => setAvisoLimite(false), 2600);
        return prev;
      }
      return [...prev, a];
    });
  }

  // Deportes con chip propio; el resto (ciclismo, judo, remo…) cae en "Otros".
  const FEATURED = ["atletismo", "hockey", "handball", "voley", "basquet", "futbol"];
  const { availableSports, hayOtros } = useMemo(() => {
    const present = new Set<string>([
      ...athletes.map((a) => a.sport),
      ...teams.map((t) => t.sport),
    ]);
    return {
      availableSports: SPORT_LIST.filter((s) => FEATURED.includes(s.key) && present.has(s.key)),
      hayOtros: [...present].some((k) => !FEATURED.includes(k)),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [athletes, teams]);

  const matches = (sport: string) =>
    active === null ? true : active === "otros" ? !FEATURED.includes(sport) : sport === active;
  const shownTeams = teams.filter((t) => matches(t.sport));
  const shownAthletes = athletes.filter((a) => matches(a.sport));

  // Solo atletas en el carrusel: las selecciones tienen su propia fila arriba
  // (mezclarlas entre las fotos hacía que los escudos parecieran placeholders).
  const items = useMemo(() => {
    return shownAthletes.map((a) => ({
      key: `ath-${a.id}`,
      node: (
        <AthleteCard
          athlete={a}
          selected={seleccion.some((x) => x.id === a.id)}
          onToggle={() => toggleAtleta(a)}
        />
      ),
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shownAthletes, seleccion]);

  // Estado de las flechas según la posición del scroll.
  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    const update = () => {
      setCanLeft(el.scrollLeft > 8);
      setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 8);
    };
    update();
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      ro.disconnect();
    };
  }, [items.length]);

  const slide = (dir: 1 | -1) => {
    const el = scroller.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.9, behavior: "smooth" });
  };

  return (
    <div>
      {/* Selecciones y equipos: fila propia, tamaño intermedio (más que una
          pill, menos que una card de atleta). Escala sola al sumar deportes. */}
      {shownTeams.length > 0 && (
        <div className="mb-5 flex items-center gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <span className="eyebrow shrink-0 text-white/45">Selecciones</span>
          {shownTeams.map((t) => {
            const color = t.color ?? getSport(t.sport)?.color ?? "#C9A227";
            return (
              <a
                key={t.id}
                href={`/equipo/${t.slug}`}
                className="group/team flex shrink-0 items-center gap-3 rounded-xl border py-2 pl-2 pr-4 transition-transform hover:-translate-y-0.5"
                style={{ borderColor: `${color}55`, background: `${color}14` }}
              >
                <span
                  className="flex h-9 w-9 items-center justify-center rounded-lg font-display text-[13px] font-700 text-white"
                  style={{ background: `${color}33`, border: `2px solid ${color}` }}
                >
                  🇦🇷
                </span>
                <span className="leading-tight">
                  <span className="block font-display text-[13px] font-600 uppercase text-white">
                    {t.name}
                  </span>
                  <span className="block text-[10px] text-white/55">
                    {getSport(t.sport)?.label ?? t.sport} · Conocé al plantel →
                  </span>
                </span>
              </a>
            );
          })}
        </div>
      )}

      {/* Chips de filtro */}
      <div className="mb-8 flex flex-wrap gap-2">
        <Chip label="Todos" active={active === null} onClick={() => setActive(null)} />
        {availableSports.map((s) => (
          <Chip
            key={s.key}
            label={s.label}
            color={s.color}
            team={s.team}
            active={active === s.key}
            onClick={() => setActive(s.key)}
          />
        ))}
        {hayOtros && (
          <Chip label="Otros" color="#8A97A8" active={active === "otros"} onClick={() => setActive("otros")} />
        )}
      </div>

      {/* Carrusel: 3 filas, columnas de ~4.5 visibles en desktop */}
      <div className="relative">
        <div
          ref={scroller}
          className="grid snap-x snap-mandatory grid-flow-col grid-rows-3 gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden auto-cols-[calc((100%-1rem)/1.5)] sm:auto-cols-[calc((100%-2rem)/2.5)] lg:auto-cols-[calc((100%-4rem)/4.5)]"
        >
          {items.map((item, i) => (
            <Reveal key={item.key} delay={(i % 3) * 90} className="h-full snap-start">
              <div className="h-full [&>article]:h-full">{item.node}</div>
            </Reveal>
          ))}
        </div>

        {/* Flechas — doradas, bien visibles */}
        {canLeft && (
          <button
            type="button"
            onClick={() => slide(-1)}
            aria-label="Ver anteriores"
            className="absolute -left-3 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-gold text-ink shadow-[0_10px_30px_rgba(0,0,0,.5)] transition-transform hover:scale-110 sm:-left-5"
          >
            <Arrow className="rotate-180" />
          </button>
        )}
        {canRight && (
          <button
            type="button"
            onClick={() => slide(1)}
            aria-label="Ver más atletas y equipos"
            className="absolute -right-3 top-1/2 z-10 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-gold text-ink shadow-[0_10px_30px_rgba(0,0,0,.5)] transition-transform hover:scale-110 sm:-right-5"
          >
            <Arrow />
          </button>
        )}
      </div>

      {items.length === 0 && (
        <p className="py-12 text-center text-steel">
          No hay campañas en esta categoría todavía.
        </p>
      )}

      {/* Aviso de límite de selección */}
      {avisoLimite && (
        <div className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-full bg-white px-5 py-2.5 text-sm font-600 text-ink shadow-xl">
          Hasta {MAX_SELECCION} atletas por aporte, así cada uno recibe un monto que vale la pena.
        </div>
      )}

      {/* Barra flotante "Tu aporte" */}
      {seleccion.length > 0 && !aporteAbierto && (
        <div className="fixed bottom-4 left-1/2 z-40 flex w-[calc(100%-2rem)] max-w-md -translate-x-1/2 items-center gap-3 rounded-full border border-gold/40 bg-ink px-4 py-2.5 shadow-[0_18px_50px_rgba(0,0,0,.6)]">
          <div className="flex -space-x-2">
            {seleccion.map((a) => (
              <AvatarMini key={a.id} athlete={a} />
            ))}
          </div>
          <span className="flex-1 truncate text-sm text-white/85">
            {seleccion.length === 1
              ? "1 atleta elegido"
              : `${seleccion.length} atletas elegidos`}
          </span>
          <button
            type="button"
            onClick={() => setAporteAbierto(true)}
            className="rounded-full bg-gold px-4 py-2 font-display text-[12px] font-700 uppercase tracking-wide text-ink transition-transform hover:-translate-y-0.5"
          >
            Armar mi aporte →
          </button>
          <button
            type="button"
            onClick={() => setSeleccion([])}
            aria-label="Vaciar selección"
            className="text-white/50 hover:text-white"
          >
            ✕
          </button>
        </div>
      )}

      {/* Panel "Tu aporte" */}
      {aporteAbierto && (
        <PanelAporte
          seleccion={seleccion}
          onQuitar={(id) => {
            setSeleccion((prev) => {
              const next = prev.filter((x) => x.id !== id);
              if (next.length === 0) setAporteAbierto(false);
              return next;
            });
          }}
          onCerrar={() => setAporteAbierto(false)}
        />
      )}
    </div>
  );
}

/* ───────────────────────── Tu aporte ───────────────────────── */

const MONTOS_SUGERIDOS = [6000, 15000, 30000];

function PanelAporte({
  seleccion,
  onQuitar,
  onCerrar,
}: {
  seleccion: Athlete[];
  onQuitar: (id: string) => void;
  onCerrar: () => void;
}) {
  const [monto, setMonto] = useState(15000);
  const [custom, setCustom] = useState("");
  /** Atletas cuyo pago ya se abrió en Mercado Pago (pestaña nueva). */
  const [pagados, setPagados] = useState<Set<string>>(new Set());
  const [abriendo, setAbriendo] = useState<string | null>(null);
  // Nombre opcional del hincha: aparece en el muro de cada atleta apoyado.
  const [nombreHincha, setNombreHincha] = useState("");

  const n = seleccion.length;
  const parte = Math.floor(monto / n);
  const { fee, net } = breakdown(parte);
  const minimo = 1000 * n;
  // Apenas se inicia el primer pago, el monto queda congelado: si no,
  // el reparto dejaría de ser en partes iguales.
  const bloqueado = pagados.size > 0;

  function elegirCustom(v: string) {
    setCustom(v);
    const num = parseInt(v.replace(/\D/g, ""), 10);
    if (Number.isFinite(num)) setMonto(num);
  }

  async function pagarAtleta(a: Athlete) {
    if (abriendo || monto < minimo) return;
    setAbriendo(a.id);

    // Evidencia de aceptación de Términos del Donante (igual que el widget).
    void recordAcceptance({
      actorType: "donante",
      context: "donacion",
      docTypes: ["terminos-donante"],
      relatedId: a.slug,
      meta: { amount: parte, kind: "athlete", multi: n },
    });

    // La pestaña se abre YA (dentro del gesto del usuario, si no el
    // bloqueador de pop-ups la mata) y después le ponemos la URL final.
    const tab = window.open("about:blank", "_blank");
    let url: string | null = null;
    if (isSupabaseConfigured) {
      try {
        const supabase = await getSupabase();
        if (supabase) {
          const { data } = await supabase.functions.invoke("mp-create-preference", {
            body: { slug: a.slug, amount: parte, type: "once", donorName: nombreHincha.trim() || undefined },
          });
          url = data?.init_point ?? data?.sandbox_init_point ?? null;
        }
      } catch {
        url = null; // sin MP conectado o error → demo
      }
    }
    if (!url) {
      url = `/gracias?kind=athlete&slug=${encodeURIComponent(a.slug)}&amount=${parte}&type=once`;
    }
    if (tab) tab.location.href = url;
    else window.open(url, "_blank"); // por si el navegador bloqueó la primera

    setPagados((prev) => new Set(prev).add(a.id));
    setAbriendo(null);
  }

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/70 px-4 py-[7vh] backdrop-blur-sm"
      onClick={() => {
        // Con pagos en curso, solo se cierra con la ✕ (evita cierres accidentales).
        if (!bloqueado) onCerrar();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Tu aporte"
        onClick={(e) => e.stopPropagation()}
        className="mx-auto max-w-lg rounded-2xl border border-white/10 bg-[#0d2238] p-6 text-white shadow-[0_40px_120px_rgba(0,0,0,.7)] sm:p-8"
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="eyebrow text-gold">Repartido en partes iguales</p>
            <h3 className="mt-1 font-display text-2xl font-700 uppercase tracking-tight">
              Tu aporte
            </h3>
          </div>
          <button
            type="button"
            onClick={onCerrar}
            aria-label="Cerrar"
            className="rounded-full p-1 text-white/50 hover:text-white"
          >
            <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6" aria-hidden>
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Atletas elegidos */}
        <ul className="mt-5 space-y-2.5">
          {seleccion.map((a) => {
            const sport = getSport(a.sport);
            return (
              <li
                key={a.id}
                className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[.04] px-3 py-2.5"
              >
                <AvatarMini athlete={a} size={40} />
                <div className="min-w-0 flex-1">
                  <div className="truncate font-display text-[15px] font-600 uppercase leading-tight">
                    {a.full_name}
                  </div>
                  <div className="text-[11px] text-white/55">
                    {sport?.label ?? a.sport} · {a.city}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-display text-[14px] font-700 leading-none text-gold">
                    {formatMoney(net)}
                  </div>
                  <div className="mt-0.5 text-[10px] text-white/45">recibe</div>
                </div>
                {!bloqueado && (
                  <button
                    type="button"
                    onClick={() => onQuitar(a.id)}
                    aria-label={`Quitar a ${a.full_name}`}
                    className="ml-1 text-white/40 hover:text-white"
                  >
                    ✕
                  </button>
                )}
              </li>
            );
          })}
        </ul>

        {/* Monto */}
        <div className="mt-6">
          <div className="flex items-baseline justify-between">
            <p className="font-display text-[12px] font-600 uppercase tracking-wide text-white/70">
              Monto total
            </p>
            {bloqueado && (
              <p className="text-[11px] text-gold/90">
                🔒 Fijado al iniciar el primer pago
              </p>
            )}
          </div>
          <div className="mt-2 flex flex-wrap gap-2">
            {MONTOS_SUGERIDOS.map((m) => (
              <button
                key={m}
                type="button"
                disabled={bloqueado}
                onClick={() => {
                  setMonto(m);
                  setCustom("");
                }}
                className={`rounded-full border px-4 py-2 font-display text-sm font-600 transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
                  monto === m && custom === ""
                    ? "border-gold bg-gold text-ink disabled:opacity-70"
                    : "border-white/25 text-white/85 hover:border-gold hover:text-gold"
                }`}
              >
                {formatMoney(m)}
              </button>
            ))}
            <input
              inputMode="numeric"
              placeholder="Otro monto"
              value={custom}
              disabled={bloqueado}
              onChange={(e) => elegirCustom(e.target.value)}
              className="w-32 rounded-full border border-white/25 bg-transparent px-4 py-2 text-sm text-white placeholder:text-white/40 focus:border-gold focus:outline-none disabled:cursor-not-allowed disabled:opacity-40"
            />
          </div>
        </div>

        {/* Desglose transparente */}
        <div className="mt-6 rounded-xl border border-white/10 bg-white/[.04] p-4 text-[13px]">
          <div className="flex justify-between text-white/80">
            <span>
              Cada atleta recibe{" "}
              <strong className="text-white">{formatMoney(net)}</strong>
            </span>
            <span className="text-white/55">× {n}</span>
          </div>
          <div className="mt-1.5 flex justify-between text-white/55">
            <span>Granito (7% por atleta)</span>
            <span>{formatMoney(fee * n)}</span>
          </div>
          <div className="mt-2 border-t border-white/10 pt-2 flex justify-between font-display font-700">
            <span>Total</span>
            <span className="text-gold">{formatMoney(parte * n)}</span>
          </div>
        </div>

        {monto < minimo && (
          <p className="mt-3 text-[12px] text-red-300">
            El mínimo es {formatMoney(minimo)} ({formatMoney(1000)} por atleta).
          </p>
        )}

        <p className="mt-4 text-[12px] leading-relaxed text-white/50">
          El pago se hace por Mercado Pago y va{" "}
          <strong className="text-white/75">directo a la cuenta de cada atleta</strong>{" "}
          — Granito nunca toca la plata. Cada pago se abre en una{" "}
          <strong className="text-white/75">pestaña nueva</strong>; esta ventana te
          espera para el siguiente ({n} en total).
        </p>

        {/* Nombre para el muro de hinchas: un solo campo, vale para los 3 */}
        <input
          type="text"
          value={nombreHincha}
          onChange={(e) => setNombreHincha(e.target.value)}
          placeholder="Tu nombre (opcional, aparece en el muro de cada atleta)"
          autoComplete="name"
          maxLength={60}
          className="mt-4 w-full rounded-lg px-3 py-2.5 text-[14px] text-white outline-none placeholder:text-white/35"
          style={{ background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.12)" }}
        />

        {/* CTA por atleta */}
        <div className="mt-5 space-y-2">
          {seleccion.map((a, i) => {
            const hecho = pagados.has(a.id);
            const cargando = abriendo === a.id;
            return (
              <button
                key={a.id}
                type="button"
                onClick={() => pagarAtleta(a)}
                disabled={cargando || monto < minimo}
                className={`flex w-full items-center justify-between rounded-md px-4 py-2.5 font-display text-[13px] font-700 uppercase tracking-wide transition-transform disabled:cursor-not-allowed ${
                  hecho
                    ? "border border-emerald-400/60 bg-emerald-400/10 text-emerald-300 hover:-translate-y-0.5"
                    : "bg-gold text-ink hover:-translate-y-0.5 disabled:opacity-40"
                }`}
              >
                <span>
                  {hecho ? "✓ " : `${i + 1}/${n} · `}
                  {hecho
                    ? `Pago a ${a.full_name.split(" ")[0]} abierto`
                    : `Aportar a ${a.full_name.split(" ")[0]}`}
                </span>
                <span>
                  {cargando
                    ? "Abriendo…"
                    : hecho
                      ? "Reabrir ↗"
                      : `${formatMoney(parte)} →`}
                </span>
              </button>
            );
          })}
        </div>

        {pagados.size === n && (
          <p className="mt-4 rounded-lg border border-emerald-400/40 bg-emerald-400/10 px-4 py-3 text-center text-[13px] text-emerald-200">
            ¡Gracias por tu granito! 🙌 Confirmá cada pago en las pestañas de
            Mercado Pago que se abrieron.
          </p>
        )}
      </div>
    </div>
  );
}

function AvatarMini({ athlete, size = 32 }: { athlete: Athlete; size?: number }) {
  const sport = getSport(athlete.sport);
  return athlete.photo_url ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={asset(athlete.photo_url)}
      alt=""
      width={size}
      height={size}
      className="rounded-full border-2 border-ink object-cover"
      style={{ width: size, height: size }}
    />
  ) : (
    <span
      className="flex items-center justify-center rounded-full border-2 border-ink font-display font-700 text-white"
      style={{
        width: size,
        height: size,
        background: sport?.color ?? "#1E6E8C",
        fontSize: size * 0.45,
      }}
      aria-hidden
    >
      {athlete.full_name.charAt(0)}
    </span>
  );
}

function Arrow({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      className={`h-6 w-6 ${className}`}
      aria-hidden
    >
      <path
        d="M9 5l7 7-7 7"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function Chip({
  label,
  color,
  team,
  active,
  onClick,
}: {
  label: string;
  color?: string;
  team?: boolean;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex items-center gap-2 rounded-full border px-4 py-1.5 font-display text-sm font-500 uppercase tracking-wide transition-colors ${
        active
          ? "border-ink bg-ink text-white"
          : "border-line bg-paper text-steel hover:border-steel hover:text-ink"
      }`}
    >
      {color && (
        <span
          className="h-2.5 w-2.5 rounded-full"
          style={{ backgroundColor: color }}
          aria-hidden
        />
      )}
      {label}
      {team && (
        <span className="rounded-sm bg-gold/20 px-1 text-[0.6rem] font-700 text-gold">
          EQUIPO
        </span>
      )}
    </button>
  );
}
