import { Modal, View, Text, Pressable } from 'react-native';
import { LK, theme, rgba } from '@/constants/theme';
import { Icon } from '@/components/ui/Icon';

/**
 * How-to sheet for adding the Locket home-screen widget. iOS does not allow an
 * app to place a widget programmatically, so the "Add to Home Screen" CTA opens
 * these manual steps instead. Centered fade modal (matches the LiveLayer modal
 * style); no Reanimated layout anims inside <Modal> (they no-op there).
 */

const STEPS = [
  'Touch and hold an empty area on your Home Screen until the icons jiggle.',
  'Tap the + button in the top-left corner.',
  'Search for "Locket" and select it.',
  'Pick a size, then tap Add Widget.',
  'Tap Done — your day counter is now on the Home Screen.',
];

export function WidgetHelpModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent>
      <Pressable
        onPress={onClose}
        style={{ flex: 1, backgroundColor: 'rgba(20,15,10,0.5)', justifyContent: 'center', paddingHorizontal: 28 }}
      >
        {/* Stop taps inside the card from closing the sheet. */}
        <Pressable
          onPress={() => {}}
          style={{ backgroundColor: LK.vellum, borderRadius: 26, borderCurve: 'continuous', padding: 24, ...theme.shadow.card } as any}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <View style={{ width: 38, height: 38, borderRadius: 12, borderCurve: 'continuous', backgroundColor: rgba(LK.gold, 0.14), alignItems: 'center', justifyContent: 'center' } as any}>
              <Icon name="house" size={18} color={LK.gold} strokeWidth={2} />
            </View>
            <Text style={{ fontFamily: theme.fonts.heading, fontWeight: '800', fontSize: 20, color: LK.espresso, flex: 1 }}>
              Add the Locket widget
            </Text>
          </View>

          <Text style={{ fontFamily: theme.fonts.body, fontSize: 13, color: LK.sepia, marginTop: 2, marginBottom: 16 }}>
            Keep your days together on your Home Screen.
          </Text>

          <View style={{ gap: 12 }}>
            {STEPS.map((step, i) => (
              <View key={i} style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 12 }}>
                <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: rgba(LK.gold, 0.16), alignItems: 'center', justifyContent: 'center', marginTop: 1 }}>
                  <Text style={{ fontFamily: theme.fonts.heading, fontWeight: '800', fontSize: 12, color: LK.gold }}>{i + 1}</Text>
                </View>
                <Text style={{ flex: 1, fontFamily: theme.fonts.body, fontSize: 14, lineHeight: 20, color: LK.espresso }}>
                  {step}
                </Text>
              </View>
            ))}
          </View>

          <Pressable
            onPress={onClose}
            accessibilityRole="button"
            style={{ backgroundColor: LK.espresso, borderRadius: 9999, paddingVertical: 14, alignItems: 'center', marginTop: 22 }}
          >
            <Text style={{ fontFamily: theme.fonts.body, fontWeight: '800', fontSize: 15, color: '#fff' }}>Got it</Text>
          </Pressable>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
