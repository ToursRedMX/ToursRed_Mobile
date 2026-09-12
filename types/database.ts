export type UserRole = 'traveler' | 'agency' | 'admin' | 'super_admin' | 'account_executive';

export type TourType = 'excursion' | 'receptivo';
export type ReceptivoModality = 'compartido' | 'privado';
export type BookingApprovalType = 'automatic' | 'manual';
export type CancellationPolicy = 'flexible' | 'moderada' | 'estricta' | 'no_reembolsable';
export type TaxTreatment = 'taxable_16' | 'exempt' | 'mixed';
export type SlotStatus = 'activo' | 'lleno' | 'bloqueado' | 'cancelado' | 'completado';
export type PaymentOption = 'standard' | 'payment_plan' | 'full_advance';

export type BookingStatus =
  | 'draft'
  | 'pending'
  | 'confirmed'
  | 'cancelled'
  | 'completed'
  | 'payment_not_received'
  | 'cancellation_processing'
  | 'payment_pending_bnpl';

export type ToursredCashTransactionType =
  | 'credit' | 'debit' | 'refund' | 'promotion'
  | 'gift_card' | 'adjustment' | 'topup_spei' | 'topup_codi';

export type PointsTransactionType =
  | 'earned' | 'redeemed' | 'expired' | 'manual_adjustment';

export type SupportTicketStatus =
  | 'sin_atender' | 'en_proceso' | 'escalado'
  | 'resuelto' | 'cancelado' | 'duplicado';

export type SupportTicketPriority = 'baja' | 'media' | 'alta' | 'urgente';

export type SupportTicketType = 'traveler' | 'agency' | 'general';

export type NotificationType =
  | 'booking_pending_approval' | 'booking_approved' | 'booking_rejected'
  | 'booking_confirmed' | 'booking_cancelled' | 'message_received'
  | 'tour_updated' | 'system_announcement' | 'tour_rescheduled'
  | 'referral_signup' | 'referral_completed' | 'referral_bonus_earned'
  | 'tour_announcement' | 'support_ticket_created' | 'support_ticket_updated'
  | 'support_ticket_assigned' | 'slot_reschedule_auto_cancelled'
  | 'commission_earned' | 'payment_plan_reminder' | 'payment_plan_overdue'
  | 'payment_plan_overdue_critical' | 'payment_plan_paid'
  | 'agency_documents_approved' | 'agency_documents_rejected'
  | 'agency_permanently_rejected' | 'agency_rejection_reversed'
  | 'payment_dispute_opened' | 'stripe_payout_failed'
  | 'cfdi_reconciliation_alert' | 'cobros_sin_comision' | 'errores_de_auditoria';

export interface DatabaseUser {
  id: string;
  first_name: string | null;
  last_name: string | null;
  role: UserRole;
  email: string | null;
  phone_number: string | null;
  profile_picture_url: string | null;
  is_active: boolean;
  date_of_birth: string | null;
  country: string | null;
  city: string | null;
  state: string | null;
  rfc: string | null;
  razon_social: string | null;
  regimen_fiscal: string | null;
  uso_cfdi: string | null;
  onboarding_completed: boolean | null;
  email_verified: boolean;
  is_foreign_traveler: boolean;
  sexo: string | null;
  apellido_paterno: string | null;
  apellido_materno: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  referred_by_user_id: string | null;
  referral_code_used: string | null;
}

export interface Tour {
  id: string;
  agency_id: string;
  name: string;
  slug: string;
  destination: string | null;
  description: string | null;
  price: number;
  deposit_percentage: number;
  image_url: string | null;
  gallery: string[] | null;
  start_date: string | null;
  end_date: string | null;
  max_travelers: number | null;
  is_featured: boolean;
  is_published: boolean;
  published_at: string | null;
  created_at: string;
  updated_at: string;
  itinerary: string | null;
  includes: string[] | null;
  excludes: string[] | null;
  booking_deadline: string | null;
  booking_approval_type: BookingApprovalType;
  approval_required: boolean;
  available_spots: number | null;
  category: string[] | null;
  pet_friendly: boolean;
  precio_adulto: number | null;
  precio_nino: number | null;
  precio_infante: number | null;
  precio_adulto_mayor: number | null;
  admite_infantes: boolean;
  admite_ninos: boolean;
  admite_adultos: boolean;
  admite_adultos_mayores: boolean;
  precio_mascota: number | null;
  cancellation_not_allowed: boolean;
  cancelled_by_agency: boolean;
  name_changes_not_allowed: boolean;
  tour_type: TourType;
  receptivo_modality: ReceptivoModality | null;
  operating_days: string[] | null;
  operating_months: string[] | null;
  min_advance_booking_hours: number | null;
  max_advance_booking_days: number | null;
  cancellation_policy: CancellationPolicy | null;
  cancellation_hours_limit: number | null;
  cancellation_refund_percentage: number | null;
  min_travelers_required: number | null;
  min_travelers_confirmation_hours: number | null;
  flexible_hours: number | null;
  flexible_refund_percentage: number | null;
  moderate_hours: number | null;
  moderate_refund_percentage: number | null;
  pickup_available: boolean;
  pickup_free_zone: string | null;
  pickup_zones: Record<string, unknown> | null;
  tour_languages: Record<string, unknown> | null;
  restriction_pregnant: boolean;
  restriction_disability: boolean;
  restriction_physical: boolean;
  vehicle_map_type: string | null;
  preventa_activa: boolean;
  preventa_inicio: string | null;
  preventa_fin: string | null;
  preventa_precio_especial: boolean;
  preventa_tipo_descuento: string | null;
  preventa_descuento_valor: number | null;
  payment_option: string | null;
  full_payment_days_before_departure: number | null;
  payment_plan_mode: string | null;
  installment_definitions: Record<string, unknown> | null;
  late_payment_grace_days: number | null;
  late_payment_penalty_pct: number | null;
  late_payment_penalty_fixed: number | null;
  activity_type: string | null;
  transfer_type: string | null;
  transport_coverage: string | null;
  estimated_minutes: number | null;
  max_wait_minutes: number | null;
  flight_tracking: boolean;
  personalized_reception: boolean;
  vehicle_type: string | null;
  luggage_info: string | null;
  transport_service_info: string | null;
  unique_experience: string | null;
  participation_level: string | null;
  local_host: boolean;
  special_requirements: string | null;
  experience_environment: string[] | null;
  ticket_type: string | null;
  ticket_validity_type: string | null;
  ticket_valid_from: string | null;
  ticket_valid_to: string | null;
  ticket_requires_reservation: boolean;
  ticket_redemption_method: string | null;
  ticket_delivery_method: string | null;
  ticket_access_instructions: string | null;
  ticket_service_info: string | null;
  transfer_custom_time: boolean;
  transfer_pricing_mode: string | null;
  private_vehicle_capacity: number | null;
  includes_insurance: boolean;
  tax_treatment: TaxTreatment;
  exempt_ratio: number | null;
}

export interface TourCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  is_active: boolean;
  display_order: number | null;
}

export interface Agency {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  logo: string | null;
  contact_email: string;
  contact_phone: string | null;
  website: string | null;
  rating: number | null;
  is_active: boolean;
  is_approved: boolean;
  custom_slug: string | null;
  cover_image_url: string | null;
  city: string | null;
  state: string | null;
  commission_rate: number | null;
  commission_percentage: number | null;
  rnt: string | null;
}

export interface Booking {
  id: string;
  user_id: string;
  tour_id: string;
  agency_id: string;
  deposit_amount: number;
  commission_amount: number;
  total_price: number;
  status: BookingStatus;
  booking_date: string;
  travelers_count: number;
  created_at: string;
  updated_at: string;
  service_charge: number;
  user_payment: number;
}

export interface BookingTraveler {
  id: string;
  booking_id: string;
  categoria_viajero: string;
  nombre: string;
  email: string;
  telefono: string | null;
  fecha_nacimiento: string | null;
  precio_aplicado: number;
  is_cancelled: boolean;
}

export interface SavedTour {
  id: string;
  user_id: string;
  tour_id: string;
  created_at: string;
}

export interface TourSlot {
  id: string;
  tour_id: string;
  slot_date: string;
  start_time: string | null;
  end_time: string | null;
  available_capacity: number;
  total_capacity: number;
  status: SlotStatus;
}

export interface TourReview {
  id: string;
  user_id: string;
  tour_id: string;
  agency_id: string;
  rating: number;
  comment: string;
  reply: string | null;
  is_visible: boolean;
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  data: Record<string, unknown> | null;
  is_read: boolean;
  created_at: string;
  expires_at: string | null;
}

export interface ToursredCashWallet {
  id: string;
  user_id: string;
  balance: number;
  created_at: string;
  updated_at: string;
}

export interface ToursredCashTransaction {
  id: string;
  wallet_id: string;
  type: ToursredCashTransactionType;
  amount: number;
  description: string | null;
  created_at: string;
}

export interface ToursredPointsWallet {
  id: string;
  user_id: string;
  balance: number;
  created_at: string;
  updated_at: string;
}

export interface ToursredPointsTransaction {
  id: string;
  wallet_id: string;
  type: PointsTransactionType;
  points: number;
  description: string | null;
  created_at: string;
}

export interface Membership {
  id: string;
  user_id: string;
  plan_type: string;
  status: string;
  start_date: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  cancelled_at: string | null;
  service_fee_exemption_used: boolean;
  service_fee_exemption_reset_date: string | null;
  price_paid: number | null;
  renewal_amount: number | null;
}

export interface Destination {
  id: string;
  name: string;
  description: string | null;
  main_image_url: string | null;
  country: string | null;
  region: string | null;
  is_active: boolean;
}

export interface PlatformSettings {
  id: string;
  service_charge_percentage: string;
  agency_commission_percentage: string;
  membership_monthly_price: string;
  membership_annual_price: string;
  referral_bonus_points: number;
  referral_program_enabled: boolean;
  mercadopago_enabled: boolean;
  paypal_enabled: boolean;
  stripe_bookings_enabled: boolean;
  conekta_enabled: boolean;
  openpay_enabled: boolean;
  travel_insurance_enabled: boolean;
  travel_insurance_cost_per_day_per_traveler: string;
  travel_insurance_provider_name: string | null;
  oauth_google_login_enabled: boolean;
  oauth_azure_login_enabled: boolean;
  oauth_twitter_login_enabled: boolean;
  oauth_facebook_login_enabled: boolean;
  mfa_required_for_admins: boolean;
  passkeys_enabled: boolean;
  maintenance_mode: boolean;
  platform_url: string | null;
}

export interface SupportTicket {
  id: string;
  user_id: string;
  subject: string;
  description: string;
  status: SupportTicketStatus;
  priority: SupportTicketPriority;
  type: SupportTicketType;
  category_id: string | null;
  subcategory_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface SupportCategory {
  id: string;
  name: string;
  description: string | null;
  is_active: boolean;
}

export interface SupportSubcategory {
  id: string;
  category_id: string;
  name: string;
  description: string | null;
  is_active: boolean;
}

export interface DiscountCode {
  id: string;
  code: string;
  discount_type: string;
  discount_value: number;
  max_uses: number | null;
  current_uses: number;
  is_active: boolean;
  valid_from: string | null;
  valid_until: string | null;
}

export interface TourPromotion {
  id: string;
  tour_id: string;
  promotion_type: string;
  name: string;
  description: string | null;
  is_active: boolean;
  start_date: string | null;
  end_date: string | null;
}

export interface PaymentTransaction {
  id: string;
  booking_id: string | null;
  amount: number;
  currency: string;
  status: string;
  payment_method_type: string | null;
  payment_processor: string | null;
  charge_context: string;
  created_at: string;
}

export interface FrequentCompanion {
  id: string;
  user_id: string;
  nombre: string;
  apellido: string | null;
  email: string | null;
  telefono: string | null;
  fecha_nacimiento: string | null;
  documento_tipo: string | null;
  documento_numero: string | null;
  emergency_contact_name: string | null;
  emergency_contact_phone: string | null;
  sexo: string | null;
}

export interface TourDeparturePoint {
  id: string;
  tour_id: string;
  departure_point_id: string;
  display_order: number | null;
  departure: string | null;
}

export interface DeparturePoint {
  id: string;
  name: string;
  city: string | null;
  municipality: string | null;
  google_maps_url: string | null;
  is_active: boolean;
  usage_count: number | null;
}

export interface TourOptionalService {
  id: string;
  tour_id: string;
  name: string;
  description: string | null;
  price: number;
  is_active: boolean;
}

export interface TourSupplement {
  id: string;
  tour_id: string;
  name: string;
  description: string | null;
  price: number;
  is_required: boolean;
  is_active: boolean;
}
