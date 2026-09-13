import React from 'react';
import { View } from 'react-native';
import { LK, theme, rgba } from '@/constants/theme';

const RAIL_W = 24;
const DOT = 9;
const DOT_TOP = 20;   // where a node sits relative to its card's top edge
const GAP = 14;       // vertical gap between items

/**
 * The "Today" connector spine (UX_POLISH_PLAN B1).
 *
 * Strings the day's actions onto one dashed rail with node dots, so they read as
 * a single unit rather than three more cards in a stack. Pattern borrowed from
 * Paired's home, which is the clearest solution to "what do I do right now" in
 * this category.
 *
 * Children are laid out in order; falsy children are dropped, so callers can
 * pass conditionals directly and the rail still terminates on the last *visible*
 * item. The rail is drawn per-row (a flex segment from each dot down through the
 * gap) rather than as one absolute line, so it needs no measurement and can't
 * overshoot past the final node.
 *
 * Note: `borderStyle: 'dashed'` may render solid on some Android versions. That
 * degrades to a plain rail, which still reads correctly.
 */
export function TodaySpine({ children }: { children: React.ReactNode }) {
  const items = React.Children.toArray(children).filter(Boolean);
  if (items.length === 0) return null;

  // A spine needs something to connect. With one item (a couple who hasn't
  // paired yet sees only the quiz) a lone dot is just noise — render plain.
  if (items.length === 1) {
    return <View style={{ paddingHorizontal: theme.layout.screenX }}>{items[0]}</View>;
  }

  return (
    <View style={{ paddingHorizontal: theme.layout.screenX }}>
      {items.map((child, i) => {
        const isLast = i === items.length - 1;
        // Prefer the child's own key: when a conditional item (the challenge)
        // drops out, index keys would shift and needlessly remount the rows
        // below it.
        const key = (React.isValidElement(child) && child.key) || i;
        return (
          <View key={key} style={{ flexDirection: 'row', marginTop: i === 0 ? 0 : GAP }}>
            {/* Rail column: spacer → node → connector down into the next gap. */}
            <View style={{ width: RAIL_W, alignItems: 'center' }}>
              <View style={{ height: DOT_TOP }} />
              <View
                style={{
                  width: DOT,
                  height: DOT,
                  borderRadius: DOT / 2,
                  backgroundColor: LK.coral,
                  borderWidth: 2,
                  borderColor: LK.parchment,
                }}
              />
              {!isLast && (
                <View
                  style={{
                    flex: 1,
                    marginTop: 4,
                    marginBottom: -GAP,
                    borderLeftWidth: 1.5,
                    borderLeftColor: rgba(LK.coral, 0.35),
                    borderStyle: 'dashed',
                  }}
                />
              )}
            </View>
            <View style={{ flex: 1, minWidth: 0 }}>{child}</View>
          </View>
        );
      })}
    </View>
  );
}
