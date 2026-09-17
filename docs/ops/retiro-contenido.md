# Retiro de contenido (fotos y textos ajenos)

Qué hacemos cuando alguien reclama que una foto o un texto de un perfil no es
del atleta. Vigente desde el 17/09/2026. La política pública es
`/legal/propiedad-intelectual`; esto es el procedimiento interno.

## Por qué existe

- El derecho de imagen es del atleta (art. 53 CCyC), pero la **foto es del
  fotógrafo** (ley 11.723). Las fotos "en acción" suelen ser de fotógrafos de
  evento, federación o prensa.
- Granito no solo aloja: recorta y difumina la foto en las imágenes para redes
  (`opengraph-image`, `historia.jpg`), la muestra en la home y al lado de
  empresas patrocinantes. Eso pesa más que un perfil en Instagram.
- La jurisprudencia (Rodríguez c/ Google, CSJN 2014) protege al intermediario
  que **no sabía** y **actúa rápido cuando le avisan**. Todo el valor está en
  la velocidad del retiro, no en discutir.

## Quién recibe el reclamo

Llega a `hola@somosgranito.com` (es el contacto de denuncias en
`src/config/legal.ts`), que hace fanout a los tres socios. **Quien lo lee
primero lo toma** y avisa en el grupo que lo tomó.

## Pasos (objetivo: foto abajo en menos de 48 h)

1. **Bajar la foto sin discutir.** Backoffice → atleta → Editar → "Quitar" (o
   reemplazar por la otra foto). Publicar. Si es un texto, se edita ahí mismo.
   No se evalúa si el reclamo tiene razón: primero se retira, después se ve.
2. **Responder al reclamante** el mismo día, corto: qué se retiró, cuándo, y
   que si quiere que la foto vuelva con crédito o licencia, que lo diga.
3. **Avisar al atleta** por WhatsApp o mail: qué se bajó, por qué, y que suba
   otra foto propia o consiga el permiso del fotógrafo (con crédito).
4. **Registrar** en una fila del sheet de operaciones: fecha del reclamo,
   quién reclamó, atleta, URL de la foto en `athlete-media`, fecha de retiro,
   quién lo hizo. Si hay mail, guardarlo.
5. **Si el reclamante pide plata** o amenaza con acción legal, no se responde
   nada más que "lo estamos revisando" y se pasa a Kahale con el registro.

## Prevención (ya en el producto)

- La postulación de atletas, la de proyectos deportivos y Mi perfil piden
  **quién sacó las fotos** (campo `photo_credit`). Se publica como "Foto: …"
  en el perfil o en la campaña.
- El consentimiento de ambos formularios incluye "las fotos son mías (o
  nuestras) o tengo permiso de quien las sacó".
- Los archivos se renombran al subir (`profiles/<id>-<ts>.<ext>`,
  `applications/<uuid>.<ext>`, `teams/<uuid>.<ext>`): nunca queda un `GettyImages-123.jpg` como
  prueba en contra.

## Base de datos

`supabase/migrations/20260917090000_photo_credit.sql` agregó `photo_credit` a
`athlete_applications`, `athletes` y `team_applications`, y lo expone en la
vista `public_teams`. Aplicada en producción el 17/09/2026.
