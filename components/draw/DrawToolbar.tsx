import React from 'react';
import { View, Text } from 'react-native';
import { LK, theme } from '@/constants/theme';
import { Icon } from '@/components/ui/Icon';
import { ScalePressable } from '@/components/ui/scale-pressable';

// Graduated nib sizes — value is the stroke width, dot is the on-screen preview.
const BRUSH_SIZES: Array<{ label: string; value: number; dot: number }> = [
  { label: 'S', value: 2, dot: 6 },
  { label: 'M', value: 5, dot: 10 },
  { label: 'L', value: 9, dot: 14 },
  { label: 'XL', value: 16, dot: 19 },
];

// Cozy Scrapbook ink set — one warm, one cool, plus the playful accents (§3).
const PALETTE = [LK.espresso, LK.coral, LK.blush, LK.marigold, LK.gold, LK.sage, LK.sky, LK.lilac];

const HAIRLINE = 'rgba(42,33,26,0.15)';

interface Props {
  color: string;
  brushWidth: number;
  erasing: boolean;
  onColorChange: (c: string) => void;
  onBrushChange: (w: number) => void;
  onEraserToggle: () => void;
  onUndo: () => void;
  onClear: () => void;
  /** Redo is optional — when omitted (e.g. the draw-and-guess game) the
   *  redo button is hidden and undo stays always-enabled. */
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
}

/** Round 44pt action button used for eraser / undo / redo / clear. */
function ToolButton({
  name,
  onPress,
  active,
  disabled,
  flip,
  label,
}: {
  name: string;
  onPress: () => void;
  active?: boolean;
  disabled?: boolean;
  flip?: boolean;
  label: string;
}) {
  return (
    <ScalePressable
      onPress={onPress}
      disabled={disabled}
      haptic={false}
      scaleTo={0.9}
      accessibilityLabel={label}
      style={{
        width: 44,
        height: 44,
        borderRadius: 22,
        borderCurve: 'continuous',
        backgroundColor: active ? LK.espresso : LK.ivory,
        borderWidth: 1.5,
        borderColor: active ? LK.espresso : HAIRLINE,
        alignItems: 'center',
        justifyContent: 'center',
        opacity: disabled ? 0.4 : 1,
      }}
    >
      <View style={flip ? { transform: [{ scaleX: -1 }] } : undefined}>
        <Icon name={name} size={18} color={active ? LK.vellum : LK.sepia} />
      </View>
    </ScalePressable>
  );
}

export function DrawToolbar({
  color,
  brushWidth,
  erasing,
  onColorChange,
  onBrushChange,
  onEraserToggle,
  onUndo,
  onRedo,
  onClear,
  canUndo = true,
  canRedo = false,
}: Props) {
  return (
    <View
      style={{
        backgroundColor: LK.vellum,
        borderTopWidth: 1,
        borderTopColor: 'rgba(42,33,26,0.08)',
        paddingHorizontal: 16,
        paddingTop: 14,
        paddingBottom: 8,
        gap: 16,
      }}
    >
      {/* Colours */}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        {PALETTE.map((c) => {
          const active = !erasing && color === c;
          return (
            <ScalePressable
              key={c}
              haptic={false}
              scaleTo={0.85}
              onPress={() => { onColorChange(c); if (erasing) onEraserToggle(); }}
              hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
              accessibilityLabel={`Pen colour ${c}`}
              style={{ width: 34, height: 34, alignItems: 'center', justifyContent: 'center' }}
            >
              {/* Active ring */}
              <View
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 17,
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderWidth: active ? 2 : 0,
                  borderColor: LK.espresso,
                }}
              >
                <View
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: 13,
                    backgroundColor: c,
                    borderWidth: 1.5,
                    borderColor: c === LK.espresso ? 'rgba(42,33,26,0.15)' : 'rgba(42,33,26,0.10)',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {active && <Icon name="check" size={12} color={c === LK.espresso ? LK.vellum : LK.espresso} />}
                </View>
              </View>
            </ScalePressable>
          );
        })}
      </View>

      {/* Nib sizes + actions */}
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Brush size selector */}
        <View
          style={{
            flexDirection: 'row',
            backgroundColor: LK.ivory,
            borderRadius: 9999,
            borderCurve: 'continuous',
            borderWidth: 1.5,
            borderColor: HAIRLINE,
            padding: 3,
          }}
        >
          {BRUSH_SIZES.map((b) => {
            const active = !erasing && brushWidth === b.value;
            return (
              <ScalePressable
                key={b.label}
                haptic={false}
                scaleTo={0.88}
                onPress={() => { onBrushChange(b.value); if (erasing) onEraserToggle(); }}
                accessibilityLabel={`Nib ${b.label}`}
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: 9999,
                  borderCurve: 'continuous',
                  backgroundColor: active ? LK.espresso : 'transparent',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <View
                  style={{
                    width: b.dot,
                    height: b.dot,
                    borderRadius: b.dot / 2,
                    backgroundColor: active ? LK.vellum : LK.sepia,
                  }}
                />
              </ScalePressable>
            );
          })}
        </View>

        {/* Actions */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <ToolButton name="eraser" label="Eraser" active={erasing} onPress={onEraserToggle} />
          <ToolButton name="undo" label="Undo" onPress={onUndo} disabled={!canUndo} />
          {onRedo && <ToolButton name="undo" label="Redo" onPress={onRedo} disabled={!canRedo} flip />}
          <ToolButton name="trash" label="Clear canvas" onPress={onClear} />
        </View>
      </View>
    </View>
  );
}
