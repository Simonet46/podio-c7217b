import Image from "next/image";
import Link from "next/link";
import { asset } from "@/config/site";
import { Monogram } from "./Monogram";

export type HeroAthlete = {
  slug: string;
  name: string;
  firstName: string;
  sportLabel: string;
  color: string;
  location: string;
  nextCompetition?: string | null;
  photo: string | null;
  backers: number;
};

/**
 * Hero inmersivo (rediseño "GRANITO"): titular emotivo + stack de fotos de
 * atletas reales en 3D + badges flotantes. Datos reales; el card central
 * linkea al perfil del atleta destacado.
 */
export function HomeHero({ featured }: { featured: HeroAthlete[] }) {
  const center = featured[0];
  const left = featured[1];
  const right = featured[2];
  if (!center) return null;

  return (
    <section className="relative overflow-hidden bg-ink text-white">
      {/* glow */}
      <div
        className="pointer-events-none absolute left-1/2 top-[-160px] h-[700px] w-[900px] -translate-x-1/2"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(108,180,228,.18), rgba(201,162,39,.08) 40%, transparent 68%)",
        }}
        aria-hidden
      />

      <div className="relative mx-auto max-w-container px-4 pb-14 pt-14 sm:px-6 sm:pt-16">
        {/* Titular */}
        <div className="mx-auto mb-10 max-w-3xl text-center">
          <p className="eyebrow inline-flex items-center gap-2.5 text-celeste">
            <span className="podio-pulse h-2 w-2 rounded-full bg-celeste" aria-hidden />
            Entrá en su historia
          </p>
          <h1 className="mt-5 font-display text-4xl font-700 uppercase leading-[0.95] tracking-tight sm:text-6xl lg:text-7xl">
            Cada atleta es
            <br />
            una historia <span className="text-gold">épica</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-white/70">
            No es lástima, es aguante. Metete en lo que hacen todos los días y
            apoyalos directo.
          </p>
        </div>

        {/* Stack de fotos */}
        <div
          className="relative mx-auto flex h-[420px] items-center justify-center sm:h-[560px]"
          style={{ perspective: "1600px" }}
        >
          {/* Cards laterales (solo desktop) */}
          {left && <SideCard athlete={left} side="left" />}
          {right && <SideCard athlete={right} side="right" />}

          {/* Card central */}
          <div className="relative z-10">
            <Link
              href={`/atleta/${center.slug}`}
              className="group relative block h-[360px] w-[260px] overflow-hidden rounded-2xl shadow-[0_50px_110px_rgba(0,0,0,.6),0_0_0_1px_rgba(255,255,255,.08)] sm:h-[540px] sm:w-[400px]"
            >
              <PhotoOrMono athlete={center} />
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(180deg, transparent 48%, rgba(10,26,47,.9))",
                }}
              />
              <div className="absolute inset-x-6 bottom-6">
                <span
                  className="inline-block rounded-[3px] px-2.5 py-1 font-display text-[11px] font-600 uppercase tracking-[0.12em] text-white"
                  style={{ backgroundColor: center.color }}
                >
                  {center.sportLabel}
                </span>
                <div className="mt-2.5 font-display text-2xl font-600 uppercase leading-none sm:text-3xl">
                  {center.name}
                </div>
                <div className="mt-1 text-sm text-white/70">
                  {center.location}
                  {center.nextCompetition ? ` · Próxima: ${center.nextCompetition}` : ""}
                </div>
              </div>
            </Link>

            {/* Badges flotantes */}
            <div className="podio-float2 absolute -right-5 top-16 rounded-xl bg-white px-4 py-3 text-ink shadow-[0_18px_44px_rgba(0,0,0,.4)] sm:-right-20">
              <div className="font-display text-2xl font-700 leading-none">
                {center.backers}
              </div>
              <div className="text-[11px] font-600 text-steel">apoyando</div>
            </div>
            <div className="podio-float absolute -right-3 bottom-10 flex items-center gap-2 rounded-full border border-white/12 bg-ink-2/95 px-3.5 py-2 shadow-[0_14px_36px_rgba(0,0,0,.45)] sm:-right-16">
              <span className="h-2 w-2 rounded-full bg-green-500" aria-hidden />
              <span className="text-[13px] font-500 text-white">Recién la apoyaron</span>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-12 text-center sm:mt-10">
          <Link
            href={`/atleta/${center.slug}`}
            className="inline-block rounded-md bg-gold px-8 py-4 font-display text-base font-700 uppercase tracking-wide text-ink transition-transform hover:-translate-y-0.5"
          >
            Apoyá a {center.firstName}
          </Link>
        </div>
      </div>
    </section>
  );
}

function SideCard({ athlete, side }: { athlete: HeroAthlete; side: "left" | "right" }) {
  const tx = side === "left" ? "-300px" : "300px";
  const ry = side === "left" ? "28deg" : "-28deg";
  return (
    <div
      className="absolute left-1/2 top-1/2 hidden h-[380px] w-[240px] overflow-hidden rounded-[10px] opacity-50 shadow-[0_30px_70px_rgba(0,0,0,.5)] lg:block"
      style={{
        transform: `translate(-50%,-50%) translateX(${tx}) rotateY(${ry}) scale(.82)`,
      }}
      aria-hidden
    >
      <PhotoOrMono athlete={athlete} />
    </div>
  );
}

function PhotoOrMono({ athlete }: { athlete: HeroAthlete }) {
  if (athlete.photo) {
    return (
      <Image
        src={asset(athlete.photo)}
        alt={athlete.name}
        fill
        priority
        sizes="(max-width: 640px) 260px, 400px"
        className="object-cover transition-transform duration-500 group-hover:scale-105"
      />
    );
  }
  return <Monogram name={athlete.name} color={athlete.color} className="h-full w-full" />;
}
