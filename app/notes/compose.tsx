import React, { useState, useRef, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  Alert,
} from 'react-native';
import { Stack, router, useLocalSearchParams } from 'expo-router';
import { LK, theme } from '@/constants/theme';
import { StationeryRules } from '@/components/ui/stationery-rules';
import { usePrivateNotes, type NoteTag, NOTE_TAGS } from '@/hooks/usePrivateNotes';

export default function NoteComposeScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { notes, addNote, updateNote } = usePrivateNotes();

  const existing = id ? notes.find((n) => n.id === id) ?? null : null;

  const [content, setContent] = useState(existing?.content ?? '');
  const [tag, setTag] = useState<NoteTag | null>(existing?.tag ?? null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Refs so the stable `save` callback always reads the latest values without
  // needing them as deps (which would recreate `save` on every keystroke and
  // trigger expo-router's useNavigationCache infinite setOptions loop).
  const contentRef = useRef(content);
  contentRef.current = content;
  const tagRef = useRef(tag);
  tagRef.current = tag;

  // Auto-save on 1-second debounce while editing an existing note
  const autoSave = useCallback(
    (text: string, t: NoteTag | null) => {
      if (!existing) return;
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        updateNote(existing.id, text, t);
      }, 1000);
    },
    [existing, updateNote],
  );

  function handleContentChange(text: string) {
    setContent(text);
    autoSave(text, tag);
  }

  function handleTagChange(t: NoteTag | null) {
    setTag(t);
    autoSave(content, t);
  }

  // Stable save — reads content/tag from refs so it never needs to change due
  // to typing, which would otherwise recreate headerRight every keystroke.
  const save = useCallback(async () => {
    const trimmed = contentRef.current.trim();
    if (!trimmed) { router.back(); return; }
    if (saveTimer.current) clearTimeout(saveTimer.current);
    try {
      if (existing) {
        await updateNote(existing.id, trimmed, tagRef.current);
      } else {
        await addNote(trimmed, tagRef.current);
      }
      router.back();
    } catch (e: any) {
      Alert.alert('Could not save note', e?.message ?? 'Please try again in a moment.');
    }
  }, [existing, addNote, updateNote]);

  const canSave = content.trim().length > 0;

  const headerLeft = useCallback(() => (
    <TouchableOpacity
      onPress={() => router.back()}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      accessibilityLabel="Dismiss"
    >
      <Text style={{ fontFamily: theme.fonts.body, fontWeight: '600', fontSize: 16, color: LK.sepia }}>
        Cancel
      </Text>
    </TouchableOpacity>
  ), []);

  const headerRight = useCallback(() => (
    <TouchableOpacity
      onPress={save}
      disabled={!canSave}
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      accessibilityLabel="Save note"
    >
      <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 16, color: canSave ? LK.coral : LK.faded }}>
        Save
      </Text>
    </TouchableOpacity>
  ), [save, canSave]);

  const screenOptions = useMemo(() => ({
    title: existing ? 'Edit note' : 'New note',
    headerShown: true,
    headerShadowVisible: false,
    headerStyle: { backgroundColor: LK.ivory },
    headerTintColor: LK.espresso,
    headerBackTitle: '',
    headerLeft,
    headerRight,
  }), [existing, headerLeft, headerRight]);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: LK.ivory }}
      behavior={process.env.EXPO_OS === 'ios' ? 'padding' : undefined}
    >
      <Stack.Screen options={screenOptions} />

      {/* Tag selector — pinned at the top */}
      <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 12 }}>
        <Text
          style={{
            fontFamily: theme.fonts.body,
            fontWeight: '700',
            fontSize: 11,
            letterSpacing: 1,
            textTransform: 'uppercase',
            color: LK.faded,
            marginBottom: 10,
          }}
        >
          Category
        </Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          {NOTE_TAGS.map((t) => {
            const on = tag === t.id;
            return (
              <TouchableOpacity
                key={t.id}
                onPress={() => handleTagChange(on ? null : t.id)}
                style={{
                  backgroundColor: on ? t.color : 'rgba(42,33,26,0.06)',
                  borderRadius: 9999,
                  paddingHorizontal: 14,
                  paddingVertical: 8,
                }}
                accessibilityLabel={t.label}
              >
                <Text
                  style={{
                    fontFamily: theme.fonts.body,
                    fontWeight: '700',
                    fontSize: 13,
                    color: on ? '#fff' : LK.sepia,
                  }}
                >
                  {t.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* StationeryRules writing surface — fills the remaining space above the keyboard.
          The TextInput itself scrolls internally as content grows, so we don't wrap
          this in an outer ScrollView (which fought the keyboard auto-scroll and hid
          the cursor). */}
      <View style={{ flex: 1, marginHorizontal: 20, marginBottom: 16, borderRadius: 16, borderCurve: 'continuous', overflow: 'hidden' }}>
        <StationeryRules leftMargin={44} />
        <TextInput
          value={content}
          onChangeText={handleContentChange}
          multiline
          autoFocus={!existing}
          placeholder="Write anything — gift ideas, little observations, things you want to remember…"
          placeholderTextColor={LK.faded}
          style={{
            flex: 1,
            fontFamily: theme.fonts.serif,
            fontStyle: 'italic',
            fontSize: 16,
            color: LK.espresso,
            lineHeight: 28,
            paddingHorizontal: 52,
            paddingTop: 14,
            paddingBottom: 24,
            textAlignVertical: 'top',
          }}
        />
      </View>
    </KeyboardAvoidingView>
  );
}
