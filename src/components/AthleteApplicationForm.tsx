"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SPORT_LIST } from "@/config/sports";
import { WEB3FORMS_ACCESS_KEY, APPLICATIONS_EMAIL, SITE } from "@/config/site";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";
import { legalDoc } from "@/config/legal";
import { recordAcceptance } from "@/lib/legal";
import { PhoneField, buildPhone } from "./PhoneField";

type Step = 1 | 2 | 3 | 4 | 5; // 5 = done

const MAX_BYTES = 5 * 1024 * 1024;
// Versión de los términos aceptados: centralizada en @/config/legal para que la
// postulación y las páginas legales nunca se desincronicen.
const TERMS_VERSION = legalDoc("terminos-generales").version;

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
  const [prefijo, setPrefijo] = useState("+54");
  const [telefono, setTelefono] = useState("");
  const [edad, setEdad] = useState("");
  const [dni, setDni] = useState("");
  const [ciudad, setCiudad] = useState("");
  const [deporte, setDeporte] = useState("");
  const [deporteOtro, setDeporteOtro] = useState(""); // si elige "Otro"
  const [disciplina, setDisciplina] = useState(""); // solo atletismo
  const [nivel, setNivel] = useState(""); // aficionado | federado | profesional | alto-rendimiento
  const [club, setClub] = useState("");

  // Step 2
  const [frase, setFrase] = useState("");
  const [historia, setHistoria] = useState("");
  const [competencia, setCompetencia] = useState("");
  const [fecha, setFecha] = useState("");
  const [instagram, setInstagram] = useState("");
  const [mpAccount, setMpAccount] = useState("");
  const [paypalAccount, setPaypalAccount] = useState("");
  const [tieneBeca, setTieneBeca] = useState(false); // ENARD u otro apoyo público
  const [tienePatrocinio, setTienePatrocinio] = useState(false);

  // Step 3
  const [portraitFile, setPortraitFile] = useState<File | null>(null);
  const [actionFile, setActionFile] = useState<File | null>(null);
  const [portraitPreview, setPortraitPreview] = useState<string | null>(null);
  const [actionPreview, setActionPreview] = useState<string | null>(null);
  const [fileMsg, setFileMsg] = useState("");

  // Consentimiento legal (checkboxes separados — Kahale Fase 3)
  const [aceptaTerminos, setAceptaTerminos] = useState(false); // Contrato del Atleta + T&C
  const [aceptaPrivacidad, setAceptaPrivacidad] = useState(false);
  const [aceptaImagen, setAceptaImagen] = useState(false);
  const [declaraCompat, setDeclaraCompat] = useState(false); // veracidad + compat. federativa + titularidad cuenta

  // Submit
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [connecting, setConnecting] = useState(false); // conexión MP en curso
  const [mpConnected, setMpConnected] = useState(false); // ✓ MP conectado
  // Código de sesión para la conexión MP "en tránsito" (se genera una vez).
  const [connectToken] = useState<string>(() => {
    try {
      if (typeof crypto !== "undefined" && crypto.randomUUID) {
        return crypto.randomUUID();
      }
      const a = new Uint8Array(16);
      crypto.getRandomValues(a);
      return Array.from(a)
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
    } catch {
      return "00000000000000000000000000000000";
    }
  });

  // El popup de conexión avisa por postMessage cuando termina.
  useEffect(() => {
    function onMsg(e: MessageEvent) {
      if (e?.data?.type === "mp-connect") {
        setConnecting(false);
        if (e.data.ok) setMpConnected(true);
      }
    }
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, []);

  const edadNum = Number(edad);
  const esMenor = edad.trim() !== "" && edadNum < 18;
  const edadValida = edad.trim() !== "" && edadNum >= 18 && edadNum <= 120;
  const consentimientoOk =
    aceptaTerminos && aceptaPrivacidad && aceptaImagen && declaraCompat;

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
      // Generamos el id en el navegador: el usuario anónimo puede INSERTAR pero
      // no LEER postulaciones, así que no podemos usar .select() para recuperarlo.
      const id =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : connectToken;
      const payload = {
        id,
        full_name: nombre,
        sport: deporteEfectivo,
        discipline: esAtletismo ? disciplina || null : null,
        location: ciudad || null,
        email,
        phone: buildPhone(prefijo, telefono) || null,
        age: edad ? Number(edad) : null,
        dni: dni || null,
        next_competition: nextComp,
        photo_url: photos.photo_url,
        photo_secondary_url: photos.photo_secondary_url,
        achievements: frase || null,
        needs: historia || null,
        socials: instagram || null,
        payment_mp: mpAccount || null,
        payment_paypal: paypalAccount || null,
        sport_level: nivel || null,
        club: club || null,
        has_public_grant: tieneBeca,
        has_sponsorship: tienePatrocinio,
        federative_compat_declared: declaraCompat,
        mp_ownership_declared: declaraCompat,
        accepted_terms: aceptaTerminos,
        accepted_at: new Date().toISOString(),
        terms_version: TERMS_VERSION,
        image_consent: aceptaImagen,
        is_minor_guardian: false,
        status: "pending",
      };
      const { error } = await supabase
        .from("athlete_applications")
        .insert(payload);
      return error ? null : id;
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
      telefono: buildPhone(prefijo, telefono),
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
      try {
        const supabase = await getSupabase();
        // Si conectó MP durante el registro, vinculamos el token a la postulación.
        if (mpConnected) {
          await supabase?.functions.invoke("mp-claim-pending", {
            body: { application_id: newId, connect_token: connectToken },
          });
        }
        // Avisar al equipo por email + confirmarle al atleta (Resend).
        await supabase?.functions.invoke("notify-application", {
          body: { application_id: newId },
        });
        // Registrar la evidencia de aceptación (IP, user-agent, versión) —
        // best-effort, no bloquea la postulación. Kahale secc. 10.
        await recordAcceptance({
          actorType: "atleta",
          context: "postulacion",
          docTypes: [
            "terminos-generales",
            "contrato-beneficiario",
            "privacidad",
            "propiedad-intelectual",
          ],
          email: email || null,
          relatedId: newId,
          meta: {
            image_consent: aceptaImagen,
            federative_compat_declared: declaraCompat,
            mp_ownership_declared: declaraCompat,
            sport_level: nivel || null,
            has_public_grant: tieneBeca,
            has_sponsorship: tienePatrocinio,
          },
        });
      } catch {}
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

  /**
   * Conecta el Mercado Pago del atleta SIN salir del formulario: abre un popup
   * con la autorización de MP. El token queda "en tránsito" atado al
   * connectToken; al enviar la postulación se vincula (mp-claim-pending).
   */
  async function connectMP() {
    if (connecting || mpConnected) return;
    setConnecting(true);
    // Abrir el popup en el mismo gesto del click (evita el bloqueador).
    const popup = window.open("", "granito-mp", "width=520,height=720");
    // Escribirle algo: algunos navegadores cierran las ventanas "about:blank".
    try {
      popup?.document.write(
        "<p style='font-family:system-ui,sans-serif;padding:24px;color:#333'>Conectando con Mercado Pago…</p>",
      );
    } catch {}
    try {
      const supabase = await getSupabase();
      const { data, error } = await supabase!.functions.invoke(
        "mp-app-connect-url",
        { body: { connect_token: connectToken } },
      );
      const url = (data?.url as string | undefined) ?? undefined;
      if (error || !url) {
        popup?.close();
        setConnecting(false);
        alert(
          "No se pudo iniciar la conexión con Mercado Pago.\n" +
            (error?.message || JSON.stringify(data) || "sin URL"),
        );
        return;
      }
      if (popup && !popup.closed) {
        popup.location.href = url;
      } else {
        // Popup bloqueado → redirección completa como fallback.
        window.location.href = url;
      }
    } catch (e) {
      popup?.close();
      setConnecting(false);
      alert("Error al conectar: " + (e instanceof Error ? e.message : String(e)));
    }
  }

  function reset() {
    setStep(1);
    setNombre("");
    setEmail("");
    setEdad("");
    setDni("");
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
    setNivel("");
    setClub("");
    setTieneBeca(false);
    setTienePatrocinio(false);
    setAceptaTerminos(false);
    setAceptaPrivacidad(false);
    setAceptaImagen(false);
    setDeclaraCompat(false);
    setStatus("idle");
    setConnecting(false);
    setMpConnected(false);
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

        {mpConnected ? (
          <div
            className="mx-auto mt-7 flex max-w-[460px] items-center justify-center gap-2 rounded-[14px] p-4 font-display text-[15px] font-600 uppercase tracking-wide"
            style={{ background: "rgba(34,197,94,.12)", border: "1px solid rgba(34,197,94,.5)", color: "#22c55e" }}
          >
            ✓ Tu Mercado Pago quedó conectado
          </div>
        ) : (
          <div
            className="mx-auto mt-7 max-w-[460px] rounded-[12px] p-4 text-[13px] leading-relaxed text-white/60"
            style={{ background: "#0d2238", border: "1px solid rgba(255,255,255,.08)" }}
          >
            No conectaste tu Mercado Pago. No pasa nada: cuando aprobemos tu
            postulación te mandamos un link para conectarlo y recibir los aportes.
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

          <div className="mb-[18px]">
            <label className={labelCls}>Teléfono de contacto (con WhatsApp si tenés)</label>
            <div className="mt-[7px]">
              <PhoneField
                prefix={prefijo}
                number={telefono}
                onPrefix={setPrefijo}
                onNumber={setTelefono}
                inputClassName={inputCls}
              />
            </div>
            <p className="mt-1.5 text-[12px] text-white/40">
              Puede que te contactemos por acá para verificar tu postulación.
            </p>
          </div>

          <div
            className="mb-6 grid gap-4"
            style={{ gridTemplateColumns: "160px 1fr" }}
          >
            <div>
              <label className={labelCls}>Edad</label>
              <input
                value={edad}
                onChange={(e) => setEdad(e.target.value.replace(/[^\d]/g, ""))}
                inputMode="numeric"
                maxLength={3}
                placeholder="Ej: 22"
                className={`${inputCls} mt-[7px]`}
                style={esMenor ? { borderColor: "rgba(223,0,36,.6)" } : undefined}
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

          {esMenor && (
            <div
              className="mb-6 rounded-[10px] p-4 text-[13px] leading-relaxed"
              style={{ background: "rgba(223,0,36,.08)", border: "1px solid rgba(223,0,36,.4)", color: "#ff9aa9" }}
            >
              Por ahora {SITE.brand} solo recibe postulaciones de <strong>mayores de
              18 años</strong>. Estamos preparando el proceso para menores con la
              autorización de madre, padre o tutor/a legal. Escribinos a{" "}
              {APPLICATIONS_EMAIL} y te avisamos cuando esté disponible.
            </div>
          )}

          <div className="mb-6">
            <label className={labelCls}>
              DNI <span className="text-white/35">· para verificar tu identidad al aprobar cobros</span>
            </label>
            <input
              value={dni}
              onChange={(e) => setDni(e.target.value.replace(/[^\d]/g, ""))}
              inputMode="numeric"
              maxLength={9}
              placeholder="Sin puntos, ej: 39245386"
              className={`${inputCls} mt-[7px]`}
            />
          </div>

          <div className="mb-6">
            <div className={`${labelCls} mb-3`}>
              Tu nivel deportivo{" "}
              <span className="text-white/35">· como te definís hoy</span>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {[
                { key: "aficionado", label: "Aficionado" },
                { key: "federado", label: "Federado" },
                { key: "profesional", label: "Profesional" },
                { key: "alto-rendimiento", label: "Alto rendimiento" },
              ].map((n) => {
                const active = n.key === nivel;
                return (
                  <button
                    key={n.key}
                    type="button"
                    onClick={() => setNivel(n.key)}
                    className="cursor-pointer rounded-full font-display text-[13px] font-600 uppercase tracking-wide text-white transition-all"
                    style={{
                      padding: "11px 18px",
                      border: `1px solid ${active ? "#C9A227" : "rgba(255,255,255,.16)"}`,
                      background: active ? "#C9A227" : "transparent",
                      color: active ? "#0A1A2F" : "#fff",
                    }}
                  >
                    {n.label}
                  </button>
                );
              })}
            </div>
            <div className="mt-4">
              <label className={labelCls}>
                Club o entidad{" "}
                <span className="text-white/35">· opcional, si tenés</span>
              </label>
              <input
                value={club}
                onChange={(e) => setClub(e.target.value)}
                placeholder="Ej: Club Atlético…"
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
            !nombre || !email || !telefono.trim() || !edadValida || !nivel ||
              !deporte || (esOtro && !deporteOtro.trim()),
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
              El 93% de cada aporte va directo a vos. Conectá tu Mercado Pago
              con tu propia cuenta y listo.
            </p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelCls}>Mercado Pago</label>
                {mpConnected ? (
                  <div
                    className="mt-[7px] flex items-center gap-2 rounded-[10px] px-[15px] py-[13px] text-[15px] font-600"
                    style={{
                      background: "rgba(34,197,94,.12)",
                      border: "1px solid rgba(34,197,94,.5)",
                      color: "#22c55e",
                    }}
                  >
                    ✓ Conectado
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={connectMP}
                    disabled={connecting}
                    className="mt-[7px] w-full cursor-pointer rounded-[10px] border-0 py-[13px] font-display text-[14px] font-700 uppercase tracking-wide text-white transition-all hover:-translate-y-0.5 disabled:opacity-60"
                    style={{ background: "#009ee3" }}
                  >
                    {connecting ? "Abriendo Mercado Pago…" : "Conectar Mercado Pago"}
                  </button>
                )}
              </div>
              <div>
                <label className={labelCls}>
                  PayPal <span className="text-white/35">· opcional</span>
                </label>
                <input
                  value={paypalAccount}
                  onChange={(e) => setPaypalAccount(e.target.value)}
                  placeholder="Email o link de PayPal.me"
                  className={`${inputCls} mt-[7px]`}
                />
              </div>
            </div>
            {!mpConnected && (
              <p className="mt-3 text-[12px] text-white/40">
                Se abre una ventana de Mercado Pago para que autorices con tu
                cuenta. Tu postulación no se pierde.
              </p>
            )}
            <p className="mt-3 text-[12px] leading-relaxed text-white/40">
              La cuenta de cobro debe ser <strong className="text-white/60">a tu
              nombre</strong>. Los aportes se acreditan directo en ella; {SITE.brand}{" "}
              no retiene los fondos.
            </p>
          </div>

          {/* ── Situación deportiva (declaraciones) ── */}
          <div
            className="mb-8 rounded-[12px] border border-white/[.08] p-[18px]"
            style={{ background: "#0d2238" }}
          >
            <div className="mb-3 font-display text-[15px] font-600 uppercase tracking-wide">
              Tu situación deportiva
            </div>
            <label className="flex cursor-pointer items-start gap-3">
              <input
                type="checkbox"
                checked={tieneBeca}
                onChange={(e) => setTieneBeca(e.target.checked)}
                className="mt-0.5 h-[18px] w-[18px] shrink-0 cursor-pointer accent-[#C9A227]"
              />
              <span className="text-[13px] leading-relaxed text-white/70">
                Recibo una beca del <strong className="text-white">ENARD</strong> u otro
                apoyo público.
              </span>
            </label>
            {tieneBeca && (
              <p className="ml-[30px] mt-1.5 text-[12px] leading-relaxed text-white/45">
                Verificá que recibir aportes por {SITE.brand} sea compatible con las
                condiciones de tu beca (declarar ingresos, rendir cuentas, etc.).
              </p>
            )}
            <label className="mt-3 flex cursor-pointer items-start gap-3 border-t border-white/[.08] pt-3">
              <input
                type="checkbox"
                checked={tienePatrocinio}
                onChange={(e) => setTienePatrocinio(e.target.checked)}
                className="mt-0.5 h-[18px] w-[18px] shrink-0 cursor-pointer accent-[#C9A227]"
              />
              <span className="text-[13px] leading-relaxed text-white/70">
                Tengo contratos de <strong className="text-white">patrocinio o
                representación</strong> vigentes.
              </span>
            </label>
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

              {/* Consentimiento legal — checkboxes separados */}
              <div
                className="flex flex-col gap-3 rounded-[12px] border border-white/[.1] p-[16px]"
                style={{ background: "rgba(255,255,255,.03)" }}
              >
                <label className="flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    checked={aceptaTerminos}
                    onChange={(e) => setAceptaTerminos(e.target.checked)}
                    className="mt-0.5 h-[18px] w-[18px] shrink-0 cursor-pointer accent-[#C9A227]"
                  />
                  <span className="text-[13px] leading-relaxed text-white/70">
                    Leí y acepto los{" "}
                    <Link href="/terminos" target="_blank" className="text-gold underline">
                      Términos y Condiciones
                    </Link>{" "}
                    y el{" "}
                    <Link href="/legal/contrato-atleta" target="_blank" className="text-gold underline">
                      Contrato del Atleta
                    </Link>
                    .
                  </span>
                </label>

                <label className="flex cursor-pointer items-start gap-3 border-t border-white/[.08] pt-3">
                  <input
                    type="checkbox"
                    checked={aceptaPrivacidad}
                    onChange={(e) => setAceptaPrivacidad(e.target.checked)}
                    className="mt-0.5 h-[18px] w-[18px] shrink-0 cursor-pointer accent-[#C9A227]"
                  />
                  <span className="text-[13px] leading-relaxed text-white/70">
                    Leí y acepto la{" "}
                    <Link href="/privacidad" target="_blank" className="text-gold underline">
                      Política de Privacidad
                    </Link>
                    .
                  </span>
                </label>

                <label className="flex cursor-pointer items-start gap-3 border-t border-white/[.08] pt-3">
                  <input
                    type="checkbox"
                    checked={aceptaImagen}
                    onChange={(e) => setAceptaImagen(e.target.checked)}
                    className="mt-0.5 h-[18px] w-[18px] shrink-0 cursor-pointer accent-[#C9A227]"
                  />
                  <span className="text-[13px] leading-relaxed text-white/70">
                    Autorizo el uso de mis fotos e imagen en mi perfil público y en la
                    difusión de mi campaña, según la{" "}
                    <Link href="/legal/propiedad-intelectual" target="_blank" className="text-gold underline">
                      Política de Propiedad Intelectual
                    </Link>
                    .
                  </span>
                </label>

                <label className="flex cursor-pointer items-start gap-3 border-t border-white/[.08] pt-3">
                  <input
                    type="checkbox"
                    checked={declaraCompat}
                    onChange={(e) => setDeclaraCompat(e.target.checked)}
                    className="mt-0.5 h-[18px] w-[18px] shrink-0 cursor-pointer accent-[#C9A227]"
                  />
                  <span className="text-[13px] leading-relaxed text-white/70">
                    Declaro que mis datos son veraces, que la cuenta de cobro es de mi
                    titularidad, y que mi participación y campaña son{" "}
                    <strong className="text-white">compatibles con mis obligaciones</strong>{" "}
                    ante federaciones, club y contratos vigentes.
                  </span>
                </label>
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
