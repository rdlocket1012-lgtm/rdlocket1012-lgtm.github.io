import { createClient } from 'jsr:@supabase/supabase-js@2';

// Permanently deletes the authenticated caller's account.
//
// The caller is identified by their JWT (verify_jwt = true) and NOTHING is read
// from the request body — there is no way to ask this function to delete someone
// else. Same rule as `notify`.
//
// WHAT SURVIVES, AND WHY
// ----------------------
// Locket's content is jointly authored, so "delete my account" cannot mean
// "delete our shared history" while the other person is still using the app.
// The split:
//
//   • The partner is still active  -> the couple and everything in it stays.
//     The leaving user's rows lose their author (migration 019 turned those
//     foreign keys into ON DELETE SET NULL), their avatar and their drawings
//     go, and their private data goes. The partner opens the app to an intact
//     timeline. This is what the delete screen promises.
//
//   • Nobody is left  -> the couple row is deleted, which cascades every
//     couple-scoped table, and all four couple-prefixed storage buckets are
//     emptied. Nothing is orphaned behind RLS that no one can ever reach.
//
// `profile_details` is deliberately NOT filtered by user: its rows are keyed
// ('me' | 'partner') relative to whoever last edited them, not to a user id, so
// it is a joint record. It dies with the couple.
//
// Deleting the auth user is LAST and cascades: profiles, private_notes,
// activity_dismissals, partner_drawings (sender_id).

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;

/** Buckets whose objects are stored under a `{coupleId}/` prefix. */
const COUPLE_BUCKETS = ['partner-drawings', 'voice-letters', 'couple-covers', 'milestone-photos'];

const json = (status: number, body: Record<string, unknown>) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

type Admin = ReturnType<typeof createClient>;

/**
 * Removes objects under `prefix` in `bucket`. Best-effort: a storage failure
 * must never strand a half-deleted account, so errors are collected and
 * reported rather than thrown. Orphaned bytes are a cleanup job; a user who
 * cannot delete their account is an App Review rejection.
 */
async function purgePrefix(admin: Admin, bucket: string, prefix: string, keep?: (name: string) => boolean) {
  const removed: string[] = [];
  try {
    // 1000 is the API maximum per page. Loop until a short page comes back.
    for (let offset = 0; ; offset += 1000) {
      const { data, error } = await admin.storage.from(bucket).list(prefix, { limit: 1000, offset });
      if (error || !data?.length) break;
      const paths = data
        .filter((o) => (keep ? !keep(o.name) : true))
        .map((o) => `${prefix}/${o.name}`);
      if (paths.length) {
        await admin.storage.from(bucket).remove(paths);
        removed.push(...paths);
      }
      if (data.length < 1000) break;
    }
  } catch {
    /* best-effort — see the doc comment */
  }
  return removed;
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') return json(405, { error: 'Method not allowed' });

  const authHeader = req.headers.get('Authorization') ?? '';
  if (!authHeader.startsWith('Bearer ')) return json(401, { error: 'Missing bearer token' });

  // Resolve the caller from their own JWT — never from the request body.
  const asUser = createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
  });
  const { data: userData, error: userErr } = await asUser.auth.getUser();
  const uid = userData?.user?.id;
  if (userErr || !uid) return json(401, { error: 'Not authenticated' });

  const admin = createClient(SUPABASE_URL, SERVICE_ROLE);

  const { data: profile } = await admin
    .from('profiles')
    .select('couple_id')
    .eq('id', uid)
    .maybeSingle();
  const coupleId = (profile as { couple_id?: string | null } | null)?.couple_id ?? null;

  // Is anyone else still in this couple? A soft-deleted profile doesn't count.
  let partnerId: string | null = null;
  if (coupleId) {
    const { data: partner } = await admin
      .from('profiles')
      .select('id')
      .eq('couple_id', coupleId)
      .neq('id', uid)
      .is('deleted_at', null)
      .maybeSingle();
    partnerId = (partner as { id?: string } | null)?.id ?? null;
  }

  // The user's own avatar always goes — it is theirs alone.
  await purgePrefix(admin, 'avatars', uid);

  if (coupleId && !partnerId) {
    // Last one out. Empty every couple-prefixed bucket, then drop the couple —
    // the cascade takes all couple-scoped rows with it.
    for (const bucket of COUPLE_BUCKETS) await purgePrefix(admin, bucket, coupleId);

    const { error: coupleErr } = await admin.from('couples').delete().eq('id', coupleId);
    if (coupleErr) return json(500, { error: `Could not delete couple: ${coupleErr.message}` });
  } else if (coupleId && partnerId) {
    // The partner keeps the shared space. Hand the subscription back to them so
    // a departing subscriber doesn't leave a dangling payer reference.
    await admin
      .from('couples')
      .update({ subscribed_by: null, original_paying_user_id: null })
      .eq('id', coupleId)
      .eq('subscribed_by', uid);

    // The drawing ROWS cascade off sender_id; their bytes do not. Files are
    // named `{userId}_{timestamp}.png` under the couple prefix.
    await purgePrefix(admin, 'partner-drawings', coupleId, (name) => !name.startsWith(`${uid}_`));
  }

  // Last: the auth user. Cascades profiles, private_notes, activity_dismissals
  // and partner_drawings, and revokes every session and refresh token.
  const { error: delErr } = await admin.auth.admin.deleteUser(uid);
  if (delErr) return json(500, { error: `Could not delete account: ${delErr.message}` });

  return json(200, { deleted: true, coupleDeleted: !!coupleId && !partnerId });
});
