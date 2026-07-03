import type { SportKey } from "@/config/sports";

/** Par [valor, label] para la fila de stats del atleta. */
export type StatPair = [value: string, label: string];

/** Par [título, descripción] para "Tu aporte financia". */
export type FundItem = [title: string, description: string];

export interface Athlete {
  id: string;
  slug: string;
  full_name: string;
  first_name: string;
  sport: SportKey;
  discipline: string;
  city: string;
  province: string;
  bio: string;
  goal_amount: number;
  /** Opt-in: si es true, el perfil muestra una barra de meta de recaudación. */
  show_goal?: boolean;
  raised_amount: number;
  photo_url: string | null;
  /** Foto secundaria (en acción) opcional, mostrada en el perfil. */
  photo_secondary_url?: string | null;
  /** Próxima competencia (texto libre), opcional. */
  next_competition?: string | null;
  stats: StatPair[];
  fund_items: FundItem[];
  verified: boolean;
  stripe_account_id: string | null;
  created_at: string;
  /** Slug del equipo al que pertenece (solo jugadores de deportes de equipo). */
  team?: string;
  /** Posición/rol dentro del equipo (ej. "Arquera", "Lateral izquierdo"). */
  role?: string;
  /**
   * Alcance de la campaña:
   * - "la2028" (default): foco rumbo a Los Ángeles 2028.
   * - "otros": cualquier atleta argentino (juvenil del barrio, regional, amateur…).
   */
  scope?: "la2028" | "otros";
}

/** Campaña de un equipo (deportes de equipo). Se puede apoyar entero o por jugador. */
export interface Team {
  id: string;
  slug: string;
  name: string;
  sport: SportKey;
  discipline: string;
  city: string;
  province: string;
  bio: string;
  goal_amount: number;
  raised_amount: number;
  photo_url: string | null;
  stats: StatPair[];
  fund_items: FundItem[];
  verified: boolean;
  /** Selección nacional: se muestra como distintivo del país. */
  national?: boolean;
  /** Color del equipo (para el escudo/acentos). */
  color?: string;
  /**
   * Slugs de jugadores fijos (legacy/demo). En las selecciones nacionales la
   * membresía es dinámica: los jugadores son los atletas con `team === slug`.
   */
  member_slugs?: string[];
  created_at: string;
}

export type DonationType = "once" | "monthly";

export interface Donation {
  id: string;
  athlete_id: string;
  amount: number;
  type: DonationType;
  platform_fee: number;
  net_amount: number;
  donor_email: string | null;
  stripe_payment_id: string | null;
  status: string;
  created_at: string;
}
