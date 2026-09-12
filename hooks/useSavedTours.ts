import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { fetchSavedTourDetails, toggleSavedTour, isTourSaved } from '@/services/tours';

export function useSavedTours(userId: string | null | undefined) {
  const [savedTourIds, setSavedTourIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userId) {
      setSavedTourIds(new Set());
      return;
    }
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const saved = await fetchSavedTourDetails(userId);
        if (mounted) {
          const ids = new Set(saved.map((s: { tour_id: string }) => s.tour_id));
          setSavedTourIds(ids);
        }
      } catch (e) {
        console.error('Error fetching saved tours:', e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [userId]);

  const toggle = async (tourId: string) => {
    if (!userId) return;
    try {
      const result = await toggleSavedTour(userId, tourId);
      setSavedTourIds(prev => {
        const next = new Set(prev);
        if (result.saved) {
          next.add(tourId);
        } else {
          next.delete(tourId);
        }
        return next;
      });
      return result.saved;
    } catch (e) {
      console.error('Error toggling saved tour:', e);
      return null;
    }
  };

  const check = async (tourId: string) => {
    if (!userId) return false;
    try {
      return await isTourSaved(userId, tourId);
    } catch {
      return false;
    }
  };

  return { savedTourIds, loading, toggle, check };
}
