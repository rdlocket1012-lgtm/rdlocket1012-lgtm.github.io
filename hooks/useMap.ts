import { useEffect } from 'react';
import { useMapStore } from '@/stores/map.store';
import { useAuthStore } from '@/stores/auth.store';

export function useMap() {
  const pins = useMapStore(s => s.pins);
  const loading = useMapStore(s => s.loading);
  const fetchPins = useMapStore(s => s.fetchPins);
  const addPin = useMapStore(s => s.addPin);
  const updatePin = useMapStore(s => s.updatePin);
  const deletePin = useMapStore(s => s.deletePin);
  const subscribeToPins = useMapStore(s => s.subscribeToPins);
  const profile = useAuthStore(s => s.profile);

  useEffect(() => {
    if (!profile?.couple_id) return;
    fetchPins(profile.couple_id);
    return subscribeToPins(profile.couple_id);
  }, [profile?.couple_id]);

  return { pins, loading, addPin, updatePin, deletePin };
}
