import { useEffect, useRef } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import { colors, radius, spacing, typography } from '@/constants/theme';

type CaptchaWidgetProps = {
  siteKey: string | undefined;
  onToken: (token: string) => void;
  onExpired: () => void;
  onError: () => void;
};

type TurnstileApi = {
  render: (element: HTMLElement, options: Record<string, unknown>) => string;
  remove: (widgetId: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

const turnstileScript = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';

export function CaptchaWidget({ siteKey, onToken, onExpired, onError }: CaptchaWidgetProps) {
  const containerRef = useRef<View>(null);

  useEffect(() => {
    if (Platform.OS !== 'web' || !siteKey) return;

    const container = containerRef.current as unknown as HTMLElement | null;
    if (!container) return;

    const mount = () => {
      if (!window.turnstile || !container) return;
      window.turnstile.render(container, {
        sitekey: siteKey,
        theme: 'light',
        callback: onToken,
        'expired-callback': onExpired,
        'error-callback': onError,
      });
    };

    const existingScript = document.querySelector(`script[src="${turnstileScript}"]`);
    if (existingScript) {
      mount();
      return;
    }

    const script = document.createElement('script');
    script.src = turnstileScript;
    script.async = true;
    script.onload = mount;
    script.onerror = onError;
    document.head.appendChild(script);
  }, [siteKey, onError, onExpired, onToken]);

  if (!siteKey) {
    return (
      <View style={styles.unavailable}>
        <Text style={styles.unavailableText}>Verificación de seguridad disponible al activar CAPTCHA.</Text>
      </View>
    );
  }

  if (Platform.OS === 'web') {
    return <View ref={containerRef} style={styles.webContainer} />;
  }

  const html = `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1"><script src="${turnstileScript}"></script></head><body><div id="captcha"></div><script>turnstile.render('#captcha',{sitekey:'${siteKey}',callback:function(token){window.ReactNativeWebView.postMessage(JSON.stringify({type:'token',token:token}))},'expired-callback':function(){window.ReactNativeWebView.postMessage(JSON.stringify({type:'expired'}))},'error-callback':function(){window.ReactNativeWebView.postMessage(JSON.stringify({type:'error'}))}});</script></body></html>`;

  const handleMessage = (event: WebViewMessageEvent) => {
    try {
      const message = JSON.parse(event.nativeEvent.data) as { type: string; token?: string };
      if (message.type === 'token' && message.token) onToken(message.token);
      if (message.type === 'expired') onExpired();
      if (message.type === 'error') onError();
    } catch {
      onError();
    }
  };

  return (
    <WebView
      originWhitelist={['*']}
      source={{ html }}
      onMessage={handleMessage}
      style={styles.nativeWebView}
      scrollEnabled={false}
      javaScriptEnabled
    />
  );
}

const styles = StyleSheet.create({
  webContainer: {
    minHeight: 65,
    alignItems: 'center',
    justifyContent: 'center',
  },
  nativeWebView: {
    width: 310,
    height: 80,
    backgroundColor: 'transparent',
  },
  unavailable: {
    minHeight: 38,
    borderRadius: radius.sm,
    backgroundColor: colors.neutral[50],
    paddingHorizontal: spacing.sm,
    justifyContent: 'center',
  },
  unavailableText: {
    ...typography.caption,
    color: colors.light.textMuted,
    textAlign: 'center',
  },
});
