import { Stack } from 'expo-router';

export default function OnboardingLayout() {
  // Fade, not slide — paired with each screen's internal stagger this makes
  // the flow read as one continuously unfolding story.
  return <Stack screenOptions={{ headerShown: false, animation: 'fade', animationDuration: 260 }} />;
}
