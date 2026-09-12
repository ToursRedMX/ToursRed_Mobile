# ToursRed Mobile - Estado de Implementacion

## COMPLETADO

### Fase 1: Infraestructura movil
- [x] Migracion de Expo SDK 54 a SDK 57
- [x] React Native 0.86.3 + React 19.2.3
- [x] TypeScript estricto con path aliases (@/*)
- [x] Configuracion de app.json con identidad ToursRed
- [x] Scheme de deep links: toursred://
- [x] Bundle ID iOS: com.toursred.app
- [x] Package Android: com.toursred.app
- [x] Associated domains para Universal Links (toursred.com.mx)
- [x] Intent filters para Android App Links
- [x] Modo claro/oscuro automatico
- [x] Soporte para tablet
- [x] SecureStore para almacenamiento seguro de sesion

### Fase 2: Autenticacion
- [x] AuthContext con sesion persistente
- [x] Pantalla de login con email/password
- [x] Pantalla de registro de viajero
- [x] Cierre de sesion
- [x] Restauracion automatica de sesion al abrir la app
- [x] Manejo de errores (credenciales invalidas, red, etc.)
- [x] Navegacion protegida (redirige a login si no hay sesion)
- [x] Lectura del rol real desde el backend (tabla users)
- [x] Creacion de perfil en tabla users al registrarse

### Fase 3: Marketplace (vertical slice)
- [x] Pantalla Home con tours reales del backend
- [x] Tours destacados (carousel horizontal)
- [x] Categorias (chips horizontales)
- [x] Destinos populares (carousel horizontal)
- [x] Lista de tours disponibles
- [x] Pull to refresh en Home
- [x] Pantalla de busqueda con filtros (tipo, destino, precio)
- [x] Busqueda con debounce
- [x] Pantalla de detalle de tour completa
- [x] Galeria de imagenes horizontal
- [x] Informacion de la agencia
- [x] Precios por tipo de viajero
- [x] Descripcion, incluye, no incluye
- [x] Fechas disponibles (tour_slots)
- [x] Politica de cancelacion
- [x] Idiomas
- [x] Resenas con calificacion
- [x] Boton de favorito (toggle)
- [x] Boton de compartir (Share nativo)
- [x] Barra inferior con precio y boton de reservar
- [x] Favoritos sincronizados con backend (saved_tours)
- [x] Pantalla de favoritos con tours guardados
- [x] Eliminar favoritos desde la pantalla
- [x] Manejo de tours no disponibles en favoritos

### Fase 5 parcial: Cuenta
- [x] Pantalla de perfil con datos del usuario
- [x] Avatar o iniciales del nombre
- [x] Rol del usuario mostrado
- [x] Menu de cuenta (datos personales, reservas, favoritos)
- [x] Menu ToursRed (Wallet, Puntos, TR+)
- [x] Menu configuracion (Notificaciones, Seguridad)
- [x] Cierre de sesion con confirmacion
- [x] Pantalla de Mis Reservas con tabs (proximas, completadas, canceladas)

## EN PROGRESO

- none

## PENDIENTE

### Fase 4: Reservaciones y checkout
- [ ] Seleccion de fecha y horario
- [ ] Seleccion de viajeros por tipo
- [ ] Servicios opcionales y suplementos
- [ ] Codigos de descuento
- [ ] Uso de puntos y TR Cash
- [ ] Desglose de costos
- [ ] Pago con Stripe (checkout alojado)
- [ ] Arquitectura desacoplada para multiples procesadores
- [ ] Verificacion de pago con backend despues del retorno
- [ ] Confirmacion de reserva

### Fase 5 completo: Cuenta
- [ ] Pantalla de Wallet/TR Cash
- [ ] Pantalla de Puntos
- [ ] Pantalla de Membresia TR+
- [ ] Pantalla de Notificaciones
- [ ] Edicion de datos personales
- [ ] Configuracion de seguridad

### Fase 6: Funcionalidades nativas
- [ ] Notificaciones push (expo-notifications)
- [ ] Tabla de push tokens en backend
- [ ] Deep links funcionales (toursred://tour/{slug})
- [ ] Universal Links / App Links
- [ ] Biometria (Face ID / Touch ID)
- [ ] Camara y galeria
- [ ] Geolocalizacion y mapas
- [ ] Deteccion de conexion/offline
- [ ] Caché local segura

### Fase 7: Agencia
- [ ] Dashboard de agencia
- [ ] Gestion de tours
- [ ] Gestion de reservas
- [ ] Disponibilidad y bloqueo de fechas

### Fase 8: Hardening
- [ ] Sentry
- [ ] Analytics
- [ ] Accesibilidad completa
- [ ] Tests unitarios e integration

### Fase 9: Release
- [ ] EAS build Android
- [ ] EAS build iOS
- [ ] Configuracion de stores
- [ ] Iconos y splash definitivos

## BLOQUEADO

- none

## DECISIONES TECNICAS

1. **Expo SDK 57**: Requerido por Expo Go actual en el dispositivo del cliente
2. **Supabase real**: Conectado al proyecto huzsedewwzjywcpbkjkm (mismo backend que web)
3. **SecureStore**: Tokens de sesion almacenados en iOS Keychain / Android Keystore
4. **Tipos manuales simplificados**: Se usaran tipos generados automaticamente cuando se configure Supabase CLI
5. **Theme centralizado**: Todos los colores, tipografia y espaciado en constants/theme.ts
6. **Logo temporal**: Se usa Logo_Transparente.jpg como placeholder mientras se obtienen assets de alta resolucion

## CAMBIOS DE BACKEND

- Ninguno. La app usa exclusivamente el backend existente.

## DEPENDENCIAS NUEVAS

- expo-secure-store ~57.0.4
- expo-image-picker ~57.0.17
- expo-location ~57.0.17
- expo-notifications ~57.0.18
- @react-native-async-storage/async-storage 2.2.0

## RIESGOS DETECTADOS

1. **OAuth movil**: Las Edge Functions de ToursRed usan un allowlist de dominios web. Los flujos OAuth movil pueden requerir configurar redirects adicionales.
2. **Checkout movil**: Las Edge Functions de pago esperan success_url y cancel_url. La app movil enviara deep links, pero el allowlist de origenes en _shared/cors.ts puede bloquearlos.
3. **Tipos TypeScript**: Los tipos actuales son manuales y simplificados. Cambios en el esquema pueden desincronizarlos.

## DEUDA TECNICA

1. Tipos TypeScript manuales (pendiente generacion automatica)
2. Logo e icono de app son placeholders
3. Sin notificaciones push implementadas
4. Sin tests automatizados
5. Pantalla de reservas muestra datos basicos sin detalle completo de tour
