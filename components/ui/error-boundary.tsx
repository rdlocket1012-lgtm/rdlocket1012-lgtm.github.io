import React from 'react';
import { View, Text, Pressable, ScrollView } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { ErrorBoundaryProps } from 'expo-router';
import { LK, theme } from '@/constants/theme';
import { Sentry } from '@/lib/sentry';

/**
 * Root error fallback. Rendered by expo-router when any descendant screen throws
 * during render. Kept intentionally dependency-light — no mascot WebPs, SVG icons,
 * or custom fonts are required to paint it, so it stays reliable even when the
 * crash originates in one of those subsystems. Design tokens only.
 */
export function AppErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  const insets = useSafeAreaInsets();
  const isDev = typeof __DEV__ !== 'undefined' && __DEV__;

  // Report the caught render error to Sentry once — the fallback UI below would
  // otherwise swallow it. Keyed on the error so re-renders don't double-report.
  React.useEffect(() => {
    if (error) Sentry.captureException(error);
  }, [error]);

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: LK.parchment,
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
      }}
    >
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          alignItems: 'center',
          justifyContent: 'center',
          paddingHorizontal: 32,
          gap: 16,
        }}
      >
        {/* Soft mark — a hand-drawn-feeling circle, no asset dependency */}
        <View
          style={{
            width: 72,
            height: 72,
            borderRadius: 36,
            borderCurve: 'continuous',
            backgroundColor: 'rgba(255,122,107,0.10)',
            borderWidth: 1.5,
            borderColor: 'rgba(42,33,26,0.15)',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 8,
          }}
        >
          <Text style={{ fontFamily: theme.fonts.heading, fontSize: 34, color: LK.coral }}>
            !
          </Text>
        </View>

        <Text
          style={{
            fontFamily: theme.fonts.heading,
            fontSize: 24,
            color: LK.espresso,
            textAlign: 'center',
          }}
        >
          Something went sideways
        </Text>

        <Text
          style={{
            fontFamily: theme.fonts.body,
            fontSize: 15,
            lineHeight: 22,
            color: LK.sepia,
            textAlign: 'center',
            maxWidth: 300,
          }}
        >
          A little hiccup on our end — your memories are safe. Give it another try.
        </Text>

        {isDev && error?.message ? (
          <View
            style={{
              alignSelf: 'stretch',
              maxHeight: 160,
              backgroundColor: LK.ivory,
              borderRadius: 14,
              borderCurve: 'continuous',
              borderWidth: 1.5,
              borderColor: 'rgba(42,33,26,0.15)',
              padding: 12,
              marginTop: 4,
            }}
          >
            <ScrollView>
              <Text
                style={{
                  fontFamily: theme.fonts.body,
                  fontSize: 12,
                  color: LK.sepia,
                }}
              >
                {error.message}
                {error.stack ? `\n\n${error.stack}` : ''}
              </Text>
            </ScrollView>
          </View>
        ) : null}

        <Pressable
          onPress={retry}
          hitSlop={8}
          style={({ pressed }) => ({
            marginTop: 8,
            backgroundColor: LK.coral,
            paddingHorizontal: 28,
            paddingVertical: 14,
            borderRadius: 9999,
            opacity: pressed ? 0.85 : 1,
          })}
          accessibilityRole="button"
          accessibilityLabel="Try again"
        >
          <Text
            style={{
              fontFamily: theme.fonts.body,
              fontWeight: '700',
              fontSize: 16,
              color: '#fff',
            }}
          >
            Try again
          </Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}
