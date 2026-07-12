import React, { useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Animated, { FadeInUp, ReduceMotion } from 'react-native-reanimated';
import { Image } from 'expo-image';
import { LK, theme } from '@/constants/theme';
import { Icon } from '@/components/ui/Icon';
import { RoundIcon } from '@/components/ui/round-icon';
import { ScalePressable } from '@/components/ui/scale-pressable';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { StationeryRules } from '@/components/ui/stationery-rules';
import { Skeleton } from '@/components/ui/Skeleton';
import { usePrivateNotes, type PrivateNote } from '@/hooks/usePrivateNotes';
import { useAuthStore } from '@/stores/auth.store';

// §13.25 empty — calm sticker matches the Us-hub Notes identity (a private, restful space),
// not the letters/envelope art this borrowed before.
const EMPTY_ILLUS = require('../../assets/illustrations/moods/calm.png');

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default function NotesScreen() {
  const profile = useAuthStore((s) => s.profile);
  const { notes, loading, removeNote } = usePrivateNotes();

  const handleDelete = useCallback((note: PrivateNote) => {
    Alert.alert('Delete note?', 'This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => removeNote(note.id),
      },
    ]);
  }, [removeNote]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: LK.parchment }} edges={['top']}>
      {/* Custom in-screen header — the root TransitionNativeStack renders native
          headers (headerRight/back) as empty white circles (§10.13 GOTCHA 1), so
          we use the standard ScreenHeader (RoundIcon back + right action). */}
      <ScreenHeader
        eyebrow="Private"
        title="My Notes"
        onBack={() => router.back()}
        right={
          <RoundIcon onPress={() => router.push('/notes/compose')}>
            <Icon name="pen" size={20} color={LK.espresso} />
          </RoundIcon>
        }
      />

      {/* Private indicator eyebrow */}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: 22, paddingTop: 8, paddingBottom: 8 }}>
        <Image source="sf:lock.fill" style={{ width: 11, height: 11 }} contentFit="contain" tintColor={LK.faded} />
        <Text style={{ fontFamily: theme.fonts.body, fontSize: 11, color: LK.faded }}>
          private — only you can see this
        </Text>
      </View>

      {loading ? (
        <SkeletonList />
      ) : notes.length === 0 ? (
        <EmptyState />
      ) : (
        <FlatList
          data={notes}
          keyExtractor={(n) => n.id}
          contentContainerStyle={{ paddingHorizontal: 20, paddingTop: 8, paddingBottom: 80, gap: 12 }}
          contentInsetAdjustmentBehavior="automatic"
          showsVerticalScrollIndicator={false}
          renderItem={({ item: note, index }) => (
            <Animated.View entering={index < 10 ? FadeInUp.duration(280).delay(index * 30).reduceMotion(ReduceMotion.System) : undefined}>
              <NoteCard
                note={note}
                onEdit={() => router.push({ pathname: '/notes/compose', params: { id: note.id } })}
                onDelete={() => handleDelete(note)}
              />
            </Animated.View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

function NoteCard({
  note,
  onEdit,
  onDelete,
}: {
  note: PrivateNote;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const preview = note.content.trim().split('\n').slice(0, 2).join(' ').slice(0, 120);
  const date = formatDate(note.created_at);

  return (
    <ScalePressable
      onPress={onEdit}
      scaleTo={0.98}
      haptic={false}
      accessibilityLabel={`Note: ${preview}`}
    >
      <View
        style={{
          backgroundColor: LK.ivory,
          borderRadius: 20,
          borderCurve: 'continuous',
          borderWidth: 1.5,
          borderColor: 'rgba(42,33,26,0.10)',
          overflow: 'hidden',
          minHeight: 96,
          ...theme.shadow.card,
        }}
      >
        {/* Faint stationery rules at 30% opacity */}
        <StationeryRules opacity={0.3} leftMargin={0} />

        <View style={{ padding: 16 }}>
          {/* Top row: date + lock badge */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <Text
              style={{
                fontFamily: theme.fonts.body,
                fontWeight: '500',
                fontSize: 12,
                color: LK.faded,
              }}
            >
              {date}
            </Text>
            <Image
              source="sf:lock.fill"
              style={{ width: 12, height: 12 }}
              contentFit="contain"
              tintColor={LK.sepia}
            />
          </View>

          {/* Preview text — Newsreader Italic */}
          <Text
            numberOfLines={2}
            style={{
              fontFamily: theme.fonts.serif,
              fontStyle: 'italic',
              fontSize: 14,
              color: LK.sepia,
              lineHeight: 21,
            }}
          >
            {preview}
          </Text>

          {/* Delete button */}
          <ScalePressable
            onPress={onDelete}
            scaleTo={0.88}
            haptic={false}
            hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
            containerStyle={{ position: 'absolute', bottom: 14, right: 16 }}
            accessibilityLabel="Delete note"
          >
            <Icon name="trash" size={14} color={LK.faded} />
          </ScalePressable>
        </View>
      </View>
    </ScalePressable>
  );
}

function EmptyState() {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40, gap: 20 }}>
      <Image
        source={EMPTY_ILLUS}
        style={{ width: 120, height: 120 }}
        contentFit="contain"
      />
      <View style={{ alignItems: 'center', gap: 8 }}>
        <Text
          style={{
            fontFamily: theme.fonts.heading,
            fontWeight: '700',
            fontSize: 22,
            color: LK.espresso,
            textAlign: 'center',
          }}
        >
          Just for you
        </Text>
        <Text
          style={{
            fontFamily: theme.fonts.hand,
            fontSize: 18,
            color: LK.sepia,
            textAlign: 'center',
          }}
        >
          a private space for your thoughts
        </Text>
      </View>
      <ScalePressable
        onPress={() => router.push('/notes/compose')}
        scaleTo={0.97}
        accessibilityLabel="Write something"
        style={{
          backgroundColor: LK.coral,
          borderRadius: 9999,
          paddingHorizontal: 32,
          paddingVertical: 14,
        }}
      >
        <Text
          style={{
            fontFamily: theme.fonts.body,
            fontWeight: '700',
            fontSize: 15,
            color: '#fff',
          }}
        >
          Write something
        </Text>
      </ScalePressable>
    </View>
  );
}

function SkeletonCard() {
  return (
    <View
      style={{
        backgroundColor: LK.ivory,
        borderRadius: 20,
        borderCurve: 'continuous',
        borderWidth: 1.5,
        borderColor: 'rgba(42,33,26,0.08)',
        height: 96,
        overflow: 'hidden',
        ...theme.shadow.card,
      }}
    >
      <StationeryRules opacity={0.2} leftMargin={0} />
      <View style={{ padding: 16, gap: 10 }}>
        <Skeleton width={80} height={10} radius={5} />
        <Skeleton width="90%" height={12} radius={6} />
        <Skeleton width="65%" height={12} radius={6} />
      </View>
    </View>
  );
}

function SkeletonList() {
  return (
    <View style={{ paddingHorizontal: 20, paddingTop: 8, gap: 12 }}>
      {[0, 1, 2].map((i) => <SkeletonCard key={i} />)}
    </View>
  );
}
