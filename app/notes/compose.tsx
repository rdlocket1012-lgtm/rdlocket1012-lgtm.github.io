import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
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
  const savedRef = useRef(false);

  // Auto-save on 1-second debounce while editing an existing note
  const autoSave = useCallback(
    (text: string, t: NoteTag | null) => {
      if (!existing) return;
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        updateNote(existing.id, text, t);
        savedRef.current = true;
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

  function save() {
    const trimmed = content.trim();
    if (!trimmed) { router.back(); return; }
    if (saveTimer.current) clearTimeout(saveTimer.current);
    if (existing) {
      updateNote(existing.id, trimmed, tag);
    } else {
      addNote(trimmed, tag);
    }
    router.back();
  }

  const canSave = content.trim().length > 0;

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: LK.ivory }} behavior="padding">
      <Stack.Screen
        options={{
          title: existing ? 'Edit note' : 'New note',
          headerShown: true,
          headerShadowVisible: false,
          headerStyle: { backgroundColor: LK.ivory },
          headerTintColor: LK.espresso,
          headerBackTitle: '',
          headerLeft: () => (
            <TouchableOpacity
              onPress={() => router.back()}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityLabel="Dismiss"
            >
              <Text style={{ fontFamily: theme.fonts.body, fontWeight: '600', fontSize: 16, color: LK.sepia }}>
                Cancel
              </Text>
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity
              onPress={save}
              disabled={!canSave}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              accessibilityLabel="Save note"
            >
              <Text
                style={{
                  fontFamily: theme.fonts.body,
                  fontWeight: '700',
                  fontSize: 16,
                  color: canSave ? LK.coral : LK.faded,
                }}
              >
                Save
              </Text>
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Tag selector */}
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

        {/* StationeryRules writing surface */}
        <View style={{ marginHorizontal: 20, borderRadius: 16, borderCurve: 'continuous', overflow: 'hidden', minHeight: 320 }}>
          <StationeryRules leftMargin={44} />
          <TextInput
            value={content}
            onChangeText={handleContentChange}
            multiline
            autoFocus={!existing}
            placeholder="Write anything — gift ideas, little observations, things you want to remember…"
            placeholderTextColor={LK.faded}
            style={{
              fontFamily: theme.fonts.serif,
              fontStyle: 'italic',
              fontSize: 16,
              color: LK.espresso,
              lineHeight: 28,
              paddingHorizontal: 52,
              paddingTop: 14,
              paddingBottom: 24,
              minHeight: 320,
              textAlignVertical: 'top',
            }}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
