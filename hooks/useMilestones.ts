import { useEffect } from 'react';
import { useMilestonesStore } from '@/stores/milestones.store';
import { useAuthStore } from '@/stores/auth.store';

export function useMilestones() {
  const milestones = useMilestonesStore(s => s.milestones);
  const loading = useMilestonesStore(s => s.loading);
  const fetchMilestones = useMilestonesStore(s => s.fetchMilestones);
  const addMilestone = useMilestonesStore(s => s.addMilestone);
  const updateMilestone = useMilestonesStore(s => s.updateMilestone);
  const deleteMilestone = useMilestonesStore(s => s.deleteMilestone);
  const subscribeToMilestones = useMilestonesStore(s => s.subscribeToMilestones);
  const profile = useAuthStore(s => s.profile);

  useEffect(() => {
    if (!profile?.couple_id) return;
    fetchMilestones(profile.couple_id);
    return subscribeToMilestones(profile.couple_id);
  }, [profile?.couple_id]);

  return { milestones, loading, addMilestone, updateMilestone, deleteMilestone };
}
