import React, { useMemo, useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView,
  SafeAreaView, Image, Alert, ActivityIndicator,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { decode as decodeBase64 } from 'base64-arraybuffer';
import { LK, tint, shade, theme } from '@/constants/theme';
import { Icon } from '@/components/ui/Icon';
import { DateField } from '@/components/ui/DateField';
import { DETAIL_DEFS, type DetailDef } from '@/constants/categories';
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

  const setValue = (key: string, val: string) => setValues((v) => ({ ...v, [key]: val }));

  const custom = personDetails.filter(
    (d) => !DETAIL_DEFS.some((def) => def.key === d.key) && d.key !== 'name',
  );

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
      const arrayBuffer = decodeBase64(result.assets[0].base64);
      const path = `${profile.id}/avatar_${Date.now()}.jpg`;
      const { error: upErr } = await supabase.storage.from('avatars').upload(path, arrayBuffer, {
        contentType: 'image/jpeg', upsert: true,
      });
      if (upErr) throw new Error(upErr.message);
      const { data: pub } = supabase.storage.from('avatars').getPublicUrl(path);
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
        {/* Header */}
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
            <View style={{ alignItems: 'center', marginBottom: 24 }}>
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
          <SectionLabel>Name</SectionLabel>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder={isMe ? 'Your name' : "Partner's name"}
            placeholderTextColor={LK.ink70}
            style={inputStyle}
          />

          {/* Detail fields */}
          <SectionLabel style={{ marginTop: 20 }}>The little things</SectionLabel>
          {DETAIL_DEFS.map((def) => (
            <DetailField
              key={def.key}
              def={def}
              value={values[def.key] ?? ''}
              onChange={(v) => setValue(def.key, v)}
            />
          ))}

          {/* Custom questions */}
          {custom.length > 0 && (
            <>
              <SectionLabel style={{ marginTop: 10 }}>Questions</SectionLabel>
              {custom.map((d) => (
                <View key={d.id} style={{ marginBottom: 14 }}>
                  <FieldLabel icon="sparkle" label={d.label} />
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
          <SectionLabel style={{ marginTop: 10 }}>{isMe ? 'Add a detail' : 'Ask a question'}</SectionLabel>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TextInput
              value={customQ}
              onChangeText={setCustomQ}
              placeholder={isMe ? 'e.g. Favourite restaurant' : "e.g. What's your dream trip?"}
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

// ─── Smart field router ────────────────────────────────────────────────────────

function DetailField({ def, value, onChange }: { def: DetailDef; value: string; onChange: (v: string) => void }) {
  return (
    <View style={{ marginBottom: 18 }}>
      <FieldLabel icon={def.icon} label={def.label} />
      {def.type === 'date' ? (
        <DateField
          value={value || `${new Date().getFullYear() - 25}-01-01`}
          onChange={onChange}
        />
      ) : def.type === 'color-chips' ? (
        <ColorChipPicker colors={def.colors!} value={value} onChange={onChange} />
      ) : def.type === 'chips' ? (
        <ChipPicker options={def.options!} value={value} onChange={onChange} multiSelect={false} />
      ) : def.type === 'multi-chips' ? (
        <ChipPicker options={def.options!} value={value} onChange={onChange} multiSelect />
      ) : (
        <TextInput
          value={value}
          onChangeText={onChange}
          placeholder={def.placeholder ?? 'Add yours…'}
          placeholderTextColor={LK.ink70}
          style={inputStyle}
        />
      )}
    </View>
  );
}

// ─── Chip picker ──────────────────────────────────────────────────────────────

function ChipPicker({ options, value, onChange, multiSelect }: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
  multiSelect: boolean;
}) {
  const selected = value ? value.split(',').map((s) => s.trim()).filter(Boolean) : [];

  function toggle(opt: string) {
    if (multiSelect) {
      const next = selected.includes(opt)
        ? selected.filter((s) => s !== opt)
        : [...selected, opt];
      onChange(next.join(', '));
    } else {
      onChange(selected[0] === opt ? '' : opt);
    }
  }

  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
      {options.map((opt) => {
        const active = selected.includes(opt);
        return (
          <TouchableOpacity
            key={opt}
            onPress={() => toggle(opt)}
            activeOpacity={0.75}
            style={{
              paddingHorizontal: 14,
              paddingVertical: 8,
              borderRadius: 9999,
              backgroundColor: active ? LK.ink : LK.ivory,
              borderWidth: 1.5,
              borderColor: active ? LK.ink : 'rgba(42,33,26,0.12)',
            }}
          >
            <Text style={{
              fontFamily: theme.fonts.body,
              fontWeight: '600',
              fontSize: 13,
              color: active ? '#fff' : LK.ink,
            }}>
              {opt}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// ─── Color swatch picker ──────────────────────────────────────────────────────

function ColorChipPicker({ colors, value, onChange }: {
  colors: { label: string; hex: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
      {colors.map((c) => {
        const active = value === c.label;
        const isLight = ['White', 'Nude', 'Yellow'].includes(c.label);
        return (
          <TouchableOpacity
            key={c.label}
            onPress={() => onChange(active ? '' : c.label)}
            activeOpacity={0.8}
            style={{ alignItems: 'center', gap: 4 }}
          >
            <View style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: c.hex,
              borderWidth: active ? 3 : 1.5,
              borderColor: active ? LK.ink : 'rgba(42,33,26,0.12)',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              {active && (
                <Icon name="check" size={16} color={isLight ? LK.ink : '#fff'} />
              )}
            </View>
            <Text style={{
              fontFamily: theme.fonts.body,
              fontSize: 10,
              color: active ? LK.ink : LK.ink70,
              fontWeight: active ? '700' : '400',
            }}>
              {c.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// ─── Shared primitives ────────────────────────────────────────────────────────

function FieldLabel({ icon, label }: { icon: string; label: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 8 }}>
      <Icon name={icon} size={15} color={LK.ink70} />
      <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 13.5, color: LK.ink70 }}>
        {label}
      </Text>
    </View>
  );
}

function SectionLabel({ children, style }: { children: React.ReactNode; style?: object }) {
  return (
    <Text style={[{
      fontFamily: theme.fonts.body,
      fontSize: 12,
      fontWeight: '800',
      letterSpacing: 0.8,
      textTransform: 'uppercase',
      color: LK.ink70,
      marginBottom: 12,
    }, style]}>
      {children}
    </Text>
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
