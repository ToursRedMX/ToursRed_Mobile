import { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, RefreshControl } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useTourSearch } from '@/hooks/useTours';
import { useSavedTours } from '@/hooks/useSavedTours';
import { TourCard } from '@/components/TourCard';
import { LoadingState, EmptyState, ErrorState } from '@/components/States';
import { colors, spacing, typography, radius } from '@/constants/theme';
import { Search, SlidersHorizontal, X, MapPin } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ExploreScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();
  const params = useLocalSearchParams();
  const { results, searching, searchError, search } = useTourSearch();
  const { savedTourIds, toggle } = useSavedTours(user?.id);

  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTourType, setSelectedTourType] = useState<string | null>(null);
  const [selectedDestination, setSelectedDestination] = useState<string | null>(null);
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [hasSearched, setHasSearched] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (params.destination) {
      setSelectedDestination(params.destination as string);
    }
    if (params.category) {
      setQuery(params.category as string);
    }
  }, [params]);

  const doSearch = (q: string) => {
    search({
      query: q || undefined,
      tourType: selectedTourType ?? undefined,
      destination: selectedDestination ?? undefined,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
    });
    setHasSearched(true);
  };

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      doSearch(query);
    }, 500);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, selectedTourType, selectedDestination, minPrice, maxPrice]);

  const clearFilters = () => {
    setSelectedTourType(null);
    setSelectedDestination(null);
    setMinPrice('');
    setMaxPrice('');
    setQuery('');
  };

  const renderTour = ({ item }: { item: typeof results[0] }) => (
    <TourCard
      tour={{
        ...item,
        isSaved: savedTourIds.has(item.id),
        onToggleSave: () => toggle(item.id),
      }}
    />
  );

  const hasActiveFilters = !!(selectedTourType || selectedDestination || minPrice || maxPrice);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Explorar tours</Text>
      </View>

      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Search size={20} color={colors.light.textSecondary} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar por nombre, destino..."
            placeholderTextColor={colors.light.textMuted}
            value={query}
            onChangeText={setQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery('')}>
              <X size={18} color={colors.light.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity
          style={[styles.filterButton, hasActiveFilters && styles.filterButtonActive]}
          onPress={() => setShowFilters(!showFilters)}
        >
          <SlidersHorizontal size={20} color={hasActiveFilters ? colors.neutral[0] : colors.light.text} />
        </TouchableOpacity>
      </View>

      {showFilters && (
        <View style={styles.filtersPanel}>
          <View style={styles.filterRow}>
            <Text style={styles.filterLabel}>Tipo de tour</Text>
            <View style={styles.chipsRow}>
              <TouchableOpacity
                style={[styles.chip, selectedTourType === 'excursion' && styles.chipActive]}
                onPress={() => setSelectedTourType(selectedTourType === 'excursion' ? null : 'excursion')}
              >
                <Text style={[styles.chipText, selectedTourType === 'excursion' && styles.chipTextActive]}>Excursion</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.chip, selectedTourType === 'receptivo' && styles.chipActive]}
                onPress={() => setSelectedTourType(selectedTourType === 'receptivo' ? null : 'receptivo')}
              >
                <Text style={[styles.chipText, selectedTourType === 'receptivo' && styles.chipTextActive]}>Receptivo</Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.filterRow}>
            <Text style={styles.filterLabel}>Destino</Text>
            <TextInput
              style={styles.filterInput}
              placeholder="Ej. Cancun, CDMX..."
              placeholderTextColor={colors.light.textMuted}
              value={selectedDestination ?? ''}
              onChangeText={setSelectedDestination}
            />
          </View>

          <View style={styles.filterRow}>
            <Text style={styles.filterLabel}>Precio (MXN)</Text>
            <View style={styles.priceRow}>
              <TextInput
                style={styles.priceInput}
                placeholder="Min"
                placeholderTextColor={colors.light.textMuted}
                value={minPrice}
                onChangeText={setMinPrice}
                keyboardType="numeric"
              />
              <Text style={styles.priceDash}>-</Text>
              <TextInput
                style={styles.priceInput}
                placeholder="Max"
                placeholderTextColor={colors.light.textMuted}
                value={maxPrice}
                onChangeText={setMaxPrice}
                keyboardType="numeric"
              />
            </View>
          </View>

          {hasActiveFilters && (
            <TouchableOpacity style={styles.clearButton} onPress={clearFilters}>
              <Text style={styles.clearText}>Limpiar filtros</Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      {searching && !hasSearched ? (
        <LoadingState message="Buscando tours..." />
      ) : searchError ? (
        <ErrorState message={searchError} onRetry={() => doSearch(query)} />
      ) : hasSearched && results.length === 0 ? (
        <EmptyState
          icon={<Search size={48} color={colors.neutral[300]} />}
          title="No se encontraron tours"
          message="Intenta ajustar tu busqueda o filtros"
          actionLabel="Limpiar filtros"
          onAction={clearFilters}
        />
      ) : (
        <FlatList
          style={styles.list}
          contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: insets.bottom + 20 }}
          data={results}
          keyExtractor={(item) => item.id}
          renderItem={renderTour}
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
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.light.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.light.border,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: colors.light.text,
  },
  filterButton: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.light.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.light.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: colors.primary[600],
    borderColor: colors.primary[600],
  },
  filtersPanel: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.light.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.light.border,
  },
  filterRow: {
    marginBottom: spacing.md,
  },
  filterLabel: {
    ...typography.small,
    color: colors.light.textSecondary,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  chipsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.pill,
    backgroundColor: colors.light.surface,
    borderWidth: 1,
    borderColor: colors.light.border,
  },
  chipActive: {
    backgroundColor: colors.primary[600],
    borderColor: colors.primary[600],
  },
  chipText: {
    ...typography.small,
    color: colors.light.text,
  },
  chipTextActive: {
    color: colors.neutral[0],
    fontWeight: '600',
  },
  filterInput: {
    height: 44,
    borderWidth: 1,
    borderColor: colors.light.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    fontSize: 16,
    color: colors.light.text,
    backgroundColor: colors.light.surface,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  priceInput: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: colors.light.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    fontSize: 16,
    color: colors.light.text,
    backgroundColor: colors.light.surface,
  },
  priceDash: {
    ...typography.body,
    color: colors.light.textSecondary,
  },
  clearButton: {
    alignSelf: 'flex-end',
  },
  clearText: {
    ...typography.small,
    color: colors.primary[600],
    fontWeight: '600',
  },
  list: {
    flex: 1,
  },
});
