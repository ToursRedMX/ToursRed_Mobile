import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { colors, spacing, typography, radius } from '@/constants/theme';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react-native';

export default function LoginScreen() {
  const router = useRouter();
  const { signIn, loading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleLogin = async () => {
    setLocalError(null);
    if (!email.trim() || !password) {
      setLocalError('Ingresa tu correo y contrasena');
      return;
    }
    const { error } = await signIn(email.trim().toLowerCase(), password);
    if (error) {
      setLocalError(error);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <View style={styles.logoContainer}>
          <Image
            source={require('@/assets/images/Logo_Transparente.jpg')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.title}>Bienvenido a ToursRed</Text>
        <Text style={styles.subtitle}>Inicia sesion para continuar</Text>

        {localError && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{localError}</Text>
          </View>
        )}

        <View style={styles.inputContainer}>
          <Mail size={20} color={colors.light.textSecondary} />
          <TextInput
            style={styles.input}
            placeholder="Correo electronico"
            placeholderTextColor={colors.light.textMuted}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            textContentType="emailAddress"
          />
        </View>

        <View style={styles.inputContainer}>
          <Lock size={20} color={colors.light.textSecondary} />
          <TextInput
            style={styles.input}
            placeholder="Contrasena"
            placeholderTextColor={colors.light.textMuted}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            textContentType="password"
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            {showPassword ? (
              <EyeOff size={20} color={colors.light.textSecondary} />
            ) : (
              <Eye size={20} color={colors.light.textSecondary} />
            )}
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.loginButton, loading && styles.loginButtonDisabled]}
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.loginButtonText}>
            {loading ? 'Iniciando sesion...' : 'Iniciar sesion'}
          </Text>
          {!loading && <ArrowRight size={20} color={colors.neutral[0]} />}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.registerLink}
          onPress={() => router.push('/(auth)/register')}
        >
          <Text style={styles.registerText}>
            No tienes cuenta? {' '}<Text style={styles.registerHighlight}>Crear cuenta</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light.surface,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.xl,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  logo: {
    width: 120,
    height: 120,
    borderRadius: 24,
  },
  title: {
    ...typography.heading,
    color: colors.light.text,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.body,
    color: colors.light.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  errorBox: {
    backgroundColor: colors.primary[50],
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.primary[200],
  },
  errorText: {
    ...typography.small,
    color: colors.primary[700],
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.light.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
    backgroundColor: colors.light.surface,
    gap: spacing.sm,
  },
  input: {
    flex: 1,
    height: 50,
    fontSize: 16,
    color: colors.light.text,
  },
  loginButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    height: 52,
    borderRadius: radius.md,
    backgroundColor: colors.primary[600],
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    ...typography.body,
    color: colors.neutral[0],
    fontWeight: '700',
  },
  registerLink: {
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  registerText: {
    ...typography.body,
    color: colors.light.textSecondary,
  },
  registerHighlight: {
    color: colors.primary[600],
    fontWeight: '600',
  },
});
