import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { colors, spacing, typography, radius } from '@/constants/theme';
import { LogOut, User as UserIcon, Mail, Phone, MapPin, Shield, Bell, ChevronRight, Heart, Wallet, Star, Calendar } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'react-native';

export default function ProfileScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, profile, signOut, loading } = useAuth();

  const handleSignOut = () => {
    Alert.alert(
      'Cerrar sesion',
      'Estas seguro que quieres salir?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Cerrar sesion', style: 'destructive', onPress: () => signOut() },
      ]
    );
  };

  const initials = (profile?.first_name?.[0] ?? user?.email?.[0] ?? '?').toUpperCase();

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top }]}
      contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          {profile?.profile_picture_url ? (
            <Image source={{ uri: profile.profile_picture_url }} style={styles.avatar} />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Text style={styles.avatarText}>{initials}</Text>
            </View>
          )}
        </View>
        <Text style={styles.name}>
          {profile?.first_name ?? 'Viajero'} {profile?.last_name ?? ''}
        </Text>
        <Text style={styles.email}>{profile?.email ?? user?.email}</Text>
        {profile?.role && (
          <View style={styles.roleBadge}>
            <Text style={styles.roleText}>
              {profile.role === 'traveler' ? 'Viajero' :
               profile.role === 'agency' ? 'Agencia' :
               profile.role === 'admin' ? 'Admin' :
               profile.role === 'super_admin' ? 'Super Admin' :
               profile.role === 'account_executive' ? 'Ejecutivo' : profile.role}
            </Text>
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Cuenta</Text>

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuLeft}>
            <UserIcon size={20} color={colors.light.textSecondary} />
            <Text style={styles.menuText}>Datos personales</Text>
          </View>
          <ChevronRight size={18} color={colors.light.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuLeft}>
            <Calendar size={20} color={colors.light.textSecondary} />
            <Text style={styles.menuText}>Mis reservas</Text>
          </View>
          <ChevronRight size={18} color={colors.light.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuLeft}>
            <Heart size={20} color={colors.light.textSecondary} />
            <Text style={styles.menuText}>Favoritos</Text>
          </View>
          <ChevronRight size={18} color={colors.light.textMuted} />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>ToursRed</Text>

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuLeft}>
            <Wallet size={20} color={colors.light.textSecondary} />
            <Text style={styles.menuText}>TR Cash / Wallet</Text>
          </View>
          <ChevronRight size={18} color={colors.light.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuLeft}>
            <Star size={20} color={colors.light.textSecondary} />
            <Text style={styles.menuText}>Mis puntos</Text>
          </View>
          <ChevronRight size={18} color={colors.light.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuLeft}>
            <Star size={20} color={colors.primary[600]} />
            <Text style={styles.menuText}>Membresia TR+</Text>
          </View>
          <ChevronRight size={18} color={colors.light.textMuted} />
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Configuracion</Text>

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuLeft}>
            <Bell size={20} color={colors.light.textSecondary} />
            <Text style={styles.menuText}>Notificaciones</Text>
          </View>
          <ChevronRight size={18} color={colors.light.textMuted} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuLeft}>
            <Shield size={20} color={colors.light.textSecondary} />
            <Text style={styles.menuText}>Seguridad</Text>
          </View>
          <ChevronRight size={18} color={colors.light.textMuted} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={[styles.signOutButton, loading && styles.signOutDisabled]}
        onPress={handleSignOut}
        disabled={loading}
      >
        <LogOut size={20} color={colors.error} />
        <Text style={styles.signOutText}>Cerrar sesion</Text>
      </TouchableOpacity>

      <Text style={styles.versionText}>ToursRed Mobile v1.0.0</Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light.surface,
  },
  header: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    paddingHorizontal: spacing.lg,
  },
  avatarContainer: {
    marginBottom: spacing.md,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
  },
  avatarPlaceholder: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: colors.primary[600],
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    ...typography.heading,
    color: colors.neutral[0],
    fontWeight: '700',
  },
  name: {
    ...typography.heading,
    color: colors.light.text,
  },
  email: {
    ...typography.body,
    color: colors.light.textSecondary,
    marginTop: spacing.xs,
  },
  roleBadge: {
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    backgroundColor: colors.primary[50],
    borderWidth: 1,
    borderColor: colors.primary[100],
  },
  roleText: {
    ...typography.caption,
    color: colors.primary[700],
    fontWeight: '600',
  },
  section: {
    marginTop: spacing.lg,
    paddingHorizontal: spacing.lg,
  },
  sectionTitle: {
    ...typography.small,
    color: colors.light.textSecondary,
    fontWeight: '600',
    marginBottom: spacing.sm,
    textTransform: 'uppercase',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: colors.light.border,
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  menuText: {
    ...typography.body,
    color: colors.light.text,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginHorizontal: spacing.lg,
    marginTop: spacing.xl,
    height: 50,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.error,
  },
  signOutDisabled: {
    opacity: 0.5,
  },
  signOutText: {
    ...typography.body,
    color: colors.error,
    fontWeight: '600',
  },
  versionText: {
    ...typography.caption,
    color: colors.light.textMuted,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
});
