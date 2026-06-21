import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AppState } from 'react-native';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    flowType: 'pkce',
  },
});

// Required React Native auth lifecycle (per Supabase's RN setup): only run the
// token auto-refresh while the app is foregrounded. Without this, the refresh
// timer keeps firing while the app is backgrounded — e.g. when the camera or
// photo picker is open — and because JS is suspended mid-refresh the auth lock
// can wedge. Every PostgREST query then hangs on session acquisition when the
// app returns to the foreground, which shows up as a screen stuck forever on its
// loading skeleton (reported on the Letters screen after returning from Camera).
AppState.addEventListener('change', (state) => {
  if (state === 'active') supabase.auth.startAutoRefresh();
  else supabase.auth.stopAutoRefresh();
});
