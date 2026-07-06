"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { SPORT_LIST, getSport } from "@/config/sports";
import { SEED_TEAMS } from "@/lib/data/teams";
import { formatMoney } from "@/lib/money";

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
  dni: string | null;
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
  first_name: string | null;
  sport: string;
  city: string | null;
  province: string | null;
  raised_amount: number | null;
  verified: boolean | null;
  mp_connected: boolean | null;
  dni: string | null;
  team: string | null;
  bio: string | null;
  next_competition: string | null;
  socials: string | null;
  supporter_message: string | null;
  photo_url: string | null;
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
  goal_amount: number | null;
  goal_purpose: string | null;
  active: boolean | null;
  slug: string | null;
  payment_mp: string | null;
};

/** Compromiso de aporte a un equipo: NO hay dinero cobrado, es una promesa.
 *  Se hace efectiva cuando el admin valida la campaña al finalizar. */
type TeamPledge = {
  id: string;
  team_id: string;
  donor_name: string | null;
  donor_email: string;
  amount: number;
  status: string;
  created_at: string;
};

type MpInfo = {
  id: number;
  nickname: string | null;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  identification: { type: string; number: string } | null;
};
type MpModalState = { athlete: AthleteRow; info: MpInfo | null; error: string | null } | null;

type Phase = "loading" | "noenv" | "login" | "denied" | "ready";
type StatusFilter = "pending" | "approved" | "rejected";
type Section =
  | "Resumen"
  | "Postulaciones"
  | "Atletas"
  | "Equipos"
  | "Selecciones"
  | "Cambios"
  | "Novedades"
  | "Aportes"
  | "Pagos"
  | "Hinchas"
  | "Empresas"
  | "Ajustes";

type ProfileChangeRequest = {
  id: string;
  athlete_id: string;
  athlete_name: string;
  changes: Record<string, string>;
  previous_values: Record<string, string>;
  status: string;
  admin_note: string | null;
  created_at: string;
};

type AdminDonation = {
  id: string;
  athlete_id: string;
  amount: number;
  net_amount: number | null;
  type: string;
  status: string;
  donor_email: string | null;
  created_at: string;
};

type AthleteUpdateRow = {
  id: string;
  athlete_id: string;
  athlete_name: string;
  title: string;
  body: string;
  image_url: string | null;
  status: string;
  admin_note: string | null;
  created_at: string;
};

type Draft = {
  appId: string;
  email: string;
  dni: string;
  slug: string;
  full_name: string;
  first_name: string;
  sport: string;
  discipline: string;
  city: string;
  province: string;
  bio: string;
  goal_amount: string;
  show_goal: boolean;
  team: string;
  scope: "la2028" | "otros";
  next_competition: string;
  photo_url: string | null;
  photo_secondary_url: string | null;
  socials: string;
  payment_mp: string;
  payment_paypal: string;
  /** ¿El atleta ya conectó su MP por OAuth en la postulación? (solo lectura) */
  mp_connected: boolean;
  fund_items: [string, string][];
  supporter_message: string;
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
    email: app.email ?? "",
    dni: app.dni ?? "",
    slug: slugify(app.full_name),
    full_name: app.full_name,
    first_name: app.full_name.split(" ")[0] ?? app.full_name,
    sport: sportKey,
    discipline: app.discipline ?? "",
    city: parts[0] ?? "",
    province: parts[1] ?? parts[0] ?? "",
    bio,
    goal_amount: "10000",
    show_goal: false,
    team: "",
    scope: "la2028",
    next_competition: app.next_competition ?? "",
    photo_url: app.photo_url,
    photo_secondary_url: app.photo_secondary_url,
    socials: app.socials ?? "",
    payment_mp: app.payment_mp ?? "",
    payment_paypal: app.payment_paypal ?? "",
    mp_connected: app.mp_connected ?? false,
    fund_items: [["", ""], ["", ""], ["", ""]],
    supporter_message: "",
  };
}

const NAV_MAIN: { label: Section; icon: string }[] = [
  { label: "Resumen", icon: "◧" },
  { label: "Postulaciones", icon: "◔" },
  { label: "Atletas", icon: "◉" },
  { label: "Equipos", icon: "🛡" },
  { label: "Selecciones", icon: "🇦🇷" },
  { label: "Cambios", icon: "✎" },
  { label: "Novedades", icon: "✦" },
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
  Equipos: { t: "Equipos", s: "Equipos aprobados — objetivos, fechas y estado" },
  Selecciones: { t: "Selecciones nacionales", s: "Los Gladiadores, Las Leonas y compañía — armá los planteles" },
  Cambios: { t: "Cambios de perfil", s: "Pedidos de edición enviados por atletas" },
  Novedades: { t: "Novedades", s: "Publicaciones que los atletas quieren mostrar en su perfil" },
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
  const [teamPledges, setTeamPledges] = useState<TeamPledge[]>([]);
  const [athletes, setAthletes] = useState<AthleteRow[]>([]);
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [loadingList, setLoadingList] = useState(false);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState("");
  // Acción opcional que acompaña al toast (ej: generar link de MP tras el alta).
  const [toastAction, setToastAction] = useState<{ label: string; run: () => void } | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [mpModal, setMpModal] = useState<MpModalState>(null);
  const [profileChanges, setProfileChanges] = useState<ProfileChangeRequest[]>([]);
  const [athleteUpdates, setAthleteUpdates] = useState<AthleteUpdateRow[]>([]);
  const [donations, setDonations] = useState<AdminDonation[]>([]);
  // Modal "pedir más info" a un postulante (email vía Resend, sin mailto).
  const [infoModal, setInfoModal] = useState<Application | null>(null);
  const [infoMsg, setInfoMsg] = useState("");
  const [infoIncludeMp, setInfoIncludeMp] = useState(true);
  const [infoBusy, setInfoBusy] = useState(false);

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
    const [appsRes, athRes, teamRes, pledgesRes, changesRes, updatesRes, donationsRes] = await Promise.all([
      supa.from("athlete_applications").select("*").order("created_at", { ascending: false }),
      supa.from("athletes").select("id,slug,full_name,first_name,sport,city,province,raised_amount,verified,mp_connected,dni,team,bio,next_competition,socials,supporter_message,photo_url").order("raised_amount", { ascending: false }),
      supa.from("team_applications").select("*").order("created_at", { ascending: false }),
      supa.from("team_pledges").select("id,team_id,donor_name,donor_email,amount,status,created_at").order("created_at", { ascending: false }),
      supa
        .from("profile_change_requests")
        .select("id,athlete_id,changes,previous_values,status,admin_note,created_at,athletes(full_name)")
        .order("created_at", { ascending: false }),
      supa
        .from("athlete_updates")
        .select("id,athlete_id,title,body,image_url,status,admin_note,created_at,athletes(full_name)")
        .order("created_at", { ascending: false }),
      supa
        .from("donations")
        .select("id,athlete_id,amount,net_amount,type,status,donor_email,created_at")
        .order("created_at", { ascending: false }),
    ]);
    if (!appsRes.error && appsRes.data) setAllApps(appsRes.data as Application[]);
    if (!athRes.error && athRes.data) setAthletes(athRes.data as AthleteRow[]);
    if (!teamRes.error && teamRes.data) setTeamApps(teamRes.data as TeamApp[]);
    if (!pledgesRes.error && pledgesRes.data) {
      setTeamPledges((pledgesRes.data as TeamPledge[]).map((p) => ({ ...p, amount: Number(p.amount) || 0 })));
    }
    if (!changesRes.error && changesRes.data) {
      setProfileChanges(
        (changesRes.data as unknown as Array<{ id: string; athlete_id: string; changes: Record<string, string>; previous_values: Record<string, string>; status: string; admin_note: string | null; created_at: string; athletes: { full_name: string } | null }>).map((r) => ({
          ...r,
          athlete_name: r.athletes?.full_name ?? "Atleta desconocido",
        })),
      );
    }
    if (!donationsRes.error && donationsRes.data) setDonations(donationsRes.data as AdminDonation[]);
    if (!updatesRes.error && updatesRes.data) {
      setAthleteUpdates(
        (updatesRes.data as unknown as Array<{ id: string; athlete_id: string; title: string; body: string; image_url: string | null; status: string; admin_note: string | null; created_at: string; athletes: { full_name: string } | null }>).map((r) => ({
          ...r,
          athlete_name: r.athletes?.full_name ?? "Atleta desconocido",
        })),
      );
    }
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
    const fund = draft.fund_items.filter(([t, d]) => t.trim() || d.trim());
    const { data, error } = await supa
      .from("athletes")
      .insert({
        slug: draft.slug,
        full_name: draft.full_name,
        first_name: draft.first_name,
        email: draft.email || null,
        dni: draft.dni || null,
        sport: draft.sport,
        discipline: draft.discipline,
        city: draft.city,
        province: draft.province,
        bio: draft.bio,
        goal_amount: Number(draft.goal_amount) || 0,
        show_goal: draft.show_goal,
        team: draft.team || null,
        raised_amount: 0,
        // Nace oculto: solo se publica cuando tiene una vía de cobro (MP OAuth)
        // conectada. Si conectó en la postulación, lo publicamos abajo.
        verified: false,
        scope: draft.scope,
        next_competition: draft.next_competition || null,
        photo_url: draft.photo_url,
        photo_secondary_url: draft.photo_secondary_url,
        socials: draft.socials || null,
        payment_mp: draft.payment_mp || null,
        payment_paypal: draft.payment_paypal || null,
        stats: [],
        fund_items: fund,
        supporter_message: draft.supporter_message.trim() || null,
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
    const hasMp = mpMigrated === true;

    // Solo se publica (verified) si tiene MP conectado. Si no, queda oculto
    // hasta que el atleta lo conecte (y ahí se publica solo — ver mp-oauth-callback).
    if (hasMp) {
      await supa.from("athletes").update({ verified: true }).eq("id", data.id);
    }

    // Invitar al atleta por email para que active su cuenta.
    let inviteOk = false;
    if (draft.email) {
      const { error: inviteErr } = await supa.functions.invoke("invite-athlete", {
        body: { athlete_id: data.id },
      });
      inviteOk = !inviteErr;
    }

    setBusy(false);
    const newAthleteName = draft.full_name;
    const newAthleteId = data.id;
    if (hasMp) {
      setToastAction(null);
      setToast(
        `¡${newAthleteName} dado de alta y publicado! MP conectado ✓.${inviteOk ? ` Invitación enviada a ${draft.email}.` : ""}  Acordate de "Publicar ahora".`,
      );
    } else {
      // Sin MP: creado pero NO público. Ofrecemos generar el link ya.
      setToast(
        `${newAthleteName} quedó creado, pero NO está público hasta que conecte su Mercado Pago.${inviteOk ? ` Le mandamos el email para que lo haga.` : ""} Se publica solo cuando lo conecte.`,
      );
      setToastAction({
        label: "Generar link de MP ahora",
        run: () => genMpLink({ id: newAthleteId, full_name: newAthleteName } as AthleteRow),
      });
    }
    setDraft(null);
    loadApps();
  }

  async function handlePublish() {
    const supa = sb();
    if (!supa) return;
    setPublishing(true);
    setToastAction(null);
    setToast("");
    const { error } = await supa.functions.invoke("trigger-rebuild");
    setPublishing(false);
    setToast(
      error
        ? "No se pudo disparar la publicación (¿está configurada la función trigger-rebuild?): " + error.message
        : "🚀 Publicación disparada. Tarda ~2-3 min en reconstruirse y hasta ~10 min más en actualizarse en todos lados (caché de GitHub). Si no lo ves enseguida, recargá con Cmd+Shift+R o esperá unos minutos.",
    );
  }

  async function handleToggleStatus(athlete: AthleteRow) {
    const supa = sb();
    if (!supa) return;
    const next = !athlete.verified;
    const msg = next
      ? `¿Reactivar a ${athlete.full_name}?`
      : `¿Suspender a ${athlete.full_name}? No podrá recibir aportes.`;
    if (!confirm(msg)) return;
    const { error } = await supa.from("athletes").update({ verified: next }).eq("id", athlete.id);
    if (error) { setToast("Error: " + error.message); return; }
    setToast(`${athlete.full_name} ${next ? "reactivado ✓" : "suspendido."}`);
    loadApps();
  }

  async function handleSetTeam(athlete: AthleteRow, teamSlug: string) {
    const supa = sb();
    if (!supa) return;
    // Optimista: reflejamos el cambio en la lista al toque.
    setAthletes((prev) => prev.map((a) => a.id === athlete.id ? { ...a, team: teamSlug || null } : a));
    const { error } = await supa.from("athletes").update({ team: teamSlug || null }).eq("id", athlete.id);
    if (error) { setToast("Error al asignar la selección: " + error.message); loadApps(); return; }
    const teamName = SEED_TEAMS.find((t) => t.slug === teamSlug)?.name;
    setToast(teamSlug ? `${athlete.full_name} → ${teamName}. Tocá "Publicar ahora".` : `${athlete.full_name} sin selección.`);
  }

  /** Edición directa del perfil de un atleta desde el backoffice: se publica
   *  al instante (el equipo tiene control total sobre lo publicado). */
  async function handleSaveAthlete(athlete: AthleteRow, patch: Partial<AthleteRow>) {
    const supa = sb();
    if (!supa) return;
    setAthletes((prev) => prev.map((a) => a.id === athlete.id ? { ...a, ...patch } : a));
    const { error } = await supa.from("athletes").update(patch).eq("id", athlete.id);
    if (error) { setToast("Error al guardar el perfil: " + error.message); loadApps(); return; }
    setToast(`✓ Perfil de ${athlete.full_name} actualizado. Tocá "Publicar ahora" para verlo en su perfil.`);
  }

  // ── Equipos: mismo control que atletas (aprobar, editar, activar/suspender) ──
  async function handleApproveTeam(team: TeamApp) {
    const supa = sb();
    if (!supa) return;
    // El slug hace pública la campaña en /equipos/[slug] (tras "Publicar ahora").
    const slug = team.slug || slugify(team.team_name);
    const { error } = await supa
      .from("team_applications")
      .update({ status: "approved", active: true, slug, reviewed_at: new Date().toISOString() })
      .eq("id", team.id);
    if (error) { setToast("Error al aprobar: " + error.message); return; }
    setTeamApps((prev) => prev.map((t) => t.id === team.id ? { ...t, status: "approved", active: true, slug } : t));
    setToast(`✓ ${team.team_name} aprobado. Cargale el objetivo en "Equipos" y tocá "Publicar ahora" para que su campaña salga en el sitio.`);
  }

  /** Valida los compromisos de una campaña terminada: los pasa a 'validated'.
   *  Recién acá se gestiona el cobro real (link de pago a cada donante) —
   *  hasta este momento nadie pagó nada. */
  async function handleValidatePledges(team: TeamApp, pledges: TeamPledge[]) {
    const supa = sb();
    if (!supa) return;
    const pending = pledges.filter((p) => p.status === "pledged");
    if (pending.length === 0) { setToast("No hay compromisos pendientes de validar."); return; }
    const total = pending.reduce((s, p) => s + p.amount, 0);
    if (!confirm(`¿Validar ${pending.length} compromiso(s) por ${formatMoney(total)} de la campaña de ${team.team_name}? Después hay que enviar los links de pago a los donantes.`)) return;
    const { error } = await supa
      .from("team_pledges")
      .update({ status: "validated", validated_at: new Date().toISOString() })
      .eq("team_id", team.id)
      .eq("status", "pledged");
    if (error) { setToast("Error al validar: " + error.message); return; }
    setTeamPledges((prev) => prev.map((p) => p.team_id === team.id && p.status === "pledged" ? { ...p, status: "validated" } : p));
    setToast(`✓ ${pending.length} compromisos validados (${formatMoney(total)}). Ahora enviá los links de pago a los donantes.`);
  }

  async function handleRejectTeam(team: TeamApp) {
    const supa = sb();
    if (!supa) return;
    if (!confirm(`¿Rechazar la postulación de ${team.team_name}?`)) return;
    const { error } = await supa
      .from("team_applications")
      .update({ status: "rejected", reviewed_at: new Date().toISOString() })
      .eq("id", team.id);
    if (error) { setToast("Error al rechazar: " + error.message); return; }
    setTeamApps((prev) => prev.map((t) => t.id === team.id ? { ...t, status: "rejected" } : t));
    setToast(`Postulación de ${team.team_name} rechazada.`);
  }

  async function handleToggleTeamActive(team: TeamApp) {
    const supa = sb();
    if (!supa) return;
    const next = !team.active;
    const msg = next ? `¿Reactivar a ${team.team_name}?` : `¿Suspender a ${team.team_name}?`;
    if (!confirm(msg)) return;
    const { error } = await supa.from("team_applications").update({ active: next }).eq("id", team.id);
    if (error) { setToast("Error: " + error.message); return; }
    setTeamApps((prev) => prev.map((t) => t.id === team.id ? { ...t, active: next } : t));
    setToast(`${team.team_name} ${next ? "reactivado ✓" : "suspendido."}`);
  }

  async function handleSaveTeam(team: TeamApp, patch: Partial<TeamApp>) {
    const supa = sb();
    if (!supa) return;
    setTeamApps((prev) => prev.map((t) => t.id === team.id ? { ...t, ...patch } : t));
    const { error } = await supa.from("team_applications").update(patch).eq("id", team.id);
    if (error) { setToast("Error al guardar el equipo: " + error.message); loadApps(); return; }
    setToast(`✓ ${team.team_name} actualizado.`);
  }

  async function handleViewMpInfo(athlete: AthleteRow) {
    const supa = sb();
    if (!supa) return;
    setMpModal({ athlete, info: null, error: null });
    const { data, error } = await supa.functions.invoke("mp-account-info", {
      body: { athlete_id: athlete.id },
    });
    if (error) {
      setMpModal({ athlete, info: null, error: error.message });
      return;
    }
    if (data?.error) {
      setMpModal({ athlete, info: null, error: data.error });
      return;
    }
    setMpModal({ athlete, info: data as MpInfo, error: null });
  }

  /** Manda (o re-manda) el email de acceso al atleta: crea su cuenta si no
   *  existe y le llega el link para activarla y crear su contraseña. */
  async function sendAccess(athlete: AthleteRow) {
    const supa = sb();
    if (!supa) return;
    setToastAction(null);
    setToast(`Enviando acceso a ${athlete.full_name}…`);
    const { data, error } = await supa.functions.invoke("invite-athlete", {
      body: { athlete_id: athlete.id },
    });
    if (error || data?.error) {
      setToast(`No se pudo enviar el acceso: ${error?.message ?? data?.error}`);
      return;
    }
    setToast(
      `✓ Email de acceso ${data?.resent ? "reenviado" : "enviado"} a ${athlete.full_name}. Le llega un link para activar su cuenta y crear su contraseña.`,
    );
  }

  /** Genera el link de conexión de Mercado Pago de un atleta y lo abre. */
  async function genMpLink(athlete: AthleteRow) {
    const supa = sb();
    if (!supa) return;
    setToastAction(null);
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

  /** Abre el modal para pedirle info al postulante SIN salir del backoffice. */
  function askMoreInfo(app: Application) {
    setInfoModal(app);
    setInfoMsg(
      "¡Gracias por postularte! Tu historia nos encantó. Para terminar de aprobar tu perfil nos falta que completes un par de datos:\n\n- ",
    );
    setInfoIncludeMp(!app.mp_connected);
    setInfoBusy(false);
  }

  async function sendInfoRequest() {
    const supa = sb();
    if (!supa || !infoModal || infoBusy) return;
    setInfoBusy(true);
    const { data, error } = await supa.functions.invoke("request-info", {
      body: {
        application_id: infoModal.id,
        message: infoMsg.trim(),
        include_mp_link: infoIncludeMp,
      },
    });
    setInfoBusy(false);
    if (error || data?.error) {
      setToast("No se pudo enviar el pedido: " + (error?.message ?? data?.error));
      return;
    }
    setToast(
      `✓ Email enviado a ${infoModal.full_name}${data?.mp_link_included ? " (con el link para conectar su Mercado Pago)" : ""}.`,
    );
    setInfoModal(null);
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
            <NavItem key={n.label} item={n} active={active === n.label} badge={
              n.label === "Postulaciones" && counts.pending ? String(counts.pending) :
              n.label === "Cambios" && profileChanges.filter((c) => c.status === "pending").length ? String(profileChanges.filter((c) => c.status === "pending").length) :
              n.label === "Novedades" && athleteUpdates.filter((u) => u.status === "pending").length ? String(athleteUpdates.filter((u) => u.status === "pending").length) :
              null
            } onClick={() => setActive(n.label)} />
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
          {toast && (
            <div
              className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl px-4 py-3 text-sm"
              style={{ background: C.surface, border: `1px solid rgba(108,180,228,.4)`, color: "#fff" }}
            >
              <span>{toast}</span>
              {toastAction && (
                <button
                  onClick={() => { toastAction.run(); setToastAction(null); }}
                  className="shrink-0 rounded-[9px] px-4 py-2 font-display text-[12px] font-600 uppercase tracking-[.04em]"
                  style={{ background: "#009ee3", color: "#fff" }}
                >
                  {toastAction.label}
                </button>
              )}
            </div>
          )}

          {/* ===== RESUMEN ===== */}
          {active === "Resumen" && (() => {
            const confirmadas = donations.filter((d) => d.status === "completed");
            const donantes = new Set(confirmadas.map((d) => d.donor_email).filter(Boolean)).size;
            const athName = (id: string) => athletes.find((a) => a.id === id)?.full_name ?? "un atleta";
            return (
              <ResumenSection
                kpis={[
                  { label: "Aportado total", value: formatMoney(confirmadas.reduce((s, d) => s + Number(d.amount), 0)), icon: "◈", color: C.gold, delta: "", deltaColor: C.txtFaint, sub: `${confirmadas.length} ${confirmadas.length === 1 ? "aporte confirmado" : "aportes confirmados"}` },
                  { label: "Atletas publicados", value: String(athletes.filter((a) => a.verified).length), icon: "◉", color: C.blue, delta: "", deltaColor: C.greenBright, sub: athletes.some((a) => !a.verified && !a.mp_connected) ? `${athletes.filter((a) => !a.verified && !a.mp_connected).length} esperando MP` : "en la web" },
                  { label: "Postulaciones", value: String(counts.pending), icon: "◔", color: C.red, delta: "", deltaColor: C.gold, sub: "sin revisar" },
                  { label: "Donantes", value: String(donantes), icon: "♥", color: C.green, delta: "", deltaColor: C.txtFaint, sub: "personas que aportaron" },
                ]}
                apps={allApps.filter((a) => a.status === "pending").slice(0, 6)}
                pendingCount={counts.pending}
                activity={donations.slice(0, 6).map((d) => ({
                  text: `${d.donor_email ?? "Alguien"} aportó ${formatMoney(Number(d.amount))} a ${athName(d.athlete_id)}`,
                  ago: timeAgo(d.created_at),
                  color: d.status === "completed" ? C.greenBright : d.status === "pending" ? C.gold : C.redBright,
                }))}
                onReview={() => setActive("Postulaciones")}
                onApprove={(app) => { setActive("Postulaciones"); setFilter("pending"); setSelectedAppId(app.id); setDraft(buildDraft(app)); }}
              />
            );
          })()}

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
              onApproveTeam={handleApproveTeam}
              onRejectTeam={handleRejectTeam}
              onSaveTeam={handleSaveTeam}
            />
          )}

          {/* ===== ATLETAS ===== */}
          {active === "Atletas" && <AtletasSection athletes={athletes} loading={loadingList} onConnect={genMpLink} onToggleStatus={handleToggleStatus} onViewMpInfo={handleViewMpInfo} onSetTeam={handleSetTeam} onSendAccess={sendAccess} onSave={handleSaveAthlete} />}

          {/* ===== EQUIPOS ===== */}
          {active === "Equipos" && (
            <EquiposSection
              teams={teamApps}
              pledges={teamPledges}
              loading={loadingList}
              onToggleActive={handleToggleTeamActive}
              onSave={handleSaveTeam}
              onValidatePledges={handleValidatePledges}
            />
          )}

          {/* ===== SELECCIONES ===== */}
          {active === "Selecciones" && (
            <SeleccionesSection athletes={athletes} loading={loadingList} onSetTeam={handleSetTeam} />
          )}

          {/* ===== CAMBIOS DE PERFIL ===== */}
          {active === "Cambios" && (
            <CambiosSection
              items={profileChanges}
              loading={loadingList}
              onApprove={async (item, edited) => {
                const supa = sb();
                if (!supa) return;
                // El equipo puede haber corregido faltas antes de publicar:
                // usamos los valores editados y también los guardamos en el
                // registro, para que quede constancia de lo que se publicó.
                const changes = edited ?? item.changes;
                await supa.from("athletes").update(changes).eq("id", item.athlete_id);
                await supa.from("profile_change_requests").update({ status: "approved", changes }).eq("id", item.id);
                setProfileChanges((prev) => prev.map((c) => c.id === item.id ? { ...c, status: "approved", changes } : c));
                // Reflejar el cambio publicado en la lista de atletas cargada en memoria.
                setAthletes((prev) => prev.map((a) => a.id === item.athlete_id ? { ...a, ...changes } as AthleteRow : a));
                setToast(`✓ Cambios de ${item.athlete_name} aprobados y publicados.`);
              }}
              onReject={async (item, note) => {
                const supa = sb();
                if (!supa) return;
                await supa.from("profile_change_requests").update({ status: "rejected", admin_note: note || null }).eq("id", item.id);
                setProfileChanges((prev) => prev.map((c) => c.id === item.id ? { ...c, status: "rejected", admin_note: note || null } : c));
                setToast(`Cambios de ${item.athlete_name} rechazados.`);
              }}
            />
          )}

          {/* ===== NOVEDADES ===== */}
          {active === "Novedades" && (
            <NovedadesSection
              items={athleteUpdates}
              loading={loadingList}
              onApprove={async (item) => {
                const supa = sb();
                if (!supa) return;
                await supa.from("athlete_updates").update({ status: "approved" }).eq("id", item.id);
                setAthleteUpdates((prev) => prev.map((u) => u.id === item.id ? { ...u, status: "approved" } : u));
                setToast(`✓ Novedad de ${item.athlete_name} aprobada. Tocá "Publicar ahora" para verla en su perfil.`);
              }}
              onReject={async (item, note) => {
                const supa = sb();
                if (!supa) return;
                await supa.from("athlete_updates").update({ status: "rejected", admin_note: note || null }).eq("id", item.id);
                setAthleteUpdates((prev) => prev.map((u) => u.id === item.id ? { ...u, status: "rejected", admin_note: note || null } : u));
                setToast(`Novedad de ${item.athlete_name} rechazada.`);
              }}
            />
          )}

          {/* ===== APORTES ===== */}
          {active === "Aportes" && <AportesSection donations={donations} athletes={athletes} />}

          {/* ===== PAGOS ===== */}
          {active === "Pagos" && <PagosSection />}

          {/* ===== HINCHAS ===== */}
          {active === "Hinchas" && <HinchasSection donations={donations} />}

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

      {/* ===== Modal de info de MP ===== */}
      {mpModal && <MpInfoModal modal={mpModal} onClose={() => setMpModal(null)} />}

      {/* ===== Modal: pedir más info al postulante (sin salir del backoffice) ===== */}
      {infoModal && (
        <div
          onClick={() => setInfoModal(null)}
          style={{ position: "fixed", inset: 0, zIndex: 90, background: "rgba(4,10,18,.78)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ width: "100%", maxWidth: 520, background: C.surface, border: "1px solid rgba(255,255,255,.1)", borderRadius: 20, padding: 28, boxShadow: "0 30px 90px rgba(0,0,0,.65)" }}
          >
            <div className="mb-1 font-display text-[11px] uppercase tracking-[.14em]" style={{ color: C.gold }}>Pedir más info</div>
            <h2 className="m-0 mb-1 font-display text-[22px] font-600 leading-tight">{infoModal.full_name}</h2>
            <p className="mb-4 text-[13px]" style={{ color: C.txtDim }}>
              El email sale desde GRANITO (no-reply@somosgranito.com) a <strong style={{ color: "#fff" }}>{infoModal.email}</strong>. Si responde, llega a hola@somosgranito.com.
            </p>

            <textarea
              rows={6}
              value={infoMsg}
              onChange={(e) => setInfoMsg(e.target.value)}
              placeholder="Contale qué te falta para aprobar su perfil…"
              className="w-full resize-none rounded-[10px] p-3.5 text-[14px] leading-relaxed text-white outline-none placeholder:text-white/30"
              style={{ background: C.sidebar, border: "1px solid rgba(255,255,255,.12)" }}
            />

            <label className="mt-3 flex cursor-pointer items-start gap-2.5 text-[13px]" style={{ color: infoModal.mp_connected ? C.txtFaint : "rgba(255,255,255,.8)" }}>
              <input
                type="checkbox"
                checked={infoIncludeMp && !infoModal.mp_connected}
                disabled={!!infoModal.mp_connected}
                onChange={(e) => setInfoIncludeMp(e.target.checked)}
                style={{ marginTop: 2, accentColor: "#009ee3", width: 15, height: 15 }}
              />
              <span>
                {infoModal.mp_connected
                  ? "Ya conectó su Mercado Pago ✓ (no hace falta el link)"
                  : <>Incluir botón <strong style={{ color: "#6cb4e4" }}>“Conectar mi Mercado Pago”</strong> (link seguro atado a su postulación, vale 30 días)</>}
              </span>
            </label>

            <div className="mt-5 flex gap-3">
              <button
                onClick={() => setInfoModal(null)}
                className="flex-1 rounded-[10px] py-3 font-display text-[13px] font-600 uppercase tracking-wide"
                style={{ border: "1px solid rgba(255,255,255,.15)", color: C.txtDim }}
              >
                Cancelar
              </button>
              <button
                onClick={sendInfoRequest}
                disabled={infoBusy || !infoMsg.trim()}
                className="flex-1 rounded-[10px] py-3 font-display text-[13px] font-600 uppercase tracking-wide disabled:opacity-50"
                style={{ background: C.gold, color: C.ink }}
              >
                {infoBusy ? "Enviando…" : "Enviar pedido"}
              </button>
            </div>
          </div>
        </div>
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
  activity,
  onReview,
  onApprove,
}: {
  kpis: { label: string; value: string; icon: string; color: string; delta: string; deltaColor: string; sub: string }[];
  apps: Application[];
  pendingCount: number;
  activity: { text: string; ago: string; color: string }[];
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

        {/* columna derecha: reparto + actividad real */}
        <div className="flex flex-col gap-[18px]">
          <section style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden" }}>
            <div className="px-5 pb-3.5 pt-[18px]" style={{ borderBottom: `1px solid rgba(255,255,255,.06)` }}>
              <h2 className="m-0 font-display text-[18px] font-600">Reparto automático</h2>
            </div>
            <div className="px-5 py-[18px]">
              <div className="flex h-2 overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,.07)" }}>
                <div style={{ width: "93%", background: C.green }} /><div style={{ width: "7%", background: C.gold }} />
              </div>
              <div className="mt-2 flex justify-between text-[11px]" style={{ color: C.txtDim }}>
                <span><strong style={{ color: C.green }}>93%</strong> a atletas</span>
                <span><strong style={{ color: C.gold }}>7%</strong> plataforma</span>
              </div>
              <p className="mt-3 text-[12px] leading-relaxed" style={{ color: C.txtFaint }}>
                Mercado Pago acredita cada aporte directo en la cuenta del atleta
                al momento del pago. No hay pagos manuales que procesar.
              </p>
            </div>
          </section>

          <section style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden" }}>
            <div className="px-5 pb-3.5 pt-[18px]" style={{ borderBottom: `1px solid rgba(255,255,255,.06)` }}>
              <h2 className="m-0 font-display text-[18px] font-600">Últimos aportes</h2>
            </div>
            <div className="py-1.5">
              {activity.length === 0 && (
                <div className="px-5 py-6 text-[13px]" style={{ color: C.txtFaint }}>Todavía no hubo aportes.</div>
              )}
              {activity.map((ac, i) => (
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
  onApproveTeam,
  onRejectTeam,
  onSaveTeam,
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
  onApproveTeam: (team: TeamApp) => Promise<void>;
  onRejectTeam: (team: TeamApp) => Promise<void>;
  onSaveTeam: (team: TeamApp, patch: Partial<TeamApp>) => Promise<void>;
}) {
  const [editingTeam, setEditingTeam] = useState<TeamApp | null>(null);
  // En Postulaciones solo mostramos los equipos PENDIENTES (los aprobados
  // pasan a la sección "Equipos"). Espejo del flujo de atletas.
  const pendingTeams = teamApps.filter((t) => t.status === "pending");
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

      {/* ── Equipos postulados (pendientes) ── */}
      <div className="mt-9">
        <div className="mb-3 flex items-center gap-2.5">
          <h2 className="m-0 font-display text-[19px] font-600">Equipos postulados</h2>
          <span className="rounded-full px-2.5 py-0.5 font-display text-[12px] font-600" style={{ background: "rgba(255,255,255,.08)", color: "rgba(255,255,255,.65)" }}>
            {pendingTeams.length}
          </span>
        </div>
        {pendingTeams.length === 0 ? (
          <div className="rounded-[13px] px-6 py-10 text-center text-[13px]" style={{ border: `1px dashed ${C.border}`, color: C.txtDim }}>
            No hay equipos pendientes de revisión.
          </div>
        ) : (
          <section style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1.3fr 1.2fr 1.4fr", gap: 12, padding: "13px 22px", borderBottom: `1px solid rgba(255,255,255,.06)` }}>
              {["Equipo", "Deporte", "Competencia", "Campaña", "Acciones"].map((h, i) => (
                <span key={h} className="text-[11px] font-600 uppercase tracking-[.06em]" style={{ color: C.txtFaint, textAlign: i === 4 ? "right" : "left" }}>{h}</span>
              ))}
            </div>
            {pendingTeams.map((t) => (
              <div key={t.id} style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1.3fr 1.2fr 1.4fr", gap: 12, alignItems: "center", padding: "14px 22px", borderBottom: `1px solid ${C.borderSoft}` }}>
                <div className="min-w-0">
                  <div className="truncate text-[14px] font-600">{t.team_name}</div>
                  <div className="text-[11px]" style={{ color: C.txtFaint }}>{timeAgo(t.created_at)} · {t.email}</div>
                </div>
                <div><SportPill label={t.sport} /></div>
                <div className="truncate text-[13px]" style={{ color: "rgba(255,255,255,.7)" }}>{t.competition ?? "—"}</div>
                <div className="text-[12px]" style={{ color: C.txtDim }}>
                  {t.fundraising_start || t.fundraising_end
                    ? `${t.fundraising_start ?? "?"} → ${t.fundraising_end ?? "?"}`
                    : "—"}
                </div>
                <div className="flex items-center justify-end gap-1.5">
                  <button
                    onClick={() => setEditingTeam(t)}
                    title="Revisar y editar antes de aprobar"
                    className="rounded-full px-3 py-[5px] font-display text-[11px] font-600 uppercase tracking-[.04em]"
                    style={{ background: "rgba(108,180,228,.12)", border: `1px solid rgba(108,180,228,.4)`, color: C.celeste, cursor: "pointer" }}
                  >
                    Ver / editar
                  </button>
                  <button
                    onClick={() => onRejectTeam(t)}
                    className="rounded-full px-3 py-[5px] font-display text-[11px] font-600 uppercase tracking-[.04em]"
                    style={{ background: "rgba(223,0,36,.14)", border: "none", color: C.redBright, cursor: "pointer" }}
                  >
                    Rechazar
                  </button>
                  <button
                    onClick={() => onApproveTeam(t)}
                    className="rounded-full px-3 py-[5px] font-display text-[11px] font-600 uppercase tracking-[.04em] text-white"
                    style={{ background: C.green, border: "none", cursor: "pointer" }}
                  >
                    Aprobar
                  </button>
                </div>
              </div>
            ))}
          </section>
        )}
      </div>

      {editingTeam && (
        <TeamEditModal
          team={editingTeam}
          onClose={() => setEditingTeam(null)}
          onSave={onSaveTeam}
          onApprove={onApproveTeam}
        />
      )}

      <ResponsiveCSS />
    </>
  );
}

// ── Equipos (aprobados): mismo control que atletas ───────────────────────
function EquiposSection({
  teams,
  pledges,
  loading,
  onToggleActive,
  onSave,
  onValidatePledges,
}: {
  teams: TeamApp[];
  pledges: TeamPledge[];
  loading: boolean;
  onToggleActive: (t: TeamApp) => void;
  onSave: (t: TeamApp, patch: Partial<TeamApp>) => Promise<void>;
  onValidatePledges: (t: TeamApp, pledges: TeamPledge[]) => Promise<void>;
}) {
  const [editing, setEditing] = useState<TeamApp | null>(null);
  const [viewingPledges, setViewingPledges] = useState<TeamApp | null>(null);
  const approved = teams.filter((t) => t.status === "approved");
  const cols = "1.5fr .9fr 1.2fr .9fr 1fr 1.1fr .75fr .55fr";

  function pledgedOf(teamId: string): { total: number; count: number } {
    const list = pledges.filter((p) => p.team_id === teamId && p.status !== "cancelled");
    return { total: list.reduce((s, p) => s + p.amount, 0), count: list.length };
  }

  return (
    <section style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden" }}>
      <div style={{ display: "grid", gridTemplateColumns: cols, gap: 12, padding: "13px 24px", borderBottom: `1px solid rgba(255,255,255,.06)` }}>
        {["Equipo", "Deporte", "Competencia", "Objetivo", "Prometido", "Campaña", "Estado", "Editar"].map((h, i) => (
          <span key={h} className="text-[11px] font-600 uppercase tracking-[.06em]" style={{ color: C.txtFaint, textAlign: i >= 3 ? "right" : "left" }}>{h}</span>
        ))}
      </div>
      {loading && <div className="px-6 py-10 text-center text-[13px]" style={{ color: C.txtDim }}>Cargando…</div>}
      {!loading && approved.length === 0 && (
        <div className="px-6 py-12 text-center text-[13px]" style={{ color: C.txtDim }}>
          Todavía no hay equipos aprobados. Aprobá una postulación desde “Postulaciones”.
        </div>
      )}
      {approved.map((t) => {
        const pl = pledgedOf(t.id);
        const goal = t.goal_amount ?? 0;
        const pct = goal > 0 ? Math.round((pl.total / goal) * 100) : null;
        return (
          <div key={t.id} style={{ display: "grid", gridTemplateColumns: cols, gap: 12, alignItems: "center", padding: "14px 24px", borderBottom: `1px solid ${C.borderSoft}` }}>
            <div className="min-w-0">
              <div className="truncate text-[14px] font-600">{t.team_name}</div>
              <div className="truncate text-[11px]" style={{ color: C.txtFaint }}>
                {t.slug ? `/equipos/${t.slug}` : "sin slug"} · {t.contact_name ?? t.email}
              </div>
            </div>
            <div><SportPill label={t.sport} /></div>
            <div className="truncate text-[13px]" style={{ color: "rgba(255,255,255,.7)" }}>{t.competition ?? "—"}</div>
            <div className="text-right font-display text-[14px] font-600" style={{ color: C.gold }}>
              {goal > 0 ? formatMoney(goal) : "—"}
            </div>
            <div className="text-right">
              <button
                onClick={() => setViewingPledges(t)}
                title="Ver los compromisos de aporte (nadie pagó todavía: se cobran al validar la campaña)"
                className="rounded-[8px] px-2 py-1 text-right transition-opacity hover:opacity-75"
                style={{ background: "transparent", border: "none", cursor: "pointer" }}
              >
                <span className="font-display text-[14px] font-600 tabular-nums" style={{ color: pl.total > 0 ? C.celeste : C.txtDim }}>
                  {formatMoney(pl.total)}
                </span>
                <span className="block text-[10px]" style={{ color: C.txtFaint }}>
                  {pl.count} compromiso{pl.count === 1 ? "" : "s"}{pct !== null ? ` · ${pct}%` : ""}
                </span>
              </button>
            </div>
            <div className="text-right text-[12px]" style={{ color: C.txtDim }}>
              {t.fundraising_start || t.fundraising_end ? `${t.fundraising_start ?? "?"} → ${t.fundraising_end ?? "?"}` : "—"}
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => onToggleActive(t)}
                title={t.active ? "Suspender equipo" : "Reactivar equipo"}
                className="rounded-full px-2.5 py-[3px] font-display text-[10px] font-600 uppercase tracking-[.04em] transition-opacity hover:opacity-70"
                style={t.active
                  ? { background: "rgba(34,197,94,.14)", color: C.greenBright, border: "none", cursor: "pointer" }
                  : { background: "rgba(223,0,36,.12)", color: C.redBright, border: "none", cursor: "pointer" }}
              >
                {t.active ? "Activo" : "Suspendido"}
              </button>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setEditing(t)}
                title="Editar el equipo (objetivo, fechas, competencia, contacto, MP)"
                className="flex h-[26px] w-[26px] items-center justify-center rounded-full text-[12px] transition-opacity hover:opacity-70"
                style={{ background: "rgba(108,180,228,.14)", color: C.celeste, border: "none", cursor: "pointer" }}
              >
                ✎
              </button>
            </div>
          </div>
        );
      })}
      {editing && (
        <TeamEditModal team={editing} onClose={() => setEditing(null)} onSave={onSave} />
      )}
      {viewingPledges && (
        <TeamPledgesModal
          team={viewingPledges}
          pledges={pledges.filter((p) => p.team_id === viewingPledges.id)}
          onClose={() => setViewingPledges(null)}
          onValidate={onValidatePledges}
        />
      )}
    </section>
  );
}

// ── Modal de compromisos de una campaña (validación al cierre) ────────────
function TeamPledgesModal({
  team,
  pledges,
  onClose,
  onValidate,
}: {
  team: TeamApp;
  pledges: TeamPledge[];
  onClose: () => void;
  onValidate: (t: TeamApp, pledges: TeamPledge[]) => Promise<void>;
}) {
  const [busy, setBusy] = useState(false);
  const activePledges = pledges.filter((p) => p.status !== "cancelled");
  const total = activePledges.reduce((s, p) => s + p.amount, 0);
  const pendingCount = pledges.filter((p) => p.status === "pledged").length;
  const ended = !!team.fundraising_end && new Date(team.fundraising_end + "T23:59:59") < new Date();

  async function validate() {
    setBusy(true);
    await onValidate(team, pledges);
    setBusy(false);
  }

  function copyEmails() {
    const rows = activePledges.map((p) => `${p.donor_email}\t${p.donor_name ?? ""}\t${p.amount}`);
    navigator.clipboard?.writeText(rows.join("\n"));
  }

  const badge: Record<string, { label: string; color: string }> = {
    pledged: { label: "Comprometido", color: C.gold },
    validated: { label: "Validado", color: C.greenBright },
    cancelled: { label: "Cancelado", color: C.txtFaint as string },
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      style={{ background: "rgba(0,0,0,.72)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="max-h-[90vh] w-full max-w-[620px] overflow-y-auto rounded-t-[20px] p-6 sm:rounded-[20px]"
        style={{ background: C.surface, border: `1px solid ${C.border}` }}
      >
        <div className="mb-1 flex items-center justify-between">
          <h2 className="font-display text-[19px] font-700 uppercase leading-none tracking-tight text-white">
            Compromisos · {team.team_name}
          </h2>
          <button onClick={onClose} className="text-[22px] leading-none text-white/40 hover:text-white/80">✕</button>
        </div>
        <p className="mb-4 text-[13px] leading-relaxed" style={{ color: C.txtDim }}>
          <strong style={{ color: C.gold }}>{formatMoney(total)}</strong> comprometidos por {activePledges.length} persona{activePledges.length === 1 ? "" : "s"}.
          Nadie pagó todavía: al validar, hay que enviarles el link de pago.
        </p>

        {!ended && pendingCount > 0 && (
          <p className="mb-4 rounded-[8px] p-3 text-[12px]" style={{ background: "rgba(201,162,39,.1)", border: "1px solid rgba(201,162,39,.3)", color: "#e3c768" }}>
            La campaña todavía no cerró{team.fundraising_end ? ` (cierra el ${team.fundraising_end})` : ""}. Podés validar igual, pero lo normal es esperar al fin del período.
          </p>
        )}

        {pledges.length === 0 ? (
          <div className="rounded-[12px] px-5 py-8 text-center text-[13px]" style={{ border: `1px dashed ${C.border}`, color: C.txtDim }}>
            Todavía no hay compromisos para esta campaña.
          </div>
        ) : (
          <div className="flex flex-col">
            {pledges.map((p) => {
              const b = badge[p.status] ?? badge.pledged;
              return (
                <div key={p.id} className="flex items-center justify-between gap-3 border-b border-white/[.06] py-2.5 last:border-0">
                  <div className="min-w-0">
                    <div className="truncate text-[13px] text-white/85">{p.donor_name || "Anónimo"} · <span style={{ color: C.celeste }}>{p.donor_email}</span></div>
                    <div className="text-[11px]" style={{ color: C.txtFaint }}>{timeAgo(p.created_at)}</div>
                  </div>
                  <div className="flex shrink-0 items-center gap-2.5">
                    <span className="font-display text-[14px] font-600 tabular-nums" style={{ color: C.gold }}>{formatMoney(p.amount)}</span>
                    <span className="rounded-full px-2 py-0.5 font-display text-[9px] font-600 uppercase tracking-wide" style={{ background: `${b.color}1c`, color: b.color }}>
                      {b.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {pledges.length > 0 && (
          <div className="mt-5 flex gap-3">
            <button
              onClick={copyEmails}
              className="flex-1 rounded-[10px] py-3 font-display text-[12px] font-600 uppercase tracking-wide"
              style={{ border: "1px solid rgba(255,255,255,.15)", color: C.txtDim }}
              title="Copia email, nombre y monto de cada compromiso (para enviar los links de pago)"
            >
              Copiar lista
            </button>
            <button
              onClick={validate}
              disabled={busy || pendingCount === 0}
              className="flex-1 rounded-[10px] py-3 font-display text-[12px] font-600 uppercase tracking-wide text-white disabled:opacity-40"
              style={{ background: C.green }}
              title="Marca los compromisos como validados: el paso previo a cobrar"
            >
              {busy ? "Validando…" : pendingCount === 0 ? "Todo validado ✓" : `Validar ${pendingCount} compromiso${pendingCount === 1 ? "" : "s"}`}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Modal de edición de un equipo (postulación pendiente o aprobado) ──────
function TeamEditModal({
  team,
  onClose,
  onSave,
  onApprove,
}: {
  team: TeamApp;
  onClose: () => void;
  onSave: (t: TeamApp, patch: Partial<TeamApp>) => Promise<void>;
  onApprove?: (t: TeamApp) => Promise<void>;
}) {
  const [form, setForm] = useState({
    team_name: team.team_name ?? "",
    sport: team.sport ?? "",
    competition: team.competition ?? "",
    contact_name: team.contact_name ?? "",
    email: team.email ?? "",
    goal_amount: team.goal_amount != null ? String(team.goal_amount) : "",
    goal_purpose: team.goal_purpose ?? "",
    fundraising_start: team.fundraising_start ?? "",
    fundraising_end: team.fundraising_end ?? "",
    payment_mp: team.payment_mp ?? "",
    notes: team.notes ?? "",
  });
  const [busy, setBusy] = useState(false);
  const isPending = team.status === "pending";

  function set<K extends keyof typeof form>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function buildPatch(): Partial<TeamApp> {
    const patch: Partial<TeamApp> = {};
    const map: Record<string, string | number | null> = {
      team_name: form.team_name,
      sport: form.sport,
      competition: form.competition || null,
      contact_name: form.contact_name || null,
      email: form.email,
      goal_amount: Number(form.goal_amount) || 0,
      goal_purpose: form.goal_purpose || null,
      fundraising_start: form.fundraising_start || null,
      fundraising_end: form.fundraising_end || null,
      payment_mp: form.payment_mp || null,
      notes: form.notes || null,
    };
    for (const k of Object.keys(map)) {
      const cur = (team[k as keyof TeamApp] ?? (k === "goal_amount" ? 0 : null)) as string | number | null;
      if (map[k] !== cur) (patch as Record<string, unknown>)[k] = map[k];
    }
    return patch;
  }

  async function save(thenApprove: boolean) {
    setBusy(true);
    const patch = buildPatch();
    if (Object.keys(patch).length > 0) await onSave(team, patch);
    if (thenApprove && onApprove) await onApprove({ ...team, ...patch });
    setBusy(false);
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      style={{ background: "rgba(0,0,0,.72)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="max-h-[92vh] w-full max-w-[560px] overflow-y-auto rounded-t-[20px] p-6 sm:rounded-[20px]"
        style={{ background: C.surface, border: `1px solid ${C.border}` }}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-[19px] font-700 uppercase leading-none tracking-tight text-white">
            {isPending ? "Revisar equipo" : "Editar equipo"} · {team.team_name}
          </h2>
          <button onClick={onClose} className="text-[22px] leading-none text-white/40 hover:text-white/80">✕</button>
        </div>
        <p className="mb-5 text-[13px] leading-relaxed" style={{ color: C.txtDim }}>
          {isPending
            ? "Revisá y corregí los datos antes de aprobar. Podés cargar el objetivo de recaudación y las fechas de campaña."
            : "Editás y guardás directamente. El equipo lleva su objetivo de recaudación, para qué lo necesita y las fechas de campaña."}
        </p>

        <div className="flex flex-col gap-4">
          <EditRow label="Nombre del equipo">
            <input value={form.team_name} onChange={(e) => set("team_name", e.target.value)} style={inputDark} />
          </EditRow>
          <div className="grid grid-cols-2 gap-3">
            <EditRow label="Deporte">
              <input value={form.sport} onChange={(e) => set("sport", e.target.value)} style={inputDark} />
            </EditRow>
            <EditRow label="Competencia">
              <input value={form.competition} onChange={(e) => set("competition", e.target.value)} style={inputDark} />
            </EditRow>
          </div>

          <EditRow label="Objetivo de recaudación (ARS)">
            <input type="number" min="0" value={form.goal_amount} onChange={(e) => set("goal_amount", e.target.value)} placeholder="Ej: 500000" style={inputDark} />
          </EditRow>
          <EditRow label="¿Para qué lo necesitan?">
            <textarea rows={3} value={form.goal_purpose} onChange={(e) => set("goal_purpose", e.target.value)} placeholder="Ej: pasajes y alojamiento para el Mundial, indumentaria, entrenador…" style={{ ...inputDark, resize: "vertical" }} />
          </EditRow>

          <div className="grid grid-cols-2 gap-3">
            <EditRow label="Inicio de campaña">
              <input type="date" value={form.fundraising_start} onChange={(e) => set("fundraising_start", e.target.value)} style={inputDark} />
            </EditRow>
            <EditRow label="Fin de campaña">
              <input type="date" value={form.fundraising_end} onChange={(e) => set("fundraising_end", e.target.value)} style={inputDark} />
            </EditRow>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <EditRow label="Contacto">
              <input value={form.contact_name} onChange={(e) => set("contact_name", e.target.value)} style={inputDark} />
            </EditRow>
            <EditRow label="Email">
              <input value={form.email} onChange={(e) => set("email", e.target.value)} style={inputDark} />
            </EditRow>
          </div>
          <EditRow label="Mercado Pago del equipo (alias / CVU)">
            <input
              value={form.payment_mp}
              onChange={(e) => set("payment_mp", e.target.value)}
              placeholder="Ej: equipo.handball.mp — adonde va el dinero al validar la campaña"
              style={inputDark}
            />
          </EditRow>
          <EditRow label="Notas internas">
            <textarea rows={2} value={form.notes} onChange={(e) => set("notes", e.target.value)} style={{ ...inputDark, resize: "vertical" }} />
          </EditRow>

          <div className="flex gap-3 pt-1">
            <button
              onClick={onClose}
              className="flex-1 rounded-[10px] py-3 font-display text-[13px] font-600 uppercase tracking-wide"
              style={{ border: "1px solid rgba(255,255,255,.15)", color: C.txtDim }}
            >
              Cancelar
            </button>
            <button
              onClick={() => save(false)}
              disabled={busy}
              className="flex-1 rounded-[10px] py-3 font-display text-[13px] font-600 uppercase tracking-wide text-ink disabled:opacity-50"
              style={{ background: C.gold }}
            >
              {busy ? "Guardando…" : "Guardar"}
            </button>
            {isPending && onApprove && (
              <button
                onClick={() => save(true)}
                disabled={busy}
                className="flex-1 rounded-[10px] py-3 font-display text-[13px] font-600 uppercase tracking-wide text-white disabled:opacity-50"
                style={{ background: C.green }}
              >
                {busy ? "…" : "Guardar y aprobar"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Atletas (real) ───────────────────────────────────────────────────────
function AtletasSection({
  athletes,
  loading,
  onConnect,
  onToggleStatus,
  onViewMpInfo,
  onSetTeam,
  onSendAccess,
  onSave,
}: {
  athletes: AthleteRow[];
  loading: boolean;
  onConnect: (a: AthleteRow) => void;
  onToggleStatus: (a: AthleteRow) => void;
  onViewMpInfo: (a: AthleteRow) => void;
  onSetTeam: (a: AthleteRow, teamSlug: string) => void;
  onSendAccess: (a: AthleteRow) => void;
  onSave: (a: AthleteRow, patch: Partial<AthleteRow>) => Promise<void>;
}) {
  const [editing, setEditing] = useState<AthleteRow | null>(null);
  const cols = "1.7fr 1fr 1.4fr 1fr .85fr 1fr";
  return (
    <section style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden" }}>
      <div style={{ display: "grid", gridTemplateColumns: cols, gap: 12, padding: "13px 24px", borderBottom: `1px solid rgba(255,255,255,.06)` }}>
        {["Atleta", "Deporte", "Selección", "Recaudado", "Estado", "Cobros"].map((h, i) => (
          <span key={h} className="text-[11px] font-600 uppercase tracking-[.06em]" style={{ color: C.txtFaint, textAlign: i >= 3 ? "right" : "left" }}>{h}</span>
        ))}
      </div>
      {loading && <div className="px-6 py-10 text-center text-[13px]" style={{ color: C.txtDim }}>Cargando…</div>}
      {!loading && athletes.length === 0 && <div className="px-6 py-12 text-center text-[13px]" style={{ color: C.txtDim }}>Todavía no hay atletas publicados.</div>}
      {athletes.map((a) => {
        const sport = getSport(a.sport);
        const color = sport?.color ?? C.celeste;
        const raised = a.raised_amount ?? 0;
        return (
          <div key={a.id} style={{ display: "grid", gridTemplateColumns: cols, gap: 12, alignItems: "center", padding: "14px 24px", borderBottom: `1px solid ${C.borderSoft}` }}>
            <div className="flex min-w-0 items-center gap-3">
              <Avatar name={a.full_name} color={color} ring />
              <span className="truncate text-[14px] font-600">{a.full_name}</span>
            </div>
            <div><SportPill label={sport?.label ?? a.sport} color={color} /></div>
            <div>
              <select
                value={a.team ?? ""}
                onChange={(e) => onSetTeam(a, e.target.value)}
                title="Asignar a una selección nacional"
                style={{ ...inputDark, padding: "6px 8px", fontSize: 12.5 }}
              >
                <option value="" style={{ background: C.sidebar }}>— Sin selección —</option>
                {SEED_TEAMS.map((t) => (
                  <option key={t.slug} value={t.slug} style={{ background: C.sidebar }}>{t.name}</option>
                ))}
              </select>
            </div>
            <div className="text-right font-display text-[15px] font-600" style={{ color: C.gold }}>{formatMoney(raised)}</div>
            <div className="flex justify-end">
              {!a.verified && !a.mp_connected ? (
                // Creado sin vía de cobro: no es una suspensión, le falta MP.
                // Se publica solo cuando el atleta conecta su Mercado Pago.
                <span
                  title="Oculto hasta que conecte su Mercado Pago. Se publica automáticamente al conectarlo."
                  className="rounded-full px-2.5 py-[3px] font-display text-[10px] font-600 uppercase tracking-[.04em]"
                  style={{ background: "rgba(201,162,39,.14)", color: C.gold }}
                >
                  Falta MP
                </span>
              ) : (
                <button
                  onClick={() => onToggleStatus(a)}
                  title={a.verified ? "Suspender atleta" : "Reactivar atleta"}
                  className="rounded-full px-2.5 py-[3px] font-display text-[10px] font-600 uppercase tracking-[.04em] transition-opacity hover:opacity-70"
                  style={a.verified
                    ? { background: "rgba(34,197,94,.14)", color: C.greenBright, border: "none", cursor: "pointer" }
                    : { background: "rgba(223,0,36,.12)", color: C.redBright, border: "none", cursor: "pointer" }}
                >
                  {a.verified ? "Activo" : "Suspendido"}
                </button>
              )}
            </div>
            <div className="flex items-center justify-end gap-1.5">
              <button
                onClick={() => setEditing(a)}
                title="Editar el perfil del atleta (historia, competencia, redes, mensaje, foto)"
                className="flex h-[26px] w-[26px] items-center justify-center rounded-full text-[12px] transition-opacity hover:opacity-70"
                style={{ background: "rgba(108,180,228,.14)", color: C.celeste, border: "none", cursor: "pointer" }}
              >
                ✎
              </button>
              <button
                onClick={() => onSendAccess(a)}
                title="Enviar acceso: le llega un email para activar su cuenta y crear su contraseña"
                className="flex h-[26px] w-[26px] items-center justify-center rounded-full text-[12px] transition-opacity hover:opacity-70"
                style={{ background: "rgba(201,162,39,.14)", color: C.gold, border: "none", cursor: "pointer" }}
              >
                ✉
              </button>
              {a.mp_connected ? (
                <button
                  onClick={() => onViewMpInfo(a)}
                  title="Ver datos de la cuenta de Mercado Pago del atleta"
                  className="rounded-full px-2.5 py-[3px] font-display text-[10px] font-600 uppercase tracking-[.04em] transition-opacity hover:opacity-70"
                  style={{ background: "rgba(34,197,94,.14)", color: C.greenBright, border: "none", cursor: "pointer" }}
                >
                  ✓ MP
                </button>
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
      {editing && (
        <AthleteEditModal
          athlete={editing}
          onClose={() => setEditing(null)}
          onSave={onSave}
        />
      )}
    </section>
  );
}

// ── Modal de edición directa del perfil (control total del equipo) ──────
function AthleteEditModal({
  athlete,
  onClose,
  onSave,
}: {
  athlete: AthleteRow;
  onClose: () => void;
  onSave: (a: AthleteRow, patch: Partial<AthleteRow>) => Promise<void>;
}) {
  const [form, setForm] = useState({
    full_name: athlete.full_name ?? "",
    bio: athlete.bio ?? "",
    next_competition: athlete.next_competition ?? "",
    socials: athlete.socials ?? "",
    supporter_message: athlete.supporter_message ?? "",
    city: athlete.city ?? "",
    province: athlete.province ?? "",
    photo_url: athlete.photo_url ?? "",
  });
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [err, setErr] = useState("");

  function set<K extends keyof typeof form>(k: K, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function uploadPhoto(file: File) {
    if (uploading) return;
    if (file.size > 5 * 1024 * 1024) { setErr("La foto no puede pesar más de 5 MB."); return; }
    setUploading(true);
    setErr("");
    try {
      const supa = sb();
      if (!supa) { setErr("No se pudo subir la foto."); return; }
      const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
      const path = `profiles/${athlete.id}-${Date.now()}.${ext}`;
      const { error } = await supa.storage.from("athlete-media").upload(path, file, { contentType: file.type, upsert: false });
      if (error) { setErr("No se pudo subir la foto. Intentá de nuevo."); return; }
      set("photo_url", supa.storage.from("athlete-media").getPublicUrl(path).data.publicUrl);
    } finally {
      setUploading(false);
    }
  }

  async function save() {
    setBusy(true);
    setErr("");
    // Solo mandamos lo que cambió.
    const patch: Partial<AthleteRow> = {};
    (Object.keys(form) as (keyof typeof form)[]).forEach((k) => {
      const cur = (athlete[k as keyof AthleteRow] as string | null) ?? "";
      if (form[k] !== cur) (patch as Record<string, string>)[k] = form[k];
    });
    if (Object.keys(patch).length === 0) { onClose(); return; }
    await onSave(athlete, patch);
    setBusy(false);
    onClose();
  }

  const initials = initialsOf(athlete.full_name);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      style={{ background: "rgba(0,0,0,.72)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="max-h-[92vh] w-full max-w-[560px] overflow-y-auto rounded-t-[20px] p-6 sm:rounded-[20px]"
        style={{ background: C.surface, border: `1px solid ${C.border}` }}
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-[19px] font-700 uppercase leading-none tracking-tight text-white">
            Editar perfil · {athlete.full_name}
          </h2>
          <button onClick={onClose} className="text-[22px] leading-none text-white/40 hover:text-white/80">✕</button>
        </div>
        <p className="mb-5 text-[13px] leading-relaxed" style={{ color: C.txtDim }}>
          Editás y publicás directamente. Los cambios quedan guardados al instante;
          tocá <strong className="text-white/70">“Publicar ahora”</strong> para verlos en el perfil público.
        </p>

        <div className="flex flex-col gap-4">
          <div>
            <p className="mb-1.5 text-[11px] font-600 uppercase tracking-wide" style={{ color: C.txtFaint }}>Foto de perfil</p>
            <div className="flex items-center gap-4">
              <div
                className="flex h-[60px] w-[60px] shrink-0 items-center justify-center overflow-hidden rounded-full text-[20px] text-white/40"
                style={{ background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.12)" }}
              >
                {form.photo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={form.photo_url} alt="" className="h-full w-full object-cover" />
                ) : initials}
              </div>
              <label className="cursor-pointer rounded-[9px] border border-white/25 px-4 py-2 font-display text-[12px] font-600 uppercase tracking-wide text-white/80 hover:border-white/50">
                {uploading ? "Subiendo…" : form.photo_url ? "Cambiar foto" : "Subir foto"}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  disabled={uploading}
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadPhoto(f); e.target.value = ""; }}
                />
              </label>
            </div>
          </div>

          <EditRow label="Nombre completo">
            <input value={form.full_name} onChange={(e) => set("full_name", e.target.value)} style={inputDark} />
          </EditRow>
          <div className="grid grid-cols-2 gap-3">
            <EditRow label="Ciudad">
              <input value={form.city} onChange={(e) => set("city", e.target.value)} style={inputDark} />
            </EditRow>
            <EditRow label="Provincia">
              <input value={form.province} onChange={(e) => set("province", e.target.value)} style={inputDark} />
            </EditRow>
          </div>
          <EditRow label="Historia / Bio">
            <textarea rows={4} value={form.bio} onChange={(e) => set("bio", e.target.value)} style={{ ...inputDark, resize: "vertical" }} />
          </EditRow>
          <EditRow label="Próxima competencia">
            <input value={form.next_competition} onChange={(e) => set("next_competition", e.target.value)} style={inputDark} />
          </EditRow>
          <EditRow label="Instagram">
            <input value={form.socials} onChange={(e) => set("socials", e.target.value)} style={inputDark} />
          </EditRow>
          <EditRow label="Mensaje para quienes aportan">
            <textarea rows={3} value={form.supporter_message} onChange={(e) => set("supporter_message", e.target.value)} style={{ ...inputDark, resize: "vertical" }} />
          </EditRow>

          {err && (
            <p className="rounded-[8px] p-3 text-[13px]" style={{ background: "rgba(223,0,36,.14)", color: C.redBright }}>{err}</p>
          )}

          <div className="flex gap-3 pt-1">
            <button
              onClick={onClose}
              className="flex-1 rounded-[10px] py-3 font-display text-[13px] font-600 uppercase tracking-wide"
              style={{ border: "1px solid rgba(255,255,255,.15)", color: C.txtDim }}
            >
              Cancelar
            </button>
            <button
              onClick={save}
              disabled={busy || uploading}
              className="flex-1 rounded-[10px] py-3 font-display text-[13px] font-600 uppercase tracking-wide text-ink disabled:opacity-50"
              style={{ background: C.gold }}
            >
              {busy ? "Guardando…" : "Guardar y publicar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function EditRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1.5 text-[11px] font-600 uppercase tracking-wide" style={{ color: C.txtFaint }}>{label}</p>
      {children}
    </div>
  );
}

// ── Selecciones nacionales: armado de planteles ─────────────────────────
function SeleccionesSection({
  athletes,
  loading,
  onSetTeam,
}: {
  athletes: AthleteRow[];
  loading: boolean;
  onSetTeam: (a: AthleteRow, teamSlug: string) => void;
}) {
  if (loading) {
    return <div className="py-16 text-center text-[14px]" style={{ color: C.txtDim }}>Cargando…</div>;
  }
  const sinSeleccion = athletes.filter((a) => !a.team);

  return (
    <div className="flex flex-col gap-5">
      {SEED_TEAMS.map((t) => {
        const roster = athletes.filter((a) => a.team === t.slug);
        return (
          <section
            key={t.slug}
            className="rounded-[14px] p-6"
            style={{ background: C.surface, border: `1px solid ${C.border}` }}
          >
            <div className="mb-1 flex flex-wrap items-center gap-3">
              <span
                className="flex h-10 w-10 items-center justify-center rounded-[9px] font-display text-[15px] font-700 text-white"
                style={{ background: t.color ?? C.gold }}
              >
                {t.name.replace(/^(Los|Las|La|El)\s/i, "").slice(0, 2).toUpperCase()}
              </span>
              <div>
                <div className="font-display text-[19px] font-700 uppercase leading-none text-white">{t.name}</div>
                <div className="mt-0.5 text-[12px]" style={{ color: C.txtFaint }}>{t.discipline}</div>
              </div>
              <span className="ml-auto text-[12px]" style={{ color: C.txtFaint }}>
                {roster.length} {roster.length === 1 ? "jugador" : "jugadores"}
              </span>
            </div>

            {/* Plantel actual */}
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {roster.length === 0 && (
                <span className="text-[13px]" style={{ color: C.txtFaint }}>Sin jugadores todavía.</span>
              )}
              {roster.map((a) => (
                <span
                  key={a.id}
                  className="inline-flex items-center gap-2 rounded-full py-1.5 pl-3 pr-1.5 text-[13px] font-500 text-white"
                  style={{ background: C.sidebar, border: `1px solid rgba(255,255,255,.12)` }}
                >
                  {a.full_name}
                  <button
                    onClick={() => onSetTeam(a, "")}
                    title={`Quitar a ${a.full_name} de ${t.name}`}
                    className="flex h-5 w-5 items-center justify-center rounded-full text-[11px] leading-none transition-colors hover:text-white"
                    style={{ background: "rgba(223,0,36,.18)", color: C.redBright }}
                  >
                    ✕
                  </button>
                </span>
              ))}

              {/* Agregar atleta */}
              {sinSeleccion.length > 0 && (
                <select
                  value=""
                  onChange={(e) => {
                    const ath = athletes.find((x) => x.id === e.target.value);
                    if (ath) onSetTeam(ath, t.slug);
                  }}
                  style={{ ...inputDark, width: "auto", padding: "7px 10px", fontSize: 13 }}
                >
                  <option value="" disabled style={{ background: C.sidebar }}>+ Agregar atleta…</option>
                  {sinSeleccion.map((a) => (
                    <option key={a.id} value={a.id} style={{ background: C.sidebar }}>{a.full_name}</option>
                  ))}
                </select>
              )}
            </div>
          </section>
        );
      })}
      <p className="text-[12px]" style={{ color: C.txtFaint }}>
        Un atleta puede estar en una sola selección. Los cambios impactan en la página pública al tocar &quot;Publicar ahora&quot;.
      </p>
    </div>
  );
}

// ── Aportes (demo) ───────────────────────────────────────────────────────
function AportesSection({ donations, athletes }: { donations: AdminDonation[]; athletes: AthleteRow[] }) {
  const confirmadas = donations.filter((d) => d.status === "completed");
  const now = new Date();
  const esteMes = confirmadas.filter((d) => {
    const f = new Date(d.created_at);
    return f.getMonth() === now.getMonth() && f.getFullYear() === now.getFullYear();
  });
  const athName = (id: string) => athletes.find((a) => a.id === id)?.full_name ?? "—";
  const estadoLabel: Record<string, string> = { completed: "Acreditado", pending: "Pendiente", failed: "Rechazado", refunded: "Reembolsado" };

  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 16, marginBottom: 20 }} className="bo-kpis3">
        <KpiSimple label="Total confirmado" value={formatMoney(confirmadas.reduce((s, d) => s + Number(d.amount), 0))} sub={`${confirmadas.length} ${confirmadas.length === 1 ? "aporte" : "aportes"}`} />
        <KpiSimple label="Este mes" value={formatMoney(esteMes.reduce((s, d) => s + Number(d.amount), 0))} sub={`${esteMes.length} ${esteMes.length === 1 ? "aporte" : "aportes"}`} />
        <KpiSimple label="Para atletas (93%)" value={formatMoney(confirmadas.reduce((s, d) => s + Number(d.net_amount ?? d.amount), 0))} sub="acreditado directo en su MP" />
      </div>
      <section style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.8fr 1.4fr 1fr 1fr 1.1fr .9fr", gap: 12, padding: "13px 24px", borderBottom: `1px solid rgba(255,255,255,.06)` }}>
          {["Donante", "Atleta", "Monto", "Tipo", "Fecha", "Estado"].map((h, i) => (
            <span key={h} className="text-[11px] font-600 uppercase tracking-[.06em]" style={{ color: C.txtFaint, textAlign: i === 2 || i === 5 ? "right" : "left" }}>{h}</span>
          ))}
        </div>
        {donations.length === 0 && (
          <div className="px-6 py-12 text-center text-[13px]" style={{ color: C.txtDim }}>Todavía no hubo aportes. Cuando lleguen, van a aparecer acá en tiempo real.</div>
        )}
        {donations.map((d) => (
          <div key={d.id} style={{ display: "grid", gridTemplateColumns: "1.8fr 1.4fr 1fr 1fr 1.1fr .9fr", gap: 12, alignItems: "center", padding: "13px 24px", borderBottom: `1px solid ${C.borderSoft}` }}>
            <div className="flex min-w-0 items-center gap-2.5">
              <div className="flex h-[34px] w-[34px] flex-none items-center justify-center rounded-full font-display text-[13px] font-700" style={{ background: "rgba(255,255,255,.08)" }}>{(d.donor_email ?? "?")[0].toUpperCase()}</div>
              <span className="truncate text-[13px] font-500">{d.donor_email ?? "Sin email"}</span>
            </div>
            <div className="truncate text-[13px]" style={{ color: "rgba(255,255,255,.8)" }}>{athName(d.athlete_id)}</div>
            <div className="text-right font-display text-[15px] font-600" style={{ color: C.gold }}>{formatMoney(Number(d.amount))}</div>
            <div className="text-[13px]" style={{ color: "rgba(255,255,255,.6)" }}>{d.type === "monthly" ? "Mensual" : "Único"}</div>
            <div className="text-[12px]" style={{ color: C.txtFaint }}>{timeAgo(d.created_at)}</div>
            <div className="text-right"><PayStatus status={estadoLabel[d.status] ?? d.status} /></div>
          </div>
        ))}
      </section>
      <ResponsiveCSS />
    </>
  );
}

// ── Pagos: el reparto es automático, no hay nada que procesar ────────────
function PagosSection() {
  return (
    <section
      className="mx-auto max-w-[640px] rounded-[16px] p-9 text-center"
      style={{ background: "linear-gradient(135deg,#12283f,#0a1828)", border: "1px solid rgba(201,162,39,.22)" }}
    >
      <div className="mb-4 text-[36px]">⚡</div>
      <h2 className="font-display text-[24px] font-700 uppercase leading-tight text-white">
        El reparto es automático
      </h2>
      <p className="mx-auto mt-3 max-w-[440px] text-[14px] leading-relaxed" style={{ color: C.txtDim }}>
        Cada aporte se divide en el momento del pago: Mercado Pago acredita el{" "}
        <strong style={{ color: C.greenBright }}>93% directo en la cuenta del atleta</strong> y el{" "}
        <strong style={{ color: C.gold }}>7% a GRANITO</strong>. No custodiamos fondos y no hay
        pagos manuales que procesar.
      </p>
      <div className="mx-auto mt-6 flex h-2 max-w-[380px] overflow-hidden rounded-full" style={{ background: "rgba(255,255,255,.07)" }}>
        <div style={{ width: "93%", background: C.green }} /><div style={{ width: "7%", background: C.gold }} />
      </div>
      <p className="mt-5 text-[12px]" style={{ color: C.txtFaint }}>
        El detalle de cada movimiento está en la sección Aportes.
      </p>
    </section>
  );
}

// ── Hinchas: donantes reales agrupados ───────────────────────────────────
function HinchasSection({ donations }: { donations: AdminDonation[] }) {
  const porDonante = new Map<string, { total: number; aportes: number; desde: string }>();
  for (const d of donations.filter((x) => x.status === "completed" && x.donor_email)) {
    const cur = porDonante.get(d.donor_email!) ?? { total: 0, aportes: 0, desde: d.created_at };
    cur.total += Number(d.amount);
    cur.aportes += 1;
    if (d.created_at < cur.desde) cur.desde = d.created_at;
    porDonante.set(d.donor_email!, cur);
  }
  const ranking = [...porDonante.entries()].sort((a, b) => b[1].total - a[1].total);
  const medals = [C.gold, "#B8C2CC", "#C8956A"];

  return (
    <>
      {ranking.length === 0 ? (
        <div className="mx-auto max-w-[560px] rounded-[16px] p-10 text-center" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
          <div className="mb-3 text-[34px]">♥</div>
          <h2 className="font-display text-[22px] font-700 uppercase text-white">Todavía no hay hinchas</h2>
          <p className="mt-2 text-[14px] leading-relaxed" style={{ color: C.txtDim }}>
            Acá van a aparecer las personas que aportan, ordenadas por cuánto empujan. Datos reales, nada inventado.
          </p>
        </div>
      ) : (
        <section style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: ".5fr 2.2fr 1fr 1.2fr 1fr", gap: 12, padding: "13px 24px", borderBottom: `1px solid rgba(255,255,255,.06)` }}>
            {["#", "Donante", "Aportes", "Total", "Desde"].map((h, i) => (
              <span key={h} className="text-[11px] font-600 uppercase tracking-[.06em]" style={{ color: C.txtFaint, textAlign: i >= 2 ? "right" : "left" }}>{h}</span>
            ))}
          </div>
          {ranking.map(([email, r], i) => (
            <div key={email} style={{ display: "grid", gridTemplateColumns: ".5fr 2.2fr 1fr 1.2fr 1fr", gap: 12, alignItems: "center", padding: "13px 24px", borderBottom: `1px solid ${C.borderSoft}` }}>
              <div className="flex h-[30px] w-[30px] items-center justify-center rounded-full font-display text-[13px] font-700" style={i < 3 ? { background: medals[i], color: C.ink } : { background: "rgba(255,255,255,.07)", color: "rgba(255,255,255,.6)" }}>{i + 1}</div>
              <div className="truncate text-[13px] font-500">{email}</div>
              <div className="text-right font-display text-[16px] font-600">{r.aportes}</div>
              <div className="text-right font-display text-[15px] font-600" style={{ color: C.gold }}>{formatMoney(r.total)}</div>
              <div className="text-right text-[12px]" style={{ color: C.txtDim }}>{new Date(r.desde).toLocaleDateString("es-AR", { month: "short", year: "numeric" })}</div>
            </div>
          ))}
        </section>
      )}
      <ResponsiveCSS />
    </>
  );
}

// ── Empresas impulsoras ──────────────────────────────────────────────────
function EmpresasSection() {
  return (
    <div className="mx-auto flex max-w-[640px] flex-col gap-4">
      {/* La primera empresa impulsora (real) */}
      <section className="flex items-center gap-5 rounded-[16px] p-6" style={{ background: C.surface, border: "1px solid rgba(201,162,39,.28)" }}>
        <div className="flex h-14 w-14 flex-none items-center justify-center rounded-xl font-display text-[20px] font-700 text-white" style={{ background: "#0072CE" }}>DS</div>
        <div className="min-w-0 flex-1">
          <div className="font-display text-[19px] font-600 leading-tight text-white">DS Connect</div>
          <div className="text-[13px]" style={{ color: C.txtDim }}>Primera empresa impulsora del deporte argentino con GRANITO.</div>
        </div>
        <span className="rounded-full px-2.5 py-[3px] font-display text-[10px] font-600 uppercase tracking-[.04em]" style={{ background: "rgba(34,197,94,.14)", color: C.greenBright }}>Activa</span>
      </section>

      <section className="rounded-[16px] p-7 text-center" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
        <p className="text-[14px] leading-relaxed" style={{ color: C.txtDim }}>
          Las empresas interesadas escriben desde{" "}
          <strong style={{ color: "#fff" }}>somosgranito.com/empresas</strong> y el pedido llega
          por email. Cuando haya más empresas impulsoras, se administran acá.
        </p>
      </section>
    </div>
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
          <div className="block text-sm">
            <label className="flex cursor-pointer items-start gap-2.5">
              <input
                type="checkbox"
                checked={draft.show_goal}
                onChange={(e) => setDraft({ ...draft, show_goal: e.target.checked })}
                style={{ marginTop: 3, accentColor: C.gold, width: 16, height: 16 }}
              />
              <span>
                <span className="eyebrow" style={{ color: draft.show_goal ? C.gold : C.txtFaint }}>Mostrar meta de recaudación</span>
                <span className="mt-0.5 block text-[12px]" style={{ color: C.txtFaint }}>
                  Muestra una barra de progreso en el perfil. Apagado: solo se ve el total recaudado (estilo aporte mensual).
                </span>
              </span>
            </label>
            {draft.show_goal && (
              <input
                type="number"
                min={0}
                value={draft.goal_amount}
                onChange={(e) => setDraft({ ...draft, goal_amount: e.target.value })}
                placeholder="Meta en pesos (ej: 500000)"
                style={{ ...inputDark, marginTop: 10 }}
              />
            )}
          </div>
          <label className="block text-sm">
            <span className="eyebrow" style={{ color: C.txtFaint }}>Alcance</span>
            <select value={draft.scope} onChange={(e) => setDraft({ ...draft, scope: e.target.value as "la2028" | "otros" })} style={inputDark}>
              <option value="la2028" style={{ background: C.sidebar }}>Rumbo a LA 2028</option>
              <option value="otros" style={{ background: C.sidebar }}>Otros atletas argentinos</option>
            </select>
          </label>
          <label className="block text-sm">
            <span className="eyebrow" style={{ color: C.txtFaint }}>Selección nacional</span>
            <select value={draft.team} onChange={(e) => setDraft({ ...draft, team: e.target.value })} style={inputDark}>
              <option value="" style={{ background: C.sidebar }}>Ninguna</option>
              {SEED_TEAMS.map((t) => (
                <option key={t.slug} value={t.slug} style={{ background: C.sidebar }}>{t.name}</option>
              ))}
            </select>
          </label>
          <label className="block text-sm sm:col-span-2">
            <span className="eyebrow" style={{ color: C.txtFaint }}>Historia / bio</span>
            <textarea rows={4} value={draft.bio} onChange={(e) => setDraft({ ...draft, bio: e.target.value })} style={{ ...inputDark, resize: "vertical" }} />
          </label>

          <DText label="Instagram / redes" value={draft.socials} onChange={(v) => setDraft({ ...draft, socials: v })} hint="Usuario o link." />
          <DText label="DNI" value={draft.dni} onChange={(v) => setDraft({ ...draft, dni: v.replace(/[^\d]/g, "") })} hint="Se cruza automáticamente con el DNI verificado de su Mercado Pago." />

          {/* Estado real de la cuenta de MP (OAuth). El alias es solo una nota. */}
          <div className="sm:col-span-2">
            <span className="eyebrow" style={{ color: C.txtFaint }}>Cobros por Mercado Pago</span>
            {draft.mp_connected ? (
              <div className="mt-1.5 flex items-start gap-2.5 rounded-[10px] px-3.5 py-3 text-[13px] leading-relaxed" style={{ background: "rgba(34,197,94,.1)", border: "1px solid rgba(34,197,94,.3)", color: C.greenBright }}>
                <span>✓</span>
                <span>Ya conectó su Mercado Pago de forma segura (OAuth) durante la postulación. Al dar de alta se vincula automáticamente y queda listo para cobrar.</span>
              </div>
            ) : (
              <div className="mt-1.5 rounded-[10px] px-3.5 py-3 text-[13px] leading-relaxed" style={{ background: "rgba(255,255,255,.04)", border: `1px solid ${C.border}`, color: C.txtDim }}>
                <div style={{ color: "#fff", fontWeight: 600, marginBottom: 4 }}>Todavía no conectó su Mercado Pago.</div>
                La conexión es segura (OAuth) y <strong style={{ color: "#fff" }}>solo la puede hacer el atleta</strong> desde su propia cuenta de MP. Después de dar de alta:
                <div style={{ marginTop: 6, paddingLeft: 14 }}>
                  · le llega en el email de invitación → la conecta desde su panel, o<br />
                  · vos generás el link desde <strong style={{ color: "#fff" }}>Atletas → “Conectar MP”</strong> y se lo pasás.
                </div>
                <div style={{ marginTop: 6, color: C.txtFaint, fontStyle: "italic" }}>Escribir un alias abajo NO habilita cobros: es solo una nota de referencia.</div>
              </div>
            )}
          </div>

          <DText label="Alias / CVU de MP (nota, opcional)" value={draft.payment_mp} onChange={(v) => setDraft({ ...draft, payment_mp: v })} hint="Solo referencia. El cobro real usa la conexión OAuth de arriba." />
          <DText label="PayPal" value={draft.payment_paypal} onChange={(v) => setDraft({ ...draft, payment_paypal: v })} hint="Email o link de PayPal.me." />

          <DPairEditor
            title="Tu aporte financia (título / descripción)"
            rows={draft.fund_items}
            placeholders={[
              ["Viajes", "Poder pagar mis pasajes de avión para ir al Mundial."],
              ["Zapatillas", "Específicas de mi disciplina, cuestan 200 euros."],
              ["Entrenador", "Pagar a mi cuerpo técnico para que me acompañe a competir."],
            ]}
            onChange={(fund_items) => setDraft({ ...draft, fund_items })}
          />

          <label className="block text-sm sm:col-span-2">
            <span className="eyebrow" style={{ color: C.txtFaint }}>
              Mensaje para aquellos que aporten a tu causa
            </span>
            <textarea
              rows={3}
              value={draft.supporter_message}
              onChange={(e) => setDraft({ ...draft, supporter_message: e.target.value })}
              style={{ ...inputDark, resize: "vertical" }}
              placeholder="Ej: ¡Gracias por bancarme! Cada aporte me acerca un poco más a representar a la Argentina. Sos parte de esto."
            />
          </label>
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

function KpiSimple({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14, padding: "20px 22px" }}>
      <div className="mb-2.5 text-[12px] font-600 uppercase tracking-[.04em]" style={{ color: C.txtDim }}>{label}</div>
      <div className="font-display text-[32px] font-700 leading-none">{value}</div>
      <div className="mt-[7px] text-[12px]" style={{ color: C.txtFaint }}>{sub}</div>
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

function DPairEditor({ title, rows, placeholders, onChange }: { title: string; rows: [string, string][]; placeholders: [string, string][]; onChange: (rows: [string, string][]) => void }) {
  return (
    <div className="sm:col-span-2">
      <span className="eyebrow" style={{ color: C.txtFaint }}>{title}</span>
      <div className="mt-1 space-y-2">
        {rows.map((row, i) => {
          const ph = placeholders[i] ?? placeholders[placeholders.length - 1] ?? ["", ""];
          return (
          <div key={i} className="flex gap-2">
            {[0, 1].map((j) => (
              <input
                key={j}
                placeholder={ph[j]}
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
          );
        })}
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

// ── Modal de info de Mercado Pago ────────────────────────────────────────
function MpInfoModal({ modal, onClose }: { modal: NonNullable<MpModalState>; onClose: () => void }) {
  const { athlete, info, error } = modal;
  return (
    <div
      onClick={onClose}
      style={{ position: "fixed", inset: 0, zIndex: 90, background: "rgba(4,10,18,.78)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{ width: "100%", maxWidth: 440, background: C.surface, border: "1px solid rgba(255,255,255,.1)", borderRadius: 20, padding: 28, boxShadow: "0 30px 90px rgba(0,0,0,.65)" }}
      >
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <div className="font-display text-[11px] uppercase tracking-[.14em]" style={{ color: C.gold }}>Cuenta de Mercado Pago</div>
            <h2 className="m-0 mt-1 font-display text-[22px] font-600 leading-tight">{athlete.full_name}</h2>
          </div>
          <button onClick={onClose} className="mt-1 flex-none text-xl leading-none" style={{ color: C.txtDim, background: "none", border: "none", cursor: "pointer" }}>✕</button>
        </div>

        {!info && !error && (
          <div className="py-8 text-center text-[13px]" style={{ color: C.txtDim }}>Consultando datos de MP…</div>
        )}

        {error && (
          <div className="rounded-xl px-4 py-3 text-[13px]" style={{ background: "rgba(223,0,36,.1)", border: "1px solid rgba(223,0,36,.3)", color: C.redBright }}>
            {error}
          </div>
        )}

        {info && (
          <>
            <div className="mb-4 rounded-xl px-4 py-3 text-[13px] leading-relaxed" style={{ background: "rgba(34,197,94,.08)", border: "1px solid rgba(34,197,94,.22)", color: C.greenBright }}>
              ✓ El atleta autorizó esta cuenta mediante OAuth — solo quien se logueó en MP pudo conectarla.
            </div>
            <DniCheck declaredDni={athlete.dni} mpDni={info.identification?.number ?? null} />
            <div className="flex flex-col gap-2">
              <MpInfoRow label="Nombre" value={[info.first_name, info.last_name].filter(Boolean).join(" ") || "—"} />
              <MpInfoRow label="Email de MP" value={info.email ?? "—"} />
              {info.identification && (
                <MpInfoRow label={info.identification.type} value={info.identification.number} />
              )}
              {info.nickname && <MpInfoRow label="Alias" value={info.nickname} />}
              <MpInfoRow label="ID de Mercado Pago" value={String(info.id)} dim />
            </div>
            {info.nickname && (
              <a
                href={`https://www.mercadolibre.com.ar/perfil/${encodeURIComponent(info.nickname)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-4 flex items-center justify-center gap-2 rounded-[10px] py-3 font-display text-[13px] font-600 uppercase tracking-[.04em] transition-opacity hover:opacity-80"
                style={{ background: "rgba(108,180,228,.12)", border: "1px solid rgba(108,180,228,.4)", color: C.celeste, textDecoration: "none" }}
              >
                Ver perfil público en Mercado Libre ↗
              </a>
            )}
            <p className="mt-4 text-[12px] leading-relaxed" style={{ color: C.txtFaint }}>
              El nombre y documento fueron verificados por Mercado Pago (KYC con validación facial contra RENAPER) — nadie los tipeó a mano. Verificá que coincidan con los de la postulación. El perfil de Mercado Libre comparte la misma cuenta: si la persona tiene historial ahí, vas a ver su reputación; si nunca usó ML puede aparecer vacío.
            </p>
          </>
        )}
      </div>
    </div>
  );
}

/** Cruza el DNI declarado en la postulación con el DNI verificado por MP (KYC). */
function DniCheck({ declaredDni, mpDni }: { declaredDni: string | null; mpDni: string | null }) {
  if (!mpDni) return null;
  const clean = (s: string) => s.replace(/[^\d]/g, "");
  if (!declaredDni) {
    return (
      <div className="mb-4 rounded-xl px-4 py-3 text-[13px] leading-relaxed" style={{ background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.1)", color: C.txtDim }}>
        ⓘ La postulación no declaró DNI, no se puede cruzar con el de Mercado Pago. Verificá la identidad por otro canal.
      </div>
    );
  }
  const match = clean(declaredDni) === clean(mpDni);
  return match ? (
    <div className="mb-4 rounded-xl px-4 py-3 text-[13px] font-600 leading-relaxed" style={{ background: "rgba(34,197,94,.12)", border: "1px solid rgba(34,197,94,.4)", color: C.greenBright }}>
      ✓ IDENTIDAD VERIFICADA — el DNI declarado en la postulación coincide con el DNI verificado por Mercado Pago.
    </div>
  ) : (
    <div className="mb-4 rounded-xl px-4 py-3 text-[13px] font-600 leading-relaxed" style={{ background: "rgba(223,0,36,.14)", border: "1px solid rgba(223,0,36,.45)", color: C.redBright }}>
      ⚠ ALERTA — el DNI de la cuenta MP ({mpDni}) NO coincide con el declarado en la postulación ({declaredDni}). No aprobar pagos sin contactar al atleta.
    </div>
  );
}

function MpInfoRow({ label, value, dim }: { label: string; value: string; dim?: boolean }) {
  return (
    <div className="rounded-[9px] px-3.5 py-2.5" style={{ background: "#0a1828", border: "1px solid rgba(255,255,255,.07)" }}>
      <div className="mb-1 text-[10px] uppercase tracking-[.06em]" style={{ color: C.txtFaint }}>{label}</div>
      <div className="text-[14px] font-600" style={{ color: dim ? C.txtDim : "#fff" }}>{value}</div>
    </div>
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

// ── Cambios de perfil ─────────────────────────────────────────────────────
const FIELD_LABELS: Record<string, string> = {
  photo_url: "Foto de perfil",
  bio: "Historia / Bio",
  next_competition: "Próxima competencia",
  socials: "Instagram",
  supporter_message: "Mensaje para donadores",
};

/** Muestra un valor del diff: las fotos como imagen, el resto como texto. */
function DiffValue({ field, value, removed }: { field: string; value: string; removed?: boolean }) {
  if (field === "photo_url" && value) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={value}
        alt={removed ? "Foto anterior" : "Foto nueva"}
        style={{
          width: 88,
          height: 88,
          objectFit: "cover",
          borderRadius: 10,
          opacity: removed ? 0.55 : 1,
          filter: removed ? "grayscale(60%)" : "none",
        }}
      />
    );
  }
  return <>{value || <em>vacío</em>}</>;
}

function CambiosSection({
  items,
  loading,
  onApprove,
  onReject,
}: {
  items: ProfileChangeRequest[];
  loading: boolean;
  onApprove: (item: ProfileChangeRequest, edited?: Record<string, string>) => Promise<void>;
  onReject: (item: ProfileChangeRequest, note: string) => Promise<void>;
}) {
  const [busy, setBusy] = useState<string | null>(null);
  const [rejectModal, setRejectModal] = useState<ProfileChangeRequest | null>(null);
  const [rejectNote, setRejectNote] = useState("");

  if (loading) {
    return <div className="py-16 text-center text-[14px]" style={{ color: C.txtDim }}>Cargando…</div>;
  }

  // Pendientes en orden cronológico (los más viejos primero): se validan de
  // arriba hacia abajo para que los cambios encadenados se apliquen en orden.
  const pending = items
    .filter((i) => i.status === "pending")
    .slice()
    .sort((a, b) => a.created_at.localeCompare(b.created_at));
  const reviewed = items.filter((i) => i.status !== "pending");

  async function approve(item: ProfileChangeRequest, edited?: Record<string, string>) {
    setBusy(item.id);
    await onApprove(item, edited);
    setBusy(null);
  }

  async function reject(item: ProfileChangeRequest) {
    setBusy(item.id + "-reject");
    await onReject(item, rejectNote);
    setBusy(null);
    setRejectModal(null);
    setRejectNote("");
  }

  return (
    <>
      {pending.length === 0 && reviewed.length === 0 && (
        <div className="py-20 text-center text-[15px]" style={{ color: C.txtDim }}>
          No hay cambios de perfil enviados aún.
        </div>
      )}

      {pending.length > 0 && (
        <section className="mb-6">
          <div className="mb-1 font-display text-[12px] font-600 uppercase tracking-[.1em]" style={{ color: C.gold }}>
            Pendientes de revisión ({pending.length})
          </div>
          <div className="mb-3 text-[12px]" style={{ color: C.txtFaint }}>
            Podés corregir el texto de cada campo antes de publicarlo. Se validan del más viejo al más nuevo.
          </div>
          <div className="flex flex-col gap-4">
            {pending.map((item) => (
              <ChangeCard
                key={item.id}
                item={item}
                busy={busy === item.id}
                rejectBusy={busy === item.id + "-reject"}
                onApprove={(edited) => approve(item, edited)}
                onReject={() => { setRejectNote(""); setRejectModal(item); }}
              />
            ))}
          </div>
        </section>
      )}

      {reviewed.length > 0 && (
        <section>
          <div className="mb-3 font-display text-[12px] font-600 uppercase tracking-[.1em]" style={{ color: C.txtFaint }}>
            Revisados
          </div>
          <div className="flex flex-col gap-3">
            {reviewed.map((item) => (
              <ChangeCard key={item.id} item={item} busy={false} rejectBusy={false} onApprove={() => Promise.resolve()} onReject={() => {}} readOnly />
            ))}
          </div>
        </section>
      )}

      {/* Modal de rechazo */}
      {rejectModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(0,0,0,.75)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setRejectModal(null); }}
        >
          <div className="w-full max-w-[440px] rounded-[18px] p-6" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
            <h3 className="mb-4 font-display text-[18px] font-700 uppercase leading-none text-white">Rechazar cambio</h3>
            <p className="mb-4 text-[14px]" style={{ color: C.txtDim }}>
              ¿Querés dejarle una nota al atleta explicando el motivo? (opcional)
            </p>
            <textarea
              rows={3}
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
              placeholder="Ej: La foto que enviaste no cumple con los requisitos…"
              className="mb-4 w-full resize-none rounded-[10px] p-3 text-[14px] text-white outline-none placeholder:text-white/30"
              style={{ background: C.sidebar, border: `1px solid rgba(255,255,255,.12)` }}
            />
            <div className="flex gap-3">
              <button
                onClick={() => setRejectModal(null)}
                className="flex-1 rounded-[10px] py-3 font-display text-[13px] font-600 uppercase tracking-wide"
                style={{ border: `1px solid rgba(255,255,255,.15)`, color: C.txtDim }}
              >
                Cancelar
              </button>
              <button
                onClick={() => reject(rejectModal)}
                disabled={busy === rejectModal.id + "-reject"}
                className="flex-1 rounded-[10px] py-3 font-display text-[13px] font-600 uppercase tracking-wide text-white disabled:opacity-50"
                style={{ background: C.red }}
              >
                {busy === rejectModal.id + "-reject" ? "Rechazando…" : "Rechazar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function ChangeCard({
  item,
  busy,
  rejectBusy,
  onApprove,
  onReject,
  readOnly,
}: {
  item: ProfileChangeRequest;
  busy: boolean;
  rejectBusy: boolean;
  onApprove: (edited?: Record<string, string>) => void;
  onReject: () => void;
  readOnly?: boolean;
}) {
  const statusColor = item.status === "approved" ? C.greenBright : item.status === "rejected" ? C.redBright : C.gold;
  const statusLabel = item.status === "approved" ? "Aprobado" : item.status === "rejected" ? "Rechazado" : "Pendiente";
  const editable = !readOnly && item.status === "pending";

  // Copia editable de los valores propuestos: el equipo corrige faltas de
  // ortografía acá y publica la versión corregida. La foto no se edita como
  // texto (se muestra como imagen).
  const [draft, setDraft] = useState<Record<string, string>>(() => ({ ...item.changes }));

  return (
    <div className="rounded-[14px] p-5" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
      {/* Header */}
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <div className="font-display text-[16px] font-600 leading-tight text-white">{item.athlete_name}</div>
          <div className="mt-0.5 text-[12px]" style={{ color: C.txtFaint }}>{timeAgo(item.created_at)}</div>
        </div>
        <span
          className="shrink-0 rounded-full px-2.5 py-1 font-display text-[11px] font-600 uppercase tracking-wide"
          style={{ background: `${statusColor}18`, color: statusColor, border: `1px solid ${statusColor}40` }}
        >
          {statusLabel}
        </span>
      </div>

      {/* Diff */}
      <div className="mb-4 flex flex-col gap-2">
        {Object.entries(item.changes).map(([field, newVal]) => (
          <div key={field} className="rounded-[10px] p-3" style={{ background: C.sidebar, border: `1px solid rgba(255,255,255,.06)` }}>
            <div className="mb-1.5 font-display text-[10px] font-600 uppercase tracking-[.08em]" style={{ color: C.txtFaint }}>
              {FIELD_LABELS[field] ?? field}
            </div>
            {item.previous_values?.[field] !== undefined && (
              <div
                className="mb-1.5 rounded-[6px] px-2 py-1 text-[12px]"
                style={{ background: "rgba(220,38,38,.1)", color: "rgba(255,90,110,.7)", textDecoration: field === "photo_url" ? "none" : "line-through" }}
              >
                <DiffValue field={field} value={item.previous_values[field]} removed />
              </div>
            )}
            {editable && field !== "photo_url" ? (
              <textarea
                value={draft[field] ?? ""}
                onChange={(e) => setDraft((d) => ({ ...d, [field]: e.target.value }))}
                rows={field === "bio" || field === "supporter_message" ? 3 : 1}
                className="w-full resize-y rounded-[6px] px-2 py-1.5 text-[13px] leading-relaxed text-white outline-none"
                style={{ background: "rgba(34,197,94,.08)", border: "1px solid rgba(34,197,94,.25)" }}
              />
            ) : (
              <div className="rounded-[6px] px-2 py-1 text-[13px] leading-relaxed" style={{ background: "rgba(34,197,94,.08)", color: "#86efac" }}>
                <DiffValue field={field} value={(readOnly ? newVal : draft[field]) ?? newVal} />
              </div>
            )}
          </div>
        ))}
      </div>

      {item.admin_note && (
        <div className="mb-3 rounded-[8px] px-3 py-2 text-[12px] italic" style={{ background: "rgba(255,255,255,.04)", color: C.txtFaint }}>
          Nota: {item.admin_note}
        </div>
      )}

      {/* Actions */}
      {editable && (
        <div className="flex gap-2.5">
          <button
            onClick={onReject}
            disabled={busy || rejectBusy}
            className="flex-1 rounded-[10px] py-2.5 font-display text-[13px] font-600 uppercase tracking-wide text-white disabled:opacity-40"
            style={{ background: "rgba(223,0,36,.2)", border: `1px solid rgba(223,0,36,.35)` }}
          >
            Rechazar
          </button>
          <button
            onClick={() => onApprove(draft)}
            disabled={busy || rejectBusy}
            className="flex-1 rounded-[10px] py-2.5 font-display text-[13px] font-600 uppercase tracking-wide disabled:opacity-40"
            style={{ background: C.green, color: "#fff" }}
          >
            {busy ? "Aprobando…" : "Aprobar y publicar"}
          </button>
        </div>
      )}
    </div>
  );
}

function NovedadesSection({
  items,
  loading,
  onApprove,
  onReject,
}: {
  items: AthleteUpdateRow[];
  loading: boolean;
  onApprove: (item: AthleteUpdateRow) => Promise<void>;
  onReject: (item: AthleteUpdateRow, note: string) => Promise<void>;
}) {
  const [busy, setBusy] = useState<string | null>(null);
  const [rejectModal, setRejectModal] = useState<AthleteUpdateRow | null>(null);
  const [rejectNote, setRejectNote] = useState("");

  if (loading) {
    return <div className="py-16 text-center text-[14px]" style={{ color: C.txtDim }}>Cargando…</div>;
  }

  const pending = items.filter((i) => i.status === "pending");
  const reviewed = items.filter((i) => i.status !== "pending");

  async function approve(item: AthleteUpdateRow) {
    setBusy(item.id);
    await onApprove(item);
    setBusy(null);
  }
  async function reject(item: AthleteUpdateRow) {
    setBusy(item.id + "-reject");
    await onReject(item, rejectNote);
    setBusy(null);
    setRejectModal(null);
    setRejectNote("");
  }

  return (
    <>
      {pending.length === 0 && reviewed.length === 0 && (
        <div className="py-20 text-center text-[15px]" style={{ color: C.txtDim }}>
          Ningún atleta publicó novedades todavía.
        </div>
      )}

      {pending.length > 0 && (
        <section className="mb-6">
          <div className="mb-3 font-display text-[12px] font-600 uppercase tracking-[.1em]" style={{ color: C.gold }}>
            Pendientes de revisión ({pending.length})
          </div>
          <div className="flex flex-col gap-4">
            {pending.map((item) => (
              <NovedadCard
                key={item.id}
                item={item}
                busy={busy === item.id}
                rejectBusy={busy === item.id + "-reject"}
                onApprove={() => approve(item)}
                onReject={() => { setRejectNote(""); setRejectModal(item); }}
              />
            ))}
          </div>
        </section>
      )}

      {reviewed.length > 0 && (
        <section>
          <div className="mb-3 font-display text-[12px] font-600 uppercase tracking-[.1em]" style={{ color: C.txtFaint }}>
            Revisadas
          </div>
          <div className="flex flex-col gap-3">
            {reviewed.map((item) => (
              <NovedadCard key={item.id} item={item} busy={false} rejectBusy={false} onApprove={() => Promise.resolve()} onReject={() => {}} readOnly />
            ))}
          </div>
        </section>
      )}

      {rejectModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(0,0,0,.75)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setRejectModal(null); }}
        >
          <div className="w-full max-w-[440px] rounded-[18px] p-6" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
            <h3 className="mb-4 font-display text-[18px] font-700 uppercase leading-none text-white">Rechazar novedad</h3>
            <p className="mb-4 text-[14px]" style={{ color: C.txtDim }}>
              ¿Querés dejarle una nota al atleta explicando el motivo? (opcional)
            </p>
            <textarea
              rows={3}
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
              placeholder="Ej: La foto no es apropiada / falta contexto…"
              className="mb-4 w-full resize-none rounded-[10px] p-3 text-[14px] text-white outline-none placeholder:text-white/30"
              style={{ background: C.sidebar, border: `1px solid rgba(255,255,255,.12)` }}
            />
            <div className="flex gap-3">
              <button
                onClick={() => setRejectModal(null)}
                className="flex-1 rounded-[10px] py-3 font-display text-[13px] font-600 uppercase tracking-wide"
                style={{ border: `1px solid rgba(255,255,255,.15)`, color: C.txtDim }}
              >
                Cancelar
              </button>
              <button
                onClick={() => reject(rejectModal)}
                disabled={busy === rejectModal.id + "-reject"}
                className="flex-1 rounded-[10px] py-3 font-display text-[13px] font-600 uppercase tracking-wide text-white disabled:opacity-50"
                style={{ background: C.red }}
              >
                {busy === rejectModal.id + "-reject" ? "Rechazando…" : "Rechazar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function NovedadCard({
  item,
  busy,
  rejectBusy,
  onApprove,
  onReject,
  readOnly,
}: {
  item: AthleteUpdateRow;
  busy: boolean;
  rejectBusy: boolean;
  onApprove: () => void;
  onReject: () => void;
  readOnly?: boolean;
}) {
  const statusColor = item.status === "approved" ? C.greenBright : item.status === "rejected" ? C.redBright : C.gold;
  const statusLabel = item.status === "approved" ? "Publicada" : item.status === "rejected" ? "Rechazada" : "Pendiente";

  return (
    <div className="rounded-[14px] p-5" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
      <div className="mb-4 flex items-start justify-between gap-3">
        <div>
          <div className="font-display text-[16px] font-600 leading-tight text-white">{item.athlete_name}</div>
          <div className="mt-0.5 text-[12px]" style={{ color: C.txtFaint }}>{timeAgo(item.created_at)}</div>
        </div>
        <span
          className="shrink-0 rounded-full px-2.5 py-1 font-display text-[11px] font-600 uppercase tracking-wide"
          style={{ background: `${statusColor}18`, color: statusColor, border: `1px solid ${statusColor}40` }}
        >
          {statusLabel}
        </span>
      </div>

      {/* Contenido de la novedad */}
      <div className="mb-4 rounded-[10px] p-4" style={{ background: C.sidebar, border: `1px solid rgba(255,255,255,.06)` }}>
        <div className="font-display text-[16px] font-600 uppercase leading-tight text-white">{item.title}</div>
        {item.image_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={item.image_url} alt={item.title} className="mt-3 max-h-[260px] w-full rounded-lg object-cover" />
        )}
        <p className="mt-2.5 whitespace-pre-line text-[14px] leading-relaxed" style={{ color: "rgba(255,255,255,.72)" }}>
          {item.body}
        </p>
      </div>

      {item.admin_note && (
        <div className="mb-3 rounded-[8px] px-3 py-2 text-[12px] italic" style={{ background: "rgba(255,255,255,.04)", color: C.txtFaint }}>
          Nota: {item.admin_note}
        </div>
      )}

      {!readOnly && item.status === "pending" && (
        <div className="flex gap-2.5">
          <button
            onClick={onReject}
            disabled={busy || rejectBusy}
            className="flex-1 rounded-[10px] py-2.5 font-display text-[13px] font-600 uppercase tracking-wide text-white disabled:opacity-40"
            style={{ background: "rgba(223,0,36,.2)", border: `1px solid rgba(223,0,36,.35)` }}
          >
            Rechazar
          </button>
          <button
            onClick={onApprove}
            disabled={busy || rejectBusy}
            className="flex-1 rounded-[10px] py-2.5 font-display text-[13px] font-600 uppercase tracking-wide disabled:opacity-40"
            style={{ background: C.green, color: "#fff" }}
          >
            {busy ? "Aprobando…" : "Aprobar y publicar"}
          </button>
        </div>
      )}
    </div>
  );
}
