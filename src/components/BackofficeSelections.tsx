"use client";

import { useCallback, useEffect, useState, type CSSProperties } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { SPORT_LIST } from "@/config/sports";

/** Fila de la tabla `teams` (selecciones cargadas desde el admin). */
export interface DbTeam {
  id: string;
  slug: string;
  name: string;
  sport: string;
  discipline: string;
  bio: string;
  color: string | null;
  national: boolean;
  verified: boolean;
  photo_url: string | null;
}

const VACIO: Omit<DbTeam, "id"> = {
  slug: "", name: "", sport: SPORT_LIST[0]?.key ?? "handball", discipline: "",
  bio: "", color: "#C9A227", national: true, verified: true, photo_url: null,
};

function slugify(s: string): string {
  return s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

/**
 * Alta y edición de selecciones desde el backoffice (tabla `teams`).
 * Las históricas del seed siguen viviendo en el código; si se crea una con el
 * mismo slug, la de la base la pisa (así se pueden "adoptar" y editar).
 * Los cambios salen al sitio con "Publicar ahora", como todo lo demás.
 */
export function TeamsManager({
  supa,
  onTeams,
  onToast,
}: {
  supa: SupabaseClient | null;
  /** Notifica la lista para que el roster de abajo incluya las nuevas. */
  onTeams: (teams: DbTeam[]) => void;
  onToast: (msg: string) => void;
}) {
  const [teams, setTeams] = useState<DbTeam[]>([]);
  const [editing, setEditing] = useState<Partial<DbTeam> | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const load = useCallback(async () => {
    if (!supa) return;
    const { data } = await supa.from("teams").select("*").order("created_at");
    const rows = (data as DbTeam[]) ?? [];
    setTeams(rows);
    onTeams(rows);
  }, [supa, onTeams]);

  useEffect(() => { void load(); }, [load]);

  async function save() {
    if (!supa || !editing) return;
    const name = editing.name?.trim();
    if (!name) { setErr("Falta el nombre."); return; }
    setBusy(true);
    setErr("");
    const row = {
      ...VACIO,
      ...editing,
      name,
      slug: editing.slug?.trim() || slugify(name),
      discipline: editing.discipline?.trim() ?? "",
      bio: editing.bio?.trim() ?? "",
    };
    const { error } = editing.id
      ? await supa.from("teams").update(row).eq("id", editing.id)
      : await supa.from("teams").insert(row);
    setBusy(false);
    if (error) { setErr(error.message); return; }
    setEditing(null);
    onToast(`✓ Selección guardada. Tocá "Publicar ahora" para que salga en el sitio.`);
    void load();
  }

  async function uploadPhoto(file: File) {
    if (!supa || !editing) return;
    if (file.size > 5 * 1024 * 1024) { setErr("La foto no puede pesar más de 5 MB."); return; }
    setErr("");
    const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
    const path = `teams/${slugify(editing.name ?? "sel")}-${Date.now()}.${ext}`;
    const { error } = await supa.storage.from("athlete-media").upload(path, file, { contentType: file.type });
    if (error) { setErr(error.message); return; }
    const url = supa.storage.from("athlete-media").getPublicUrl(path).data.publicUrl;
    setEditing((e) => ({ ...e, photo_url: url }));
  }

  const input: CSSProperties = {
    width: "100%", background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.14)",
    borderRadius: 8, padding: "9px 12px", color: "#fff", fontSize: 14, outline: "none",
  };
  const label: CSSProperties = { fontSize: 12, color: "rgba(255,255,255,.55)", display: "block", marginBottom: 4, marginTop: 12 };

  return (
    <section className="rounded-[14px] p-6" style={{ background: "#101d31", border: "1px solid rgba(255,255,255,.08)" }}>
      <div className="flex flex-wrap items-center gap-3">
        <div>
          <div className="font-display text-[17px] font-700 uppercase text-white">Gestionar selecciones</div>
          <div className="mt-0.5 text-[12px]" style={{ color: "rgba(255,255,255,.45)" }}>
            Las nuevas salen al sitio con «Publicar ahora». Las históricas del código se
            pueden adoptar creando una con el mismo nombre.
          </div>
        </div>
        <button
          onClick={() => setEditing({ ...VACIO })}
          className="ml-auto rounded-[9px] px-4 py-2.5 font-display text-[13px] font-700 uppercase"
          style={{ background: "#C9A227", color: "#0A1A2F" }}
        >
          + Agregar selección
        </button>
      </div>

      {teams.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {teams.map((t) => (
            <button
              key={t.id}
              onClick={() => setEditing(t)}
              className="flex items-center gap-2 rounded-full border px-3 py-1.5 text-[13px] text-white"
              style={{ borderColor: `${t.color ?? "#C9A227"}66`, background: `${t.color ?? "#C9A227"}1a` }}
              title="Editar"
            >
              <span className="h-2 w-2 rounded-full" style={{ background: t.color ?? "#C9A227" }} />
              {t.name}
              {!t.verified && <span style={{ color: "rgba(255,255,255,.4)" }}>· oculta</span>}
              <span style={{ color: "rgba(255,255,255,.4)" }}>✎</span>
            </button>
          ))}
        </div>
      )}

      {editing && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
          style={{ background: "rgba(0,0,0,.72)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setEditing(null); }}
        >
          <div className="max-h-[92vh] w-full max-w-[520px] overflow-y-auto rounded-t-[18px] p-6 sm:rounded-[18px]" style={{ background: "#101d31", border: "1px solid rgba(255,255,255,.1)" }}>
            <h3 className="font-display text-[18px] font-700 uppercase text-white">
              {editing.id ? `Editar · ${editing.name}` : "Nueva selección"}
            </h3>

            <span style={label}>Nombre</span>
            <input style={input} value={editing.name ?? ""} onChange={(e) => setEditing({ ...editing, name: e.target.value })} placeholder="Ej: Las Murciélagas" />

            <span style={label}>Deporte</span>
            <select style={input} value={editing.sport ?? ""} onChange={(e) => setEditing({ ...editing, sport: e.target.value })}>
              {SPORT_LIST.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
            </select>

            <span style={label}>Disciplina (bajada)</span>
            <input style={input} value={editing.discipline ?? ""} onChange={(e) => setEditing({ ...editing, discipline: e.target.value })} placeholder="Ej: Selección Argentina de Fútbol para ciegas" />

            <span style={label}>Historia / Bio</span>
            <textarea style={{ ...input, resize: "vertical" }} rows={3} value={editing.bio ?? ""} onChange={(e) => setEditing({ ...editing, bio: e.target.value })} />

            <span style={label}>Color (acentos y escudo)</span>
            <input type="color" style={{ ...input, height: 42, padding: 4 }} value={editing.color ?? "#C9A227"} onChange={(e) => setEditing({ ...editing, color: e.target.value })} />

            <span style={label}>Foto (opcional)</span>
            {editing.photo_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={editing.photo_url} alt="" className="mb-2 h-24 w-full rounded-[8px] object-cover" />
            )}
            <input type="file" accept="image/*" style={{ ...input, padding: 8 }} onChange={(e) => { const f = e.target.files?.[0]; if (f) void uploadPhoto(f); }} />

            <label className="mt-4 flex items-center gap-2 text-[13px] text-white/80">
              <input type="checkbox" checked={editing.verified ?? true} onChange={(e) => setEditing({ ...editing, verified: e.target.checked })} />
              Visible en el sitio
            </label>

            {err && <p className="mt-3 rounded-[8px] p-3 text-[13px]" style={{ background: "rgba(223,0,36,.14)", color: "#ff8896" }}>{err}</p>}

            <div className="mt-5 flex gap-3">
              <button onClick={() => setEditing(null)} className="flex-1 rounded-[9px] border border-white/20 py-2.5 font-display text-[13px] font-600 uppercase text-white/80">
                Cancelar
              </button>
              <button onClick={save} disabled={busy} className="flex-1 rounded-[9px] py-2.5 font-display text-[13px] font-700 uppercase disabled:opacity-60" style={{ background: "#C9A227", color: "#0A1A2F" }}>
                {busy ? "Guardando…" : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
