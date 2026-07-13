"use client";

import { useEffect, useState } from "react";
import { getSupabase } from "@/lib/supabase";
import type { TeamCampaign } from "@/lib/data/campaigns";
import { CampaignBar } from "./TeamCampaignCard";

/**
 * Barra de campaña con el recaudado EN VIVO.
 * El sitio estático hornea el total en cada "Publicar ahora", pero los aportes
 * entran a toda hora: al montar, refresca el total real desde public_teams,
 * así la barra del home siempre está sincronizada con los pagos.
 */
export function LiveCampaignBar({
  campaign,
  compact,
}: {
  campaign: TeamCampaign;
  compact?: boolean;
}) {
  const [live, setLive] = useState({
    raised_amount: campaign.raised_amount,
    donor_count: campaign.donor_count,
  });

  useEffect(() => {
    (async () => {
      const supabase = await getSupabase();
      if (!supabase) return;
      const { data } = await supabase
        .from("public_teams")
        .select("raised_amount,donor_count")
        .eq("id", campaign.id)
        .maybeSingle();
      if (data) {
        setLive({
          raised_amount: Number(data.raised_amount) || 0,
          donor_count: Number(data.donor_count) || 0,
        });
      }
    })();
  }, [campaign.id]);

  return <CampaignBar campaign={{ ...campaign, ...live }} compact={compact} />;
}
