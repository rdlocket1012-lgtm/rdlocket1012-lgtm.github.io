import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, SafeAreaView, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { LK, tint, shade, theme } from '@/constants/theme';
import { Icon } from '@/components/ui/Icon';
import { ScreenHeader } from '@/components/ui/ScreenHeader';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/auth.store';
import { usePartner } from '@/hooks/usePartner';
import { QuizRow, resolveQuiz, resolveComments } from '@/stores/quiz.store';
import { QUIZ_QUESTIONS, LETTERS } from '@/constants/quiz-questions';

const OPTION_COLORS = [LK.coral, LK.gold, LK.lilac, LK.mint];
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
    <View style={{ backgroundColor: LK.ivory, borderRadius: theme.radii.lg, padding: 18, marginBottom: 14, ...theme.shadow.card }}>
      {/* Date + category */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 12.5, color: LK.ink70 }}>
          {today ? 'Today' : formatDate(row.quiz_date)}
        </Text>
        <View style={{ backgroundColor: tint(LK.gold, 0.7), borderRadius: 9999, paddingHorizontal: 9, paddingVertical: 3 }}>
          <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 10.5, color: shade(LK.gold, 0.45) }}>
            {CATEGORY_LABEL[q.category] ?? q.category}
          </Text>
        </View>
      </View>

      {/* Question */}
      <Text style={{ fontFamily: theme.fonts.serif, fontStyle: 'italic', fontSize: 16, color: LK.ink, lineHeight: 24, marginBottom: 14 }}>
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
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 9, backgroundColor: tint(right ? LK.mint : LK.amber, 0.4), borderRadius: 12, paddingHorizontal: 12, paddingVertical: 9 }}>
      <View style={{ width: 20, height: 20, borderRadius: 10, backgroundColor: right ? LK.mint : 'rgba(42,33,26,0.18)', alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={right ? 'check' : 'x'} size={12} color={right ? '#fff' : LK.ink70} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 12, color: LK.ink }}>{label}</Text>
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

  useEffect(() => {
    if (!profile?.couple_id) return;
    supabase
      .from('daily_quiz')
      .select('*')
      .eq('couple_id', profile.couple_id)
      .order('quiz_date', { ascending: false })
      .limit(60)
      .then(({ data }) => {
        setRows((data ?? []) as QuizRow[]);
        setLoading(false);
      });
  }, [profile?.couple_id]);

  const completed = rows.map(resolveQuiz);
  const bothDone = completed.filter(r => r.bothSubmitted).length;
  const youKnew = completed.filter(r => r.iGuessedRight).length;
  const theyKnew = completed.filter(r => r.partnerGuessedRight).length;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: LK.cream }}>
      <ScreenHeader eyebrow="Daily Match" title="Quiz History" onBack={() => router.back()} />

      {/* Stats strip */}
      {!loading && rows.length > 0 && (
        <View style={{ flexDirection: 'row', gap: 10, paddingHorizontal: 20, paddingTop: 16, paddingBottom: 14 }}>
          {[
            { label: 'Both done', value: bothDone },
            { label: 'You knew them', value: youKnew },
            { label: `${partnerName} knew you`, value: theyKnew },
          ].map(({ label, value }) => (
            <View key={label} style={{ flex: 1, backgroundColor: LK.ivory, borderRadius: 16, padding: 12, alignItems: 'center', ...theme.shadow.sm }}>
              <Text style={{ fontFamily: theme.fonts.heading, fontWeight: '800', fontSize: 22, color: LK.ink }}>{value}</Text>
              <Text style={{ fontFamily: theme.fonts.body, fontSize: 11, color: LK.ink70, marginTop: 2, textAlign: 'center' }}>{label}</Text>
            </View>
          ))}
        </View>
      )}

      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={LK.ink} />
        </View>
      ) : rows.length === 0 ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 40 }}>
          <Text style={{ fontFamily: theme.fonts.heading, fontWeight: '700', fontSize: 22, color: LK.ink, textAlign: 'center', marginBottom: 10 }}>
            No quizzes yet
          </Text>
          <Text style={{ fontFamily: theme.fonts.body, fontSize: 15, color: LK.ink70, textAlign: 'center', lineHeight: 22 }}>
            Answer today's Daily Match on the home screen — your history will appear here.
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={{ paddingHorizontal: 18, paddingTop: 4, paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
          {rows.map((row) => (
            <HistoryCard key={row.id} row={row} partnerName={partnerName} />
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
