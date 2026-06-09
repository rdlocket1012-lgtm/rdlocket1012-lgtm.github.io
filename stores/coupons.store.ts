import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/stores/auth.store';

export type Coupon = {
  id: string;
  couple_id: string;
  created_by: string | null;        // real profile UUID of the gifter
  created_by_person: 'me' | 'partner'; // legacy — kept for compat
  title: string;
  description: string | null;
  icon: string;
  color: string;
  redeemed_at: string | null;
  deleted_at: string | null;
  created_at: string;
};

/** True if the current user created (gifted) this coupon. */
export function iGifted(coupon: Coupon): boolean {
  const myId = useAuthStore.getState().profile?.id;
  if (coupon.created_by) return coupon.created_by === myId;
  // Legacy rows without created_by: fall back to the relative text field.
  return coupon.created_by_person === 'me';
}

type CouponsState = {
  coupons: Coupon[];
  loading: boolean;
  fetchCoupons: (coupleId: string) => Promise<void>;
  addCoupon: (data: { couple_id: string; title: string; description: string | null; icon: string; color: string }) => Promise<void>;
  redeemCoupon: (id: string) => Promise<void>;
  deleteCoupon: (id: string) => Promise<void>;
  subscribe: (coupleId: string) => () => void;
};

export const useCouponsStore = create<CouponsState>((set, get) => ({
  coupons: [],
  loading: false,

  fetchCoupons: async (coupleId) => {
    set({ loading: true });
    const { data } = await supabase
      .from('coupons')
      .select('*')
      .eq('couple_id', coupleId)
      .is('deleted_at', null)
      .order('created_at', { ascending: false });
    set({ coupons: (data as Coupon[]) ?? [], loading: false });
  },

  addCoupon: async ({ couple_id, title, description, icon, color }) => {
    const myId = useAuthStore.getState().profile?.id ?? null;
    const payload = {
      couple_id,
      title,
      description,
      icon,
      color,
      created_by: myId,
      created_by_person: 'me' as const,
    };
    const optimistic: Coupon = {
      ...payload,
      id: `temp-${Date.now()}`,
      redeemed_at: null,
      deleted_at: null,
      created_at: new Date().toISOString(),
    };
    set((s) => ({ coupons: [optimistic, ...s.coupons] }));
    const { data: inserted, error } = await supabase.from('coupons').insert(payload).select().single();
    if (error) {
      set((s) => ({ coupons: s.coupons.filter((c) => c.id !== optimistic.id) }));
      throw new Error(error.message);
    }
    set((s) => ({ coupons: s.coupons.map((c) => (c.id === optimistic.id ? (inserted as Coupon) : c)) }));
  },

  redeemCoupon: async (id) => {
    const at = new Date().toISOString();
    set((s) => ({ coupons: s.coupons.map((c) => (c.id === id ? { ...c, redeemed_at: at } : c)) }));
    const { error } = await supabase.from('coupons').update({ redeemed_at: at }).eq('id', id);
    if (error) throw new Error(error.message);
  },

  deleteCoupon: async (id) => {
    set((s) => ({ coupons: s.coupons.filter((c) => c.id !== id) }));
    await supabase.from('coupons').update({ deleted_at: new Date().toISOString() }).eq('id', id);
  },

  subscribe: (coupleId) => {
    const channel = supabase
      .channel(`coupons:${coupleId}:${Math.random().toString(36).slice(2)}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'coupons', filter: `couple_id=eq.${coupleId}` }, () => {
        get().fetchCoupons(coupleId);
      })
      .subscribe();
    return () => { void supabase.removeChannel(channel); };
  },
}));
