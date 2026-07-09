import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Reveal } from "@/components/Reveal";
import { TeamPledgeWidget } from "@/components/TeamPledgeWidget";
import {
  CampaignDaysChip,
  sportColorForTeam,
} from "@/components/TeamCampaignCard";
import {
  getTeamCampaigns,
  getTeamCampaignBySlug,
} from "@/lib/data/campaigns";
import { SITE } from "@/config/site";

export async function generateStaticParams() {
  const campaigns = await getTeamCampaigns();
  const params = campaigns.map((c) => ({ slug: c.slug }));
  // output: export NO admite una ruta dinámica con generateStaticParams vacío
  // (tira "missing generateStaticParams"). Si todavía no hay campañas (ningún
  // equipo con MP conectado), devolvemos un slug placeholder que la página
  // resuelve con notFound(). Sin esto, el build de CI falla.
  return params.length ? params : [{ slug: "__none__" }];
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const c = await getTeamCampaignBySlug(params.slug);
  if (!c) return { title: SITE.brand };
  return {
    title: `${c.team_name} — Campaña — ${SITE.brand}`,
    description:
      c.goal_purpose ??
      `Sumá tu granito para que ${c.team_name} llegue a ${c.competition ?? "su próxima competencia"}.`,
  };
}

function fmtDate(d: string | null): string | null {
  if (!d) return null;
  return new Date(d + "T12:00:00").toLocaleDateString("es-AR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function TeamCampaignPage({
  params,
}: {
  params: { slug: string };
}) {
  const campaign = await getTeamCampaignBySlug(params.slug);
  if (!campaign) notFound();

  const color = sportColorForTeam(campaign.sport);
  const initials = campaign.team_name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
  const start = fmtDate(campaign.fundraising_start);
  const end = fmtDate(campaign.fundraising_end);

  return (
    <>
      <Header />
      <main className="overflow-x-hidden bg-ink text-white">
        {/* Glow del color del deporte */}
        <div className="relative">
          <div
            className="pointer-events-none absolute left-1/2 top-[-180px] h-[520px] w-[900px] -translate-x-1/2"
            style={{ background: `radial-gradient(ellipse at center, ${color}2e, transparent 65%)` }}
            aria-hidden
          />

          <div className="relative mx-auto max-w-[1080px] px-4 pb-20 pt-12 sm:px-6">
            <Link
              href="/#equipos"
              className="text-[13px] text-white/40 transition-colors hover:text-white/70"
            >
              ← Equipos en campaña
            </Link>

            <div className="mt-6 grid gap-10 lg:grid-cols-[1.25fr_1fr]">
              {/* ── Columna misión ── */}
              <div>
                <Reveal>
                  <div className="flex items-center gap-5">
                    <div
                      className="flex h-[84px] w-[84px] shrink-0 items-center justify-center rounded-[20px] font-display text-[30px] font-700"
                      style={{ background: `${color}22`, border: `2px solid ${color}55`, color }}
                    >
                      {initials}
                    </div>
                    <div className="min-w-0">
                      <span
                        className="inline-block rounded-[3px] px-2.5 py-1 font-display text-[11px] font-600 uppercase tracking-[0.12em] text-white"
                        style={{ backgroundColor: color }}
                      >
                        {campaign.sport}
                      </span>
                      <h1 className="mt-2 font-display text-4xl font-700 uppercase leading-[.95] tracking-tight sm:text-5xl">
                        {campaign.team_name}
                      </h1>
                    </div>
                  </div>

                  <div className="mt-5 flex flex-wrap items-center gap-2.5">
                    {campaign.competition && (
                      <span
                        className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 font-display text-[12px] font-600 uppercase tracking-wide"
                        style={{ background: "rgba(201,162,39,.12)", border: "1px solid rgba(201,162,39,.35)", color: "#C9A227" }}
                      >
                        🎯 Misión: {campaign.competition}
                      </span>
                    )}
                    <CampaignDaysChip campaign={campaign} />
                  </div>
                </Reveal>

                {campaign.goal_purpose && (
                  <Reveal>
                    <div className="mt-8">
                      <p className="eyebrow text-gold">Para qué es tu granito</p>
                      <p className="mt-3 max-w-xl text-[17px] leading-relaxed text-white/75">
                        {campaign.goal_purpose}
                      </p>
                    </div>
                  </Reveal>
                )}

                {(start || end) && (
                  <Reveal>
                    <div className="mt-7 flex flex-wrap gap-3">
                      {start && (
                        <div className="rounded-[12px] px-4 py-3" style={{ background: "#0d2238", border: "1px solid rgba(255,255,255,.08)" }}>
                          <p className="text-[11px] uppercase tracking-wide text-white/40">Campaña desde</p>
                          <p className="mt-0.5 font-display text-[15px] font-600 text-white">{start}</p>
                        </div>
                      )}
                      {end && (
                        <div className="rounded-[12px] px-4 py-3" style={{ background: "#0d2238", border: "1px solid rgba(255,255,255,.08)" }}>
                          <p className="text-[11px] uppercase tracking-wide text-white/40">Cierra el</p>
                          <p className="mt-0.5 font-display text-[15px] font-600 text-white">{end}</p>
                        </div>
                      )}
                    </div>
                  </Reveal>
                )}

                {/* Cómo funciona el modelo standby */}
                <Reveal>
                  <div className="mt-10">
                    <p className="eyebrow text-celeste">Cómo funciona</p>
                    <div className="mt-4 flex flex-col gap-3">
                      {[
                        ["01", "Elegís el monto y aportás", "Tu aporte se debita al instante, con Mercado Pago. Sin vueltas."],
                        ["02", "Va directo al equipo", "El 93% llega directo a la cuenta del equipo; el 7% sostiene la plataforma. No pasa por nosotros."],
                        ["03", "El objetivo es una referencia", "La barra muestra cuánto va juntando. Aunque no llegue al objetivo, el equipo recibe todo lo recaudado."],
                      ].map(([n, t, b]) => (
                        <div
                          key={n}
                          className="flex gap-4 rounded-[12px] p-4"
                          style={{ background: "#0d2238", border: "1px solid rgba(255,255,255,.07)" }}
                        >
                          <span className="font-display text-[22px] font-700 leading-none text-gold">{n}</span>
                          <div>
                            <p className="font-display text-[15px] font-600 uppercase text-white">{t}</p>
                            <p className="mt-1 text-[13px] leading-relaxed text-white/55">{b}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Reveal>
              </div>

              {/* ── Columna aporte ── */}
              <div className="lg:sticky lg:top-24 lg:self-start">
                <Reveal>
                  <TeamPledgeWidget campaign={campaign} />
                </Reveal>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
