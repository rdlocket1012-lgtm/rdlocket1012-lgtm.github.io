import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView, SafeAreaView,
  TextInput, Modal, KeyboardAvoidingView, Platform, Alert,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { LK, tint, shade, theme } from '@/constants/theme';
import { Icon } from '@/components/ui/Icon';
import { FadeSlideIn } from '@/components/ui/FadeSlideIn';
import { usePrivateNotes, NOTE_TAGS, type NoteTag, type PrivateNote } from '@/hooks/usePrivateNotes';

export default function NotesScreen() {
  const { notes, loading, addNote, removeNote, updateNote } = usePrivateNotes();
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<PrivateNote | null>(null);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: LK.parchment }}>
      {/* Header */}
      <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 22, paddingTop: 14, paddingBottom: 10, gap: 12 }}>
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(42,33,26,0.06)', alignItems: 'center', justifyContent: 'center' }}
        >
          <Icon name="chevL" size={20} color={LK.espresso} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: theme.fonts.heading, fontWeight: '700', fontSize: 24, color: LK.espresso, letterSpacing: -0.5 }}>My Notes</Text>
          <Text style={{ fontFamily: theme.fonts.body, fontSize: 12.5, color: LK.ink70, marginTop: 1 }}>Just for your eyes 🔒</Text>
        </View>
        <TouchableOpacity
          onPress={() => { setEditing(null); setShowModal(true); }}
          style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: LK.espresso, alignItems: 'center', justifyContent: 'center' }}
        >
          <Icon name="plus" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={LK.ink70} />
        </View>
      ) : notes.length === 0 ? (
        <EmptyState onPress={() => setShowModal(true)} />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 20, paddingBottom: 40, gap: 12 }}>
          {notes.map((note, i) => (
            <FadeSlideIn key={note.id} delay={i * 40}>
              <NoteCard
                note={note}
                onEdit={() => { setEditing(note); setShowModal(true); }}
                onDelete={() => {
                  Alert.alert('Delete note?', 'This cannot be undone.', [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Delete', style: 'destructive', onPress: () => removeNote(note.id) },
                  ]);
                }}
              />
            </FadeSlideIn>
          ))}
        </ScrollView>
      )}

      {showModal && (
        <NoteModal
          initial={editing}
          onClose={() => { setShowModal(false); setEditing(null); }}
          onSave={(content, tag) => {
            if (editing) {
              updateNote(editing.id, content, tag);
            } else {
              addNote(content, tag);
            }
            setShowModal(false);
            setEditing(null);
          }}
        />
      )}
    </SafeAreaView>
  );
}

// ─── Note Card ────────────────────────────────────────────────────────────────
function NoteCard({ note, onEdit, onDelete }: { note: PrivateNote; onEdit: () => void; onDelete: () => void }) {
  const tagDef = NOTE_TAGS.find((t) => t.id === note.tag);
  const date = new Date(note.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <View style={{ backgroundColor: LK.ivory, borderRadius: theme.radii.lg, padding: 16, ...theme.shadow.card }}>
      {tagDef && (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 8 }}>
          <View style={{ backgroundColor: tint(tagDef.color, 0.75), borderRadius: 9999, paddingHorizontal: 10, paddingVertical: 4 }}>
            <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 11.5, color: shade(tagDef.color, 0.4), letterSpacing: 0.3 }}>
              {tagDef.label}
            </Text>
          </View>
        </View>
      )}
      <Text style={{ fontFamily: theme.fonts.body, fontSize: 15.5, color: LK.espresso, lineHeight: 23 }}>{note.content}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12, justifyContent: 'space-between' }}>
        <Text style={{ fontFamily: theme.fonts.body, fontSize: 11.5, color: LK.ink70 }}>{date}</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity onPress={onEdit} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Icon name="pen" size={16} color={LK.ink70} />
          </TouchableOpacity>
          <TouchableOpacity onPress={onDelete} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Icon name="trash" size={16} color={LK.ink70} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyState({ onPress }: { onPress: () => void }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 36 }}>
      <View style={{ width: 72, height: 72, borderRadius: 36, backgroundColor: tint(LK.marigold, 0.6), alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
        <Icon name="lock" size={32} color={shade(LK.marigold, 0.45)} />
      </View>
      <Text style={{ fontFamily: theme.fonts.heading, fontWeight: '700', fontSize: 20, color: LK.espresso, textAlign: 'center', marginBottom: 10 }}>
        Your private space
      </Text>
      <Text style={{ fontFamily: theme.fonts.body, fontSize: 14.5, color: LK.ink70, textAlign: 'center', lineHeight: 22, maxWidth: 270, marginBottom: 28 }}>
        Gift ideas, little observations, things you want to remember about her — all yours, completely private.
      </Text>
      <TouchableOpacity
        onPress={onPress}
        style={{ backgroundColor: LK.espresso, borderRadius: 9999, paddingHorizontal: 28, paddingVertical: 14 }}
      >
        <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 15.5, color: '#fff' }}>Add your first note</Text>
      </TouchableOpacity>
    </View>
  );
}

// ─── Compose/Edit Modal ───────────────────────────────────────────────────────
function NoteModal({
  initial,
  onClose,
  onSave,
}: {
  initial: PrivateNote | null;
  onClose: () => void;
  onSave: (content: string, tag: NoteTag | null) => void;
}) {
  const [content, setContent] = useState(initial?.content ?? '');
  const [tag, setTag] = useState<NoteTag | null>(initial?.tag ?? null);

  return (
    <Modal animationType="slide" transparent>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1, justifyContent: 'flex-end' }}>
        <TouchableOpacity style={{ flex: 1, backgroundColor: 'rgba(20,15,10,0.4)' }} onPress={onClose} activeOpacity={1} />
        <View style={{ backgroundColor: LK.parchment, borderTopLeftRadius: 30, borderTopRightRadius: 30 }}>
          {/* Handle */}
          <View style={{ paddingTop: 14, paddingBottom: 6, alignItems: 'center' }}>
            <View style={{ width: 38, height: 5, borderRadius: 9999, backgroundColor: 'rgba(42,33,26,0.15)' }} />
          </View>

          {/* Title row */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 22, paddingBottom: 14 }}>
            <TouchableOpacity onPress={onClose} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 15.5, color: LK.ink70 }}>Cancel</Text>
            </TouchableOpacity>
            <Text style={{ fontFamily: theme.fonts.heading, fontWeight: '700', fontSize: 18, color: LK.espresso }}>
              {initial ? 'Edit note' : 'New note'}
            </Text>
            <TouchableOpacity
              onPress={() => { if (content.trim()) onSave(content.trim(), tag); }}
              disabled={!content.trim()}
              style={{ backgroundColor: content.trim() ? LK.espresso : 'rgba(42,33,26,0.15)', borderRadius: 9999, paddingHorizontal: 18, paddingVertical: 10 }}
            >
              <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 14.5, color: content.trim() ? '#fff' : LK.ink70 }}>Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingHorizontal: 22, paddingBottom: 40 }}>
            {/* Tag selector */}
            <Text style={{ fontFamily: theme.fonts.body, fontWeight: '800', fontSize: 11.5, letterSpacing: 0.9, textTransform: 'uppercase', color: LK.ink70, marginBottom: 10 }}>
              Category
            </Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 18 }}>
              {NOTE_TAGS.map((t) => {
                const on = tag === t.id;
                return (
                  <TouchableOpacity
                    key={t.id}
                    onPress={() => setTag(on ? null : t.id)}
                    style={{
                      backgroundColor: on ? tint(t.color, 0.55) : tint(t.color, 0.82),
                      borderRadius: 9999, paddingHorizontal: 13, paddingVertical: 9,
                      borderWidth: on ? 1.5 : 0,
                      borderColor: on ? shade(t.color, 0.3) : 'transparent',
                    }}
                  >
                    <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 13, color: shade(t.color, 0.45) }}>
                      {t.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Content */}
            <Text style={{ fontFamily: theme.fonts.body, fontWeight: '800', fontSize: 11.5, letterSpacing: 0.9, textTransform: 'uppercase', color: LK.ink70, marginBottom: 10 }}>
              Note
            </Text>
            <TextInput
              value={content}
              onChangeText={setContent}
              multiline
              autoFocus
              placeholder="Write anything — a gift idea, something she mentioned, a little detail you want to remember…"
              placeholderTextColor={LK.ink70}
              style={{
                backgroundColor: LK.ivory,
                borderRadius: 16,
                padding: 16,
                fontFamily: theme.fonts.body,
                fontSize: 15.5,
                color: LK.espresso,
                lineHeight: 24,
                minHeight: 140,
                textAlignVertical: 'top',
                ...theme.shadow.sm,
              }}
            />
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
