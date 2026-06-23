import type { Metadata } from "next";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { FounderAvatar } from "@/components/FounderAvatar";
import { Ribbon } from "@/components/Ribbon";
import { Reveal } from "@/components/Reveal";
import { SITE } from "@/config/site";
import { SPORTS } from "@/config/sports";

export const metadata: Metadata = {
  title: `Quiénes somos — ${SITE.brand}`,
  description:
    "Tres atletas argentinos de élite detrás de la plataforma: Diego Simonet, Pablo Simonet y Pilar Campoy.",
};

interface Founder {
  name: string;
  nickname?: string;
  role: string;
  color: string;
  /** Foto en /public/founders/. Si el archivo no existe, se muestra el monograma. */
  photo?: string;
  bio: string[];
}

const FOUNDERS: Founder[] = [
  {
    name: "Diego Simonet",
    nickname: "El Chino",
    role: "Handball · Los Gladiadores",
    color: SPORTS.handball.color,
    photo: "/founders/diego-simonet.webp",
    bio: [
      "Referente histórico del handball argentino, lo llamaron “el Messi del handball”. Pasó 13 temporadas en el Montpellier de Francia, donde levantó la Champions League de Europa en 2018 además de copas y ligas.",
      "Con la Selección jugó seis Mundiales, tres Juegos Olímpicos y ganó tres oros panamericanos con Los Gladiadores. Se retiró en 2026 tras una carrera que marcó a una generación.",
    ],
  },
  {
    name: "Pablo Simonet",
    role: "Handball · Los Gladiadores",
    color: SPORTS.handball.color,
    photo: "/founders/pablo-simonet.webp",
    bio: [
      "El menor de los hermanos Simonet, también Gladiador. Se formó jugando junto a sus hermanos en la Selección y desarrolló su carrera profesional en España.",
      "Defendió a la Argentina en los Juegos Olímpicos de París 2024. Conoce de primera mano lo que cuesta sostener una carrera de alto rendimiento lejos de casa.",
    ],
  },
  {
    name: "Pilar Campoy",
    nickname: "Pilu",
    role: "Hockey · Las Leonas",
    color: SPORTS.hockey.color,
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
      <main>
        {/* Hero */}
        <section className="bg-ink text-white">
          <div className="mx-auto max-w-container px-4 py-16 sm:px-6 sm:py-20">
            <p className="eyebrow text-gold">Quiénes somos</p>
            <h1 className="mt-3 max-w-3xl font-display text-4xl font-700 uppercase leading-[1.04] tracking-tight sm:text-6xl">
              Dejamos la vida por esta camiseta. Ahora la apoyamos.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-white/75">
              Somos tres atletas que dedicamos la vida entera a un sueño: ponernos la
              celeste y blanca y representar a la Argentina en los Juegos Olímpicos. Lo
              logramos. Y en el camino conocimos, de primera mano, lo poco que se apoya
              a quienes dejan todo por el país. {SITE.brand} es nuestra forma de
              devolver algo de eso.
            </p>
          </div>
        </section>

        <Ribbon />

        {/* Fundadores */}
        <section className="bg-ice">
          <div className="mx-auto max-w-container px-4 py-16 sm:px-6">
            <div className="grid gap-8 md:grid-cols-3">
              {FOUNDERS.map((f, i) => (
                <Reveal key={f.name} delay={i * 110}>
                  <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-paper shadow-sm">
                    <div className="aspect-[4/3] w-full overflow-hidden bg-ink">
                      <FounderAvatar name={f.name} photo={f.photo} color={f.color} />
                    </div>
                    <div className="flex flex-1 flex-col p-6">
                      <h2 className="font-display text-2xl font-700 uppercase tracking-tight text-ink">
                        {f.name}
                      </h2>
                      <p className="mt-1 font-display text-sm font-600 uppercase tracking-wide text-celeste-deep">
                        {f.nickname ? `“${f.nickname}” · ` : ""}
                        {f.role}
                      </p>
                      <div className="mt-3 space-y-3 text-sm leading-relaxed text-steel">
                        {f.bio.map((p, j) => (
                          <p key={j}>{p}</p>
                        ))}
                      </div>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* Misión */}
        <section className="bg-paper">
          <div className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
            <Reveal>
              <p className="eyebrow text-celeste-deep">Por qué lo hacemos</p>
              <h2 className="mt-3 font-display text-3xl font-700 uppercase tracking-tight text-ink sm:text-4xl">
                Sabemos lo que cuesta. Lo vivimos.
              </h2>
              <div className="mt-5 space-y-4 text-lg leading-relaxed text-steel">
                <p>
                  En la Argentina el talento sobra. Lo que falta es apoyo. Vimos a
                  compañeros enormes entrenar de madrugada, pagarse los pasajes, dejar
                  el estudio o el laburo y, muchas veces, tener que elegir entre su
                  sueño y llegar a fin de mes.
                </p>
                <p>
                  Nosotros llegamos a los Juegos Olímpicos a fuerza de sacrificio — y
                  de gente que, en silencio, nos apoyó. {SITE.brand} nace para que la
                  próxima camada no esté sola: para convertir la admiración en apoyo
                  concreto, directo y transparente.
                </p>
                <p className="font-display text-xl font-600 uppercase tracking-wide text-ink">
                  Porque cuando un argentino sube al podio, subimos todos.
                </p>
              </div>
            </Reveal>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
