import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY_DATE_REMINDERS = 'pref_notif_dates';

/**
 * Device-local preferences that other parts of the tree need to react to.
 *
 * Settings writes these; hooks mounted elsewhere (e.g. useDateReminders in the
 * tabs layout) read them. AsyncStorage alone isn't enough — a write on the
 * Settings screen has to re-run the scheduler mounted on another screen, and
 * only a store gives us that.
 */
type PrefsState = {
  /** Fire birthday/anniversary reminders. Default ON. */
  dateReminders: boolean;
  hydrated: boolean;
  hydrate: () => Promise<void>;
  setDateReminders: (on: boolean) => Promise<void>;
};

export const usePrefsStore = create<PrefsState>((set) => ({
  dateReminders: true,
  hydrated: false,

  hydrate: async () => {
    const v = await AsyncStorage.getItem(KEY_DATE_REMINDERS);
    set({ dateReminders: v !== '0', hydrated: true });
  },

  setDateReminders: async (on) => {
    set({ dateReminders: on });
    await AsyncStorage.setItem(KEY_DATE_REMINDERS, on ? '1' : '0');
  },
}));
