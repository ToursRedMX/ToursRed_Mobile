import { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Image, RefreshControl } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useTours } from '@/hooks/useTours';
import { useSavedTours } from '@/hooks/useSavedTours';
import { TourCard } from '@/components/TourCard';
import { LoadingState, ErrorState, EmptyState } from '@/components/States';
import { colors, spacing, typography, radius } from '@/constants/theme';
import { Search, MapPin, TrendingUp, Sparkles } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const { tours, featuredTours, categories, destinations, loading, error, reload } = useTours();
  const { savedTourIds, toggle } = useSavedTours(user?.id);
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await reload();
    setRefreshing(false);
  };

  if (loading) return <LoadingState message="Cargando tours..." />;
  if (error) return <ErrorState message={error} onRetry={reload} />;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(price);
  };

  const renderFeaturedTour = ({ item }: { item: typeof featuredTours[0] }) => (
    <TouchableOpacity
      style={styles.featuredCard}
      onPress={() => router.push(`/tour/${item.slug}`)}
      activeOpacity={0.85}
    >
      {item.image_url ? (
        <Image source={{ uri: item.image_url }} style={styles.featuredImage} />
      ) : (
        <View style={[styles.featuredImage, styles.placeholderImage]}>
          <MapPin size={32} color={colors.neutral[400]} />
        </View>
      )}
      <View style={styles.featuredOverlay}>
        <Text style={styles.featuredTitle} numberOfLines={2}>{item.name}</Text>
        {item.destination && (
          <View style={styles.featuredRow}>
            <MapPin size={12} color={colors.neutral[0]} />
            <Text style={styles.featuredDest} numberOfLines={1}>{item.destination}</Text>
          </View>
        )}
        <Text style={styles.featuredPrice}>{formatPrice(item.precio_adulto ?? item.price)}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderCategory = ({ item }: { item: typeof categories[0] }) => (
    <TouchableOpacity
      style={styles.categoryChip}
      onPress={() => router.push({ pathname: '/(tabs)/explore', params: { category: item.slug } })}
    >
      <Text style={styles.categoryText}>{item.name}</Text>
    </TouchableOpacity>
  );

  const renderDestination = ({ item }: { item: typeof destinations[0] }) => (
    <TouchableOpacity
      style={styles.destinationCard}
      onPress={() => router.push({ pathname: '/(tabs)/explore', params: { destination: item.name } })}
    >
      {item.main_image_url ? (
        <Image source={{ uri: item.main_image_url }} style={styles.destinationImage} />
      ) : (
        <View style={[styles.destinationImage, styles.placeholderImage]}>
          <MapPin size={24} color={colors.neutral[400]} />
        </View>
      )}
      <Text style={styles.destinationName} numberOfLines={1}>{item.name}</Text>
    </TouchableOpacity>
  );

  const renderTour = ({ item }: { item: typeof tours[0] }) => (
    <TourCard
      tour={{
        ...item,
        isSaved: savedTourIds.has(item.id),
        onToggleSave: () => toggle(item.id),
      }}
    />
  );

  return (
    <FlatList
      style={styles.container}
      contentContainerStyle={{ paddingTop: insets.top, paddingBottom: insets.bottom + 20 }}
      data={tours}
      keyExtractor={(item) => item.id}
      renderItem={renderTour}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      ListHeaderComponent={
        <View>
          <View style={styles.header}>
            <Text style={styles.greeting}>Hola, {user?.email?.split('@')[0] ?? 'viajero'}</Text>
            <Text style={styles.appName}>ToursRed</Text>
          </View>

          <TouchableOpacity
            style={styles.searchBar}
            onPress={() => router.push('/(tabs)/explore')}
            activeOpacity={0.7}
          >
            <Search size={20} color={colors.light.textSecondary} />
            <Text style={styles.searchPlaceholder}>Buscar tours, destinos...</Text>
          </TouchableOpacity>

          {featuredTours.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <Sparkles size={18} color={colors.primary[600]} />
                <Text style={styles.sectionTitle}>Tours destacados</Text>
              </View>
              <FlatList
                horizontal
                data={featuredTours}
                keyExtractor={(item) => item.id}
                renderItem={renderFeaturedTour}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalList}
              />
            </View>
          )}

          {categories.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Categorias</Text>
              <FlatList
                horizontal
                data={categories}
                keyExtractor={(item) => item.id}
                renderItem={renderCategory}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalList}
              />
            </View>
          )}

          {destinations.length > 0 && (
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <MapPin size={18} color={colors.primary[600]} />
                <Text style={styles.sectionTitle}>Destinos populares</Text>
              </View>
              <FlatList
                horizontal
                data={destinations.slice(0, 10)}
                keyExtractor={(item) => item.id}
                renderItem={renderDestination}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.horizontalList}
              />
            </View>
          )}

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <TrendingUp size={18} color={colors.primary[600]} />
              <Text style={styles.sectionTitle}>Tours disponibles</Text>
            </View>
          </View>
        </View>
      }
      ListEmptyComponent={
        <EmptyState
          icon={<MapPin size={48} color={colors.neutral[300]} />}
          title="No hay tours disponibles"
          message="Vuelve mas tarde para descubrir nuevas experiencias"
        />
      }
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light.surface,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
  },
  greeting: {
    ...typography.subheading,
    color: colors.light.text,
  },
  appName: {
    ...typography.subheading,
    color: colors.primary[600],
    fontWeight: '700',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginHorizontal: spacing.lg,
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.light.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.light.border,
  },
  searchPlaceholder: {
    ...typography.body,
    color: colors.light.textMuted,
  },
  section: {
    marginTop: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  sectionTitle: {
    ...typography.subheading,
    color: colors.light.text,
    fontWeight: '600',
  },
  horizontalList: {
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  featuredCard: {
    width: 240,
    height: 300,
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: colors.neutral[100],
  },
  featuredImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  featuredOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.md,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  featuredTitle: {
    ...typography.subheading,
    color: colors.neutral[0],
    fontWeight: '600',
  },
  featuredRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  featuredDest: {
    ...typography.caption,
    color: colors.neutral[200],
  },
  featuredPrice: {
    ...typography.subheading,
    color: colors.neutral[0],
    fontWeight: '700',
    marginTop: spacing.xs,
  },
  categoryChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.primary[50],
    borderWidth: 1,
    borderColor: colors.primary[100],
  },
  categoryText: {
    ...typography.small,
    color: colors.primary[700],
    fontWeight: '500',
  },
  destinationCard: {
    width: 120,
    alignItems: 'center',
  },
  destinationImage: {
    width: 100,
    height: 100,
    borderRadius: radius.md,
    marginBottom: spacing.xs,
  },
  destinationName: {
    ...typography.caption,
    color: colors.light.text,
    textAlign: 'center',
    fontWeight: '500',
  },
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.neutral[100],
  },
});
