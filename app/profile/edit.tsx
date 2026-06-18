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
import { useSelfPerson } from '@/hooks/useSelfPerson';
import { usePartner } from '@/hooks/usePartner';
import { useAuthStore } from '@/stores/auth.store';
import { supabase } from '@/lib/supabase';
import type { Person } from '@/stores/details.store';

export default function EditProfileScreen() {
  const params = useLocalSearchParams<{ person?: string }>();
  const person: Person = params.person === 'partner' ? 'partner' : 'me';
  const { selfPerson } = useSelfPerson();
  // "isMe" means this card is the VIEWER's own profile (edits name + avatar on
  // their profiles row), which is their resolved self-slot — not the literal
  // 'me' slot, since the non-anchor partner owns the 'partner' slot.
  const isMe = person === selfPerson;

  const { profile } = useAuth();
  const { partner } = usePartner();
  const partnerName = partner?.display_name || 'your partner';
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
  // Questions the partner asked (to answer on your own card) vs. your own extra details.
  const askedOfMe = custom.filter((d) => d.is_question);
  const myExtras = custom.filter((d) => !d.is_question);

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
      // Editing your own card → it's a self-detail; editing partner's → a question.
      await upsertDetail({ coupleId, person, key, label: q, value: null, is_question: !isMe });
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
    <SafeAreaView style={{ flex: 1, backgroundColor: LK.parchment }}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 22, paddingTop: 16, paddingBottom: 12 }}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 15.5, color: LK.ink70 }}>Cancel</Text>
          </TouchableOpacity>
          <Text numberOfLines={1} style={{ fontFamily: theme.fonts.heading, fontWeight: '700', fontSize: 18, color: LK.espresso, maxWidth: 200 }}>
            {isMe ? 'Edit Profile' : `Ask ${partnerName}`}
          </Text>
          {isMe ? (
            <TouchableOpacity onPress={handleSave} disabled={saving}>
              {saving
                ? <ActivityIndicator color={LK.espresso} />
                : <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 15.5, color: LK.espresso }}>Save</Text>}
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={() => router.back()}>
              <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 15.5, color: LK.espresso }}>Done</Text>
            </TouchableOpacity>
          )}
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 22, paddingBottom: 60 }}>
          {isMe ? (
            <>
              {/* Avatar */}
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
                  <View style={{ position: 'absolute', right: 0, bottom: 0, width: 32, height: 32, borderRadius: 16, backgroundColor: LK.espresso, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: LK.parchment }}>
                    {uploading ? <ActivityIndicator size="small" color="#fff" /> : <Icon name="camera" size={15} color="#fff" />}
                  </View>
                </TouchableOpacity>
                <Text style={{ fontFamily: theme.fonts.body, fontSize: 12.5, color: LK.ink70, marginTop: 8 }}>Tap to change photo</Text>
              </View>

              {/* Name */}
              <SectionLabel>Name</SectionLabel>
              <TextInput
                value={name}
                onChangeText={setName}
                placeholder="Your name"
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

              {/* Your own extra details */}
              {myExtras.map((d) => (
                <View key={d.id} style={{ marginBottom: 14 }}>
                  <FieldLabel icon="help" label={d.label} />
                  <TextInput
                    defaultValue={d.value ?? ''}
                    onEndEditing={(e) => coupleId && upsertDetail({ coupleId, person, key: d.key, label: d.label, value: e.nativeEvent.text.trim() || null })}
                    placeholder="Add yours…"
                    placeholderTextColor={LK.ink70}
                    style={inputStyle}
                  />
                </View>
              ))}

              {/* Questions your partner asked you — answer them here */}
              {askedOfMe.length > 0 && (
                <>
                  <SectionLabel style={{ marginTop: 10 }}>{partnerName} asked you</SectionLabel>
                  {askedOfMe.map((d) => (
                    <View key={d.id} style={{ marginBottom: 14 }}>
                      <FieldLabel icon="sparkle" label={d.label} />
                      <TextInput
                        defaultValue={d.value ?? ''}
                        onEndEditing={(e) => coupleId && upsertDetail({ coupleId, person, key: d.key, label: d.label, value: e.nativeEvent.text.trim() || null })}
                        placeholder="Your answer…"
                        placeholderTextColor={LK.ink70}
                        style={inputStyle}
                      />
                    </View>
                  ))}
                </>
              )}

              {/* Add a detail about yourself */}
              <SectionLabel style={{ marginTop: 10 }}>Add a detail</SectionLabel>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TextInput
                  value={customQ}
                  onChangeText={setCustomQ}
                  placeholder="e.g. Favourite restaurant"
                  placeholderTextColor={LK.ink70}
                  style={[inputStyle, { flex: 1, marginBottom: 0 }]}
                />
                <TouchableOpacity
                  onPress={addQuestion}
                  disabled={!customQ.trim()}
                  style={{ backgroundColor: customQ.trim() ? LK.espresso : 'rgba(42,33,26,0.15)', borderRadius: 16, paddingHorizontal: 18, alignItems: 'center', justifyContent: 'center' }}
                >
                  <Icon name="plus" size={20} color={customQ.trim() ? '#fff' : LK.ink70} />
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              {/* Ask-only view of the partner — their facts are read-only */}
              <Text style={{ fontFamily: theme.fonts.body, fontSize: 14, color: LK.ink70, lineHeight: 21, marginBottom: 18 }}>
                You can ask {partnerName} anything — they'll answer it on their own profile. Their details are kept by them.
              </Text>

              {/* Read-only facts they've shared */}
              <SectionLabel>What {partnerName} has shared</SectionLabel>
              <View style={{ backgroundColor: LK.ivory, borderRadius: 16, paddingHorizontal: 14, paddingVertical: 4, marginBottom: 22, ...theme.shadow.sm }}>
                {DETAIL_DEFS.map((def, i) => {
                  const v = detailValue(def.key);
                  return (
                    <View key={def.key} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 11, borderTopWidth: i === 0 ? 0 : 1, borderTopColor: 'rgba(42,33,26,0.06)' }}>
                      <Icon name={def.icon} size={15} color={LK.ink70} />
                      <Text style={{ fontFamily: theme.fonts.body, fontSize: 13.5, color: LK.ink70, flex: 1 }}>{def.label}</Text>
                      <Text numberOfLines={1} style={{ fontFamily: theme.fonts.body, fontWeight: '600', fontSize: 13.5, color: v ? LK.espresso : LK.ink70, maxWidth: 160 }}>
                        {v || '—'}
                      </Text>
                    </View>
                  );
                })}
              </View>

              {/* Questions you've asked — with their answer or a waiting state */}
              {askedOfMe.length > 0 && (
                <>
                  <SectionLabel>Questions you asked</SectionLabel>
                  {askedOfMe.map((d) => (
                    <View key={d.id} style={{ backgroundColor: LK.ivory, borderRadius: 16, padding: 14, marginBottom: 10, ...theme.shadow.sm }}>
                      <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 14, color: LK.espresso, marginBottom: 4 }}>{d.label}</Text>
                      <Text style={{ fontFamily: theme.fonts.body, fontSize: 13.5, color: d.value ? LK.ink70 : shade(LK.marigold, 0.5), fontStyle: d.value ? 'normal' : 'italic' }}>
                        {d.value || `Waiting for ${partnerName} to answer…`}
                      </Text>
                    </View>
                  ))}
                </>
              )}

              {/* Ask a new question */}
              <SectionLabel style={{ marginTop: 10 }}>Ask a question</SectionLabel>
              <View style={{ flexDirection: 'row', gap: 8 }}>
                <TextInput
                  value={customQ}
                  onChangeText={setCustomQ}
                  placeholder="e.g. What's your dream trip?"
                  placeholderTextColor={LK.ink70}
                  style={[inputStyle, { flex: 1, marginBottom: 0 }]}
                />
                <TouchableOpacity
                  onPress={addQuestion}
                  disabled={!customQ.trim()}
                  style={{ backgroundColor: customQ.trim() ? LK.espresso : 'rgba(42,33,26,0.15)', borderRadius: 16, paddingHorizontal: 18, alignItems: 'center', justifyContent: 'center' }}
                >
                  <Icon name="plus" size={20} color={customQ.trim() ? '#fff' : LK.ink70} />
                </TouchableOpacity>
              </View>
            </>
          )}
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
        <ColorChipPicker colors={def.colors!} value={value} onChange={onChange} multiSelect={def.multiSelect} />
      ) : def.type === 'chips' ? (
        <ChipPicker options={def.options!} value={value} onChange={onChange} multiSelect={!!def.multiSelect} allowOther={def.allowOther} />
      ) : def.type === 'multi-chips' ? (
        <ChipPicker options={def.options!} value={value} onChange={onChange} multiSelect allowOther={def.allowOther} />
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

function ChipPicker({ options, value, onChange, multiSelect, allowOther }: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
  multiSelect: boolean;
  allowOther?: boolean;
}) {
  const knownOptions = options;
  const allSelected = value ? value.split(',').map((s) => s.trim()).filter(Boolean) : [];
  const selected = allSelected.filter((s) => knownOptions.includes(s));
  const otherValues = allSelected.filter((s) => !knownOptions.includes(s));
  const [otherText, setOtherText] = React.useState(otherValues.join(', '));
  const [showOther, setShowOther] = React.useState(otherValues.length > 0);

  function toggle(opt: string) {
    let next: string[];
    if (multiSelect) {
      next = selected.includes(opt) ? selected.filter((s) => s !== opt) : [...selected, opt];
    } else {
      next = selected[0] === opt ? [] : [opt];
    }
    const combined = [...next, ...otherValues].join(', ');
    onChange(combined);
  }

  function commitOther(text: string) {
    const trimmed = text.trim();
    const combined = [...selected, ...(trimmed ? [trimmed] : [])].join(', ');
    onChange(combined);
  }

  return (
    <View style={{ gap: 10 }}>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
        {options.map((opt) => {
          const active = selected.includes(opt);
          return (
            <TouchableOpacity
              key={opt}
              onPress={() => toggle(opt)}
              activeOpacity={0.75}
              style={{
                paddingHorizontal: 14, paddingVertical: 8, borderRadius: 9999,
                backgroundColor: active ? LK.espresso : LK.ivory,
                borderWidth: 1.5,
                borderColor: active ? LK.espresso : 'rgba(42,33,26,0.12)',
              }}
            >
              <Text style={{ fontFamily: theme.fonts.body, fontWeight: '600', fontSize: 13, color: active ? '#fff' : LK.espresso }}>
                {opt}
              </Text>
            </TouchableOpacity>
          );
        })}
        {allowOther && (
          <TouchableOpacity
            onPress={() => setShowOther((s) => !s)}
            activeOpacity={0.75}
            style={{
              paddingHorizontal: 14, paddingVertical: 8, borderRadius: 9999,
              backgroundColor: showOther ? tint(LK.marigold, 0.6) : LK.ivory,
              borderWidth: 1.5,
              borderColor: showOther ? shade(LK.marigold, 0.2) : 'rgba(42,33,26,0.12)',
            }}
          >
            <Text style={{ fontFamily: theme.fonts.body, fontWeight: '600', fontSize: 13, color: showOther ? shade(LK.marigold, 0.5) : LK.ink70 }}>
              Other…
            </Text>
          </TouchableOpacity>
        )}
      </View>
      {showOther && (
        <TextInput
          value={otherText}
          onChangeText={setOtherText}
          onBlur={() => commitOther(otherText)}
          placeholder="Type your own answer…"
          placeholderTextColor={LK.ink70}
          style={inputStyle}
          autoFocus
        />
      )}
    </View>
  );
}

// ─── Color swatch picker ──────────────────────────────────────────────────────

function ColorChipPicker({ colors, value, onChange, multiSelect }: {
  colors: { label: string; hex: string }[];
  value: string;
  onChange: (v: string) => void;
  multiSelect?: boolean;
}) {
  const selected = value ? value.split(',').map((s) => s.trim()).filter(Boolean) : [];

  function toggle(label: string) {
    if (multiSelect) {
      const next = selected.includes(label) ? selected.filter((s) => s !== label) : [...selected, label];
      onChange(next.join(', '));
    } else {
      onChange(selected[0] === label ? '' : label);
    }
  }

  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
      {colors.map((c) => {
        const active = selected.includes(c.label);
        const isLight = ['White', 'Nude', 'Yellow'].includes(c.label);
        return (
          <TouchableOpacity key={c.label} onPress={() => toggle(c.label)} activeOpacity={0.8} style={{ alignItems: 'center', gap: 4 }}>
            <View style={{
              width: 40, height: 40, borderRadius: 20,
              backgroundColor: c.hex,
              borderWidth: active ? 3 : 1.5,
              borderColor: active ? LK.espresso : 'rgba(42,33,26,0.12)',
              alignItems: 'center', justifyContent: 'center',
            }}>
              {active && <Icon name="check" size={16} color={isLight ? LK.espresso : '#fff'} />}
            </View>
            <Text style={{ fontFamily: theme.fonts.body, fontSize: 10, color: active ? LK.espresso : LK.ink70, fontWeight: active ? '700' : '400' }}>
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
  color: LK.espresso,
  marginBottom: 4,
  ...theme.shadow.sm,
} as const;
