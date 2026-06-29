"use client";

import { useState } from "react";
import Link from "next/link";
import { SPORT_LIST } from "@/config/sports";
import { WEB3FORMS_ACCESS_KEY, APPLICATIONS_EMAIL, SITE } from "@/config/site";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";

type Step = 1 | 2 | 3 | 4 | 5; // 5 = done

const MAX_BYTES = 5 * 1024 * 1024;
const TERMS_VERSION = "2026-06-28";

const STEP_LABELS = ["Datos", "Historia", "Fotos", "Revisión"];

/* ── Estilos reutilizables ── */
const inputCls =
  "w-full rounded-[10px] border border-white/[.14] bg-white/[.05] px-[15px] py-[13px] text-[15px] text-white outline-none placeholder:text-white/35 focus:border-white/40";
const labelCls = "block text-[13px] font-500 text-white/60";
const backBtn =
  "mb-[18px] cursor-pointer border-0 bg-transparent p-0 text-[14px] text-white/60 transition-colors hover:text-white";

export function AthleteApplicationForm() {
  const [step, setStep] = useState<Step>(1);

  // Step 1
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [edad, setEdad] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [deporte, setDeporte] = useState("");
  const [deporteOtro, setDeporteOtro] = useState(""); // si elige "Otro"
  const [disciplina, setDisciplina] = useState(""); // solo atletismo

  // Step 2
  const [frase, setFrase] = useState("");
  const [historia, setHistoria] = useState("");
  const [competencia, setCompetencia] = useState("");
  const [fecha, setFecha] = useState("");
  const [instagram, setInstagram] = useState("");
  const [mpAccount, setMpAccount] = useState("");
  const [paypalAccount, setPaypalAccount] = useState("");

  // Step 3
  const [portraitFile, setPortraitFile] = useState<File | null>(null);
  const [actionFile, setActionFile] = useState<File | null>(null);
  const [portraitPreview, setPortraitPreview] = useState<string | null>(null);
  const [actionPreview, setActionPreview] = useState<string | null>(null);
  const [fileMsg, setFileMsg] = useState("");

  // Consentimiento legal
  const [acepta, setAcepta] = useState(false);
  const [aceptaTutor, setAceptaTutor] = useState(false);

  // Submit
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [appId, setAppId] = useState<string | null>(null); // id de la postulación creada
  const [connecting, setConnecting] = useState(false); // conexión MP en curso

  const esMenor = edad.trim() !== "" && Number(edad) < 18;
  const consentimientoOk = acepta && (!esMenor || aceptaTutor);

  const sportObj = SPORT_LIST.find((s) => s.label === deporte);
  const sportColor = sportObj?.color ?? "#C9A227";
  const esOtro = deporte === "Otro";
  const esAtletismo = deporte === "Atletismo";
  // El deporte que se guarda: si eligió "Otro", el texto libre que escribió.
  const deporteEfectivo = esOtro ? deporteOtro.trim() : deporte;

  function go(n: Step) {
    setStep(n);
    try {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {}
  }

  function pickFile(
    which: "portrait" | "action",
    e: React.ChangeEvent<HTMLInputElement>,
  ) {
    const file = e.target.files?.[0] ?? null;
    setFileMsg("");
    if (file && file.size > MAX_BYTES) {
      setFileMsg("La imagen supera los 5 MB. Probá con una más liviana.");
      e.target.value = "";
      return;
    }
    const preview = file ? URL.createObjectURL(file) : null;
    if (which === "portrait") {
      setPortraitFile(file);
      setPortraitPreview(preview);
    } else {
      setActionFile(file);
      setActionPreview(preview);
    }
  }

  async function uploadPhotos() {
    const empty = {
      photo_url: null as string | null,
      photo_secondary_url: null as string | null,
    };
    if (!isSupabaseConfigured) return empty;
    const supabase = await getSupabase();
    if (!supabase) return empty;

    async function up(file: File | null): Promise<string | null> {
      if (!file) return null;
      const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
      const id =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.round(Math.random() * 1e6)}`;
      const path = `applications/${id}.${ext}`;
      const { error } = await supabase!.storage
        .from("athlete-media")
        .upload(path, file, { contentType: file.type, upsert: false });
      if (error) return null;
      return supabase!.storage.from("athlete-media").getPublicUrl(path).data
        .publicUrl;
    }

    const [photo_url, photo_secondary_url] = await Promise.all([
      up(portraitFile),
      up(actionFile),
    ]);
    return { photo_url, photo_secondary_url };
  }

  async function saveToSupabase(photos: {
    photo_url: string | null;
    photo_secondary_url: string | null;
  }): Promise<string | null> {
    if (!isSupabaseConfigured) return null;
    try {
      const supabase = await getSupabase();
      if (!supabase) return null;
      const nextComp =
        [competencia, fecha].filter(Boolean).join(" · ") || null;
      const { data, error } = await supabase.from("athlete_applications").insert({
        full_name: nombre,
        sport: deporteEfectivo,
        discipline: esAtletismo ? disciplina || null : null,
        location: ciudad || null,
        email,
        age: edad ? Number(edad) : null,
        next_competition: nextComp,
        photo_url: photos.photo_url,
        photo_secondary_url: photos.photo_secondary_url,
        achievements: frase || null,
        needs: historia || null,
        socials: instagram || null,
        payment_mp: mpAccount || null,
        payment_paypal: paypalAccount || null,
        accepted_terms: acepta,
        accepted_at: new Date().toISOString(),
        terms_version: TERMS_VERSION,
        image_consent: acepta,
        is_minor_guardian: esMenor ? aceptaTutor : false,
        status: "pending",
      }).select("id").single();
      return error ? null : (data?.id ?? null);
    } catch {
      return null;
    }
  }

  async function notifyByEmail(photos: {
    photo_url: string | null;
    photo_secondary_url: string | null;
  }) {
    const data = {
      nombre,
      email,
      edad,
      ciudad,
      deporte: deporteEfectivo,
      disciplina: esAtletismo ? disciplina : "",
      instagram,
      mercado_pago: mpAccount,
      paypal: paypalAccount,
      frase,
      historia,
      competencia: [competencia, fecha].filter(Boolean).join(" · "),
      foto_perfil: photos.photo_url ?? "(no subida)",
      foto_accion: photos.photo_secondary_url ?? "(no subida)",
    };
    if (WEB3FORMS_ACCESS_KEY) {
      try {
        const res = await fetch("https://api.web3forms.com/submit", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            access_key: WEB3FORMS_ACCESS_KEY,
            subject: `Nueva postulación — ${SITE.brand}`,
            from_name: nombre || "Postulante",
            ...data,
          }),
        });
        return res.ok;
      } catch {
        return false;
      }
    }
    const body = Object.entries(data)
      .map(([k, v]) => `${k}: ${v}`)
      .join("\n");
    window.location.href = `mailto:${APPLICATIONS_EMAIL}?subject=${encodeURIComponent(
      "Postulación a " + SITE.brand,
    )}&body=${encodeURIComponent(body)}`;
    return true;
  }

  async function handleSubmit() {
    setStatus("loading");
    const photos = await uploadPhotos();
    const newId = await saveToSupabase(photos);
    if (newId) {
      setAppId(newId);
      if (WEB3FORMS_ACCESS_KEY) void notifyByEmail(photos);
      go(5);
      return;
    }
    const notified = await notifyByEmail(photos);
    if (notified) {
      go(5);
    } else {
      setStatus("error");
    }
  }

  /** Inicia la conexión de Mercado Pago del atleta (durante el registro). */
  async function connectMP() {
    if (!appId || connecting) return;
    setConnecting(true);
    try {
      const supabase = await getSupabase();
      if (supabase) {
        const { data } = await supabase.functions.invoke("mp-app-connect-url", {
          body: { application_id: appId },
        });
        if (data?.url) {
          window.location.href = data.url;
          return;
        }
      }
    } catch {}
    setConnecting(false);
  }

  function reset() {
    setStep(1);
    setNombre("");
    setEmail("");
    setEdad("");
    setCiudad("");
    setDeporte("");
    setDeporteOtro("");
    setDisciplina("");
    setFrase("");
    setHistoria("");
    setCompetencia("");
    setFecha("");
    setInstagram("");
    setMpAccount("");
    setPaypalAccount("");
    setPortraitFile(null);
    setActionFile(null);
    setPortraitPreview(null);
    setActionPreview(null);
    setAcepta(false);
    setAceptaTutor(false);
    setStatus("idle");
    setAppId(null);
    setConnecting(false);
  }

  /* ── Progress bar ── */
  const progress =
    step < 5 ? (
      <div className="mx-auto max-w-[760px] px-4 pb-0 pt-[30px] sm:px-6">
        <div className="flex items-center">
          {STEP_LABELS.map((label, idx) => {
            const n = idx + 1;
            const done = (step as number) > n;
            const cur = (step as number) === n;
            const isLast = idx === STEP_LABELS.length - 1;
            return (
              <div key={label} className="flex flex-1 items-center last:flex-none">
                <div className="flex flex-col items-center gap-[7px]">
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-display text-[15px] font-600 transition-all"
                    style={{
                      background: done || cur ? "#C9A227" : "transparent",
                      color:
                        done || cur ? "#0A1A2F" : "rgba(255,255,255,.5)",
                      border: `1px solid ${done || cur ? "#C9A227" : "rgba(255,255,255,.2)"}`,
                    }}
                  >
                    {done ? "✓" : n}
                  </div>
                  <span
                    className="eyebrow whitespace-nowrap text-[11px]"
                    style={{
                      color:
                        done || cur ? "#C9A227" : "rgba(255,255,255,.4)",
                    }}
                  >
                    {label}
                  </span>
                </div>
                {!isLast && (
                  <div
                    className="mx-[10px] mb-6 h-px flex-1"
                    style={{
                      background: done
                        ? "#C9A227"
                        : "rgba(255,255,255,.14)",
                    }}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    ) : null;

  /* ── Done ── */
  if (step === 5) {
    return (
      <section className="mx-auto max-w-[620px] px-4 pb-28 pt-14 text-center sm:px-6">
        <div
          className="mx-auto mb-[22px] flex h-[76px] w-[76px] items-center justify-center rounded-full text-[36px]"
          style={{
            background: "rgba(34,197,94,.16)",
            border: "1px solid rgba(34,197,94,.5)",
            animation: "okPop .5s cubic-bezier(.2,.8,.2,1)",
          }}
        >
          ✓
        </div>
        <h2 className="font-display text-[44px] font-700 uppercase leading-none tracking-tight">
          ¡Postulación enviada!
        </h2>
        <p className="mx-auto mt-[14px] max-w-[460px] text-[17px] leading-relaxed text-white/70">
          <strong className="text-white">{nombre}</strong>, recibimos tu historia.
          Los fundadores la revisan a mano y te escriben a tu mail en 3 a 5 días.
          Gracias por confiar en GRANITO.
        </p>

        {appId && (
          <div
            className="mx-auto mt-7 max-w-[460px] rounded-[14px] p-5 text-left"
            style={{ background: "#0d2238", border: "1px solid rgba(0,158,227,.4)" }}
          >
            <div className="font-display text-[18px] font-600 uppercase leading-none text-white">
              Último paso: conectá tu Mercado Pago
            </div>
            <p className="mt-2 text-[14px] leading-relaxed text-white/65">
              Para recibir los aportes directo en tu cuenta (el 93% es tuyo),
              conectá tu Mercado Pago con tu propia cuenta. Toma 30 segundos.
            </p>
            <button
              onClick={connectMP}
              disabled={connecting}
              className="mt-4 w-full cursor-pointer rounded-[10px] border-0 py-[14px] font-display text-[15px] font-700 uppercase tracking-wide text-white transition-all hover:-translate-y-0.5 disabled:opacity-60"
              style={{ background: "#009ee3", boxShadow: "0 12px 28px rgba(0,158,227,.3)" }}
            >
              {connecting ? "Redirigiendo…" : "Conectar Mercado Pago"}
            </button>
            <p className="mt-2.5 text-center text-[12px] text-white/40">
              Si preferís lo hacés más adelante — pero sin esto no podés recibir aportes.
            </p>
          </div>
        )}

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button
            onClick={reset}
            className="cursor-pointer rounded-[10px] border border-white/25 bg-transparent px-[26px] py-[14px] font-display text-[15px] font-600 uppercase tracking-wide text-white transition-colors hover:border-white"
          >
            Postular a otro atleta
          </button>
          <Link
            href="/"
            className="rounded-[10px] bg-gold px-[26px] py-[14px] font-display text-[15px] font-600 uppercase tracking-wide text-ink transition-opacity hover:opacity-90"
          >
            Ver atletas
          </Link>
        </div>
        <style>{`
          @keyframes okPop {
            from { opacity: 0; transform: scale(.8); }
            to   { opacity: 1; transform: none; }
          }
        `}</style>
      </section>
    );
  }

  /* ── CTA button ── */
  const ctaBtn = (label: string, onClick: () => void, disabled = false) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full cursor-pointer rounded-[10px] border-0 bg-gold py-[16px] font-display text-[16px] font-600 uppercase tracking-wide text-ink transition-all hover:-translate-y-0.5 hover:bg-[#dcb433] disabled:opacity-50"
      style={{ boxShadow: "0 14px 34px rgba(201,162,39,.3)" }}
    >
      {label}
    </button>
  );

  return (
    <>
      {progress}

      {/* ── Step 1: ¿Quién sos? ── */}
      {step === 1 && (
        <section className="mx-auto max-w-[760px] px-4 pb-24 pt-[30px] sm:px-6">
          <h2 className="mb-6 font-display text-[32px] font-700 uppercase leading-none tracking-tight">
            ¿Quién sos?
          </h2>

          <div className="mb-[18px] grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelCls}>Nombre y apellido</label>
              <input
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Tu nombre"
                className={`${inputCls} mt-[7px]`}
              />
            </div>
            <div>
              <label className={labelCls}>Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                className={`${inputCls} mt-[7px]`}
              />
            </div>
          </div>

          <div
            className="mb-6 grid gap-4"
            style={{ gridTemplateColumns: "160px 1fr" }}
          >
            <div>
              <label className={labelCls}>Edad</label>
              <input
                value={edad}
                onChange={(e) => setEdad(e.target.value)}
                inputMode="numeric"
                placeholder="Ej: 22"
                className={`${inputCls} mt-[7px]`}
              />
            </div>
            <div>
              <label className={labelCls}>¿De dónde sos?</label>
              <input
                value={ciudad}
                onChange={(e) => setCiudad(e.target.value)}
                placeholder="Ciudad, provincia"
                className={`${inputCls} mt-[7px]`}
              />
            </div>
          </div>

          <div className="mb-6">
            <div className={`${labelCls} mb-3`}>
              ¿Qué deporte hacés?{" "}
              <span className="text-white/35">· cada deporte tiene su color</span>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {[
                ...SPORT_LIST,
                { key: "otro", label: "Otro", color: "#C9A227" } as const,
              ].map((s) => {
                const active = s.label === deporte;
                return (
                  <button
                    key={s.key}
                    type="button"
                    onClick={() => setDeporte(s.label)}
                    className="cursor-pointer rounded-full font-display text-[13px] font-600 uppercase tracking-wide text-white transition-all"
                    style={{
                      padding: "11px 18px",
                      border: `1px solid ${active ? s.color : "rgba(255,255,255,.16)"}`,
                      background: active ? s.color : "transparent",
                    }}
                  >
                    {s.label}
                  </button>
                );
              })}
            </div>

            {/* Si eligió "Otro": que escriba su deporte */}
            {esOtro && (
              <div className="mt-4">
                <label className={labelCls}>¿Cuál es tu deporte?</label>
                <input
                  value={deporteOtro}
                  onChange={(e) => setDeporteOtro(e.target.value)}
                  placeholder="Ej: Escalada, Tiro deportivo, Skateboarding…"
                  className={`${inputCls} mt-[7px]`}
                />
              </div>
            )}

            {/* Disciplina: solo tiene sentido en atletismo (pruebas) */}
            {esAtletismo && (
              <div className="mt-4">
                <label className={labelCls}>
                  Tu prueba{" "}
                  <span className="text-white/35">· en qué competís</span>
                </label>
                <input
                  value={disciplina}
                  onChange={(e) => setDisciplina(e.target.value)}
                  placeholder="Ej: 400m con vallas, Salto en largo, Maratón…"
                  className={`${inputCls} mt-[7px]`}
                />
              </div>
            )}
          </div>

          {ctaBtn(
            "Continuar",
            () => go(2),
            !nombre || !email || !deporte || (esOtro && !deporteOtro.trim()),
          )}
        </section>
      )}

      {/* ── Step 2: Tu historia ── */}
      {step === 2 && (
        <section className="mx-auto max-w-[760px] px-4 pb-24 pt-[30px] sm:px-6">
          <button type="button" className={backBtn} onClick={() => go(1)}>
            ← Atrás
          </button>
          <h2 className="mb-2 font-display text-[32px] font-700 uppercase leading-none tracking-tight">
            Tu historia
          </h2>
          <p className="mb-6 text-[15px] text-white/60">
            Lo que más conecta con la gente. Contá de dónde venís, qué te falta
            y a dónde querés llegar.
          </p>

          <div className="mb-[18px]">
            <label className={labelCls}>Una frase que te defina</label>
            <input
              value={frase}
              onChange={(e) => setFrase(e.target.value)}
              placeholder="Ej: Remo desde los 11 en el Delta, sola y sin estructura."
              className={`${inputCls} mt-[7px]`}
            />
          </div>

          <div className="mb-[18px]">
            <label className={labelCls}>Tu historia</label>
            <textarea
              value={historia}
              onChange={(e) => setHistoria(e.target.value)}
              rows={6}
              placeholder="Contá tu camino: cómo empezaste, qué lograste, qué te cuesta hoy y qué necesitás para dar el salto."
              className={`${inputCls} mt-[7px] resize-none leading-relaxed`}
            />
          </div>

          <div className="mb-8 grid gap-4 sm:grid-cols-2">
            <div>
              <label className={labelCls}>Próxima competencia</label>
              <input
                value={competencia}
                onChange={(e) => setCompetencia(e.target.value)}
                placeholder="Ej: Panamericano"
                className={`${inputCls} mt-[7px]`}
              />
            </div>
            <div>
              <label className={labelCls}>¿Cuándo?</label>
              <input
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                placeholder="Ej: Septiembre 2026"
                className={`${inputCls} mt-[7px]`}
              />
            </div>
          </div>

          {/* ── Redes ── */}
          <div className="mb-[18px]">
            <label className={labelCls}>
              Instagram{" "}
              <span className="text-white/35">· usuario o link</span>
            </label>
            <input
              value={instagram}
              onChange={(e) => setInstagram(e.target.value)}
              placeholder="Ej: @tunombre o instagram.com/tunombre"
              className={`${inputCls} mt-[7px]`}
            />
          </div>

          {/* ── Cómo te apoyan (cobros) ── */}
          <div
            className="mb-8 rounded-[12px] border border-white/[.08] p-[18px]"
            style={{ background: "#0d2238" }}
          >
            <div className="mb-1 font-display text-[15px] font-600 uppercase tracking-wide">
              ¿Dónde recibís el apoyo?
            </div>
            <p className="mb-4 text-[13px] leading-relaxed text-white/55">
              El 93% de cada aporte va directo a vos. Cargá al menos una cuenta;
              podés sumar las dos.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelCls}>Mercado Pago</label>
                <input
                  value={mpAccount}
                  onChange={(e) => setMpAccount(e.target.value)}
                  placeholder="Alias, CVU o email"
                  className={`${inputCls} mt-[7px]`}
                />
              </div>
              <div>
                <label className={labelCls}>PayPal</label>
                <input
                  value={paypalAccount}
                  onChange={(e) => setPaypalAccount(e.target.value)}
                  placeholder="Email o link de PayPal.me"
                  className={`${inputCls} mt-[7px]`}
                />
              </div>
            </div>
          </div>

          {ctaBtn("Continuar", () => go(3))}
        </section>
      )}

      {/* ── Step 3: Tus fotos ── */}
      {step === 3 && (
        <section className="mx-auto max-w-[760px] px-4 pb-24 pt-[30px] sm:px-6">
          <button type="button" className={backBtn} onClick={() => go(2)}>
            ← Atrás
          </button>
          <h2 className="mb-2 font-display text-[32px] font-700 uppercase leading-none tracking-tight">
            Tus fotos
          </h2>
          <p className="mb-6 text-[15px] text-white/60">
            Las fotos son lo que enamora a tus hinchas. Subí las mejores que
            tengas. JPG o PNG, hasta 5 MB.
          </p>

          <div className="mb-4 grid gap-4 sm:grid-cols-2">
            <PhotoSlot
              label="Retrato"
              preview={portraitPreview}
              onChange={(e) => pickFile("portrait", e)}
            />
            <PhotoSlot
              label="Foto en acción"
              preview={actionPreview}
              onChange={(e) => pickFile("action", e)}
            />
          </div>

          {fileMsg && (
            <p className="mb-4 text-[13px]" style={{ color: "#DF0024" }}>
              {fileMsg}
            </p>
          )}

          <div className="mt-6">{ctaBtn("Revisar y enviar", () => go(4))}</div>
        </section>
      )}

      {/* ── Step 4: Revisión ── */}
      {step === 4 && (
        <section className="mx-auto max-w-[760px] px-4 pb-24 pt-[30px] sm:px-6">
          <button type="button" className={backBtn} onClick={() => go(3)}>
            ← Atrás
          </button>
          <h2 className="mb-2 font-display text-[32px] font-700 uppercase leading-none tracking-tight">
            Así te van a ver
          </h2>
          <p className="mb-6 text-[15px] text-white/60">
            Un vistazo de tu tarjeta de atleta. Después de enviarla, la revisamos
            a mano.
          </p>

          <div className="flex flex-wrap gap-[22px]">
            {/* Preview card */}
            <div
              className="w-[280px] shrink-0 overflow-hidden rounded-[14px] shadow-[0_24px_56px_rgba(0,0,0,.5)]"
              style={{
                background: "#0d2238",
                borderTop: `3px solid ${sportColor}`,
              }}
            >
              <div className="relative h-[300px]">
                {portraitPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={portraitPreview}
                    alt=""
                    className="h-full w-full object-cover object-top"
                  />
                ) : (
                  <div
                    className="h-full w-full"
                    style={{
                      background: `linear-gradient(135deg,${sportColor}55,#0A1A2F)`,
                    }}
                  />
                )}
                <div
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(180deg,transparent 42%,rgba(13,34,56,.96))",
                  }}
                />
                <div
                  className="absolute left-3.5 top-3.5 rounded-[3px] px-2.5 py-1 font-display text-[11px] font-600 uppercase tracking-[.1em] text-white"
                  style={{ background: sportColor }}
                >
                  {deporteEfectivo || "Deporte"}
                </div>
                <div className="absolute bottom-3.5 left-4 right-4">
                  <div className="font-display text-[24px] font-600 uppercase leading-none">
                    {nombre || "Tu nombre"}
                  </div>
                  <div className="mt-[3px] text-[12px] text-white/65">
                    {ciudad || "Ciudad"}
                  </div>
                </div>
              </div>
              {frase && (
                <div className="px-4 py-3.5">
                  <p className="text-[13px] italic leading-relaxed text-white/72">
                    {frase}
                  </p>
                </div>
              )}
            </div>

            {/* Info + submit */}
            <div className="flex min-w-[260px] flex-1 flex-col gap-3">
              {(competencia || fecha) && (
                <div
                  className="rounded-[10px] border border-white/[.08] px-[18px] py-4"
                  style={{ background: "#0d2238" }}
                >
                  <div className="mb-1 text-[12px] text-white/50">
                    Próxima competencia
                  </div>
                  <div className="font-display text-[18px] font-600 uppercase">
                    {[competencia, fecha].filter(Boolean).join(" · ")}
                  </div>
                </div>
              )}
              {historia && (
                <div
                  className="rounded-[10px] border border-white/[.08] px-[18px] py-4"
                  style={{ background: "#0d2238" }}
                >
                  <div className="mb-1.5 text-[12px] text-white/50">
                    Tu historia
                  </div>
                  <p className="line-clamp-4 text-[14px] leading-relaxed text-white/75">
                    {historia}
                  </p>
                </div>
              )}

              {/* Trust note */}
              <div
                className="flex items-center gap-3 rounded-[12px] border border-gold/25 px-[18px] py-4"
                style={{
                  background: "linear-gradient(135deg,#102a44,#0b1f34)",
                }}
              >
                <span className="shrink-0 text-[22px]">🤝</span>
                <p className="text-[13px] leading-relaxed text-white/75">
                  Los fundadores —atletas como vos—{" "}
                  <strong className="text-white">
                    revisan cada postulación a mano
                  </strong>
                  . Te escribimos en 3 a 5 días.
                </p>
              </div>

              {/* Consentimiento legal */}
              <div
                className="rounded-[12px] border border-white/[.1] p-[16px]"
                style={{ background: "rgba(255,255,255,.03)" }}
              >
                <label className="flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    checked={acepta}
                    onChange={(e) => setAcepta(e.target.checked)}
                    className="mt-0.5 h-[18px] w-[18px] shrink-0 cursor-pointer accent-[#C9A227]"
                  />
                  <span className="text-[13px] leading-relaxed text-white/70">
                    Leí y acepto la{" "}
                    <Link href="/privacidad" target="_blank" className="text-gold underline">
                      Política de Privacidad
                    </Link>{" "}
                    y los{" "}
                    <Link href="/terminos" target="_blank" className="text-gold underline">
                      Términos y Condiciones
                    </Link>
                    , y autorizo el uso de mis fotos en mi perfil público de {SITE.brand}.
                  </span>
                </label>

                {esMenor && (
                  <label className="mt-3 flex cursor-pointer items-start gap-3 border-t border-white/[.08] pt-3">
                    <input
                      type="checkbox"
                      checked={aceptaTutor}
                      onChange={(e) => setAceptaTutor(e.target.checked)}
                      className="mt-0.5 h-[18px] w-[18px] shrink-0 cursor-pointer accent-[#C9A227]"
                    />
                    <span className="text-[13px] leading-relaxed text-white/70">
                      Soy menor de 18 y cuento con la autorización de mi madre, padre o
                      tutor/a legal, que acepta estas condiciones en mi nombre.
                    </span>
                  </label>
                )}
              </div>

              {status === "error" && (
                <p className="text-[13px]" style={{ color: "#DF0024" }}>
                  No se pudo enviar. Probá de nuevo o escribinos a{" "}
                  {APPLICATIONS_EMAIL}.
                </p>
              )}

              {ctaBtn(
                status === "loading" ? "Enviando…" : "Enviar mi postulación",
                handleSubmit,
                status === "loading" || !consentimientoOk,
              )}
            </div>
          </div>
        </section>
      )}
    </>
  );
}

function PhotoSlot({
  label,
  preview,
  onChange,
}: {
  label: string;
  preview: string | null;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}) {
  return (
    <label className="block cursor-pointer">
      <div className="mb-2 text-[13px] font-500 text-white/60">{label}</div>
      <div
        className="relative h-[230px] w-full overflow-hidden rounded-[12px] border border-dashed border-white/20 transition-colors hover:border-white/40"
        style={{ background: "rgba(255,255,255,.03)" }}
      >
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-white/30">
            <svg
              viewBox="0 0 24 24"
              className="h-8 w-8"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              aria-hidden
            >
              <path
                d="M4 16l4-4 4 4 4-6 4 6M4 20h16V4H4z"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="text-[13px]">Subir foto</span>
          </div>
        )}
        {preview && (
          <div className="absolute bottom-2 right-2 rounded bg-black/50 px-2 py-0.5 text-[11px] text-white/80">
            Cambiar
          </div>
        )}
      </div>
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={onChange}
        className="hidden"
      />
    </label>
  );
}
