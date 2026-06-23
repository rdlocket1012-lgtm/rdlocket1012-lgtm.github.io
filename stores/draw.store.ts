import { create } from 'zustand';
import { supabase } from '@/lib/supabase';
import { decode as decodeBase64 } from 'base64-arraybuffer';
import { captureRef } from 'react-native-view-shot';
import { notifyPartner } from '@/lib/push';
import { syncDrawWidget } from '@/lib/widget-bridge';
import * as Haptics from 'expo-haptics';
import { useAuthStore } from '@/stores/auth.store';
import type { RefObject } from 'react';
import type { View } from 'react-native';

export type Drawing = {
  id: string;
  couple_id: string;
  sender_id: string;
  image_path: string;
  image_url: string;
  created_at: string;
};

type DrawState = {
  received: Drawing[];
  sent: Drawing[];
  loading: boolean;
  fetchDrawings: (coupleId: string, userId: string) => Promise<void>;
  sendDrawing: (params: {
    coupleId: string;
    userId: string;
    partnerName: string;
    canvasRef: RefObject<View | null>;
  }) => Promise<void>;
  subscribeToDrawings: (coupleId: string, userId: string) => () => void;
};

export const useDrawStore = create<DrawState>((set, get) => ({
  received: [],
  sent: [],
  loading: false,

  fetchDrawings: async (coupleId, userId) => {
    if (get().received.length === 0 && get().sent.length === 0) set({ loading: true });
    const safety = setTimeout(() => set({ loading: false }), 12000);
    try {
      const { data, error } = await supabase
        .from('partner_drawings')
        .select('*')
        .eq('couple_id', coupleId)
        .order('created_at', { ascending: false });
      if (!error && data) {
        const rows = data as Drawing[];
        set({
          received: rows.filter((d) => d.sender_id !== userId),
          sent: rows.filter((d) => d.sender_id === userId),
        });
      }
    } catch {
      // best-effort — never block the UI
    } finally {
      clearTimeout(safety);
      set({ loading: false });
    }
  },

  sendDrawing: async ({ coupleId, userId, partnerName, canvasRef }) => {
    if (!canvasRef.current) throw new Error('canvas not ready');

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Capture canvas as base64 PNG (no expo-file-system needed with result:'base64')
    const base64 = await captureRef(canvasRef, {
      format: 'png',
      quality: 1,
      result: 'base64',
    });
    const arrayBuffer = decodeBase64(base64);

    const path = `${coupleId}/${userId}_${Date.now()}.png`;
    const { error: upErr } = await supabase.storage
      .from('partner-drawings')
      .upload(path, arrayBuffer, { contentType: 'image/png' });
    if (upErr) throw new Error(upErr.message);

    const { data: pub } = supabase.storage.from('partner-drawings').getPublicUrl(path);
    const imageUrl = pub.publicUrl;

    const { data: row, error: dbErr } = await supabase
      .from('partner_drawings')
      .insert({ couple_id: coupleId, sender_id: userId, image_path: path, image_url: imageUrl })
      .select()
      .single();
    if (dbErr) throw new Error(dbErr.message);

    set((s) => ({ sent: [row as Drawing, ...s.sent] }));

    // Notify partner — the Edge Function reads the sender's display_name
    const myName = useAuthStore.getState().profile?.display_name ?? 'Your person';
    await notifyPartner(
      'partner_draw',
      `✏️ ${myName} drew something for you`,
      'Open Locket to see it!',
    );
  },

  subscribeToDrawings: (coupleId, userId) => {
    const channel = supabase
      .channel(`partner_drawings:${coupleId}:${Math.random().toString(36).slice(2)}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'partner_drawings',
          filter: `couple_id=eq.${coupleId}`,
        },
        (payload) => {
          const drawing = payload.new as Drawing;
          const isReceived = drawing.sender_id !== userId;
          if (isReceived) {
            set((s) => ({ received: [drawing, ...s.received] }));
            // Sync home-screen widget with the latest received drawing
            const partnerName = 'Partner'; // widget shows first name from UserDefaults
            syncDrawWidget(drawing.image_url, partnerName).catch(() => {});
          } else {
            set((s) => ({ sent: [drawing, ...s.sent] }));
          }
        },
      )
      .subscribe();
    return () => { void supabase.removeChannel(channel); };
  },
}));
