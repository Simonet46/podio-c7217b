# Handoff: Rediseño GRANITO (web pública)

## Overview
GRANITO es una plataforma para que cualquier persona apoye con plata, directo, a atletas
argentinos (modelo continuo tipo Patreon: apoyo mensual o aporte único, sin barras de "meta").
La plataforma retiene 7% y el 93% va al atleta. Fundada por atletas olímpicos reales
(Diego Simonet, Pablo Simonet, Pilar Campoy).

Este paquete contiene el **rediseño UX/UI completo de la web pública**: Home, Perfil de atleta,
Equipos, flujo de Aporte + diploma, Postulación de atletas, Empresas, Hinchas (ranking) y
Apoyá a todos, más una exploración de wordmark.

> Nota de marca: el producto se llamaba "PODIO" y se renombró a **GRANITO**. Toda la copy y el
> wordmark de este bundle ya usan GRANITO. Si en el código actual quedó "Podio", reemplazar.

## About the Design Files
Los archivos `*.dc.html` de este bundle son **referencias de diseño hechas en HTML** — prototipos
que muestran el look y el comportamiento buscado, **no código de producción para copiar tal cual**.

La tarea es **recrear estos diseños dentro del codebase existente** (Next.js + Tailwind + Supabase,
sitio estático en GitHub Pages) usando sus patrones y librerías ya establecidas. Ya existe una
implementación parcial de este diseño: **revisarla, comparar contra estas referencias, y completar/
ajustar lo que falte o difiera** (pantallas faltantes, estados, copy, tokens, responsive).

Cada archivo es un Design Component autocontenido: la lógica está en una clase `Component` al final
del archivo (dentro de un `<script>`), y el markup está inline-styled. Tomarlos como **fuente de
verdad visual y de comportamiento**, no como arquitectura de componentes a replicar 1:1.

## Fidelity
**Alta fidelidad (hifi).** Colores, tipografía, espaciados, estados e interacciones son finales.
Recrear la UI pixel-perfect con las librerías/patrones del codebase. Las fotos son placeholders
(`<image-slot>`): en producción van imágenes reales de atletas servidas desde Supabase.

---

## Design Tokens

### Colores
| Token | Hex | Uso |
|---|---|---|
| midnight / ink | `#0A1A2F` | Fondo oscuro principal |
| surface | `#0d2238` | Tarjetas sobre el fondo |
| surface-2 | `#0b1f34` / `#102a44` | Paneles, gradientes de tarjeta |
| footer-bg | `#08131f` | Footer |
| gold | `#C9A227` | Acento principal, CTAs |
| gold-hover | `#dcb433` | Hover de CTA dorado |
| gold-bright | `#E8CC5A` → `#F4C300` | Gradientes "oro brillante" (montos altos) |
| ice | `#F5F8FB` | Fondos claros (sección podio hinchas en Home) |
| paper | `#FFFFFF` | — |
| celeste | `#6CB4E4` | Links / guiño argentino |
| celeste-deep | `#3E8FD0` | Links hover, deporte natación |
| steel | `#5B6B7C` | Texto secundario sobre claro |
| line | `rgba(255,255,255,.07)` | Bordes sobre oscuro |

**Texto sobre oscuro:** `#fff`, `rgba(255,255,255,.72)` (cuerpo), `rgba(255,255,255,.6/.55/.5)` (secundario/terciario).

**Cinta de 5 colores (firma de marca, reemplaza a los aros olímpicos):**
`#0072CE` azul · `#F4C300` amarillo · `#1A1A1A` negro · `#009F3D` verde · `#DF0024` rojo.
Como gradiente: `linear-gradient(90deg,#0072CE 0 20%,#F4C300 20% 40%,#1A1A1A 40% 60%,#009F3D 60% 80%,#DF0024 80% 100%)`.

**Colores por deporte** (badge de cada atleta):
Canotaje `#0072CE` · Escalada `#DF0024` · Natación `#3E8FD0` · Vela `#009F3D` · Judo `#7A4DD0` ·
Atletismo `#F4C300` · Hockey `#009F3D` · Handball `#0072CE` · Otro `#C9A227`.

**Niveles de hincha (medallas):**
Bronce `#C0825A` (hi `#E0A878`) · Plata `#AEB8C2` (hi `#E2E8EF`) · Oro `#C9A227` (hi `#E8CC5A`) ·
Platinum `#9FB9D0` (hi `#DCE8F2`, acabado iridiscente).

### Tipografía
- **Títulos:** `Oswald` (Google Fonts), weights 500/600/700, SIEMPRE MAYÚSCULAS (`text-transform:uppercase`),
  `letter-spacing` negativo en headlines grandes (`-.01em`), `line-height` apretado (.9–.95).
- **Cuerpo / UI:** `Inter` (Google Fonts), weights 400–800.
- Escala headline: hero 66–84px · h2 de sección 44–54px · h3 21–32px · cuerpo 15–19px · chips/eyebrow 11–13px.
- **Eyebrow** (kicker dorado sobre títulos): Oswald 600, 13px, `letter-spacing:.18em`, uppercase, color `#C9A227`.

### Radios
botones/CTA `4–10px` · tarjetas `12–18px` · pills/chips `999px` · inputs `10px`.

### Sombras
- Tarjeta flotante: `0 18px 44px rgba(0,0,0,.4)` a `0 40px 90px rgba(0,0,0,.55)`.
- CTA dorado: `0 14px 34px rgba(201,162,39,.3)`.
- Glow dorado de fondo (hero): `radial-gradient(circle,rgba(201,162,39,.16),transparent 70%)`.

### Espaciado
Secciones marketing: padding vertical 50–90px. Gutter horizontal 48px desktop / 18–24px mobile.
`max-width` de contenido: 1000–1440px centrado. Grids con `gap` 14–24px.

---

## Screens / Views

> Todas comparten: **nav sticky** (wordmark GRANIT+O dorada a la izquierda, links Oswald uppercase,
> CTA dorado "Apoyá" a la derecha, fondo `rgba(10,26,47,.78)` + `backdrop-filter:blur(14px)`),
> y **footer** (wordmark + cinta de 5 colores + disclaimer legal de no-afiliación al COI/COA).

### 1. Home — `Granito Home.dc.html` (+ `Granito Home Mobile.dc.html`)
- Trae **3 variantes** en un solo archivo, alternables con un switcher flotante abajo (solo para
  exploración; en producción se elige UNA — recomendada: **variante 2 "3D Inmersivo"**, ya elegida por el cliente).
- Secciones: hero (con stats animados que reemplazan al viejo contador "LA 2028" — **prohibido todo
  lo olímpico**), grid/discovery de atletas con filtro por deporte y tilt 3D, feed de "Últimos aportes"
  (NO decir "en vivo"), banda "Apoyá a todos", podio 3D de Top hinchas (sobre fondo claro `#F5F8FB`),
  "Cómo funciona" (01/02/03), bloque "Fundada por atletas".
- Mobile: hero apilado, cards en columna, filtros con scroll horizontal, **bottom tab bar** con botón central "Apoyá".

### 2. Perfil de atleta — `Granito Perfil Atleta.dc.html` (+ `... Mobile`)
- Hero: cover de acción apaisada + banner de sponsor + badge "Próxima competencia" + retrato + nombre + badge de deporte + stats.
- Layout 2 columnas: contenido (historia, foto en acción con cita, "Tu aporte financia" con 4 rubros y
  barras de %, muro de hinchas) + **widget de aporte sticky** (estilo Patreon).
- Mobile: el widget de aporte es una **barra fija abajo** que despliega tiers + desglose 93/7.

### 3. Equipos — `Granito Equipos.dc.html`
- Switch entre 3 equipos con apodos reales: **Los Gladiadores** (Handball), **Las Leonas** (Hockey),
  **Las Panteras** (Vóley). Cada uno con su color.
- Hero de equipo (escudo, foto, stats) + 2 CTAs: "Apoyar al equipo" o "Elegir un jugador".
- Banda: "Apoyás al equipo, lo reparten los 16" (partes iguales, 93% a jugadores).
- Plantel de 16 jugadores (número, posición, apoyo individual).

### 4. Flujo de Aporte + Diploma — `Granito Aporte.dc.html`
- 3 pasos: **Monto → Datos → ¡Listo!**.
- **Tipo de aporte:** toggle Mensual / Aporte único (cambia toda la copy y sufijos).
- **Niveles por monto:** $500 Bronce · $1.000 Plata · $2.500 Oro · $5.000+ **Platinum** (acabado
  iridiscente + badge "✦ Diploma a tu casa": al Platinum se le envía el diploma impreso físico).
- Tiers con acabado metálico; el botón "Continuar" **cambia de color según el monto**
  (bronce <$500, plata $500–1k, oro $1k–2.5k, oro brillante >$2.5k).
- Desglose **93% / 7% en vivo** según el monto, con explicación: el 7% sirve para **sumar más atletas a la plataforma**.
- **Método de pago: Mercado Pago (default) y PayPal** — modelo redirección (NO pedir datos de tarjeta en la página).
- Switch **"hincha anónimo"** (no aparece en el muro; el diploma sigue siendo suyo).
- Paso final: pantalla de gracias con confeti + **diploma personalizado** (nombre, atleta, monto,
  Hincha N°, fecha, **bordes/detalles con el color del nivel**, web `granito.com.ar`, SIN firma de fundadores).
  Botón **"Descargar diploma"** genera un **PNG real 1440px** vía canvas (ver método `downloadDiploma()`).

### 5. Postulación de atletas — `Granito Para Atletas.dc.html`
- Hero "Dejá de hacerlo solo" + stats (93% para vos / revisado a mano / $0 postularte).
- 4 pasos con barra de progreso: Datos (nombre, **email**, edad, lugar, deporte con su color;
  si elige **"Otro"** → campo para escribir el deporte; si elige **"Atletismo"** → campo de disciplina),
  Historia (frase, relato, próxima competencia), Fotos (retrato/acción/portada vía image-slots),
  Revisar (preview EN VIVO de su tarjeta de atleta), Enviado.
- Datos de cobro (Mercado Pago/PayPal del atleta) **NO se piden acá**: van después de la aprobación.

### 6. Empresas — `Granito Empresas.dc.html`
- Matchmaker marca↔atleta. **Importante de copy:** NO usar "patrocinio/patrocinar/sponsor" para los
  atletas — el lenguaje es "te ponemos en relación / te acercamos / conectamos". GRANITO solo conecta;
  **no hace reportes, ni manager, ni coordina el acuerdo** (el arreglo lo hacen las dos partes directo).
  Solo se conecta a **atletas específicos**, NO a equipos.
- 3 planes: "Un atleta", "Varios atletas", y **"Empresa patrocinadora"** (destacado = "Más elegido").
  Único lugar donde se usa "patrocinador": es ser **empresa patrocinadora de Granito** (la plataforma),
  con la marca en "Con el apoyo de Granito".
- Paso 3 del cómo-funciona: "Te presentamos al atleta o su manager y quedan en contacto directo."
- Form de contacto (empresa, contacto, email, presupuesto, mensaje) con estado "enviado".

### 7. Hinchas (ranking) — `Granito Hinchas.dc.html`
- Hero "Los que más empujan" + ranking del mes.
- Podio 3D oro/plata/bronce (#1 con corona y brillo animado) + tabla completa (top 10: avatar, ciudad,
  atletas apoyados, racha, puntos; filtros Mes/Histórico/Por deporte) + fila "Tu posición" destacada.
- "Cómo sumás puntos": **los puntos dependen de cuánto apoyás** (a más atletas y mayor aporte mensual,
  más puntos) + racha + invitar hinchas. Sin premios en plata: el premio es el orgullo.

### 8. Apoyá a todos — `Granito Apoya A Todos.dc.html`
- Fondo colectivo. Hero + marquee de atletas + "Cómo se reparte" (3 pasos).
- Widget: **toggle Por mes / Una sola vez** + tiers + monto editable + desglose 93/7 + "tu aporte
  ayuda a ~N atletas".
- **Reparto automático** (NO "a mano"): "Distribuimos el 93% en partes iguales entre **todos los
  atletas registrados** el día del aporte. El 7% es para que la plataforma siga creciendo y más
  atletas se puedan sumar." (No es solo para los que empiezan.)
- Contadores de impacto animados + banda "Con el apoyo de".

### 9. Wordmark — `Granito Wordmark.dc.html`
- Exploración (canvas) de 6 lockups + usos. **Definitivo recomendado:** "A · O dorada" como primario
  (GRANIT en blanco + **O** en oro) + monograma **G** para app icon/favicon. La cinta de 5 colores acompaña.

---

## Interactions & Behavior
- **Scroll reveals:** elementos `[data-reveal]` entran con fade + translateY(26px), `transition .65s
  cubic-bezier(.2,.8,.2,1)`, disparados por IntersectionObserver. `[data-reveal-delay]` en ms para escalonar.
- **Tilt 3D:** elementos `[data-tilt="N"]` rotan con el mouse (`perspective(900–1000px)` rotateX/Y según
  posición del cursor; vuelven con `transition .5s` al salir).
- **Contadores:** elementos `[data-count]` (+ opcional `data-prefix="$"`) animan de 0 al valor al entrar
  en viewport (easing cubic-out, ~1.4s, `toLocaleString('es-AR')`). En el codebase real, usar el valor real del backend.
- **Feed de aportes:** se actualiza solo cada ~3.8s (efecto de movimiento). En producción, datos reales de Supabase.
- **CTA hover:** dorado pasa a `#dcb433` + `translateY(-2px)`. Outline buttons: borde a `#fff`.
- **Diploma:** descarga PNG real generada con `<canvas>` (no captura de pantalla) — ver `downloadDiploma()` en Aporte.

## State Management
- Aporte: `{ step, amount, frequency('monthly'|'once'), payMethod('mp'|'paypal'), anon, name, email }`. Nivel y desglose 93/7 derivan de `amount`.
- Para Atletas: `{ step, nombre, email, edad, lugar, sport, extra, frase, historia, competencia, fecha }`.
- Equipos: `{ team }`. Apoyá a todos: `{ amount, frequency }`. Hinchas: `{ tab }`. Empresas: `{ empresa, contacto, email, presupuesto, mensaje, sent }`.
- En producción, los datos (atletas, aportes, ranking, montos recaudados) vienen de **Supabase**, no hardcodeados.

## Assets
- Fotos de atletas/sponsors/hinchas: `<image-slot>` = placeholders. En producción, imágenes reales desde Supabase/Storage.
- Fuentes: Oswald + Inter desde Google Fonts.
- Iconografía: emojis puntuales (🤝 ❤️ 🔥 📣 👑 ✦) y formas CSS; sin librería de íconos específica. La cinta de 5 colores y el podio son formas CSS, no imágenes.
- `image-slot.js` se incluye solo para que los prototipos abran; NO es parte del producto.

## Files
Todas las pantallas están en este folder como `Granito *.dc.html`. Abrir cada una en el navegador
para ver el diseño y leer la clase `Component` al final del archivo para la lógica/datos de ejemplo.
