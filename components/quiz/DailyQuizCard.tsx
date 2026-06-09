import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert } from 'react-native';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { LK, tint, shade, theme } from '@/constants/theme';
import { Icon } from '@/components/ui/Icon';
import { useQuiz } from '@/hooks/useQuiz';
import { usePartner } from '@/hooks/usePartner';
import { resolveQuiz, resolveComments } from '@/stores/quiz.store';
import { QUIZ_QUESTIONS, LETTERS } from '@/constants/quiz-questions';

const OPTION_COLORS = [LK.coral, LK.gold, LK.lilac, LK.mint];
const CATEGORY_LABEL: Record<string, string> = { casual: 'Just for fun', romantic: 'Cozy & sweet', deep: 'Know them deeper' };

export function DailyQuizCard() {
  const { today, submit, comment } = useQuiz();
  const { partner } = usePartner();
  const partnerName = partner?.display_name?.split(' ')[0] || 'your partner';

  const [step, setStep] = useState<'self' | 'guess'>('self');
  const [selfPick, setSelfPick] = useState<string | null>(null);
  const [guessPick, setGuessPick] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [commentDraft, setCommentDraft] = useState('');
  const [savingComment, setSavingComment] = useState(false);

  if (!today) return null;
  const q = QUIZ_QUESTIONS[today.question_id % QUIZ_QUESTIONS.length];
  if (!q) return null;

  const r = resolveQuiz(today);
  const { myComment } = resolveComments(today);

  function optText(letter: string | null): string {
    if (!letter) return '';
    const i = (LETTERS as readonly string[]).indexOf(letter);
    return i >= 0 ? q.options[i] : '';
  }

  function tapHaptic() {
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch { /* no-op */ }
  }

  function pickSelf(letter: string) {
    tapHaptic();
    setSelfPick(letter);
    setStep('guess');
  }

  async function pickGuess(letter: string) {
    tapHaptic();
    setGuessPick(letter);
    if (!selfPick) return;
    setSubmitting(true);
    try {
      await submit(selfPick, letter);
    } catch (e: any) {
      setGuessPick(null);
      Alert.alert('Could not save', e?.message ?? 'Try again.');
    } finally {
      setSubmitting(false);
    }
  }

  async function saveComment() {
    if (!commentDraft.trim()) return;
    setSavingComment(true);
    try {
      await comment(commentDraft.trim());
      setCommentDraft('');
    } finally {
      setSavingComment(false);
    }
  }

  // ── Selection phase (current user hasn't submitted both answers) ──
  const selecting = !r.iSubmitted;
  const choosingGuess = step === 'guess';

  const headerSubtitle = selecting
    ? choosingGuess
      ? `Now guess: what will ${partnerName} pick?`
      : 'First — what would you honestly do?'
    : null;

  return (
    <View style={{ paddingHorizontal: theme.layout.screenX, paddingTop: 22 }}>
      <View style={{ backgroundColor: LK.ivory, borderRadius: theme.radii.lg, padding: 18, ...theme.shadow.card }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
          <Text style={{ fontFamily: theme.fonts.heading, fontWeight: '800', fontSize: 18, color: LK.ink }}>Today's Daily Match 🧠</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <View style={{ backgroundColor: tint(LK.gold, 0.7), borderRadius: 9999, paddingHorizontal: 9, paddingVertical: 4 }}>
              <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 10.5, color: shade(LK.gold, 0.45) }}>{CATEGORY_LABEL[q.category]}</Text>
            </View>
            <TouchableOpacity onPress={() => router.push('/quiz/history')} hitSlop={{ top: 13, bottom: 13, left: 13, right: 13 }} accessibilityLabel="Quiz history">
              <Icon name="list" size={18} color={LK.ink70} />
            </TouchableOpacity>
          </View>
        </View>

        <Text style={{ fontFamily: theme.fonts.serif, fontStyle: 'italic', fontSize: 18, color: LK.ink, lineHeight: 26, marginTop: 6, marginBottom: selecting ? 4 : 14 }}>
          {q.prompt}
        </Text>

        {/* Step indicator while selecting */}
        {selecting && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <View style={{ flexDirection: 'row', gap: 5 }}>
              <View style={{ width: 18, height: 5, borderRadius: 3, backgroundColor: !choosingGuess ? LK.ink : 'rgba(42,33,26,0.18)' }} />
              <View style={{ width: 18, height: 5, borderRadius: 3, backgroundColor: choosingGuess ? LK.ink : 'rgba(42,33,26,0.18)' }} />
            </View>
            <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 12.5, color: LK.ink70 }}>
              {headerSubtitle}
            </Text>
          </View>
        )}

        {/* Options */}
        <View style={{ gap: 9 }}>
          {q.options.map((opt, i) => {
            const letter = LETTERS[i];
            const c = OPTION_COLORS[i];

            // Selection-phase highlighting
            const isSelfPick = selecting && selfPick === letter;
            const isGuessPick = selecting && choosingGuess && guessPick === letter;

            // Reveal-phase markers
            const showReveal = r.bothSubmitted;
            const isMySelf = showReveal && r.mySelf === letter;
            const isPartnerSelf = showReveal && r.partnerSelf === letter;

            const highlighted = isSelfPick || isGuessPick || isMySelf || isPartnerSelf;
            const disabled = !selecting || submitting;

            return (
              <TouchableOpacity
                key={letter}
                disabled={disabled}
                onPress={() => (choosingGuess ? pickGuess(letter) : pickSelf(letter))}
                activeOpacity={0.85}
                style={{
                  flexDirection: 'row', alignItems: 'center', gap: 11,
                  backgroundColor: highlighted ? tint(c, 0.6) : tint(c, 0.84),
                  borderRadius: 16, padding: 13,
                  borderWidth: highlighted ? 2 : 0, borderColor: highlighted ? c : 'transparent',
                  opacity: !selecting && !isMySelf && !isPartnerSelf ? 0.55 : 1,
                }}
              >
                <View style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: c, alignItems: 'center', justifyContent: 'center' }}>
                  <Text style={{ fontFamily: theme.fonts.body, fontWeight: '800', fontSize: 12.5, color: shade(c, 0.55) }}>{letter}</Text>
                </View>
                <Text style={{ flex: 1, fontFamily: theme.fonts.body, fontWeight: '600', fontSize: 13.5, color: LK.ink, lineHeight: 18 }}>{opt}</Text>

                {/* Selection markers */}
                {isSelfPick && <Badge text="You" c={c} />}
                {isGuessPick && <Badge text={`Guess: ${partnerName}`} c={c} />}

                {/* Reveal markers */}
                {isMySelf && <Badge text="You" c={c} />}
                {isPartnerSelf && !isMySelf && <Badge text={partnerName} c={c} />}
                {isPartnerSelf && isMySelf && <Icon name="heart" size={16} color={shade(c, 0.55)} />}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* ── Status / reveal ── */}
        {selecting ? (
          <Text style={{ fontFamily: theme.fonts.body, fontSize: 12.5, color: LK.ink70, textAlign: 'center', marginTop: 13 }}>
            {submitting
              ? 'Saving…'
              : choosingGuess
                ? `Pick what you think ${partnerName} will choose.`
                : 'Your answers stay hidden until you both finish.'}
          </Text>
        ) : !r.bothSubmitted ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 7, marginTop: 14, backgroundColor: tint(LK.sky, 0.7), borderRadius: 14, paddingVertical: 11 }}>
            <Icon name="lock" size={15} color={shade(LK.sky, 0.5)} />
            <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 13, color: shade(LK.sky, 0.55) }}>
              Locked in — waiting for {partnerName}…
            </Text>
          </View>
        ) : (
          <View style={{ marginTop: 14 }}>
            {/* Headline */}
            {(() => {
              const both = r.iGuessedRight && r.partnerGuessedRight;
              const either = r.iGuessedRight || r.partnerGuessedRight;
              const headline = both ? 'You really know each other! 💛' : either ? 'Nice — one of you nailed it! ✨' : 'Tricky one today 😄';
              const sub = both
                ? 'You both guessed each other right.'
                : either
                  ? 'Getting to know each other a little better every day.'
                  : 'Different instincts — that\'s part of the fun.';
              return (
                <View style={{ backgroundColor: both ? tint(LK.mint, 0.6) : either ? tint(LK.gold, 0.55) : tint(LK.amber, 0.6), borderRadius: 14, padding: 14, alignItems: 'center' }}>
                  <Text style={{ fontFamily: theme.fonts.heading, fontWeight: '800', fontSize: 19, color: LK.ink, textAlign: 'center' }}>{headline}</Text>
                  <Text style={{ fontFamily: theme.fonts.body, fontSize: 13, color: LK.ink70, marginTop: 3, textAlign: 'center' }}>{sub}</Text>
                </View>
              );
            })()}

            {/* Guess result rows */}
            <View style={{ gap: 8, marginTop: 12 }}>
              <GuessResult
                label={`Your guess for ${partnerName}`}
                right={r.iGuessedRight}
                guessText={optText(r.myGuess)}
                actualText={optText(r.partnerSelf)}
                actualWho={partnerName}
              />
              <GuessResult
                label={`${partnerName}'s guess for you`}
                right={r.partnerGuessedRight}
                guessText={optText(r.partnerGuess)}
                actualText={optText(r.mySelf)}
                actualWho="you"
              />
            </View>

            {/* Comment snippet */}
            {myComment ? (
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 12, alignItems: 'flex-start' }}>
                <Icon name="chat" size={16} color={LK.ink70} />
                <Text style={{ flex: 1, fontFamily: theme.fonts.serif, fontStyle: 'italic', fontSize: 14.5, color: LK.ink70, lineHeight: 21 }}>"{myComment}"</Text>
              </View>
            ) : (
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 12 }}>
                <TextInput
                  value={commentDraft}
                  onChangeText={setCommentDraft}
                  placeholder="Add a little comment…"
                  placeholderTextColor={LK.ink70}
                  style={{ flex: 1, backgroundColor: LK.cream, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 11, fontFamily: theme.fonts.body, fontSize: 14, color: LK.ink }}
                />
                <TouchableOpacity
                  onPress={saveComment}
                  disabled={!commentDraft.trim() || savingComment}
                  style={{ backgroundColor: commentDraft.trim() ? LK.ink : 'rgba(42,33,26,0.15)', borderRadius: 14, paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center' }}
                >
                  <Icon name="arrowR" size={18} color={commentDraft.trim() ? '#fff' : LK.ink70} />
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
      </View>
    </View>
  );
}

function Badge({ text, c }: { text: string; c: string }) {
  return (
    <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 11, color: shade(c, 0.5) }}>{text}</Text>
  );
}

function GuessResult({ label, right, guessText, actualText, actualWho }: {
  label: string;
  right: boolean;
  guessText: string;
  actualText: string;
  actualWho: string;
}) {
  return (
    <View style={{ backgroundColor: LK.cream, borderRadius: 14, padding: 12 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 4 }}>
        <View style={{ width: 18, height: 18, borderRadius: 9, backgroundColor: right ? LK.mint : 'rgba(42,33,26,0.18)', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name={right ? 'check' : 'x'} size={11} color={right ? '#fff' : LK.ink70} />
        </View>
        <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 12.5, color: LK.ink }}>{label}</Text>
        <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 11.5, color: right ? shade(LK.mint, 0.5) : LK.ink70, marginLeft: 'auto' }}>
          {right ? 'Spot on!' : 'Missed'}
        </Text>
      </View>
      <Text style={{ fontFamily: theme.fonts.body, fontSize: 12.5, color: LK.ink70, lineHeight: 18 }}>
        Guessed <Text style={{ fontWeight: '700', color: LK.ink }}>{guessText || '—'}</Text>
        {!right && (
          <Text> · {actualWho} actually picked <Text style={{ fontWeight: '700', color: LK.ink }}>{actualText || '—'}</Text></Text>
        )}
      </Text>
    </View>
  );
}
