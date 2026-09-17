import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { LK, tint, shade, theme } from '@/constants/theme';
import { Skeleton } from '@/components/ui/Skeleton';
import { Icon } from '@/components/ui/Icon';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { ScalePressable } from '@/components/ui/scale-pressable';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/auth.store';
import { usePartner } from '@/hooks/usePartner';
import { QuizRow, resolveQuiz, resolveComments } from '@/stores/quiz.store';
import { QUIZ_QUESTIONS, LETTERS } from '@/constants/quiz-questions';

const OPTION_COLORS = [LK.coral, LK.marigold, LK.lilac, LK.success];
const EMPTY_QUIZ_ILLUS = require('../../assets/illustrations/mascot/guessing.png');
const CATEGORY_LABEL: Record<string, string> = {
  casual: 'Just for fun',
  romantic: 'Cozy & sweet',
  deep: 'Know them deeper',
};

function formatDate(iso: string) {
  const d = new Date(iso);
  return d.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'long' });
}

function isToday(iso: string) {
  const today = new Date();
  const d = new Date(iso);
  return d.getFullYear() === today.getFullYear() &&
    d.getMonth() === today.getMonth() &&
    d.getDate() === today.getDate();
}

function optText(q: typeof QUIZ_QUESTIONS[number], letter: string | null) {
  if (!letter) return '—';
  const i = (LETTERS as readonly string[]).indexOf(letter);
  return i >= 0 ? q.options[i] : '—';
}

function HistoryCard({ row, partnerName }: { row: QuizRow; partnerName: string }) {
  const q = QUIZ_QUESTIONS[row.question_id % QUIZ_QUESTIONS.length];
  if (!q) return null;

  const r = resolveQuiz(row);
  const { myComment, partnerComment } = resolveComments(row);
  const today = isToday(row.quiz_date);

  return (
    <View style={{ backgroundColor: LK.ivory, borderRadius: theme.radii.lg, borderCurve: 'continuous', borderWidth: 1.5, borderColor: LK.hairline, padding: 18, marginBottom: 14, ...theme.shadow.card }}>
      {/* Date + category */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 12.5, color: LK.ink70 }}>
          {today ? 'Today' : formatDate(row.quiz_date)}
        </Text>
        <View style={{ backgroundColor: tint(LK.marigold, 0.7), borderRadius: 9999, paddingHorizontal: 9, paddingVertical: 3 }}>
          <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 11, color: shade(LK.marigold, 0.45) }}>
            {CATEGORY_LABEL[q.category] ?? q.category}
          </Text>
        </View>
      </View>

      {/* Question */}
      <Text style={{ fontFamily: theme.fonts.serif, fontStyle: 'italic', fontSize: 16, color: LK.espresso, lineHeight: 24, marginBottom: 14 }}>
        {q.prompt}
      </Text>

      {!r.bothSubmitted ? (
        <Text style={{ fontFamily: theme.fonts.body, fontSize: 12.5, color: LK.ink70 }}>
          {r.iSubmitted ? `Waiting for ${partnerName} to finish.` : r.partnerSubmitted ? 'You haven\'t answered this one.' : 'Neither of you answered.'}
        </Text>
      ) : (
        <View style={{ gap: 8 }}>
          <ResultRow
            label={`You guessed ${partnerName}`}
            right={r.iGuessedRight}
            line={r.iGuessedRight
              ? `Right — ${optText(q, r.partnerSelf)}`
              : `Guessed ${optText(q, r.myGuess)} · they picked ${optText(q, r.partnerSelf)}`}
          />
          <ResultRow
            label={`${partnerName} guessed you`}
            right={r.partnerGuessedRight}
            line={r.partnerGuessedRight
              ? `Right — ${optText(q, r.mySelf)}`
              : `Guessed ${optText(q, r.partnerGuess)} · you picked ${optText(q, r.mySelf)}`}
          />
        </View>
      )}

      {/* Comments */}
      {(myComment || partnerComment) && (
        <View style={{ marginTop: 12, gap: 6 }}>
          {myComment && (
            <View style={{ flexDirection: 'row', gap: 7, alignItems: 'flex-start' }}>
              <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 11, color: LK.ink70, marginTop: 3 }}>You</Text>
              <Text style={{ flex: 1, fontFamily: theme.fonts.serif, fontStyle: 'italic', fontSize: 13.5, color: LK.ink70, lineHeight: 20 }}>"{myComment}"</Text>
            </View>
          )}
          {partnerComment && (
            <View style={{ flexDirection: 'row', gap: 7, alignItems: 'flex-start' }}>
              <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 11, color: LK.ink70, marginTop: 3 }}>{partnerName}</Text>
              <Text style={{ flex: 1, fontFamily: theme.fonts.serif, fontStyle: 'italic', fontSize: 13.5, color: LK.ink70, lineHeight: 20 }}>"{partnerComment}"</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

function ResultRow({ label, right, line }: { label: string; right: boolean; line: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 9, backgroundColor: tint(right ? LK.success : LK.warning, 0.4), borderRadius: 12, paddingHorizontal: 12, paddingVertical: 9 }}>
      <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: right ? LK.success : 'rgba(42,33,26,0.18)', alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={right ? 'check' : 'x'} size={12} color={right ? '#fff' : LK.ink70} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 12, color: LK.espresso }}>{label}</Text>
        <Text style={{ fontFamily: theme.fonts.body, fontSize: 11.5, color: LK.ink70, lineHeight: 16 }}>{line}</Text>
      </View>
    </View>
  );
}

export default function QuizHistoryScreen() {
  const profile = useAuthStore((s) => s.profile);
  const { partner } = usePartner();
  const partnerName = partner?.display_name?.split(' ')[0] || 'Partner';
  const [rows, setRows] = useState<QuizRow[]>([]);
  const [loading, setLoading] = useState(true);
  // A failed fetch used to fall through to "No quizzes yet" — which tells a
  // couple with months of history that they have none. Say what happened instead.
  const [failed, setFailed] = useState(false);

  const load = useCallback(() => {
    const coupleId = profile?.couple_id;
    if (!coupleId) return;
    setLoading(true);
    setFailed(false);
    supabase
      .from('daily_quiz')
      .select('*')
      .eq('couple_id', coupleId)
      .order('quiz_date', { ascending: false })
      .limit(60)
      .then(({ data, error }) => {
        if (error) setFailed(true);
        else setRows((data ?? []) as QuizRow[]);
        setLoading(false);
      }, () => { setFailed(true); setLoading(false); });
  }, [profile?.couple_id]);

  useEffect(() => { load(); }, [load]);

  const completed = rows.map(resolveQuiz);
  const bothDone = completed.filter(r => r.bothSubmitted).length;
  const youKnew = completed.filter(r => r.iGuessedRight).length;
  const theyKnew = completed.filter(r => r.partnerGuessedRight).length;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: LK.parchment }} edges={['top']}>
      <ScreenHeader eyebrow="Daily Match" title="Quiz History" onBack={() => router.back()} />

      {/* Stats strip */}
      {!loading && !failed && rows.length > 0 && (
        <View style={{ flexDirection: 'row', gap: 10, paddingHorizontal: theme.layout.screenX, paddingTop: 16, paddingBottom: 14 }}>
          {[
            { label: 'Both done', value: bothDone },
            { label: 'You knew them', value: youKnew },
            { label: `${partnerName} knew you`, value: theyKnew },
          ].map(({ label, value }) => (
            <View key={label} style={{ flex: 1, backgroundColor: LK.ivory, borderRadius: 16, borderCurve: 'continuous', borderWidth: 1.5, borderColor: LK.hairline, padding: 12, alignItems: 'center', ...theme.shadow.sm }}>
              <Text style={{ fontFamily: theme.fonts.heading, fontWeight: '800', fontSize: 22, color: LK.espresso }}>{value}</Text>
              <Text numberOfLines={2} style={{ fontFamily: theme.fonts.body, fontSize: 12, color: LK.ink70, marginTop: 2, textAlign: 'center' }}>{label}</Text>
            </View>
          ))}
        </View>
      )}

      {loading ? (
        // Sized like the real stats strip + history cards so nothing jumps on load.
        <View style={{ paddingHorizontal: theme.layout.screenX, paddingTop: 16, gap: 14 }}>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            {[0, 1, 2].map((i) => <View key={i} style={{ flex: 1 }}><Skeleton height={68} radius={16} /></View>)}
          </View>
          {[0, 1, 2].map((i) => <Skeleton key={i} height={176} radius={theme.radii.lg} />)}
        </View>
      ) : failed ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40, gap: 14 }}>
          <Text style={{ fontFamily: theme.fonts.body, fontSize: 15, color: LK.ink70, textAlign: 'center', lineHeight: 22 }}>
            Couldn’t load your quiz history. Check your connection.
          </Text>
          <ScalePressable
            onPress={load}
            accessibilityRole="button"
            style={{ borderRadius: 9999, borderWidth: 1.5, borderColor: LK.espresso, paddingHorizontal: 22, minHeight: 44, justifyContent: 'center' }}
          >
            <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 15, color: LK.espresso }}>Try again</Text>
          </ScalePressable>
        </View>
      ) : rows.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40, gap: 14 }}>
          <View style={{ width: 120, height: 120, borderRadius: 60, backgroundColor: tint(LK.lilac, 0.75), alignItems: 'center', justifyContent: 'center', transform: [{ rotate: '4deg' }] }}>
            <Image source={EMPTY_QUIZ_ILLUS} style={{ width: 92, height: 92 }} contentFit="contain" accessible={false} />
          </View>
          <Text style={{ fontFamily: theme.fonts.heading, fontWeight: '700', fontSize: 22, color: LK.espresso, textAlign: 'center' }}>
            No quizzes yet
          </Text>
          <Text style={{ fontFamily: theme.fonts.hand, fontSize: 18, color: LK.sepia, textAlign: 'center', lineHeight: 24, maxWidth: 260 }}>
            every answer you both give lands here
          </Text>
          <ScalePressable
            onPress={() => router.navigate('/(tabs)')}
            accessibilityRole="button"
            style={{ backgroundColor: LK.coral, borderRadius: 9999, paddingHorizontal: 24, minHeight: 48, justifyContent: 'center' }}
          >
            <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 15, color: '#fff' }}>Answer today's quiz</Text>
          </ScalePressable>
        </View>
      ) : (
        <FlatList
          data={rows}
          keyExtractor={(row) => row.id}
          renderItem={({ item }) => <HistoryCard row={item} partnerName={partnerName} />}
          contentInsetAdjustmentBehavior="automatic"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: theme.layout.screenX, paddingTop: 4, paddingBottom: 40 }}
        />
      )}
    </SafeAreaView>
  );
}
