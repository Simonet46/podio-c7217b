"use client";

import { useEffect, useMemo, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSport } from "@/config/sports";
import { formatMoney } from "@/lib/money";

/* ────────────────────────────────────────────────────────────────────────
   Dashboard del admin: cómo está funcionando la plataforma.
   - Plata: sale de `donations` y `team_pledges` (ya cargadas por el admin).
   - Tráfico: sale de la RPC `dashboard_traffic(p_days)` (tabla page_views).
   Un solo rango de días gobierna todo.
   ──────────────────────────────────────────────────────────────────────── */

const C = {
  surface: "#0d2238",
  gold: "#C9A227",
  celeste: "#6CB4E4",
  greenBright: "#22c55e",
  redBright: "#ff5a6e",
  border: "rgba(255,255,255,.07)",
  borderSoft: "rgba(255,255,255,.04)",
  txtDim: "rgba(255,255,255,.5)",
  txtFaint: "rgba(255,255,255,.45)",
  grid: "rgba(255,255,255,.06)",
};

// Tipos estructurales: lo mínimo que el dashboard necesita de cada fila.
type Donation = { athlete_id: string; amount: number; net_amount: number | null; type: string; status: string; donor_email: string | null; created_at: string };
type Athlete = { id: string; slug: string; full_name: string; sport: string; verified: boolean | null; mp_connected: boolean | null };
type Team = { id: string; team_name: string; slug: string | null; status: string; active: boolean | null; goal_amount: number | null; fundraising_start: string | null; fundraising_end: string | null };
type Pledge = { team_id: string; amount: number; status: string; created_at: string };

type Traffic = {
  days: number;
  daily: { d: string; views: number; visitors: number; mobile: number; desktop: number; tablet: number }[];
  totals: { views: number; visitors: number; mobile: number; desktop: number; tablet: number };
  sources: { source: string; views: number; visitors: number }[];
  kinds: { kind: string; views: number }[];
  athletes: { slug: string; views: number; visitors: number; apoyar: number; checkout: number }[];
  teams: { slug: string; views: number; visitors: number; apoyar: number; checkout: number }[];
  paths: { path: string; views: number }[];
  funnel: { perfil: number; apoyar: number; checkout: number; gracias: number };
};

const RANGOS = [7, 30, 90] as const;

/* ── Utilidades ── */
const DAY = 86_400_000;
function startOfRange(days: number): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - (days - 1));
  return d;
}
function dayKey(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function shortDay(key: string): string {
  const [, m, d] = key.split("-");
  return `${Number(d)}/${Number(m)}`;
}
function pct(n: number, d: number): string {
  if (!d) return "—";
  return `${Math.round((n / d) * 100)}%`;
}
function n(v: number): string {
  return new Intl.NumberFormat("es-AR").format(v);
}
const SOURCE_LABEL: Record<string, string> = {
  instagram: "Instagram", whatsapp: "WhatsApp", facebook: "Facebook", google: "Google", tiktok: "TikTok",
  x: "X / Twitter", linkedin: "LinkedIn", directo: "Directo / link", otro: "Otros sitios",
};
const KIND_LABEL: Record<string, string> = {
  home: "Home", atleta: "Perfiles de atletas", equipo: "Proyectos deportivos", postulacion: "Postulación",
  empresas: "Empresas", legal: "Legal", info: "Institucional", gracias: "Gracias", otro: "Otras",
};

/* ── Piezas visuales ── */
function Card({ title, sub, right, children, span }: { title: string; sub?: string; right?: React.ReactNode; children: React.ReactNode; span?: number }) {
  return (
    <section style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: "18px 22px 20px", gridColumn: span ? `span ${span}` : undefined, minWidth: 0 }}>
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h2 className="m-0 font-display text-[17px] font-600 leading-tight">{title}</h2>
          {sub && <div className="mt-0.5 text-[12px]" style={{ color: C.txtFaint }}>{sub}</div>}
        </div>
        {right}
      </div>
      {children}
    </section>
  );
}

function Kpi({ label, value, sub, color }: { label: string; value: string; sub: string; color: string }) {
  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderTop: `3px solid ${color}`, borderRadius: 14, padding: "16px 18px", minWidth: 0 }}>
      <div className="text-[11px] font-600 uppercase tracking-[.05em]" style={{ color: C.txtDim }}>{label}</div>
      <div className="mt-2 truncate font-display text-[30px] font-700 leading-none">{value}</div>
      <div className="mt-1.5 text-[12px]" style={{ color: C.txtFaint }}>{sub}</div>
    </div>
  );
}

/** Barras verticales de una serie, finas, con tooltip por barra y etiqueta
 *  directa solo en el máximo. Un solo eje. */
function Bars({ data, color, fmt, height = 150 }: { data: { k: string; v: number }[]; color: string; fmt: (v: number) => string; height?: number }) {
  const W = 600, H = height, padL = 6, padB = 20, padT = 14;
  const max = Math.max(1, ...data.map((d) => d.v));
  const iw = W - padL * 2;
  const bw = Math.max(2, Math.min(28, (iw / Math.max(1, data.length)) - 2));
  const step = iw / Math.max(1, data.length);
  const maxIdx = data.findIndex((d) => d.v === max);
  const every = data.length > 20 ? Math.ceil(data.length / 10) : data.length > 10 ? 2 : 1;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} role="img" aria-label="Gráfico de barras">
      {[0.5, 1].map((f) => (
        <line key={f} x1={padL} x2={W - padL} y1={padT + (H - padT - padB) * (1 - f)} y2={padT + (H - padT - padB) * (1 - f)} stroke={C.grid} strokeWidth={1} />
      ))}
      <line x1={padL} x2={W - padL} y1={H - padB} y2={H - padB} stroke="rgba(255,255,255,.18)" strokeWidth={1} />
      {data.map((d, i) => {
        const h = ((H - padT - padB) * d.v) / max;
        const x = padL + i * step + (step - bw) / 2;
        const y = H - padB - h;
        return (
          <g key={d.k}>
            <rect x={padL + i * step} y={padT} width={step} height={H - padT - padB} fill="transparent">
              <title>{`${d.k}: ${fmt(d.v)}`}</title>
            </rect>
            {d.v > 0 && <rect x={x} y={y} width={bw} height={h} rx={3} fill={color} style={{ pointerEvents: "none" }} />}
            {i === maxIdx && d.v > 0 && (
              <text x={x + bw / 2} y={y - 4} textAnchor="middle" fontSize={11} fill="rgba(255,255,255,.85)" style={{ pointerEvents: "none" }}>{fmt(d.v)}</text>
            )}
            {i % every === 0 && (
              <text x={x + bw / 2} y={H - 6} textAnchor="middle" fontSize={10} fill={C.txtFaint}>{d.k}</text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

/** Línea de una serie con puntos y tooltip por día. */
function Line({ data, color, fmt, height = 150 }: { data: { k: string; v: number }[]; color: string; fmt: (v: number) => string; height?: number }) {
  const W = 600, H = height, padL = 6, padB = 20, padT = 14;
  const max = Math.max(1, ...data.map((d) => d.v));
  const iw = W - padL * 2;
  const step = data.length > 1 ? iw / (data.length - 1) : 0;
  const pts = data.map((d, i) => ({ x: padL + i * step, y: H - padB - ((H - padT - padB) * d.v) / max, ...d }));
  const path = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
  const maxIdx = data.findIndex((d) => d.v === max);
  const every = data.length > 20 ? Math.ceil(data.length / 10) : data.length > 10 ? 2 : 1;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} role="img" aria-label="Gráfico de línea">
      {[0.5, 1].map((f) => (
        <line key={f} x1={padL} x2={W - padL} y1={padT + (H - padT - padB) * (1 - f)} y2={padT + (H - padT - padB) * (1 - f)} stroke={C.grid} strokeWidth={1} />
      ))}
      <line x1={padL} x2={W - padL} y1={H - padB} y2={H - padB} stroke="rgba(255,255,255,.18)" strokeWidth={1} />
      {data.length > 1 && <path d={path} fill="none" stroke={color} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />}
      {pts.map((p, i) => (
        <g key={p.k}>
          <rect x={p.x - step / 2} y={padT} width={Math.max(step, 8)} height={H - padT - padB} fill="transparent">
            <title>{`${p.k}: ${fmt(p.v)}`}</title>
          </rect>
          <circle cx={p.x} cy={p.y} r={p.v > 0 ? 3 : 0} fill={color} stroke={C.surface} strokeWidth={2} style={{ pointerEvents: "none" }} />
          {i === maxIdx && p.v > 0 && (
            <text x={Math.min(Math.max(p.x, 20), W - 20)} y={p.y - 8} textAnchor="middle" fontSize={11} fill="rgba(255,255,255,.85)" style={{ pointerEvents: "none" }}>{fmt(p.v)}</text>
          )}
          {i % every === 0 && <text x={p.x} y={H - 6} textAnchor={i === 0 ? "start" : i === data.length - 1 ? "end" : "middle"} fontSize={10} fill={C.txtFaint}>{p.k}</text>}
        </g>
      ))}
    </svg>
  );
}

/** Barras horizontales con etiqueta y valor en texto (identidad por texto, no por color). */
function HBars({ rows, color, fmt }: { rows: { label: string; v: number; sub?: string }[]; color: string; fmt: (v: number) => string }) {
  const max = Math.max(1, ...rows.map((r) => r.v));
  if (rows.length === 0) return <Empty />;
  return (
    <div className="flex flex-col gap-2">
      {rows.map((r) => (
        <div key={r.label} className="grid items-center gap-3" style={{ gridTemplateColumns: "150px 1fr 70px" }}>
          <span className="truncate text-[13px]" title={r.label}>{r.label}{r.sub && <span style={{ color: C.txtFaint }}> · {r.sub}</span>}</span>
          <div style={{ height: 10, background: C.borderSoft, borderRadius: 4, overflow: "hidden" }} title={`${r.label}: ${fmt(r.v)}`}>
            <div style={{ width: `${(r.v / max) * 100}%`, height: "100%", background: color, borderRadius: 4 }} />
          </div>
          <span className="text-right text-[13px] font-600">{fmt(r.v)}</span>
        </div>
      ))}
    </div>
  );
}

function Empty({ text = "Todavía no hay datos en este período." }: { text?: string }) {
  return <div className="py-6 text-center text-[13px]" style={{ color: C.txtFaint }}>{text}</div>;
}

function Th({ children, right }: { children: React.ReactNode; right?: boolean }) {
  return <th className="pb-2 text-[11px] font-600 uppercase tracking-[.05em]" style={{ color: C.txtFaint, textAlign: right ? "right" : "left", fontWeight: 600 }}>{children}</th>;
}
function Td({ children, right, dim, strong }: { children: React.ReactNode; right?: boolean; dim?: boolean; strong?: boolean }) {
  return <td className={`py-2 text-[13px] ${strong ? "font-600" : ""}`} style={{ textAlign: right ? "right" : "left", color: dim ? C.txtDim : undefined, borderTop: `1px solid ${C.borderSoft}` }}>{children}</td>;
}

/* ── El dashboard ── */
export function DashboardSection({
  supa,
  donations,
  athletes,
  teams,
  pledges,
}: {
  supa: SupabaseClient | null;
  donations: Donation[];
  athletes: Athlete[];
  teams: Team[];
  pledges: Pledge[];
}) {
  const [days, setDays] = useState<(typeof RANGOS)[number]>(30);
  const [traffic, setTraffic] = useState<Traffic | null>(null);
  const [trafficErr, setTrafficErr] = useState<string | null>(null);
  const [loadingT, setLoadingT] = useState(false);

  useEffect(() => {
    let alive = true;
    if (!supa) return;
    setLoadingT(true);
    setTrafficErr(null);
    supa.rpc("dashboard_traffic", { p_days: days }).then(({ data, error }) => {
      if (!alive) return;
      setLoadingT(false);
      if (error) { setTrafficErr(error.message); return; }
      setTraffic(data as Traffic);
    });
    return () => { alive = false; };
  }, [supa, days]);

  const from = useMemo(() => startOfRange(days), [days]);
  const fromPrev = useMemo(() => new Date(from.getTime() - days * DAY), [from, days]);

  /* Plata en el período (solo aportes confirmados). */
  const money = useMemo(() => {
    const inRange = donations.filter((d) => d.status === "completed" && new Date(d.created_at) >= from);
    const prev = donations.filter((d) => d.status === "completed" && new Date(d.created_at) >= fromPrev && new Date(d.created_at) < from);
    const sum = (xs: Donation[]) => xs.reduce((s, d) => s + Number(d.amount), 0);
    const net = (xs: Donation[]) => xs.reduce((s, d) => s + Number(d.net_amount ?? Number(d.amount) * 0.93), 0);
    const total = sum(inRange), totalPrev = sum(prev);
    const byDay = new Map<string, number>();
    for (let i = 0; i < days; i++) byDay.set(dayKey(new Date(from.getTime() + i * DAY).toISOString()), 0);
    inRange.forEach((d) => { const k = dayKey(d.created_at); byDay.set(k, (byDay.get(k) ?? 0) + Number(d.amount)); });
    const byAthlete = new Map<string, { count: number; amount: number }>();
    inRange.forEach((d) => { const cur = byAthlete.get(d.athlete_id) ?? { count: 0, amount: 0 }; byAthlete.set(d.athlete_id, { count: cur.count + 1, amount: cur.amount + Number(d.amount) }); });
    const bySport = new Map<string, number>();
    inRange.forEach((d) => { const a = athletes.find((x) => x.id === d.athlete_id); const k = a ? (getSport(a.sport)?.label ?? a.sport) : "—"; bySport.set(k, (bySport.get(k) ?? 0) + Number(d.amount)); });
    return {
      total, totalPrev, net: net(inRange), fee: total - net(inRange),
      count: inRange.length, countPrev: prev.length,
      donors: new Set(inRange.map((d) => d.donor_email).filter(Boolean)).size,
      monthly: inRange.filter((d) => d.type === "monthly").length,
      ticket: inRange.length ? total / inRange.length : 0,
      daily: [...byDay.entries()].map(([k, v]) => ({ k: shortDay(k), v })),
      byAthlete, bySport: [...bySport.entries()].map(([label, v]) => ({ label, v })).sort((a, b) => b.v - a.v).slice(0, 8),
      allTime: sum(donations.filter((d) => d.status === "completed")),
    };
  }, [donations, athletes, from, fromPrev, days]);

  /* Proyectos deportivos: avance y días restantes. */
  const campaigns = useMemo(() => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    return teams
      .filter((t) => t.status === "approved")
      .map((t) => {
        const ps = pledges.filter((p) => p.team_id === t.id && p.status !== "rejected");
        const comprometido = ps.reduce((s, p) => s + Number(p.amount), 0);
        const pagado = ps.filter((p) => p.status === "completed").reduce((s, p) => s + Number(p.amount), 0);
        const goal = Number(t.goal_amount ?? 0);
        const end = t.fundraising_end ? new Date(t.fundraising_end + "T00:00:00") : null;
        const daysLeft = end ? Math.ceil((end.getTime() - today.getTime()) / DAY) : null;
        const tv = traffic?.teams.find((x) => x.slug === t.slug);
        return { t, comprometido, pagado, goal, pct: goal > 0 ? Math.min(100, (comprometido / goal) * 100) : 0, daysLeft, views: tv?.views ?? 0, apoyos: ps.length };
      })
      .sort((a, b) => {
        const da = a.daysLeft ?? 9999, db = b.daysLeft ?? 9999;
        if ((a.t.active ? 0 : 1) !== (b.t.active ? 0 : 1)) return a.t.active ? -1 : 1;
        return da - db;
      });
  }, [teams, pledges, traffic]);

  /* Ranking de atletas: visitas + aportes + conversión. */
  const ranking = useMemo(() => {
    const bySlug = new Map((traffic?.athletes ?? []).map((a) => [a.slug, a]));
    return athletes
      .map((a) => {
        const tv = bySlug.get(a.slug);
        const m = money.byAthlete.get(a.id) ?? { count: 0, amount: 0 };
        return { a, views: tv?.views ?? 0, visitors: tv?.visitors ?? 0, apoyar: tv?.apoyar ?? 0, checkout: tv?.checkout ?? 0, count: m.count, amount: m.amount };
      })
      .filter((r) => r.views > 0 || r.count > 0)
      .sort((x, y) => y.views - x.views || y.amount - x.amount)
      .slice(0, 15);
  }, [athletes, traffic, money.byAthlete]);

  const t = traffic?.totals;
  const devTotal = t ? t.mobile + t.desktop + t.tablet : 0;
  const deltaTxt = (cur: number, prev: number) => prev === 0 ? (cur > 0 ? "nuevo" : "sin movimiento") : `${cur >= prev ? "+" : ""}${Math.round(((cur - prev) / prev) * 100)}% vs. período anterior`;

  return (
    <div className="flex flex-col gap-5">
      {/* Rango */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-[13px]" style={{ color: C.txtDim }}>
          Cómo está funcionando la plataforma. Los números de plata son aportes <strong className="text-white/80">confirmados</strong>; el tráfico lo mide el sitio sin cookies.
        </div>
        <div className="flex gap-1.5">
          {RANGOS.map((r) => (
            <button key={r} onClick={() => setDays(r)} className="rounded-full px-3.5 py-1.5 font-display text-[12px] font-600 uppercase tracking-[.04em]" style={{ background: days === r ? C.gold : "rgba(255,255,255,.06)", color: days === r ? "#0A1A2F" : "rgba(255,255,255,.8)", border: "none", cursor: "pointer" }}>
              {r} días
            </button>
          ))}
        </div>
      </div>

      {/* KPIs */}
      <div className="bo-kpis" style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14 }}>
        <Kpi label="Recaudado" value={formatMoney(money.total)} sub={deltaTxt(money.total, money.totalPrev)} color={C.gold} />
        <Kpi label="Aportes" value={n(money.count)} sub={`ticket promedio ${formatMoney(money.ticket)} · ${money.monthly} mensuales`} color={C.gold} />
        <Kpi label="Donantes" value={n(money.donors)} sub={`personas distintas · neto a atletas ${formatMoney(money.net)}`} color={C.greenBright} />
        <Kpi label="Comisión Granito" value={formatMoney(money.fee)} sub={`histórico recaudado ${formatMoney(money.allTime)}`} color={C.gold} />
        <Kpi label="Visitas" value={t ? n(t.views) : loadingT ? "…" : "—"} sub={t ? `${n(t.visitors)} visitantes únicos aprox.` : trafficErr ? "sin acceso al tráfico" : "midiendo…"} color={C.celeste} />
        <Kpi label="Desde celular" value={t && devTotal ? pct(t.mobile, devTotal) : "—"} sub={t ? `${pct(t.desktop, devTotal)} computadora · ${pct(t.tablet, devTotal)} tablet` : "—"} color={C.celeste} />
        <Kpi label="Perfiles → aporte" value={traffic ? pct(money.count, traffic.funnel.perfil) : "—"} sub={traffic ? `${n(traffic.funnel.perfil)} visitas a perfiles` : "—"} color={C.celeste} />
        <Kpi label="Atletas publicados" value={n(athletes.filter((a) => a.verified).length)} sub={`${athletes.filter((a) => !a.mp_connected).length} sin Mercado Pago · ${campaigns.filter((c) => c.t.active).length} proyectos activos`} color={C.greenBright} />
      </div>

      {trafficErr && (
        <div className="rounded-xl px-4 py-3 text-[13px]" style={{ background: "rgba(223,0,36,.1)", border: "1px solid rgba(223,0,36,.3)", color: C.redBright }}>
          No se pudo leer el tráfico: {trafficErr}
        </div>
      )}

      {/* Evolución */}
      <div className="bo-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Card title="Aportes por día" sub={`Confirmados, últimos ${days} días`}>
          {money.count > 0 ? <Bars data={money.daily} color={C.gold} fmt={(v) => formatMoney(v)} /> : <Empty text="Sin aportes confirmados en este período." />}
        </Card>
        <Card title="Visitas por día" sub={`Vistas de página, últimos ${days} días`}>
          {traffic && traffic.totals.views > 0
            ? <Line data={traffic.daily.map((d) => ({ k: shortDay(d.d), v: d.views }))} color={C.celeste} fmt={(v) => `${n(v)} visitas`} />
            : <Empty text={loadingT ? "Cargando…" : "El medidor empieza a contar desde que se publicó. Volvé en unos días."} />}
        </Card>
      </div>

      {/* Atletas */}
      <Card title="Atletas: visitas y aportes" sub="Qué perfiles se visitan más y cuántos de esos visitantes terminan aportando">
        {ranking.length === 0 ? <Empty /> : (
          <div style={{ overflowX: "auto" }}>
            <table className="w-full border-collapse" style={{ minWidth: 720 }}>
              <thead><tr>
                <Th>Atleta</Th><Th>Deporte</Th><Th right>Visitas</Th><Th right>Visitantes</Th><Th right>Clic apoyar</Th><Th right>Al checkout</Th><Th right>Aportes</Th><Th right>Recaudado</Th><Th right>Conversión</Th>
              </tr></thead>
              <tbody>
                {ranking.map((r) => (
                  <tr key={r.a.id}>
                    <Td strong>{r.a.full_name}</Td>
                    <Td dim>{getSport(r.a.sport)?.label ?? r.a.sport}</Td>
                    <Td right>{n(r.views)}</Td>
                    <Td right dim>{n(r.visitors)}</Td>
                    <Td right>{n(r.apoyar)}</Td>
                    <Td right dim>{n(r.checkout)}</Td>
                    <Td right>{n(r.count)}</Td>
                    <Td right strong>{formatMoney(r.amount)}</Td>
                    <Td right dim>{r.views ? pct(r.count, r.views) : "—"}</Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Proyectos deportivos */}
      <Card title="Proyectos deportivos" sub="Avance de cada campaña y cuánto tiempo le queda">
        {campaigns.length === 0 ? <Empty text="No hay proyectos aprobados." /> : (
          <div className="flex flex-col gap-3">
            {campaigns.map((c) => {
              const urgente = c.daysLeft !== null && c.daysLeft >= 0 && c.daysLeft <= 7;
              const terminado = c.daysLeft !== null && c.daysLeft < 0;
              return (
                <div key={c.t.id} className="grid items-center gap-4" style={{ gridTemplateColumns: "1.4fr 2fr 1fr 1fr", padding: "10px 0", borderTop: `1px solid ${C.borderSoft}` }}>
                  <div className="min-w-0">
                    <div className="truncate text-[14px] font-600">{c.t.team_name}</div>
                    <div className="text-[12px]" style={{ color: C.txtFaint }}>
                      {c.t.active ? "Activa" : "Pausada"} · {n(c.views)} visitas · {c.apoyos} {c.apoyos === 1 ? "apoyo" : "apoyos"}
                    </div>
                  </div>
                  <div>
                    <div className="mb-1 flex justify-between text-[12px]">
                      <span>{formatMoney(c.comprometido)} comprometido <span style={{ color: C.txtFaint }}>· {formatMoney(c.pagado)} pagado</span></span>
                      <span style={{ color: C.txtFaint }}>{c.goal > 0 ? `objetivo ${formatMoney(c.goal)}` : "sin objetivo"}</span>
                    </div>
                    <div style={{ height: 10, background: C.borderSoft, borderRadius: 4, overflow: "hidden" }} title={`${Math.round(c.pct)}% del objetivo`}>
                      <div style={{ width: `${c.pct}%`, height: "100%", background: C.gold, borderRadius: 4 }} />
                    </div>
                  </div>
                  <div className="text-right font-display text-[22px] font-700">{c.goal > 0 ? `${Math.round(c.pct)}%` : "—"}</div>
                  <div className="text-right">
                    {c.daysLeft === null ? (
                      <span className="text-[13px]" style={{ color: C.txtFaint }}>Sin fecha de cierre</span>
                    ) : terminado ? (
                      <span className="text-[13px]" style={{ color: C.txtFaint }}>Terminó hace {n(-c.daysLeft)} {-c.daysLeft === 1 ? "día" : "días"}</span>
                    ) : (
                      <span className="rounded-full px-2.5 py-1 font-display text-[11px] font-600 uppercase tracking-[.04em]" style={{ background: urgente ? "rgba(223,0,36,.14)" : "rgba(108,180,228,.12)", color: urgente ? C.redBright : C.celeste }}>
                        {c.daysLeft === 0 ? "Cierra hoy" : `${c.daysLeft} ${c.daysLeft === 1 ? "día" : "días"}`}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* Tráfico: origen, dispositivo, secciones, páginas */}
      <div className="bo-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
        <Card title="De dónde llegan" sub="Por referrer o utm_source. WhatsApp e Instagram suelen no mandar referrer: usá links con ?utm_source=whatsapp">
          {traffic ? <HBars rows={traffic.sources.map((s) => ({ label: SOURCE_LABEL[s.source] ?? s.source, v: s.views, sub: `${n(s.visitors)} pers.` }))} color={C.celeste} fmt={(v) => n(v)} /> : <Empty text={loadingT ? "Cargando…" : "Sin datos todavía."} />}
        </Card>
        <Card title="Qué secciones se visitan" sub="Vistas por tipo de página">
          {traffic ? <HBars rows={traffic.kinds.map((k) => ({ label: KIND_LABEL[k.kind] ?? k.kind, v: k.views }))} color={C.celeste} fmt={(v) => n(v)} /> : <Empty text={loadingT ? "Cargando…" : "Sin datos todavía."} />}
        </Card>
        <Card title="Embudo de aporte" sub="Del perfil al pago confirmado, en el período">
          {traffic ? (
            <div className="grid grid-cols-4 gap-2">
              {[
                { label: "Ven un perfil", v: traffic.funnel.perfil },
                { label: "Tocan apoyar", v: traffic.funnel.apoyar },
                { label: "Llegan al checkout", v: traffic.funnel.checkout },
                { label: "Pagan", v: money.count },
              ].map((s, i, arr) => (
                <div key={s.label} className="rounded-xl p-3" style={{ background: "rgba(255,255,255,.04)", border: `1px solid ${C.border}` }}>
                  <div className="text-[11px] uppercase tracking-[.04em]" style={{ color: C.txtFaint }}>{s.label}</div>
                  <div className="mt-1 font-display text-[24px] font-700 leading-none">{n(s.v)}</div>
                  <div className="mt-1 text-[11px]" style={{ color: C.txtFaint }}>{i === 0 ? "100%" : `${pct(s.v, arr[0].v)} del total`}</div>
                </div>
              ))}
            </div>
          ) : <Empty text={loadingT ? "Cargando…" : "Sin datos todavía."} />}
        </Card>
        <Card title="Aportes por deporte" sub="Recaudado confirmado en el período">
          {money.bySport.length ? <HBars rows={money.bySport} color={C.gold} fmt={(v) => formatMoney(v)} /> : <Empty text="Sin aportes en este período." />}
        </Card>
      </div>

      <Card title="Páginas más vistas" sub="Rutas con más vistas en el período">
        {traffic && traffic.paths.length ? (
          <table className="w-full border-collapse">
            <thead><tr><Th>Ruta</Th><Th right>Vistas</Th></tr></thead>
            <tbody>{traffic.paths.map((p) => <tr key={p.path}><Td><span className="font-mono text-[12px]">{p.path}</span></Td><Td right strong>{n(p.views)}</Td></tr>)}</tbody>
          </table>
        ) : <Empty text={loadingT ? "Cargando…" : "Sin datos todavía."} />}
      </Card>
    </div>
  );
}
