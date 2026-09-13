import { createClient } from 'jsr:@supabase/supabase-js@2';

// Sends a push notification to the authenticated caller's partner.
// The caller is identified by their JWT (verify_jwt = true). We never trust a
// recipient id from the request body — the partner is resolved server-side from
// the caller's couple, so a user can only ever notify their own partner.

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;

// Nudge/micro-interaction push types. When the RECIPIENT has turned off nudge
// haptics, these are delivered silently (no sound / no buzz) so they aren't
// disturbed — the visual still lands.
const NUDGE_TYPES = new Set(['nudge_hug', 'nudge_kiss_request', 'bite', 'thumb_kiss']);

// Tables that back the in-app Activity feed. The app-icon badge is the count of
// rows in these that the partner created since the recipient last opened it.
// `partner_drawings` has no deleted_at column (migration 012), hence the flag.
const ACTIVITY_TABLES: Array<{ table: string; ownerCol: string; softDelete: boolean }> = [
  { table: 'letters', ownerCol: 'sender_id', softDelete: true },
  { table: 'coupons', ownerCol: 'created_by', softDelete: true },
  { table: 'milestones', ownerCol: 'created_by', softDelete: true },
  { table: 'partner_drawings', ownerCol: 'sender_id', softDelete: false },
  { table: 'bucket_list_items', ownerCol: 'added_by', softDelete: true },
];

const json = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

/**
 * Counts unseen Activity items for `recipientId`. Returns null when the count
 * can't be determined (e.g. migration 015 not applied yet), in which case the
 * push simply carries no badge and the client keeps the badge it already had.
 */
async function unseenActivityCount(
  admin: ReturnType<typeof createClient>,
  recipientId: string,
  coupleId: string,
): Promise<number | null> {
  const { data: prof, error } = await admin
    .from('profiles')
    .select('activity_seen_at')
    .eq('id', recipientId)
    .maybeSingle();
  if (error) return null; // column missing → don't guess at a badge

  const since = (prof as { activity_seen_at?: string | null } | null)?.activity_seen_at ?? null;

  const counts = await Promise.all(
    ACTIVITY_TABLES.map(async ({ table, ownerCol, softDelete }) => {
      let q = admin
        .from(table)
        .select('id', { count: 'exact', head: true })
        .eq('couple_id', coupleId)
        .neq(ownerCol, recipientId);
      if (softDelete) q = q.is('deleted_at', null);
      if (since) q = q.gt('created_at', since);
      const { count } = await q;
      return count ?? 0;
    }),
  );
  return counts.reduce((a, b) => a + b, 0);
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') return json(405, { error: 'method_not_allowed' });

  const authHeader = req.headers.get('Authorization');
  if (!authHeader) return json(401, { error: 'missing_auth' });

  let payload: { type?: string; title?: string; body?: string; categoryId?: string };
  try {
    payload = await req.json();
  } catch {
    return json(400, { error: 'bad_json' });
  }
  const title = (payload.title ?? '').toString().slice(0, 120);
  const body = (payload.body ?? '').toString().slice(0, 240);
  const type = (payload.type ?? 'generic').toString().slice(0, 40);
  const categoryId = payload.categoryId ? payload.categoryId.toString().slice(0, 40) : undefined;
  if (!title) return json(400, { error: 'missing_title' });

  // Identify the caller from their JWT.
  const userClient = createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: userData, error: userErr } = await userClient.auth.getUser();
  if (userErr || !userData?.user) return json(401, { error: 'invalid_user' });
  const callerId = userData.user.id;

  // Resolve the partner's push token with the service role (bypasses RLS).
  const admin = createClient(SUPABASE_URL, SERVICE_ROLE);
  const { data: me } = await admin
    .from('profiles')
    .select('couple_id')
    .eq('id', callerId)
    .maybeSingle();
  if (!me?.couple_id) return json(200, { sent: false, reason: 'no_couple' });

  const { data: partner } = await admin
    .from('profiles')
    .select('id, push_token, nudge_haptics')
    .eq('couple_id', me.couple_id)
    .neq('id', callerId)
    .maybeSingle();
  if (!partner?.push_token) return json(200, { sent: false, reason: 'no_token' });

  // Silence the push when the recipient muted nudge buzzing AND this is a nudge.
  const silent = partner.nudge_haptics === false && NUDGE_TYPES.has(type);

  // Build the Expo push message. categoryId maps to an iOS interactive
  // notification category (action buttons like "Bite Back!").
  const message: Record<string, unknown> = {
    to: partner.push_token,
    sound: silent ? null : 'default',
    title,
    body,
    data: { type },
  };
  if (categoryId) {
    message.categoryId = categoryId;
    (message.data as Record<string, unknown>).categoryId = categoryId;
  }

  // Badge the app icon with the recipient's unseen Activity count. Computed
  // here rather than on the client because the app may be backgrounded or
  // killed when the push lands — that's the whole point of a badge.
  //
  // Nudges are ephemeral and never appear in the Activity feed, so they must
  // not bump the badge; the count is read from the tables regardless, so a
  // nudge push just carries the current (unchanged) number.
  const badge = await unseenActivityCount(admin, partner.id as string, me.couple_id as string);
  if (badge !== null) message.badge = badge;

  const resp = await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Accept-Encoding': 'gzip, deflate',
    },
    body: JSON.stringify(message),
  });
  const result = await resp.json().catch(() => ({}));
  return json(200, { sent: true, silent, badge, expo: result });
});
