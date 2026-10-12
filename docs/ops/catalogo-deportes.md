# Catálogo de deportes — estudio y decisión (octubre 2026)

**Problema.** El formulario de postulación de atletas ofrecía 14 deportes + "Otro".
Un atleta de esgrima, boxeo o gimnasia tenía que caer en "Otro" y escribir a mano,
y en el backoffice esa postulación llegaba sin color ni clave de deporte.

**Dónde vive.** Todo el catálogo está en un solo archivo, `src/config/sports.ts`.
La base de datos guarda `sport` como texto libre (sin `check`), así que sumar
deportes no requiere migración. El formulario de atletas guarda la etiqueta
("Esgrima"); el backoffice la mapea a la clave (`esgrima`) al aprobar.

## Criterios para entrar al catálogo

1. **Está en el programa de Los Ángeles 2028** (el foco de la plataforma).
2. **Argentina tiene atletas con chances reales de clasificar**: presencia en
   París 2024, Tokio 2020 o en el ciclo panamericano (Santiago 2023 / Lima 2027).
3. **Hay una federación argentina activa** que el equipo de Granito puede usar para
   verificar al atleta.

Si cumple 2 de 3, entra. Si no, queda en "Otro" (que sigue existiendo).

## Deportes que se agregan

| Deporte | Por qué entra |
|---|---|
| Esgrima | Argentina llevó esgrimistas a todos los Juegos desde Beijing 2008 (sable y espada). Federación activa. |
| Taekwondo | Oro olímpico 2012 (Crismanich). Presencia constante en Panamericanos. |
| Boxeo | Tradición olímpica argentina; confirmado en LA 2028. Boxeadores en París 2024. |
| Ciclismo | Ruta, pista y mountain bike. Ya aparecía como "otros" en el código del muro. BMX sigue aparte porque ya tenía campañas. |
| Triatlón | Clasificados a Tokio 2020; ciclo panamericano fuerte. |
| Gimnasia | Artística, rítmica y trampolín. Argentina clasificó gimnastas a Tokio y París. |
| Tiro deportivo | Una de las disciplinas con más argentinos clasificados en los últimos ciclos. |
| Tiro con arco | Federación activa, clasificaciones panamericanas. |
| Equitación | Salto y adiestramiento: Argentina tiene jinetes en el circuito olímpico. |
| Golf | Argentinos en Río, Tokio y París. |
| Lucha | Luchadoras argentinas en Tokio 2020. |
| Pesas | Levantamiento de pesas, confirmado en LA 2028. |
| Tenis de mesa | Equipo argentino en París 2024. |
| Bádminton | Federación activa; circuito panamericano. |
| Surf | Surfistas argentinos en Tokio 2020; LA 2028 compite en Trestles (California). |
| Skateboarding | Confirmado en LA 2028; escena argentina en crecimiento. |
| Pentatlón moderno | Presencia argentina en Río 2016; nuevo formato con carrera de obstáculos en LA 2028. |
| Squash | Nuevo en LA 2028; Argentina tiene selección con historia panamericana. |
| Rugby (equipo) | Los Pumas 7s, bronce en Tokio 2020. |
| Beach vóley (equipo) | Pareja argentina en París 2024. |
| Sóftbol / Béisbol (equipo) | Argentina es campeón mundial de sóftbol masculino 2019; vuelve a LA 2028. |

Total: 14 existentes + 22 nuevos = **36 deportes + "Otro"** (incluye Paralímpico, ver abajo).

## Deportes que quedan afuera (por ahora)

- **Lacrosse, flag football, críquet**: nuevos en LA 2028 pero sin estructura en
  Argentina. Quedan en "Otro".
- **Karate, breaking**: no están en el programa de LA 2028.
- **Waterpolo, clavados, natación artística**: sin presencia argentina reciente.
  Clavados y natación artística se cubren como "prueba" dentro de Natación.
- **Deporte adaptado / paralímpico** (agregado el 12/10/2026 a pedido de Diego):
  no es un deporte sino una categoría transversal, así que entra como el chip
  "Paralímpico" y el atleta escribe su disciplina (atletismo adaptado, fútbol para
  ciegos, etc.) en el campo "tu prueba".

## Decisiones de diseño

- **Orden alfabético** en el formulario de atletas, con "Otro" siempre al final.
  Con 35 chips el orden "por importancia" ya no se lee; alfabético es lo único que
  deja encontrar el propio deporte rápido.
- **Formulario de equipos**: primero los deportes de equipo (alfabético), después el
  resto, después "Otro". Igual que antes, solo que hay más de equipo.
- **"Tu prueba"**: el campo de disciplina que solo aparecía para Atletismo ahora
  aparece en todo deporte donde la prueba cambia la historia (natación, ciclismo,
  gimnasia, esgrima, tiro, vela, canotaje, etc.). Cada uno tiene su placeholder.
  Se guarda en la misma columna `discipline`.
- **El muro de atletas no cambia**: los chips de filtro siguen siendo los seis
  destacados + "Otros". Un deporte nuevo aparece en el muro recién cuando tiene
  campañas.
- **Colores**: cada deporte nuevo tiene su color de panel, en la misma paleta
  apagada que los existentes, cuidando que dos deportes cercanos en la lista no
  compartan tono.
