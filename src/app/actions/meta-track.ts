"use server";

/**
 * Server Actions that forward client-triggered events to the Meta Conversions
 * API. Kept as actions (not open route handlers) so the request context —
 * client IP, user agent, `_fbp`/`_fbc` cookies — is derived server-side and the
 * logged-in identity is read from the Supabase session, never trusted from the
 * caller. All calls are fire-and-forget on the client; failures never surface.
 */
import { headers } from "next/headers";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import {
  contextToUserData,
  getMetaClientContext,
  sendMetaEvent,
} from "@/lib/meta/conversion";

export interface ViewContentInput {
  contentId: string;
  contentName: string;
  /** Product price in euros, when known. Enables value-based optimization. */
  value?: number;
}

export async function trackMetaViewContent(
  input: ViewContentInput,
): Promise<void> {
  const ctx = getMetaClientContext(await headers());

  // Attach the buyer's identity when authenticated (strong match); anonymous
  // visitors still match on ip/ua/fbp/fbc alone.
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  await sendMetaEvent({
    eventName: "ViewContent",
    // No event_id: without a browser Pixel firing the same view there is
    // nothing to dedup against, and a static id would collapse every view of a
    // product into one. Each server event should count on its own.
    eventSourceUrl: ctx.eventSourceUrl,
    user: {
      email: user?.email,
      externalId: user?.id,
      ...contextToUserData(ctx),
    },
    customData: {
      content_type: "product",
      content_ids: [input.contentId],
      content_name: input.contentName,
      ...(input.value !== undefined
        ? { currency: "EUR", value: input.value }
        : {}),
    },
  });
}

export interface RegistrationInput {
  email: string;
  fullName?: string;
  phone?: string;
}

export async function trackMetaRegistration(
  input: RegistrationInput,
): Promise<void> {
  const ctx = getMetaClientContext(await headers());

  await sendMetaEvent({
    eventName: "CompleteRegistration",
    eventSourceUrl: ctx.eventSourceUrl,
    user: {
      email: input.email,
      fullName: input.fullName,
      phone: input.phone,
      ...contextToUserData(ctx),
    },
    customData: {
      content_name: "account",
      status: "registered",
    },
  });
}
