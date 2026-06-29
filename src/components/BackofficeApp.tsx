"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { SPORT_LIST, getSport } from "@/config/sports";
import { formatMoney } from "@/lib/money";
import { supporterCount } from "@/lib/supporters";

// ── Cliente Supabase del navegador (singleton, mantiene sesión) ──────────
const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SB_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
let _client: SupabaseClient | null = null;
function sb(): SupabaseClient | null {
  if (!SB_URL || !SB_ANON) return null;
  if (!_client) _client = createClient(SB_URL, SB_ANON);
  return _client;
}

type Application = {
  id: string;
  full_name: string;
  sport: string;
  discipline: string | null;
  location: string | null;
  email: string;
  age: number | null;
  next_competition: string | null;
  media_url: string | null;
  photo_url: string | null;
  photo_secondary_url: string | null;
  payment_link: string | null;
  payment_mp: string | null;
  payment_paypal: string | null;
  achievements: string | null;
  needs: string | null;
  socials: string | null;
  status: string;
  mp_connected: boolean | null;
  created_at: string;
  athlete_id: string | null;
};

type AthleteRow = {
  id: string;
  slug: string;
  full_name: string;
  sport: string;
  city: string | null;
  province: string | null;
  raised_amount: number | null;
  verified: boolean | null;
  mp_connected: boolean | null;
};

type TeamApp = {
  id: string;
  team_name: string;
  sport: string;
  competition: string | null;
  fundraising_start: string | null;
  fundraising_end: string | null;
  contact_name: string | null;
  email: string;
  notes: string | null;
  status: string;
  created_at: string;
};

type Phase = "loading" | "noenv" | "login" | "denied" | "ready";
type StatusFilter = "pending" | "approved" | "rejected";
type Section =
  | "Resumen"
  | "Postulaciones"
  | "Atletas"
  | "Aportes"
  | "Pagos"
  | "Hinchas"
  | "Empresas"
  | "Ajustes";

type Draft = {
  appId: string;
  slug: string;
  full_name: string;
  first_name: string;
  sport: string;
  discipline: string;
  city: string;
  province: string;
  bio: string;
  goal_amount: string;
  scope: "la2028" | "otros";
  next_competition: string;
  photo_url: string | null;
  photo_secondary_url: string | null;
  socials: string;
  payment_mp: string;
  payment_paypal: string;
  stats: [string, string][];
  fund_items: [string, string][];
};

// ── Tokens del diseño (dark backoffice) ─────────────────────────────────
const C = {
  bg: "#081320",
  sidebar: "#0a1828",
  surface: "#0d2238",
  surface2: "#0f2034",
  gold: "#C9A227",
  goldHover: "#dcb433",
  ink: "#0A1A2F",
  green: "#009F3D",
  greenBright: "#22c55e",
  red: "#DF0024",
  redBright: "#ff5a6e",
  blue: "#0072CE",
  celeste: "#6CB4E4",
  border: "rgba(255,255,255,.07)",
  borderSoft: "rgba(255,255,255,.04)",
  txtDim: "rgba(255,255,255,.5)",
  txtFaint: "rgba(255,255,255,.45)",
};

const inputDark: React.CSSProperties = {
  width: "100%",
  borderRadius: 9,
  background: C.sidebar,
  border: "1px solid rgba(255,255,255,.1)",
  padding: "10px 13px",
  fontSize: 14,
  color: "#fff",
  outline: "none",
};

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function initialsOf(name: string): string {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

/** Color del deporte por su etiqueta (postulaciones guardan el label). */
function sportColorByLabel(label: string): string {
  return SPORT_LIST.find((s) => s.label === label)?.color ?? C.celeste;
}

function buildDraft(app: Application): Draft {
  const parts = (app.location ?? "").split(/[/,]/).map((t) => t.trim()).filter(Boolean);
  const sportKey = SPORT_LIST.find((s) => s.label === app.sport)?.key ?? "";
  const bio = [app.achievements, app.needs].filter(Boolean).join("\n\n");
  return {
    appId: app.id,
    slug: slugify(app.full_name),
    full_name: app.full_name,
    first_name: app.full_name.split(" ")[0] ?? app.full_name,
    sport: sportKey,
    discipline: app.discipline ?? "",
    city: parts[0] ?? "",
    province: parts[1] ?? parts[0] ?? "",
    bio,
    goal_amount: "10000",
    scope: "la2028",
    next_competition: app.next_competition ?? "",
    photo_url: app.photo_url,
    photo_secondary_url: app.photo_secondary_url,
    socials: app.socials ?? "",
    payment_mp: app.payment_mp ?? "",
    payment_paypal: app.payment_paypal ?? "",
    stats: [["", ""], ["", ""], ["", ""]],
    fund_items: [["", ""], ["", ""], ["", ""]],
  };
}

// ── Datos de ejemplo (secciones sin fuente real todavía) ────────────────
const DEMO_AVISO = "Datos de ejemplo — esta sección todavía no está conectada.";

const DEMO_AportesKpis = [
  { label: "Recaudado en junio", value: "$4.13M", sub: "1.284 aportes" },
  { label: "Ticket promedio", value: "$3.215", sub: "+4% vs. mayo" },
  { label: "Aportes recurrentes", value: "78%", sub: "del total mensual" },
];
const DEMO_Aportes = [
  { fan: "Carla Méndez", ath: "Lucía Ferrari", color: "#0072CE", amount: "$5.000", method: "Mercado Pago", date: "25 jun · 14:32", status: "Acreditado" },
  { fan: "Nicolás Pérez", ath: "Valentina Sosa", color: "#3E8FD0", amount: "$3.000", method: "Tarjeta", date: "25 jun · 12:10", status: "Acreditado" },
  { fan: "Sofía Robles", ath: "Joaquín Vega", color: "#F4C300", amount: "$10.000", method: "Mercado Pago", date: "25 jun · 09:48", status: "Acreditado" },
  { fan: "Martín Gómez", ath: "Mateo Ríos", color: "#DF0024", amount: "$2.000", method: "Tarjeta", date: "24 jun · 21:05", status: "Pendiente" },
  { fan: "Julieta Faraldo", ath: "Brisa Medina", color: "#7A4DD0", amount: "$7.500", method: "Mercado Pago", date: "24 jun · 18:22", status: "Acreditado" },
  { fan: "Federico Luna", ath: "Tomás Aguirre", color: "#009F3D", amount: "$4.000", method: "Transferencia", date: "24 jun · 16:40", status: "Acreditado" },
  { fan: "Lucas Díaz", ath: "Valentina Sosa", color: "#3E8FD0", amount: "$6.000", method: "Tarjeta", date: "23 jun · 20:58", status: "Rechazado" },
];
const DEMO_PayHistory = [
  { period: "Mayo 2026", total: "$3.71M", atletas: 138, estado: "Pagado", date: "01 jun" },
  { period: "Abril 2026", total: "$3.42M", atletas: 131, estado: "Pagado", date: "01 may" },
  { period: "Marzo 2026", total: "$3.18M", atletas: 124, estado: "Pagado", date: "01 abr" },
];
const DEMO_HinchasKpis = [
  { label: "Hinchas activos", value: "3.204", sub: "+212 este mes" },
  { label: "Aporte mensual prom.", value: "$3.840", sub: "por hincha" },
  { label: "Retención", value: "91%", sub: "a 6 meses" },
];
const DEMO_Hinchas = [
  { name: "Carlos Medina", atletas: 48, mensual: "$42.000", desde: "Ene 2025", medal: "#C9A227" },
  { name: "Sofía Robles", atletas: 41, mensual: "$36.500", desde: "Mar 2025", medal: "#B8C2CC" },
  { name: "Diego Paz", atletas: 37, mensual: "$31.000", desde: "Feb 2025", medal: "#C8956A" },
  { name: "Carla Méndez", atletas: 29, mensual: "$24.000", desde: "Jun 2025", medal: null },
  { name: "Martín Gómez", atletas: 24, mensual: "$19.500", desde: "Ago 2025", medal: null },
  { name: "Julieta Faraldo", atletas: 21, mensual: "$17.800", desde: "Sep 2025", medal: null },
  { name: "Federico Luna", atletas: 18, mensual: "$15.200", desde: "Oct 2025", medal: null },
  { name: "Agustina Vidal", atletas: 16, mensual: "$13.400", desde: "Nov 2025", medal: null },
];
const DEMO_Empresas = [
  { name: "Club Atlético Tigre", type: "Club", supports: "Equipo de remo · 8 atletas", mensual: "$180.000", initial: "CT", color: "#0072CE", estado: "Activo" },
  { name: "Banco del Sur", type: "Sponsor", supports: "12 atletas", mensual: "$450.000", initial: "BS", color: "#009F3D", estado: "Activo" },
  { name: "Deportes Andinos", type: "Sponsor", supports: "Esquí y montaña · 5 atletas", mensual: "$120.000", initial: "DA", color: "#3E8FD0", estado: "Activo" },
  { name: "Energía Patagónica", type: "Sponsor", supports: "6 atletas del sur", mensual: "$95.000", initial: "EP", color: "#DF0024", estado: "En pausa" },
  { name: "Federación de Hockey", type: "Federación", supports: "Selección sub-21", mensual: "$240.000", initial: "FH", color: "#7A4DD0", estado: "Activo" },
  { name: "Mutual Deportiva", type: "Sponsor", supports: "Fondo solidario", mensual: "$60.000", initial: "MD", color: "#C9A227", estado: "Activo" },
];
const DEMO_Activity = [
  { text: "Carla M. apoyó a Lucía Ferrari con $5.000", ago: "hace 3 min", color: "#C9A227" },
  { text: "Aprobaste la postulación de Mateo Ríos", ago: "hace 1 h", color: "#22c55e" },
  { text: "Pago de junio enviado a 142 atletas", ago: "hace 4 h", color: "#009F3D" },
  { text: "Nueva empresa: Club Atlético Tigre", ago: "ayer", color: "#3E8FD0" },
];
const DEMO_Payouts = [
  { name: "Lucía Ferrari", supporters: 312, amount: "$248K", color: "#0072CE", initials: "LF" },
  { name: "Valentina Sosa", supporters: 421, amount: "$372K", color: "#3E8FD0", initials: "VS" },
  { name: "Joaquín Vega", supporters: 389, amount: "$298K", color: "#F4C300", initials: "JV" },
];

const NAV_MAIN: { label: Section; icon: string }[] = [
  { label: "Resumen", icon: "◧" },
  { label: "Postulaciones", icon: "◔" },
  { label: "Atletas", icon: "◉" },
  { label: "Aportes", icon: "◈" },
  { label: "Pagos", icon: "◇" },
];
const NAV_SEC: { label: Section; icon: string }[] = [
  { label: "Hinchas", icon: "♥" },
  { label: "Empresas", icon: "▣" },
  { label: "Ajustes", icon: "⚙" },
];
const PAGE_META: Record<Section, { t: string; s: string }> = {
  Resumen: { t: "Resumen general", s: "Lo que pasó esta semana" },
  Postulaciones: { t: "Postulaciones", s: "Revisá cada caso a mano, uno por uno" },
  Atletas: { t: "Atletas", s: "Atletas publicados en la plataforma" },
  Aportes: { t: "Aportes", s: "Movimientos recientes" },
  Pagos: { t: "Pagos", s: "Distribución mensual a los atletas" },
  Hinchas: { t: "Hinchas", s: "Las personas que apoyan" },
  Empresas: { t: "Empresas", s: "Sponsors y clubes aliados" },
  Ajustes: { t: "Ajustes", s: "Configuración de la plataforma" },
};

export function BackofficeApp() {
  const [phase, setPhase] = useState<Phase>("loading");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authMsg, setAuthMsg] = useState("");
  const [userEmail, setUserEmail] = useState("");

  const [active, setActive] = useState<Section>("Resumen");
  const [filter, setFilter] = useState<StatusFilter>("pending");
  const [allApps, setAllApps] = useState<Application[]>([]);
  const [teamApps, setTeamApps] = useState<TeamApp[]>([]);
  const [athletes, setAthletes] = useState<AthleteRow[]>([]);
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [loadingList, setLoadingList] = useState(false);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState("");
  const [publishing, setPublishing] = useState(false);

  // ── Sesión ────────────────────────────────────────────────────────────
  const resolveSession = useCallback(async () => {
    const supa = sb();
    if (!supa) return setPhase("noenv");
    const timeout = new Promise<{ data: { session: null } }>((resolve) =>
      setTimeout(() => resolve({ data: { session: null } }), 4000),
    );
    const { data } = await Promise.race([supa.auth.getSession(), timeout]);
    if (!data.session) return setPhase("login");
    setUserEmail(data.session.user.email ?? "");
    const { data: isAdmin } = await supa.rpc("is_admin");
    setPhase(isAdmin === true ? "ready" : "denied");
  }, []);

  useEffect(() => {
    resolveSession();
    const supa = sb();
    if (!supa) return;
    const { data: sub } = supa.auth.onAuthStateChange(() => resolveSession());
    return () => sub.subscription.unsubscribe();
  }, [resolveSession]);

  // ── Cargar postulaciones + atletas ──────────────────────────────────────
  const loadApps = useCallback(async () => {
    const supa = sb();
    if (!supa) return;
    setLoadingList(true);
    const [appsRes, athRes, teamRes] = await Promise.all([
      supa.from("athlete_applications").select("*").order("created_at", { ascending: false }),
      supa.from("athletes").select("id,slug,full_name,sport,city,province,raised_amount,verified,mp_connected").order("raised_amount", { ascending: false }),
      supa.from("team_applications").select("*").order("created_at", { ascending: false }),
    ]);
    if (!appsRes.error && appsRes.data) setAllApps(appsRes.data as Application[]);
    if (!athRes.error && athRes.data) setAthletes(athRes.data as AthleteRow[]);
    if (!teamRes.error && teamRes.data) setTeamApps(teamRes.data as TeamApp[]);
    setLoadingList(false);
  }, []);

  useEffect(() => {
    if (phase === "ready") loadApps();
  }, [phase, loadApps]);

  const counts = useMemo(() => {
    const c = { pending: 0, approved: 0, rejected: 0 } as Record<StatusFilter, number>;
    for (const a of allApps) if (a.status in c) c[a.status as StatusFilter]++;
    return c;
  }, [allApps]);

  const apps = useMemo(() => allApps.filter((a) => a.status === filter), [allApps, filter]);

  // Selección para el panel de detalle de Postulaciones
  const selectedApp = useMemo(
    () => apps.find((a) => a.id === selectedAppId) ?? apps[0] ?? null,
    [apps, selectedAppId],
  );

  // ── Acciones ──────────────────────────────────────────────────────────
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    const supa = sb();
    if (!supa) return;
    setAuthMsg("");
    setBusy(true);
    const { error } = await supa.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) setAuthMsg("No pudimos iniciar sesión. Revisá email y contraseña.");
  }

  async function handleLogout() {
    await sb()?.auth.signOut();
    setAllApps([]);
    setAthletes([]);
    setTeamApps([]);
    setDraft(null);
  }

  async function handleReject(app: Application) {
    const supa = sb();
    if (!supa) return;
    if (!confirm(`¿Rechazar la postulación de ${app.full_name}?`)) return;
    setBusy(true);
    const { error } = await supa
      .from("athlete_applications")
      .update({ status: "rejected", reviewed_at: new Date().toISOString() })
      .eq("id", app.id);
    setBusy(false);
    setToast(error ? "Error al rechazar: " + error.message : `Postulación de ${app.full_name} rechazada.`);
    if (!error) loadApps();
  }

  async function handleApprove(e: React.FormEvent) {
    e.preventDefault();
    const supa = sb();
    if (!supa || !draft) return;
    if (!draft.slug || !draft.sport) {
      setToast("Completá al menos slug y deporte.");
      return;
    }
    setBusy(true);
    const stats = draft.stats.filter(([v, l]) => v.trim() || l.trim());
    const fund = draft.fund_items.filter(([t, d]) => t.trim() || d.trim());
    const { data, error } = await supa
      .from("athletes")
      .insert({
        slug: draft.slug,
        full_name: draft.full_name,
        first_name: draft.first_name,
        sport: draft.sport,
        discipline: draft.discipline,
        city: draft.city,
        province: draft.province,
        bio: draft.bio,
        goal_amount: Number(draft.goal_amount) || 0,
        raised_amount: 0,
        verified: true,
        scope: draft.scope,
        next_competition: draft.next_competition || null,
        photo_url: draft.photo_url,
        photo_secondary_url: draft.photo_secondary_url,
        socials: draft.socials || null,
        payment_mp: draft.payment_mp || null,
        payment_paypal: draft.payment_paypal || null,
        stats,
        fund_items: fund,
      })
      .select("id")
      .single();

    if (error || !data) {
      setBusy(false);
      setToast(
        error?.code === "23505"
          ? `Ya existe un atleta con el slug "${draft.slug}". Cambialo.`
          : "Error al crear el atleta: " + (error?.message ?? "desconocido"),
      );
      return;
    }

    const { error: e2 } = await supa
      .from("athlete_applications")
      .update({ status: "approved", athlete_id: data.id, reviewed_at: new Date().toISOString() })
      .eq("id", draft.appId);

    // Migra la conexión de Mercado Pago que la atleta hizo en el registro (si la hizo).
    const { data: mpMigrated } = await supa.rpc("claim_application_mp", {
      p_app_id: draft.appId,
      p_athlete_id: data.id,
    });

    setBusy(false);
    setToast(
      e2
        ? "Atleta creado, pero no se pudo marcar la postulación: " + e2.message
        : `¡${draft.full_name} dado de alta!${mpMigrated ? " Su Mercado Pago quedó conectado ✓." : ""} Acordate de "Publicar ahora" para que salga online.`,
    );
    setDraft(null);
    loadApps();
  }

  async function handlePublish() {
    const supa = sb();
    if (!supa) return;
    setPublishing(true);
    setToast("");
    const { error } = await supa.functions.invoke("trigger-rebuild");
    setPublishing(false);
    setToast(
      error
        ? "No se pudo disparar la publicación (¿está configurada la función trigger-rebuild?): " + error.message
        : "🚀 Publicación disparada. El sitio se actualiza en ~1-2 min.",
    );
  }

  /** Genera el link de conexión de Mercado Pago de un atleta y lo abre. */
  async function genMpLink(athlete: AthleteRow) {
    const supa = sb();
    if (!supa) return;
    setToast(`Generando link de Mercado Pago de ${athlete.full_name}…`);
    const { data, error } = await supa.functions.invoke("mp-connect-link", {
      body: { athlete_id: athlete.id },
    });
    if (error || !data?.url) {
      setToast("No se pudo generar el link de MP: " + (error?.message ?? "error desconocido"));
      return;
    }
    try {
      await navigator.clipboard.writeText(data.url);
    } catch {}
    window.open(data.url, "_blank", "noopener");
    setToast(
      `Link de Mercado Pago de ${athlete.full_name} abierto en otra pestaña (y copiado al portapapeles). El atleta tiene que autorizar con SU cuenta de Mercado Pago.`,
    );
  }

  /** Abre el cliente de correo con un pedido de más info prellenado. */
  function askMoreInfo(app: Application) {
    const first = app.full_name.split(" ")[0];
    const subject = "Granito · Necesitamos un par de datos más para aprobar tu perfil";
    const body =
      `Hola ${first},\n\n¡Gracias por postularte a Granito! Tu historia nos llegó y nos encantó. ` +
      `Para terminar de aprobar tu perfil nos falta que completes un par de datos.\n\n` +
      `Podés responder este mismo mail con la info. Cualquier duda, escribinos.\n\nAbrazo,\nEquipo Granito`;
    window.location.href = `mailto:${app.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  }

  // ── Render: estados previos al dashboard ────────────────────────────────
  if (phase === "loading") return <Centered>Cargando…</Centered>;

  if (phase === "noenv")
    return (
      <Centered>
        Supabase no está configurado en este entorno (faltan
        NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY).
      </Centered>
    );

  if (phase === "login")
    return (
      <Centered>
        <form
          onSubmit={handleLogin}
          className="w-full max-w-sm rounded-2xl p-7"
          style={{ background: C.surface, border: `1px solid ${C.border}`, boxShadow: "0 30px 80px rgba(0,0,0,.5)" }}
        >
          <div className="flex items-end gap-px">
            <span className="font-display text-2xl font-700 uppercase leading-none tracking-[.04em] text-white">GRANIT</span>
            <span className="font-display text-2xl font-700 uppercase leading-none tracking-[.04em]" style={{ color: C.gold }}>O</span>
          </div>
          <p className="mt-1 font-display text-[10px] uppercase tracking-[.28em]" style={{ color: C.txtFaint }}>Backoffice</p>
          <h1 className="mt-5 font-display text-2xl font-700 uppercase tracking-tight text-white">Ingresá</h1>
          <p className="mt-1 text-sm" style={{ color: C.txtDim }}>Acceso para el equipo.</p>
          <label className="mt-6 block text-sm">
            <span className="eyebrow" style={{ color: C.txtFaint }}>Email</span>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} style={inputDark} />
          </label>
          <label className="mt-3 block text-sm">
            <span className="eyebrow" style={{ color: C.txtFaint }}>Contraseña</span>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} style={inputDark} />
          </label>
          {authMsg && <p className="mt-3 text-sm" style={{ color: C.redBright }}>{authMsg}</p>}
          <button
            type="submit"
            disabled={busy}
            className="mt-6 w-full rounded-lg py-3 font-display text-base font-700 uppercase tracking-wide transition-transform hover:scale-[1.02] disabled:opacity-60"
            style={{ background: C.gold, color: C.ink }}
          >
            {busy ? "Entrando…" : "Entrar"}
          </button>
        </form>
      </Centered>
    );

  if (phase === "denied")
    return (
      <Centered>
        <div className="text-center">
          <p className="text-white/85">Tu usuario ({userEmail}) no tiene permisos de administrador.</p>
          <button
            onClick={handleLogout}
            className="mt-4 rounded-lg px-4 py-2 font-display text-sm font-600 uppercase tracking-wide text-white"
            style={{ border: "1px solid rgba(255,255,255,.2)" }}
          >
            Salir
          </button>
        </div>
      </Centered>
    );

  // ── phase === "ready": dashboard ────────────────────────────────────────
  const meta = PAGE_META[active];
  const isDemo = ["Aportes", "Pagos", "Hinchas", "Empresas", "Ajustes"].includes(active);

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: C.bg, color: "#fff", fontFamily: "var(--font-inter), system-ui, sans-serif" }}>
      {/* ===== SIDEBAR ===== */}
      <aside
        style={{
          width: 248,
          flex: "none",
          background: C.sidebar,
          borderRight: `1px solid ${C.border}`,
          display: "flex",
          flexDirection: "column",
          position: "sticky",
          top: 0,
          height: "100vh",
        }}
        className="hidden md:flex"
      >
        <div style={{ padding: "22px 24px 18px", borderBottom: `1px solid rgba(255,255,255,.06)` }}>
          <div className="flex items-end gap-px">
            <span className="font-display text-[26px] font-700 uppercase leading-none tracking-[.04em] text-white">GRANIT</span>
            <span className="font-display text-[26px] font-700 uppercase leading-none tracking-[.04em]" style={{ color: C.gold }}>O</span>
          </div>
          <div className="mt-1.5 font-display text-[10px] uppercase tracking-[.28em]" style={{ color: C.txtFaint }}>Backoffice</div>
        </div>

        <nav className="bo-scroll" style={{ flex: 1, overflowY: "auto", padding: 14 }}>
          <div className="px-3 pb-1.5 pt-2 font-display text-[10px] font-600 uppercase tracking-[.16em]" style={{ color: "rgba(255,255,255,.32)" }}>Gestión</div>
          {NAV_MAIN.map((n) => (
            <NavItem key={n.label} item={n} active={active === n.label} badge={n.label === "Postulaciones" && counts.pending ? String(counts.pending) : null} onClick={() => setActive(n.label)} />
          ))}
          <div className="px-3 pb-1.5 pt-4 font-display text-[10px] font-600 uppercase tracking-[.16em]" style={{ color: "rgba(255,255,255,.32)" }}>Plataforma</div>
          {NAV_SEC.map((n) => (
            <NavItem key={n.label} item={n} active={active === n.label} badge={null} onClick={() => setActive(n.label)} />
          ))}
        </nav>

        <div style={{ padding: 14, borderTop: `1px solid rgba(255,255,255,.06)` }}>
          <div className="flex items-center gap-2.5 rounded-[10px] px-2.5 py-2">
            <div
              className="flex h-9 w-9 flex-none items-center justify-center rounded-full font-display text-[15px] font-700"
              style={{ background: `linear-gradient(135deg,${C.gold},#a8861d)`, color: C.ink }}
            >
              {userEmail ? userEmail[0].toUpperCase() : "A"}
            </div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-[13px] font-600 leading-tight">{userEmail || "Admin"}</div>
              <div className="text-[11px]" style={{ color: C.txtFaint }}>Admin</div>
            </div>
            <button onClick={handleLogout} title="Salir" className="text-sm" style={{ color: C.txtFaint }}>⎋</button>
          </div>
        </div>
      </aside>

      {/* ===== MAIN ===== */}
      <main className="bo-scroll" style={{ flex: 1, minWidth: 0, height: "100vh", overflowY: "auto" }}>
        {/* topbar */}
        <header
          style={{
            position: "sticky",
            top: 0,
            zIndex: 30,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 24,
            padding: "18px 36px",
            background: "rgba(8,19,32,.82)",
            backdropFilter: "blur(14px)",
            WebkitBackdropFilter: "blur(14px)",
            borderBottom: `1px solid ${C.border}`,
          }}
        >
          <div>
            <div className="font-display text-[26px] font-600 leading-none tracking-[.01em]">{meta.t}</div>
            <div className="mt-0.5 text-[13px]" style={{ color: C.txtDim }}>{meta.s}</div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-[13px] lg:inline" style={{ color: C.txtDim }}>{userEmail}</span>
            <button
              onClick={handlePublish}
              disabled={publishing}
              title="Reconstruye el sitio público con los cambios aprobados"
              className="rounded-[10px] px-4 py-2.5 font-display text-[13px] font-600 uppercase tracking-[.04em] transition-transform hover:scale-[1.03] disabled:opacity-60"
              style={{ background: C.gold, color: C.ink }}
            >
              {publishing ? "Publicando…" : "🚀 Publicar ahora"}
            </button>
          </div>
        </header>

        <div style={{ padding: "28px 36px 48px" }}>
          {/* aviso demo */}
          {isDemo && (
            <div
              className="mb-5 flex items-center gap-2.5 rounded-[10px] px-4 py-2.5 text-[13px]"
              style={{ background: "rgba(201,162,39,.1)", border: `1px solid rgba(201,162,39,.28)`, color: C.gold }}
            >
              <span>ⓘ</span>
              <span>{DEMO_AVISO}</span>
            </div>
          )}

          {toast && (
            <div
              className="mb-5 rounded-xl px-4 py-3 text-sm"
              style={{ background: C.surface, border: `1px solid rgba(108,180,228,.4)`, color: "#fff" }}
            >
              {toast}
            </div>
          )}

          {/* ===== RESUMEN ===== */}
          {active === "Resumen" && (
            <ResumenSection
              kpis={[
                { label: "Aportes del mes", value: "$4.13M", icon: "◈", color: C.gold, delta: "demo", deltaColor: C.txtFaint, sub: "ejemplo" },
                { label: "Atletas activos", value: String(athletes.length), icon: "◉", color: C.blue, delta: "real", deltaColor: C.greenBright, sub: "publicados" },
                { label: "Postulaciones", value: String(counts.pending), icon: "◔", color: C.red, delta: "real", deltaColor: C.gold, sub: "sin revisar" },
                { label: "Hinchas activos", value: "3.204", icon: "♥", color: C.green, delta: "demo", deltaColor: C.txtFaint, sub: "ejemplo" },
              ]}
              apps={allApps.filter((a) => a.status === "pending").slice(0, 6)}
              pendingCount={counts.pending}
              onReview={() => setActive("Postulaciones")}
              onApprove={(app) => { setActive("Postulaciones"); setFilter("pending"); setSelectedAppId(app.id); setDraft(buildDraft(app)); }}
            />
          )}

          {/* ===== POSTULACIONES ===== */}
          {active === "Postulaciones" && (
            <PostulacionesSection
              filter={filter}
              counts={counts}
              setFilter={(f) => { setFilter(f); setSelectedAppId(null); }}
              apps={apps}
              loading={loadingList}
              selected={selectedApp}
              onSelect={(id) => setSelectedAppId(id)}
              onApprove={(app) => setDraft(buildDraft(app))}
              onReject={handleReject}
              onMoreInfo={askMoreInfo}
              busy={busy}
              teamApps={teamApps}
            />
          )}

          {/* ===== ATLETAS ===== */}
          {active === "Atletas" && <AtletasSection athletes={athletes} loading={loadingList} onConnect={genMpLink} />}

          {/* ===== APORTES ===== */}
          {active === "Aportes" && <AportesSection />}

          {/* ===== PAGOS ===== */}
          {active === "Pagos" && <PagosSection />}

          {/* ===== HINCHAS ===== */}
          {active === "Hinchas" && <HinchasSection />}

          {/* ===== EMPRESAS ===== */}
          {active === "Empresas" && <EmpresasSection />}

          {/* ===== AJUSTES ===== */}
          {active === "Ajustes" && <AjustesSection adminEmail={userEmail} />}
        </div>
      </main>

      {/* ===== Modal de aprobación (flujo real) ===== */}
      {draft && (
        <ApprovalModal draft={draft} setDraft={setDraft} onSubmit={handleApprove} busy={busy} onClose={() => setDraft(null)} />
      )}

      <style>{`
        .bo-scroll::-webkit-scrollbar{width:9px;height:9px}
        .bo-scroll::-webkit-scrollbar-thumb{background:rgba(255,255,255,.14);border-radius:999px}
        .bo-scroll::-webkit-scrollbar-thumb:hover{background:${C.gold}}
        @keyframes boPulse{0%,100%{opacity:1}50%{opacity:.3}}
      `}</style>
    </div>
  );
}

// ── Shell: NavItem ───────────────────────────────────────────────────────
function NavItem({
  item,
  active,
  badge,
  onClick,
}: {
  item: { label: string; icon: string };
  active: boolean;
  badge: string | null;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className="mb-0.5 flex cursor-pointer items-center justify-between rounded-[10px] px-3 py-2.5 text-sm font-500 transition-colors"
      style={
        active
          ? { background: "rgba(201,162,39,.14)", color: "#fff", boxShadow: "inset 2px 0 0 #C9A227" }
          : { background: "transparent", color: "rgba(255,255,255,.62)" }
      }
    >
      <span className="flex items-center gap-3">
        <span className="w-5 text-center text-[15px]">{item.icon}</span>
        {item.label}
      </span>
      {badge && (
        <span
          className="min-w-[20px] rounded-full px-2 py-0.5 text-center font-display text-[11px] font-600"
          style={{ background: C.red, color: "#fff" }}
        >
          {badge}
        </span>
      )}
    </div>
  );
}

// ── Resumen ──────────────────────────────────────────────────────────────
function ResumenSection({
  kpis,
  apps,
  pendingCount,
  onReview,
  onApprove,
}: {
  kpis: { label: string; value: string; icon: string; color: string; delta: string; deltaColor: string; sub: string }[];
  apps: Application[];
  pendingCount: number;
  onReview: () => void;
  onApprove: (app: Application) => void;
}) {
  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 26 }} className="bo-kpis">
        {kpis.map((k) => (
          <div key={k.label} style={{ background: C.surface, border: `1px solid ${C.border}`, borderTop: `3px solid ${k.color}`, borderRadius: 14, padding: "20px 22px" }}>
            <div className="mb-3.5 flex items-center justify-between">
              <span className="text-[12px] font-600 uppercase tracking-[.04em]" style={{ color: C.txtDim }}>{k.label}</span>
              <span className="text-[18px]">{k.icon}</span>
            </div>
            <div className="font-display text-[34px] font-700 leading-none">{k.value}</div>
            <div className="mt-2 flex items-center gap-1.5">
              <span className="text-[12px] font-600" style={{ color: k.deltaColor }}>{k.delta}</span>
              <span className="text-[12px]" style={{ color: C.txtFaint }}>{k.sub}</span>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr", gap: 18, alignItems: "start" }} className="bo-grid">
        {/* postulaciones por revisar (real) */}
        <section style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden" }}>
          <div className="flex items-center justify-between px-[22px] pb-4 pt-5" style={{ borderBottom: `1px solid rgba(255,255,255,.06)` }}>
            <div className="flex items-center gap-2.5">
              <h2 className="m-0 font-display text-[19px] font-600">Postulaciones por revisar</h2>
              <span className="rounded-full px-2.5 py-0.5 font-display text-[12px] font-600" style={{ background: "rgba(201,162,39,.16)", color: C.gold }}>
                {pendingCount} pendientes
              </span>
            </div>
            <span onClick={onReview} className="cursor-pointer text-[13px] font-600" style={{ color: C.gold }}>Ver todas →</span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "2.2fr 1.3fr 1fr 1.2fr", gap: 12, padding: "11px 22px", borderBottom: `1px solid rgba(255,255,255,.05)` }}>
            {["Atleta", "Deporte", "Hace", "Acción"].map((h, i) => (
              <span key={h} className="text-[11px] font-600 uppercase tracking-[.06em]" style={{ color: C.txtFaint, textAlign: i === 3 ? "right" : "left" }}>{h}</span>
            ))}
          </div>

          {apps.length === 0 && <div className="px-[22px] py-10 text-center text-[13px]" style={{ color: C.txtDim }}>No hay postulaciones pendientes 🎉</div>}
          {apps.map((a) => (
            <div key={a.id} style={{ display: "grid", gridTemplateColumns: "2.2fr 1.3fr 1fr 1.2fr", gap: 12, alignItems: "center", padding: "14px 22px", borderBottom: `1px solid ${C.borderSoft}` }}>
              <div className="flex min-w-0 items-center gap-3">
                <Avatar name={a.full_name} color={sportColorByLabel(a.sport)} solid />
                <div className="min-w-0">
                  <div className="truncate text-[14px] font-600 leading-tight">{a.full_name}</div>
                  <div className="text-[12px]" style={{ color: C.txtFaint }}>{a.location ?? "—"}</div>
                </div>
              </div>
              <div><SportPill label={a.sport} /></div>
              <div className="text-[13px]" style={{ color: C.txtDim }}>{timeAgo(a.created_at)}</div>
              <div className="flex justify-end gap-1.5">
                <button onClick={() => onApprove(a)} className="h-8 w-8 rounded-lg text-[13px]" style={{ border: `1px solid rgba(34,197,94,.4)`, background: "rgba(34,197,94,.1)", color: C.greenBright }} title="Aprobar">✓</button>
                <button onClick={onReview} className="h-8 w-8 rounded-lg text-[13px]" style={{ border: "1px solid rgba(255,255,255,.12)", background: "transparent", color: "rgba(255,255,255,.6)" }} title="Ver">↗</button>
              </div>
            </div>
          ))}
        </section>

        {/* columna derecha (demo) */}
        <div className="flex flex-col gap-[18px]">
          <section style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden" }}>
            <div className="flex items-center justify-between px-5 pb-3.5 pt-[18px]" style={{ borderBottom: `1px solid rgba(255,255,255,.06)` }}>
              <h2 className="m-0 font-display text-[18px] font-600">Próximos pagos</h2>
              <DemoTag />
            </div>
            <div className="px-5 py-[18px]" style={{ borderBottom: `1px solid rgba(255,255,255,.06)` }}>
              <div className="mb-1.5 text-[12px]" style={{ color: C.txtDim }}>A distribuir este mes</div>
              <div className="font-display text-[30px] font-700 leading-none">$3.842.500</div>
              <div className="mt-3.5 flex h-2 overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,.07)" }}>
                <div style={{ width: "93%", background: C.green }} /><div style={{ width: "7%", background: C.gold }} />
              </div>
              <div className="mt-2 flex justify-between text-[11px]" style={{ color: C.txtDim }}>
                <span><strong style={{ color: C.green }}>93%</strong> a atletas</span>
                <span><strong style={{ color: C.gold }}>7%</strong> plataforma</span>
              </div>
            </div>
            {DEMO_Payouts.map((p) => (
              <div key={p.name} className="flex items-center gap-2.5 px-5 py-3" style={{ borderBottom: `1px solid ${C.borderSoft}` }}>
                <div className="flex h-8 w-8 flex-none items-center justify-center rounded-full font-display text-[12px] font-700" style={{ background: p.color, color: "#fff" }}>{p.initials}</div>
                <div className="min-w-0 flex-1"><div className="text-[13px] font-600 leading-tight">{p.name}</div><div className="text-[11px]" style={{ color: C.txtFaint }}>{p.supporters} hinchas</div></div>
                <div className="font-display text-[15px] font-600">{p.amount}</div>
              </div>
            ))}
          </section>

          <section style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden" }}>
            <div className="flex items-center justify-between px-5 pb-3.5 pt-[18px]" style={{ borderBottom: `1px solid rgba(255,255,255,.06)` }}>
              <h2 className="m-0 font-display text-[18px] font-600">Actividad reciente</h2>
              <DemoTag />
            </div>
            <div className="py-1.5">
              {DEMO_Activity.map((ac, i) => (
                <div key={i} className="flex items-start gap-3 px-5 py-2.5">
                  <span className="mt-1.5 h-2 w-2 flex-none rounded-full" style={{ background: ac.color }} />
                  <div className="min-w-0"><div className="text-[13px] leading-snug" style={{ color: "rgba(255,255,255,.85)" }}>{ac.text}</div><div className="mt-0.5 text-[11px]" style={{ color: C.txtFaint }}>{ac.ago}</div></div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>
      <ResponsiveCSS />
    </>
  );
}

// ── Postulaciones ────────────────────────────────────────────────────────
function PostulacionesSection({
  filter,
  counts,
  setFilter,
  apps,
  loading,
  selected,
  onSelect,
  onApprove,
  onReject,
  onMoreInfo,
  busy,
  teamApps,
}: {
  filter: StatusFilter;
  counts: Record<StatusFilter, number>;
  setFilter: (f: StatusFilter) => void;
  apps: Application[];
  loading: boolean;
  selected: Application | null;
  onSelect: (id: string) => void;
  onApprove: (app: Application) => void;
  onReject: (app: Application) => void;
  onMoreInfo: (app: Application) => void;
  busy: boolean;
  teamApps: TeamApp[];
}) {
  const filters: { key: StatusFilter; label: string }[] = [
    { key: "pending", label: "Pendientes" },
    { key: "approved", label: "Aprobadas" },
    { key: "rejected", label: "Rechazadas" },
  ];
  return (
    <>
      <div className="mb-5 flex flex-wrap gap-2.5">
        {filters.map((f) => {
          const on = filter === f.key;
          return (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className="flex items-center gap-2 rounded-full px-[15px] py-2.5 text-[13px] font-600 transition-colors"
              style={{ border: `1px solid ${on ? C.gold : "rgba(255,255,255,.12)"}`, background: on ? "rgba(201,162,39,.14)" : "transparent", color: on ? "#fff" : "rgba(255,255,255,.6)" }}
            >
              {f.label}
              <span className="rounded-full px-1.5 py-px font-display text-[11px] font-600" style={{ background: on ? C.gold : "rgba(255,255,255,.1)", color: on ? C.ink : "rgba(255,255,255,.6)" }}>{counts[f.key]}</span>
            </button>
          );
        })}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1.25fr", gap: 18, alignItems: "start" }} className="bo-grid">
        {/* lista */}
        <div className="flex flex-col gap-2.5">
          {loading && <p style={{ color: C.txtDim }}>Cargando…</p>}
          {!loading && apps.length === 0 && (
            <div className="rounded-[13px] px-6 py-12 text-center text-[13px]" style={{ border: `1px dashed ${C.border}`, color: C.txtDim }}>
              No hay postulaciones {filter === "pending" ? "pendientes" : filter === "approved" ? "aprobadas" : "rechazadas"}.
            </div>
          )}
          {apps.map((a) => {
            const sel = selected?.id === a.id;
            return (
              <div
                key={a.id}
                onClick={() => onSelect(a.id)}
                style={{ background: sel ? "#12283f" : C.surface, border: `1px solid ${sel ? C.gold : C.border}`, borderRadius: 13, padding: "15px 16px", cursor: "pointer", transition: "all .15s" }}
              >
                <div className="flex items-center gap-3">
                  <Avatar name={a.full_name} color={sportColorByLabel(a.sport)} ring />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-[15px] font-600 leading-tight">{a.full_name}</span>
                      <StatusChip status={a.status} />
                    </div>
                    <div className="mt-0.5 text-[12px]" style={{ color: C.txtDim }}>{a.sport}{a.location ? ` · ${a.location}` : ""}</div>
                  </div>
                  <div className="flex-none text-[12px]" style={{ color: C.txtFaint }}>{timeAgo(a.created_at)}</div>
                </div>
              </div>
            );
          })}
        </div>

        {/* detalle */}
        {selected ? (
          <section style={{ position: "sticky", top: 96, background: C.surface, border: "1px solid rgba(255,255,255,.08)", borderRadius: 16, overflow: "hidden", boxShadow: "0 18px 50px rgba(0,0,0,.4)" }}>
            <div style={{ height: 104, background: `linear-gradient(135deg,${sportColorByLabel(selected.sport)},#0a1828)` }} />
            <div style={{ padding: "0 26px 26px", marginTop: -44 }}>
              <div className="mb-[18px] flex items-end justify-between">
                <div
                  className="flex h-[88px] w-[88px] items-center justify-center rounded-full font-display text-[26px] font-700"
                  style={{ background: "#0a1828", border: "4px solid #0d2238", boxShadow: `0 0 0 2px ${sportColorByLabel(selected.sport)} inset` }}
                >
                  {initialsOf(selected.full_name)}
                </div>
                <StatusChip status={selected.status} />
              </div>
              <h2 className="m-0 font-display text-[28px] font-600 leading-none">{selected.full_name}</h2>
              <div className="mt-2 flex items-center gap-2.5">
                <SportPill label={selected.sport} />
                <span className="text-[13px]" style={{ color: C.txtDim }}>
                  {selected.location ?? "—"}{selected.age ? ` · ${selected.age} años` : ""}
                </span>
              </div>

              {/* contacto */}
              <div className="mt-3.5 flex flex-wrap gap-2.5">
                <a href={`mailto:${selected.email}`} className="flex items-center gap-2 rounded-[9px] px-3 py-2 text-[13px] font-500" style={{ background: "#0a1828", border: "1px solid rgba(255,255,255,.08)", color: C.celeste, textDecoration: "none" }}>✉ {selected.email}</a>
                {selected.socials && <span className="flex items-center gap-2 rounded-[9px] px-3 py-2 text-[13px] font-500" style={{ background: "#0a1828", border: "1px solid rgba(255,255,255,.08)", color: "rgba(255,255,255,.8)" }}>◎ {selected.socials}</span>}
              </div>

              {/* cobros */}
              {(selected.payment_mp || selected.payment_paypal) && (
                <div className="mt-2.5 flex flex-wrap gap-2.5">
                  {selected.payment_mp && <span className="flex items-center gap-2 rounded-[9px] px-3 py-2 text-[13px] font-500" style={{ background: "rgba(0,159,61,.1)", border: "1px solid rgba(0,159,61,.3)", color: "#5fd98a" }}>💳 MP · {selected.payment_mp}</span>}
                  {selected.payment_paypal && <span className="flex items-center gap-2 rounded-[9px] px-3 py-2 text-[13px] font-500" style={{ background: "rgba(0,114,206,.1)", border: "1px solid rgba(0,114,206,.3)", color: "#6cb4e4" }}>🅿 PayPal · {selected.payment_paypal}</span>}
                </div>
              )}

              {/* dato rápido */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, margin: "22px 0" }}>
                <MiniBox label="Próxima competencia" value={selected.next_competition ?? "—"} />
                <MiniBox label="Disciplina" value={selected.discipline ?? "—"} />
              </div>

              {/* historia */}
              {selected.achievements && (
                <>
                  <Label>Logros</Label>
                  <p className="m-0 mb-5 text-[14px] leading-relaxed" style={{ color: "rgba(255,255,255,.78)" }}>{selected.achievements}</p>
                </>
              )}
              {selected.needs && (
                <>
                  <Label>Necesita apoyo para</Label>
                  <p className="m-0 mb-5 text-[14px] leading-relaxed" style={{ color: "rgba(255,255,255,.78)" }}>{selected.needs}</p>
                </>
              )}

              {/* fotos (reales, clickeables) */}
              <Label>Fotos</Label>
              <div className="mb-4 grid grid-cols-2 gap-2.5">
                <PhotoThumb url={selected.photo_url} label="Perfil" />
                <PhotoThumb url={selected.photo_secondary_url} label="Acción" />
              </div>

              {/* Cobros (Mercado Pago) */}
              <Label>Cobros</Label>
              <div className="mb-6 flex flex-col gap-1.5">
                <div
                  className="flex items-center gap-2.5 rounded-[9px] px-3 py-2.5"
                  style={{ background: "#0a1828", border: `1px solid rgba(255,255,255,.06)` }}
                >
                  <span style={{ color: selected.mp_connected ? C.greenBright : C.gold, fontSize: 14 }}>
                    {selected.mp_connected ? "✓" : "◔"}
                  </span>
                  <span className="flex-1 text-[13px]" style={{ color: "rgba(255,255,255,.8)" }}>
                    Mercado Pago
                  </span>
                  <span className="text-[12px] font-600" style={{ color: selected.mp_connected ? C.greenBright : C.gold }}>
                    {selected.mp_connected ? "Conectado por la atleta" : "Sin conectar"}
                  </span>
                </div>
                {selected.payment_mp && (
                  <div className="px-1 text-[11px]" style={{ color: C.txtFaint }}>
                    Alias/CVU que cargó: {selected.payment_mp}
                  </div>
                )}
              </div>

              {/* links */}
              {selected.media_url && (
                <div className="mb-6">
                  <DocRow ok name="Video / redes" href={selected.media_url} />
                </div>
              )}

              {/* acciones (reales) */}
              {selected.status === "pending" ? (
                <div className="flex gap-2.5">
                  <button onClick={() => onApprove(selected)} className="flex-1 rounded-[10px] py-3.5 font-display text-[14px] font-600 uppercase tracking-[.04em] text-white" style={{ background: C.green }}>✓ Aprobar</button>
                  <button onClick={() => onMoreInfo(selected)} className="flex-1 rounded-[10px] py-3.5 font-display text-[14px] font-600 uppercase tracking-[.04em]" style={{ background: "transparent", border: "1px solid rgba(255,255,255,.16)", color: "rgba(255,255,255,.8)" }}>Pedir más info</button>
                  <button onClick={() => onReject(selected)} disabled={busy} className="rounded-[10px] px-4 font-display text-[16px] font-600" style={{ width: 52, background: "transparent", border: "1px solid rgba(223,0,36,.4)", color: C.redBright }}>✕</button>
                </div>
              ) : (
                <div className="rounded-[10px] px-4 py-3 text-center text-[13px]" style={{ background: "#0a1828", border: `1px solid ${C.border}`, color: C.txtDim }}>
                  {selected.status === "approved" ? "✓ Ya aprobada — atleta creado" : "Postulación rechazada"}
                </div>
              )}
            </div>
          </section>
        ) : (
          <div className="rounded-[13px] px-6 py-12 text-center text-[13px]" style={{ border: `1px dashed ${C.border}`, color: C.txtDim }}>
            Elegí una postulación de la lista para ver el detalle.
          </div>
        )}
      </div>

      {/* ── Equipos postulados ── */}
      <div className="mt-9">
        <div className="mb-3 flex items-center gap-2.5">
          <h2 className="m-0 font-display text-[19px] font-600">Equipos postulados</h2>
          <span className="rounded-full px-2.5 py-0.5 font-display text-[12px] font-600" style={{ background: "rgba(255,255,255,.08)", color: "rgba(255,255,255,.65)" }}>
            {teamApps.length}
          </span>
        </div>
        {teamApps.length === 0 ? (
          <div className="rounded-[13px] px-6 py-10 text-center text-[13px]" style={{ border: `1px dashed ${C.border}`, color: C.txtDim }}>
            Todavía no hay equipos postulados.
          </div>
        ) : (
          <section style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr 1.4fr 1.4fr 1fr", gap: 12, padding: "13px 22px", borderBottom: `1px solid rgba(255,255,255,.06)` }}>
              {["Equipo", "Deporte", "Competencia", "Recaudación", "Contacto"].map((h) => (
                <span key={h} className="text-[11px] font-600 uppercase tracking-[.06em]" style={{ color: C.txtFaint }}>{h}</span>
              ))}
            </div>
            {teamApps.map((t) => (
              <div key={t.id} style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr 1.4fr 1.4fr 1fr", gap: 12, alignItems: "center", padding: "14px 22px", borderBottom: `1px solid ${C.borderSoft}` }}>
                <div className="min-w-0">
                  <div className="truncate text-[14px] font-600">{t.team_name}</div>
                  <div className="text-[11px]" style={{ color: C.txtFaint }}>{timeAgo(t.created_at)}</div>
                </div>
                <div><SportPill label={t.sport} /></div>
                <div className="truncate text-[13px]" style={{ color: "rgba(255,255,255,.7)" }}>{t.competition ?? "—"}</div>
                <div className="text-[12px]" style={{ color: C.txtDim }}>
                  {t.fundraising_start || t.fundraising_end
                    ? `${t.fundraising_start ?? "?"} → ${t.fundraising_end ?? "?"}`
                    : "—"}
                </div>
                <a href={`mailto:${t.email}`} className="truncate text-[13px]" style={{ color: C.celeste }}>{t.email}</a>
              </div>
            ))}
          </section>
        )}
      </div>

      <ResponsiveCSS />
    </>
  );
}

// ── Atletas (real) ───────────────────────────────────────────────────────
function AtletasSection({
  athletes,
  loading,
  onConnect,
}: {
  athletes: AthleteRow[];
  loading: boolean;
  onConnect: (a: AthleteRow) => void;
}) {
  const cols = "2fr 1.1fr 1.3fr .8fr 1fr .8fr 1.2fr";
  return (
    <section style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden" }}>
      <div style={{ display: "grid", gridTemplateColumns: cols, gap: 12, padding: "13px 24px", borderBottom: `1px solid rgba(255,255,255,.06)` }}>
        {["Atleta", "Deporte", "Ubicación", "Hinchas", "$/mes", "Estado", "Cobros"].map((h, i) => (
          <span key={h} className="text-[11px] font-600 uppercase tracking-[.06em]" style={{ color: C.txtFaint, textAlign: i >= 3 ? "right" : "left" }}>{h}</span>
        ))}
      </div>
      {loading && <div className="px-6 py-10 text-center text-[13px]" style={{ color: C.txtDim }}>Cargando…</div>}
      {!loading && athletes.length === 0 && <div className="px-6 py-12 text-center text-[13px]" style={{ color: C.txtDim }}>Todavía no hay atletas publicados.</div>}
      {athletes.map((a) => {
        const sport = getSport(a.sport);
        const color = sport?.color ?? C.celeste;
        const loc = [a.city, a.province].filter(Boolean).join(", ") || "—";
        const raised = a.raised_amount ?? 0;
        return (
          <div key={a.id} style={{ display: "grid", gridTemplateColumns: cols, gap: 12, alignItems: "center", padding: "14px 24px", borderBottom: `1px solid ${C.borderSoft}` }}>
            <div className="flex min-w-0 items-center gap-3">
              <Avatar name={a.full_name} color={color} ring />
              <span className="truncate text-[14px] font-600">{a.full_name}</span>
            </div>
            <div><SportPill label={sport?.label ?? a.sport} color={color} /></div>
            <div className="text-[13px]" style={{ color: "rgba(255,255,255,.6)" }}>{loc}</div>
            <div className="text-right font-display text-[16px] font-600">{supporterCount(raised)}</div>
            <div className="text-right font-display text-[15px] font-600" style={{ color: C.gold }}>{formatMoney(raised)}</div>
            <div className="text-right">
              <span className="rounded-full px-2.5 py-[3px] font-display text-[10px] font-600 uppercase tracking-[.04em]" style={a.verified ? { background: "rgba(34,197,94,.14)", color: C.greenBright } : { background: "rgba(255,255,255,.08)", color: C.txtDim }}>
                {a.verified ? "Activo" : "Borrador"}
              </span>
            </div>
            <div className="flex justify-end">
              {a.mp_connected ? (
                <span className="rounded-full px-2.5 py-[3px] font-display text-[10px] font-600 uppercase tracking-[.04em]" style={{ background: "rgba(34,197,94,.14)", color: C.greenBright }}>
                  ✓ MP
                </span>
              ) : (
                <button
                  onClick={() => onConnect(a)}
                  className="rounded-full px-3 py-[5px] font-display text-[11px] font-600 uppercase tracking-[.04em] transition-colors"
                  style={{ background: "rgba(108,180,228,.12)", border: `1px solid rgba(108,180,228,.4)`, color: C.celeste }}
                  title="Generar el link para que el atleta conecte su Mercado Pago"
                >
                  Conectar MP
                </button>
              )}
            </div>
          </div>
        );
      })}
    </section>
  );
}

// ── Aportes (demo) ───────────────────────────────────────────────────────
function AportesSection() {
  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 20 }} className="bo-kpis3">
        {DEMO_AportesKpis.map((k) => <KpiSimple key={k.label} {...k} />)}
      </div>
      <section style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1.4fr 1fr 1.2fr 1.1fr .9fr", gap: 12, padding: "13px 24px", borderBottom: `1px solid rgba(255,255,255,.06)` }}>
          {["Hincha", "Atleta", "Monto", "Método", "Fecha", "Estado"].map((h, i) => (
            <span key={h} className="text-[11px] font-600 uppercase tracking-[.06em]" style={{ color: C.txtFaint, textAlign: i === 2 || i === 5 ? "right" : "left" }}>{h}</span>
          ))}
        </div>
        {DEMO_Aportes.map((a, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "1.6fr 1.4fr 1fr 1.2fr 1.1fr .9fr", gap: 12, alignItems: "center", padding: "13px 24px", borderBottom: `1px solid ${C.borderSoft}` }}>
            <div className="flex min-w-0 items-center gap-2.5">
              <div className="flex h-[34px] w-[34px] flex-none items-center justify-center rounded-full font-display text-[13px] font-700" style={{ background: "rgba(255,255,255,.08)" }}>{a.fan[0]}</div>
              <span className="truncate text-[14px] font-500">{a.fan}</span>
            </div>
            <div className="flex min-w-0 items-center gap-2"><span className="h-2 w-2 flex-none rounded-full" style={{ background: a.color }} /><span className="truncate text-[13px]" style={{ color: "rgba(255,255,255,.8)" }}>{a.ath}</span></div>
            <div className="text-right font-display text-[15px] font-600" style={{ color: C.gold }}>{a.amount}</div>
            <div className="text-[13px]" style={{ color: "rgba(255,255,255,.6)" }}>{a.method}</div>
            <div className="text-[12px]" style={{ color: C.txtFaint }}>{a.date}</div>
            <div className="text-right"><PayStatus status={a.status} /></div>
          </div>
        ))}
      </section>
      <ResponsiveCSS />
    </>
  );
}

// ── Pagos (demo) ─────────────────────────────────────────────────────────
function PagosSection() {
  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr", gap: 18, alignItems: "start", marginBottom: 18 }} className="bo-grid">
        <section style={{ background: "linear-gradient(135deg,#12283f,#0a1828)", border: "1px solid rgba(201,162,39,.22)", borderRadius: 16, padding: "24px 26px" }}>
          <div className="mb-[18px] flex items-center justify-between">
            <div>
              <div className="font-display text-[11px] font-600 uppercase tracking-[.14em]" style={{ color: C.gold }}>Período abierto</div>
              <div className="mt-1 font-display text-[24px] font-600 leading-none">Junio 2026</div>
            </div>
            <span className="rounded-full px-3 py-[5px] font-display text-[11px] font-600 uppercase tracking-[.04em]" style={{ background: "rgba(201,162,39,.16)", color: C.gold }}>Cierra 30 jun</span>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 14, marginBottom: 22 }}>
            <PagoStat label="Bruto" value="$4.13M" />
            <PagoStat label="Comisión 7%" value="$289K" color={C.gold} />
            <PagoStat label="Neto a atletas" value="$3.84M" color={C.green} />
          </div>
          <button className="rounded-[10px] px-6 py-3.5 font-display text-[14px] font-600 uppercase tracking-[.04em]" style={{ background: C.gold, color: C.ink }}>Procesar pago de junio</button>
        </section>
        <section style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 16, overflow: "hidden" }}>
          <div className="px-5 pb-3 pt-4 font-display text-[16px] font-600" style={{ borderBottom: `1px solid rgba(255,255,255,.06)` }}>Pagos anteriores</div>
          {DEMO_PayHistory.map((h) => (
            <div key={h.period} className="flex items-center gap-3 px-5 py-3.5" style={{ borderBottom: `1px solid ${C.borderSoft}` }}>
              <span className="h-2 w-2 flex-none rounded-full" style={{ background: C.greenBright }} />
              <div className="min-w-0 flex-1"><div className="text-[13px] font-600">{h.period}</div><div className="text-[11px]" style={{ color: C.txtFaint }}>{h.atletas} atletas · {h.date}</div></div>
              <div className="text-right"><div className="font-display text-[14px] font-600">{h.total}</div><div className="text-[11px]" style={{ color: C.greenBright }}>{h.estado}</div></div>
            </div>
          ))}
        </section>
      </div>
      <ResponsiveCSS />
    </>
  );
}

// ── Hinchas (demo) ───────────────────────────────────────────────────────
function HinchasSection() {
  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 20 }} className="bo-kpis3">
        {DEMO_HinchasKpis.map((k) => <KpiSimple key={k.label} {...k} />)}
      </div>
      <section style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: ".5fr 2fr 1.3fr 1.2fr 1fr", gap: 12, padding: "13px 24px", borderBottom: `1px solid rgba(255,255,255,.06)` }}>
          {["#", "Hincha", "Atletas", "$/mes", "Desde"].map((h, i) => (
            <span key={h} className="text-[11px] font-600 uppercase tracking-[.06em]" style={{ color: C.txtFaint, textAlign: i >= 2 ? "right" : "left" }}>{h}</span>
          ))}
        </div>
        {DEMO_Hinchas.map((h, i) => (
          <div key={h.name} style={{ display: "grid", gridTemplateColumns: ".5fr 2fr 1.3fr 1.2fr 1fr", gap: 12, alignItems: "center", padding: "13px 24px", borderBottom: `1px solid ${C.borderSoft}` }}>
            <div className="flex h-[30px] w-[30px] items-center justify-center rounded-full font-display text-[13px] font-700" style={h.medal ? { background: h.medal, color: C.ink } : { background: "rgba(255,255,255,.07)", color: "rgba(255,255,255,.6)" }}>{i + 1}</div>
            <div className="flex min-w-0 items-center gap-2.5"><div className="flex h-[34px] w-[34px] flex-none items-center justify-center rounded-full font-display text-[13px] font-700" style={{ background: "rgba(255,255,255,.08)" }}>{h.name[0]}</div><span className="truncate text-[14px] font-600">{h.name}</span></div>
            <div className="text-right font-display text-[16px] font-600">{h.atletas}</div>
            <div className="text-right font-display text-[15px] font-600" style={{ color: C.gold }}>{h.mensual}</div>
            <div className="text-right text-[13px]" style={{ color: C.txtDim }}>{h.desde}</div>
          </div>
        ))}
      </section>
      <ResponsiveCSS />
    </>
  );
}

// ── Empresas (demo) ──────────────────────────────────────────────────────
function EmpresasSection() {
  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16 }} className="bo-kpis3">
        {DEMO_Empresas.map((e) => (
          <div key={e.name} className="flex flex-col" style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: 22 }}>
            <div className="mb-4 flex items-center justify-between">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl font-display text-[18px] font-700" style={{ background: e.color, color: "#fff" }}>{e.initial}</div>
              <span className="rounded-full px-2.5 py-[3px] font-display text-[10px] font-600 uppercase tracking-[.04em]" style={{ background: "rgba(255,255,255,.07)", color: "rgba(255,255,255,.65)" }}>{e.type}</span>
            </div>
            <div className="mb-1.5 font-display text-[19px] font-600 leading-tight">{e.name}</div>
            <div className="mb-[18px] flex-1 text-[13px] leading-relaxed" style={{ color: C.txtDim }}>{e.supports}</div>
            <div className="flex items-center justify-between pt-4" style={{ borderTop: `1px solid rgba(255,255,255,.06)` }}>
              <div><div className="font-display text-[20px] font-700 leading-none" style={{ color: C.gold }}>{e.mensual}</div><div className="text-[11px]" style={{ color: C.txtFaint }}>por mes</div></div>
              <span className="rounded-full px-2.5 py-[3px] font-display text-[10px] font-600 uppercase tracking-[.04em]" style={e.estado === "Activo" ? { background: "rgba(34,197,94,.14)", color: C.greenBright } : { background: "rgba(201,162,39,.16)", color: C.gold }}>{e.estado}</span>
            </div>
          </div>
        ))}
      </div>
      <ResponsiveCSS />
    </>
  );
}

// ── Ajustes (demo) ───────────────────────────────────────────────────────
function AjustesSection({ adminEmail }: { adminEmail: string }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, alignItems: "start", maxWidth: 980 }} className="bo-grid">
      <section style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: 24 }}>
        <div className="mb-1 font-display text-[18px] font-600">Comisión de la plataforma</div>
        <p className="m-0 mb-[18px] text-[13px] leading-relaxed" style={{ color: C.txtDim }}>Lo que retiene Granito de cada aporte. El resto va directo al atleta.</p>
        <div className="flex items-end gap-5">
          <div><div className="font-display text-[48px] font-700 leading-none" style={{ color: C.gold }}>7%</div><div className="mt-1 text-[12px]" style={{ color: C.txtFaint }}>plataforma</div></div>
          <div className="flex-1 pb-1.5">
            <div className="flex h-2.5 overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,.07)" }}><div style={{ width: "93%", background: C.green }} /><div style={{ width: "7%", background: C.gold }} /></div>
            <div className="mt-2 text-[12px] font-600" style={{ color: C.green }}>93% al atleta</div>
          </div>
        </div>
      </section>

      <section style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: 24 }}>
        <div className="mb-[18px] font-display text-[18px] font-600">Datos de la organización</div>
        <div className="flex flex-col gap-3.5">
          <SettingRow label="Nombre" value="Granito Asociación Civil" />
          <SettingRow label="Email de contacto" value="hola@granito.com.ar" color={C.celeste} />
          <SettingRow label="CUIT" value="30-71845632-9" />
        </div>
      </section>

      <section style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: 24 }}>
        <div className="mb-[18px] font-display text-[18px] font-600">Medios de pago</div>
        {[{ label: "Mercado Pago", on: true }, { label: "Tarjeta de crédito / débito", on: true }, { label: "Transferencia bancaria", on: true }, { label: "Crypto (USDT)", on: false }].map((t) => (
          <div key={t.label} className="flex items-center justify-between py-3" style={{ borderBottom: `1px solid rgba(255,255,255,.05)` }}>
            <span className="text-[14px]" style={{ color: "rgba(255,255,255,.85)" }}>{t.label}</span>
            <span className="flex h-6 w-[42px] flex-none items-center rounded-full p-[3px]" style={{ background: t.on ? C.green : "rgba(255,255,255,.14)", justifyContent: t.on ? "flex-end" : "flex-start" }}><span className="block h-[18px] w-[18px] rounded-full bg-white" /></span>
          </div>
        ))}
      </section>

      <section style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: 24 }}>
        <div className="mb-[18px] font-display text-[18px] font-600">Equipo</div>
        <div className="flex flex-col gap-3">
          {[{ name: adminEmail || "Pablo Simonet", email: adminEmail || "pablo@granito.com.ar", role: "Admin", color: C.gold }, { name: "Diego Simonet", email: "diego@granito.com.ar", role: "Admin", color: C.blue }, { name: "Pilar Campoy", email: "pilar@granito.com.ar", role: "Revisora", color: "#7A4DD0" }].map((m) => (
            <div key={m.email} className="flex items-center gap-3">
              <div className="flex h-[38px] w-[38px] flex-none items-center justify-center rounded-full font-display text-[14px] font-700" style={{ background: `linear-gradient(135deg,${m.color},#0a1828)`, color: "#fff" }}>{m.name[0].toUpperCase()}</div>
              <div className="min-w-0 flex-1"><div className="truncate text-[14px] font-600">{m.name}</div><div className="truncate text-[12px]" style={{ color: C.txtFaint }}>{m.email}</div></div>
              <span className="rounded-full px-2.5 py-[3px] font-display text-[10px] font-600 uppercase tracking-[.04em]" style={{ background: "rgba(255,255,255,.07)", color: "rgba(255,255,255,.65)" }}>{m.role}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

// ── Modal de aprobación (flujo real, restyle dark) ──────────────────────
function ApprovalModal({
  draft,
  setDraft,
  onSubmit,
  busy,
  onClose,
}: {
  draft: Draft;
  setDraft: (d: Draft | null) => void;
  onSubmit: (e: React.FormEvent) => void;
  busy: boolean;
  onClose: () => void;
}) {
  const [uploading, setUploading] = useState<"primary" | "secondary" | null>(null);
  async function pickPhoto(which: "primary" | "secondary", file: File) {
    setUploading(which);
    const url = await uploadToStorage(file);
    setUploading(null);
    if (!url) return;
    if (which === "primary") setDraft({ ...draft, photo_url: url });
    else setDraft({ ...draft, photo_secondary_url: url });
  }
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 80, background: "rgba(4,10,18,.72)", backdropFilter: "blur(5px)", WebkitBackdropFilter: "blur(5px)", display: "flex", alignItems: "flex-start", justifyContent: "center", overflowY: "auto", padding: 24 }}>
      <form
        onClick={(e) => e.stopPropagation()}
        onSubmit={onSubmit}
        className="my-8 w-full max-w-2xl rounded-2xl p-6"
        style={{ background: C.surface, border: "1px solid rgba(255,255,255,.1)", boxShadow: "0 30px 90px rgba(0,0,0,.65)" }}
      >
        <div className="flex items-center justify-between">
          <div>
            <p className="eyebrow" style={{ color: C.txtFaint }}>Dar de alta</p>
            <h2 className="font-display text-2xl font-700 uppercase tracking-tight text-white">Nuevo atleta</h2>
          </div>
          <button type="button" onClick={onClose} className="text-2xl leading-none" style={{ color: C.txtDim }} aria-label="Cerrar">✕</button>
        </div>
        <p className="mt-1 text-sm" style={{ color: C.txtDim }}>
          Estos datos arman el <strong className="text-white">perfil público</strong> del atleta. Lo marcado con <span style={{ color: C.redBright }}>*</span> es obligatorio.
        </p>

        {/* Fotos */}
        <div className="mt-5">
          <span className="eyebrow" style={{ color: C.txtFaint }}>Fotos (aprobá o quitá)</span>
          <div className="mt-2 grid grid-cols-2 gap-3">
            <ApprovePhoto
              title="Foto de perfil"
              url={draft.photo_url}
              busy={uploading === "primary"}
              onPick={(f) => pickPhoto("primary", f)}
              onRemove={() => setDraft({ ...draft, photo_url: null })}
              onMakePrimary={null}
            />
            <ApprovePhoto
              title="Foto secundaria"
              url={draft.photo_secondary_url}
              busy={uploading === "secondary"}
              onPick={(f) => pickPhoto("secondary", f)}
              onRemove={() => setDraft({ ...draft, photo_secondary_url: null })}
              onMakePrimary={draft.photo_secondary_url ? () => setDraft({ ...draft, photo_url: draft.photo_secondary_url, photo_secondary_url: draft.photo_url }) : null}
            />
          </div>
          {!draft.photo_url && !draft.photo_secondary_url && <p className="mt-2 text-xs" style={{ color: C.txtFaint }}>Sin fotos: el perfil usará un monograma con sus iniciales.</p>}
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <DText label="Nombre completo *" required value={draft.full_name} onChange={(v) => setDraft({ ...draft, full_name: v })} wide />
          <DText label="Nombre (corto) *" required value={draft.first_name} onChange={(v) => setDraft({ ...draft, first_name: v })} hint="Cómo lo llamamos en la página." />
          <DText label="Slug (URL) *" required value={draft.slug} onChange={(v) => setDraft({ ...draft, slug: slugify(v) })} hint="/atleta/este-texto" />
          <label className="block text-sm">
            <span className="eyebrow" style={{ color: C.txtFaint }}>Deporte *</span>
            <select required value={draft.sport} onChange={(e) => setDraft({ ...draft, sport: e.target.value })} style={inputDark}>
              <option value="" disabled>Elegí deporte</option>
              {SPORT_LIST.map((s) => <option key={s.key} value={s.key} style={{ background: C.sidebar }}>{s.label}</option>)}
            </select>
          </label>
          {draft.sport === "atletismo" && (
            <DText label="Prueba (atletismo)" value={draft.discipline} onChange={(v) => setDraft({ ...draft, discipline: v })} hint="Ej: 400m con vallas, salto en largo…" />
          )}
          <DText label="Próxima competencia" value={draft.next_competition} onChange={(v) => setDraft({ ...draft, next_competition: v })} />
          <DText label="Ciudad" value={draft.city} onChange={(v) => setDraft({ ...draft, city: v })} />
          <DText label="Provincia" value={draft.province} onChange={(v) => setDraft({ ...draft, province: v })} />
          <label className="block text-sm">
            <span className="eyebrow" style={{ color: C.txtFaint }}>Meta ($)</span>
            <input type="number" min={0} value={draft.goal_amount} onChange={(e) => setDraft({ ...draft, goal_amount: e.target.value })} style={inputDark} />
          </label>
          <label className="block text-sm">
            <span className="eyebrow" style={{ color: C.txtFaint }}>Alcance</span>
            <select value={draft.scope} onChange={(e) => setDraft({ ...draft, scope: e.target.value as "la2028" | "otros" })} style={inputDark}>
              <option value="la2028" style={{ background: C.sidebar }}>Rumbo a LA 2028</option>
              <option value="otros" style={{ background: C.sidebar }}>Otros atletas argentinos</option>
            </select>
          </label>
          <label className="block text-sm sm:col-span-2">
            <span className="eyebrow" style={{ color: C.txtFaint }}>Historia / bio</span>
            <textarea rows={4} value={draft.bio} onChange={(e) => setDraft({ ...draft, bio: e.target.value })} style={{ ...inputDark, resize: "vertical" }} />
          </label>

          <DText label="Instagram / redes" value={draft.socials} onChange={(v) => setDraft({ ...draft, socials: v })} hint="Usuario o link." />
          <DText label="Mercado Pago" value={draft.payment_mp} onChange={(v) => setDraft({ ...draft, payment_mp: v })} hint="Alias, CVU o email." />
          <DText label="PayPal" value={draft.payment_paypal} onChange={(v) => setDraft({ ...draft, payment_paypal: v })} hint="Email o link de PayPal.me." wide />

          <DPairEditor title="Stats (valor / etiqueta)" rows={draft.stats} placeholders={["Valor (ej. #2)", "Etiqueta (ej. Ranking)"]} onChange={(stats) => setDraft({ ...draft, stats })} />
          <DPairEditor title="Tu aporte financia (título / descripción)" rows={draft.fund_items} placeholders={["Título", "Descripción"]} onChange={(fund_items) => setDraft({ ...draft, fund_items })} />
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button type="button" onClick={onClose} className="rounded-lg px-4 py-2 font-display text-sm font-600 uppercase tracking-wide" style={{ border: "1px solid rgba(255,255,255,.16)", color: "rgba(255,255,255,.8)" }}>Cancelar</button>
          <button type="submit" disabled={busy} className="rounded-lg px-5 py-2 font-display text-sm font-700 uppercase tracking-wide disabled:opacity-60" style={{ background: C.gold, color: C.ink }}>{busy ? "Guardando…" : "Dar de alta"}</button>
        </div>
      </form>
    </div>
  );
}

// ── Átomos ───────────────────────────────────────────────────────────────
function Centered({ children }: { children: React.ReactNode }) {
  return <div className="flex min-h-screen items-center justify-center px-4" style={{ background: C.bg, color: C.txtDim }}>{children}</div>;
}

function Avatar({ name, color, ring, solid }: { name: string; color: string; ring?: boolean; solid?: boolean }) {
  return (
    <div
      className="flex h-[38px] w-[38px] flex-none items-center justify-center rounded-full font-display text-[14px] font-700"
      style={solid ? { background: color, color: "#fff" } : { background: "#0a1828", boxShadow: `0 0 0 1.5px ${color} inset`, color: "#fff" }}
    >
      {initialsOf(name)}
    </div>
  );
}

function SportPill({ label, color }: { label: string; color?: string }) {
  return (
    <span className="inline-block rounded-full px-2.5 py-1 font-display text-[11px] font-600 uppercase tracking-[.04em] text-white" style={{ background: color ?? sportColorByLabel(label) }}>
      {label}
    </span>
  );
}

function StatusChip({ status }: { status: string }) {
  const map: Record<string, { bg: string; c: string; label: string }> = {
    pending: { bg: "rgba(201,162,39,.16)", c: C.gold, label: "Pendiente" },
    approved: { bg: "rgba(34,197,94,.16)", c: C.greenBright, label: "Aprobada" },
    rejected: { bg: "rgba(223,0,36,.14)", c: C.redBright, label: "Rechazada" },
  };
  const s = map[status] ?? map.pending;
  return <span className="flex-none rounded-full px-2.5 py-[3px] font-display text-[10px] font-600 uppercase tracking-[.04em]" style={{ background: s.bg, color: s.c }}>{s.label}</span>;
}

function PayStatus({ status }: { status: string }) {
  const map: Record<string, { bg: string; c: string }> = {
    Acreditado: { bg: "rgba(34,197,94,.14)", c: C.greenBright },
    Pendiente: { bg: "rgba(201,162,39,.16)", c: C.gold },
    Rechazado: { bg: "rgba(223,0,36,.14)", c: C.redBright },
  };
  const s = map[status] ?? map.Pendiente;
  return <span className="rounded-full px-2.5 py-[3px] font-display text-[10px] font-600 uppercase tracking-[.04em]" style={{ background: s.bg, color: s.c }}>{status}</span>;
}

function DemoTag() {
  return <span className="rounded-full px-2 py-0.5 text-[10px] font-600 uppercase tracking-[.06em]" style={{ background: "rgba(201,162,39,.12)", color: C.gold }}>demo</span>;
}

function KpiSimple({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: "20px 22px" }}>
      <div className="mb-2.5 text-[12px] font-600 uppercase tracking-[.04em]" style={{ color: C.txtDim }}>{label}</div>
      <div className="font-display text-[32px] font-700 leading-none">{value}</div>
      <div className="mt-[7px] text-[12px]" style={{ color: C.txtFaint }}>{sub}</div>
    </div>
  );
}

function PagoStat({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div>
      <div className="mb-[5px] text-[11px] uppercase tracking-[.04em]" style={{ color: C.txtFaint }}>{label}</div>
      <div className="font-display text-[24px] font-700" style={{ color: color ?? "#fff" }}>{value}</div>
    </div>
  );
}

function MiniBox({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ background: "#0a1828", border: `1px solid rgba(255,255,255,.06)`, borderRadius: 10, padding: 14 }}>
      <div className="mb-[5px] text-[11px] uppercase tracking-[.04em]" style={{ color: C.txtFaint }}>{label}</div>
      <div className="text-[14px] font-600 leading-snug">{value}</div>
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <div className="mb-2 text-[11px] uppercase tracking-[.04em]" style={{ color: C.txtFaint }}>{children}</div>;
}

function PhotoThumb({ url, label }: { url: string | null; label: string }) {
  return (
    <div>
      <div className="mb-1.5 text-[11px] uppercase tracking-[.04em]" style={{ color: C.txtFaint }}>{label}</div>
      <div className="aspect-[3/4] w-full overflow-hidden rounded-[10px]" style={{ background: "#0a1828", border: `1px solid rgba(255,255,255,.08)` }}>
        {url ? (
          <a href={url} target="_blank" rel="noopener noreferrer" title="Abrir en grande">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt={label} className="h-full w-full object-cover transition-transform hover:scale-105" />
          </a>
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[12px]" style={{ color: C.txtFaint }}>Sin foto</div>
        )}
      </div>
    </div>
  );
}

function DocRow({ ok, name, href }: { ok: boolean; name: string; href?: string | null }) {
  const inner = (
    <div className="flex items-center gap-2.5 rounded-[9px] px-3 py-2.5" style={{ background: "#0a1828", border: `1px solid rgba(255,255,255,.06)` }}>
      <span style={{ color: ok ? C.greenBright : C.gold, fontSize: 14 }}>{ok ? "✓" : "◔"}</span>
      <span className="flex-1 text-[13px]" style={{ color: "rgba(255,255,255,.8)" }}>{name}</span>
      <span className="text-[12px] font-600" style={{ color: ok ? C.greenBright : C.gold }}>{ok ? (href ? "Ver" : "OK") : "Falta"}</span>
    </div>
  );
  return ok && href ? <a href={href} target="_blank" rel="noopener noreferrer">{inner}</a> : inner;
}

function SettingRow({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div>
      <div className="mb-1.5 text-[11px] uppercase tracking-[.04em]" style={{ color: C.txtFaint }}>{label}</div>
      <div className="rounded-[9px] px-3.5 py-2.5 text-[14px]" style={{ background: "#0a1828", border: `1px solid rgba(255,255,255,.08)`, color: color ?? "#fff" }}>{value}</div>
    </div>
  );
}

/** Sube un archivo al bucket público athlete-media y devuelve su URL. */
async function uploadToStorage(file: File): Promise<string | null> {
  const supa = sb();
  if (!supa) return null;
  const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
  const id =
    typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
  const path = `applications/${id}.${ext}`;
  const { error } = await supa.storage
    .from("athlete-media")
    .upload(path, file, { contentType: file.type, upsert: false });
  if (error) return null;
  return supa.storage.from("athlete-media").getPublicUrl(path).data.publicUrl;
}

function ApprovePhoto({
  title,
  url,
  busy,
  onPick,
  onRemove,
  onMakePrimary,
}: {
  title: string;
  url: string | null;
  busy: boolean;
  onPick: (file: File) => void;
  onRemove: () => void;
  onMakePrimary: (() => void) | null;
}) {
  return (
    <div className="rounded-xl p-3" style={{ background: "#0a1828", border: `1px solid rgba(255,255,255,.08)` }}>
      <span className="eyebrow" style={{ color: C.txtFaint }}>{title}</span>
      <div className="mt-2 aspect-[3/4] w-full overflow-hidden rounded-lg" style={{ background: "rgba(255,255,255,.04)" }}>
        {busy ? (
          <div className="flex h-full w-full items-center justify-center text-xs" style={{ color: C.gold }}>Subiendo…</div>
        ) : url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={url} alt={title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs" style={{ color: C.txtFaint }}>Sin foto</div>
        )}
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        <label className="cursor-pointer rounded-md px-2 py-1 text-xs" style={{ border: `1px solid rgba(255,255,255,.12)`, color: C.gold }}>
          {url ? "Reemplazar" : "Subir"}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onPick(f);
              e.target.value = "";
            }}
          />
        </label>
        {url && <button type="button" onClick={onRemove} className="rounded-md px-2 py-1 text-xs" style={{ border: `1px solid rgba(255,255,255,.12)`, color: C.redBright }}>Quitar</button>}
        {url && onMakePrimary && <button type="button" onClick={onMakePrimary} className="rounded-md px-2 py-1 text-xs" style={{ border: `1px solid rgba(255,255,255,.12)`, color: C.celeste }}>Usar como perfil</button>}
      </div>
    </div>
  );
}

function DText({ label, value, onChange, required, wide, hint }: { label: string; value: string; onChange: (v: string) => void; required?: boolean; wide?: boolean; hint?: string }) {
  return (
    <label className={`block text-sm ${wide ? "sm:col-span-2" : ""}`}>
      <span className="eyebrow" style={{ color: C.txtFaint }}>{label}</span>
      {hint && <span className="mt-0.5 block text-xs" style={{ color: C.txtFaint }}>{hint}</span>}
      <input required={required} value={value} onChange={(e) => onChange(e.target.value)} style={inputDark} />
    </label>
  );
}

function DPairEditor({ title, rows, placeholders, onChange }: { title: string; rows: [string, string][]; placeholders: [string, string]; onChange: (rows: [string, string][]) => void }) {
  return (
    <div className="sm:col-span-2">
      <span className="eyebrow" style={{ color: C.txtFaint }}>{title}</span>
      <div className="mt-1 space-y-2">
        {rows.map((row, i) => (
          <div key={i} className="flex gap-2">
            {[0, 1].map((j) => (
              <input
                key={j}
                placeholder={placeholders[j]}
                value={row[j]}
                onChange={(e) => {
                  const next = rows.map((r) => [...r]) as [string, string][];
                  next[i][j] = e.target.value;
                  onChange(next);
                }}
                style={inputDark}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/** Colapsa grids a 1 columna en pantallas chicas. */
function ResponsiveCSS() {
  return (
    <style>{`
      @media (max-width: 1024px) {
        .bo-grid { grid-template-columns: 1fr !important; }
        .bo-kpis { grid-template-columns: repeat(2,1fr) !important; }
        .bo-kpis3 { grid-template-columns: 1fr !important; }
      }
      @media (max-width: 560px) {
        .bo-kpis { grid-template-columns: 1fr !important; }
      }
    `}</style>
  );
}

function timeAgo(iso: string): string {
  const then = new Date(iso).getTime();
  const now = Date.now();
  const mins = Math.round((now - then) / 60000);
  if (mins < 60) return `hace ${Math.max(1, mins)} min`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `hace ${hrs} h`;
  const days = Math.round(hrs / 24);
  if (days === 1) return "ayer";
  return `hace ${days} d`;
}
