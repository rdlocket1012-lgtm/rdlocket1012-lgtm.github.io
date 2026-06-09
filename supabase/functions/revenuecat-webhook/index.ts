// RevenueCat webhook → keeps couples.subscription_status in sync server-side.
//
// Security: RevenueCat sends a fixed Authorization header you configure in its
// dashboard. We compare it to the REVENUECAT_WEBHOOK_SECRET function secret.
// Runs with the service role (bypasses RLS) so it can update any couple.
//
// Deploy with verify_jwt = false (RevenueCat does not send a Supabase JWT).

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

// Event types that GRANT access.
const GRANT = new Set([
  "INITIAL_PURCHASE",
  "RENEWAL",
  "UNCANCELLATION",
  "PRODUCT_CHANGE",
  "NON_RENEWING_PURCHASE",
  "SUBSCRIPTION_EXTENDED",
]);
// Event types that REVOKE access immediately.
const REVOKE = new Set(["EXPIRATION", "SUBSCRIPTION_PAUSED"]);

Deno.serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  // Verify the shared secret from RevenueCat.
  const secret = Deno.env.get("REVENUECAT_WEBHOOK_SECRET");
  const auth = req.headers.get("Authorization");
  if (secret && auth !== secret) {
    return new Response("Unauthorized", { status: 401 });
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return new Response("Bad request", { status: 400 });
  }

  const event = body?.event;
  const appUserId: string | undefined = event?.app_user_id;
  const type: string | undefined = event?.type;
  if (!event || !appUserId || !type) {
    // Acknowledge so RevenueCat doesn't retry malformed/irrelevant events.
    return new Response("No actionable event", { status: 200 });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  // app_user_id is the Supabase user id we set via Purchases.configure({ appUserID }).
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, couple_id")
    .eq("id", appUserId)
    .maybeSingle();

  if (!profile?.couple_id) {
    return new Response("No couple for user", { status: 200 });
  }

  // Decide the new status. The app treats only 'active' / 'past_due' as premium
  // (see stores/couple.store.ts → isPremiumActive), so we must use that exact
  // vocabulary — NOT 'premium'/'lifetime', which the client would read as free.
  let status: string | null = null;
  let tier: string | null = null;
  if (GRANT.has(type)) {
    status = "active";
    if (type === "NON_RENEWING_PURCHASE") tier = "lifetime";
  } else if (REVOKE.has(type)) {
    status = "free";
  } else if (type === "CANCELLATION" || type === "BILLING_ISSUE") {
    // Auto-renew off / billing retry — still entitled until expiration.
    const exp = event.expiration_at_ms ? Number(event.expiration_at_ms) : 0;
    status = exp && exp > Date.now() ? "past_due" : "free";
  } else {
    return new Response("Ignored event type", { status: 200 });
  }

  // Keep the columns the client and disconnect_relationship() rely on in sync.
  const patch: Record<string, unknown> = {
    subscription_status: status,
    subscribed_by: profile.id, // legacy column, kept in sync
    // On any entitled status, record the payer; clear it when dropping to free.
    original_paying_user_id: status === "free" ? null : profile.id,
  };
  if (tier) patch.subscription_tier = tier;
  if (status === "free") patch.subscription_tier = null;

  const { error } = await supabase
    .from("couples")
    .update(patch)
    .eq("id", profile.couple_id);

  if (error) {
    console.error("Update failed:", error.message);
    return new Response("Update failed", { status: 500 });
  }

  return new Response(JSON.stringify({ ok: true, status }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});
