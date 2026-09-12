import { supabase } from '@/lib/supabase';
import type { Tour, TourCategory, Agency, Destination, TourReview, TourSlot, SavedTour } from '@/types/database';

export async function fetchPublishedTours(limit = 20, offset = 0) {
  const { data, error } = await supabase
    .from('tours')
    .select('id, name, slug, destination, price, image_url, is_featured, tour_type, receptivo_modality, precio_adulto, precio_nino, pickup_available, max_travelers')
    .eq('is_published', true)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);
  if (error) throw error;
  return data as Pick<Tour, 'id' | 'name' | 'slug' | 'destination' | 'price' | 'image_url' | 'is_featured' | 'tour_type' | 'receptivo_modality' | 'precio_adulto' | 'precio_nino' | 'pickup_available' | 'max_travelers'>[];
}

export async function fetchFeaturedTours(limit = 10) {
  const { data, error } = await supabase
    .from('tours')
    .select('id, name, slug, destination, price, image_url, tour_type, receptivo_modality, precio_adulto, precio_nino')
    .eq('is_published', true)
    .eq('is_featured', true)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data as Pick<Tour, 'id' | 'name' | 'slug' | 'destination' | 'price' | 'image_url' | 'tour_type' | 'receptivo_modality' | 'precio_adulto' | 'precio_nino'>[];
}

export async function searchTours(params: {
  query?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  tourType?: string;
  destination?: string;
  limit?: number;
  offset?: number;
}) {
  let query = supabase
    .from('tours')
    .select('id, name, slug, destination, price, image_url, is_featured, tour_type, receptivo_modality, precio_adulto, precio_nino, pickup_available, max_travelers')
    .eq('is_published', true);

  if (params.query) {
    query = query.or(`name.ilike.%${params.query}%,destination.ilike.%${params.query}%,description.ilike.%${params.query}%`);
  }
  if (params.destination) {
    query = query.ilike('destination', `%${params.destination}%`);
  }
  if (params.tourType) {
    query = query.eq('tour_type', params.tourType);
  }
  if (params.minPrice !== undefined) {
    query = query.gte('price', params.minPrice);
  }
  if (params.maxPrice !== undefined) {
    query = query.lte('price', params.maxPrice);
  }

  const limit = params.limit ?? 20;
  const offset = params.offset ?? 0;
  query = query.order('created_at', { ascending: false }).range(offset, offset + limit - 1);

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

export async function fetchTourBySlug(slug: string) {
  const { data, error } = await supabase
    .from('tours')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .maybeSingle();
  if (error) throw error;
  return data as Tour | null;
}

export async function fetchTourById(id: string) {
  const { data, error } = await supabase
    .from('tours')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data as Tour | null;
}

export async function fetchTourCategories() {
  const { data, error } = await supabase
    .from('tour_categories')
    .select('*')
    .eq('is_active', true)
    .order('display_order', { ascending: true, nullsFirst: false });
  if (error) throw error;
  return data as TourCategory[];
}

export async function fetchDestinations() {
  const { data, error } = await supabase
    .from('destinations')
    .select('id, name, description, main_image_url, country, region, is_active')
    .eq('is_active', true)
    .order('name', { ascending: true });
  if (error) throw error;
  return data as Destination[];
}

export async function fetchAgencyById(id: string) {
  const { data, error } = await supabase
    .from('agencies')
    .select('id, user_id, name, description, logo, contact_email, contact_phone, website, rating, is_active, is_approved, custom_slug, cover_image_url, city, state, rnt')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data as Agency | null;
}

export async function fetchTourReviews(tourId: string, limit = 20) {
  const { data, error } = await supabase
    .from('reviews')
    .select('id, user_id, tour_id, agency_id, rating, comment, reply, is_visible, created_at, updated_at')
    .eq('tour_id', tourId)
    .eq('is_visible', true)
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data as TourReview[];
}

export async function fetchTourSlots(tourId: string) {
  const { data, error } = await supabase
    .from('tour_slots')
    .select('*')
    .eq('tour_id', tourId)
    .in('status', ['activo'])
    .order('slot_date', { ascending: true })
    .limit(30);
  if (error) throw error;
  return data as TourSlot[];
}

export async function fetchSavedTours(userId: string) {
  const { data, error } = await supabase
    .from('saved_tours')
    .select('id, user_id, tour_id, created_at')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as SavedTour[];
}

export async function toggleSavedTour(userId: string, tourId: string) {
  const { data: existing } = await supabase
    .from('saved_tours')
    .select('id')
    .eq('user_id', userId)
    .eq('tour_id', tourId)
    .maybeSingle();

  if (existing) {
    const { error } = await supabase
      .from('saved_tours')
      .delete()
      .eq('id', existing.id);
    if (error) throw error;
    return { saved: false };
  }

  const { error } = await supabase
    .from('saved_tours')
    .insert({ user_id: userId, tour_id: tourId });
  if (error) throw error;
  return { saved: true };
}

export async function isTourSaved(userId: string, tourId: string) {
  const { data, error } = await supabase
    .from('saved_tours')
    .select('id')
    .eq('user_id', userId)
    .eq('tour_id', tourId)
    .maybeSingle();
  if (error) throw error;
  return !!data;
}

export async function fetchSavedTourDetails(userId: string) {
  const { data, error } = await supabase
    .from('saved_tours')
    .select(`
      id,
      tour_id,
      created_at,
      tours!inner(id, name, slug, destination, price, image_url, tour_type, receptivo_modality, precio_adulto, precio_nino, is_published)
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}
