import React, { useState } from 'react';
import { View, Text, Pressable, Modal } from 'react-native';
import { LK, theme } from '@/constants/theme';
import { Icon } from '@/components/ui/Icon';
import { ScalePressable } from '@/components/ui/scale-pressable';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/auth.store';

const EMOJIS = ['☕', '😴', '🥰', '😄', '😢', '🔥', '💛', '🫶', '😎', '🤔', '🥳', '😮‍💨', '🌧️', '✨', '🍕', '💤'];

export function StatusBubble() {
  const profile = useAuthStore((s) => s.profile);
  const [open, setOpen] = useState(false);

  async function setStatus(emoji: string | null) {
    if (!profile?.id) return;
    setOpen(false);
    // optimistic
    useAuthStore.setState({ profile: { ...profile, status_emoji: emoji } });
    await supabase.from('profiles').update({ status_emoji: emoji }).eq('id', profile.id);
  }

  return (
    <>
      <ScalePressable
        onPress={() => setOpen(true)}
        scaleTo={0.9}
        // 26px visual bubble — hitSlop brings the touch target to ≥44pt.
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        containerStyle={{ position: 'absolute', bottom: -4, right: -6, zIndex: 5 }}
        style={{
          width: 26, height: 26, borderRadius: 13,
          backgroundColor: LK.ivory, borderWidth: 2, borderColor: LK.parchment,
          alignItems: 'center', justifyContent: 'center',
          ...theme.shadow.sm,
        }}
        accessibilityLabel="Set status"
      >
        {profile?.status_emoji
          ? <Text style={{ fontSize: 13 }}>{profile.status_emoji}</Text>
          : <Icon name="plus" size={13} color={LK.ink70} />}
      </ScalePressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable style={{ flex: 1, backgroundColor: 'rgba(20,15,10,0.4)', justifyContent: 'center', padding: 28 }} onPress={() => setOpen(false)}>
          <Pressable style={{ backgroundColor: LK.parchment, borderRadius: 28, borderCurve: 'continuous', padding: 22, ...theme.shadow.card }}>
            <Text style={{ fontFamily: theme.fonts.heading, fontWeight: '800', fontSize: 21, color: LK.espresso, textAlign: 'center' }}>How are you feeling?</Text>
            <Text style={{ fontFamily: theme.fonts.body, fontSize: 13, color: LK.ink70, textAlign: 'center', marginTop: 4 }}>Your partner sees this next to your name.</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10, marginTop: 18 }}>
              {EMOJIS.map((e) => (
                <ScalePressable key={e} onPress={() => setStatus(e)} scaleTo={0.9} accessibilityLabel={`Set status ${e}`} style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: LK.ivory, alignItems: 'center', justifyContent: 'center', ...theme.shadow.sm }}>
                  <Text style={{ fontSize: 26 }}>{e}</Text>
                </ScalePressable>
              ))}
            </View>
            {profile?.status_emoji && (
              <ScalePressable
                onPress={() => setStatus(null)}
                haptic={false}
                accessibilityRole="button"
                accessibilityLabel="Clear status"
                containerStyle={{ marginTop: 10, alignSelf: 'center' }}
                style={{ minHeight: 44, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 16 }}
              >
                <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 14, color: LK.ink70 }}>Clear status</Text>
              </ScalePressable>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}
