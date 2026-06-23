"use client";

import { useCallback, useEffect, useState } from "react";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { SPORT_LIST } from "@/config/sports";

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
  media_url: string | null;
  payment_link: string | null;
  achievements: string | null;
  needs: string | null;
  socials: string | null;
  status: string;
  created_at: string;
  athlete_id: string | null;
};

type Phase = "loading" | "noenv" | "login" | "denied" | "ready";
type StatusFilter = "pending" | "approved" | "rejected";

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
  stats: [string, string][];
  fund_items: [string, string][];
};

const input =
  "mt-1 w-full rounded-lg border border-line bg-paper px-3 py-2 text-ink outline-none focus:border-celeste";
const labelText = "eyebrow text-steel";

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
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
    stats: [
      ["", ""],
      ["", ""],
      ["", ""],
    ],
    fund_items: [
      ["", ""],
      ["", ""],
      ["", ""],
    ],
  };
}

export function BackofficeApp() {
  const [phase, setPhase] = useState<Phase>("loading");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authMsg, setAuthMsg] = useState("");
  const [userEmail, setUserEmail] = useState("");

  const [filter, setFilter] = useState<StatusFilter>("pending");
  const [apps, setApps] = useState<Application[]>([]);
  const [loadingList, setLoadingList] = useState(false);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState("");

  // ── Sesión ────────────────────────────────────────────────────────────
  const resolveSession = useCallback(async () => {
    const supa = sb();
    if (!supa) {
      setPhase("noenv");
      return;
    }
    const { data } = await supa.auth.getSession();
    if (!data.session) {
      setPhase("login");
      return;
    }
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

  // ── Cargar postulaciones ────────────────────────────────────────────────
  const loadApps = useCallback(async () => {
    const supa = sb();
    if (!supa) return;
    setLoadingList(true);
    const { data, error } = await supa
      .from("athlete_applications")
      .select("*")
      .eq("status", filter)
      .order("created_at", { ascending: false });
    if (!error && data) setApps(data as Application[]);
    setLoadingList(false);
  }, [filter]);

  useEffect(() => {
    if (phase === "ready") loadApps();
  }, [phase, loadApps]);

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
    // onAuthStateChange dispara resolveSession()
  }

  async function handleLogout() {
    await sb()?.auth.signOut();
    setApps([]);
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
    if (error) {
      setToast("Error al rechazar: " + error.message);
      return;
    }
    setToast(`Postulación de ${app.full_name} rechazada.`);
    loadApps();
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
        stats,
        fund_items: fund,
        photo_url: null,
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
      .update({
        status: "approved",
        athlete_id: data.id,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", draft.appId);
    setBusy(false);
    if (e2) {
      setToast(
        "Atleta creado, pero no se pudo marcar la postulación: " + e2.message,
      );
    } else {
      setToast(`¡${draft.full_name} dado de alta! Perfil: /atleta/${draft.slug}`);
    }
    setDraft(null);
    loadApps();
  }

  // ── Render ──────────────────────────────────────────────────────────────
  if (phase === "loading") return <Centered>Cargando…</Centered>;

  if (phase === "noenv")
    return (
      <Centered>
        Supabase no está configurado en este entorno. Definí
        NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY.
      </Centered>
    );

  if (phase === "login")
    return (
      <Centered>
        <form
          onSubmit={handleLogin}
          className="w-full max-w-sm rounded-2xl border border-line bg-paper p-6"
        >
          <p className={labelText}>Backoffice</p>
          <h1 className="mt-1 font-display text-2xl font-700 uppercase tracking-tight text-ink">
            Ingresá
          </h1>
          <label className="mt-5 block text-sm">
            <span className={labelText}>Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={input}
            />
          </label>
          <label className="mt-3 block text-sm">
            <span className={labelText}>Contraseña</span>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={input}
            />
          </label>
          {authMsg && <p className="mt-3 text-sm text-ribbon-red">{authMsg}</p>}
          <button
            type="submit"
            disabled={busy}
            className="mt-5 w-full rounded-lg bg-gold py-3 font-display text-base font-700 uppercase tracking-wide text-ink transition-transform hover:scale-[1.02] disabled:opacity-60"
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
          <p className="text-ink">
            Tu usuario ({userEmail}) no tiene permisos de administrador.
          </p>
          <button
            onClick={handleLogout}
            className="mt-4 rounded-lg border border-line px-4 py-2 font-display text-sm font-600 uppercase tracking-wide text-ink"
          >
            Salir
          </button>
        </div>
      </Centered>
    );

  // phase === "ready"
  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className={labelText}>Backoffice</p>
          <h1 className="font-display text-3xl font-700 uppercase tracking-tight text-ink">
            Postulaciones
          </h1>
        </div>
        <div className="flex items-center gap-3 text-sm text-steel">
          <span>{userEmail}</span>
          <button
            onClick={handleLogout}
            className="rounded-lg border border-line px-3 py-1.5 font-display text-xs font-600 uppercase tracking-wide text-ink"
          >
            Salir
          </button>
        </div>
      </div>

      {/* Filtro por estado */}
      <div className="mt-6 flex gap-2">
        {(["pending", "approved", "rejected"] as StatusFilter[]).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`rounded-full px-4 py-1.5 font-display text-xs font-600 uppercase tracking-wide transition-colors ${
              filter === s
                ? "bg-ink text-white"
                : "border border-line text-steel hover:text-ink"
            }`}
          >
            {s === "pending" ? "Pendientes" : s === "approved" ? "Aprobadas" : "Rechazadas"}
          </button>
        ))}
      </div>

      {toast && (
        <div className="mt-4 rounded-lg border border-celeste bg-ice px-4 py-3 text-sm text-ink">
          {toast}
        </div>
      )}

      {/* Lista */}
      <div className="mt-6 space-y-4">
        {loadingList && <p className="text-steel">Cargando…</p>}
        {!loadingList && apps.length === 0 && (
          <p className="text-steel">No hay postulaciones {filter === "pending" ? "pendientes" : filter === "approved" ? "aprobadas" : "rechazadas"}.</p>
        )}
        {apps.map((app) => (
          <article
            key={app.id}
            className="rounded-2xl border border-line bg-paper p-5"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-display text-xl font-700 uppercase tracking-tight text-ink">
                  {app.full_name}
                </h2>
                <p className="text-sm text-steel">
                  {app.sport}
                  {app.discipline ? ` · ${app.discipline}` : ""}
                  {app.age ? ` · ${app.age} años` : ""}
                  {app.location ? ` · ${app.location}` : ""}
                </p>
              </div>
              {filter === "pending" && (
                <div className="flex gap-2">
                  <button
                    onClick={() => setDraft(buildDraft(app))}
                    className="rounded-lg bg-gold px-4 py-2 font-display text-sm font-700 uppercase tracking-wide text-ink"
                  >
                    Aprobar
                  </button>
                  <button
                    onClick={() => handleReject(app)}
                    disabled={busy}
                    className="rounded-lg border border-line px-4 py-2 font-display text-sm font-600 uppercase tracking-wide text-steel hover:text-ink disabled:opacity-60"
                  >
                    Rechazar
                  </button>
                </div>
              )}
            </div>

            <dl className="mt-4 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
              <Field label="Email" value={app.email} />
              <Field label="Foto/Video" value={app.media_url} link />
              <Field label="Mercado Pago" value={app.payment_link} />
              <Field label="Redes" value={app.socials} />
              <Field label="Logros" value={app.achievements} wide />
              <Field label="Necesita apoyo para" value={app.needs} wide />
            </dl>
            <p className="mt-3 text-xs text-steel">
              Postulado: {new Date(app.created_at).toLocaleString("es-AR")}
            </p>
          </article>
        ))}
      </div>

      {/* Editor de aprobación (modal) */}
      {draft && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-ink/60 p-4">
          <form
            onSubmit={handleApprove}
            className="my-8 w-full max-w-2xl rounded-2xl border border-line bg-paper p-6"
          >
            <div className="flex items-center justify-between">
              <h2 className="font-display text-2xl font-700 uppercase tracking-tight text-ink">
                Dar de alta atleta
              </h2>
              <button
                type="button"
                onClick={() => setDraft(null)}
                className="text-steel hover:text-ink"
                aria-label="Cerrar"
              >
                ✕
              </button>
            </div>
            <p className="mt-1 text-sm text-steel">
              Revisá y completá el perfil. Al guardar, el atleta queda publicado
              (verified).
            </p>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="block text-sm sm:col-span-2">
                <span className={labelText}>Nombre completo *</span>
                <input
                  required
                  value={draft.full_name}
                  onChange={(e) =>
                    setDraft({ ...draft, full_name: e.target.value })
                  }
                  className={input}
                />
              </label>
              <label className="block text-sm">
                <span className={labelText}>Nombre (corto) *</span>
                <input
                  required
                  value={draft.first_name}
                  onChange={(e) =>
                    setDraft({ ...draft, first_name: e.target.value })
                  }
                  className={input}
                />
              </label>
              <label className="block text-sm">
                <span className={labelText}>Slug (URL) *</span>
                <input
                  required
                  value={draft.slug}
                  onChange={(e) =>
                    setDraft({ ...draft, slug: slugify(e.target.value) })
                  }
                  className={input}
                />
              </label>
              <label className="block text-sm">
                <span className={labelText}>Deporte *</span>
                <select
                  required
                  value={draft.sport}
                  onChange={(e) => setDraft({ ...draft, sport: e.target.value })}
                  className={input}
                >
                  <option value="" disabled>
                    Elegí deporte
                  </option>
                  {SPORT_LIST.map((s) => (
                    <option key={s.key} value={s.key}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="block text-sm">
                <span className={labelText}>Disciplina *</span>
                <input
                  required
                  value={draft.discipline}
                  onChange={(e) =>
                    setDraft({ ...draft, discipline: e.target.value })
                  }
                  className={input}
                />
              </label>
              <label className="block text-sm">
                <span className={labelText}>Ciudad</span>
                <input
                  value={draft.city}
                  onChange={(e) => setDraft({ ...draft, city: e.target.value })}
                  className={input}
                />
              </label>
              <label className="block text-sm">
                <span className={labelText}>Provincia</span>
                <input
                  value={draft.province}
                  onChange={(e) =>
                    setDraft({ ...draft, province: e.target.value })
                  }
                  className={input}
                />
              </label>
              <label className="block text-sm">
                <span className={labelText}>Meta ($)</span>
                <input
                  type="number"
                  min={0}
                  value={draft.goal_amount}
                  onChange={(e) =>
                    setDraft({ ...draft, goal_amount: e.target.value })
                  }
                  className={input}
                />
              </label>
              <label className="block text-sm">
                <span className={labelText}>Alcance</span>
                <select
                  value={draft.scope}
                  onChange={(e) =>
                    setDraft({ ...draft, scope: e.target.value as "la2028" | "otros" })
                  }
                  className={input}
                >
                  <option value="la2028">Rumbo a LA 2028</option>
                  <option value="otros">Otros atletas argentinos</option>
                </select>
              </label>
              <label className="block text-sm sm:col-span-2">
                <span className={labelText}>Historia / bio</span>
                <textarea
                  rows={4}
                  value={draft.bio}
                  onChange={(e) => setDraft({ ...draft, bio: e.target.value })}
                  className={input}
                />
              </label>

              {/* Stats (3 pares valor / etiqueta) */}
              <div className="sm:col-span-2">
                <span className={labelText}>Stats (valor / etiqueta)</span>
                <div className="mt-1 space-y-2">
                  {draft.stats.map((row, i) => (
                    <div key={i} className="flex gap-2">
                      <input
                        placeholder="Valor (ej. #2)"
                        value={row[0]}
                        onChange={(e) => {
                          const stats = [...draft.stats] as [string, string][];
                          stats[i] = [e.target.value, row[1]];
                          setDraft({ ...draft, stats });
                        }}
                        className={input + " mt-0"}
                      />
                      <input
                        placeholder="Etiqueta (ej. Ranking)"
                        value={row[1]}
                        onChange={(e) => {
                          const stats = [...draft.stats] as [string, string][];
                          stats[i] = [row[0], e.target.value];
                          setDraft({ ...draft, stats });
                        }}
                        className={input + " mt-0"}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Fund items (3 pares título / descripción) */}
              <div className="sm:col-span-2">
                <span className={labelText}>Tu aporte financia (título / descripción)</span>
                <div className="mt-1 space-y-2">
                  {draft.fund_items.map((row, i) => (
                    <div key={i} className="flex gap-2">
                      <input
                        placeholder="Título"
                        value={row[0]}
                        onChange={(e) => {
                          const fund_items = [...draft.fund_items] as [string, string][];
                          fund_items[i] = [e.target.value, row[1]];
                          setDraft({ ...draft, fund_items });
                        }}
                        className={input + " mt-0"}
                      />
                      <input
                        placeholder="Descripción"
                        value={row[1]}
                        onChange={(e) => {
                          const fund_items = [...draft.fund_items] as [string, string][];
                          fund_items[i] = [row[0], e.target.value];
                          setDraft({ ...draft, fund_items });
                        }}
                        className={input + " mt-0"}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDraft(null)}
                className="rounded-lg border border-line px-4 py-2 font-display text-sm font-600 uppercase tracking-wide text-steel"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={busy}
                className="rounded-lg bg-gold px-5 py-2 font-display text-sm font-700 uppercase tracking-wide text-ink disabled:opacity-60"
              >
                {busy ? "Guardando…" : "Dar de alta"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[70vh] items-center justify-center px-4 text-steel">
      {children}
    </div>
  );
}

function Field({
  label,
  value,
  link,
  wide,
}: {
  label: string;
  value: string | null;
  link?: boolean;
  wide?: boolean;
}) {
  if (!value) return null;
  return (
    <div className={wide ? "sm:col-span-2" : undefined}>
      <dt className={labelText}>{label}</dt>
      <dd className="text-ink">
        {link ? (
          <a
            href={value}
            target="_blank"
            rel="noopener noreferrer"
            className="text-celeste-deep underline break-all"
          >
            {value}
          </a>
        ) : (
          <span className="break-words">{value}</span>
        )}
      </dd>
    </div>
  );
}
