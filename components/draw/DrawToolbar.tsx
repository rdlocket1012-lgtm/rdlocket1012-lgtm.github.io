import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { LK, theme } from '@/constants/theme';
import { Icon } from '@/components/ui/Icon';

const BRUSH_SIZES: Array<{ label: string; value: number }> = [
  { label: 'S', value: 2 },
  { label: 'M', value: 5 },
  { label: 'L', value: 10 },
];

// Espresso (default) · Lo coral · Kit sky · Marigold · Blush — per §12.17/§12.18
const PALETTE = [LK.espresso, LK.coral, LK.sky, LK.marigold, LK.blush];
const ERASER_COLOR = LK.parchment;

interface Props {
  color: string;
  brushWidth: number;
  erasing: boolean;
  onColorChange: (c: string) => void;
  onBrushChange: (w: number) => void;
  onEraserToggle: () => void;
  onUndo: () => void;
  onClear: () => void;
}

export function DrawToolbar({
  color,
  brushWidth,
  erasing,
  onColorChange,
  onBrushChange,
  onEraserToggle,
  onUndo,
  onClear,
}: Props) {
  const borderStyle = { borderWidth: 1.5, borderColor: 'rgba(42,33,26,0.15)' };

  return (
    <View
      style={{
        backgroundColor: LK.vellum,
        borderTopWidth: 1,
        borderTopColor: 'rgba(42,33,26,0.08)',
        paddingHorizontal: 16,
        paddingVertical: 12,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
      }}
    >
      {/* Brush size pills */}
      <View
        style={{
          flexDirection: 'row',
          backgroundColor: LK.ivory,
          borderRadius: 9999,
          ...borderStyle,
          overflow: 'hidden',
        }}
      >
        {BRUSH_SIZES.map((b) => {
          const active = !erasing && brushWidth === b.value;
          return (
            <TouchableOpacity
              key={b.label}
              onPress={() => { onBrushChange(b.value); if (erasing) onEraserToggle(); }}
              style={{
                paddingHorizontal: 13,
                paddingVertical: 8,
                backgroundColor: active ? LK.espresso : 'transparent',
              }}
              accessibilityLabel={`Brush size ${b.label}`}
            >
              <Text
                style={{
                  fontFamily: theme.fonts.body,
                  fontWeight: '700',
                  fontSize: 12,
                  color: active ? LK.vellum : LK.sepia,
                }}
              >
                {b.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Color palette */}
      <View style={{ flexDirection: 'row', gap: 7, flex: 1, justifyContent: 'center' }}>
        {PALETTE.map((c) => {
          const active = !erasing && color === c;
          return (
            <TouchableOpacity
              key={c}
              onPress={() => { onColorChange(c); if (erasing) onEraserToggle(); }}
              style={{
                width: 24,
                height: 24,
                borderRadius: 12,
                backgroundColor: c,
                borderWidth: active ? 2 : 1.5,
                borderColor: active ? LK.espresso : 'rgba(42,33,26,0.15)',
                alignItems: 'center',
                justifyContent: 'center',
              }}
              accessibilityLabel={`Color chip`}
            >
              {active && (
                <Icon
                  name="checkmark"
                  size={11}
                  color={c === LK.espresso ? LK.vellum : LK.espresso}
                />
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Eraser toggle */}
      <TouchableOpacity
        onPress={onEraserToggle}
        style={{
          width: 36,
          height: 36,
          borderRadius: 9999,
          backgroundColor: erasing ? LK.espresso : LK.ivory,
          borderWidth: 1.5,
          borderColor: erasing ? LK.espresso : 'rgba(42,33,26,0.15)',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        accessibilityLabel="Eraser"
      >
        <Icon name="eraser" size={16} color={erasing ? LK.vellum : LK.sepia} />
      </TouchableOpacity>

      {/* Undo */}
      <TouchableOpacity
        onPress={onUndo}
        style={{
          width: 36,
          height: 36,
          borderRadius: 9999,
          backgroundColor: LK.ivory,
          borderWidth: 1.5,
          borderColor: 'rgba(42,33,26,0.15)',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        accessibilityLabel="Undo last stroke"
      >
        <Icon name="arrow.uturn.backward" size={15} color={LK.sepia} />
      </TouchableOpacity>

      {/* Clear */}
      <TouchableOpacity
        onPress={onClear}
        style={{
          width: 36,
          height: 36,
          borderRadius: 9999,
          backgroundColor: LK.ivory,
          borderWidth: 1.5,
          borderColor: 'rgba(42,33,26,0.15)',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        accessibilityLabel="Clear canvas"
      >
        <Icon name="trash" size={15} color={LK.sepia} />
      </TouchableOpacity>
    </View>
  );
}
