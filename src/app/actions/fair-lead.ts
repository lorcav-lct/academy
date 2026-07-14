"use server";

import { headers } from "next/headers";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  contextToUserData,
  getMetaClientContext,
  sendMetaEvent,
} from "@/lib/meta/conversion";

export type FairLeadInput = {
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  source?: string;
};

export async function saveFairLead(
  input: FairLeadInput,
): Promise<{ success: boolean; error?: string }> {
  const { first_name, last_name, email, phone, source = "fiera" } = input;

  if (!first_name.trim() || !last_name.trim() || !email.trim()) {
    return { success: false, error: "Campi obbligatori mancanti." };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { success: false, error: "Email non valida." };
  }

  const supabase = createAdminClient();

  const { error } = await supabase.from("fair_leads").insert({
    first_name: first_name.trim(),
    last_name: last_name.trim(),
    email: email.trim().toLowerCase(),
    phone: phone?.trim() || null,
    source,
  });

  if (error) {
    if (error.code === "23505") {
      return {
        success: false,
        error: "Email già registrata. Ci vediamo dopo!",
      };
    }
    console.error("[saveFairLead]", error);
    return { success: false, error: "Errore durante il salvataggio." };
  }

  // Meta CAPI: Lead. Rich PII (email + name + phone) → strong match quality.
  const ctx = getMetaClientContext(await headers());
  await sendMetaEvent({
    eventName: "Lead",
    eventSourceUrl: ctx.eventSourceUrl,
    user: {
      email: email.trim().toLowerCase(),
      phone,
      firstName: first_name,
      lastName: last_name,
      ...contextToUserData(ctx),
    },
    customData: { content_name: source },
  });

  return { success: true };
}
