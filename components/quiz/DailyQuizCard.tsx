import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, Alert, Modal } from 'react-native';
import { Image } from 'expo-image';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { LK, tint, shade, theme } from '@/constants/theme';
import { Icon } from '@/components/ui/Icon';
import { DoodleBackground } from '@/components/ui/doodle-background';
import { useQuiz } from '@/hooks/useQuiz';
import { useQuizStreak } from '@/hooks/useQuizStreak';
import { usePartner } from '@/hooks/usePartner';
import { resolveQuiz, resolveComments } from '@/stores/quiz.store';
import { QUIZ_QUESTIONS, LETTERS } from '@/constants/quiz-questions';

const OPTION_COLORS = [LK.coral, LK.marigold, LK.lilac, LK.success];
const CATEGORY_LABEL: Record<string, string> = { casual: 'Just for fun', romantic: 'Cozy & sweet', deep: 'Know them deeper' };

export function DailyQuizCard({ hideStreak = false }: { hideStreak?: boolean }) {
  const { today, submit, comment } = useQuiz();
  const streak = useQuizStreak();
  const { partner } = usePartner();
  const partnerName = partner?.display_name?.split(' ')[0] || 'your partner';

  const [step, setStep] = useState<'self' | 'guess'>('self');
  const [selfPick, setSelfPick] = useState<string | null>(null);
  const [guessPick, setGuessPick] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [commentDraft, setCommentDraft] = useState('');
  const [savingComment, setSavingComment] = useState(false);

  // One-time "how it works" explainer (shown before the first answer ever).
  const [showIntro, setShowIntro] = useState(false);
  useEffect(() => {
    AsyncStorage.getItem('quiz_intro_seen_v1').then((seen) => {
      if (!seen) setShowIntro(true);
    });
  }, []);
  function dismissIntro() {
    setShowIntro(false);
    AsyncStorage.setItem('quiz_intro_seen_v1', '1').catch(() => {});
  }

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

  return (
    <View style={{ paddingHorizontal: theme.layout.screenX, paddingTop: 22 }}>
      <View
        style={{
          backgroundColor: LK.vellum,
          borderRadius: 28,
          borderCurve: 'continuous',
          borderWidth: 2,
          borderColor: LK.lilac,
          overflow: 'hidden',
          transform: [{ rotate: '1.5deg' }],
          boxShadow: '0 4px 16px rgba(42,33,26,0.10), 0 1px 3px rgba(42,33,26,0.06)',
        } as any}
      >
        <DoodleBackground group="lilac" density="medium" />
        <View style={{ padding: 18 }}>
        {/* Eyebrow: category + history — keeps the title row clean */}
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 }}>
          <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 11, letterSpacing: 1, textTransform: 'uppercase', color: shade(LK.lilac, 0.5) }}>
            {CATEGORY_LABEL[q.category]}
          </Text>
          <TouchableOpacity onPress={() => router.push('/quiz/history')} hitSlop={{ top: 13, bottom: 13, left: 13, right: 13 }} accessibilityLabel="Quiz history">
            <Image source="sf:clock.arrow.circlepath" style={{ width: 18, height: 18 }} contentFit="contain" tintColor={LK.faded} />
          </TouchableOpacity>
        </View>

        {/* Title */}
        <Text style={{ fontFamily: theme.fonts.heading, fontWeight: '800', fontSize: 20, color: LK.espresso }}>Daily Match</Text>

        {/* Gentle, guilt-free streak line (carries the 🔥 — no duplicate chip).
            Hidden on Home, where the dedicated Zone C streak row shows it instead (§9.3). */}
        {!hideStreak && <StreakLine streak={streak} partnerName={partnerName} />}

        {/* Prominent phase banner so it's always clear WHAT you're answering */}
        {selecting && (
          <PhaseBanner
            choosingGuess={choosingGuess}
            partnerName={partnerName}
            selfPickText={optText(selfPick)}
          />
        )}

        <Text style={{ fontFamily: theme.fonts.body, fontWeight: '500', fontSize: 17, color: LK.espresso, lineHeight: 26, textAlign: 'center', marginTop: selecting ? 12 : 6, marginBottom: selecting ? 12 : 14 }}>
          {selecting && choosingGuess ? `Which one will ${partnerName} pick?` : q.prompt}
        </Text>

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
                <Text style={{ flex: 1, fontFamily: theme.fonts.body, fontWeight: '600', fontSize: 13.5, color: LK.espresso, lineHeight: 18 }}>{opt}</Text>

                {/* Selection markers */}
                {isSelfPick && <Badge text="Your answer" c={c} />}
                {isGuessPick && <Badge text={`${partnerName}?`} c={c} />}

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
                ? `Tap the answer you think ${partnerName} will pick.`
                : 'Step 1 of 2 — your honest answer stays hidden until you both finish.'}
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
                <View style={{ backgroundColor: both ? tint(LK.success, 0.6) : either ? tint(LK.marigold, 0.55) : tint(LK.warning, 0.6), borderRadius: 14, padding: 14, alignItems: 'center' }}>
                  <Text style={{ fontFamily: theme.fonts.heading, fontWeight: '800', fontSize: 19, color: LK.espresso, textAlign: 'center' }}>{headline}</Text>
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
                  style={{ flex: 1, backgroundColor: LK.parchment, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 11, fontFamily: theme.fonts.body, fontSize: 14, color: LK.espresso }}
                />
                <TouchableOpacity
                  onPress={saveComment}
                  disabled={!commentDraft.trim() || savingComment}
                  style={{ backgroundColor: commentDraft.trim() ? LK.espresso : 'rgba(42,33,26,0.15)', borderRadius: 14, paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center' }}
                >
                  <Icon name="arrowR" size={18} color={commentDraft.trim() ? '#fff' : LK.ink70} />
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
        </View>
      </View>

      {/* One-time "how it works" explainer */}
      <QuizIntroModal visible={showIntro} partnerName={partnerName} onClose={dismissIntro} />
    </View>
  );
}

function PhaseBanner({ choosingGuess, partnerName, selfPickText }: { choosingGuess: boolean; partnerName: string; selfPickText: string }) {
  const c = choosingGuess ? LK.sky : LK.coral;
  return (
    <View style={{ backgroundColor: tint(c, 0.62), borderRadius: 14, padding: 12, marginTop: 10 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <View style={{ width: 30, height: 30, borderRadius: 15, backgroundColor: c, alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontFamily: theme.fonts.body, fontWeight: '800', fontSize: 13, color: shade(c, 0.55) }}>
            {choosingGuess ? '2' : '1'}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: theme.fonts.body, fontWeight: '800', fontSize: 11, letterSpacing: 0.6, textTransform: 'uppercase', color: shade(c, 0.55) }}>
            Step {choosingGuess ? '2' : '1'} of 2
          </Text>
          <Text style={{ fontFamily: theme.fonts.heading, fontWeight: '800', fontSize: 15, color: LK.espresso, marginTop: 1 }}>
            {choosingGuess ? `Now guess ${partnerName}'s answer` : 'First, your own answer'}
          </Text>
        </View>
      </View>
      <Text style={{ fontFamily: theme.fonts.body, fontSize: 12.5, color: LK.ink70, lineHeight: 18, marginTop: 7 }}>
        {choosingGuess
          ? `You answered for yourself — now pick what you think ${partnerName} chose. You'll both see how well you know each other.`
          : `Pick what's true for YOU. Next you'll guess what ${partnerName} picks.`}
      </Text>
      {choosingGuess && !!selfPickText && (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 8, backgroundColor: LK.ivory, borderRadius: 10, paddingHorizontal: 10, paddingVertical: 7 }}>
          <Icon name="check" size={13} color={shade(LK.success, 0.5)} />
          <Text style={{ flex: 1, fontFamily: theme.fonts.body, fontSize: 12, color: LK.ink70 }}>
            Your answer: <Text style={{ fontWeight: '700', color: LK.espresso }}>{selfPickText}</Text>
          </Text>
        </View>
      )}
    </View>
  );
}

function QuizIntroModal({ visible, partnerName, onClose }: { visible: boolean; partnerName: string; onClose: () => void }) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={{ flex: 1, backgroundColor: 'rgba(20,15,10,0.45)', justifyContent: 'center', paddingHorizontal: 26 }}>
        <View style={{ backgroundColor: LK.parchment, borderRadius: 24, padding: 22 }}>
          <Text style={{ fontFamily: theme.fonts.heading, fontWeight: '800', fontSize: 21, color: LK.espresso, textAlign: 'center' }}>
            How the Daily Match works 🧠
          </Text>
          <Text style={{ fontFamily: theme.fonts.body, fontSize: 13.5, color: LK.ink70, textAlign: 'center', marginTop: 6, lineHeight: 20 }}>
            Two quick taps for each question:
          </Text>

          <View style={{ gap: 11, marginTop: 16 }}>
            <IntroStep
              n="1" c={LK.coral}
              title="Answer for yourself"
              body="Pick the option that's honestly true for you."
            />
            <IntroStep
              n="2" c={LK.sky}
              title={`Guess ${partnerName}`}
              body={`Pick what you think ${partnerName} will choose.`}
            />
          </View>

          <Text style={{ fontFamily: theme.fonts.body, fontSize: 12.5, color: LK.ink70, textAlign: 'center', marginTop: 14, lineHeight: 18 }}>
            Once you've both finished, you'll see how well you guessed each other 💛
          </Text>

          <TouchableOpacity
            onPress={onClose}
            activeOpacity={0.85}
            style={{ backgroundColor: LK.espresso, borderRadius: 9999, paddingVertical: 14, alignItems: 'center', marginTop: 18 }}
          >
            <Text style={{ fontFamily: theme.fonts.body, fontWeight: '800', fontSize: 15.5, color: '#fff' }}>Got it</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

function IntroStep({ n, c, title, body }: { n: string; c: string; title: string; body: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: tint(c, 0.62), borderRadius: 16, padding: 13 }}>
      <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: c, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontFamily: theme.fonts.body, fontWeight: '800', fontSize: 15, color: shade(c, 0.55) }}>{n}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={{ fontFamily: theme.fonts.heading, fontWeight: '800', fontSize: 15, color: LK.espresso }}>{title}</Text>
        <Text style={{ fontFamily: theme.fonts.body, fontSize: 12.5, color: LK.ink70, marginTop: 1, lineHeight: 17 }}>{body}</Text>
      </View>
    </View>
  );
}

function Badge({ text, c }: { text: string; c: string }) {
  return (
    <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 11, color: shade(c, 0.5) }}>{text}</Text>
  );
}

/**
 * Warm, guilt-free streak line. Never scolds or uses red/break states — a miss
 * is quietly "saved" by a freeze, and zero-streak is a gentle invitation.
 */
function StreakLine({ streak, partnerName }: { streak: { current: number; best: number; todayDone: boolean; freezeActive: boolean; loading: boolean }; partnerName: string }) {
  if (streak.loading) return null;

  const active = streak.current > 0;

  let body: string;
  if (!active) {
    body = `Answer today to start a streak with ${partnerName}`;
  } else if (streak.todayDone) {
    body = `${streak.current} ${streak.current === 1 ? 'day' : 'days'} connected — you're both on it`;
  } else {
    body = `${streak.current}-day streak — answer today to keep it glowing`;
  }

  return (
    <View style={{ marginTop: 6, marginBottom: 2, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      <Image
        source={require('../../assets/doodles/flame.svg')}
        style={{ width: 14, height: 14 }}
        contentFit="contain"
        tintColor={active ? LK.coral : LK.faded}
      />
      <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 12.5, color: shade(active ? LK.coral : LK.sepia, 0.3), lineHeight: 18, flex: 1 }}>
        {body}
      </Text>
    </View>
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
    <View style={{ backgroundColor: LK.parchment, borderRadius: 14, padding: 12 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 4 }}>
        <View style={{ width: 18, height: 18, borderRadius: 9, backgroundColor: right ? LK.success : 'rgba(42,33,26,0.18)', alignItems: 'center', justifyContent: 'center' }}>
          <Icon name={right ? 'check' : 'x'} size={11} color={right ? '#fff' : LK.ink70} />
        </View>
        <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 12.5, color: LK.espresso }}>{label}</Text>
        <Text style={{ fontFamily: theme.fonts.body, fontWeight: '700', fontSize: 11.5, color: right ? shade(LK.success, 0.5) : LK.ink70, marginLeft: 'auto' }}>
          {right ? 'Spot on!' : 'Missed'}
        </Text>
      </View>
      <Text style={{ fontFamily: theme.fonts.body, fontSize: 12.5, color: LK.ink70, lineHeight: 18 }}>
        Guessed <Text style={{ fontWeight: '700', color: LK.espresso }}>{guessText || '—'}</Text>
        {!right && (
          <Text> · {actualWho} actually picked <Text style={{ fontWeight: '700', color: LK.espresso }}>{actualText || '—'}</Text></Text>
        )}
      </Text>
    </View>
  );
}
