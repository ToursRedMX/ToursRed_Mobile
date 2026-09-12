import { ReactNode } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { colors, spacing, typography, radius } from '@/constants/theme';
import { RefreshCw } from 'lucide-react-native';

export function LoadingState({ message = 'Cargando...' }: { message?: string }) {
  return (
    <View style={styles.centerContainer}>
      <ActivityIndicator size="large" color={colors.primary[600]} />
      <Text style={styles.loadingText}>{message}</Text>
    </View>
  );
}

export function EmptyState({ icon, title, message, actionLabel, onAction }: {
  icon?: ReactNode;
  title: string;
  message?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <View style={styles.centerContainer}>
      {icon && <View style={styles.emptyIcon}>{icon}</View>}
      <Text style={styles.emptyTitle}>{title}</Text>
      {message && <Text style={styles.emptyMessage}>{message}</Text>}
      {actionLabel && onAction && (
        <TouchableOpacity style={styles.actionButton} onPress={onAction}>
          <Text style={styles.actionText}>{actionLabel}</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <View style={styles.centerContainer}>
      <Text style={styles.errorIcon}>!</Text>
      <Text style={styles.errorTitle}>Algo salio mal</Text>
      <Text style={styles.errorMessage}>{message}</Text>
      {onRetry && (
        <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
          <RefreshCw size={18} color={colors.primary[600]} />
          <Text style={styles.retryText}>Reintentar</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.light.surface,
  },
  loadingText: {
    ...typography.body,
    color: colors.light.textSecondary,
    marginTop: spacing.md,
  },
  emptyIcon: {
    marginBottom: spacing.md,
  },
  emptyTitle: {
    ...typography.subheading,
    color: colors.light.text,
    textAlign: 'center',
  },
  emptyMessage: {
    ...typography.body,
    color: colors.light.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  actionButton: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.md,
    backgroundColor: colors.primary[600],
  },
  actionText: {
    ...typography.small,
    color: colors.neutral[0],
    fontWeight: '600',
  },
  errorIcon: {
    fontSize: 48,
    fontWeight: '700',
    color: colors.error,
    marginBottom: spacing.sm,
  },
  errorTitle: {
    ...typography.subheading,
    color: colors.light.text,
  },
  errorMessage: {
    ...typography.body,
    color: colors.light.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sm,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.primary[600],
  },
  retryText: {
    ...typography.small,
    color: colors.primary[600],
    fontWeight: '600',
  },
});
