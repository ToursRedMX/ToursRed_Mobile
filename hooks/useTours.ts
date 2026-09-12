import { useEffect, useState, useCallback } from 'react';
import { fetchPublishedTours, fetchFeaturedTours, fetchTourCategories, fetchDestinations, searchTours } from '@/services/tours';
import type { TourCategory, Destination } from '@/types/database';

type TourCard = {
  id: string;
  name: string;
  slug: string;
  destination: string | null;
  price: number;
  image_url: string | null;
  is_featured: boolean;
  tour_type: string;
  receptivo_modality: string | null;
  precio_adulto: number | null;
  precio_nino: number | null;
  pickup_available: boolean;
  max_travelers: number | null;
};

export function useTours() {
  const [tours, setTours] = useState<TourCard[]>([]);
  const [featuredTours, setFeaturedTours] = useState<TourCard[]>([]);
  const [categories, setCategories] = useState<TourCategory[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadInitial = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [published, featured, cats, dests] = await Promise.all([
        fetchPublishedTours(20, 0),
        fetchFeaturedTours(10),
        fetchTourCategories(),
        fetchDestinations(),
      ]);
      setTours(published as TourCard[]);
      setFeaturedTours(featured as TourCard[]);
      setCategories(cats);
      setDestinations(dests);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al cargar tours');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadInitial();
  }, [loadInitial]);

  return { tours, featuredTours, categories, destinations, loading, error, reload: loadInitial };
}

export function useTourSearch() {
  const [results, setResults] = useState<TourCard[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const search = useCallback(async (params: {
    query?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    tourType?: string;
    destination?: string;
  }) => {
    setSearching(true);
    setSearchError(null);
    try {
      const data = await searchTours(params);
      setResults(data as TourCard[]);
    } catch (e: unknown) {
      setSearchError(e instanceof Error ? e.message : 'Error en la busqueda');
      setResults([]);
    } finally {
      setSearching(false);
    }
  }, []);

  return { results, searching, searchError, search };
}
