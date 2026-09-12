# ToursRed Mobile

Aplicacion movil nativa de ToursRed construida con React Native + Expo + TypeScript.

## Arquitectura

```
/app                 Pantallas y navegacion (Expo Router)
  /(auth)            Login y registro
  /(tabs)            Navegacion principal con tabs inferiores
    index            Home
    explore          Buscar tours con filtros
    bookings         Mis reservas
    favorites        Tours favoritos
    profile          Perfil y configuracion
  /tour/[slug]       Detalle de tour
/components          Componentes visuales reutilizables
/constants           Theme, colores, tipografia, espaciado
/contexts            AuthContext (sesion, perfil, rol)
/hooks               Hooks reutilizables (useTours, useSavedTours)
/lib                 Cliente Supabase
/services            Capa de acceso a datos
/types               Tipos TypeScript del backend
```

## Backend

La app se conecta al mismo proyecto Supabase de ToursRed:
- URL: https://huzsedewwzjywcpbkjkm.supabase.co
- Autenticacion: email/password via Supabase Auth
- Sesion persistente: SecureStore (iOS Keychain / Android Keystore)
- RLS: Todas las tablas tienen Row Level Security activado

### Generar tipos de Supabase

Para regenerar los tipos cuando el esquema cambie:

```bash
npx supabase gen types typescript --project-id huzsedewwzjywcpbkjkm > types/database.ts
```

Los tipos actuales en `types/database.ts` son una version simplificada con las
entidades principales. La generacion automatica producira el archivo completo.

## Configuracion

### Variables de entorno

Las variables estan en `.env`:

```
EXPO_PUBLIC_SUPABASE_URL=https://huzsedewwzjywcpbkjkm.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=<anon_key>
```

Solo se usa la anon key (publica). Nunca incluir service_role_key en la app.

### Ejecutar

```bash
npm install
npx expo start
```

Escanea el QR con Expo Go (SDK 57) desde tu iPhone o Android.

### Build web

```bash
npm run build:web
```

## Deep Links

### Scheme interno
- `toursred://tour/{slug}`
- `toursred://booking/{id}`
- `toursred://wallet`
- `toursred://profile`

### Universal Links / App Links (configuracion posterior)
- `https://www.toursred.com.mx/tour/{slug}`
- `https://www.toursred.com.mx/booking/{id}`

Para activar Universal Links en iOS:
1. Subir `apple-app-site-association` a `https://www.toursred.com.mx/.well-known/`
2. Bundle ID: `com.toursred.app`

Para activar App Links en Android:
1. Subir `assetlinks.json` a `https://www.toursred.com.mx/.well-known/`
2. Package: `com.toursred.app`

## Identidad visual

El theme esta centralizado en `constants/theme.ts`:
- Colores: rojo ToursRed (#dc2626), tonos oscuros azul verdoso, neutros
- Tipografia: System con pesos 400/600/700
- Espaciado: sistema 4px (xs=4, sm=8, md=16, lg=24, xl=32, xxl=48)
- Bordes, sombras e iconos estandarizados

Para cambiar la paleta o tipografia, editar `constants/theme.ts`.
No hardcodear colores en las pantallas.

## Testing

```bash
npm run typecheck   # TypeScript
npm run lint        # ESLint
```

## Publicacion

### Android (Google Play)
```bash
eas build --platform android
```

### iOS (App Store)
```bash
eas build --platform ios
```

Configurar `eas.json` con perfiles development, staging y production.

## Troubleshooting

- **Expo Go incompatible**: Verificar que Expo Go use SDK 57
- **Login falla**: Verificar credenciales en .env
- **Tours no cargan**: Verificar conexion a Supabase y RLS policies
- **Favoritos no sincronizan**: Verificar sesion activa
