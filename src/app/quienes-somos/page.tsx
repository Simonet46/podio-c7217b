import type { Metadata } from "next";
import Image from "next/image";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FounderAvatar } from "@/components/FounderAvatar";
import { Reveal } from "@/components/Reveal";
import { SITE } from "@/config/site";

export const metadata: Metadata = {
  title: `Quiénes somos — ${SITE.brand}`,
  description:
    "Tres atletas argentinos de élite detrás de la plataforma: Diego Simonet, Pablo Simonet y Pilar Campoy.",
};

const FOUNDERS = [
  {
    name: "Diego Simonet",
    tag: '"El Chino" · Handball · Los Gladiadores',
    color: "#0072CE",
    photo: "/founders/diego-simonet.webp",
    bio: [
      'Referente histórico del handball argentino, lo llamaron "el Messi del handball". Pasó 13 temporadas en el Montpellier de Francia, donde levantó la Champions League de Europa en 2018 además de copas y ligas.',
      "Con la Selección jugó seis Mundiales, tres Juegos Olímpicos y ganó tres oros panamericanos con Los Gladiadores. Se retiró en 2026 tras una carrera que marcó a una generación.",
    ],
  },
  {
    name: "Pablo Simonet",
    tag: "Handball · Los Gladiadores",
    color: "#009F3D",
    photo: "/founders/pablo-simonet.webp",
    bio: [
      "El menor de los hermanos Simonet, también Gladiador. Se formó jugando junto a sus hermanos en la Selección y desarrolló su carrera profesional en España.",
      "Defendió a la Argentina en los Juegos Olímpicos de París 2024. Conoce de primera mano lo que cuesta sostener una carrera de alto rendimiento lejos de casa.",
    ],
  },
  {
    name: "Pilar Campoy",
    tag: '"Pilu" · Hockey · Las Leonas',
    color: "#DF0024",
    photo: "/founders/pilar-campoy.webp",
    bio: [
      "Jugadora de la Selección Argentina de hockey, Las Leonas. Disputó los Juegos Olímpicos de Río 2016 y, ocho años después, volvió a vestir la celeste y blanca en París 2024.",
      "Medallista de oro en los Juegos Panamericanos 2023, vivió todo el ciclo olímpico desde adentro: la preparación, los viajes y el esfuerzo que casi nunca se ve.",
    ],
  },
];

export default function QuienesSomosPage() {
  return (
    <>
      <Header />
      <main className="overflow-x-hidden bg-ink text-white">

        {/* ── Hero ── */}
        <section className="relative mx-auto max-w-[980px] overflow-hidden px-6 pb-8 pt-[88px] text-center sm:px-12">
          <div
            className="pointer-events-none absolute"
            style={{
              top: "-140px",
              left: "50%",
              transform: "translateX(-50%)",
              width: "880px",
              height: "600px",
              background: "radial-gradient(ellipse at center,rgba(201,162,39,.18),transparent 66%)",
            }}
            aria-hidden
          />
          <Reveal>
            <div
              className="mx-auto mb-6 h-[18px] w-[170px] rounded"
              style={{
                background:
                  "linear-gradient(90deg,#0072CE 0 20%,#F4C300 20% 40%,#1A1A1A 40% 60%,#009F3D 60% 80%,#DF0024 80% 100%)",
              }}
              aria-hidden
            />
            <p className="eyebrow mb-4 text-gold">Quiénes somos</p>
            <h1
              className="mx-auto mb-6 max-w-[820px] font-display font-700 uppercase leading-[.96]"
              style={{ fontSize: "clamp(40px,5.5vw,64px)", letterSpacing: "-.01em" }}
            >
              Dejamos la vida por esta camiseta.{" "}
              <span className="text-gold">Ahora la apoyamos.</span>
            </h1>
            <p
              className="mx-auto text-white/72"
              style={{ fontSize: "19px", lineHeight: "1.65", maxWidth: "680px" }}
            >
              Somos tres atletas que dedicamos la vida entera a un sueño: ponernos la
              celeste y blanca y representar a la Argentina. Lo logramos. Y en el camino
              conocimos, de primera mano, lo poco que se apoya a quienes dejan todo por
              el país. {SITE.brand} es nuestra forma de devolver algo de eso.
            </p>
          </Reveal>
        </section>

        {/* ── Fundadores ── */}
        <section className="mx-auto max-w-[1080px] px-6 pb-5 pt-14 sm:px-12">
          <Reveal className="mb-11 text-center">
            <p className="eyebrow mb-2.5 text-gold">Fundada por atletas</p>
            <h2
              className="font-display font-700 uppercase leading-[.95]"
              style={{ fontSize: "clamp(34px,4vw,46px)", letterSpacing: "-.01em" }}
            >
              Los que están detrás
            </h2>
          </Reveal>

          <div className="flex flex-col gap-8">
            {FOUNDERS.map((f, i) => (
              <Reveal key={f.name}>
                <div
                  className="grid grid-cols-1 items-center gap-6 rounded-[20px] p-6 md:grid-cols-2 md:gap-11"
                  style={{
                    background: "#0d2238",
                    border: "1px solid rgba(255,255,255,.07)",
                    boxShadow: "0 8px 24px rgba(0,0,0,.45)",
                  }}
                >
                  {/* Imagen — en cards impares va al final en desktop */}
                  <div
                    className={`relative overflow-hidden rounded-2xl ${i % 2 !== 0 ? "md:order-last" : ""}`}
                    style={{
                      borderTop: `4px solid ${f.color}`,
                      boxShadow: "0 8px 24px rgba(0,0,0,.45)",
                      height: "420px",
                    }}
                  >
                    <FounderAvatar name={f.name} photo={f.photo} color={f.color} />
                    <div
                      className="pointer-events-none absolute inset-0"
                      style={{ background: "linear-gradient(180deg,transparent 55%,rgba(8,19,31,.55))" }}
                      aria-hidden
                    />
                  </div>

                  {/* Texto */}
                  <div className="px-1 py-2">
                    <h3
                      className="font-display font-700 uppercase leading-none"
                      style={{ fontSize: "clamp(28px,3vw,40px)", marginBottom: "10px" }}
                    >
                      {f.name}
                    </h3>
                    <div
                      className="mb-5 inline-flex items-center gap-2 font-display font-500 uppercase"
                      style={{
                        fontSize: "13px",
                        letterSpacing: ".05em",
                        color: "#0A1A2F",
                        background: f.color,
                        padding: "6px 12px",
                        borderRadius: "999px",
                      }}
                    >
                      {f.tag}
                    </div>
                    {f.bio.map((p, j) => (
                      <p
                        key={j}
                        className={j < f.bio.length - 1 ? "mb-4" : ""}
                        style={{ fontSize: "16px", lineHeight: "1.7", color: "rgba(255,255,255,.74)" }}
                      >
                        {p}
                      </p>
                    ))}
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* ── Por qué lo hacemos ── */}
        <section className="relative mt-12 overflow-hidden">
          <div
            className="pointer-events-none absolute inset-0"
            style={{ background: "radial-gradient(ellipse at 50% 0%,rgba(201,162,39,.1),transparent 60%)" }}
            aria-hidden
          />
          <Reveal>
            <div
              className="relative mx-auto text-center"
              style={{ maxWidth: "880px", padding: "72px 48px" }}
            >
              <p className="eyebrow mb-4 text-gold">Por qué lo hacemos</p>
              <h2
                className="font-display font-700 uppercase leading-[.96]"
                style={{ fontSize: "clamp(32px,4vw,48px)", letterSpacing: "-.01em", marginBottom: "30px" }}
              >
                Sabemos lo que cuesta.
                <br />
                Lo vivimos.
              </h2>
              <p
                className="mb-6 text-white/74"
                style={{ fontSize: "18px", lineHeight: "1.75" }}
              >
                En la Argentina el talento sobra. Lo que falta es apoyo. Vimos a
                compañeros enormes entrenar de madrugada, pagarse los pasajes, dejar el
                estudio o el laburo y, muchas veces, tener que elegir entre su sueño y
                llegar a fin de mes.
              </p>
              <p
                className="mb-9 text-white/74"
                style={{ fontSize: "18px", lineHeight: "1.75" }}
              >
                Nosotros llegamos a representar al país a fuerza de sacrificio — y de
                gente que, en silencio, nos apoyó. {SITE.brand} nace para que la próxima
                camada no esté sola: para convertir la admiración en apoyo concreto,
                directo y transparente.
              </p>
              <p
                className="font-display font-700 uppercase text-gold"
                style={{ fontSize: "clamp(22px,2.5vw,30px)", lineHeight: "1.1" }}
              >
                Porque cuando un argentino sube al podio, subimos todos.
              </p>
            </div>
          </Reveal>
        </section>

        {/* ── Con el apoyo de ── */}
        <section className="mx-auto max-w-[1080px] px-6 pb-24 pt-8 text-center sm:px-12">
          <Reveal>
            <p
              className="mb-6 font-display font-500 uppercase text-white/45"
              style={{ fontSize: "12px", letterSpacing: ".16em" }}
            >
              Con el apoyo de
            </p>
            <div className="flex flex-wrap items-center justify-center gap-9">
              <Image
                src="/logos/ds-connect.png"
                alt="DS Connect"
                width={130}
                height={46}
                className="h-[46px] w-auto object-contain opacity-85"
              />
            </div>
          </Reveal>
        </section>

      </main>
      <Footer />
    </>
  );
}
