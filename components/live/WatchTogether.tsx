import React, { useEffect, useRef, useState, useCallback, useImperativeHandle, forwardRef } from 'react';
import { View, Text, Pressable, Modal, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import YoutubePlayer from 'react-native-youtube-iframe';
import { toast } from '@/lib/feedback';
import { LK, tint, shade, theme } from '@/constants/theme';
import { Icon } from '@/components/ui/Icon';
import { ScalePressable } from '@/components/ui/scale-pressable';
import { useWatchSession, type WatchEvent } from '@/hooks/useWatchSession';
import { notifyPartner, senderName } from '@/lib/push';
import { parseYouTubeId } from '@/utils/youtube';

const DRIFT_TOLERANCE = 1.5;   // seconds before a follower re-syncs
const HEARTBEAT_MS = 2000;

type Mode = 'idle' | 'compose' | 'inviting' | 'invited' | 'watching';
type Role = 'host' | 'follower';

export type WatchHandle = { start: () => void };

import { tap, success as hapticSuccess } from '@/lib/haptics';

/**
 * YouTube "watch together": one partner pastes a link and invites; both load
 * the same video. The host (inviter) drives play/pause/seek; the follower
 * mirrors and self-corrects from periodic heartbeats so they stay in sync.
 *
 * NOTE: requires the native `react-native-webview` module — ships in build #19,
 * not via OTA.
 */
export const WatchTogether = forwardRef<WatchHandle, {
  coupleId: string | null;
  userId: string | null;
  partnerName?: string | null;
}>(function WatchTogether({ coupleId, userId, partnerName }, ref) {
  const partner = partnerName?.trim().split(' ')[0] || 'your partner';

  const [mode, setMode] = useState<Mode>('idle');
  const [role, setRole] = useState<Role>('host');
  const [videoId, setVideoId] = useState<string | null>(null);
  const [playing, setPlaying] = useState(false);
  const [link, setLink] = useState('');
  const pendingVideo = useRef<string | null>(null);

  const playerRef = useRef<any>(null);
  const modeRef = useRef(mode); modeRef.current = mode;
  const roleRef = useRef(role); roleRef.current = role;
  const playingRef = useRef(playing); playingRef.current = playing;

  const getCur = useCallback(async (): Promise<number> => {
    try { return (await playerRef.current?.getCurrentTime?.()) ?? 0; } catch { return 0; }
  }, []);
  const seek = useCallback((to: number) => {
    try { playerRef.current?.seekTo?.(Math.max(0, to), true); } catch {}
  }, []);

  // ── Incoming events ──────────────────────────────────────────────────────
  const onEvent = useCallback(async (e: WatchEvent) => {
    switch (e.kind) {
      case 'invite':
        if (modeRef.current === 'idle' || modeRef.current === 'invited') {
          pendingVideo.current = e.videoId;
          setRole('follower');
          setMode('invited');
          hapticSuccess();
        }
        break;
      case 'accept':
        if (modeRef.current === 'inviting' && roleRef.current === 'host') {
          setVideoId(pendingVideo.current);
          setPlaying(false);
          setMode('watching');
        }
        break;
      case 'decline':
        if (modeRef.current === 'inviting') { setMode('idle'); toast(`${partner} isn't up for it right now.`); }
        break;
      case 'load':
        setVideoId(e.videoId);
        setMode('watching');
        break;
      case 'play':
        if (roleRef.current === 'follower') {
          setPlaying(true);
          seek(e.at + (Date.now() - e.sentAt) / 1000);
        }
        break;
      case 'pause':
        if (roleRef.current === 'follower') { setPlaying(false); seek(e.at); }
        break;
      case 'seek':
        if (roleRef.current === 'follower') seek(e.to);
        break;
      case 'heartbeat':
        if (roleRef.current === 'follower') {
          if (playingRef.current !== e.playing) setPlaying(e.playing);
          const target = e.at + (e.playing ? (Date.now() - e.sentAt) / 1000 : 0);
          const cur = await getCur();
          if (Math.abs(cur - target) > DRIFT_TOLERANCE) seek(target);
        }
        break;
      case 'end':
        endLocal();
        break;
    }
  }, [partner, getCur, seek]);

  const { send } = useWatchSession(coupleId, userId, onEvent);

  // Host heartbeat — keeps the follower locked on.
  useEffect(() => {
    if (mode !== 'watching' || role !== 'host') return;
    const id = setInterval(async () => {
      const at = await getCur();
      send({ kind: 'heartbeat', at, sentAt: Date.now(), playing: playingRef.current });
    }, HEARTBEAT_MS);
    return () => clearInterval(id);
  }, [mode, role, send, getCur]);

  // While waiting, re-broadcast the invite periodically (covers the partner
  // opening the app from the push after the first broadcast was missed) and
  // give up after a while so the host isn't stuck.
  useEffect(() => {
    if (mode !== 'inviting') return;
    const vid = pendingVideo.current;
    const resend = setInterval(() => {
      if (vid) send({ kind: 'invite', videoId: vid });
    }, 3000);
    const giveUp = setTimeout(() => setMode('idle'), 45000);
    return () => { clearInterval(resend); clearTimeout(giveUp); };
  }, [mode, send]);

  // ── Imperative entry (called from the "both online" banner) ───────────────
  useImperativeHandle(ref, () => ({
    start: () => { setRole('host'); setLink(''); setMode('compose'); },
  }), []);

  function submitLink() {
    const id = parseYouTubeId(link);
    if (!id) { toast.warn('Paste a YouTube link (or share one from the YouTube app).'); return; }
    pendingVideo.current = id;
    setRole('host');
    setMode('inviting');
    tap();
    send({ kind: 'invite', videoId: id });
    notifyPartner('live_invite', '📺 Watch together?', `${senderName()} wants to watch a video with you — tap to join`);
  }

  function accept() {
    tap();
    send({ kind: 'accept' });
    setVideoId(pendingVideo.current);
    setRole('follower');
    setPlaying(false);
    setMode('watching');
  }
  function decline() { send({ kind: 'decline' }); setMode('idle'); }

  function endLocal() {
    setMode('idle'); setVideoId(null); setPlaying(false); pendingVideo.current = null;
  }
  function quit() { send({ kind: 'end' }); endLocal(); }

  // Host playback controls
  async function hostTogglePlay() {
    const np = !playing;
    setPlaying(np);
    const at = await getCur();
    send(np ? { kind: 'play', at, sentAt: Date.now() } : { kind: 'pause', at });
  }
  async function hostResync() {
    // Force the follower to jump to the host's exact position.
    const at = await getCur();
    send({ kind: 'seek', to: at });
    send({ kind: 'heartbeat', at, sentAt: Date.now(), playing: playingRef.current });
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <>
      {/* Compose: paste a link */}
      <Modal visible={mode === 'compose'} transparent animationType="slide" onRequestClose={() => setMode('idle')}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, justifyContent: 'flex-end' }}>
          <Pressable style={{ flex: 1, backgroundColor: 'rgba(20,15,10,0.45)' }} onPress={() => setMode('idle')} accessibilityLabel="Close" />
          <View style={{ backgroundColor: LK.parchment, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 22, paddingBottom: 34 }}>
            <View style={{ alignItems: 'center', marginBottom: 14 }}>
              <View style={{ width: 38, height: 5, borderRadius: 9999, backgroundColor: 'rgba(42,33,26,0.15)' }} />
            </View>
            <Text style={{ fontFamily: theme.fonts.heading, fontWeight: '800', fontSize: 21, color: LK.espresso, textAlign: 'center' }}>Watch together 📺</Text>
            <Text style={{ fontFamily: theme.fonts.body, fontSize: 13, color: LK.ink70, textAlign: 'center', marginTop: 5, lineHeight: 19 }}>
              Paste a YouTube link (or share one from the YouTube app). You'll both watch it in sync.
            </Text>
            <TextInput
              value={link}
              onChangeText={setLink}
              placeholder="https://youtube.com/watch?v=…"
              placeholderTextColor={LK.ink70}
              autoCapitalize="none"
              autoCorrect={false}
              style={{ backgroundColor: LK.ivory, borderRadius: 16, padding: 14, fontFamily: theme.fonts.body, fontSize: 15, color: LK.espresso, marginTop: 16, ...theme.shadow.sm }}
            />
            <ScalePressable
              onPress={submitLink}
              disabled={!link.trim()}
              scaleTo={0.97}
              accessibilityLabel={`Invite ${partner} to watch`}
              containerStyle={{ marginTop: 14 }}
              style={{ backgroundColor: link.trim() ? LK.espresso : 'rgba(42,33,26,0.15)', borderRadius: 9999, paddingVertical: 15, alignItems: 'center' }}
            >
              <Text style={{ fontFamily: theme.fonts.body, fontWeight: '800', fontSize: 15.5, color: link.trim() ? '#fff' : LK.ink70 }}>Invite {partner} to watch</Text>
            </ScalePressable>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Inviting / Invited handshake */}
      <Modal visible={mode === 'inviting' || mode === 'invited'} transparent animationType="fade">
        <View style={{ flex: 1, backgroundColor: 'rgba(20,15,10,0.5)', justifyContent: 'center', paddingHorizontal: 28 }}>
          <View style={{ backgroundColor: LK.parchment, borderRadius: 26, padding: 24 }}>
            <Text style={{ fontSize: 40, textAlign: 'center' }}>📺</Text>
            {mode === 'inviting' ? (
              <>
                <Text style={H}>Waiting for {partner}…</Text>
                <Text style={P}>We've sent an invite to watch together. Hang tight 💛</Text>
                <ScalePressable onPress={quit} scaleTo={0.97} haptic={false} accessibilityLabel="Cancel" containerStyle={{ marginTop: 18 }} style={{ backgroundColor: 'rgba(42,33,26,0.07)', borderRadius: 9999, paddingVertical: 14, alignItems: 'center' }}>
                  <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 15, color: LK.ink70 }}>Cancel</Text>
                </ScalePressable>
              </>
            ) : (
              <>
                <Text style={H}>{partner} wants to watch together</Text>
                <Text style={P}>Press play at the same time and stay perfectly in sync.</Text>
                <View style={{ flexDirection: 'row', gap: 10, marginTop: 18 }}>
                  <ScalePressable onPress={decline} scaleTo={0.97} haptic={false} accessibilityLabel="Not now" containerStyle={{ flex: 1 }} style={{ backgroundColor: 'rgba(42,33,26,0.07)', borderRadius: 9999, paddingVertical: 14, alignItems: 'center' }}>
                    <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 15, color: LK.ink70 }}>Not now</Text>
                  </ScalePressable>
                  <ScalePressable onPress={accept} scaleTo={0.97} accessibilityLabel="Join watch session" containerStyle={{ flex: 1.4 }} style={{ backgroundColor: LK.espresso, borderRadius: 9999, paddingVertical: 14, alignItems: 'center' }}>
                    <Text style={{ fontFamily: theme.fonts.body, fontWeight: '800', fontSize: 15, color: '#fff' }}>Join 🍿</Text>
                  </ScalePressable>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* The player */}
      <Modal visible={mode === 'watching'} transparent animationType="fade" onRequestClose={quit}>
        <View style={{ flex: 1, backgroundColor: 'rgba(12,10,16,0.97)', justifyContent: 'center' }}>
          <View style={{ position: 'absolute', top: 60, left: 20, right: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
              <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: LK.success }} />
              <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 13, color: 'rgba(255,255,255,0.85)' }}>
                Watching with {partner}
              </Text>
            </View>
            <ScalePressable onPress={quit} scaleTo={0.9} haptic={false} accessibilityLabel="Stop watching" hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }} style={{ minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="x" size={24} color="rgba(255,255,255,0.85)" />
            </ScalePressable>
          </View>

          {videoId && (
            <YoutubePlayer
              ref={playerRef}
              height={230}
              play={playing}
              videoId={videoId}
              onChangeState={(s: string) => {
                // Host: reflect the user's native play/pause taps into the sync.
                if (roleRef.current !== 'host') return;
                if (s === 'playing' && !playingRef.current) hostTogglePlay();
                else if (s === 'paused' && playingRef.current) hostTogglePlay();
              }}
            />
          )}

          {/* Host controls */}
          {role === 'host' ? (
            <View style={{ position: 'absolute', bottom: 70, left: 0, right: 0, alignItems: 'center', gap: 12 }}>
              <View style={{ flexDirection: 'row', gap: 14 }}>
                <ScalePressable onPress={hostTogglePlay} scaleTo={0.92} accessibilityLabel={playing ? 'Pause' : 'Play'} style={ctrlBtn}>
                  <Icon name={playing ? 'pause' : 'play'} size={22} color={LK.espresso} />
                </ScalePressable>
                <ScalePressable onPress={hostResync} scaleTo={0.95} accessibilityLabel="Re-sync playback" style={[ctrlBtn, { flexDirection: 'row', width: undefined, paddingHorizontal: 18, gap: 7 }]}>
                  <Icon name="sync" size={18} color={LK.espresso} />
                  <Text style={{ fontFamily: theme.fonts.body, fontWeight: '800', fontSize: 14, color: LK.espresso }}>Re-sync</Text>
                </ScalePressable>
              </View>
              <Text style={{ fontFamily: theme.fonts.body, fontSize: 11.5, color: 'rgba(255,255,255,0.55)' }}>You're controlling playback</Text>
            </View>
          ) : (
            <View style={{ position: 'absolute', bottom: 74, left: 0, right: 0, alignItems: 'center' }}>
              <Text style={{ fontFamily: theme.fonts.body, fontSize: 12.5, color: 'rgba(255,255,255,0.6)' }}>
                {partner} is controlling — you're synced 💛
              </Text>
            </View>
          )}
        </View>
      </Modal>
    </>
  );
});

const H = { fontFamily: theme.fonts.heading, fontWeight: '800' as const, fontSize: 21, color: LK.espresso, textAlign: 'center' as const, marginTop: 8 };
const P = { fontFamily: theme.fonts.body, fontSize: 13.5, color: LK.ink70, textAlign: 'center' as const, marginTop: 6, lineHeight: 20 };
const ctrlBtn = { width: 56, height: 56, borderRadius: 28, backgroundColor: '#fff', alignItems: 'center' as const, justifyContent: 'center' as const, ...theme.shadow.card };
