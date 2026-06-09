import React, { useMemo, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, SafeAreaView, Image, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { decode as decodeBase64 } from 'base64-arraybuffer';
import { LK, tint, shade, theme } from '@/constants/theme';
import { Icon } from '@/components/ui/Icon';
import { DETAIL_DEFS } from '@/constants/categories';
import { useAuth } from '@/hooks/useAuth';
import { useDetails } from '@/hooks/useDetails';
import { useAuthStore } from '@/stores/auth.store';
import { supabase } from '@/lib/supabase';
import type { Person } from '@/stores/details.store';

export default function EditProfileScreen() {
  const params = useLocalSearchParams<{ person?: string }>();
  const person: Person = params.person === 'partner' ? 'partner' : 'me';
  const isMe = person === 'me';

  const { profile } = useAuth();
  const { details, upsertDetail } = useDetails();
  const coupleId = profile?.couple_id ?? null;

  const personDetails = useMemo(() => details.filter((d) => d.person === person), [details, person]);
  const detailValue = (key: string) => personDetails.find((d) => d.key === key)?.value ?? '';

  const [name, setName] = useState(isMe ? (profile?.display_name ?? '') : (detailValue('name') || ''));
  const [values, setValues] = useState<Record<string, string>>(() => {
    const v: Record<string, string> = {};
    for (const def of DETAIL_DEFS) v[def.key] = detailValue(def.key);
    return v;
  });
  const [customQ, setCustomQ] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  const custom = personDetails.filter((d) => !DETAIL_DEFS.some((def) => def.key === d.key) && d.key !== 'name');

  async function handleSave() {
    if (!coupleId) {
      Alert.alert('Setting up', 'Your shared space is still loading. Try again in a moment.');
      return;
    }
    setSaving(true);
    try {
      if (isMe) {
        await supabase.from('profiles').update({ display_name: name.trim() || null }).eq('id', profile!.id);
        await useAuthStore.getState().fetchProfile(profile!.id);
      } else {
        await upsertDetail({ coupleId, person, key: 'name', label: 'Name', value: name.trim() || null });
      }
      for (const def of DETAIL_DEFS) {
        const val = (values[def.key] ?? '').trim();
        await upsertDetail({ coupleId, person, key: def.key, label: def.label, value: val || null });
      }
      router.back();
    } catch (e: any) {
      Alert.alert('Could not save', e?.message ?? 'Unknown error');
    } finally {
      setSaving(false);
    }
  }

  async function addQuestion() {
    const q = customQ.trim();
    if (!q || !coupleId) return;
    const key = `q_${q.toLowerCase().replace(/[^a-z0-9]+/g, '_').slice(0, 30)}_${Math.random().toString(36).slice(2, 6)}`;
    try {
      await upsertDetail({ coupleId, person, key, label: q, value: null, is_question: true });
      setCustomQ('');
    } catch (e: any) {
      Alert.alert('Could not add', e?.message ?? 'Unknown error');
    }
  }

  async function pickPhoto() {
    if (!isMe || !profile?.id) return;
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Permission needed', 'Allow photo access to set a profile picture.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
      base64: true,
    });
    if (result.canceled || !result.assets?.[0]?.base64) return;
    setUploading(true);
    try {
      // Decode base64 → ArrayBuffer. (fetch().blob() uploads a 0-byte file in RN.)
      const arrayBuffer = decodeBase64(result.assets[0].base64);
      const path = `${profile.id}/avatar_${Date.now()}.jpg`;
      const { error: upErr } = await supabase.storage.from('avatars').upload(path, arrayBuffer, {
        contentType: 'image/jpeg',
        upsert: true,
      });
      if (upErr) throw new Error(upErr.message);
      const { data: pub } = supabase.storage.from('avatars').getPublicUrl(path);
      // Cache-bust so the new image is fetched immediately.
      const publicUrl = `${pub.publicUrl}?t=${Date.now()}`;
      await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', profile.id);
      await useAuthStore.getState().fetchProfile(profile.id);
    } catch (e: any) {
      Alert.alert('Upload failed', e?.message ?? 'Unknown error');
    } finally {
      setUploading(false);
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: LK.cream }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 22, paddingTop: 16, paddingBottom: 12 }}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 15.5, color: LK.ink70 }}>Cancel</Text>
          </TouchableOpacity>
          <Text style={{ fontFamily: theme.fonts.heading, fontWeight: '700', fontSize: 18, color: LK.ink }}>
            {isMe ? 'Edit Profile' : "Partner's Details"}
          </Text>
          <TouchableOpacity onPress={handleSave} disabled={saving}>
            {saving
              ? <ActivityIndicator color={LK.ink} />
              : <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 15.5, color: LK.ink }}>Save</Text>}
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 22, paddingBottom: 60 }}>
          {/* Avatar (me only) */}
          {isMe && (
            <View style={{ alignItems: 'center', marginBottom: 20 }}>
              <TouchableOpacity onPress={pickPhoto} activeOpacity={0.85}>
                {profile?.avatar_url ? (
                  <Image source={{ uri: profile.avatar_url }} style={{ width: 96, height: 96, borderRadius: 48 }} />
                ) : (
                  <View style={{ width: 96, height: 96, borderRadius: 48, backgroundColor: LK.coral, alignItems: 'center', justifyContent: 'center' }}>
                    <Text style={{ fontFamily: theme.fonts.heading, fontWeight: '700', fontSize: 40, color: '#fff' }}>
                      {((name || 'Y').charAt(0) || 'Y').toUpperCase()}
                    </Text>
                  </View>
                )}
                <View style={{ position: 'absolute', right: 0, bottom: 0, width: 32, height: 32, borderRadius: 16, backgroundColor: LK.ink, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: LK.cream }}>
                  {uploading ? <ActivityIndicator size="small" color="#fff" /> : <Icon name="camera" size={15} color="#fff" />}
                </View>
              </TouchableOpacity>
              <Text style={{ fontFamily: theme.fonts.body, fontSize: 12.5, color: LK.ink70, marginTop: 8 }}>Tap to change photo</Text>
            </View>
          )}

          {/* Name */}
          <FieldLabel>Name</FieldLabel>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder={isMe ? 'Your name' : "Partner's name"}
            placeholderTextColor={LK.ink70}
            style={inputStyle}
          />

          {/* Detail fields */}
          <Text style={{ fontFamily: theme.fonts.body, fontSize: 12, fontWeight: '800', letterSpacing: 0.8, textTransform: 'uppercase', color: LK.ink70, marginTop: 20, marginBottom: 10 }}>
            The little things
          </Text>
          {DETAIL_DEFS.map((def) => (
            <View key={def.key} style={{ marginBottom: 14 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <Icon name={def.icon} size={16} color={LK.ink70} />
                <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 13.5, color: LK.ink70 }}>{def.label}</Text>
              </View>
              <TextInput
                value={values[def.key]}
                onChangeText={(t) => setValues((v) => ({ ...v, [def.key]: t }))}
                placeholder={isMe ? 'Add yours…' : 'Fill in or leave blank to ask'}
                placeholderTextColor={LK.ink70}
                style={inputStyle}
              />
            </View>
          ))}

          {/* Custom questions already added */}
          {custom.length > 0 && (
            <>
              <Text style={{ fontFamily: theme.fonts.body, fontSize: 12, fontWeight: '800', letterSpacing: 0.8, textTransform: 'uppercase', color: LK.ink70, marginTop: 10, marginBottom: 10 }}>
                Questions
              </Text>
              {custom.map((d) => (
                <View key={d.id} style={{ marginBottom: 14 }}>
                  <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 13.5, color: LK.ink70, marginBottom: 6 }}>{d.label}</Text>
                  <TextInput
                    defaultValue={d.value ?? ''}
                    onEndEditing={(e) => coupleId && upsertDetail({ coupleId, person, key: d.key, label: d.label, value: e.nativeEvent.text.trim() || null })}
                    placeholder={d.is_question ? 'Their answer…' : 'Answer…'}
                    placeholderTextColor={LK.ink70}
                    style={inputStyle}
                  />
                </View>
              ))}
            </>
          )}

          {/* Add a question */}
          <Text style={{ fontFamily: theme.fonts.body, fontSize: 12, fontWeight: '800', letterSpacing: 0.8, textTransform: 'uppercase', color: LK.ink70, marginTop: 10, marginBottom: 10 }}>
            {isMe ? 'Add a detail' : 'Ask a question'}
          </Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TextInput
              value={customQ}
              onChangeText={setCustomQ}
              placeholder={isMe ? 'e.g. Shoe size' : "e.g. What's your dream trip?"}
              placeholderTextColor={LK.ink70}
              style={[inputStyle, { flex: 1, marginBottom: 0 }]}
            />
            <TouchableOpacity
              onPress={addQuestion}
              disabled={!customQ.trim()}
              style={{ backgroundColor: customQ.trim() ? LK.ink : 'rgba(42,33,26,0.15)', borderRadius: 16, paddingHorizontal: 18, alignItems: 'center', justifyContent: 'center' }}
            >
              <Icon name="plus" size={20} color={customQ.trim() ? '#fff' : LK.ink70} />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const inputStyle = {
  backgroundColor: LK.ivory,
  borderRadius: 16,
  padding: 14,
  fontFamily: theme.fonts.body,
  fontSize: 16,
  color: LK.ink,
  marginBottom: 4,
  ...theme.shadow.sm,
} as const;

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <Text style={{ fontFamily: theme.fonts.body, fontSize: 12, fontWeight: '800', letterSpacing: 0.8, textTransform: 'uppercase', color: LK.ink70, marginBottom: 8 }}>
      {children}
    </Text>
  );
}
