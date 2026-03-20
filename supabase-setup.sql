-- =============================================
-- ClinPro - SQL Completo para Supabase
-- Criado por Fyre Soluções — ClinPro © 2026
-- =============================================

-- =============================================
-- ENUMS
-- =============================================

CREATE TYPE "public"."ai_conversation_status" AS ENUM('active', 'resolved', 'escalated', 'expired');
CREATE TYPE "public"."ai_message_role" AS ENUM('user', 'assistant', 'system');
CREATE TYPE "public"."appointment_status" AS ENUM('scheduled', 'confirmed', 'arrived', 'in_service', 'completed', 'cancelled', 'no_show');
CREATE TYPE "public"."audit_action" AS ENUM('create', 'read', 'update', 'delete', 'login', 'logout', 'export', 'print');
CREATE TYPE "public"."campaign_channel" AS ENUM('email', 'sms', 'whatsapp');
CREATE TYPE "public"."campaign_status" AS ENUM('draft', 'scheduled', 'sending', 'sent', 'cancelled');
CREATE TYPE "public"."campaign_type" AS ENUM('birthday', 'inactive', 'follow_up', 'promotional', 'custom');
CREATE TYPE "public"."clinic_member_role" AS ENUM('owner', 'admin', 'member', 'viewer');
CREATE TYPE "public"."consent_type" AS ENUM('treatment', 'data_sharing', 'marketing', 'research', 'terms_of_use', 'privacy_policy');
CREATE TYPE "public"."document_type" AS ENUM('prescription', 'certificate', 'report', 'exam_request', 'referral');
CREATE TYPE "public"."employee_role" AS ENUM('admin', 'doctor', 'receptionist', 'nurse', 'manager', 'other');
CREATE TYPE "public"."invitation_status" AS ENUM('pending', 'accepted', 'rejected', 'expired');
CREATE TYPE "public"."medical_record_type" AS ENUM('anamnesis', 'evolution', 'exam_result', 'prescription', 'certificate', 'referral');
CREATE TYPE "public"."patient_sex" AS ENUM('male', 'female');
CREATE TYPE "public"."payment_method" AS ENUM('cash', 'credit_card', 'debit_card', 'pix', 'bank_transfer', 'health_insurance', 'other');
CREATE TYPE "public"."permission_module" AS ENUM('dashboard', 'appointments', 'agenda', 'doctors', 'patients', 'medical_records', 'documents', 'financial', 'insurance', 'stock', 'employees', 'reports', 'settings');
CREATE TYPE "public"."recipient_status" AS ENUM('pending', 'sent', 'delivered', 'failed');
CREATE TYPE "public"."reminder_channel" AS ENUM('email', 'sms', 'whatsapp');
CREATE TYPE "public"."reminder_status" AS ENUM('pending', 'sent', 'failed');
CREATE TYPE "public"."stock_category" AS ENUM('medication', 'material', 'equipment', 'epi', 'cleaning', 'office', 'other');
CREATE TYPE "public"."stock_movement_type" AS ENUM('entry', 'exit', 'adjustment');
CREATE TYPE "public"."system_log_level" AS ENUM('info', 'warning', 'error', 'critical');
CREATE TYPE "public"."teleconsultation_status" AS ENUM('scheduled', 'waiting', 'in_progress', 'completed', 'cancelled');
CREATE TYPE "public"."transaction_category" AS ENUM('consultation', 'exam', 'procedure', 'medication', 'salary', 'rent', 'utilities', 'supplies', 'equipment', 'marketing', 'taxes', 'insurance', 'maintenance', 'other');
CREATE TYPE "public"."transaction_status" AS ENUM('pending', 'paid', 'overdue', 'cancelled');
CREATE TYPE "public"."transaction_type" AS ENUM('income', 'expense');
CREATE TYPE "public"."waiting_list_status" AS ENUM('waiting', 'contacted', 'scheduled', 'cancelled');
CREATE TYPE "public"."whatsapp_connection_status" AS ENUM('disconnected', 'connecting', 'connected');
CREATE TYPE "public"."whatsapp_message_direction" AS ENUM('inbound', 'outbound');
CREATE TYPE "public"."whatsapp_message_status" AS ENUM('pending', 'sent', 'delivered', 'read', 'failed');
CREATE TYPE "public"."whatsapp_message_type" AS ENUM('text', 'image', 'audio', 'video', 'document', 'location', 'contact');

-- =============================================
-- TABELAS PRINCIPAIS (Auth / Usuários)
-- =============================================

CREATE TABLE "users" (
  "id" text PRIMARY KEY NOT NULL,
  "name" text NOT NULL,
  "email" text NOT NULL,
  "email_verified" boolean NOT NULL,
  "image" text,
  "stripe_customer_id" text,
  "stripe_subscription_id" text,
  "plan" text,
  "two_factor_enabled" boolean,
  "onboarding_completed" boolean DEFAULT false,
  "referral_source" text,
  "created_at" timestamp NOT NULL,
  "updated_at" timestamp NOT NULL,
  CONSTRAINT "users_email_unique" UNIQUE("email")
);

CREATE TABLE "two_factors" (
  "id" text PRIMARY KEY NOT NULL,
  "secret" text NOT NULL,
  "backup_codes" text NOT NULL,
  "user_id" text NOT NULL
);

CREATE TABLE "sessions" (
  "id" text PRIMARY KEY NOT NULL,
  "expires_at" timestamp NOT NULL,
  "token" text NOT NULL,
  "created_at" timestamp NOT NULL,
  "updated_at" timestamp NOT NULL,
  "ip_address" text,
  "user_agent" text,
  "user_id" text NOT NULL,
  CONSTRAINT "sessions_token_unique" UNIQUE("token")
);

CREATE TABLE "accounts" (
  "id" text PRIMARY KEY NOT NULL,
  "account_id" text NOT NULL,
  "provider_id" text NOT NULL,
  "user_id" text NOT NULL,
  "access_token" text,
  "refresh_token" text,
  "id_token" text,
  "access_token_expires_at" timestamp,
  "refresh_token_expires_at" timestamp,
  "scope" text,
  "password" text,
  "created_at" timestamp NOT NULL,
  "updated_at" timestamp NOT NULL
);

CREATE TABLE "verifications" (
  "id" text PRIMARY KEY NOT NULL,
  "identifier" text NOT NULL,
  "value" text NOT NULL,
  "expires_at" timestamp NOT NULL,
  "created_at" timestamp,
  "updated_at" timestamp
);

-- =============================================
-- CLÍNICAS
-- =============================================

CREATE TABLE "clinics" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "name" text NOT NULL,
  "logo_url" text,
  "primary_color" text DEFAULT '#7C3AED',
  "secondary_color" text DEFAULT '#6366F1',
  "accent_color" text DEFAULT '#8B5CF6',
  "clinic_type" text DEFAULT 'medical_clinic',
  "plan" text DEFAULT 'starter',
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now()
);

CREATE TABLE "users_to_clinics" (
  "user_id" text NOT NULL,
  "clinic_id" uuid NOT NULL,
  "role" "clinic_member_role" DEFAULT 'owner' NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now()
);

-- =============================================
-- MÉDICOS
-- =============================================

CREATE TABLE "doctors" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "clinic_id" uuid NOT NULL,
  "name" text NOT NULL,
  "avatar_image_url" text,
  "available_from_week_day" integer NOT NULL,
  "available_to_week_day" integer NOT NULL,
  "available_from_time" time NOT NULL,
  "available_to_time" time NOT NULL,
  "specialty" text NOT NULL,
  "appointment_price_in_cents" integer NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now()
);

-- =============================================
-- PACIENTES
-- =============================================

CREATE TABLE "patients" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "clinic_id" uuid NOT NULL,
  "name" text NOT NULL,
  "email" text NOT NULL,
  "phone_number" text NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "sex" "patient_sex" NOT NULL,
  "updated_at" timestamp DEFAULT now()
);

CREATE TABLE "patient_profiles" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "patient_id" uuid NOT NULL,
  "clinic_id" uuid NOT NULL,
  "cpf" text,
  "rg" text,
  "date_of_birth" timestamp,
  "blood_type" text,
  "allergies" text,
  "chronic_conditions" text,
  "medications" text,
  "emergency_contact_name" text,
  "emergency_contact_phone" text,
  "insurance_provider" text,
  "insurance_number" text,
  "address" text,
  "city" text,
  "state" text,
  "zip_code" text,
  "notes" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now()
);

CREATE TABLE "patient_users" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "clinic_id" uuid NOT NULL,
  "patient_id" uuid NOT NULL,
  "email" text NOT NULL,
  "password_hash" text NOT NULL,
  "is_active" boolean DEFAULT true NOT NULL,
  "last_login_at" timestamp,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "patient_portal_tokens" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "patient_user_id" uuid NOT NULL,
  "token" text NOT NULL,
  "expires_at" timestamp NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "patient_portal_tokens_token_unique" UNIQUE("token")
);

-- =============================================
-- AGENDAMENTOS
-- =============================================

CREATE TABLE "appointments" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "date" timestamp NOT NULL,
  "appointment_price_in_cents" integer NOT NULL,
  "status" "appointment_status" DEFAULT 'scheduled' NOT NULL,
  "clinic_id" uuid NOT NULL,
  "patient_id" uuid NOT NULL,
  "doctor_id" uuid NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now()
);

CREATE TABLE "appointment_reminders" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "clinic_id" uuid NOT NULL,
  "appointment_id" uuid NOT NULL,
  "channel" "reminder_channel" NOT NULL,
  "scheduled_for" timestamp NOT NULL,
  "sent_at" timestamp,
  "status" "reminder_status" DEFAULT 'pending' NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);

-- =============================================
-- PRONTUÁRIOS / DOCUMENTOS
-- =============================================

CREATE TABLE "medical_records" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "clinic_id" uuid NOT NULL,
  "patient_id" uuid NOT NULL,
  "doctor_id" uuid NOT NULL,
  "appointment_id" uuid,
  "type" "medical_record_type" NOT NULL,
  "title" text NOT NULL,
  "content" text NOT NULL,
  "cid10_code" text,
  "cid10_description" text,
  "is_private" boolean DEFAULT false,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now()
);

CREATE TABLE "medical_attachments" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "clinic_id" uuid NOT NULL,
  "patient_id" uuid NOT NULL,
  "medical_record_id" uuid,
  "file_name" text NOT NULL,
  "file_url" text NOT NULL,
  "file_type" text NOT NULL,
  "file_size_in_bytes" integer NOT NULL,
  "description" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now()
);

CREATE TABLE "vitals" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "clinic_id" uuid NOT NULL,
  "patient_id" uuid NOT NULL,
  "appointment_id" uuid,
  "recorded_by" uuid,
  "systolic_bp" integer,
  "diastolic_bp" integer,
  "heart_rate" integer,
  "temperature" integer,
  "weight_in_grams" integer,
  "height_in_cm" integer,
  "oxygen_saturation" integer,
  "respiratory_rate" integer,
  "notes" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now()
);

CREATE TABLE "documents" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "clinic_id" uuid NOT NULL,
  "patient_id" uuid NOT NULL,
  "doctor_id" uuid NOT NULL,
  "appointment_id" uuid,
  "type" "document_type" NOT NULL,
  "title" text NOT NULL,
  "content" text NOT NULL,
  "metadata" jsonb,
  "pdf_url" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now()
);

CREATE TABLE "document_templates" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "clinic_id" uuid NOT NULL,
  "type" "document_type" NOT NULL,
  "name" text NOT NULL,
  "content" text NOT NULL,
  "is_default" boolean DEFAULT false,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now()
);

-- =============================================
-- FINANCEIRO
-- =============================================

CREATE TABLE "financial_transactions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "clinic_id" uuid NOT NULL,
  "type" "transaction_type" NOT NULL,
  "category" "transaction_category" NOT NULL,
  "description" text NOT NULL,
  "amount_in_cents" integer NOT NULL,
  "payment_method" "payment_method",
  "status" "transaction_status" DEFAULT 'pending' NOT NULL,
  "due_date" timestamp,
  "payment_date" timestamp,
  "patient_id" uuid,
  "doctor_id" uuid,
  "appointment_id" uuid,
  "notes" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now()
);

CREATE TABLE "doctor_commissions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "clinic_id" uuid NOT NULL,
  "doctor_id" uuid NOT NULL,
  "commission_percentage" integer NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now()
);

-- =============================================
-- CONVÊNIOS
-- =============================================

CREATE TABLE "insurance_providers" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "clinic_id" uuid NOT NULL,
  "name" text NOT NULL,
  "ans_code" text,
  "contact_phone" text,
  "contact_email" text,
  "is_active" boolean DEFAULT true,
  "notes" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now()
);

CREATE TABLE "insurance_price_tables" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "clinic_id" uuid NOT NULL,
  "insurance_provider_id" uuid NOT NULL,
  "procedure_code" text NOT NULL,
  "procedure_name" text NOT NULL,
  "price_in_cents" integer NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now()
);

-- =============================================
-- AGENDA (Bloqueios / Lista de Espera)
-- =============================================

CREATE TABLE "doctor_schedule_blocks" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "clinic_id" uuid NOT NULL,
  "doctor_id" uuid NOT NULL,
  "title" text NOT NULL,
  "start_date" timestamp NOT NULL,
  "end_date" timestamp NOT NULL,
  "reason" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now()
);

CREATE TABLE "waiting_list" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "clinic_id" uuid NOT NULL,
  "patient_id" uuid NOT NULL,
  "doctor_id" uuid,
  "preferred_date" timestamp,
  "notes" text,
  "status" "waiting_list_status" DEFAULT 'waiting' NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now()
);

-- =============================================
-- ESTOQUE
-- =============================================

CREATE TABLE "stock_items" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "clinic_id" uuid NOT NULL,
  "name" text NOT NULL,
  "category" "stock_category" NOT NULL,
  "sku" text,
  "current_quantity" integer DEFAULT 0 NOT NULL,
  "minimum_quantity" integer DEFAULT 0 NOT NULL,
  "cost_in_cents" integer,
  "expiration_date" timestamp,
  "location" text,
  "notes" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now()
);

CREATE TABLE "stock_movements" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "clinic_id" uuid NOT NULL,
  "stock_item_id" uuid NOT NULL,
  "type" "stock_movement_type" NOT NULL,
  "quantity" integer NOT NULL,
  "batch" text,
  "notes" text,
  "created_at" timestamp DEFAULT now() NOT NULL
);

-- =============================================
-- FUNCIONÁRIOS / PERMISSÕES / PONTO
-- =============================================

CREATE TABLE "employees" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "clinic_id" uuid NOT NULL,
  "name" text NOT NULL,
  "email" text,
  "phone_number" text,
  "cpf" text,
  "role" "employee_role" NOT NULL,
  "specialty" text,
  "doctor_id" uuid,
  "hire_date" timestamp,
  "salary_in_cents" integer,
  "is_active" boolean DEFAULT true NOT NULL,
  "notes" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now()
);

CREATE TABLE "permissions" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "clinic_id" uuid NOT NULL,
  "employee_id" uuid NOT NULL,
  "module" "permission_module" NOT NULL,
  "can_view" boolean DEFAULT false NOT NULL,
  "can_create" boolean DEFAULT false NOT NULL,
  "can_edit" boolean DEFAULT false NOT NULL,
  "can_delete" boolean DEFAULT false NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now()
);

CREATE TABLE "time_tracking" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "clinic_id" uuid NOT NULL,
  "employee_id" uuid NOT NULL,
  "clock_in" timestamp NOT NULL,
  "clock_out" timestamp,
  "notes" text,
  "created_at" timestamp DEFAULT now() NOT NULL
);

-- =============================================
-- CAMPANHAS / MARKETING
-- =============================================

CREATE TABLE "campaigns" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "clinic_id" uuid NOT NULL,
  "name" text NOT NULL,
  "type" "campaign_type" NOT NULL,
  "channel" "campaign_channel" NOT NULL,
  "subject" text,
  "template" text NOT NULL,
  "status" "campaign_status" DEFAULT 'draft' NOT NULL,
  "scheduled_for" timestamp,
  "sent_at" timestamp,
  "recipient_count" integer DEFAULT 0 NOT NULL,
  "notes" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now()
);

CREATE TABLE "campaign_recipients" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "clinic_id" uuid NOT NULL,
  "campaign_id" uuid NOT NULL,
  "patient_id" uuid NOT NULL,
  "status" "recipient_status" DEFAULT 'pending' NOT NULL,
  "sent_at" timestamp,
  "created_at" timestamp DEFAULT now() NOT NULL
);

-- =============================================
-- PESQUISA DE SATISFAÇÃO
-- =============================================

CREATE TABLE "satisfaction_surveys" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "clinic_id" uuid NOT NULL,
  "patient_id" uuid NOT NULL,
  "appointment_id" uuid,
  "score" integer NOT NULL,
  "comment" text,
  "token" text NOT NULL,
  "responded_at" timestamp,
  "created_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "satisfaction_surveys_token_unique" UNIQUE("token")
);

-- =============================================
-- LGPD / CONSENTIMENTO / RETENÇÃO
-- =============================================

CREATE TABLE "consent_terms" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "clinic_id" uuid NOT NULL,
  "patient_id" uuid NOT NULL,
  "type" "consent_type" NOT NULL,
  "version" text DEFAULT '1.0' NOT NULL,
  "accepted" boolean DEFAULT false NOT NULL,
  "accepted_at" timestamp,
  "revoked_at" timestamp,
  "ip_address" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "data_retention_policies" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "clinic_id" uuid NOT NULL,
  "data_type" text NOT NULL,
  "retention_days" integer NOT NULL,
  "description" text,
  "is_active" boolean DEFAULT true NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

-- =============================================
-- AUDITORIA / LOGS
-- =============================================

CREATE TABLE "audit_logs" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "clinic_id" uuid NOT NULL,
  "user_id" text,
  "action" "audit_action" NOT NULL,
  "module" text NOT NULL,
  "resource_id" text,
  "resource_type" text,
  "description" text,
  "metadata" jsonb,
  "ip_address" text,
  "user_agent" text,
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "system_logs" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "clinic_id" uuid,
  "user_id" text,
  "level" "system_log_level" NOT NULL,
  "module" text NOT NULL,
  "message" text NOT NULL,
  "stack_trace" text,
  "metadata" jsonb,
  "ip_address" text,
  "user_agent" text,
  "created_at" timestamp DEFAULT now() NOT NULL
);

-- =============================================
-- WHATSAPP
-- =============================================

CREATE TABLE "whatsapp_connections" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "clinic_id" uuid NOT NULL,
  "instance_name" text NOT NULL,
  "phone_number" text,
  "status" "whatsapp_connection_status" DEFAULT 'disconnected' NOT NULL,
  "api_url" text NOT NULL,
  "api_key" text NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "whatsapp_contacts" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "clinic_id" uuid NOT NULL,
  "name" text,
  "phone_number" text NOT NULL,
  "profile_picture_url" text,
  "email" text,
  "notes" text,
  "patient_id" uuid,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now()
);

CREATE TABLE "whatsapp_conversations" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "clinic_id" uuid NOT NULL,
  "connection_id" uuid NOT NULL,
  "contact_id" uuid,
  "remote_phone" text NOT NULL,
  "contact_name" text,
  "is_read" boolean DEFAULT true NOT NULL,
  "is_archived" boolean DEFAULT false NOT NULL,
  "assigned_to_user_id" text,
  "last_message_content" text,
  "last_message_at" timestamp,
  "last_message_direction" "whatsapp_message_direction",
  "unread_count" integer DEFAULT 0 NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now()
);

CREATE TABLE "whatsapp_messages" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "clinic_id" uuid NOT NULL,
  "connection_id" uuid NOT NULL,
  "patient_id" uuid,
  "remote_phone" text NOT NULL,
  "direction" "whatsapp_message_direction" NOT NULL,
  "message_type" "whatsapp_message_type" DEFAULT 'text' NOT NULL,
  "content" text,
  "media_url" text,
  "status" "whatsapp_message_status" DEFAULT 'pending' NOT NULL,
  "external_id" text,
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "whatsapp_labels" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "clinic_id" uuid NOT NULL,
  "name" text NOT NULL,
  "color" text NOT NULL DEFAULT '#6366F1',
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now()
);

CREATE TABLE "whatsapp_conversation_labels" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "conversation_id" uuid NOT NULL,
  "label_id" uuid NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "whatsapp_message_templates" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "clinic_id" uuid NOT NULL,
  "name" text NOT NULL,
  "content" text NOT NULL,
  "category" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now()
);

CREATE TABLE "quick_replies" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "clinic_id" uuid NOT NULL,
  "shortcut" text NOT NULL,
  "content" text NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

-- =============================================
-- TELECONSULTA
-- =============================================

CREATE TABLE "teleconsultations" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "clinic_id" uuid NOT NULL,
  "appointment_id" uuid,
  "doctor_id" uuid NOT NULL,
  "patient_id" uuid NOT NULL,
  "room_id" text NOT NULL,
  "room_url" text,
  "status" "teleconsultation_status" DEFAULT 'scheduled' NOT NULL,
  "scheduled_for" timestamp NOT NULL,
  "started_at" timestamp,
  "ended_at" timestamp,
  "duration_minutes" integer,
  "patient_token" text NOT NULL,
  "patient_consent" boolean DEFAULT false NOT NULL,
  "notes" text,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "teleconsultations_room_id_unique" UNIQUE("room_id"),
  CONSTRAINT "teleconsultations_patient_token_unique" UNIQUE("patient_token")
);

-- =============================================
-- IA / AGENTE
-- =============================================

CREATE TABLE "ai_agent_config" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "clinic_id" uuid NOT NULL,
  "is_active" boolean DEFAULT false NOT NULL,
  "provider" text DEFAULT 'openai' NOT NULL,
  "model" text DEFAULT 'gpt-4o-mini' NOT NULL,
  "system_prompt" text,
  "enable_scheduling" boolean DEFAULT true NOT NULL,
  "enable_patient_lookup" boolean DEFAULT true NOT NULL,
  "enable_availability_check" boolean DEFAULT true NOT NULL,
  "enable_greeting" boolean DEFAULT true NOT NULL,
  "max_tokens_per_message" integer DEFAULT 500 NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "ai_agent_config_clinic_id_unique" UNIQUE("clinic_id")
);

CREATE TABLE "ai_conversations" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "clinic_id" uuid NOT NULL,
  "phone_number" text NOT NULL,
  "patient_id" uuid,
  "status" "ai_conversation_status" DEFAULT 'active' NOT NULL,
  "resolved_action" text,
  "context" jsonb,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "ai_messages" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "clinic_id" uuid NOT NULL,
  "conversation_id" uuid NOT NULL,
  "role" "ai_message_role" NOT NULL,
  "content" text NOT NULL,
  "tokens_used" integer,
  "created_at" timestamp DEFAULT now() NOT NULL
);

-- =============================================
-- CONVITES DE CLÍNICA
-- =============================================

CREATE TABLE "clinic_invitations" (
  "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
  "clinic_id" uuid NOT NULL,
  "invited_by_user_id" text NOT NULL,
  "email" text NOT NULL,
  "role" "clinic_member_role" DEFAULT 'member' NOT NULL,
  "status" "invitation_status" DEFAULT 'pending' NOT NULL,
  "token" text NOT NULL,
  "expires_at" timestamp NOT NULL,
  "accepted_at" timestamp,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now(),
  CONSTRAINT "clinic_invitations_token_unique" UNIQUE("token")
);

-- =============================================
-- FOREIGN KEYS
-- =============================================

-- Auth
ALTER TABLE "two_factors" ADD CONSTRAINT "two_factors_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;

-- Clínicas
ALTER TABLE "users_to_clinics" ADD CONSTRAINT "users_to_clinics_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "users_to_clinics" ADD CONSTRAINT "users_to_clinics_clinic_id_clinics_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE cascade ON UPDATE no action;

-- Médicos
ALTER TABLE "doctors" ADD CONSTRAINT "doctors_clinic_id_clinics_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE cascade ON UPDATE no action;

-- Pacientes
ALTER TABLE "patients" ADD CONSTRAINT "patients_clinic_id_clinics_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "patient_profiles" ADD CONSTRAINT "patient_profiles_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "patient_profiles" ADD CONSTRAINT "patient_profiles_clinic_id_clinics_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "patient_users" ADD CONSTRAINT "patient_users_clinic_id_clinics_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "patient_users" ADD CONSTRAINT "patient_users_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "patient_portal_tokens" ADD CONSTRAINT "patient_portal_tokens_patient_user_id_patient_users_id_fk" FOREIGN KEY ("patient_user_id") REFERENCES "public"."patient_users"("id") ON DELETE cascade ON UPDATE no action;

-- Agendamentos
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_clinic_id_clinics_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_doctor_id_doctors_id_fk" FOREIGN KEY ("doctor_id") REFERENCES "public"."doctors"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "appointment_reminders" ADD CONSTRAINT "appointment_reminders_clinic_id_clinics_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "appointment_reminders" ADD CONSTRAINT "appointment_reminders_appointment_id_appointments_id_fk" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("id") ON DELETE cascade ON UPDATE no action;

-- Prontuários
ALTER TABLE "medical_records" ADD CONSTRAINT "medical_records_clinic_id_clinics_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "medical_records" ADD CONSTRAINT "medical_records_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "medical_records" ADD CONSTRAINT "medical_records_doctor_id_doctors_id_fk" FOREIGN KEY ("doctor_id") REFERENCES "public"."doctors"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "medical_records" ADD CONSTRAINT "medical_records_appointment_id_appointments_id_fk" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "medical_attachments" ADD CONSTRAINT "medical_attachments_clinic_id_clinics_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "medical_attachments" ADD CONSTRAINT "medical_attachments_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "medical_attachments" ADD CONSTRAINT "medical_attachments_medical_record_id_medical_records_id_fk" FOREIGN KEY ("medical_record_id") REFERENCES "public"."medical_records"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "vitals" ADD CONSTRAINT "vitals_clinic_id_clinics_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "vitals" ADD CONSTRAINT "vitals_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "vitals" ADD CONSTRAINT "vitals_appointment_id_appointments_id_fk" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "vitals" ADD CONSTRAINT "vitals_recorded_by_doctors_id_fk" FOREIGN KEY ("recorded_by") REFERENCES "public"."doctors"("id") ON DELETE set null ON UPDATE no action;

-- Documentos
ALTER TABLE "documents" ADD CONSTRAINT "documents_clinic_id_clinics_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "documents" ADD CONSTRAINT "documents_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "documents" ADD CONSTRAINT "documents_doctor_id_doctors_id_fk" FOREIGN KEY ("doctor_id") REFERENCES "public"."doctors"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "documents" ADD CONSTRAINT "documents_appointment_id_appointments_id_fk" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "document_templates" ADD CONSTRAINT "document_templates_clinic_id_clinics_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE cascade ON UPDATE no action;

-- Financeiro
ALTER TABLE "financial_transactions" ADD CONSTRAINT "financial_transactions_clinic_id_clinics_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "financial_transactions" ADD CONSTRAINT "financial_transactions_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "financial_transactions" ADD CONSTRAINT "financial_transactions_doctor_id_doctors_id_fk" FOREIGN KEY ("doctor_id") REFERENCES "public"."doctors"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "financial_transactions" ADD CONSTRAINT "financial_transactions_appointment_id_appointments_id_fk" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "doctor_commissions" ADD CONSTRAINT "doctor_commissions_clinic_id_clinics_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "doctor_commissions" ADD CONSTRAINT "doctor_commissions_doctor_id_doctors_id_fk" FOREIGN KEY ("doctor_id") REFERENCES "public"."doctors"("id") ON DELETE cascade ON UPDATE no action;

-- Convênios
ALTER TABLE "insurance_providers" ADD CONSTRAINT "insurance_providers_clinic_id_clinics_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "insurance_price_tables" ADD CONSTRAINT "insurance_price_tables_clinic_id_clinics_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "insurance_price_tables" ADD CONSTRAINT "insurance_price_tables_insurance_provider_id_insurance_providers_id_fk" FOREIGN KEY ("insurance_provider_id") REFERENCES "public"."insurance_providers"("id") ON DELETE cascade ON UPDATE no action;

-- Agenda
ALTER TABLE "doctor_schedule_blocks" ADD CONSTRAINT "doctor_schedule_blocks_clinic_id_clinics_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "doctor_schedule_blocks" ADD CONSTRAINT "doctor_schedule_blocks_doctor_id_doctors_id_fk" FOREIGN KEY ("doctor_id") REFERENCES "public"."doctors"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "waiting_list" ADD CONSTRAINT "waiting_list_clinic_id_clinics_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "waiting_list" ADD CONSTRAINT "waiting_list_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "waiting_list" ADD CONSTRAINT "waiting_list_doctor_id_doctors_id_fk" FOREIGN KEY ("doctor_id") REFERENCES "public"."doctors"("id") ON DELETE set null ON UPDATE no action;

-- Estoque
ALTER TABLE "stock_items" ADD CONSTRAINT "stock_items_clinic_id_clinics_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_clinic_id_clinics_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_stock_item_id_stock_items_id_fk" FOREIGN KEY ("stock_item_id") REFERENCES "public"."stock_items"("id") ON DELETE cascade ON UPDATE no action;

-- Funcionários
ALTER TABLE "employees" ADD CONSTRAINT "employees_clinic_id_clinics_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "employees" ADD CONSTRAINT "employees_doctor_id_doctors_id_fk" FOREIGN KEY ("doctor_id") REFERENCES "public"."doctors"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "permissions" ADD CONSTRAINT "permissions_clinic_id_clinics_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "permissions" ADD CONSTRAINT "permissions_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "time_tracking" ADD CONSTRAINT "time_tracking_clinic_id_clinics_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "time_tracking" ADD CONSTRAINT "time_tracking_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE cascade ON UPDATE no action;

-- Campanhas
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_clinic_id_clinics_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "campaign_recipients" ADD CONSTRAINT "campaign_recipients_clinic_id_clinics_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "campaign_recipients" ADD CONSTRAINT "campaign_recipients_campaign_id_campaigns_id_fk" FOREIGN KEY ("campaign_id") REFERENCES "public"."campaigns"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "campaign_recipients" ADD CONSTRAINT "campaign_recipients_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE cascade ON UPDATE no action;

-- Pesquisa de Satisfação
ALTER TABLE "satisfaction_surveys" ADD CONSTRAINT "satisfaction_surveys_clinic_id_clinics_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "satisfaction_surveys" ADD CONSTRAINT "satisfaction_surveys_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "satisfaction_surveys" ADD CONSTRAINT "satisfaction_surveys_appointment_id_appointments_id_fk" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("id") ON DELETE set null ON UPDATE no action;

-- LGPD
ALTER TABLE "consent_terms" ADD CONSTRAINT "consent_terms_clinic_id_clinics_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "consent_terms" ADD CONSTRAINT "consent_terms_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "data_retention_policies" ADD CONSTRAINT "data_retention_policies_clinic_id_clinics_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE cascade ON UPDATE no action;

-- Auditoria / Logs
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_clinic_id_clinics_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "system_logs" ADD CONSTRAINT "system_logs_clinic_id_clinics_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "system_logs" ADD CONSTRAINT "system_logs_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;

-- WhatsApp
ALTER TABLE "whatsapp_connections" ADD CONSTRAINT "whatsapp_connections_clinic_id_clinics_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "whatsapp_contacts" ADD CONSTRAINT "whatsapp_contacts_clinic_id_clinics_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "whatsapp_contacts" ADD CONSTRAINT "whatsapp_contacts_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "whatsapp_conversations" ADD CONSTRAINT "whatsapp_conversations_clinic_id_clinics_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "whatsapp_conversations" ADD CONSTRAINT "whatsapp_conversations_connection_id_whatsapp_connections_id_fk" FOREIGN KEY ("connection_id") REFERENCES "public"."whatsapp_connections"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "whatsapp_conversations" ADD CONSTRAINT "whatsapp_conversations_contact_id_whatsapp_contacts_id_fk" FOREIGN KEY ("contact_id") REFERENCES "public"."whatsapp_contacts"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "whatsapp_conversations" ADD CONSTRAINT "whatsapp_conversations_assigned_to_user_id_users_id_fk" FOREIGN KEY ("assigned_to_user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "whatsapp_messages" ADD CONSTRAINT "whatsapp_messages_clinic_id_clinics_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "whatsapp_messages" ADD CONSTRAINT "whatsapp_messages_connection_id_whatsapp_connections_id_fk" FOREIGN KEY ("connection_id") REFERENCES "public"."whatsapp_connections"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "whatsapp_messages" ADD CONSTRAINT "whatsapp_messages_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "whatsapp_labels" ADD CONSTRAINT "whatsapp_labels_clinic_id_clinics_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "whatsapp_conversation_labels" ADD CONSTRAINT "whatsapp_conversation_labels_conversation_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."whatsapp_conversations"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "whatsapp_conversation_labels" ADD CONSTRAINT "whatsapp_conversation_labels_label_id_fk" FOREIGN KEY ("label_id") REFERENCES "public"."whatsapp_labels"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "whatsapp_message_templates" ADD CONSTRAINT "whatsapp_message_templates_clinic_id_clinics_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "quick_replies" ADD CONSTRAINT "quick_replies_clinic_id_clinics_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE cascade ON UPDATE no action;

-- Teleconsulta
ALTER TABLE "teleconsultations" ADD CONSTRAINT "teleconsultations_clinic_id_clinics_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "teleconsultations" ADD CONSTRAINT "teleconsultations_appointment_id_appointments_id_fk" FOREIGN KEY ("appointment_id") REFERENCES "public"."appointments"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "teleconsultations" ADD CONSTRAINT "teleconsultations_doctor_id_doctors_id_fk" FOREIGN KEY ("doctor_id") REFERENCES "public"."doctors"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "teleconsultations" ADD CONSTRAINT "teleconsultations_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE cascade ON UPDATE no action;

-- IA
ALTER TABLE "ai_agent_config" ADD CONSTRAINT "ai_agent_config_clinic_id_clinics_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "ai_conversations" ADD CONSTRAINT "ai_conversations_clinic_id_clinics_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "ai_conversations" ADD CONSTRAINT "ai_conversations_patient_id_patients_id_fk" FOREIGN KEY ("patient_id") REFERENCES "public"."patients"("id") ON DELETE set null ON UPDATE no action;
ALTER TABLE "ai_messages" ADD CONSTRAINT "ai_messages_clinic_id_clinics_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "ai_messages" ADD CONSTRAINT "ai_messages_conversation_id_ai_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "public"."ai_conversations"("id") ON DELETE cascade ON UPDATE no action;

-- Convites
ALTER TABLE "clinic_invitations" ADD CONSTRAINT "clinic_invitations_clinic_id_clinics_id_fk" FOREIGN KEY ("clinic_id") REFERENCES "public"."clinics"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "clinic_invitations" ADD CONSTRAINT "clinic_invitations_invited_by_user_id_users_id_fk" FOREIGN KEY ("invited_by_user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
