import React, { useState } from 'react';
import { TextInput, View, Text, type TextInputProps } from 'react-native';
import { EaseView } from 'react-native-ease';
import { LK, theme } from '@/constants/theme';

type Props = TextInputProps & {
  /** Validation message — when present the border animates to Danger. */
  error?: string;
};

const REST = 'rgba(42,33,26,0.10)';

/**
 * Text field with an animated focus state (DESIGN.md §10.12). The border eases
 * to Coral on focus and Danger on validation error — native Core Animation via
 * react-native-ease, zero JS-thread overhead. Drop-in for react-hook-form's
 * Controller (pass value / onChangeText / onBlur / error).
 */
export function AnimatedField({ error, onFocus, onBlur, style, ...rest }: Props) {
  const [focused, setFocused] = useState(false);
  const borderColor = error ? LK.danger : focused ? LK.coral : REST;

  return (
    <View>
      <EaseView
        initialAnimate={{ borderColor: REST, borderWidth: 1.5 }}
        animate={{ borderColor, borderWidth: 1.5 }}
        transition={{ border: { type: 'timing', duration: 160, easing: 'easeOut' } }}
        style={{
          backgroundColor: LK.ivory,
          borderRadius: 16,
          borderCurve: 'continuous',
          boxShadow: '0 2px 8px rgba(42,33,26,0.05)',
        }}
      >
        <TextInput
          {...rest}
          onFocus={(e) => { setFocused(true); onFocus?.(e); }}
          onBlur={(e) => { setFocused(false); onBlur?.(e); }}
          placeholderTextColor={LK.ink70}
          style={[{ padding: 16, fontFamily: theme.fonts.body, fontSize: 16, color: LK.espresso }, style]}
        />
      </EaseView>
      {error ? (
        <Text style={{ fontFamily: theme.fonts.body, fontSize: 12.5, color: LK.danger, marginTop: 5 }}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}
