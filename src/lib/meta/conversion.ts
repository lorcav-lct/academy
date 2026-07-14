/**
 * Meta Conversions API (server-side) — event forwarding with SHA-256 hashed PII.
 *
 * Sends events (Purchase, InitiateCheckout, …) directly to Meta's Graph API so
 * they are attributed even when the browser Pixel is blocked or absent. All PII
 * (email, phone, name, address, external_id) is hashed per Meta's normalization
 * rules; click/session signals (ip, user agent, _fbp, _fbc) are sent in clear as
 * Meta requires.
 *
 * No-op when META_PIXEL_ID / META_CONVERSION_API_TOKEN are not configured, so
 * callers never need to guard: checkout and webhook keep working without setup.
 *
 * Docs: https://developers.facebook.com/docs/marketing-api/conversions-api
 */
import crypto from "crypto";

const GRAPH_API_VERSION = process.env.META_GRAPH_API_VERSION || "v21.0";

export interface MetaUserData {
  email?: string | null;
  phone?: string | null;
  fullName?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
  /** ISO-3166 alpha-2 (e.g. "IT"). */
  country?: string | null;
  /** Stable id (we use the Supabase user id). Hashed before sending. */
  externalId?: string | null;
  /** Sent in clear — do NOT hash. */
  clientIpAddress?: string | null;
  clientUserAgent?: string | null;
  fbp?: string | null;
  fbc?: string | null;
}

export interface MetaEventInput {
  /** Meta standard/custom event name, e.g. "Purchase", "InitiateCheckout". */
  eventName: string;
  /** Dedup key shared with the browser Pixel event (we use the order id). */
  eventId?: string;
  eventSourceUrl?: string | null;
  actionSource?: "website" | "system_generated" | "app" | "email" | "other";
  /** Unix seconds; defaults to now. Must be within the last 7 days. */
  eventTime?: number;
  user: MetaUserData;
  customData?: Record<string, unknown>;
}

/** Click/session context lifted from the incoming browser request. */
export interface MetaClientContext {
  clientIpAddress?: string;
  clientUserAgent?: string;
  fbp?: string;
  fbc?: string;
  eventSourceUrl?: string;
}

function sha256(value: string): string {
  return crypto.createHash("sha256").update(value).digest("hex");
}

/** Normalize (trim + lowercase) then hash. Empty → undefined. */
function hashNormalized(value?: string | null): string | undefined {
  if (!value) return undefined;
  const normalized = value.trim().toLowerCase();
  if (!normalized) return undefined;
  return sha256(normalized);
}

/** Phone: strip everything but digits, then hash. Empty → undefined. */
function hashPhone(value?: string | null): string | undefined {
  if (!value) return undefined;
  const digits = value.replace(/\D/g, "");
  if (!digits) return undefined;
  return sha256(digits);
}

/** Split a full name into first/last on the first whitespace run. */
function splitName(fullName?: string | null): {
  first?: string;
  last?: string;
} {
  if (!fullName) return {};
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return {};
  if (parts.length === 1) return { first: parts[0] };
  return { first: parts[0], last: parts.slice(1).join(" ") };
}

function buildUserData(user: MetaUserData): Record<string, unknown> {
  const first = user.firstName ?? splitName(user.fullName).first;
  const last = user.lastName ?? splitName(user.fullName).last;

  const data: Record<string, unknown> = {
    em: hashNormalized(user.email),
    ph: hashPhone(user.phone),
    fn: hashNormalized(first),
    ln: hashNormalized(last),
    ct: hashNormalized(user.city),
    st: hashNormalized(user.state),
    zp: hashNormalized(user.zip),
    country: hashNormalized(user.country),
    external_id: hashNormalized(user.externalId),
    client_ip_address: user.clientIpAddress || undefined,
    client_user_agent: user.clientUserAgent || undefined,
    fbp: user.fbp || undefined,
    fbc: user.fbc || undefined,
  };

  // Meta accepts arrays for multi-key fields; wrap the hashed identifiers.
  for (const key of ["em", "ph", "fn", "ln", "ct", "st", "zp", "external_id"]) {
    if (data[key]) data[key] = [data[key]];
  }

  return pruneUndefined(data);
}

function pruneUndefined<T extends Record<string, unknown>>(obj: T): T {
  for (const key of Object.keys(obj)) {
    if (obj[key] === undefined) delete obj[key];
  }
  return obj;
}

function isConfigured(): boolean {
  return Boolean(
    process.env.META_PIXEL_ID && process.env.META_CONVERSION_API_TOKEN,
  );
}

/**
 * Forward one or more events to the Conversions API. Fire-and-forget friendly:
 * never throws, logs failures, no-ops when unconfigured.
 */
export async function sendMetaEvents(events: MetaEventInput[]): Promise<void> {
  if (events.length === 0) return;
  if (!isConfigured()) return;

  const pixelId = process.env.META_PIXEL_ID!;
  const token = process.env.META_CONVERSION_API_TOKEN!;
  const testEventCode = process.env.META_TEST_EVENT_CODE || undefined;
  const now = Math.floor(Date.now() / 1000);

  const data = events.map((e) =>
    pruneUndefined({
      event_name: e.eventName,
      event_time: e.eventTime ?? now,
      event_id: e.eventId,
      event_source_url: e.eventSourceUrl ?? undefined,
      action_source: e.actionSource ?? "website",
      user_data: buildUserData(e.user),
      custom_data: e.customData,
    }),
  );

  const payload: Record<string, unknown> = {
    data,
    access_token: token,
  };
  if (testEventCode) payload.test_event_code = testEventCode;

  try {
    const res = await fetch(
      `https://graph.facebook.com/${GRAPH_API_VERSION}/${pixelId}/events`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      },
    );
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error("Meta CAPI error:", res.status, text);
    }
  } catch (err) {
    console.error("Meta CAPI request failed:", err);
  }
}

/** Convenience wrapper for a single event. */
export function sendMetaEvent(event: MetaEventInput): Promise<void> {
  return sendMetaEvents([event]);
}

function parseCookie(cookieHeader: string, name: string): string | undefined {
  if (!cookieHeader) return undefined;
  for (const part of cookieHeader.split(";")) {
    const eq = part.indexOf("=");
    if (eq === -1) continue;
    if (part.slice(0, eq).trim() === name) {
      return decodeURIComponent(part.slice(eq + 1).trim()) || undefined;
    }
  }
  return undefined;
}

/**
 * Lift click/session signals from request headers. Accepts any `Headers`
 * instance, so it works both with a NextRequest (`request.headers`) and inside
 * a Server Action (`await headers()` from next/headers). `_fbp`/`_fbc` come from
 * the Meta Pixel cookies; when `_fbc` is absent we reconstruct it from an
 * `fbclid` query param on the Referer (Meta's documented format).
 */
export function getMetaClientContext(headers: Headers): MetaClientContext {
  const forwardedFor = headers.get("x-forwarded-for");
  const clientIpAddress =
    forwardedFor?.split(",")[0]?.trim() ||
    headers.get("x-real-ip") ||
    undefined;
  const clientUserAgent = headers.get("user-agent") || undefined;

  const cookieHeader = headers.get("cookie") || "";
  const fbp = parseCookie(cookieHeader, "_fbp");
  let fbc = parseCookie(cookieHeader, "_fbc");
  let eventSourceUrl = headers.get("referer") || undefined;

  if (!fbc && eventSourceUrl) {
    try {
      const url = new URL(eventSourceUrl);
      const fbclid = url.searchParams.get("fbclid");
      if (fbclid) {
        fbc = `fb.1.${Date.now()}.${fbclid}`;
      }
    } catch {
      eventSourceUrl = undefined;
    }
  }

  return pruneUndefined({
    clientIpAddress,
    clientUserAgent,
    fbp,
    fbc,
    eventSourceUrl,
  });
}

/** Map click/session context onto the user_data fields Meta expects. */
export function contextToUserData(
  ctx: MetaClientContext,
): Partial<MetaUserData> {
  return {
    clientIpAddress: ctx.clientIpAddress,
    clientUserAgent: ctx.clientUserAgent,
    fbp: ctx.fbp,
    fbc: ctx.fbc,
  };
}
