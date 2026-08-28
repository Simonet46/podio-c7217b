# Email de somosgranito.com — Cloudflare Email Routing

Configuración vigente al 27/08/2026. Se administra en el panel de Cloudflare
(dash.cloudflare.com → somosgranito.com → Email → Email Routing); nada de esto
vive en el código.

## Reglas

| Dirección | Acción | Destino |
|---|---|---|
| `hola@somosgranito.com` | Send to a Worker | `hola-fanout` (reenvía a los 3 socios) |
| `pablo@somosgranito.com` | Send to an email | pablito.simon@hotmail.com |
| `pilu@somosgranito.com` | Send to an email | pilu_campoy@hotmail.com |
| Catch-all | **Drop** | — (un typo en la dirección se descarta sin aviso) |

No existe `diego@somosgranito.com`; Diego recibe por el fanout de `hola@`.

## Worker `hola-fanout`

Email Worker desplegado desde el panel (Email Routing → Destination Workers).
Cloudflare solo permite un destino por regla; el fanout a varias casillas se
hace con este worker. Código desplegado:

```js
export default {
  async email(message, env, ctx) {
    const destinos = [
      "diegosimonet1989@gmail.com",
      "pablito.simon@hotmail.com",
      "pilu_campoy@hotmail.com",
    ];
    for (const d of destinos) {
      await message.forward(d);
    }
  },
};
```

`message.forward()` solo acepta direcciones verificadas en **Destination
Addresses**. Para sumar o cambiar un socio: verificar primero la casilla nueva
ahí, después editar la lista `destinos` en el worker (Workers & Pages →
hola-fanout → Edit code) y hacer deploy.

## Diagnóstico

- **Activity Log** (Email Routing → Activity Log) muestra cada mail recibido y
  a quién se entregó — primer lugar donde mirar si "no llegó".
- La reconciliación diaria de MP (`mp-reconcile`) manda sus avisos a `hola@`,
  o sea que hoy llegan a los tres socios.
