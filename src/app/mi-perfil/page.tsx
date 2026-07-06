"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { Wordmark } from "@/components/Wordmark";
import { getSport } from "@/config/sports";
import { formatMoney } from "@/lib/money";

const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://somosgranito.com";

/* ── Tipos ────────────────────────────────────────────── */
type Atleta = {
  id: string;
  slug: string;
  full_name: string;
  first_name: string;
  sport: string;
  city: string;
  province: string;
  bio: string;
  photo_url: string | null;
  verified: boolean;
  raised_amount: number;
  next_competition: string | null;
  socials: string | null;
  supporter_message: string | null;
  email: string | null;
};

type PendingChange = {
  id: string;
  changes: Record<string, string>;
  status: string;
  created_at: string;
};

type Aporte = {
  id: string;
  amount: number;
  net_amount: number | null;
  type: string;
  status: string;
  created_at: string;
};

type Novedad = {
  id: string;
  title: string;
  body: string;
  image_url: string | null;
  status: string;
  admin_note: string | null;
  created_at: string;
};

type AuthState = "loading" | "none" | "nolink" | "ok";

type EditForm = {
  photo_url: string;
  bio: string;
  next_competition: string;
  socials: string;
  supporter_message: string;
};

/* ── Componente principal ─────────────────────────────── */
export default function MiPerfilPage() {
  const [authState, setAuthState] = useState<AuthState>("loading");
  const [atleta, setAtleta] = useState<Atleta | null>(null);
  const [mpConectado, setMpConectado] = useState(false);
  const [pendingChanges, setPendingChanges] = useState<PendingChange[]>([]);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPass, setLoginPass] = useState("");
  // "password" = email + contraseña (default) · "magic" = link por email.
  const [loginMode, setLoginMode] = useState<"password" | "magic">("password");
  const [loginSent, setLoginSent] = useState(false);
  const [loginBusy, setLoginBusy] = useState(false);
  const [loginError, setLoginError] = useState("");
  const [forgotSent, setForgotSent] = useState(false);
  // Email de la sesión activa (para la pantalla "sin atleta vinculado").
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);
  // Cambio de contraseña desde el panel.
  const [secPass1, setSecPass1] = useState("");
  const [secPass2, setSecPass2] = useState("");
  const [secBusy, setSecBusy] = useState(false);
  const [secMsg, setSecMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [connectingMp, setConnectingMp] = useState(false);
  const [mpJustConnected, setMpJustConnected] = useState(false);
  const [aportes, setAportes] = useState<Aporte[]>([]);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState<EditForm>({ photo_url: "", bio: "", next_competition: "", socials: "", supporter_message: "" });
  const [editBusy, setEditBusy] = useState(false);
  const [editError, setEditError] = useState("");
  const [photoUploading, setPhotoUploading] = useState(false);
  // Novedades del atleta.
  const [novedades, setNovedades] = useState<Novedad[]>([]);
  const [novTitle, setNovTitle] = useState("");
  const [novBody, setNovBody] = useState("");
  const [novImage, setNovImage] = useState("");
  const [novImgUploading, setNovImgUploading] = useState(false);
  const [novBusy, setNovBusy] = useState(false);
  const [novError, setNovError] = useState("");
  const [novSent, setNovSent] = useState(false);

  // Escuchar postMessage del popup de MP.
  useEffect(() => {
    function onMsg(e: MessageEvent) {
      if (e?.data?.type === "mp-connect") {
        setConnectingMp(false);
        if (e.data.ok) {
          setMpConectado(true);
          setMpJustConnected(true);
        }
      }
    }
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, []);

  useEffect(() => {
    if (!isSupabaseConfigured) { setAuthState("none"); return; }
    async function init() {
      const supabase = await getSupabase();
      if (!supabase) { setAuthState("none"); return; }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { setAuthState("none"); return; }
      setSessionEmail(session.user.email ?? null);

      // Cargar datos del atleta.
      const { data: a } = await supabase
        .from("athletes")
        .select("id,slug,full_name,first_name,sport,city,province,bio,photo_url,verified,raised_amount,next_competition,socials,supporter_message,email")
        .eq("user_id", session.user.id)
        .maybeSingle();

      // Sesión válida pero sin atleta vinculado (p. ej. entró con otro email):
      // estado propio con explicación, no el form de login de nuevo.
      if (!a) { setAuthState("nolink"); return; }
      setAtleta(a as Atleta);

      // Cargar datos paralelos.
      const [{ data: mp }, { data: changes }, { data: dons }, { data: novs }] = await Promise.all([
        supabase.from("athlete_mp_accounts").select("mp_user_id").eq("athlete_id", a.id).maybeSingle(),
        supabase.from("profile_change_requests").select("id,changes,status,created_at").eq("athlete_id", a.id).eq("status", "pending").order("created_at", { ascending: true }),
        supabase.from("donations").select("id,amount,net_amount,type,status,created_at").eq("athlete_id", a.id).order("created_at", { ascending: false }).limit(10),
        supabase.from("athlete_updates").select("id,title,body,image_url,status,admin_note,created_at").eq("athlete_id", a.id).order("created_at", { ascending: false }),
      ]);

      setMpConectado(!!mp?.mp_user_id);
      setPendingChanges((changes as PendingChange[]) ?? []);
      setAportes((dons as Aporte[]) ?? []);
      setNovedades((novs as Novedad[]) ?? []);
      setAuthState("ok");
    }
    init();
  }, []);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    if (!loginEmail || loginBusy) return;
    setLoginBusy(true);
    setLoginError("");
    setForgotSent(false);
    const supabase = await getSupabase();

    if (loginMode === "password") {
      const { error } = (await supabase?.auth.signInWithPassword({
        email: loginEmail,
        password: loginPass,
      })) ?? {};
      setLoginBusy(false);
      if (error) {
        setLoginError(
          "Email o contraseña incorrectos. Si nunca creaste una contraseña, entrá con el link por email.",
        );
        return;
      }
      // Sesión creada: recargamos para que init() levante el perfil.
      window.location.reload();
      return;
    }

    // Modo link mágico. shouldCreateUser: false → solo cuentas que EXISTEN.
    // (Sin esto, cualquier email creaba una cuenta fantasma sin atleta.)
    const { error } = (await supabase?.auth.signInWithOtp({
      email: loginEmail,
      options: { emailRedirectTo: `${SITE_URL}/bienvenida/`, shouldCreateUser: false },
    })) ?? {};
    if (error) {
      setLoginError(
        "Ese email no corresponde a una cuenta de atleta. Usá el email con el que te aprobamos, o postulate si todavía no tenés perfil.",
      );
    } else {
      setLoginSent(true);
    }
    setLoginBusy(false);
  }

  async function handleForgot() {
    if (!loginEmail) {
      setLoginError("Escribí tu email arriba y volvé a tocar “olvidé mi contraseña”.");
      return;
    }
    setLoginBusy(true);
    setLoginError("");
    const supabase = await getSupabase();
    // Función inteligente: si el atleta ya tiene cuenta, manda recuperación;
    // si todavía no la activó, le crea la cuenta y manda el link para activarla.
    // El link cae en /bienvenida, donde crea/cambia su contraseña.
    await supabase?.functions.invoke("athlete-recover", { body: { email: loginEmail } });
    setLoginBusy(false);
    setForgotSent(true);
  }

  async function handleSignOut() {
    const supabase = await getSupabase();
    await supabase?.auth.signOut();
    window.location.href = "/";
  }

  async function handleSetPassword(e: React.FormEvent) {
    e.preventDefault();
    if (secBusy) return;
    if (secPass1.length < 8) {
      setSecMsg({ ok: false, text: "La contraseña tiene que tener al menos 8 caracteres." });
      return;
    }
    if (secPass1 !== secPass2) {
      setSecMsg({ ok: false, text: "Las contraseñas no coinciden." });
      return;
    }
    setSecBusy(true);
    setSecMsg(null);
    const supabase = await getSupabase();
    const { error } = (await supabase?.auth.updateUser({ password: secPass1 })) ?? {};
    setSecBusy(false);
    if (error) {
      setSecMsg({ ok: false, text: "No se pudo guardar. Probá de nuevo en unos segundos." });
      return;
    }
    setSecPass1("");
    setSecPass2("");
    setSecMsg({ ok: true, text: "✓ Contraseña guardada. Ya podés entrar con email y contraseña." });
  }

  // Valor "efectivo" de un campo: lo publicado en el perfil, pisado por los
  // cambios que el atleta ya envió y siguen en cola (el último gana). Así, si
  // hace un segundo cambio, arranca desde lo que ya pidió y no desde lo viejo.
  function effectiveValue(field: keyof EditForm): string {
    let v = (atleta?.[field as keyof Atleta] as string | null) ?? "";
    for (const pc of pendingChanges) {
      if (pc.changes[field] !== undefined) v = pc.changes[field];
    }
    return v;
  }

  function openEditModal() {
    if (!atleta) return;
    setEditForm({
      photo_url: effectiveValue("photo_url"),
      bio: effectiveValue("bio"),
      next_competition: effectiveValue("next_competition"),
      socials: effectiveValue("socials"),
      supporter_message: effectiveValue("supporter_message"),
    });
    setEditError("");
    setShowEditModal(true);
  }

  async function handlePhotoSelect(file: File) {
    if (!atleta || photoUploading) return;
    if (file.size > 5 * 1024 * 1024) {
      setEditError("La foto no puede pesar más de 5 MB.");
      return;
    }
    setPhotoUploading(true);
    setEditError("");
    try {
      const supabase = await getSupabase();
      const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
      const path = `profiles/${atleta.id}-${Date.now()}.${ext}`;
      const { error } = await supabase!.storage
        .from("athlete-media")
        .upload(path, file, { contentType: file.type, upsert: false });
      if (error) {
        setEditError("No se pudo subir la foto. Intentá de nuevo.");
        return;
      }
      const url = supabase!.storage.from("athlete-media").getPublicUrl(path).data.publicUrl;
      setEditForm((f) => ({ ...f, photo_url: url }));
    } finally {
      setPhotoUploading(false);
    }
  }

  async function handleEditSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!atleta || editBusy) return;
    setEditBusy(true);
    setEditError("");

    // Solo enviamos los campos que cambiaron respecto de lo efectivo (lo
    // publicado + lo que ya está en cola). El "previo" es ese valor efectivo,
    // así el diff que ve el equipo encadena bien con los cambios anteriores.
    const changes: Record<string, string> = {};
    const previous: Record<string, string> = {};
    (["photo_url", "bio", "next_competition", "socials", "supporter_message"] as (keyof EditForm)[]).forEach((k) => {
      const current = effectiveValue(k);
      if (editForm[k] !== current) {
        changes[k] = editForm[k];
        previous[k] = current;
      }
    });

    if (Object.keys(changes).length === 0) {
      setEditError("No hiciste ningún cambio.");
      setEditBusy(false);
      return;
    }

    const supabase = await getSupabase();
    const { data, error } = await supabase!
      .from("profile_change_requests")
      .insert({
        athlete_id: atleta.id,
        changes,
        previous_values: previous,
      })
      .select("id,changes,status,created_at")
      .single();

    if (error) {
      setEditError("No se pudo enviar. Intentá de nuevo.");
      setEditBusy(false);
      return;
    }

    // Encolamos el nuevo cambio (podés tener varios pendientes a la vez).
    setPendingChanges((prev) => [
      ...prev,
      (data as PendingChange) ?? { id: "", changes, status: "pending", created_at: new Date().toISOString() },
    ]);
    setEditBusy(false);
    setShowEditModal(false);
  }

  async function handleNovImage(file: File) {
    if (!atleta || novImgUploading) return;
    if (file.size > 5 * 1024 * 1024) {
      setNovError("La imagen no puede pesar más de 5 MB.");
      return;
    }
    setNovImgUploading(true);
    setNovError("");
    try {
      const supabase = await getSupabase();
      const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
      const path = `updates/${atleta.id}-${Date.now()}.${ext}`;
      const { error } = await supabase!.storage
        .from("athlete-media")
        .upload(path, file, { contentType: file.type, upsert: false });
      if (error) { setNovError("No se pudo subir la imagen."); return; }
      setNovImage(supabase!.storage.from("athlete-media").getPublicUrl(path).data.publicUrl);
    } finally {
      setNovImgUploading(false);
    }
  }

  async function handleNovSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!atleta || novBusy) return;
    if (!novTitle.trim() || !novBody.trim()) {
      setNovError("Poné un título y algo para contar.");
      return;
    }
    setNovBusy(true);
    setNovError("");
    const supabase = await getSupabase();
    const { data, error } = await supabase!
      .from("athlete_updates")
      .insert({
        athlete_id: atleta.id,
        title: novTitle.trim(),
        body: novBody.trim(),
        image_url: novImage || null,
      })
      .select("id,title,body,image_url,status,admin_note,created_at")
      .maybeSingle();

    if (error) {
      setNovError("No se pudo enviar. Intentá de nuevo.");
      setNovBusy(false);
      return;
    }
    if (data) setNovedades((prev) => [data as Novedad, ...prev]);
    setNovTitle("");
    setNovBody("");
    setNovImage("");
    setNovSent(true);
    setNovBusy(false);
  }

  async function connectMP() {
    if (connectingMp) return;
    setConnectingMp(true);
    const popup = window.open("", "granito-mp", "width=520,height=720");
    try {
      popup?.document.write(
        "<p style='font-family:system-ui,sans-serif;padding:24px;color:#333'>Conectando con Mercado Pago…</p>",
      );
    } catch {}
    try {
      const supabase = await getSupabase();
      const { data, error } = await supabase!.functions.invoke("mp-athlete-connect-url", { body: {} });
      if (error || !data?.url) {
        popup?.close();
        setConnectingMp(false);
        alert("No se pudo iniciar la conexión con Mercado Pago.");
        return;
      }
      if (popup && !popup.closed) popup.location.href = data.url;
      else window.location.href = data.url;
    } catch (err) {
      popup?.close();
      setConnectingMp(false);
      alert("Error: " + (err instanceof Error ? err.message : String(err)));
    }
  }

  /* ── Loading ── */
  if (authState === "loading") {
    return (
      <Shell>
        <div className="flex flex-1 items-center justify-center">
          <Spinner />
        </div>
      </Shell>
    );
  }

  /* ── Sin sesión: login form ── */
  if (authState === "none" && !atleta) {
    return (
      <Shell>
        <div className="mx-auto mt-16 w-full max-w-[420px] px-4">
          <div
            className="rounded-[16px] p-8"
            style={{ background: "#0d2238", border: "1px solid rgba(255,255,255,.08)" }}
          >
            <h1 className="mb-1 font-display text-[26px] font-700 uppercase leading-none tracking-tight text-white">
              Mi cuenta de atleta
            </h1>
            <p className="mb-6 text-[14px] text-white/55">
              Solo para atletas ya aprobados por GRANITO. Entrá con el email con
              el que te aprobamos.
            </p>

            {loginSent ? (
              <div
                className="rounded-[10px] p-5 text-center text-[15px] leading-relaxed"
                style={{ background: "rgba(34,197,94,.1)", border: "1px solid rgba(34,197,94,.4)", color: "#22c55e" }}
              >
                ✓ Link enviado a <strong>{loginEmail}</strong>.<br />
                <span className="text-[13px] opacity-80">Revisá tu bandeja de entrada.</span>
              </div>
            ) : forgotSent ? (
              <div
                className="rounded-[10px] p-5 text-center text-[15px] leading-relaxed"
                style={{ background: "rgba(34,197,94,.1)", border: "1px solid rgba(34,197,94,.4)", color: "#22c55e" }}
              >
                ✓ Si <strong>{loginEmail}</strong> corresponde a una cuenta de atleta,
                te llega un email para entrar y crear tu contraseña.<br />
                <span className="text-[13px] opacity-80">
                  Revisá tu bandeja (y spam). Si no llega en unos minutos, escribinos a hola@somosgranito.com.
                </span>
              </div>
            ) : (
              <form onSubmit={handleLogin} className="flex flex-col gap-4">
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  placeholder="tu@email.com"
                  autoComplete="email"
                  className="rounded-[10px] border border-white/[.14] bg-white/[.05] px-[15px] py-[13px] text-[15px] text-white outline-none placeholder:text-white/35 focus:border-white/40"
                />
                {loginMode === "password" && (
                  <input
                    type="password"
                    required
                    value={loginPass}
                    onChange={(e) => setLoginPass(e.target.value)}
                    placeholder="Tu contraseña"
                    autoComplete="current-password"
                    className="rounded-[10px] border border-white/[.14] bg-white/[.05] px-[15px] py-[13px] text-[15px] text-white outline-none placeholder:text-white/35 focus:border-white/40"
                  />
                )}
                {loginError && (
                  <p
                    className="rounded-[8px] p-3 text-[13px] leading-relaxed"
                    style={{ background: "rgba(220,38,38,.12)", color: "#f87171" }}
                  >
                    {loginError}
                  </p>
                )}
                <button
                  type="submit"
                  disabled={loginBusy || !loginEmail || (loginMode === "password" && !loginPass)}
                  className="rounded-[10px] py-[14px] font-display text-[15px] font-600 uppercase tracking-wide text-ink disabled:opacity-50"
                  style={{ background: "#C9A227" }}
                >
                  {loginBusy
                    ? loginMode === "password" ? "Entrando…" : "Enviando…"
                    : loginMode === "password" ? "Entrar" : "Enviar link de acceso"}
                </button>

                <div className="flex items-center justify-between text-[13px]">
                  <button
                    type="button"
                    onClick={() => { setLoginMode(loginMode === "password" ? "magic" : "password"); setLoginError(""); }}
                    className="text-white/50 underline underline-offset-4 hover:text-white/80"
                  >
                    {loginMode === "password" ? "Entrar con link por email" : "Entrar con contraseña"}
                  </button>
                  {loginMode === "password" && (
                    <button
                      type="button"
                      onClick={handleForgot}
                      className="text-white/50 underline underline-offset-4 hover:text-white/80"
                    >
                      Olvidé mi contraseña
                    </button>
                  )}
                </div>
              </form>
            )}
          </div>

          <p className="mt-5 text-center text-[13px] text-white/35">
            ¿Sos un atleta sin cuenta aún?{" "}
            <Link href="/para-atletas" className="text-white/60 underline hover:text-white">
              Postulate acá
            </Link>
          </p>
        </div>
      </Shell>
    );
  }

  /* ── Sesión sin atleta vinculado ── */
  if (authState === "nolink") {
    return (
      <Shell onSignOut={handleSignOut}>
        <div className="mx-auto mt-16 w-full max-w-[460px] px-4">
          <div
            className="rounded-[16px] p-8 text-center"
            style={{ background: "#0d2238", border: "1px solid rgba(255,255,255,.08)" }}
          >
            <div className="mb-4 text-[40px]">🤔</div>
            <h1 className="mb-2 font-display text-[24px] font-700 uppercase leading-tight text-white">
              Tu email no está vinculado a un atleta
            </h1>
            {sessionEmail && (
              <p
                className="mx-auto mb-3 inline-block rounded-full px-4 py-1.5 text-[13px]"
                style={{ background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.12)", color: "rgba(255,255,255,.75)" }}
              >
                Sesión iniciada como <strong className="text-white">{sessionEmail}</strong>
              </p>
            )}
            <p className="mb-6 text-[14px] leading-relaxed text-white/55">
              Ese email no corresponde a ningún perfil de atleta aprobado. Puede que
              te hayamos invitado con otro email — salí y probá con ese — o que
              todavía no te hayas postulado.
            </p>
            <div className="flex flex-col gap-3">
              <Link
                href="/para-atletas"
                className="rounded-[10px] py-3.5 font-display text-[14px] font-600 uppercase tracking-wide text-ink"
                style={{ background: "#C9A227" }}
              >
                Postularme como atleta
              </Link>
              <button
                onClick={handleSignOut}
                className="rounded-[10px] border border-white/20 py-3.5 font-display text-[14px] font-600 uppercase tracking-wide text-white/60 hover:text-white"
              >
                Salir y probar con otro email
              </button>
            </div>
            <p className="mt-5 text-[12px] text-white/35">
              ¿Seguro que ya sos atleta de GRANITO? Escribinos a hola@somosgranito.com y lo resolvemos.
            </p>
          </div>
        </div>
      </Shell>
    );
  }

  if (!atleta) return null;

  const sport = getSport(atleta.sport);
  const sportColor = sport?.color ?? "#C9A227";
  const initials = atleta.full_name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();

  /* ── Dashboard ── */
  return (
    <Shell onSignOut={handleSignOut}>
      <div className="mx-auto w-full max-w-[760px] px-4 pb-24 pt-8 sm:px-6">

        {/* Pendiente de aprobación */}
        {!atleta.verified && (
          <div
            className="mb-6 rounded-[12px] p-5 text-[14px] leading-relaxed"
            style={{ background: "rgba(201,162,39,.1)", border: "1px solid rgba(201,162,39,.3)", color: "#C9A227" }}
          >
            <strong>Postulación en revisión.</strong>{" "}
            El equipo de GRANITO la está evaluando. Te avisamos a{" "}
            <strong>{atleta.email}</strong> en 3 a 5 días.
          </div>
        )}

        {/* Cambios de perfil pendientes (podés tener varios en cola) */}
        {pendingChanges.length > 0 && (
          <div
            className="mb-6 rounded-[12px] p-5 text-[14px] leading-relaxed"
            style={{ background: "rgba(201,162,39,.08)", border: "1px solid rgba(201,162,39,.25)", color: "rgba(255,255,255,.75)" }}
          >
            <span style={{ color: "#C9A227" }}>●</span>{" "}
            {pendingChanges.length === 1 ? (
              <>
                Tenés un <strong style={{ color: "#C9A227" }}>cambio de perfil pendiente</strong> enviado el{" "}
                {new Date(pendingChanges[0].created_at).toLocaleDateString("es-AR", { day: "numeric", month: "long" })}.
                El equipo lo está revisando.
              </>
            ) : (
              <>
                Tenés <strong style={{ color: "#C9A227" }}>{pendingChanges.length} cambios de perfil pendientes</strong> de
                revisión. El equipo los revisa uno por uno, en orden. Podés seguir enviando más.
              </>
            )}
          </div>
        )}

        {/* Hero */}
        <div className="mb-6 flex items-center gap-4">
          <div
            className="flex h-[72px] w-[72px] shrink-0 items-center justify-center overflow-hidden rounded-full text-[26px] font-700"
            style={{ background: `${sportColor}22`, border: `2px solid ${sportColor}44`, color: sportColor }}
          >
            {atleta.photo_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={atleta.photo_url} alt="" className="h-full w-full object-cover" />
            ) : (
              initials
            )}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-[28px] font-700 uppercase leading-none tracking-tight text-white">
                {atleta.full_name}
              </h1>
              <span
                className="rounded-full px-2.5 py-1 font-display text-[11px] font-600 uppercase tracking-wide"
                style={{ background: `${sportColor}22`, color: sportColor, border: `1px solid ${sportColor}55` }}
              >
                {sport?.label ?? atleta.sport}
              </span>
              {atleta.verified && (
                <span
                  className="rounded-full px-2.5 py-1 font-display text-[11px] font-600 uppercase tracking-wide"
                  style={{ background: "rgba(34,197,94,.15)", color: "#22c55e", border: "1px solid rgba(34,197,94,.4)" }}
                >
                  Activo
                </span>
              )}
            </div>
            <p className="mt-1 text-[14px] text-white/50">
              {[atleta.city, atleta.province].filter(Boolean).join(", ")}
            </p>
          </div>
        </div>

        {/* Stats rápidos */}
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <StatCard label="Total recibido" value={formatMoney(atleta.raised_amount)} />
          <StatCard label="Tu deporte" value={sport?.label ?? atleta.sport} />
          <StatCard
            label="Mercado Pago"
            value={mpConectado ? "Conectado ✓" : "Sin conectar"}
            valueColor={mpConectado ? "#22c55e" : "#C9A227"}
          />
        </div>

        {/* Sección MP */}
        <Card title="Mercado Pago" className="mb-4">
          {mpConectado || mpJustConnected ? (
            <div className="flex items-center gap-3">
              <div
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[16px]"
                style={{ background: "rgba(34,197,94,.15)", border: "1px solid rgba(34,197,94,.4)" }}
              >
                ✓
              </div>
              <div>
                <p className="text-[15px] font-500 text-white">Tu cuenta está conectada.</p>
                <p className="text-[13px] text-white/50">
                  El 93 % de cada donación llega directo a tu Mercado Pago.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[15px] text-white/80">
                  Todavía no conectaste tu Mercado Pago.
                </p>
                <p className="mt-1 text-[13px] text-white/45">
                  Sin MP conectado, los donadores no pueden enviarte aportes directamente.
                </p>
              </div>
              <button
                onClick={connectMP}
                disabled={connectingMp}
                className="shrink-0 rounded-[10px] px-5 py-3 font-display text-[14px] font-600 uppercase tracking-wide text-white transition hover:-translate-y-0.5 disabled:opacity-50"
                style={{ background: "#009ee3" }}
              >
                {connectingMp ? "Abriendo…" : "Conectar Mercado Pago"}
              </button>
            </div>
          )}
        </Card>

        {/* Últimos aportes */}
        <Card title="Últimos aportes" className="mb-4">
          {aportes.length === 0 ? (
            <p className="text-[14px] text-white/45">
              Todavía no recibiste aportes. Compartí tu perfil público para que empiecen a llegar.
            </p>
          ) : (
            <div className="flex flex-col">
              {aportes.map((d) => (
                <div
                  key={d.id}
                  className="flex items-center justify-between gap-3 border-b border-white/[.06] py-3 last:border-0"
                >
                  <div>
                    <p className="text-[14px] text-white/80">
                      {d.type === "monthly" ? "Aporte mensual" : "Aporte único"}
                    </p>
                    <p className="text-[12px] text-white/40">
                      {new Date(d.created_at).toLocaleDateString("es-AR", { day: "numeric", month: "long", year: "numeric" })}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-display text-[16px] font-700" style={{ color: "#C9A227" }}>
                      {formatMoney(d.net_amount ?? d.amount)}
                    </p>
                    <p className="text-[11px]" style={{ color: d.status === "completed" ? "#22c55e" : d.status === "pending" ? "#C9A227" : "#f87171" }}>
                      {d.status === "completed" ? "Acreditado" : d.status === "pending" ? "Pendiente" : d.status === "refunded" ? "Reembolsado" : "Falló"}
                    </p>
                  </div>
                </div>
              ))}
              <p className="mt-3 text-[12px] text-white/35">
                Los montos son netos (ya descontada la comisión de la plataforma). Mercado Pago puede demorar la liberación del dinero.
              </p>
            </div>
          )}
        </Card>

        {/* Novedades del atleta */}
        <Card title="Novedades" className="mb-4">
          <p className="mb-4 text-[13px] leading-relaxed text-white/50">
            Contá tu día a día: una competencia, un entrenamiento, un logro.
            Cada novedad la <strong className="text-white/70">revisa el equipo</strong> antes
            de publicarse en tu perfil público.
          </p>

          {novSent && (
            <div
              className="mb-4 rounded-[10px] p-3 text-[13px]"
              style={{ background: "rgba(34,197,94,.1)", border: "1px solid rgba(34,197,94,.35)", color: "#22c55e" }}
            >
              ✓ Novedad enviada. Queda pendiente de revisión.
            </div>
          )}

          <form onSubmit={handleNovSubmit} className="mb-6 flex flex-col gap-3">
            <input
              type="text"
              value={novTitle}
              onChange={(e) => { setNovTitle(e.target.value); setNovSent(false); }}
              maxLength={90}
              placeholder="Título (ej: Gané la clasificación nacional)"
              className="rounded-[10px] border border-white/[.12] bg-white/[.04] px-4 py-3 text-[14px] text-white outline-none placeholder:text-white/30 focus:border-white/35"
            />
            <textarea
              rows={3}
              value={novBody}
              onChange={(e) => { setNovBody(e.target.value); setNovSent(false); }}
              placeholder="Contá qué pasó…"
              className="resize-none rounded-[10px] border border-white/[.12] bg-white/[.04] px-4 py-3 text-[14px] leading-relaxed text-white outline-none placeholder:text-white/30 focus:border-white/35"
            />
            <div className="flex flex-wrap items-center gap-3">
              <label className="cursor-pointer rounded-[10px] border border-white/25 px-4 py-2.5 font-display text-[12px] font-600 uppercase tracking-wide text-white/80 transition hover:border-white/50">
                {novImgUploading ? "Subiendo…" : novImage ? "Cambiar foto" : "Agregar foto"}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  disabled={novImgUploading}
                  onChange={(e) => { const f = e.target.files?.[0]; if (f) handleNovImage(f); e.target.value = ""; }}
                />
              </label>
              {novImage && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={novImage} alt="" className="h-11 w-11 rounded-lg object-cover" />
              )}
              <button
                type="submit"
                disabled={novBusy || novImgUploading}
                className="ml-auto rounded-[10px] px-5 py-2.5 font-display text-[13px] font-600 uppercase tracking-wide text-ink disabled:opacity-50"
                style={{ background: "#C9A227" }}
              >
                {novBusy ? "Enviando…" : "Publicar novedad"}
              </button>
            </div>
            {novError && (
              <p className="rounded-[8px] p-2.5 text-[13px]" style={{ background: "rgba(220,38,38,.12)", color: "#f87171" }}>
                {novError}
              </p>
            )}
          </form>

          {novedades.length === 0 ? (
            <p className="text-[13px] text-white/40">Todavía no publicaste novedades.</p>
          ) : (
            <div className="flex flex-col gap-3 border-t border-white/[.07] pt-4">
              {novedades.map((n) => (
                <div key={n.id} className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-[14px] font-500 text-white/85">{n.title}</p>
                    <p className="text-[12px] text-white/40">
                      {new Date(n.created_at).toLocaleDateString("es-AR", { day: "numeric", month: "long" })}
                    </p>
                    {n.status === "rejected" && n.admin_note && (
                      <p className="mt-1 text-[12px] italic text-white/45">Nota: {n.admin_note}</p>
                    )}
                  </div>
                  <NovBadge status={n.status} />
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Sección perfil (read-only) */}
        <Card title="Mi perfil" className="mb-4">
          <div className="space-y-4">
            {atleta.bio && (
              <Field label="Historia">
                <p className="text-[14px] leading-relaxed text-white/75">{atleta.bio}</p>
              </Field>
            )}
            {atleta.next_competition && (
              <Field label="Próxima competencia">
                <p className="text-[14px] text-white/75">{atleta.next_competition}</p>
              </Field>
            )}
            {atleta.socials && (
              <Field label="Instagram">
                <p className="text-[14px] text-white/75">{atleta.socials}</p>
              </Field>
            )}
            {atleta.supporter_message && (
              <Field label="Mensaje para donadores">
                <p className="text-[14px] leading-relaxed text-white/75">{atleta.supporter_message}</p>
              </Field>
            )}
          </div>

          <div className="mt-5 border-t border-white/[.07] pt-4">
            <button
              onClick={openEditModal}
              className="rounded-[10px] border border-white/25 px-5 py-2.5 font-display text-[13px] font-600 uppercase tracking-wide text-white transition hover:border-white/50 hover:text-white"
            >
              Editar perfil
            </button>
            {pendingChanges.length > 0 && (
              <p className="mt-2 text-[12px]" style={{ color: "rgba(255,255,255,.4)" }}>
                Podés enviar otro cambio aunque tengas alguno en revisión.
              </p>
            )}
          </div>
        </Card>

        {/* Seguridad: crear/cambiar contraseña */}
        <Card title="Contraseña" className="mb-4">
          <p className="mb-4 text-[13px] leading-relaxed text-white/50">
            Con una contraseña entrás directo con tu email, sin esperar el link.
            La podés cambiar cuando quieras.
          </p>
          <form onSubmit={handleSetPassword} className="flex flex-col gap-3 sm:max-w-[380px]">
            <input
              type="password"
              value={secPass1}
              onChange={(e) => { setSecPass1(e.target.value); setSecMsg(null); }}
              placeholder="Contraseña nueva (mínimo 8 caracteres)"
              autoComplete="new-password"
              className="rounded-[10px] border border-white/[.12] bg-white/[.04] px-4 py-3 text-[14px] text-white outline-none placeholder:text-white/30 focus:border-white/35"
            />
            <input
              type="password"
              value={secPass2}
              onChange={(e) => { setSecPass2(e.target.value); setSecMsg(null); }}
              placeholder="Repetila para confirmar"
              autoComplete="new-password"
              className="rounded-[10px] border border-white/[.12] bg-white/[.04] px-4 py-3 text-[14px] text-white outline-none placeholder:text-white/30 focus:border-white/35"
            />
            {secMsg && (
              <p
                className="rounded-[8px] p-3 text-[13px]"
                style={secMsg.ok
                  ? { background: "rgba(34,197,94,.1)", border: "1px solid rgba(34,197,94,.35)", color: "#22c55e" }
                  : { background: "rgba(220,38,38,.12)", color: "#f87171" }}
              >
                {secMsg.text}
              </p>
            )}
            <button
              type="submit"
              disabled={secBusy || !secPass1 || !secPass2}
              className="self-start rounded-[10px] px-5 py-2.5 font-display text-[13px] font-600 uppercase tracking-wide text-ink disabled:opacity-50"
              style={{ background: "#C9A227" }}
            >
              {secBusy ? "Guardando…" : "Guardar contraseña"}
            </button>
          </form>
        </Card>

        {/* Link al perfil público */}
        {atleta.verified && (
          <div className="mt-2 text-center">
            <Link
              href={`/atleta/${atleta.slug}`}
              className="text-[13px] text-white/40 underline hover:text-white/70 transition-colors"
            >
              Ver tu perfil público →
            </Link>
          </div>
        )}
      </div>

      {/* Modal edición de perfil */}
      {showEditModal && (
        <EditModal
          form={editForm}
          busy={editBusy}
          errorMsg={editError}
          photoUploading={photoUploading}
          onPhotoSelect={handlePhotoSelect}
          onChange={(field, val) => setEditForm((f) => ({ ...f, [field]: val }))}
          onSubmit={handleEditSubmit}
          onClose={() => setShowEditModal(false)}
        />
      )}
    </Shell>
  );
}

/* ── Subcomponentes ───────────────────────────────────── */

function Shell({ children, onSignOut }: { children: React.ReactNode; onSignOut?: () => void }) {
  return (
    <div className="flex min-h-screen flex-col" style={{ background: "#0A1A2F" }}>
      <header
        className="flex items-center justify-between px-4 py-4 sm:px-6"
        style={{ borderBottom: "1px solid rgba(255,255,255,.07)" }}
      >
        <Link href="/">
          <Wordmark />
        </Link>
        {onSignOut && (
          <button
            onClick={onSignOut}
            className="text-[13px] text-white/40 transition-colors hover:text-white/70"
          >
            Cerrar sesión
          </button>
        )}
      </header>
      <main className="flex flex-1 flex-col">{children}</main>
    </div>
  );
}

function StatCard({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <div
      className="rounded-[12px] p-4"
      style={{ background: "#0d2238", border: "1px solid rgba(255,255,255,.07)" }}
    >
      <p className="mb-1 text-[11px] font-500 uppercase tracking-wide text-white/40">{label}</p>
      <p
        className="font-display text-[20px] font-700 leading-none"
        style={{ color: valueColor ?? "#fff" }}
      >
        {value}
      </p>
    </div>
  );
}

function Card({ title, children, className = "" }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-[14px] p-5 sm:p-6 ${className}`}
      style={{ background: "#0d2238", border: "1px solid rgba(255,255,255,.08)" }}
    >
      <h2 className="mb-4 font-display text-[13px] font-600 uppercase tracking-[.06em] text-white/40">
        {title}
      </h2>
      {children}
    </div>
  );
}

function NovBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; color: string }> = {
    approved: { label: "Publicada", color: "#22c55e" },
    pending: { label: "En revisión", color: "#C9A227" },
    rejected: { label: "Rechazada", color: "#f87171" },
  };
  const s = map[status] ?? map.pending;
  return (
    <span
      className="shrink-0 rounded-full px-2.5 py-1 font-display text-[10px] font-600 uppercase tracking-wide"
      style={{ background: `${s.color}1e`, color: s.color, border: `1px solid ${s.color}55` }}
    >
      {s.label}
    </span>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1 text-[12px] font-500 uppercase tracking-wide text-white/35">{label}</p>
      {children}
    </div>
  );
}

function Spinner() {
  return (
    <svg className="animate-spin" width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden>
      <circle cx="18" cy="18" r="14" stroke="rgba(201,162,39,.2)" strokeWidth="4" />
      <path d="M18 4a14 14 0 0 1 14 14" stroke="#C9A227" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

function EditModal({
  form,
  busy,
  errorMsg,
  photoUploading,
  onPhotoSelect,
  onChange,
  onSubmit,
  onClose,
}: {
  form: EditForm;
  busy: boolean;
  errorMsg: string;
  photoUploading: boolean;
  onPhotoSelect: (file: File) => void;
  onChange: (field: keyof EditForm, val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onClose: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
      style={{ background: "rgba(0,0,0,.7)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div
        className="w-full max-w-[520px] rounded-t-[20px] p-6 sm:rounded-[20px]"
        style={{ background: "#0d2238", border: "1px solid rgba(255,255,255,.1)" }}
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display text-[20px] font-700 uppercase leading-none tracking-tight text-white">
            Editar perfil
          </h2>
          <button onClick={onClose} className="text-[22px] text-white/40 hover:text-white/80 leading-none">
            ✕
          </button>
        </div>

        <p className="mb-5 text-[13px] leading-relaxed text-white/50">
          Los cambios <strong className="text-white/70">no se aplican de inmediato</strong>: el equipo de GRANITO los revisa y aprueba antes de publicarlos.
        </p>

        <form onSubmit={onSubmit} className="flex flex-col gap-5">
          <EditField label="Foto de perfil">
            <div className="flex items-center gap-4">
              <div
                className="flex h-[64px] w-[64px] shrink-0 items-center justify-center overflow-hidden rounded-full text-[22px] text-white/30"
                style={{ background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.12)" }}
              >
                {form.photo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={form.photo_url} alt="" className="h-full w-full object-cover" />
                ) : (
                  "?"
                )}
              </div>
              <label
                className="cursor-pointer rounded-[10px] border border-white/25 px-4 py-2.5 font-display text-[12px] font-600 uppercase tracking-wide text-white/80 transition hover:border-white/50"
              >
                {photoUploading ? "Subiendo…" : form.photo_url ? "Cambiar foto" : "Subir foto"}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  disabled={photoUploading}
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) onPhotoSelect(f);
                    e.target.value = "";
                  }}
                />
              </label>
            </div>
          </EditField>

          <EditField label="Historia / Bio">
            <textarea
              rows={4}
              value={form.bio}
              onChange={(e) => onChange("bio", e.target.value)}
              placeholder="Contá quién sos y tu historia deportiva…"
              className="w-full resize-none rounded-[10px] border border-white/[.12] bg-white/[.04] px-4 py-3 text-[14px] leading-relaxed text-white outline-none placeholder:text-white/30 focus:border-white/35"
            />
          </EditField>

          <EditField label="Próxima competencia">
            <input
              type="text"
              value={form.next_competition}
              onChange={(e) => onChange("next_competition", e.target.value)}
              placeholder="Ej: Mundial de Handball, enero 2026"
              className="w-full rounded-[10px] border border-white/[.12] bg-white/[.04] px-4 py-3 text-[14px] text-white outline-none placeholder:text-white/30 focus:border-white/35"
            />
          </EditField>

          <EditField label="Instagram">
            <input
              type="text"
              value={form.socials}
              onChange={(e) => onChange("socials", e.target.value)}
              placeholder="@usuario"
              className="w-full rounded-[10px] border border-white/[.12] bg-white/[.04] px-4 py-3 text-[14px] text-white outline-none placeholder:text-white/30 focus:border-white/35"
            />
          </EditField>

          <EditField label="Mensaje para quienes aportan">
            <textarea
              rows={3}
              value={form.supporter_message}
              onChange={(e) => onChange("supporter_message", e.target.value)}
              placeholder="Ej: Gracias por creer en mi sueño…"
              className="w-full resize-none rounded-[10px] border border-white/[.12] bg-white/[.04] px-4 py-3 text-[14px] leading-relaxed text-white outline-none placeholder:text-white/30 focus:border-white/35"
            />
          </EditField>

          {errorMsg && (
            <p className="rounded-[8px] p-3 text-[13px]" style={{ background: "rgba(220,38,38,.15)", color: "#f87171" }}>
              {errorMsg}
            </p>
          )}

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-[10px] border border-white/20 py-3 font-display text-[14px] font-600 uppercase tracking-wide text-white/60 hover:text-white"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={busy || photoUploading}
              className="flex-1 rounded-[10px] py-3 font-display text-[14px] font-600 uppercase tracking-wide text-ink disabled:opacity-50"
              style={{ background: "#C9A227" }}
            >
              {busy ? "Enviando…" : "Enviar para revisión"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function EditField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1.5 text-[12px] font-500 uppercase tracking-wide text-white/40">{label}</p>
      {children}
    </div>
  );
}
