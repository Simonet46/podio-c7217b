# Plan de implementación legal + UX — GRANITO

**Fuente:** análisis preliminar de Kahale (`Kahale_Granito-WP_13072026.docx`, 13/07/2026).
**Última actualización:** 14/07/2026.

## Decisiones tomadas (14/07/2026, Diego)

1. **Sociedad:** todavía no constituida → se implementa todo con placeholders centralizados en un único archivo de configuración. Los datos societarios son el último bloqueante antes de lanzar.
2. **Textos legales:** nosotros preparamos borradores completos → Kahale revisa y corrige.
3. **Menores:** al lanzamiento solo atletas mayores de 18. Se bloquea la postulación de menores con mensaje claro. Flujo de tutor completo queda para fase 2.
4. **Donantes:** sin registro obligatorio. Aceptación de términos + declaración de donación en el paso previo al checkout, con evidencia técnica. **Pendiente validar con Kahale** (su documento pide registro).
5. **Arrepentimiento (aclaración 14/07):** el derecho de arrepentimiento es **solo para el atleta**, no para el donante. Se implementa como la posibilidad de que el atleta **elimine su cuenta y sus datos** (baja + supresión, Ley 25.326). No hay botón de arrepentimiento de donaciones. → Reemplaza lo que decían las Fases 4.4 y 5.1/5.2 sobre arrepentimiento del donante.

## Estado de implementación

- **Fase 1 — COMPLETA en código (14/07/2026).** Falta aplicar la migración y desplegar la edge function al proyecto Supabase de GRANITO (`ruugpxfgpbtajrxbabvg`) — no se pudo desde la sesión (el MCP apuntaba a otro proyecto y el CLI no estaba linkeado). Comandos abajo.
  - `src/config/legal.ts` — datos de la sociedad (placeholders), contactos y registro de versiones de documentos.
  - `supabase/migrations/20260714_legal_consent.sql` — tablas `legal_documents` + `legal_acceptances` con RLS.
  - `supabase/functions/record-acceptance/index.ts` — registra evidencia (IP, user-agent, versión).
  - `src/lib/legal.ts` — helper cliente `recordAcceptance()` (best-effort).
  - `/terminos` y `/privacidad` leen del config y muestran "Versión X — vigente desde …"; banner "Borrador" atado a `LEGAL_DATA_COMPLETE`.
  - Formularios de atleta y equipo: `TERMS_VERSION` centralizado + llamada a `recordAcceptance()` al postularse.

### Para aplicar la Fase 1 (Diego)

```bash
cd "/Users/diegosimonet1989simonet/ayudin proyecto (somos granito CLAUDE)"
# 1) Migración (una vez linkeado el proyecto):
supabase link --project-ref ruugpxfgpbtajrxbabvg   # pide token + password de la DB
supabase db push
# 2) Edge function (deploy con --no-verify-jwt: la llama el sitio público):
supabase functions deploy record-acceptance --no-verify-jwt
```

Alternativamente, aplicar la migración pegando el SQL en el editor de Supabase (como se hicieron las anteriores, "vía Management API").

- **Fase 1 — APLICADA en producción (14/07/2026).** Migración aplicada al proyecto `ruugpxfgpbtajrxbabvg` (Ayudin) vía Management API; edge function `record-acceptance` desplegada (verify_jwt=false) y probada de punta a punta (registra evidencia con IP + user-agent; RLS cerrado al público, verificado con advisors).

- **Fase 2 — COMPLETA en código + base (14/07/2026).** 9 documentos legales redactados como borradores originales (para revisión de Kahale), todos versión 2026-07-14, banner "Borrador" activo hasta que la abogada apruebe y existan los datos de la sociedad.
  - Layout compartido: `src/components/legal/LegalLayout.tsx`.
  - Reescritos y expandidos: `/terminos` (17 secc.) y `/privacidad` (13 secc.).
  - Nuevos: `/legal/contrato-atleta`, `/legal/donantes`, `/verificacion`, `/legal/campanas`, `/legal/reembolsos` (incluye baja de cuenta = arrepentimiento del atleta), `/legal/propiedad-intelectual`, `/legal/cookies`, e índice `/legal`.
  - Footer: nueva columna "Legal" con todos los documentos + canal de reclamos; identificación del operador (razón social/CUIT) aparece sola cuando `LEGAL_DATA_COMPLETE = true`.
  - `src/config/legal.ts` con rutas y versiones; tabla `legal_documents` actualizada (9 vigentes 2026-07-14, viejas marcadas no vigentes).
  - Build y typecheck OK; verificado en navegador (render + links + sin errores de consola).
  - **Pendiente:** que Kahale revise/corrija los textos; luego cambiar `status` a "vigente" por documento y, cuando exista la sociedad, `LEGAL_DATA_COMPLETE = true`.

- **Fase 3 — COMPLETA (14/07/2026).** UX de consentimiento del atleta en `AthleteApplicationForm`:
  - Bloqueo de menores: edad obligatoria; si <18 aparece mensaje y el paso 1 no avanza (se quitó el flujo de tutor).
  - Campos nuevos de perfil: nivel deportivo (aficionado/federado/profesional/alto-rendimiento, obligatorio) y club (opcional).
  - Declaraciones en el paso 2: beca ENARD/apoyo público y patrocinios vigentes; nota de titularidad de la cuenta de cobro.
  - 4 checkboxes separados en revisión: (a) T&C + Contrato del Atleta, (b) Privacidad, (c) imagen/PI, (d) declaración de veracidad + compatibilidad federativa + titularidad.
  - Migración `20260714_athlete_profile_legal.sql` aplicada (columnas sport_level, club, has_public_grant, has_sponsorship, federative_compat_declared, mp_ownership_declared).
  - `recordAcceptance` registra 4 docs (terminos-generales, contrato-beneficiario, privacidad, propiedad-intelectual) + meta.

- **Fase 4 — COMPLETA (14/07/2026).** UX del donante en `DonationWidget` y `TeamPledgeWidget`:
  - Desglose 93/7 visible (ya existía) + declaración "es una donación, no una inversión, fondos directos".
  - Línea "Al aportar aceptás los Términos del Donante" (link).
  - `recordAcceptance` (actorType donante, context donacion) best-effort antes del checkout, con monto/campaña como meta.
  - "Aunque no se llegue al objetivo, el equipo recibe todo" ya estaba en el widget de equipo.
  - Pendiente menor: enriquecer /gracias como comprobante formal (Ley 24.240) — el email de comprobante ya llega por el flujo de MP.

**Verificado en navegador (14/07):** bloqueo de menores (edad 15 → mensaje + Continuar deshabilitado), chips de nivel, widget de donación con declaración + link a Términos del Donante; build + typecheck OK; sin errores de consola.

**Nada commiteado/pusheado aún** (el push dispara deploy a producción — esperar OK de Diego). Migraciones y edge function YA están en el proyecto Supabase de producción.

---

## Resumen del documento de Kahale (mapeado a la plataforma)

| # | Sección | Qué exige | Impacto en el sitio |
|---|---------|-----------|---------------------|
| 1 | Sujetos | Sociedad AR con directorio de mayoría residente; perfil del beneficiario definido (aficionado/federado/profesional/alto rendimiento); autorizaciones para menores | Campos nuevos en alta de atleta; bloqueo de menores; datos societarios en footer/términos |
| 2 | Servicios | Plataforma = intermediaria tecnológica, NO receptora de donaciones; fee 7%; declaración de compatibilidad federativa del atleta; fuera de CNV/BCRA si no intermedia fondos | El modelo actual (MP marketplace split, fondos van directo a la cuenta del atleta) ya es el "modelo de menor riesgo" que recomiendan — mantenerlo |
| 3 | Contratos | Contrato plataforma-beneficiario, términos del donante, contrato con PSP | Borradores + aceptación con evidencia en cada flujo |
| 4 | Consumidor (Ley 24.240) | Info clara, identificación del operador, comisiones transparentes, canal de reclamos, prohibición de cláusulas abusivas, documentación electrónica, **botón de arrepentimiento** | Footer completo, desglose de comisión visible antes de pagar, página de arrepentimiento, email de comprobante |
| 5 | Publicidad y fraude (Dec. 274/2019) | Moderación razonable; controles mínimos (identidad, CBU/CVU, denuncias, suspensión preventiva, conservación de prueba); **"verificado" debe explicar qué se verificó** | Política de verificación pública + tooltip en el sello; canal de denuncias; estados de campaña en backoffice |
| 6 | Transferencias | Integrar PSP autorizado (ya: Mercado Pago); revisar donaciones desde el exterior | Pregunta abierta a Kahale sobre tarjetas extranjeras |
| 7 | Datos personales (Ley 25.326, AAIP) | Política de privacidad real, consentimiento, cookies, derechos de acceso/rectificación/supresión, registro de bases ante AAIP, transferencias internacionales de datos (Supabase/Resend/Cloudflare están en EE.UU.), protocolo de incidentes | Política de privacidad + cookies + banner; mecanismo de ejercicio de derechos; trámite AAIP (externo) |
| 8 | Tributario | IVA/Ganancias/IIBB sobre el fee 7%; tratamiento fiscal del beneficiario según residencia | Externo (contador). El sitio no debe prometer nada fiscal al donante |
| 9 | Propiedad intelectual | Atleta declara tener derechos sobre su contenido y da licencia limitada a la plataforma; procedimiento de denuncia y retiro | Cláusula de licencia en contrato del atleta; página/canal de denuncias |
| 10 | Firma electrónica y evidencia | "Acepto" vale, pero hay que conservar: versión de términos, fecha/hora, usuario, IP, dispositivo, campaña, consentimientos | Tablas `legal_documents` + `legal_acceptances` en Supabase |
| 11 | Documentos mínimos | ~20 documentos (ver Fase 2) | Borradores nuestros → revisión Kahale |

**Nota de copy:** el documento de Kahale usa "micromecenazgo/crowdfunding" con naturalidad y no lo objeta, pero seguimos sin usar "crowdfunding" en copy público hasta el OK explícito (pregunta abierta #5). La regla de evitar "federación/comité/confederación" aplica al copy de marketing; en los textos legales el término "federación" es necesario y correcto.

---

## Fase 0 — Trámites externos (fundadores, no código)

Checklist que no depende del sitio pero bloquea el lanzamiento:

- [ ] Constituir la sociedad (directorio con mayoría de residentes en Argentina). Kahale lo marca **crítico**.
- [ ] Asesoría tributaria para los socios (residentes en Francia y España — convenios de doble imposición).
- [ ] Registro de bases de datos ante la AAIP.
- [ ] Registro de la marca GRANITO en el INPI.
- [ ] QR de Data Fiscal (ARCA) — cuando exista CUIT.
- [ ] Revisar términos del contrato marketplace con Mercado Pago (es nuestro "contrato con PSP").
- [ ] Alta impositiva: IVA, Ganancias, IIBB sobre la comisión del 7%.

## Fase 1 — Infraestructura de consentimiento (código, se puede hacer YA)

1. **`src/config/legal.ts`** — único lugar con los datos societarios (razón social, CUIT, domicilio, datos IGJ, email de reclamos). Placeholders claros tipo `[PENDIENTE: razón social]`. Footer, /terminos y /privacidad leen de acá. Un flag `legalDataComplete` permite mostrar el banner "Borrador" mientras falten datos.
2. **Supabase — tabla `legal_documents`:** `doc_type` (terminos-generales, contrato-beneficiario, terminos-donante, privacidad, cookies, verificacion, reembolsos, …), `version`, `effective_date`, `content_hash`. Cada publicación de un texto nuevo = fila nueva.
3. **Supabase — tabla `legal_acceptances`:** `doc_type`, `doc_version`, `actor_type` (atleta | donante | equipo), `email`, `user_id` (nullable), `context` (postulacion | alta | donacion | actualizacion), `ip`, `user_agent`, `related_id` (application/payment external_reference), `created_at`. Insert solo vía edge function (RLS cerrado).
4. **Edge function `record-acceptance`** (o extender `notify-application` y `mp-create-preference`) para registrar la aceptación con IP y user-agent del request.
5. **Versionado visible:** /terminos y /privacidad muestran "Versión X — vigente desde DD/MM/AAAA".

## Fase 2 — Borradores de textos legales (para revisión de Kahale)

Redactar en español, alineados sección por sección al documento de Kahale:

1. **Términos y condiciones generales** del sitio (usuarios en general).
2. **Contrato del beneficiario (atleta)** — incluye: elegibilidad, alcance de la verificación, contenido de campaña, destino declarado de fondos, comisión 7%, cuenta MP a nombre exclusivo + obligación de informar cambios, condiciones de desembolso, tratamiento ante fraude/lesión/incapacidad/fallecimiento, rendición de cuentas, responsabilidad por información falsa, indemnidad, **declaración de compatibilidad federativa**, declaración sobre beca ENARD/apoyos públicos, licencia de PI limitada (alojar, reproducir, adaptar, distribuir, promocionar), autorización de imagen.
3. **Términos del donante** — donación pura y gratuita sin contraprestación (reconocimientos simbólicos como el diploma están OK), no es inversión, comisión 7% transparente, qué pasa si la campaña no llega a la meta, política de reembolsos, cómo reclamar.
4. **Política de privacidad** (Ley 25.326) — datos tratados, derechos, transferencias internacionales (Supabase, Resend, Cloudflare, Mercado Pago), conservación y eliminación, contacto AAIP.
5. **Política de cookies** + banner de consentimiento.
6. **Política de verificación** — QUÉ verificamos (identidad, cuenta MP a su nombre, pertenencia deportiva declarada) y QUÉ NO verificamos (uso efectivo de los fondos, resultados deportivos). Crítico por el uso del sello "verificado" y los sellos de confianza del hero.
7. **Política de campañas** — campañas prohibidas (falsas, ilegales, discriminatorias, incompatibles con obligaciones del atleta), antifraude, antidopaje/integridad, apuestas, protocolo de suspensión preventiva y cierre.
8. **Política de reembolsos y arrepentimiento.**
9. **Política de propiedad intelectual** + procedimiento de denuncia y retiro de contenido.

## Fase 3 — UX del atleta (alta y postulación)

En `AthleteApplicationForm` y el onboarding:

1. **Fecha de nacimiento obligatoria** en lugar del checkbox "soy menor": si <18, bloquear con mensaje claro ("por ahora solo mayores de 18") y guardar el interés para contactarlos cuando exista el flujo de tutor.
2. **Checkboxes separados** (no un "acepto todo"): (a) contrato del beneficiario + T&C, (b) política de privacidad, (c) autorización de uso de imagen, (d) declaración de veracidad y compatibilidad federativa ("declaro que mi participación y mi campaña no violan los estatutos de mi federación, club ni contratos vigentes de patrocinio, representación o beca").
3. **Campos nuevos de perfil deportivo:** nivel (aficionado / federado / profesional / alto rendimiento), club/entidad, ¿tiene beca ENARD u otro apoyo público? (si sí → declaración de haber verificado compatibilidad), ¿tiene contratos de patrocinio vigentes?
4. **Cuenta Mercado Pago:** al conectar OAuth, declaración de que la cuenta es de su titularidad exclusiva y compromiso de informar cambios antes de efectuarlos.
5. Registrar cada aceptación en `legal_acceptances` con versión del documento.

## Fase 4 — UX del donante

En `DonationWidget` y `TeamPledgeWidget`, antes de redirigir al checkout:

1. **Desglose exacto y visible:** monto, comisión de la plataforma (7%), costo de Mercado Pago si aplica, y cuánto recibe el atleta — con números reales, sin redondear.
2. **Declaración visible:** "Tu aporte es una donación sin contraprestación económica. No es una inversión ni genera derechos sobre resultados."
3. **Aceptación:** aviso "Al continuar aceptás los [Términos del donante]" o checkbox (según defina Kahale) — se registra evidencia (IP, user-agent, versión, monto, campaña) asociada al `external_reference` del pago.
4. **Qué pasa si la campaña no llega a la meta:** aclarar en el flujo (el atleta recibe igual los fondos — modelo actual de split inmediato) y en los términos.
5. **/gracias:** comprobante documental de la operación (Ley 24.240) — resumen del aporte + email de confirmación vía Resend con los datos de la operación.

## Fase 5 — Páginas legales, footer y transparencia

1. **Footer completo:** razón social, CUIT, domicilio (identificación del operador), links a todas las políticas, **botón de arrepentimiento** (link directo y visible, exigido en home), canal de reclamos, QR Data Fiscal.
2. **Página /arrepentimiento** con formulario (nombre, email, operación, motivo) → email a los fundadores + registro.
3. **Página /verificacion** pública: qué significa el sello "verificado" exactamente.
4. **Página /denuncias**: formulario para reportar campañas falsas, uso no autorizado de imagen, suplantación, contenido ilícito → registro + notificación.
5. **Sello "verificado"** en perfiles de atletas/equipos → tooltip + link a /verificacion.
6. **Auditoría de copy existente:** revisar hero, sellos de confianza ("revisado a mano", "identidad verificada"), /transparencia y FAQ para que ninguna afirmación exceda lo que la política de verificación dice que hacemos. Prohibido prometer impacto o garantizar uso de fondos.

## Fase 6 — Backoffice y operaciones

1. **Estados de campaña:** activa / suspendida preventivamente / cerrada, con motivo y log de quién y cuándo (conservación de prueba).
2. **Registro de denuncias** y acciones tomadas.
3. **Checklist de revisión reforzada** para campañas de alto monto (documentado, aunque el proceso sea manual).
4. **Matriz de conservación de documentos** (doc interno: qué se guarda y por cuánto tiempo).
5. **Protocolo de incidentes de seguridad** (doc interno: qué hacer ante una filtración).

---

## Preguntas abiertas para Kahale

1. **Donante sin registro:** ¿alcanza con aceptación en el flujo de pago + evidencia técnica (IP, versión, timestamp, email del pagador vía MP), o exigen cuenta de donante?
2. **Botón de arrepentimiento:** ¿aplica a donaciones ya ejecutadas y transferidas al atleta (split inmediato)? ¿Cuál debe ser el alcance real del reembolso?
3. **Equipos y proyectos deportivos:** el documento habla de deportistas individuales. ¿Mismo marco para selecciones/equipos? ¿Quién firma el contrato de beneficiario por un equipo?
4. **Empresas impulsoras:** el convenio con empresas que aparecen en la web ¿es patrocinio (acto oneroso) y requiere el "contrato específico de patrocinio empresarial" que listan?
5. **Terminología pública:** ¿podemos usar "crowdfunding" / "micromecenazgo" en el copy del sitio?
6. **Donaciones desde el exterior:** tarjetas extranjeras vía Mercado Pago — ¿restricciones cambiarias o de reporting?
7. **Datos sensibles:** campañas con causas médicas (lesiones) → ¿qué consentimiento específico necesitamos del atleta?
8. **Registro AAIP:** ¿lo tramitan ellos? ¿Cuándo?

## Orden de ejecución propuesto

| Prioridad | Qué | Depende de |
|---|---|---|
| 1 | Fase 1 (infraestructura de consentimiento) | Nada — se puede hacer ya |
| 2 | Fase 2 (borradores de textos) | Nada — se puede hacer ya |
| 3 | Fases 3 y 4 (UX atleta y donante) | Fase 1 |
| 4 | Fase 5 (páginas + footer) | Textos aprobados por Kahale; datos societarios para el footer |
| 5 | Fase 6 (backoffice/ops) | Fase 1 |
| — | Fase 0 (trámites) | En paralelo, fundadores + Kahale |

**Bloqueantes reales para "meter atletas":** textos aprobados por Kahale + registro de aceptaciones funcionando (Fases 1-3). Los datos societarios y trámites (Fase 0) son bloqueantes para el lanzamiento público formal, no para construir todo lo demás.
