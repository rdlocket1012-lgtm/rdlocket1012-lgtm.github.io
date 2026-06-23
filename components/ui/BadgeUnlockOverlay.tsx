import React from 'react';
import { SendMomentOverlay } from '@/components/ui/send-moment-overlay';
import { ConfettiShower } from '@/components/ui/ConfettiShower';
import type { StreakBadge } from '@/constants/streak-achievements';

/**
 * Celebration shown when a new streak badge unlocks: the `streak-milestone`
 * mascot over a Parchment overlay, with a confetti burst raining on top. Reuses
 * SendMomentOverlay's self-dismiss timing (one mascot loop, tap to skip).
 */
export function BadgeUnlockOverlay({ badge, onDismiss }: {
  badge: StreakBadge | null;
  onDismiss: () => void;
}) {
  return (
    <>
      {/* Confetti sits above the overlay's Parchment backdrop (zIndex 100). */}
      {badge && <ConfettiShower zIndex={101} colors={[badge.accent, '#FF7A6B', '#FFC94D', '#FF9EC4']} />}
      <SendMomentOverlay
        visible={!!badge}
        name="streak-milestone"
        message={badge ? `${badge.title} unlocked!` : ''}
        subMessage={badge ? `${badge.blurb} — what a run together` : undefined}
        onDismiss={onDismiss}
      />
    </>
  );
}
