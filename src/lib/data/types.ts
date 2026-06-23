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
  raised_amount: number;
  photo_url: string | null;
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
  /** Slugs de los jugadores (atletas) que integran el equipo. */
  member_slugs: string[];
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
