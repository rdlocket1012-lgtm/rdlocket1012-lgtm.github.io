import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { daysTogether } from '@/utils/date';
import { useAuthStore } from '@/stores/auth.store';
import { notifyLocal } from '@/lib/notify';

export type SubscriptionStatus = 'free' | 'active' | 'past_due' | 'canceled' | 'expired';
export type SubscriptionTier = 'monthly' | 'annual' | 'lifetime' | null;

export type Couple = {
  id: string;
  start_date: string;
  nickname: string | null;
  subscription_status: SubscriptionStatus;
  subscription_tier: SubscriptionTier;
  original_paying_user_id: string | null;
};

/** Single source of truth: premium is a property of the shared relationship link. */
export function isPremiumActive(status: string | null | undefined): boolean {
  return status === 'active' || status === 'past_due';
}

type CoupleState = {
  couple: Couple | null;
  dayCount: number;
  isPremium: boolean;
  loading: boolean;
  setCouple: (couple: Couple | null) => void;
  fetchCouple: (coupleId: string) => Promise<void>;
  subscribeToCouple: (coupleId: string) => () => void;
};

function derive(couple: Couple) {
  return {
    couple,
    dayCount: daysTogether(new Date(couple.start_date)),
    isPremium: isPremiumActive(couple.subscription_status),
    loading: false,
  };
}

export const useCoupleStore = create<CoupleState>((set, get) => ({
  couple: null,
  dayCount: 0,
  isPremium: false,
  loading: true,

  setCouple: (couple) => {
    if (!couple) return set({ couple: null, dayCount: 0, isPremium: false, loading: false });
    set(derive(couple));
  },

  fetchCouple: async (coupleId) => {
    const { data } = await supabase.from('couples').select('*').eq('id', coupleId).single();
    if (data) set(derive(data as Couple));
  },

  subscribeToCouple: (coupleId) => {
    const channel = supabase
      .channel(`couple:${coupleId}:${Math.random().toString(36).slice(2)}`)
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'couples', filter: `id=eq.${coupleId}` }, (payload) => {
        const updated = payload.new as Couple;
        const wasPremium = get().isPremium;
        const nowPremium = isPremiumActive(updated.subscription_status);

        // Partner upgraded — notify this device (but not the person who paid).
        if (!wasPremium && nowPremium) {
          const myId = useAuthStore.getState().profile?.id;
          if (updated.original_paying_user_id && updated.original_paying_user_id !== myId) {
            notifyLocal(
              'You’re Premium! 👑',
              'Woohoo! Your partner just upgraded Locket. Enjoy your full history and unlimited milestones together!'
            );
          }
        }
        set(derive(updated));
      })
      .subscribe();
    return () => { void supabase.removeChannel(channel); };
  },
}));
