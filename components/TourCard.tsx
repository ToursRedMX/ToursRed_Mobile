import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Heart, MapPin } from 'lucide-react-native';
import { colors, spacing, typography, radius, shadows } from '@/constants/theme';
import { useRouter } from 'expo-router';

interface TourCardProps {
  id: string;
  name: string;
  slug: string;
  destination: string | null;
  price: number;
  image_url: string | null;
  is_featured?: boolean;
  tour_type?: string;
  receptivo_modality?: string | null;
  precio_adulto?: number | null;
  precio_nino?: number | null;
  isSaved?: boolean;
  onToggleSave?: () => void;
}

export function TourCard({ tour }: { tour: TourCardProps }) {
  const router = useRouter();

  const handlePress = () => {
    router.push(`/tour/${tour.slug}`);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-MX', { style: 'currency', currency: 'MXN' }).format(price);
  };

  return (
    <TouchableOpacity style={styles.card} onPress={handlePress} activeOpacity={0.85}>
      <View style={styles.imageContainer}>
        {tour.image_url ? (
          <Image source={{ uri: tour.image_url }} style={styles.image} />
        ) : (
          <View style={[styles.image, styles.placeholderImage]}>
            <MapPin size={32} color={colors.neutral[400]} />
          </View>
        )}
        {tour.is_featured && (
          <View style={styles.featuredBadge}>
            <Text style={styles.featuredText}>Destacado</Text>
          </View>
        )}
        {tour.onToggleSave && (
          <TouchableOpacity
            style={styles.saveButton}
            onPress={(e) => {
              e.stopPropagation?.();
              tour.onToggleSave?.();
            }}
          >
            <Heart
              size={20}
              color={tour.isSaved ? colors.primary[600] : colors.neutral[0]}
              fill={tour.isSaved ? colors.primary[600] : 'transparent'}
            />
          </TouchableOpacity>
        )}
      </View>
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>{tour.name}</Text>
        {tour.destination && (
          <View style={styles.row}>
            <MapPin size={14} color={colors.light.textSecondary} />
            <Text style={styles.destination} numberOfLines={1}>{tour.destination}</Text>
          </View>
        )}
        <View style={styles.bottomRow}>
          <Text style={styles.price}>{formatPrice(tour.precio_adulto ?? tour.price)}</Text>
          {tour.tour_type && (
            <View style={styles.typeBadge}>
              <Text style={styles.typeText}>
                {tour.tour_type === 'receptivo' ? 'Receptivo' : 'Excursion'}
                {tour.receptivo_modality ? ` ${tour.receptivo_modality}` : ''}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.light.surface,
    borderRadius: radius.lg,
    ...shadows.sm,
    overflow: 'hidden',
    marginBottom: spacing.md,
  },
  imageContainer: {
    position: 'relative',
    height: 180,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderImage: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.neutral[100],
  },
  featuredBadge: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    backgroundColor: colors.primary[600],
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
  },
  featuredText: {
    ...typography.caption,
    color: colors.neutral[0],
    fontWeight: '600',
  },
  saveButton: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: spacing.md,
  },
  title: {
    ...typography.subheading,
    color: colors.light.text,
    marginBottom: spacing.xs,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  destination: {
    ...typography.small,
    color: colors.light.textSecondary,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  price: {
    ...typography.subheading,
    color: colors.primary[700],
    fontWeight: '700',
  },
  typeBadge: {
    backgroundColor: colors.neutral[100],
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
  },
  typeText: {
    ...typography.caption,
    color: colors.light.textSecondary,
    fontWeight: '500',
  },
});
