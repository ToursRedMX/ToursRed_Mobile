import { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { LoadingState, EmptyState, ErrorState } from '@/components/States';
import { colors, spacing, typography, radius } from '@/constants/theme';
import { Heart, MapPin } from 'lucide-react-native';
import { supabase } from '@/lib/supabase';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface SavedTourWithDetails {
  id: string;
  tour_id: string;
  created_at: string;
  tours: {
    id: string;
    name: string;
    slug: string;
    destination: string | null;
    price: number;
    image_url: string | null;
    tour_type: string;
    receptivo_modality: string | null;
    precio_adulto: number | null;
    precio_nino: number | null;
    is_published: boolean;
  } | null;
}

export default function FavoritesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, session } = useAuth();
  const [savedTours, setSavedTours] = useState<SavedTourWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadSaved = useCallback(async () => {
    if (!user) return;
    setError(null);
    try {
      const { data, error } = await supabase
        .from('saved_tours')
        .select(`
          id, tour_id, created_at,
          tours!inner(id, name, slug, destination, price, image_url, tour_type, receptivo_modality, precio_adulto, precio_nino, is_published)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setSavedTours((data as unknown) as SavedTourWithDetails[]);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al cargar favoritos');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    loadSaved();
  }, [loadSaved]);

  const removeFavorite = async (savedId: string) => {
    try {
      await supabase.from('saved_tours').delete().eq('id', savedId);
      setSavedTours(prev => prev.filter(s => s.id !== savedId));
    } catch (e) {
      console.error('Error removing favorite:', e);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(price);
  };

  if (!session) {
    return (
      <EmptyState
        icon={<Heart size={48} color={colors.neutral[300]} />}
        title="Inicia sesion para ver favoritos"
        message="Guarda tus tours preferidos y accede a ellos en cualquier momento"
      />
    );
  }

  if (loading) return <LoadingState message="Cargando favoritos..." />;
  if (error) return <ErrorState message={error} onRetry={loadSaved} />;

  const renderSavedTour = ({ item }: { item: SavedTourWithDetails }) => {
    if (!item.tours) {
      return (
        <View style={styles.unavailableCard}>
          <Text style={styles.unavailableText}>Tour ya no disponible</Text>
          <TouchableOpacity onPress={() => removeFavorite(item.id)}>
            <Text style={styles.removeText}>Eliminar</Text>
          </TouchableOpacity>
        </View>
      );
    }

    const tour = item.tours;
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => router.push(`/tour/${tour.slug}`)}
        activeOpacity={0.85}
      >
        <View style={styles.cardRow}>
          {tour.image_url ? (
            <Image source={{ uri: tour.image_url }} style={styles.cardImage} />
          ) : (
            <View style={[styles.cardImage, styles.placeholderImage]}>
              <MapPin size={24} color={colors.neutral[400]} />
            </View>
          )}
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle} numberOfLines={2}>{tour.name}</Text>
            {tour.destination && (
              <View style={styles.row}>
                <MapPin size={12} color={colors.light.textSecondary} />
                <Text style={styles.cardDestination} numberOfLines={1}>{tour.destination}</Text>
              </View>
            )}
            <Text style={styles.cardPrice}>{formatPrice(tour.precio_adulto ?? tour.price)}</Text>
          </View>
          <TouchableOpacity
            style={styles.removeButton}
            onPress={() => removeFavorite(item.id)}
          >
            <Heart size={22} color={colors.primary[600]} fill={colors.primary[600]} />
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Favoritos</Text>
      </View>

      {savedTours.length === 0 ? (
        <EmptyState
          icon={<Heart size={48} color={colors.neutral[300]} />}
          title="No tienes tours guardados"
          message="Toca el corazon en cualquier tour para guardarlo aqui"
        />
      ) : (
        <FlatList
          style={styles.list}
          contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: insets.bottom + 20 }}
          data={savedTours}
          keyExtractor={(item) => item.id}
          renderItem={renderSavedTour}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadSaved(); }} />}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light.surface,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
  },
  title: {
    ...typography.heading,
    color: colors.light.text,
  },
  list: {
    flex: 1,
  },
  card: {
    backgroundColor: colors.light.surface,
    borderRadius: radius.lg,
    padding: spacing.sm,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.light.border,
  },
  cardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  cardImage: {
    width: 80,
    height: 80,
    borderRadius: radius.md,
    resizeMode: 'cover',
  },
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.neutral[100],
  },
  cardContent: {
    flex: 1,
  },
  cardTitle: {
    ...typography.subheading,
    color: colors.light.text,
    marginBottom: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.xs,
  },
  cardDestination: {
    ...typography.caption,
    color: colors.light.textSecondary,
  },
  cardPrice: {
    ...typography.small,
    color: colors.primary[700],
    fontWeight: '700',
  },
  removeButton: {
    padding: spacing.sm,
  },
  unavailableCard: {
    backgroundColor: colors.light.surfaceSecondary,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  unavailableText: {
    ...typography.body,
    color: colors.light.textSecondary,
  },
  removeText: {
    ...typography.small,
    color: colors.error,
    fontWeight: '600',
  },
});
