import React, { useEffect, useRef, useState, useCallback, forwardRef, useImperativeHandle } from 'react';
import { View, Text, TouchableOpacity, Modal, Pressable, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { LK, tint, shade, theme } from '@/constants/theme';
import { Icon } from '@/components/ui/Icon';
import { useLiveSession, type LiveEvent } from '@/hooks/useLiveSession';
import { notifyPartner } from '@/lib/push';
import { LIVE_PROMPTS, categoryIndices, categoryOfIndex, fillNames } from '@/constants/live-games';

const ROUNDS = 8;

type Mode = 'idle' | 'inviting' | 'invited' | 'playing' | 'summary';

function shuffledOrder(categoryId?: string | null): number[] {
  const idx = categoryIndices(categoryId);
  for (let i = idx.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [idx[i], idx[j]] = [idx[j], idx[i]];
  }
  return idx.slice(0, ROUNDS);
}

// Total deterministic order over two equal-length arrays, so both clients pick
// the same one when resolving a simultaneous-invite tie.
function lexLess(a: number[], b: number[]): boolean {
  const n = Math.min(a.length, b.length);
  for (let i = 0; i < n; i++) {
    if (a[i] !== b[i]) return a[i] < b[i];
  }
  return a.length < b.length;
}

const tap = () => { try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); } catch {} };
const pop = () => { try { Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); } catch {} };

/**
 * "You're both online" live presence + a co-op This-or-That game.
 * Renders a floating banner when the partner is online and overlays for the
 * invite handshake and the game itself.
 */
export type LiveHandle = { start: (categoryId?: string) => void };

export const LiveLayer = forwardRef<LiveHandle, {
  coupleId: string | null;
  userId: string | null;
  partnerName?: string | null;
  myName?: string | null;
  onWatch?: () => void;
}>(function LiveLayer({ coupleId, userId, partnerName, myName, onWatch }, ref) {
  const partner = partnerName?.trim().split(' ')[0] || 'your partner';

  // For "Who's more likely" prompts the two answers are the partners' names.
  // Both phones must agree which name is option 'a' vs 'b' (the match check is
  // keyed on 'a'/'b'), so we sort the two first names into a stable shared order.
  const myFirst = myName?.trim().split(' ')[0] || 'You';
  const partnerFirst = partnerName?.trim().split(' ')[0] || 'Partner';
  const [name1, name2] = [myFirst, partnerFirst].sort((x, y) => x.localeCompare(y));

  const [mode, setMode] = useState<Mode>('idle');
  const [order, setOrder] = useState<number[]>([]);
  const [round, setRound] = useState(0);
  const [myChoice, setMyChoice] = useState<'a' | 'b' | null>(null);
  const [partnerChoice, setPartnerChoice] = useState<'a' | 'b' | null>(null);
  const results = useRef<Record<number, boolean>>({});

  // Keep refs so the memoized broadcast handler always sees the latest values
  // (it's created once, so closing over state directly would go stale).
  const roundRef = useRef(round);
  roundRef.current = round;
  const modeRef = useRef(mode);
  modeRef.current = mode;
  const orderRef = useRef(order);
  orderRef.current = order;

  const onEvent = useCallback((e: LiveEvent) => {
    switch (e.kind) {
      case 'invite':
        // Only surface an invite if we're not already mid-game.
        if (modeRef.current === 'idle' || modeRef.current === 'invited') {
          setOrder(e.order);
          setMode('invited');
          pop();
        } else if (modeRef.current === 'inviting') {
          // Both tapped "Play" at once — each is waiting for the other to
          // accept, which would deadlock. Converge instead: both sides already
          // hold each other's order, so pick the same one deterministically
          // (lexicographically smaller wins) and start together.
          const ord = lexLess(e.order, orderRef.current) ? e.order : orderRef.current;
          setOrder(ord);
          startGame();
        } else if (modeRef.current === 'playing' || modeRef.current === 'summary') {
          // We already accepted and moved on, but the partner is still inviting
          // — our accept was dropped. Re-affirm so they catch up. (We keep our
          // own order, which is the one they sent us, so we stay in sync.)
          send({ kind: 'accept' });
        }
        break;
      case 'accept':
        if (modeRef.current === 'inviting') startGame();
        break;
      case 'decline':
        if (modeRef.current === 'inviting') setMode('idle');
        break;
      case 'answer':
        if (e.round === roundRef.current) setPartnerChoice(e.choice);
        break;
      case 'next':
        if (e.round > roundRef.current) applyNext(e.round);
        break;
      case 'end':
        resetToIdle();
        break;
    }
  }, []);

  const { partnerOnline, send } = useLiveSession(coupleId, userId, onEvent);

  // Allow the home screen to launch an invite from a dedicated button (works
  // even if the partner is offline — they get a push and the invite re-sends
  // once they come online).
  useImperativeHandle(ref, () => ({ start: (categoryId?: string) => { if (modeRef.current === 'idle') invite(categoryId); } }), []);

  function resetToIdle() {
    setMode('idle');
    setRound(0);
    setMyChoice(null);
    setPartnerChoice(null);
    results.current = {};
  }

  function startGame() {
    setRound(0);
    setMyChoice(null);
    setPartnerChoice(null);
    results.current = {};
    setMode('playing');
  }

  function applyNext(nr: number) {
    if (nr >= orderRef.current.length) { setMode('summary'); return; }
    setRound(nr);
    setMyChoice(null);
    setPartnerChoice(null);
  }

  // ── Initiate ───────────────────────────────────────────────────────────
  function invite(categoryId?: string) {
    const ord = shuffledOrder(categoryId);
    setOrder(ord);
    setMode('inviting');
    tap();
    send({ kind: 'invite', order: ord });
    notifyPartner('live_invite', '💞 Play together?', 'Your partner wants to play This or That — tap to join');
  }

  // Broadcasts are fire-and-forget and occasionally dropped, which made the
  // invite feel hit-or-miss. While we're waiting, keep re-sending the invite on
  // an interval until the partner accepts (we leave 'inviting') or we give up.
  // This also covers the partner opening the app from the push after the first
  // broadcast was missed — the next tick reaches them.
  useEffect(() => {
    if (mode !== 'inviting' || !order.length) return;
    send({ kind: 'invite', order });
    const id = setInterval(() => send({ kind: 'invite', order }), 2000);
    return () => clearInterval(id);
  }, [mode, order, send]);

  // Give up waiting after a while so the inviter isn't stuck.
  useEffect(() => {
    if (mode !== 'inviting') return;
    const t = setTimeout(() => setMode('idle'), 45000);
    return () => clearTimeout(t);
  }, [mode]);

  // Rounds ride the same fire-and-forget broadcast, so a dropped 'answer' or
  // 'next' would strand a partner ("Waiting for…", or stuck on the reveal while
  // the other moves on). While playing, re-assert our state on an interval until
  // it has clearly landed. Both sends are idempotent on the receiver:
  //  - resend my answer until this round advances (clears myChoice) — guarantees
  //    the partner gets it even if they already revealed and are waiting on me;
  //  - resend the round advance until the partner reaches this round (signalled
  //    by their answer arriving, i.e. partnerChoice set) — pulls a laggard fwd.
  useEffect(() => {
    if (mode !== 'playing') return;
    const beat = () => {
      if (myChoice) send({ kind: 'answer', round, choice: myChoice });
      if (round > 0 && partnerChoice == null) send({ kind: 'next', round });
    };
    const id = setInterval(beat, 1500);
    return () => clearInterval(id);
  }, [mode, round, myChoice, partnerChoice, send]);

  function accept() {
    tap();
    send({ kind: 'accept' });
    startGame();
  }
  function decline() {
    send({ kind: 'decline' });
    setMode('idle');
  }

  function choose(c: 'a' | 'b') {
    if (myChoice) return; // locked once chosen this round
    tap();
    setMyChoice(c);
    send({ kind: 'answer', round, choice: c });
  }

  function next() {
    const nr = round + 1;
    send({ kind: 'next', round: nr });
    applyNext(nr);
  }

  function quit() {
    send({ kind: 'end' });
    resetToIdle();
  }

  // Record the round result once both have answered.
  const revealed = !!myChoice && !!partnerChoice;
  const matched = revealed && myChoice === partnerChoice;
  useEffect(() => {
    if (mode === 'playing' && revealed) results.current[round] = matched;
  }, [revealed, matched, round, mode]);

  const matchCount = Object.values(results.current).filter(Boolean).length;

  // The category being played is encoded in the synced order, so both phones
  // show the same label and "Play again" replays the same set.
  const playedCat = order.length ? categoryOfIndex(order[0]) : null;

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <>
      {/* Floating "both online" banner */}
      {mode === 'idle' && partnerOnline && (
        <View pointerEvents="box-none" style={styles.bannerWrap}>
          <View style={styles.banner}>
            <View style={{ width: 9, height: 9, borderRadius: 5, backgroundColor: LK.success }} />
            <Text style={{ flex: 1, fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 12.5, color: LK.espresso }}>
              You're both online 💞
            </Text>
            {onWatch && (
              <TouchableOpacity onPress={() => { tap(); onWatch(); }} style={[styles.bannerBtn, { backgroundColor: tint(LK.coral, 0.5) }]}>
                <Text style={{ fontFamily: theme.fonts.body, fontWeight: '800', fontSize: 12.5, color: shade(LK.coral, 0.55) }}>Watch</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={() => invite()} style={styles.bannerBtn}>
              <Text style={{ fontFamily: theme.fonts.body, fontWeight: '800', fontSize: 12.5, color: '#fff' }}>Play</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Inviting (waiting) */}
      <CenterModal visible={mode === 'inviting'}>
        <Text style={styles.h}>Waiting for {partner}…</Text>
        <Text style={styles.p}>We've sent an invite to play This or That. Hang tight 💛</Text>
        <View style={{ marginTop: 18 }}>
          <GhostBtn label="Cancel" onPress={() => { send({ kind: 'end' }); setMode('idle'); }} />
        </View>
      </CenterModal>

      {/* Invited (accept/decline) */}
      <CenterModal visible={mode === 'invited'}>
        <Text style={{ fontSize: 40, textAlign: 'center' }}>💞</Text>
        <Text style={styles.h}>{partner} wants to play</Text>
        <Text style={styles.p}>This or That — answer together and see how in sync you are.</Text>
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 18 }}>
          <View style={{ flex: 1 }}><GhostBtn label="Not now" onPress={decline} /></View>
          <View style={{ flex: 1.4 }}><SolidBtn label="Join 🎉" onPress={accept} /></View>
        </View>
      </CenterModal>

      {/* Playing */}
      <Modal visible={mode === 'playing'} transparent animationType="fade" onRequestClose={quit}>
        <View style={styles.gameBg}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
            <View>
              {playedCat && (
                <Text style={{ fontFamily: theme.fonts.body, fontWeight: '800', fontSize: 12, letterSpacing: 0.5, color: 'rgba(255,255,255,0.55)', marginBottom: 2 }}>
                  {playedCat.emoji}  {playedCat.name.toUpperCase()}
                </Text>
              )}
              <Text style={{ fontFamily: theme.fonts.body, fontWeight: '800', fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>
                Round {Math.min(round + 1, order.length)} of {order.length}
              </Text>
            </View>
            <TouchableOpacity onPress={quit} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Icon name="x" size={24} color="rgba(255,255,255,0.8)" />
            </TouchableOpacity>
          </View>

          {order[round] != null && (() => {
            const prompt = LIVE_PROMPTS[order[round]];
            const fill = (s: string) => fillNames(s, name1, name2);
            return (
              <>
                <Text style={styles.gameQ}>{fill(prompt.q)}</Text>
                <View style={{ gap: 14, marginTop: 26 }}>
                  {(['a', 'b'] as const).map((key) => {
                    const mine = myChoice === key;
                    const theirs = partnerChoice === key;
                    const col = key === 'a' ? LK.coral : LK.sky;
                    return (
                      <Pressable
                        key={key}
                        onPress={() => choose(key)}
                        disabled={!!myChoice}
                        style={{
                          backgroundColor: mine ? col : 'rgba(255,255,255,0.1)',
                          borderRadius: 20, padding: 20,
                          borderWidth: mine ? 0 : 1.5, borderColor: 'rgba(255,255,255,0.2)',
                        }}
                      >
                        <Text style={{ fontFamily: theme.fonts.heading, fontWeight: '800', fontSize: 19, color: '#fff', textAlign: 'center' }}>
                          {fill(prompt[key])}
                        </Text>
                        {/* Reveal who picked what once both have answered */}
                        {revealed && (mine || theirs) && (
                          <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 8 }}>
                            {mine && <Pill text="You" />}
                            {theirs && <Pill text={partner} />}
                          </View>
                        )}
                      </Pressable>
                    );
                  })}
                </View>

                <View style={{ marginTop: 26, minHeight: 70, alignItems: 'center', justifyContent: 'center' }}>
                  {!revealed ? (
                    <Text style={{ fontFamily: theme.fonts.body, fontSize: 14, color: 'rgba(255,255,255,0.7)', textAlign: 'center' }}>
                      {myChoice ? `Waiting for ${partner}…` : 'Tap your pick — you answer at the same time'}
                    </Text>
                  ) : (
                    <>
                      <Text style={{ fontFamily: theme.fonts.heading, fontWeight: '800', fontSize: 20, color: matched ? LK.success : '#fff', textAlign: 'center' }}>
                        {matched ? 'Matched! 💛' : 'Opposites attract 😄'}
                      </Text>
                      <TouchableOpacity onPress={next} style={styles.nextBtn}>
                        <Text style={{ fontFamily: theme.fonts.body, fontWeight: '800', fontSize: 15, color: LK.espresso }}>
                          {round + 1 >= order.length ? 'See results' : 'Next'}
                        </Text>
                      </TouchableOpacity>
                    </>
                  )}
                </View>
              </>
            );
          })()}
        </View>
      </Modal>

      {/* Summary */}
      <CenterModal visible={mode === 'summary'}>
        <Text style={{ fontSize: 44, textAlign: 'center' }}>{matchCount >= order.length * 0.6 ? '💞' : '😄'}</Text>
        <Text style={styles.h}>You matched {matchCount} of {order.length}</Text>
        <Text style={styles.p}>
          {matchCount >= order.length * 0.6
            ? "You two really are in sync 💛"
            : 'Opposites keep it interesting — play again?'}
        </Text>
        <View style={{ flexDirection: 'row', gap: 10, marginTop: 18 }}>
          <View style={{ flex: 1 }}><GhostBtn label="Done" onPress={quit} /></View>
          <View style={{ flex: 1.4 }}><SolidBtn label="Play again 🔁" onPress={() => invite(playedCat?.id)} /></View>
        </View>
      </CenterModal>
    </>
  );
});

// ── Small pieces ─────────────────────────────────────────────────────────
function CenterModal({ visible, children }: { visible: boolean; children: React.ReactNode }) {
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={{ flex: 1, backgroundColor: 'rgba(20,15,10,0.5)', justifyContent: 'center', paddingHorizontal: 28 }}>
        <View style={{ backgroundColor: LK.parchment, borderRadius: 26, padding: 24 }}>{children}</View>
      </View>
    </Modal>
  );
}
function Pill({ text }: { text: string }) {
  return (
    <View style={{ backgroundColor: 'rgba(255,255,255,0.25)', borderRadius: 9999, paddingHorizontal: 9, paddingVertical: 2 }}>
      <Text style={{ fontFamily: theme.fonts.body, fontWeight: '800', fontSize: 11, color: '#fff' }}>{text}</Text>
    </View>
  );
}
function SolidBtn({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} style={{ backgroundColor: LK.espresso, borderRadius: 9999, paddingVertical: 14, alignItems: 'center' }}>
      <Text style={{ fontFamily: theme.fonts.body, fontWeight: '800', fontSize: 15, color: '#fff' }}>{label}</Text>
    </TouchableOpacity>
  );
}
function GhostBtn({ label, onPress }: { label: string; onPress: () => void }) {
  return (
    <TouchableOpacity onPress={onPress} style={{ backgroundColor: 'rgba(42,33,26,0.07)', borderRadius: 9999, paddingVertical: 14, alignItems: 'center' }}>
      <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 15, color: LK.ink70 }}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  bannerWrap: { position: 'absolute', left: 0, right: 0, bottom: 96, alignItems: 'center', paddingHorizontal: 16 },
  banner: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#FFFDF7', borderRadius: 9999, paddingLeft: 16, paddingRight: 6, paddingVertical: 6,
    ...theme.shadow.card, maxWidth: 360, width: '100%',
  },
  bannerBtn: { backgroundColor: LK.espresso, borderRadius: 9999, paddingHorizontal: 14, paddingVertical: 9 },
  h: { fontFamily: theme.fonts.heading, fontWeight: '800', fontSize: 21, color: LK.espresso, textAlign: 'center', marginTop: 8 },
  p: { fontFamily: theme.fonts.body, fontSize: 13.5, color: LK.ink70, textAlign: 'center', marginTop: 6, lineHeight: 20 },
  gameBg: { flex: 1, backgroundColor: 'rgba(26,18,30,0.94)', paddingHorizontal: 26, paddingTop: 80, paddingBottom: 40 },
  gameQ: { fontFamily: theme.fonts.heading, fontWeight: '800', fontSize: 26, color: '#fff', textAlign: 'center' },
  nextBtn: { backgroundColor: '#fff', borderRadius: 9999, paddingHorizontal: 28, paddingVertical: 13, marginTop: 14 },
});
