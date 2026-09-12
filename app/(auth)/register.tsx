import { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { colors, spacing, typography, radius } from '@/constants/theme';
import { Mail, Lock, User as UserIcon, ArrowRight, Eye, EyeOff } from 'lucide-react-native';

export default function RegisterScreen() {
  const router = useRouter();
  const { signUp, loading } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  const handleRegister = async () => {
    setLocalError(null);
    if (!firstName.trim() || !lastName.trim()) {
      setLocalError('Ingresa tu nombre y apellido');
      return;
    }
    if (!email.trim() || !password) {
      setLocalError('Ingresa tu correo y contrasena');
      return;
    }
    if (password.length < 6) {
      setLocalError('La contrasena debe tener al menos 6 caracteres');
      return;
    }
    const { error } = await signUp(email.trim().toLowerCase(), password, firstName.trim(), lastName.trim());
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
        <Text style={styles.title}>Crear cuenta</Text>
        <Text style={styles.subtitle}>Unete a ToursRed como viajero</Text>

        {localError && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{localError}</Text>
          </View>
        )}

        <View style={styles.inputContainer}>
          <UserIcon size={20} color={colors.light.textSecondary} />
          <TextInput
            style={styles.input}
            placeholder="Nombre"
            placeholderTextColor={colors.light.textMuted}
            value={firstName}
            onChangeText={setFirstName}
            autoCapitalize="words"
          />
        </View>

        <View style={styles.inputContainer}>
          <UserIcon size={20} color={colors.light.textSecondary} />
          <TextInput
            style={styles.input}
            placeholder="Apellido"
            placeholderTextColor={colors.light.textMuted}
            value={lastName}
            onChangeText={setLastName}
            autoCapitalize="words"
          />
        </View>

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
            placeholder="Contrasena (min. 6 caracteres)"
            placeholderTextColor={colors.light.textMuted}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            textContentType="newPassword"
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
          style={[styles.registerButton, loading && styles.registerButtonDisabled]}
          onPress={handleRegister}
          disabled={loading}
        >
          <Text style={styles.registerButtonText}>
            {loading ? 'Creando cuenta...' : 'Crear cuenta'}
          </Text>
          {!loading && <ArrowRight size={20} color={colors.neutral[0]} />}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.backLink}
          onPress={() => router.push('/(auth)/login')}
        >
          <Text style={styles.backText}>
            Ya tienes cuenta? {' '}<Text style={styles.backHighlight}>Iniciar sesion</Text>
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
  registerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    height: 52,
    borderRadius: radius.md,
    backgroundColor: colors.primary[600],
  },
  registerButtonDisabled: {
    opacity: 0.6,
  },
  registerButtonText: {
    ...typography.body,
    color: colors.neutral[0],
    fontWeight: '700',
  },
  backLink: {
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  backText: {
    ...typography.body,
    color: colors.light.textSecondary,
  },
  backHighlight: {
    color: colors.primary[600],
    fontWeight: '600',
  },
});
