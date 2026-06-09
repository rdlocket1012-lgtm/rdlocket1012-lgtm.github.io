import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';
import { LK, theme } from '@/constants/theme';
import { Icon } from '@/components/ui/Icon';
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
      <TouchableOpacity
        onPress={() => setOpen(true)}
        activeOpacity={0.8}
        style={{
          width: 26, height: 26, borderRadius: 13,
          backgroundColor: LK.ivory, borderWidth: 2, borderColor: LK.cream,
          alignItems: 'center', justifyContent: 'center',
          position: 'absolute', bottom: -4, right: -6, zIndex: 5, ...theme.shadow.sm,
        }}
        accessibilityLabel="Set status"
      >
        {profile?.status_emoji
          ? <Text style={{ fontSize: 13 }}>{profile.status_emoji}</Text>
          : <Icon name="plus" size={13} color={LK.ink70} />}
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade">
        <TouchableOpacity style={{ flex: 1, backgroundColor: 'rgba(20,15,10,0.4)', justifyContent: 'center', padding: 28 }} activeOpacity={1} onPress={() => setOpen(false)}>
          <TouchableOpacity activeOpacity={1} style={{ backgroundColor: LK.cream, borderRadius: 28, padding: 22, ...theme.shadow.card }}>
            <Text style={{ fontFamily: theme.fonts.heading, fontWeight: '800', fontSize: 21, color: LK.ink, textAlign: 'center' }}>How are you feeling?</Text>
            <Text style={{ fontFamily: theme.fonts.body, fontSize: 13, color: LK.ink70, textAlign: 'center', marginTop: 4 }}>Your partner sees this next to your name.</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10, marginTop: 18 }}>
              {EMOJIS.map((e) => (
                <TouchableOpacity key={e} onPress={() => setStatus(e)} style={{ width: 52, height: 52, borderRadius: 26, backgroundColor: LK.ivory, alignItems: 'center', justifyContent: 'center', ...theme.shadow.sm }}>
                  <Text style={{ fontSize: 26 }}>{e}</Text>
                </TouchableOpacity>
              ))}
            </View>
            {profile?.status_emoji && (
              <TouchableOpacity onPress={() => setStatus(null)} style={{ marginTop: 18, alignSelf: 'center' }}>
                <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 14, color: LK.ink70 }}>Clear status</Text>
              </TouchableOpacity>
            )}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </>
  );
}
