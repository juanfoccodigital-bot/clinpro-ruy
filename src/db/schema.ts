import { relations } from "drizzle-orm";
import {
  boolean,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  text,
  time,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const usersTable = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull(),
  image: text("image"),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  plan: text("plan"),
  twoFactorEnabled: boolean("two_factor_enabled"),
  onboardingCompleted: boolean("onboarding_completed").default(false),
  referralSource: text("referral_source"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const usersTableRelations = relations(usersTable, ({ many }) => ({
  usersToClinics: many(usersToClinicsTable),
  twoFactors: many(twoFactorsTable),
}));

export const twoFactorsTable = pgTable("two_factors", {
  id: text("id").primaryKey(),
  secret: text("secret").notNull(),
  backupCodes: text("backup_codes").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
});

export const twoFactorsTableRelations = relations(
  twoFactorsTable,
  ({ one }) => ({
    user: one(usersTable, {
      fields: [twoFactorsTable.userId],
      references: [usersTable.id],
    }),
  }),
);

export const sessionsTable = pgTable("sessions", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
});

export const accountsTable = pgTable("accounts", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const verificationsTable = pgTable("verifications", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
});

export const clinicsTable = pgTable("clinics", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  // Whitelabel
  logoUrl: text("logo_url"),
  primaryColor: text("primary_color").default("#D4A017"),
  secondaryColor: text("secondary_color").default("#C49A00"),
  accentColor: text("accent_color").default("#E6B422"),
  // Clinic niche: medical_clinic | dental | aesthetics | physiotherapy | psychology | other
  clinicType: text("clinic_type").default("medical_clinic"),
  // Subscription plan: starter | professional | enterprise
  plan: text("plan").default("starter"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const clinicMemberRoleEnum = pgEnum("clinic_member_role", [
  "owner",
  "admin",
  "member",
  "viewer",
]);

export const usersToClinicsTable = pgTable("users_to_clinics", {
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  clinicId: uuid("clinic_id")
    .notNull()
    .references(() => clinicsTable.id, { onDelete: "cascade" }),
  role: clinicMemberRoleEnum("role").default("owner").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const usersToClinicsTableRelations = relations(
  usersToClinicsTable,
  ({ one }) => ({
    user: one(usersTable, {
      fields: [usersToClinicsTable.userId],
      references: [usersTable.id],
    }),
    clinic: one(clinicsTable, {
      fields: [usersToClinicsTable.clinicId],
      references: [clinicsTable.id],
    }),
  }),
);

export const clinicsTableRelations = relations(clinicsTable, ({ many }) => ({
  doctors: many(doctorsTable),
  patients: many(patientsTable),
  appointments: many(appointmentsTable),
  usersToClinics: many(usersToClinicsTable),
  patientProfiles: many(patientProfilesTable),
  medicalRecords: many(medicalRecordsTable),
  vitals: many(vitalsTable),
  medicalAttachments: many(medicalAttachmentsTable),
  documents: many(documentsTable),
  documentTemplates: many(documentTemplatesTable),
  financialTransactions: many(financialTransactionsTable),
  paymentMachines: many(paymentMachinesTable),
  doctorCommissions: many(doctorCommissionsTable),
  insuranceProviders: many(insuranceProvidersTable),
  insurancePriceTables: many(insurancePriceTablesTable),
  doctorScheduleBlocks: many(doctorScheduleBlocksTable),
  waitingList: many(waitingListTable),
  appointmentReminders: many(appointmentRemindersTable),
  stockItems: many(stockItemsTable),
  stockMovements: many(stockMovementsTable),
  employees: many(employeesTable),
  permissions: many(permissionsTable),
  timeTracking: many(timeTrackingTable),
  campaigns: many(campaignsTable),
  campaignRecipients: many(campaignRecipientsTable),
  satisfactionSurveys: many(satisfactionSurveysTable),
  auditLogs: many(auditLogsTable),
  consentTerms: many(consentTermsTable),
  dataRetentionPolicies: many(dataRetentionPoliciesTable),
  patientUsers: many(patientUsersTable),
  whatsappConnections: many(whatsappConnectionsTable),
  whatsappMessages: many(whatsappMessagesTable),
  quickReplies: many(quickRepliesTable),
  whatsappContacts: many(whatsappContactsTable),
  whatsappConversations: many(whatsappConversationsTable),
  whatsappLabels: many(whatsappLabelsTable),
  whatsappMessageTemplates: many(whatsappMessageTemplatesTable),
  aiAgentConfig: many(aiAgentConfigTable),
  aiConversations: many(aiConversationsTable),
  aiMessages: many(aiMessagesTable),
  invitations: many(clinicInvitationsTable),
  systemLogs: many(systemLogsTable),
  crmPipelineStages: many(crmPipelineStagesTable),
  crmContactStages: many(crmContactStagesTable),
}));

export const doctorsTable = pgTable("doctors", {
  id: uuid("id").defaultRandom().primaryKey(),
  clinicId: uuid("clinic_id")
    .notNull()
    .references(() => clinicsTable.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  avatarImageUrl: text("avatar_image_url"),
  // 1 - Monday, 2 - Tuesday, 3 - Wednesday, 4 - Thursday, 5 - Friday, 6 - Saturday, 0 - Sunday
  availableFromWeekDay: integer("available_from_week_day").notNull(),
  availableToWeekDay: integer("available_to_week_day").notNull(),
  availableFromTime: time("available_from_time").notNull(),
  availableToTime: time("available_to_time").notNull(),
  specialty: text("specialty").notNull(),
  appointmentPriceInCents: integer("appointment_price_in_cents").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const doctorsTableRelations = relations(
  doctorsTable,
  ({ many, one }) => ({
    clinic: one(clinicsTable, {
      fields: [doctorsTable.clinicId],
      references: [clinicsTable.id],
    }),
    appointments: many(appointmentsTable),
    scheduleBlocks: many(doctorScheduleBlocksTable),
  }),
);

export const patientSexEnum = pgEnum("patient_sex", ["male", "female"]);

export const patientsTable = pgTable("patients", {
  id: uuid("id").defaultRandom().primaryKey(),
  clinicId: uuid("clinic_id")
    .notNull()
    .references(() => clinicsTable.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phoneNumber: text("phone_number").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  sex: patientSexEnum("sex").notNull(),
  leadSource: text("lead_source"), // 'facebook', 'instagram', 'indicacao', 'google', 'site', 'outro'
  leadSourceDetail: text("lead_source_detail"), // specific campaign or person name
  leadAdName: text("lead_ad_name"), // ad/creative name
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const patientsTableRelations = relations(
  patientsTable,
  ({ one, many }) => ({
    clinic: one(clinicsTable, {
      fields: [patientsTable.clinicId],
      references: [clinicsTable.id],
    }),
    appointments: many(appointmentsTable),
    profile: one(patientProfilesTable),
    medicalRecords: many(medicalRecordsTable),
    vitals: many(vitalsTable),
    attachments: many(medicalAttachmentsTable),
    documents: many(documentsTable),
    crmContactStage: one(crmContactStagesTable),
  }),
);

export const appointmentStatusEnum = pgEnum("appointment_status", [
  "scheduled",
  "confirmed",
  "arrived",
  "in_service",
  "completed",
  "cancelled",
  "no_show",
]);

export const appointmentsTable = pgTable("appointments", {
  id: uuid("id").defaultRandom().primaryKey(),
  date: timestamp("date").notNull(),
  appointmentPriceInCents: integer("appointment_price_in_cents").notNull(),
  status: appointmentStatusEnum("status").default("scheduled").notNull(),
  clinicId: uuid("clinic_id")
    .notNull()
    .references(() => clinicsTable.id, { onDelete: "cascade" }),
  patientId: uuid("patient_id")
    .notNull()
    .references(() => patientsTable.id, { onDelete: "cascade" }),
  doctorId: uuid("doctor_id")
    .notNull()
    .references(() => doctorsTable.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const appointmentsTableRelations = relations(
  appointmentsTable,
  ({ one, many }) => ({
    clinic: one(clinicsTable, {
      fields: [appointmentsTable.clinicId],
      references: [clinicsTable.id],
    }),
    patient: one(patientsTable, {
      fields: [appointmentsTable.patientId],
      references: [patientsTable.id],
    }),
    doctor: one(doctorsTable, {
      fields: [appointmentsTable.doctorId],
      references: [doctorsTable.id],
    }),
    reminders: many(appointmentRemindersTable),
  }),
);

// ============================================================
// PRONTUARIO ELETRONICO (Fase 1)
// ============================================================

export const patientProfilesTable = pgTable("patient_profiles", {
  id: uuid("id").defaultRandom().primaryKey(),
  patientId: uuid("patient_id")
    .notNull()
    .references(() => patientsTable.id, { onDelete: "cascade" }),
  clinicId: uuid("clinic_id")
    .notNull()
    .references(() => clinicsTable.id, { onDelete: "cascade" }),
  cpf: text("cpf"),
  rg: text("rg"),
  dateOfBirth: timestamp("date_of_birth"),
  bloodType: text("blood_type"),
  allergies: text("allergies"),
  chronicConditions: text("chronic_conditions"),
  medications: text("medications"),
  emergencyContactName: text("emergency_contact_name"),
  emergencyContactPhone: text("emergency_contact_phone"),
  insuranceProvider: text("insurance_provider"),
  insuranceNumber: text("insurance_number"),
  address: text("address"),
  city: text("city"),
  state: text("state"),
  zipCode: text("zip_code"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const patientProfilesTableRelations = relations(
  patientProfilesTable,
  ({ one }) => ({
    patient: one(patientsTable, {
      fields: [patientProfilesTable.patientId],
      references: [patientsTable.id],
    }),
    clinic: one(clinicsTable, {
      fields: [patientProfilesTable.clinicId],
      references: [clinicsTable.id],
    }),
  }),
);

export const medicalRecordTypeEnum = pgEnum("medical_record_type", [
  "anamnesis",
  "evolution",
  "exam_result",
  "prescription",
  "certificate",
  "referral",
]);

export const medicalRecordsTable = pgTable("medical_records", {
  id: uuid("id").defaultRandom().primaryKey(),
  clinicId: uuid("clinic_id")
    .notNull()
    .references(() => clinicsTable.id, { onDelete: "cascade" }),
  patientId: uuid("patient_id")
    .notNull()
    .references(() => patientsTable.id, { onDelete: "cascade" }),
  doctorId: uuid("doctor_id")
    .notNull()
    .references(() => doctorsTable.id, { onDelete: "cascade" }),
  appointmentId: uuid("appointment_id").references(
    () => appointmentsTable.id,
    { onDelete: "set null" },
  ),
  type: medicalRecordTypeEnum("type").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  cid10Code: text("cid10_code"),
  cid10Description: text("cid10_description"),
  isPrivate: boolean("is_private").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const medicalRecordsTableRelations = relations(
  medicalRecordsTable,
  ({ one, many }) => ({
    clinic: one(clinicsTable, {
      fields: [medicalRecordsTable.clinicId],
      references: [clinicsTable.id],
    }),
    patient: one(patientsTable, {
      fields: [medicalRecordsTable.patientId],
      references: [patientsTable.id],
    }),
    doctor: one(doctorsTable, {
      fields: [medicalRecordsTable.doctorId],
      references: [doctorsTable.id],
    }),
    appointment: one(appointmentsTable, {
      fields: [medicalRecordsTable.appointmentId],
      references: [appointmentsTable.id],
    }),
    attachments: many(medicalAttachmentsTable),
  }),
);

export const vitalsTable = pgTable("vitals", {
  id: uuid("id").defaultRandom().primaryKey(),
  clinicId: uuid("clinic_id")
    .notNull()
    .references(() => clinicsTable.id, { onDelete: "cascade" }),
  patientId: uuid("patient_id")
    .notNull()
    .references(() => patientsTable.id, { onDelete: "cascade" }),
  appointmentId: uuid("appointment_id").references(
    () => appointmentsTable.id,
    { onDelete: "set null" },
  ),
  recordedBy: uuid("recorded_by").references(() => doctorsTable.id, {
    onDelete: "set null",
  }),
  systolicBP: integer("systolic_bp"),
  diastolicBP: integer("diastolic_bp"),
  heartRate: integer("heart_rate"),
  temperature: integer("temperature"),
  weightInGrams: integer("weight_in_grams"),
  heightInCm: integer("height_in_cm"),
  oxygenSaturation: integer("oxygen_saturation"),
  respiratoryRate: integer("respiratory_rate"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const vitalsTableRelations = relations(vitalsTable, ({ one }) => ({
  clinic: one(clinicsTable, {
    fields: [vitalsTable.clinicId],
    references: [clinicsTable.id],
  }),
  patient: one(patientsTable, {
    fields: [vitalsTable.patientId],
    references: [patientsTable.id],
  }),
  appointment: one(appointmentsTable, {
    fields: [vitalsTable.appointmentId],
    references: [appointmentsTable.id],
  }),
  recordedByDoctor: one(doctorsTable, {
    fields: [vitalsTable.recordedBy],
    references: [doctorsTable.id],
  }),
}));

export const medicalAttachmentsTable = pgTable("medical_attachments", {
  id: uuid("id").defaultRandom().primaryKey(),
  clinicId: uuid("clinic_id")
    .notNull()
    .references(() => clinicsTable.id, { onDelete: "cascade" }),
  patientId: uuid("patient_id")
    .notNull()
    .references(() => patientsTable.id, { onDelete: "cascade" }),
  medicalRecordId: uuid("medical_record_id").references(
    () => medicalRecordsTable.id,
    { onDelete: "cascade" },
  ),
  fileName: text("file_name").notNull(),
  fileUrl: text("file_url").notNull(),
  fileType: text("file_type").notNull(),
  fileSizeInBytes: integer("file_size_in_bytes").notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const medicalAttachmentsTableRelations = relations(
  medicalAttachmentsTable,
  ({ one }) => ({
    clinic: one(clinicsTable, {
      fields: [medicalAttachmentsTable.clinicId],
      references: [clinicsTable.id],
    }),
    patient: one(patientsTable, {
      fields: [medicalAttachmentsTable.patientId],
      references: [patientsTable.id],
    }),
    medicalRecord: one(medicalRecordsTable, {
      fields: [medicalAttachmentsTable.medicalRecordId],
      references: [medicalRecordsTable.id],
    }),
  }),
);

// ============================================================
// DOCUMENTOS DIGITAIS (Fase 2)
// ============================================================

export const documentTypeEnum = pgEnum("document_type", [
  "prescription",
  "certificate",
  "report",
  "exam_request",
  "referral",
]);

export const documentsTable = pgTable("documents", {
  id: uuid("id").defaultRandom().primaryKey(),
  clinicId: uuid("clinic_id")
    .notNull()
    .references(() => clinicsTable.id, { onDelete: "cascade" }),
  patientId: uuid("patient_id")
    .notNull()
    .references(() => patientsTable.id, { onDelete: "cascade" }),
  doctorId: uuid("doctor_id")
    .notNull()
    .references(() => doctorsTable.id, { onDelete: "cascade" }),
  appointmentId: uuid("appointment_id").references(
    () => appointmentsTable.id,
    { onDelete: "set null" },
  ),
  type: documentTypeEnum("type").notNull(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  metadata: jsonb("metadata"),
  pdfUrl: text("pdf_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const documentsTableRelations = relations(
  documentsTable,
  ({ one }) => ({
    clinic: one(clinicsTable, {
      fields: [documentsTable.clinicId],
      references: [clinicsTable.id],
    }),
    patient: one(patientsTable, {
      fields: [documentsTable.patientId],
      references: [patientsTable.id],
    }),
    doctor: one(doctorsTable, {
      fields: [documentsTable.doctorId],
      references: [doctorsTable.id],
    }),
    appointment: one(appointmentsTable, {
      fields: [documentsTable.appointmentId],
      references: [appointmentsTable.id],
    }),
  }),
);

export const documentTemplatesTable = pgTable("document_templates", {
  id: uuid("id").defaultRandom().primaryKey(),
  clinicId: uuid("clinic_id")
    .notNull()
    .references(() => clinicsTable.id, { onDelete: "cascade" }),
  type: documentTypeEnum("type").notNull(),
  name: text("name").notNull(),
  content: text("content").notNull(),
  isDefault: boolean("is_default").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const documentTemplatesTableRelations = relations(
  documentTemplatesTable,
  ({ one }) => ({
    clinic: one(clinicsTable, {
      fields: [documentTemplatesTable.clinicId],
      references: [clinicsTable.id],
    }),
  }),
);

// ============================================================
// FINANCEIRO (Fase 3)
// ============================================================

// Payment Machines (Maquininhas)
export const paymentMachinesTable = pgTable("payment_machines", {
  id: uuid("id").defaultRandom().primaryKey(),
  clinicId: uuid("clinic_id")
    .notNull()
    .references(() => clinicsTable.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  provider: text("provider").notNull(),
  debitFee: numeric("debit_fee", { precision: 5, scale: 2 })
    .notNull()
    .default("0"),
  creditFee: numeric("credit_fee", { precision: 5, scale: 2 })
    .notNull()
    .default("0"),
  credit2xFee: numeric("credit_2x_fee", { precision: 5, scale: 2 })
    .notNull()
    .default("0"),
  credit3xFee: numeric("credit_3x_fee", { precision: 5, scale: 2 })
    .notNull()
    .default("0"),
  credit4xFee: numeric("credit_4x_fee", { precision: 5, scale: 2 })
    .notNull()
    .default("0"),
  credit5xFee: numeric("credit_5x_fee", { precision: 5, scale: 2 })
    .notNull()
    .default("0"),
  credit6xFee: numeric("credit_6x_fee", { precision: 5, scale: 2 })
    .notNull()
    .default("0"),
  credit7_12xFee: numeric("credit_7_12x_fee", { precision: 5, scale: 2 })
    .notNull()
    .default("0"),
  pixFee: numeric("pix_fee", { precision: 5, scale: 2 })
    .notNull()
    .default("0"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const paymentMachinesTableRelations = relations(
  paymentMachinesTable,
  ({ one, many }) => ({
    clinic: one(clinicsTable, {
      fields: [paymentMachinesTable.clinicId],
      references: [clinicsTable.id],
    }),
    financialTransactions: many(financialTransactionsTable),
  }),
);

export const transactionTypeEnum = pgEnum("transaction_type", [
  "income",
  "expense",
]);

export const paymentMethodEnum = pgEnum("payment_method", [
  "cash",
  "credit_card",
  "debit_card",
  "pix",
  "bank_transfer",
  "health_insurance",
  "other",
]);

export const transactionStatusEnum = pgEnum("transaction_status", [
  "pending",
  "paid",
  "overdue",
  "cancelled",
]);

export const transactionCategoryEnum = pgEnum("transaction_category", [
  "consultation",
  "exam",
  "procedure",
  "medication",
  "salary",
  "rent",
  "utilities",
  "supplies",
  "equipment",
  "marketing",
  "taxes",
  "insurance",
  "maintenance",
  "other",
]);

export const financialTransactionsTable = pgTable("financial_transactions", {
  id: uuid("id").defaultRandom().primaryKey(),
  clinicId: uuid("clinic_id")
    .notNull()
    .references(() => clinicsTable.id, { onDelete: "cascade" }),
  type: transactionTypeEnum("type").notNull(),
  category: transactionCategoryEnum("category").notNull(),
  description: text("description").notNull(),
  amountInCents: integer("amount_in_cents").notNull(),
  paymentMethod: paymentMethodEnum("payment_method"),
  status: transactionStatusEnum("status").default("pending").notNull(),
  dueDate: timestamp("due_date"),
  paymentDate: timestamp("payment_date"),
  patientId: uuid("patient_id").references(() => patientsTable.id, {
    onDelete: "set null",
  }),
  doctorId: uuid("doctor_id").references(() => doctorsTable.id, {
    onDelete: "set null",
  }),
  appointmentId: uuid("appointment_id").references(
    () => appointmentsTable.id,
    { onDelete: "set null" },
  ),
  notes: text("notes"),
  paymentMachineId: uuid("payment_machine_id").references(
    () => paymentMachinesTable.id,
  ),
  installments: integer("installments").default(1),
  feePercentage: numeric("fee_percentage", { precision: 5, scale: 2 }).default(
    "0",
  ),
  feeAmount: integer("fee_amount").default(0),
  netAmount: integer("net_amount"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const financialTransactionsTableRelations = relations(
  financialTransactionsTable,
  ({ one }) => ({
    clinic: one(clinicsTable, {
      fields: [financialTransactionsTable.clinicId],
      references: [clinicsTable.id],
    }),
    patient: one(patientsTable, {
      fields: [financialTransactionsTable.patientId],
      references: [patientsTable.id],
    }),
    doctor: one(doctorsTable, {
      fields: [financialTransactionsTable.doctorId],
      references: [doctorsTable.id],
    }),
    appointment: one(appointmentsTable, {
      fields: [financialTransactionsTable.appointmentId],
      references: [appointmentsTable.id],
    }),
    paymentMachine: one(paymentMachinesTable, {
      fields: [financialTransactionsTable.paymentMachineId],
      references: [paymentMachinesTable.id],
    }),
  }),
);

export const doctorCommissionsTable = pgTable("doctor_commissions", {
  id: uuid("id").defaultRandom().primaryKey(),
  clinicId: uuid("clinic_id")
    .notNull()
    .references(() => clinicsTable.id, { onDelete: "cascade" }),
  doctorId: uuid("doctor_id")
    .notNull()
    .references(() => doctorsTable.id, { onDelete: "cascade" }),
  commissionPercentage: integer("commission_percentage").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const doctorCommissionsTableRelations = relations(
  doctorCommissionsTable,
  ({ one }) => ({
    clinic: one(clinicsTable, {
      fields: [doctorCommissionsTable.clinicId],
      references: [clinicsTable.id],
    }),
    doctor: one(doctorsTable, {
      fields: [doctorCommissionsTable.doctorId],
      references: [doctorsTable.id],
    }),
  }),
);

// ============================================================
// CONVENIOS / PLANOS DE SAUDE (Fase 4)
// ============================================================

export const insuranceProvidersTable = pgTable("insurance_providers", {
  id: uuid("id").defaultRandom().primaryKey(),
  clinicId: uuid("clinic_id")
    .notNull()
    .references(() => clinicsTable.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  ansCode: text("ans_code"),
  contactPhone: text("contact_phone"),
  contactEmail: text("contact_email"),
  isActive: boolean("is_active").default(true),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const insuranceProvidersTableRelations = relations(
  insuranceProvidersTable,
  ({ one, many }) => ({
    clinic: one(clinicsTable, {
      fields: [insuranceProvidersTable.clinicId],
      references: [clinicsTable.id],
    }),
    priceTables: many(insurancePriceTablesTable),
  }),
);

export const insurancePriceTablesTable = pgTable("insurance_price_tables", {
  id: uuid("id").defaultRandom().primaryKey(),
  clinicId: uuid("clinic_id")
    .notNull()
    .references(() => clinicsTable.id, { onDelete: "cascade" }),
  insuranceProviderId: uuid("insurance_provider_id")
    .notNull()
    .references(() => insuranceProvidersTable.id, { onDelete: "cascade" }),
  procedureCode: text("procedure_code").notNull(),
  procedureName: text("procedure_name").notNull(),
  priceInCents: integer("price_in_cents").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const insurancePriceTablesTableRelations = relations(
  insurancePriceTablesTable,
  ({ one }) => ({
    clinic: one(clinicsTable, {
      fields: [insurancePriceTablesTable.clinicId],
      references: [clinicsTable.id],
    }),
    insuranceProvider: one(insuranceProvidersTable, {
      fields: [insurancePriceTablesTable.insuranceProviderId],
      references: [insuranceProvidersTable.id],
    }),
  }),
);

// ============================================================
// AGENDA AVANCADA + LEMBRETES (Fase 5)
// ============================================================

export const doctorScheduleBlocksTable = pgTable("doctor_schedule_blocks", {
  id: uuid("id").defaultRandom().primaryKey(),
  clinicId: uuid("clinic_id")
    .notNull()
    .references(() => clinicsTable.id, { onDelete: "cascade" }),
  doctorId: uuid("doctor_id")
    .notNull()
    .references(() => doctorsTable.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  startDate: timestamp("start_date").notNull(),
  endDate: timestamp("end_date").notNull(),
  reason: text("reason"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const doctorScheduleBlocksTableRelations = relations(
  doctorScheduleBlocksTable,
  ({ one }) => ({
    clinic: one(clinicsTable, {
      fields: [doctorScheduleBlocksTable.clinicId],
      references: [clinicsTable.id],
    }),
    doctor: one(doctorsTable, {
      fields: [doctorScheduleBlocksTable.doctorId],
      references: [doctorsTable.id],
    }),
  }),
);

export const waitingListStatusEnum = pgEnum("waiting_list_status", [
  "waiting",
  "contacted",
  "scheduled",
  "cancelled",
]);

export const waitingListTable = pgTable("waiting_list", {
  id: uuid("id").defaultRandom().primaryKey(),
  clinicId: uuid("clinic_id")
    .notNull()
    .references(() => clinicsTable.id, { onDelete: "cascade" }),
  patientId: uuid("patient_id")
    .notNull()
    .references(() => patientsTable.id, { onDelete: "cascade" }),
  doctorId: uuid("doctor_id")
    .references(() => doctorsTable.id, { onDelete: "set null" }),
  preferredDate: timestamp("preferred_date"),
  notes: text("notes"),
  status: waitingListStatusEnum("status").default("waiting").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const waitingListTableRelations = relations(
  waitingListTable,
  ({ one }) => ({
    clinic: one(clinicsTable, {
      fields: [waitingListTable.clinicId],
      references: [clinicsTable.id],
    }),
    patient: one(patientsTable, {
      fields: [waitingListTable.patientId],
      references: [patientsTable.id],
    }),
    doctor: one(doctorsTable, {
      fields: [waitingListTable.doctorId],
      references: [doctorsTable.id],
    }),
  }),
);

export const reminderChannelEnum = pgEnum("reminder_channel", [
  "email",
  "sms",
  "whatsapp",
]);

export const reminderStatusEnum = pgEnum("reminder_status", [
  "pending",
  "sent",
  "failed",
]);

export const appointmentRemindersTable = pgTable("appointment_reminders", {
  id: uuid("id").defaultRandom().primaryKey(),
  clinicId: uuid("clinic_id")
    .notNull()
    .references(() => clinicsTable.id, { onDelete: "cascade" }),
  appointmentId: uuid("appointment_id")
    .notNull()
    .references(() => appointmentsTable.id, { onDelete: "cascade" }),
  channel: reminderChannelEnum("channel").notNull(),
  scheduledFor: timestamp("scheduled_for").notNull(),
  sentAt: timestamp("sent_at"),
  status: reminderStatusEnum("status").default("pending").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const appointmentRemindersTableRelations = relations(
  appointmentRemindersTable,
  ({ one }) => ({
    clinic: one(clinicsTable, {
      fields: [appointmentRemindersTable.clinicId],
      references: [clinicsTable.id],
    }),
    appointment: one(appointmentsTable, {
      fields: [appointmentRemindersTable.appointmentId],
      references: [appointmentsTable.id],
    }),
  }),
);

// ============================================================
// CONTROLE DE ESTOQUE (Fase 6)
// ============================================================

export const stockCategoryEnum = pgEnum("stock_category", [
  "medication",
  "material",
  "equipment",
  "epi",
  "cleaning",
  "office",
  "other",
]);

export const stockItemsTable = pgTable("stock_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  clinicId: uuid("clinic_id")
    .notNull()
    .references(() => clinicsTable.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  category: stockCategoryEnum("category").notNull(),
  sku: text("sku"),
  currentQuantity: integer("current_quantity").default(0).notNull(),
  minimumQuantity: integer("minimum_quantity").default(0).notNull(),
  costInCents: integer("cost_in_cents"),
  expirationDate: timestamp("expiration_date"),
  location: text("location"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const stockItemsTableRelations = relations(
  stockItemsTable,
  ({ one, many }) => ({
    clinic: one(clinicsTable, {
      fields: [stockItemsTable.clinicId],
      references: [clinicsTable.id],
    }),
    movements: many(stockMovementsTable),
  }),
);

export const stockMovementTypeEnum = pgEnum("stock_movement_type", [
  "entry",
  "exit",
  "adjustment",
]);

export const stockMovementsTable = pgTable("stock_movements", {
  id: uuid("id").defaultRandom().primaryKey(),
  clinicId: uuid("clinic_id")
    .notNull()
    .references(() => clinicsTable.id, { onDelete: "cascade" }),
  stockItemId: uuid("stock_item_id")
    .notNull()
    .references(() => stockItemsTable.id, { onDelete: "cascade" }),
  type: stockMovementTypeEnum("type").notNull(),
  quantity: integer("quantity").notNull(),
  batch: text("batch"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const stockMovementsTableRelations = relations(
  stockMovementsTable,
  ({ one }) => ({
    clinic: one(clinicsTable, {
      fields: [stockMovementsTable.clinicId],
      references: [clinicsTable.id],
    }),
    stockItem: one(stockItemsTable, {
      fields: [stockMovementsTable.stockItemId],
      references: [stockItemsTable.id],
    }),
  }),
);

// ============================================================
// FUNCIONARIOS / RH + PERMISSOES (Fase 7)
// ============================================================

export const employeeRoleEnum = pgEnum("employee_role", [
  "admin",
  "doctor",
  "receptionist",
  "nurse",
  "manager",
  "other",
]);

export const employeesTable = pgTable("employees", {
  id: uuid("id").defaultRandom().primaryKey(),
  clinicId: uuid("clinic_id")
    .notNull()
    .references(() => clinicsTable.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  email: text("email"),
  phoneNumber: text("phone_number"),
  cpf: text("cpf"),
  role: employeeRoleEnum("role").notNull(),
  specialty: text("specialty"),
  doctorId: uuid("doctor_id").references(() => doctorsTable.id, {
    onDelete: "set null",
  }),
  hireDate: timestamp("hire_date"),
  salary: integer("salary_in_cents"),
  isActive: boolean("is_active").default(true).notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const employeesTableRelations = relations(
  employeesTable,
  ({ one, many }) => ({
    clinic: one(clinicsTable, {
      fields: [employeesTable.clinicId],
      references: [clinicsTable.id],
    }),
    doctor: one(doctorsTable, {
      fields: [employeesTable.doctorId],
      references: [doctorsTable.id],
    }),
    permissions: many(permissionsTable),
    timeRecords: many(timeTrackingTable),
  }),
);

export const permissionModuleEnum = pgEnum("permission_module", [
  "dashboard",
  "appointments",
  "agenda",
  "doctors",
  "patients",
  "medical_records",
  "documents",
  "financial",
  "insurance",
  "stock",
  "employees",
  "reports",
  "settings",
]);

export const permissionsTable = pgTable("permissions", {
  id: uuid("id").defaultRandom().primaryKey(),
  clinicId: uuid("clinic_id")
    .notNull()
    .references(() => clinicsTable.id, { onDelete: "cascade" }),
  employeeId: uuid("employee_id")
    .notNull()
    .references(() => employeesTable.id, { onDelete: "cascade" }),
  module: permissionModuleEnum("module").notNull(),
  canView: boolean("can_view").default(false).notNull(),
  canCreate: boolean("can_create").default(false).notNull(),
  canEdit: boolean("can_edit").default(false).notNull(),
  canDelete: boolean("can_delete").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const permissionsTableRelations = relations(
  permissionsTable,
  ({ one }) => ({
    clinic: one(clinicsTable, {
      fields: [permissionsTable.clinicId],
      references: [clinicsTable.id],
    }),
    employee: one(employeesTable, {
      fields: [permissionsTable.employeeId],
      references: [employeesTable.id],
    }),
  }),
);

export const timeTrackingTable = pgTable("time_tracking", {
  id: uuid("id").defaultRandom().primaryKey(),
  clinicId: uuid("clinic_id")
    .notNull()
    .references(() => clinicsTable.id, { onDelete: "cascade" }),
  employeeId: uuid("employee_id")
    .notNull()
    .references(() => employeesTable.id, { onDelete: "cascade" }),
  clockIn: timestamp("clock_in").notNull(),
  clockOut: timestamp("clock_out"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const timeTrackingTableRelations = relations(
  timeTrackingTable,
  ({ one }) => ({
    clinic: one(clinicsTable, {
      fields: [timeTrackingTable.clinicId],
      references: [clinicsTable.id],
    }),
    employee: one(employeesTable, {
      fields: [timeTrackingTable.employeeId],
      references: [employeesTable.id],
    }),
  }),
);

// ============================================================
// CRM & MARKETING (Fase 8)
// ============================================================

export const campaignTypeEnum = pgEnum("campaign_type", [
  "birthday",
  "inactive",
  "follow_up",
  "promotional",
  "custom",
]);

export const campaignChannelEnum = pgEnum("campaign_channel", [
  "email",
  "sms",
  "whatsapp",
]);

export const campaignStatusEnum = pgEnum("campaign_status", [
  "draft",
  "scheduled",
  "sending",
  "sent",
  "cancelled",
]);

export const campaignsTable = pgTable("campaigns", {
  id: uuid("id").defaultRandom().primaryKey(),
  clinicId: uuid("clinic_id")
    .notNull()
    .references(() => clinicsTable.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  type: campaignTypeEnum("type").notNull(),
  channel: campaignChannelEnum("channel").notNull(),
  subject: text("subject"),
  template: text("template").notNull(),
  status: campaignStatusEnum("status").default("draft").notNull(),
  scheduledFor: timestamp("scheduled_for"),
  sentAt: timestamp("sent_at"),
  recipientCount: integer("recipient_count").default(0).notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const campaignsTableRelations = relations(
  campaignsTable,
  ({ one, many }) => ({
    clinic: one(clinicsTable, {
      fields: [campaignsTable.clinicId],
      references: [clinicsTable.id],
    }),
    recipients: many(campaignRecipientsTable),
  }),
);

export const recipientStatusEnum = pgEnum("recipient_status", [
  "pending",
  "sent",
  "delivered",
  "failed",
]);

export const campaignRecipientsTable = pgTable("campaign_recipients", {
  id: uuid("id").defaultRandom().primaryKey(),
  clinicId: uuid("clinic_id")
    .notNull()
    .references(() => clinicsTable.id, { onDelete: "cascade" }),
  campaignId: uuid("campaign_id")
    .notNull()
    .references(() => campaignsTable.id, { onDelete: "cascade" }),
  patientId: uuid("patient_id")
    .notNull()
    .references(() => patientsTable.id, { onDelete: "cascade" }),
  status: recipientStatusEnum("status").default("pending").notNull(),
  sentAt: timestamp("sent_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const campaignRecipientsTableRelations = relations(
  campaignRecipientsTable,
  ({ one }) => ({
    clinic: one(clinicsTable, {
      fields: [campaignRecipientsTable.clinicId],
      references: [clinicsTable.id],
    }),
    campaign: one(campaignsTable, {
      fields: [campaignRecipientsTable.campaignId],
      references: [campaignsTable.id],
    }),
    patient: one(patientsTable, {
      fields: [campaignRecipientsTable.patientId],
      references: [patientsTable.id],
    }),
  }),
);

export const satisfactionSurveysTable = pgTable("satisfaction_surveys", {
  id: uuid("id").defaultRandom().primaryKey(),
  clinicId: uuid("clinic_id")
    .notNull()
    .references(() => clinicsTable.id, { onDelete: "cascade" }),
  patientId: uuid("patient_id")
    .notNull()
    .references(() => patientsTable.id, { onDelete: "cascade" }),
  appointmentId: uuid("appointment_id").references(
    () => appointmentsTable.id,
    { onDelete: "set null" },
  ),
  score: integer("score").notNull(),
  comment: text("comment"),
  token: text("token").notNull().unique(),
  respondedAt: timestamp("responded_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const satisfactionSurveysTableRelations = relations(
  satisfactionSurveysTable,
  ({ one }) => ({
    clinic: one(clinicsTable, {
      fields: [satisfactionSurveysTable.clinicId],
      references: [clinicsTable.id],
    }),
    patient: one(patientsTable, {
      fields: [satisfactionSurveysTable.patientId],
      references: [patientsTable.id],
    }),
    appointment: one(appointmentsTable, {
      fields: [satisfactionSurveysTable.appointmentId],
      references: [appointmentsTable.id],
    }),
  }),
);

// =============================================
// LGPD E SEGURANCA (Fase 10)
// =============================================

export const auditActionEnum = pgEnum("audit_action", [
  "create",
  "read",
  "update",
  "delete",
  "login",
  "logout",
  "export",
  "print",
]);

export const auditLogsTable = pgTable("audit_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  clinicId: uuid("clinic_id")
    .notNull()
    .references(() => clinicsTable.id, { onDelete: "cascade" }),
  userId: text("user_id").references(() => usersTable.id, {
    onDelete: "set null",
  }),
  action: auditActionEnum("action").notNull(),
  module: text("module").notNull(),
  resourceId: text("resource_id"),
  resourceType: text("resource_type"),
  description: text("description"),
  metadata: jsonb("metadata"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const auditLogsTableRelations = relations(
  auditLogsTable,
  ({ one }) => ({
    clinic: one(clinicsTable, {
      fields: [auditLogsTable.clinicId],
      references: [clinicsTable.id],
    }),
    user: one(usersTable, {
      fields: [auditLogsTable.userId],
      references: [usersTable.id],
    }),
  }),
);

export const consentTypeEnum = pgEnum("consent_type", [
  "treatment",
  "data_sharing",
  "marketing",
  "research",
  "terms_of_use",
  "privacy_policy",
]);

export const consentTermsTable = pgTable("consent_terms", {
  id: uuid("id").defaultRandom().primaryKey(),
  clinicId: uuid("clinic_id")
    .notNull()
    .references(() => clinicsTable.id, { onDelete: "cascade" }),
  patientId: uuid("patient_id")
    .notNull()
    .references(() => patientsTable.id, { onDelete: "cascade" }),
  type: consentTypeEnum("type").notNull(),
  version: text("version").notNull().default("1.0"),
  accepted: boolean("accepted").notNull().default(false),
  acceptedAt: timestamp("accepted_at"),
  revokedAt: timestamp("revoked_at"),
  ipAddress: text("ip_address"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export const consentTermsTableRelations = relations(
  consentTermsTable,
  ({ one }) => ({
    clinic: one(clinicsTable, {
      fields: [consentTermsTable.clinicId],
      references: [clinicsTable.id],
    }),
    patient: one(patientsTable, {
      fields: [consentTermsTable.patientId],
      references: [patientsTable.id],
    }),
  }),
);

export const dataRetentionPoliciesTable = pgTable("data_retention_policies", {
  id: uuid("id").defaultRandom().primaryKey(),
  clinicId: uuid("clinic_id")
    .notNull()
    .references(() => clinicsTable.id, { onDelete: "cascade" }),
  dataType: text("data_type").notNull(),
  retentionDays: integer("retention_days").notNull(),
  description: text("description"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export const dataRetentionPoliciesTableRelations = relations(
  dataRetentionPoliciesTable,
  ({ one }) => ({
    clinic: one(clinicsTable, {
      fields: [dataRetentionPoliciesTable.clinicId],
      references: [clinicsTable.id],
    }),
  }),
);

// =============================================
// PORTAL DO PACIENTE (Fase 11)
// =============================================

export const patientUsersTable = pgTable("patient_users", {
  id: uuid("id").defaultRandom().primaryKey(),
  clinicId: uuid("clinic_id")
    .notNull()
    .references(() => clinicsTable.id, { onDelete: "cascade" }),
  patientId: uuid("patient_id")
    .notNull()
    .references(() => patientsTable.id, { onDelete: "cascade" }),
  email: text("email").notNull(),
  passwordHash: text("password_hash").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  lastLoginAt: timestamp("last_login_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export const patientUsersTableRelations = relations(
  patientUsersTable,
  ({ one }) => ({
    clinic: one(clinicsTable, {
      fields: [patientUsersTable.clinicId],
      references: [clinicsTable.id],
    }),
    patient: one(patientsTable, {
      fields: [patientUsersTable.patientId],
      references: [patientsTable.id],
    }),
  }),
);

export const patientPortalTokensTable = pgTable("patient_portal_tokens", {
  id: uuid("id").defaultRandom().primaryKey(),
  patientUserId: uuid("patient_user_id")
    .notNull()
    .references(() => patientUsersTable.id, { onDelete: "cascade" }),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const patientPortalTokensTableRelations = relations(
  patientPortalTokensTable,
  ({ one }) => ({
    patientUser: one(patientUsersTable, {
      fields: [patientPortalTokensTable.patientUserId],
      references: [patientUsersTable.id],
    }),
  }),
);

// =============================================
// WHATSAPP + EVOLUTION API (Fase 12)
// =============================================

export const whatsappConnectionStatusEnum = pgEnum(
  "whatsapp_connection_status",
  ["disconnected", "connecting", "connected"],
);

export const whatsappConnectionsTable = pgTable("whatsapp_connections", {
  id: uuid("id").defaultRandom().primaryKey(),
  clinicId: uuid("clinic_id")
    .notNull()
    .references(() => clinicsTable.id, { onDelete: "cascade" }),
  instanceName: text("instance_name").notNull(),
  phoneNumber: text("phone_number"),
  status: whatsappConnectionStatusEnum("status")
    .default("disconnected")
    .notNull(),
  apiUrl: text("api_url").notNull(),
  apiKey: text("api_key").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export const whatsappConnectionsTableRelations = relations(
  whatsappConnectionsTable,
  ({ one, many }) => ({
    clinic: one(clinicsTable, {
      fields: [whatsappConnectionsTable.clinicId],
      references: [clinicsTable.id],
    }),
    messages: many(whatsappMessagesTable),
    conversations: many(whatsappConversationsTable),
  }),
);

export const whatsappMessageDirectionEnum = pgEnum(
  "whatsapp_message_direction",
  ["inbound", "outbound"],
);

export const whatsappMessageTypeEnum = pgEnum("whatsapp_message_type", [
  "text",
  "image",
  "audio",
  "video",
  "document",
  "location",
  "contact",
]);

export const whatsappMessageStatusEnum = pgEnum("whatsapp_message_status", [
  "pending",
  "sent",
  "delivered",
  "read",
  "failed",
]);

export const whatsappMessagesTable = pgTable("whatsapp_messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  clinicId: uuid("clinic_id")
    .notNull()
    .references(() => clinicsTable.id, { onDelete: "cascade" }),
  connectionId: uuid("connection_id")
    .notNull()
    .references(() => whatsappConnectionsTable.id, { onDelete: "cascade" }),
  patientId: uuid("patient_id").references(() => patientsTable.id, {
    onDelete: "set null",
  }),
  remotePhone: text("remote_phone").notNull(),
  direction: whatsappMessageDirectionEnum("direction").notNull(),
  messageType: whatsappMessageTypeEnum("message_type")
    .default("text")
    .notNull(),
  content: text("content"),
  mediaUrl: text("media_url"),
  status: whatsappMessageStatusEnum("status").default("pending").notNull(),
  externalId: text("external_id"),
  sentByUserId: text("sent_by_user_id").references(() => usersTable.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const whatsappMessagesTableRelations = relations(
  whatsappMessagesTable,
  ({ one }) => ({
    clinic: one(clinicsTable, {
      fields: [whatsappMessagesTable.clinicId],
      references: [clinicsTable.id],
    }),
    connection: one(whatsappConnectionsTable, {
      fields: [whatsappMessagesTable.connectionId],
      references: [whatsappConnectionsTable.id],
    }),
    patient: one(patientsTable, {
      fields: [whatsappMessagesTable.patientId],
      references: [patientsTable.id],
    }),
    sentByUser: one(usersTable, {
      fields: [whatsappMessagesTable.sentByUserId],
      references: [usersTable.id],
    }),
  }),
);

export const quickRepliesTable = pgTable("quick_replies", {
  id: uuid("id").defaultRandom().primaryKey(),
  clinicId: uuid("clinic_id")
    .notNull()
    .references(() => clinicsTable.id, { onDelete: "cascade" }),
  shortcut: text("shortcut").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export const quickRepliesTableRelations = relations(
  quickRepliesTable,
  ({ one }) => ({
    clinic: one(clinicsTable, {
      fields: [quickRepliesTable.clinicId],
      references: [clinicsTable.id],
    }),
  }),
);

// WhatsApp Contacts
export const whatsappContactsTable = pgTable("whatsapp_contacts", {
  id: uuid("id").defaultRandom().primaryKey(),
  clinicId: uuid("clinic_id")
    .notNull()
    .references(() => clinicsTable.id, { onDelete: "cascade" }),
  name: text("name"),
  phoneNumber: text("phone_number").notNull(),
  profilePictureUrl: text("profile_picture_url"),
  email: text("email"),
  notes: text("notes"),
  patientId: uuid("patient_id").references(() => patientsTable.id, {
    onDelete: "set null",
  }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const whatsappContactsTableRelations = relations(
  whatsappContactsTable,
  ({ one }) => ({
    clinic: one(clinicsTable, {
      fields: [whatsappContactsTable.clinicId],
      references: [clinicsTable.id],
    }),
    patient: one(patientsTable, {
      fields: [whatsappContactsTable.patientId],
      references: [patientsTable.id],
    }),
  }),
);

// WhatsApp Conversations
export const whatsappConversationsTable = pgTable("whatsapp_conversations", {
  id: uuid("id").defaultRandom().primaryKey(),
  clinicId: uuid("clinic_id")
    .notNull()
    .references(() => clinicsTable.id, { onDelete: "cascade" }),
  connectionId: uuid("connection_id")
    .notNull()
    .references(() => whatsappConnectionsTable.id, { onDelete: "cascade" }),
  contactId: uuid("contact_id").references(() => whatsappContactsTable.id, {
    onDelete: "set null",
  }),
  remotePhone: text("remote_phone").notNull(),
  contactName: text("contact_name"),
  isRead: boolean("is_read").default(true).notNull(),
  isArchived: boolean("is_archived").default(false).notNull(),
  assignedToUserId: text("assigned_to_user_id").references(
    () => usersTable.id,
    { onDelete: "set null" },
  ),
  lastMessageContent: text("last_message_content"),
  lastMessageAt: timestamp("last_message_at"),
  lastMessageDirection: whatsappMessageDirectionEnum("last_message_direction"),
  unreadCount: integer("unread_count").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const whatsappConversationsTableRelations = relations(
  whatsappConversationsTable,
  ({ one, many }) => ({
    clinic: one(clinicsTable, {
      fields: [whatsappConversationsTable.clinicId],
      references: [clinicsTable.id],
    }),
    connection: one(whatsappConnectionsTable, {
      fields: [whatsappConversationsTable.connectionId],
      references: [whatsappConnectionsTable.id],
    }),
    contact: one(whatsappContactsTable, {
      fields: [whatsappConversationsTable.contactId],
      references: [whatsappContactsTable.id],
    }),
    assignedTo: one(usersTable, {
      fields: [whatsappConversationsTable.assignedToUserId],
      references: [usersTable.id],
    }),
    labels: many(whatsappConversationLabelsTable),
  }),
);

// WhatsApp Labels
export const whatsappLabelsTable = pgTable("whatsapp_labels", {
  id: uuid("id").defaultRandom().primaryKey(),
  clinicId: uuid("clinic_id")
    .notNull()
    .references(() => clinicsTable.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  color: text("color").notNull().default("#D4A017"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const whatsappLabelsTableRelations = relations(
  whatsappLabelsTable,
  ({ one, many }) => ({
    clinic: one(clinicsTable, {
      fields: [whatsappLabelsTable.clinicId],
      references: [clinicsTable.id],
    }),
    conversationLabels: many(whatsappConversationLabelsTable),
  }),
);

// WhatsApp Conversation Labels (many-to-many)
export const whatsappConversationLabelsTable = pgTable(
  "whatsapp_conversation_labels",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    conversationId: uuid("conversation_id")
      .notNull()
      .references(() => whatsappConversationsTable.id, { onDelete: "cascade" }),
    labelId: uuid("label_id")
      .notNull()
      .references(() => whatsappLabelsTable.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
);

export const whatsappConversationLabelsTableRelations = relations(
  whatsappConversationLabelsTable,
  ({ one }) => ({
    conversation: one(whatsappConversationsTable, {
      fields: [whatsappConversationLabelsTable.conversationId],
      references: [whatsappConversationsTable.id],
    }),
    label: one(whatsappLabelsTable, {
      fields: [whatsappConversationLabelsTable.labelId],
      references: [whatsappLabelsTable.id],
    }),
  }),
);

// WhatsApp Message Templates
export const whatsappMessageTemplatesTable = pgTable(
  "whatsapp_message_templates",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    clinicId: uuid("clinic_id")
      .notNull()
      .references(() => clinicsTable.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    content: text("content").notNull(),
    category: text("category"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
);

export const whatsappMessageTemplatesTableRelations = relations(
  whatsappMessageTemplatesTable,
  ({ one }) => ({
    clinic: one(clinicsTable, {
      fields: [whatsappMessageTemplatesTable.clinicId],
      references: [clinicsTable.id],
    }),
  }),
);

// =============================================
// TELECONSULTA (Fase 13)
// =============================================

export const teleconsultationStatusEnum = pgEnum("teleconsultation_status", [
  "scheduled",
  "waiting",
  "in_progress",
  "completed",
  "cancelled",
]);

export const teleconsultationsTable = pgTable("teleconsultations", {
  id: uuid("id").defaultRandom().primaryKey(),
  clinicId: uuid("clinic_id")
    .notNull()
    .references(() => clinicsTable.id, { onDelete: "cascade" }),
  appointmentId: uuid("appointment_id").references(
    () => appointmentsTable.id,
    { onDelete: "set null" },
  ),
  doctorId: uuid("doctor_id")
    .notNull()
    .references(() => doctorsTable.id, { onDelete: "cascade" }),
  patientId: uuid("patient_id")
    .notNull()
    .references(() => patientsTable.id, { onDelete: "cascade" }),
  roomId: text("room_id").notNull().unique(),
  roomUrl: text("room_url"),
  status: teleconsultationStatusEnum("status").default("scheduled").notNull(),
  scheduledFor: timestamp("scheduled_for").notNull(),
  startedAt: timestamp("started_at"),
  endedAt: timestamp("ended_at"),
  durationMinutes: integer("duration_minutes"),
  patientToken: text("patient_token").notNull().unique(),
  patientConsent: boolean("patient_consent").notNull().default(false),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export const teleconsultationsTableRelations = relations(
  teleconsultationsTable,
  ({ one }) => ({
    clinic: one(clinicsTable, {
      fields: [teleconsultationsTable.clinicId],
      references: [clinicsTable.id],
    }),
    appointment: one(appointmentsTable, {
      fields: [teleconsultationsTable.appointmentId],
      references: [appointmentsTable.id],
    }),
    doctor: one(doctorsTable, {
      fields: [teleconsultationsTable.doctorId],
      references: [doctorsTable.id],
    }),
    patient: one(patientsTable, {
      fields: [teleconsultationsTable.patientId],
      references: [patientsTable.id],
    }),
  }),
);

// =============================================
// SECRETAR.IA - AGENTE IA (Fase 14)
// =============================================

export const aiAgentConfigTable = pgTable("ai_agent_config", {
  id: uuid("id").defaultRandom().primaryKey(),
  clinicId: uuid("clinic_id")
    .notNull()
    .references(() => clinicsTable.id, { onDelete: "cascade" })
    .unique(),
  isActive: boolean("is_active").notNull().default(false),
  provider: text("provider").notNull().default("openai"),
  model: text("model").notNull().default("gpt-4o-mini"),
  systemPrompt: text("system_prompt"),
  enableScheduling: boolean("enable_scheduling").notNull().default(true),
  enablePatientLookup: boolean("enable_patient_lookup").notNull().default(true),
  enableAvailabilityCheck: boolean("enable_availability_check")
    .notNull()
    .default(true),
  enableGreeting: boolean("enable_greeting").notNull().default(true),
  maxTokensPerMessage: integer("max_tokens_per_message")
    .notNull()
    .default(500),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export const aiAgentConfigTableRelations = relations(
  aiAgentConfigTable,
  ({ one }) => ({
    clinic: one(clinicsTable, {
      fields: [aiAgentConfigTable.clinicId],
      references: [clinicsTable.id],
    }),
  }),
);

export const aiConversationStatusEnum = pgEnum("ai_conversation_status", [
  "active",
  "resolved",
  "escalated",
  "expired",
]);

export const aiConversationsTable = pgTable("ai_conversations", {
  id: uuid("id").defaultRandom().primaryKey(),
  clinicId: uuid("clinic_id")
    .notNull()
    .references(() => clinicsTable.id, { onDelete: "cascade" }),
  phoneNumber: text("phone_number").notNull(),
  patientId: uuid("patient_id").references(() => patientsTable.id, {
    onDelete: "set null",
  }),
  status: aiConversationStatusEnum("status").default("active").notNull(),
  resolvedAction: text("resolved_action"),
  context: jsonb("context"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
});

export const aiConversationsTableRelations = relations(
  aiConversationsTable,
  ({ one, many }) => ({
    clinic: one(clinicsTable, {
      fields: [aiConversationsTable.clinicId],
      references: [clinicsTable.id],
    }),
    patient: one(patientsTable, {
      fields: [aiConversationsTable.patientId],
      references: [patientsTable.id],
    }),
    messages: many(aiMessagesTable),
  }),
);

export const aiMessageRoleEnum = pgEnum("ai_message_role", [
  "user",
  "assistant",
  "system",
]);

export const aiMessagesTable = pgTable("ai_messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  clinicId: uuid("clinic_id")
    .notNull()
    .references(() => clinicsTable.id, { onDelete: "cascade" }),
  conversationId: uuid("conversation_id")
    .notNull()
    .references(() => aiConversationsTable.id, { onDelete: "cascade" }),
  role: aiMessageRoleEnum("role").notNull(),
  content: text("content").notNull(),
  tokensUsed: integer("tokens_used"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const aiMessagesTableRelations = relations(
  aiMessagesTable,
  ({ one }) => ({
    clinic: one(clinicsTable, {
      fields: [aiMessagesTable.clinicId],
      references: [clinicsTable.id],
    }),
    conversation: one(aiConversationsTable, {
      fields: [aiMessagesTable.conversationId],
      references: [aiConversationsTable.id],
    }),
  }),
);

// =============================================
// CONVITES DE CLINICA (Fase 15)
// =============================================

export const invitationStatusEnum = pgEnum("invitation_status", [
  "pending",
  "accepted",
  "rejected",
  "expired",
]);

export const clinicInvitationsTable = pgTable("clinic_invitations", {
  id: uuid("id").defaultRandom().primaryKey(),
  clinicId: uuid("clinic_id")
    .notNull()
    .references(() => clinicsTable.id, { onDelete: "cascade" }),
  invitedByUserId: text("invited_by_user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  email: text("email").notNull(),
  role: clinicMemberRoleEnum("role").default("member").notNull(),
  status: invitationStatusEnum("status").default("pending").notNull(),
  token: text("token").notNull().unique(),
  expiresAt: timestamp("expires_at").notNull(),
  acceptedAt: timestamp("accepted_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const clinicInvitationsTableRelations = relations(
  clinicInvitationsTable,
  ({ one }) => ({
    clinic: one(clinicsTable, {
      fields: [clinicInvitationsTable.clinicId],
      references: [clinicsTable.id],
    }),
    invitedBy: one(usersTable, {
      fields: [clinicInvitationsTable.invitedByUserId],
      references: [usersTable.id],
    }),
  }),
);

// =============================================
// LOGS DO SISTEMA (Fase 15)
// =============================================

// CRM Pipeline Stages
export const crmPipelineStagesTable = pgTable("crm_pipeline_stages", {
  id: uuid("id").defaultRandom().primaryKey(),
  clinicId: uuid("clinic_id")
    .notNull()
    .references(() => clinicsTable.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  color: text("color").notNull().default("#D4A017"),
  order: integer("order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

// CRM Contact Stage (which stage a contact/patient is in)
export const crmContactStagesTable = pgTable("crm_contact_stages", {
  id: uuid("id").defaultRandom().primaryKey(),
  clinicId: uuid("clinic_id")
    .notNull()
    .references(() => clinicsTable.id, { onDelete: "cascade" }),
  patientId: uuid("patient_id")
    .notNull()
    .references(() => patientsTable.id, { onDelete: "cascade" }),
  stageId: uuid("stage_id")
    .notNull()
    .references(() => crmPipelineStagesTable.id, { onDelete: "cascade" }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at")
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const crmPipelineStagesTableRelations = relations(
  crmPipelineStagesTable,
  ({ one, many }) => ({
    clinic: one(clinicsTable, {
      fields: [crmPipelineStagesTable.clinicId],
      references: [clinicsTable.id],
    }),
    contactStages: many(crmContactStagesTable),
    checklistItems: many(crmStageChecklistItemsTable),
  }),
);

export const crmContactStagesTableRelations = relations(
  crmContactStagesTable,
  ({ one, many }) => ({
    clinic: one(clinicsTable, {
      fields: [crmContactStagesTable.clinicId],
      references: [clinicsTable.id],
    }),
    patient: one(patientsTable, {
      fields: [crmContactStagesTable.patientId],
      references: [patientsTable.id],
    }),
    stage: one(crmPipelineStagesTable, {
      fields: [crmContactStagesTable.stageId],
      references: [crmPipelineStagesTable.id],
    }),
    checklistItems: many(crmContactChecklistTable),
  }),
);

// CRM Stage Checklist Items (template items per stage)
export const crmStageChecklistItemsTable = pgTable("crm_stage_checklist_items", {
  id: uuid("id").defaultRandom().primaryKey(),
  stageId: uuid("stage_id")
    .notNull()
    .references(() => crmPipelineStagesTable.id, { onDelete: "cascade" }),
  clinicId: uuid("clinic_id")
    .notNull()
    .references(() => clinicsTable.id, { onDelete: "cascade" }),
  label: text("label").notNull(),
  order: integer("order").notNull().default(0),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const crmStageChecklistItemsTableRelations = relations(
  crmStageChecklistItemsTable,
  ({ one }) => ({
    stage: one(crmPipelineStagesTable, {
      fields: [crmStageChecklistItemsTable.stageId],
      references: [crmPipelineStagesTable.id],
    }),
    clinic: one(clinicsTable, {
      fields: [crmStageChecklistItemsTable.clinicId],
      references: [clinicsTable.id],
    }),
  }),
);

// CRM Contact Checklist (completion status per contact-stage)
export const crmContactChecklistTable = pgTable("crm_contact_checklist", {
  id: uuid("id").defaultRandom().primaryKey(),
  contactStageId: uuid("contact_stage_id")
    .notNull()
    .references(() => crmContactStagesTable.id, { onDelete: "cascade" }),
  checklistItemId: uuid("checklist_item_id")
    .notNull()
    .references(() => crmStageChecklistItemsTable.id, { onDelete: "cascade" }),
  completed: boolean("completed").notNull().default(false),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const crmContactChecklistTableRelations = relations(
  crmContactChecklistTable,
  ({ one }) => ({
    contactStage: one(crmContactStagesTable, {
      fields: [crmContactChecklistTable.contactStageId],
      references: [crmContactStagesTable.id],
    }),
    checklistItem: one(crmStageChecklistItemsTable, {
      fields: [crmContactChecklistTable.checklistItemId],
      references: [crmStageChecklistItemsTable.id],
    }),
  }),
);

export const systemLogLevelEnum = pgEnum("system_log_level", [
  "info",
  "warning",
  "error",
  "critical",
]);

export const systemLogsTable = pgTable("system_logs", {
  id: uuid("id").defaultRandom().primaryKey(),
  clinicId: uuid("clinic_id").references(() => clinicsTable.id, {
    onDelete: "cascade",
  }),
  userId: text("user_id").references(() => usersTable.id, {
    onDelete: "set null",
  }),
  level: systemLogLevelEnum("level").notNull(),
  module: text("module").notNull(),
  message: text("message").notNull(),
  stackTrace: text("stack_trace"),
  metadata: jsonb("metadata"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const systemLogsTableRelations = relations(
  systemLogsTable,
  ({ one }) => ({
    clinic: one(clinicsTable, {
      fields: [systemLogsTable.clinicId],
      references: [clinicsTable.id],
    }),
    user: one(usersTable, {
      fields: [systemLogsTable.userId],
      references: [usersTable.id],
    }),
  }),
);
