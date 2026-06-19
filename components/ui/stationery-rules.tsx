import React from 'react';
import { View } from 'react-native';

interface Props {
  lineSpacing?: number;
  lineColor?: string;
  leftMargin?: number;
  opacity?: number;
}

/**
 * Absolute-positioned ruled-paper texture (§11.5).
 * Must be placed inside a View with relative/absolute positioning.
 * Always pointerEvents="none" and accessibilityElementsHidden.
 */
export function StationeryRules({
  lineSpacing = 28,
  lineColor = 'rgba(154,138,99,0.20)',
  leftMargin = 44,
  opacity = 1,
}: Props) {
  return (
    <View
      style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, opacity }}
      pointerEvents="none"
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
    >
      {/* Left margin line */}
      <View
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: leftMargin,
          width: 1,
          backgroundColor: lineColor,
        }}
      />
      {/* Horizontal rules — 60 lines covers any screen height at 28px spacing */}
      {Array.from({ length: 60 }, (_, i) => (
        <View
          key={i}
          style={{
            position: 'absolute',
            top: (i + 1) * lineSpacing,
            left: 0,
            right: 0,
            height: 1,
            backgroundColor: lineColor,
          }}
        />
      ))}
    </View>
  );
}
