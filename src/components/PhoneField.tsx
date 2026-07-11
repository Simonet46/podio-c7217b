"use client";

/**
 * Teléfono con prefijo internacional para los formularios de postulación.
 * Orden pedido: Argentina (default) → España → Francia → resto (alfabético).
 * El valor final se guarda como un solo string: "+54 9 11 5555-5555".
 */

// Prioritarios primero; el resto alfabético.
export const PHONE_PREFIXES: { code: string; label: string }[] = [
  { code: "+54", label: "🇦🇷 Argentina (+54)" },
  { code: "+34", label: "🇪🇸 España (+34)" },
  { code: "+33", label: "🇫🇷 Francia (+33)" },
  { code: "+49", label: "🇩🇪 Alemania (+49)" },
  { code: "+55", label: "🇧🇷 Brasil (+55)" },
  { code: "+56", label: "🇨🇱 Chile (+56)" },
  { code: "+57", label: "🇨🇴 Colombia (+57)" },
  { code: "+1", label: "🇺🇸 EE.UU. / Canadá (+1)" },
  { code: "+39", label: "🇮🇹 Italia (+39)" },
  { code: "+52", label: "🇲🇽 México (+52)" },
  { code: "+595", label: "🇵🇾 Paraguay (+595)" },
  { code: "+51", label: "🇵🇪 Perú (+51)" },
  { code: "+351", label: "🇵🇹 Portugal (+351)" },
  { code: "+44", label: "🇬🇧 Reino Unido (+44)" },
  { code: "+598", label: "🇺🇾 Uruguay (+598)" },
  { code: "+58", label: "🇻🇪 Venezuela (+58)" },
  { code: "+000", label: "🌍 Otro país" },
];

export function PhoneField({
  prefix,
  number,
  onPrefix,
  onNumber,
  inputClassName,
}: {
  prefix: string;
  number: string;
  onPrefix: (v: string) => void;
  onNumber: (v: string) => void;
  /** Clases del input de número (para heredar el estilo de cada form). */
  inputClassName: string;
}) {
  return (
    <div className="flex gap-2">
      <select
        value={prefix}
        onChange={(e) => onPrefix(e.target.value)}
        aria-label="Prefijo del país"
        className={`${inputClassName} w-auto shrink-0 cursor-pointer pr-2`}
        style={{ maxWidth: 150 }}
      >
        {PHONE_PREFIXES.map((p) => (
          <option key={p.code} value={p.code} style={{ background: "#0d2238" }}>
            {p.label}
          </option>
        ))}
      </select>
      <input
        type="tel"
        inputMode="tel"
        value={number}
        onChange={(e) => onNumber(e.target.value.replace(/[^\d\s\-()]/g, ""))}
        placeholder="9 11 5555-5555"
        className={inputClassName}
      />
    </div>
  );
}

/** Une prefijo + número en el string que se guarda ("+54 9 11 5555-5555").
 *  Si eligió "Otro país" (+000), guarda solo el número tal cual lo escribió. */
export function buildPhone(prefix: string, number: string): string {
  const n = number.trim();
  if (!n) return "";
  return prefix === "+000" ? n : `${prefix} ${n}`;
}
