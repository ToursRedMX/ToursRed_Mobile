import { useState } from 'react';
import { Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View, useWindowDimensions } from 'react-native';
import { useRouter } from 'expo-router';
import { ArrowLeft, Eye, EyeOff, Headphones, KeyRound, LockKeyhole, Mail, Search, ShieldCheck } from 'lucide-react-native';
import { CaptchaWidget } from '@/components/CaptchaWidget';
import { useAuth, OAuthProvider } from '@/contexts/AuthContext';
import { colors, radius, shadows, spacing, typography } from '@/constants/theme';

const captchaSiteKey = process.env.EXPO_PUBLIC_TURNSTILE_SITE_KEY;

const socialProviders: Array<{ provider: OAuthProvider; label: string; mark: string }> = [
  { provider: 'google', label: 'Google', mark: 'G' },
  { provider: 'azure', label: 'Microsoft', mark: '▦' },
  { provider: 'twitter', label: 'X', mark: 'X' },
  { provider: 'facebook', label: 'Facebook', mark: 'f' },
  { provider: 'linkedin_oidc', label: 'LinkedIn', mark: 'in' },
];

export default function LoginScreen() {
  const router = useRouter();
  const { width } = useWindowDimensions();
  const { signIn, signInWithOAuth, signInWithPasskey, resetPassword, verifyTotp, loading, mfaRequired } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [captchaToken, setCaptchaToken] = useState<string | undefined>();
  const [showPassword, setShowPassword] = useState(false);
  const [forgotPassword, setForgotPassword] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const compact = width < 700;

  const handleLogin = async () => {
    setLocalError(null);
    setNotice(null);
    if (!email.trim() || !password) {
      setLocalError('Ingresa tu correo y contraseña.');
      return;
    }
    const result = await signIn(email.trim().toLowerCase(), password, captchaToken);
    if (result.error) setLocalError(result.error);
  };

  const handleReset = async () => {
    setLocalError(null);
    setNotice(null);
    if (!email.trim()) {
      setLocalError('Ingresa tu correo electrónico para recuperar tu acceso.');
      return;
    }
    const result = await resetPassword(email.trim().toLowerCase(), captchaToken);
    if (result.error) setLocalError(result.error);
    else setNotice('Revisa tu correo para continuar con la recuperación.');
  };

  const handlePasskey = async () => {
    setLocalError(null);
    const result = await signInWithPasskey();
    if (result.error) setLocalError(result.error);
  };

  const handleTotp = async () => {
    setLocalError(null);
    if (!/^\d{6}$/.test(code)) {
      setLocalError('Ingresa el código de 6 dígitos de tu aplicación autenticadora.');
      return;
    }
    const result = await verifyTotp(code);
    if (result.error) setLocalError(result.error);
  };

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        <View style={styles.headerInner}>
          <Image source={require('@/assets/images/Logo_Transparente.jpg')} style={styles.headerLogo} resizeMode="contain" />
          {!compact && (
            <View style={styles.navLinks}>
              <Text style={styles.navLink}>Inicio</Text>
              <Text style={styles.navLink}>Tours⌄</Text>
              <Text style={styles.navLink}>Nosotros</Text>
              <Text style={styles.navLink}>Contacto</Text>
              <Text style={styles.navLink}>Tarjetas de Regalo</Text>
              <View style={styles.supportLink}><Headphones size={16} color={colors.neutral[500]} /><Text style={styles.navLink}>Soporte</Text></View>
            </View>
          )}
          <View style={styles.headerActions}>
            {!compact && <View style={styles.loginNav}><Search size={20} color={colors.neutral[500]} /><Text style={styles.loginNavText}>Iniciar sesión</Text></View>}
            <Pressable style={styles.headerButton} onPress={() => router.push('/(auth)/register')}><Text style={styles.headerButtonText}>Registrarse</Text></Pressable>
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={[styles.scrollContent, compact && styles.scrollContentCompact]} keyboardShouldPersistTaps="handled">
        <View style={[styles.content, compact && styles.contentCompact]}>
          <Text style={styles.title}>{mfaRequired ? 'Verifica tu identidad' : forgotPassword ? 'Recupera tu acceso' : 'Inicia sesión en tu cuenta'}</Text>
          <Text style={styles.subtitle}>
            {mfaRequired ? 'Ingresa el código de tu aplicación autenticadora' : forgotPassword ? 'Te enviaremos un enlace seguro a tu correo' : <>¿No tienes una cuenta? <Text style={styles.link} onPress={() => router.push('/(auth)/register')}>Regístrate aquí</Text></>}
          </Text>

          <View style={styles.card}>
            {localError && <View style={styles.errorBox}><Text style={styles.errorText}>{localError}</Text></View>}
            {notice && <View style={styles.noticeBox}><Text style={styles.noticeText}>{notice}</Text></View>}

            {mfaRequired ? (
              <>
                <View style={styles.mfaIcon}><ShieldCheck size={28} color={colors.primary[600]} /></View>
                <Text style={styles.mfaDescription}>Para proteger tu cuenta, confirma el código temporal de 6 dígitos.</Text>
                <TextInput style={styles.mfaInput} value={code} onChangeText={setCode} placeholder="000000" placeholderTextColor={colors.neutral[400]} keyboardType="number-pad" maxLength={6} textContentType="oneTimeCode" autoFocus />
                <Pressable style={[styles.primaryButton, loading && styles.disabled]} onPress={handleTotp} disabled={loading}><Text style={styles.primaryButtonText}>{loading ? 'Verificando...' : 'Verificar código'}</Text></Pressable>
              </>
            ) : forgotPassword ? (
              <>
                <Text style={styles.fieldLabel}>Correo electrónico</Text>
                <View style={styles.inputContainer}><Mail size={20} color={colors.neutral[500]} /><TextInput style={styles.input} placeholder="tu@correo.com" placeholderTextColor={colors.neutral[400]} value={email} onChangeText={setEmail} autoCapitalize="none" autoCorrect={false} keyboardType="email-address" textContentType="emailAddress" /></View>
                <CaptchaWidget siteKey={captchaSiteKey} onToken={setCaptchaToken} onExpired={() => setCaptchaToken(undefined)} onError={() => setLocalError('No pudimos cargar la verificación de seguridad.')} />
                <Pressable style={[styles.primaryButton, loading && styles.disabled]} onPress={handleReset} disabled={loading}><Text style={styles.primaryButtonText}>{loading ? 'Enviando...' : 'Enviar enlace'}</Text></Pressable>
                <Pressable style={styles.backAction} onPress={() => { setForgotPassword(false); setLocalError(null); }}><ArrowLeft size={17} color={colors.primary[600]} /><Text style={styles.link}>Volver a iniciar sesión</Text></Pressable>
              </>
            ) : (
              <>
                <Text style={styles.fieldLabel}>Correo electrónico</Text>
                <View style={styles.inputContainer}><Mail size={20} color={colors.neutral[500]} /><TextInput style={styles.input} placeholder="tu@correo.com" placeholderTextColor={colors.neutral[400]} value={email} onChangeText={setEmail} autoCapitalize="none" autoCorrect={false} keyboardType="email-address" textContentType="emailAddress" /></View>
                <Text style={styles.fieldLabel}>Contraseña</Text>
                <View style={styles.inputContainer}><LockKeyhole size={20} color={colors.neutral[500]} /><TextInput style={styles.input} placeholder="Tu contraseña" placeholderTextColor={colors.neutral[400]} value={password} onChangeText={setPassword} secureTextEntry={!showPassword} textContentType="password" /><Pressable onPress={() => setShowPassword((visible) => !visible)}>{showPassword ? <EyeOff size={20} color={colors.neutral[500]} /> : <Eye size={20} color={colors.neutral[500]} />}</Pressable></View>
                <View style={styles.optionsRow}><Pressable style={styles.remember}><View style={styles.checkbox} /><Text style={styles.optionText}>Recordarme</Text></Pressable><Pressable onPress={() => { setForgotPassword(true); setLocalError(null); }}><Text style={styles.link}>¿Olvidaste tu contraseña?</Text></Pressable></View>
                <CaptchaWidget siteKey={captchaSiteKey} onToken={setCaptchaToken} onExpired={() => setCaptchaToken(undefined)} onError={() => setLocalError('No pudimos cargar la verificación de seguridad.')} />
                <Pressable style={[styles.primaryButton, loading && styles.disabled]} onPress={handleLogin} disabled={loading}><Text style={styles.primaryButtonText}>{loading ? 'Iniciando sesión...' : 'Iniciar sesión'}</Text></Pressable>
                <Pressable style={styles.passkeyButton} onPress={handlePasskey} disabled={loading}><KeyRound size={18} color={colors.primary[600]} /><Text style={styles.passkeyText}>Usar clave de acceso</Text></Pressable>
                <View style={styles.divider}><View style={styles.dividerLine} /><Text style={styles.dividerText}>O continúa con</Text><View style={styles.dividerLine} /></View>
                <View style={styles.socialList}>{socialProviders.map((item) => <Pressable key={item.provider} style={styles.socialButton} onPress={() => signInWithOAuth(item.provider)} disabled={loading}><Text style={[styles.socialMark, item.provider === 'google' && styles.googleMark, item.provider === 'facebook' && styles.facebookMark]}>{item.mark}</Text><Text style={styles.socialText}>Continuar con {item.label}</Text></Pressable>)}</View>
                <View style={styles.bottomActions}><Pressable style={styles.secondaryButton} onPress={() => router.push('/(auth)/register')}><Text style={styles.secondaryText}>¿Eres una agencia?</Text></Pressable><Pressable style={styles.secondaryButton} onPress={() => router.push('/(auth)/register')}><Text style={styles.secondaryText}>Registrarse como viajero</Text></Pressable></View>
              </>
            )}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#f7f8fa' },
  header: { backgroundColor: '#eef5ff', borderBottomWidth: 1, borderBottomColor: '#dce7f5' },
  headerInner: { minHeight: 52, width: '100%', maxWidth: 1280, alignSelf: 'center', flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.md },
  headerLogo: { width: 40, height: 40, borderRadius: 4, backgroundColor: colors.neutral[0] },
  navLinks: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: spacing.lg, marginLeft: spacing.lg },
  navLink: { ...typography.caption, color: colors.neutral[600], fontWeight: '600' },
  supportLink: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  headerActions: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginLeft: 'auto' },
  loginNav: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  loginNavText: { ...typography.caption, color: colors.neutral[500], fontWeight: '600' },
  headerButton: { backgroundColor: '#2463e8', borderRadius: 5, paddingHorizontal: spacing.md, paddingVertical: 9 },
  headerButtonText: { ...typography.caption, color: colors.neutral[0], fontWeight: '700' },
  scrollContent: { flexGrow: 1, paddingVertical: 80, paddingHorizontal: spacing.md },
  scrollContentCompact: { paddingVertical: spacing.xl },
  content: { width: '100%', maxWidth: 770, alignSelf: 'center', alignItems: 'center' },
  contentCompact: { maxWidth: 520 },
  title: { ...typography.heading, fontSize: 26, lineHeight: 34, color: colors.neutral[950], textAlign: 'center', marginBottom: 4 },
  subtitle: { ...typography.small, color: colors.neutral[600], textAlign: 'center', marginBottom: spacing.lg },
  link: { color: '#155bd7', fontWeight: '700' },
  card: { width: '100%', maxWidth: 370, backgroundColor: colors.neutral[0], borderWidth: 1, borderColor: '#e8eaee', borderRadius: 8, padding: spacing.xl, ...shadows.sm },
  errorBox: { backgroundColor: '#fff1f1', borderWidth: 1, borderColor: '#f3b5b5', borderRadius: 6, padding: spacing.sm, marginBottom: spacing.md },
  errorText: { ...typography.caption, color: '#a61b1b' },
  noticeBox: { backgroundColor: '#eefaf1', borderWidth: 1, borderColor: '#addbb9', borderRadius: 6, padding: spacing.sm, marginBottom: spacing.md },
  noticeText: { ...typography.caption, color: '#176b32' },
  fieldLabel: { ...typography.caption, color: '#20365f', fontWeight: '600', marginBottom: 5 },
  inputContainer: { height: 42, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#c7ced9', borderRadius: 5, paddingHorizontal: spacing.sm, gap: spacing.sm, marginBottom: spacing.md, backgroundColor: colors.neutral[0] },
  input: { flex: 1, height: 40, fontSize: 14, color: colors.neutral[900] },
  optionsRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: spacing.sm },
  remember: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  checkbox: { width: 14, height: 14, borderWidth: 1, borderColor: colors.neutral[400], borderRadius: 2 },
  optionText: { ...typography.caption, color: colors.neutral[800] },
  primaryButton: { height: 42, borderRadius: 5, backgroundColor: '#2463e8', alignItems: 'center', justifyContent: 'center', marginTop: spacing.sm },
  primaryButtonText: { ...typography.caption, color: colors.neutral[0], fontWeight: '700' },
  disabled: { opacity: 0.6 },
  passkeyButton: { height: 40, borderWidth: 1, borderColor: '#8dbaff', borderRadius: 5, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: 7, marginTop: spacing.sm, backgroundColor: '#f5f9ff' },
  passkeyText: { ...typography.caption, color: '#155bd7', fontWeight: '700' },
  divider: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginVertical: spacing.lg },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#d0d5dc' },
  dividerText: { ...typography.caption, color: colors.neutral[500] },
  socialList: { gap: spacing.sm },
  socialButton: { height: 36, borderWidth: 1, borderColor: '#c7ced9', borderRadius: 5, alignItems: 'center', justifyContent: 'center', flexDirection: 'row', gap: spacing.sm },
  socialMark: { width: 20, textAlign: 'center', fontWeight: '800', fontSize: 16, color: colors.neutral[800] },
  googleMark: { color: '#4285f4' },
  facebookMark: { color: '#1877f2' },
  socialText: { ...typography.caption, color: '#253b68', fontWeight: '600' },
  bottomActions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  secondaryButton: { flex: 1, minHeight: 44, borderWidth: 1, borderColor: '#c7ced9', borderRadius: 5, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.sm },
  secondaryText: { ...typography.caption, color: '#253b68', fontWeight: '600', textAlign: 'center' },
  mfaIcon: { alignItems: 'center', marginBottom: spacing.sm },
  mfaDescription: { ...typography.small, color: colors.neutral[600], textAlign: 'center', marginBottom: spacing.md },
  mfaInput: { height: 48, borderWidth: 1, borderColor: '#c7ced9', borderRadius: 5, textAlign: 'center', fontSize: 24, letterSpacing: 8, color: colors.neutral[900] },
  backAction: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, marginTop: spacing.md },
});
