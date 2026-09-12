import { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { LoadingState, EmptyState, ErrorState } from '@/components/States';
import { colors, spacing, typography, radius } from '@/constants/theme';
import { Calendar, MapPin, ChevronRight } from 'lucide-react-native';
import type { Booking } from '@/types/database';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

type Tab = 'upcoming' | 'completed' | 'cancelled';

export default function BookingsScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, session } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>('upcoming');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const statusMap: Record<Tab, string[]> = {
    upcoming: ['pending', 'confirmed', 'payment_pending_bnpl'],
    completed: ['completed'],
    cancelled: ['cancelled', 'cancellation_processing'],
  };

  const loadBookings = useCallback(async () => {
    if (!user) return;
    setError(null);
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select('*')
        .eq('user_id', user.id)
        .in('status', statusMap[activeTab])
        .order('created_at', { ascending: false });
      if (error) throw error;
      setBookings(data as Booking[]);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al cargar reservas');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user, activeTab]);

  useEffect(() => {
    setLoading(true);
    loadBookings();
  }, [loadBookings]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(price);
  };

  const statusLabels: Record<string, string> = {
    draft: 'Borrador',
    pending: 'Pendiente',
    confirmed: 'Confirmada',
    cancelled: 'Cancelada',
    completed: 'Completada',
    payment_not_received: 'Pago no recibido',
    cancellation_processing: 'Cancelacion en proceso',
    payment_pending_bnpl: 'Pago pendiente',
  };

  const statusColors: Record<string, string> = {
    confirmed: colors.success,
    pending: colors.warning,
    cancelled: colors.error,
    completed: colors.neutral[500],
    payment_pending_bnpl: colors.warning,
    cancellation_processing: colors.error,
    payment_not_received: colors.error,
    draft: colors.neutral[400],
  };

  const renderBooking = ({ item }: { item: Booking }) => (
    <TouchableOpacity style={styles.bookingCard}>
      <View style={styles.bookingHeader}>
        <View style={styles.bookingInfo}>
          <Text style={styles.bookingId}>#{item.id.slice(0, 8)}</Text>
          <View style={[styles.statusBadge, { backgroundColor: (statusColors[item.status] ?? colors.neutral[400]) + '20' }]}>
            <Text style={[styles.statusText, { color: statusColors[item.status] ?? colors.neutral[500] }]}>
              {statusLabels[item.status] ?? item.status}
            </Text>
          </View>
        </View>
        <ChevronRight size={20} color={colors.light.textMuted} />
      </View>
      <View style={styles.bookingDetails}>
        <View style={styles.detailRow}>
          <Calendar size={16} color={colors.light.textSecondary} />
          <Text style={styles.detailText}>{new Date(item.booking_date).toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })}</Text>
        </View>
        <View style={styles.detailRow}>
          <MapPin size={16} color={colors.light.textSecondary} />
          <Text style={styles.detailText}>{item.travelers_count} viajero{item.travelers_count !== 1 ? 's' : ''}</Text>
        </View>
      </View>
      <View style={styles.bookingFooter}>
        <Text style={styles.totalPrice}>{formatPrice(item.total_price)}</Text>
        <Text style={styles.deposit}>Anticipo: {formatPrice(item.deposit_amount)}</Text>
      </View>
    </TouchableOpacity>
  );

  if (!session) {
    return (
      <EmptyState
        icon={<Calendar size={48} color={colors.neutral[300]} />}
        title="Inicia sesion para ver tus reservas"
        message="Aqui apareceran tus proximos viajes y su historial"
      />
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Mis reservas</Text>
      </View>

      <View style={styles.tabsContainer}>
        {(['upcoming', 'completed', 'cancelled'] as Tab[]).map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, activeTab === tab && styles.tabActive]}
            onPress={() => setActiveTab(tab)}
          >
            <Text style={[styles.tabText, activeTab === tab && styles.tabTextActive]}>
              {tab === 'upcoming' ? 'Proximas' : tab === 'completed' ? 'Completadas' : 'Canceladas'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <LoadingState message="Cargando reservas..." />
      ) : error ? (
        <ErrorState message={error} onRetry={loadBookings} />
      ) : bookings.length === 0 ? (
        <EmptyState
          icon={<Calendar size={48} color={colors.neutral[300]} />}
          title={activeTab === 'upcoming' ? 'No tienes reservas proximas' : activeTab === 'completed' ? 'No hay reservas completadas' : 'No hay reservas canceladas'}
          message="Tus reservas apareceran aqui"
        />
      ) : (
        <FlatList
          style={styles.list}
          contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: insets.bottom + 20 }}
          data={bookings}
          keyExtractor={(item) => item.id}
          renderItem={renderBooking}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadBookings(); }} />}
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
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  tab: {
    flex: 1,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.light.surfaceSecondary,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: colors.primary[600],
  },
  tabText: {
    ...typography.small,
    color: colors.light.textSecondary,
    fontWeight: '500',
  },
  tabTextActive: {
    color: colors.neutral[0],
    fontWeight: '600',
  },
  list: {
    flex: 1,
  },
  bookingCard: {
    backgroundColor: colors.light.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.light.border,
  },
  bookingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  bookingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  bookingId: {
    ...typography.subheading,
    color: colors.light.text,
    fontWeight: '600',
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
  },
  statusText: {
    ...typography.caption,
    fontWeight: '600',
  },
  bookingDetails: {
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  detailText: {
    ...typography.small,
    color: colors.light.textSecondary,
  },
  bookingFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.light.border,
  },
  totalPrice: {
    ...typography.subheading,
    color: colors.primary[700],
    fontWeight: '700',
  },
  deposit: {
    ...typography.small,
    color: colors.light.textSecondary,
  },
});
