import { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity, FlatList, Share, Alert } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { fetchTourBySlug, fetchAgencyById, fetchTourReviews, fetchTourSlots } from '@/services/tours';
import { LoadingState, ErrorState, EmptyState } from '@/components/States';
import { colors, spacing, typography, radius, shadows } from '@/constants/theme';
import { ArrowLeft, Heart, Share as ShareIcon, MapPin, Calendar, Users, Star, Check, X, ChevronRight, Car } from 'lucide-react-native';
import type { Tour, Agency, TourReview, TourSlot } from '@/types/database';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '@/lib/supabase';

export default function TourDetailScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { user } = useAuth();

  const [tour, setTour] = useState<Tour | null>(null);
  const [agency, setAgency] = useState<Agency | null>(null);
  const [reviews, setReviews] = useState<TourReview[]>([]);
  const [slots, setSlots] = useState<TourSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [savingFavorite, setSavingFavorite] = useState(false);

  const loadTour = useCallback(async () => {
    if (!slug) return;
    setLoading(true);
    setError(null);
    try {
      const tourData = await fetchTourBySlug(slug);
      if (!tourData) {
        setError('Tour no encontrado');
        return;
      }
      setTour(tourData);

      const [agencyData, reviewsData, slotsData] = await Promise.all([
        fetchAgencyById(tourData.agency_id),
        fetchTourReviews(tourData.id, 10),
        fetchTourSlots(tourData.id),
      ]);

      setAgency(agencyData);
      setReviews(reviewsData);
      setSlots(slotsData);

      if (user?.id) {
        const { data: savedData } = await supabase
          .from('saved_tours')
          .select('id')
          .eq('user_id', user.id)
          .eq('tour_id', tourData.id)
          .maybeSingle();
        setIsSaved(!!savedData);
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Error al cargar el tour');
    } finally {
      setLoading(false);
    }
  }, [slug, user?.id]);

  useEffect(() => {
    loadTour();
  }, [loadTour]);

  const handleToggleSave = async () => {
    if (!user?.id || !tour) return;
    setSavingFavorite(true);
    try {
      if (isSaved) {
        await supabase.from('saved_tours').delete().eq('user_id', user.id).eq('tour_id', tour.id);
        setIsSaved(false);
      } else {
        await supabase.from('saved_tours').insert({ user_id: user.id, tour_id: tour.id });
        setIsSaved(true);
      }
    } catch (e) {
      Alert.alert('Error', 'No se pudo actualizar favorito');
    } finally {
      setSavingFavorite(false);
    }
  };

  const handleShare = async () => {
    if (!tour) return;
    const url = `https://www.toursred.com.mx/tour/${tour.slug}`;
    try {
      await Share.share({
        message: `${tour.name}\n${tour.destination ?? ''}\nDescubre este tour en ToursRed: ${url}`,
        url,
        title: tour.name,
      });
    } catch (e) {
      // User cancelled share
    }
  };

  const formatPrice = (price: number | null | undefined) => {
    if (price == null) return 'N/A';
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(Number(price));
  };

  const avgRating = reviews.length > 0 ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length : null;

  if (loading) return <LoadingState message="Cargando tour..." />;
  if (error) return <ErrorState message={error} onRetry={loadTour} />;
  if (!tour) return <EmptyState title="Tour no encontrado" />;

  const galleryImages = tour.gallery?.filter(Boolean) ?? (tour.image_url ? [tour.image_url] : []);

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.galleryContainer}>
          {galleryImages.length > 0 ? (
            <FlatList
              horizontal
              data={galleryImages}
              keyExtractor={(item, index) => `${index}-${item}`}
              renderItem={({ item }) => (
                <Image source={{ uri: item }} style={styles.galleryImage} resizeMode="cover" />
              )}
              pagingEnabled
              showsHorizontalScrollIndicator={false}
            />
          ) : (
            <View style={[styles.galleryImage, styles.placeholderImage]}>
              <MapPin size={48} color={colors.neutral[400]} />
            </View>
          )}
          <View style={[styles.topBar, { top: insets.top + spacing.sm }]}>
            <TouchableOpacity style={styles.iconButton} onPress={() => router.back()}>
              <ArrowLeft size={22} color={colors.neutral[0]} />
            </TouchableOpacity>
            <View style={styles.topBarRight}>
              <TouchableOpacity style={styles.iconButton} onPress={handleShare}>
                <ShareIcon size={20} color={colors.neutral[0]} />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={handleToggleSave}
                disabled={savingFavorite}
              >
                <Heart
                  size={22}
                  color={isSaved ? colors.primary[600] : colors.neutral[0]}
                  fill={isSaved ? colors.primary[600] : 'transparent'}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>{tour.name}</Text>

          {tour.destination && (
            <View style={styles.locationRow}>
              <MapPin size={16} color={colors.light.textSecondary} />
              <Text style={styles.locationText}>{tour.destination}</Text>
            </View>
          )}

          {(avgRating || tour.tour_type) && (
            <View style={styles.tagsRow}>
              {avgRating && (
                <View style={styles.tag}>
                  <Star size={14} color={colors.accent[500]} fill={colors.accent[500]} />
                  <Text style={styles.tagText}>{avgRating.toFixed(1)}</Text>
                </View>
              )}
              {tour.tour_type && (
                <View style={styles.tag}>
                  <Text style={styles.tagText}>
                    {tour.tour_type === 'receptivo' ? 'Receptivo' : 'Excursion'}
                    {tour.receptivo_modality ? ` ${tour.receptivo_modality}` : ''}
                  </Text>
                </View>
              )}
              {tour.pickup_available && (
                <View style={styles.tag}>
                  <Car size={14} color={colors.success} />
                  <Text style={styles.tagText}>Pickup</Text>
                </View>
              )}
            </View>
          )}

          {agency && (
            <TouchableOpacity style={styles.agencyCard}>
              {agency.logo ? (
                <Image source={{ uri: agency.logo }} style={styles.agencyLogo} />
              ) : (
                <View style={[styles.agencyLogo, styles.placeholderImage]}>
                  <Users size={18} color={colors.neutral[400]} />
                </View>
              )}
              <View style={styles.agencyInfo}>
                <Text style={styles.agencyName}>{agency.name}</Text>
                {agency.rating && (
                  <View style={styles.ratingRow}>
                    <Star size={12} color={colors.accent[500]} fill={colors.accent[500]} />
                    <Text style={styles.ratingText}>{Number(agency.rating).toFixed(1)}</Text>
                  </View>
                )}
              </View>
              <ChevronRight size={18} color={colors.light.textMuted} />
            </TouchableOpacity>
          )}

          <View style={styles.pricesContainer}>
            <Text style={styles.sectionTitle}>Precios</Text>
            {tour.precio_adulto != null && (
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Adulto</Text>
                <Text style={styles.priceValue}>{formatPrice(tour.precio_adulto)}</Text>
              </View>
            )}
            {tour.precio_nino != null && (
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Nino</Text>
                <Text style={styles.priceValue}>{formatPrice(tour.precio_nino)}</Text>
              </View>
            )}
            {tour.precio_infante != null && (
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Infante</Text>
                <Text style={styles.priceValue}>{formatPrice(tour.precio_infante)}</Text>
              </View>
            )}
            {tour.precio_adulto_mayor != null && (
              <View style={styles.priceRow}>
                <Text style={styles.priceLabel}>Adulto mayor</Text>
                <Text style={styles.priceValue}>{formatPrice(tour.precio_adulto_mayor)}</Text>
              </View>
            )}
            <View style={styles.priceRow}>
              <Text style={styles.priceLabel}>Anticipo</Text>
              <Text style={styles.priceValue}>{tour.deposit_percentage}%</Text>
            </View>
          </View>

          {tour.description && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Descripcion</Text>
              <Text style={styles.descriptionText}>{tour.description}</Text>
            </View>
          )}

          {tour.includes && tour.includes.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Incluye</Text>
              {tour.includes.map((item, i) => (
                <View key={i} style={styles.listRow}>
                  <Check size={16} color={colors.success} />
                  <Text style={styles.listText}>{item}</Text>
                </View>
              ))}
            </View>
          )}

          {tour.excludes && tour.excludes.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>No incluye</Text>
              {tour.excludes.map((item, i) => (
                <View key={i} style={styles.listRow}>
                  <X size={16} color={colors.error} />
                  <Text style={styles.listText}>{item}</Text>
                </View>
              ))}
            </View>
          )}

          {slots.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Fechas disponibles</Text>
              <FlatList
                horizontal
                data={slots.slice(0, 10)}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <View style={styles.dateChip}>
                    <Text style={styles.dateText}>
                      {new Date(item.slot_date).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' })}
                    </Text>
                    <Text style={styles.spotsText}>
                      {item.available_capacity} lugares
                    </Text>
                  </View>
                )}
                showsHorizontalScrollIndicator={false}
              />
            </View>
          )}

          {tour.cancellation_policy && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Politica de cancelacion</Text>
              <Text style={styles.descriptionText}>
                {tour.cancellation_policy === 'flexible' ? 'Flexible' :
                 tour.cancellation_policy === 'moderada' ? 'Moderada' :
                 tour.cancellation_policy === 'estricta' ? 'Estricta' :
                 'No reembolsable'}
              </Text>
              {tour.cancellation_hours_limit && (
                <Text style={styles.descriptionText}>
                  Limite: {tour.cancellation_hours_limit} horas antes. Reembolso: {tour.cancellation_refund_percentage}%
                </Text>
              )}
            </View>
          )}

          {tour.tour_languages && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Idiomas</Text>
              <Text style={styles.descriptionText}>
                {typeof tour.tour_languages === 'object' ? Object.values(tour.tour_languages).join(', ') : 'Consultar'}
              </Text>
            </View>
          )}

          {reviews.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Resenas ({reviews.length})</Text>
              {reviews.slice(0, 5).map((review) => (
                <View key={review.id} style={styles.reviewCard}>
                  <View style={styles.reviewHeader}>
                    <View style={styles.starsRow}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          size={14}
                          color={star <= review.rating ? colors.accent[500] : colors.neutral[200]}
                          fill={star <= review.rating ? colors.accent[500] : 'transparent'}
                        />
                      ))}
                    </View>
                    <Text style={styles.reviewDate}>
                      {new Date(review.created_at).toLocaleDateString('es-MX')}
                    </Text>
                  </View>
                  {review.comment && <Text style={styles.reviewText}>{review.comment}</Text>}
                  {review.reply && (
                    <View style={styles.replyContainer}>
                      <Text style={styles.replyLabel}>Respuesta de la agencia:</Text>
                      <Text style={styles.replyText}>{review.reply}</Text>
                    </View>
                  )}
                </View>
              ))}
            </View>
          )}

          <View style={{ height: 100 }} />
        </View>
      </ScrollView>

      <View style={[styles.bottomBar, { paddingBottom: insets.bottom || spacing.md }]}>
        <View style={styles.bottomBarLeft}>
          <Text style={styles.bottomBarPrice}>{formatPrice(tour.precio_adulto ?? tour.price)}</Text>
          <Text style={styles.bottomBarLabel}>por persona</Text>
        </View>
        <TouchableOpacity
          style={styles.bookButton}
          onPress={() => {
            if (!user) {
              Alert.alert('Inicia sesion', 'Necesitas una cuenta para reservar');
              router.push('/(auth)/login');
            } else {
              Alert.alert('Proximamente', 'La reservacion estara disponible en la siguiente fase');
            }
          }}
        >
          <Text style={styles.bookButtonText}>Reservar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light.surface,
  },
  galleryContainer: {
    height: 300,
    position: 'relative',
  },
  galleryImage: {
    width: 400,
    height: 300,
  },
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.neutral[100],
  },
  topBar: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  topBarRight: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: spacing.lg,
  },
  title: {
    ...typography.heading,
    color: colors.light.text,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  locationText: {
    ...typography.body,
    color: colors.light.textSecondary,
  },
  tagsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    backgroundColor: colors.light.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.light.border,
  },
  tagText: {
    ...typography.caption,
    color: colors.light.textSecondary,
    fontWeight: '500',
  },
  agencyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.light.surfaceSecondary,
    marginBottom: spacing.lg,
  },
  agencyLogo: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  agencyInfo: {
    flex: 1,
  },
  agencyName: {
    ...typography.subheading,
    color: colors.light.text,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  ratingText: {
    ...typography.caption,
    color: colors.light.textSecondary,
  },
  pricesContainer: {
    padding: spacing.md,
    borderRadius: radius.lg,
    backgroundColor: colors.light.surfaceSecondary,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.subheading,
    color: colors.light.text,
    fontWeight: '600',
    marginBottom: spacing.sm,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: spacing.xs,
  },
  priceLabel: {
    ...typography.body,
    color: colors.light.textSecondary,
  },
  priceValue: {
    ...typography.body,
    color: colors.light.text,
    fontWeight: '600',
  },
  section: {
    marginBottom: spacing.lg,
  },
  descriptionText: {
    ...typography.body,
    color: colors.light.textSecondary,
    lineHeight: 24,
  },
  listRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.xs,
  },
  listText: {
    ...typography.body,
    color: colors.light.text,
  },
  dateChip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginRight: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: colors.light.surfaceSecondary,
    borderWidth: 1,
    borderColor: colors.light.border,
  },
  dateText: {
    ...typography.small,
    color: colors.light.text,
    fontWeight: '600',
  },
  spotsText: {
    ...typography.caption,
    color: colors.light.textSecondary,
    marginTop: 2,
  },
  reviewCard: {
    padding: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.light.surfaceSecondary,
    marginBottom: spacing.sm,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.xs,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 2,
  },
  reviewDate: {
    ...typography.caption,
    color: colors.light.textMuted,
  },
  reviewText: {
    ...typography.body,
    color: colors.light.text,
  },
  replyContainer: {
    marginTop: spacing.sm,
    padding: spacing.sm,
    borderRadius: radius.sm,
    backgroundColor: colors.light.surface,
  },
  replyLabel: {
    ...typography.caption,
    color: colors.light.textSecondary,
    fontWeight: '600',
    marginBottom: spacing.xs,
  },
  replyText: {
    ...typography.small,
    color: colors.light.textSecondary,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.md,
    backgroundColor: colors.light.surface,
    borderTopWidth: 1,
    borderTopColor: colors.light.border,
    ...shadows.lg,
  },
  bottomBarLeft: {
    flex: 1,
  },
  bottomBarPrice: {
    ...typography.heading,
    color: colors.primary[700],
    fontWeight: '700',
  },
  bottomBarLabel: {
    ...typography.caption,
    color: colors.light.textSecondary,
  },
  bookButton: {
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    borderRadius: radius.md,
    backgroundColor: colors.primary[600],
  },
  bookButtonText: {
    ...typography.body,
    color: colors.neutral[0],
    fontWeight: '700',
  },
});
