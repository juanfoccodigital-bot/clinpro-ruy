-- =============================================
-- ClinPro - Seed de Desenvolvimento
-- Login: dev@clinpro.com / Senha: 12345678
-- =============================================

-- Senha "12345678" com bcrypt (hash gerado com bcryptjs, cost 10)
-- Esse hash funciona com o better-auth que usa bcryptjs

-- 1. Criar usuário dev
INSERT INTO "users" ("id", "name", "email", "email_verified", "image", "plan", "onboarding_completed", "created_at", "updated_at")
VALUES (
  'dev-user-001',
  'Dev Admin',
  'dev@clinpro.com',
  true,
  NULL,
  'professional',
  true,
  NOW(),
  NOW()
) ON CONFLICT ("email") DO NOTHING;

-- 2. Criar account com senha (better-auth armazena a senha na tabela accounts)
INSERT INTO "accounts" ("id", "account_id", "provider_id", "user_id", "password", "created_at", "updated_at")
VALUES (
  'dev-account-001',
  'dev-user-001',
  'credential',
  'dev-user-001',
  '$2b$10$Rc6R4gSigBDz0mX5YFxDIumnkUZ6OOkoroBBzh6ttIXhhrpSR7hQ6',
  NOW(),
  NOW()
) ON CONFLICT DO NOTHING;

-- 3. Criar clínica de desenvolvimento
INSERT INTO "clinics" ("id", "name", "logo_url", "clinic_type", "plan", "created_at", "updated_at")
VALUES (
  'a0000000-0000-0000-0000-000000000001',
  'Clínica Demo',
  NULL,
  'medical_clinic',
  'professional',
  NOW(),
  NOW()
) ON CONFLICT DO NOTHING;

-- 4. Vincular usuário à clínica como owner
INSERT INTO "users_to_clinics" ("user_id", "clinic_id", "role", "created_at", "updated_at")
VALUES (
  'dev-user-001',
  'a0000000-0000-0000-0000-000000000001',
  'owner',
  NOW(),
  NOW()
);
