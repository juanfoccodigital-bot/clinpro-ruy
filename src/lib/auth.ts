import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { customSession, twoFactor } from "better-auth/plugins";
import { eq } from "drizzle-orm";

import { db } from "@/db";
import * as schema from "@/db/schema";
import { auditLogsTable, usersTable, usersToClinicsTable } from "@/db/schema";

const FIVE_MINUTES = 5 * 60;

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    usePlural: true,
    schema,
  }),
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
  rateLimit: {
    enabled: true,
    window: 60,
    max: 100,
    storage: "memory",
    customRules: {
      "/sign-in/email": { window: 60, max: 10 },
      "/sign-up/email": { window: 60, max: 5 },
      "/forget-password": { window: 300, max: 3 },
      "/reset-password": { window: 300, max: 5 },
    },
  },
  plugins: [
    twoFactor({
      issuer: "Clinpro",
      schema: {
        twoFactor: {
          modelName: "twoFactorsTable",
        },
      },
    }),
    customSession(async ({ user, session }) => {
      const [userData, clinics] = await Promise.all([
        db.query.usersTable.findFirst({
          where: eq(usersTable.id, user.id),
        }),
        db.query.usersToClinicsTable.findMany({
          where: eq(usersToClinicsTable.userId, user.id),
          with: {
            clinic: true,
            user: true,
          },
        }),
      ]);
      const clinicRecord = clinics?.[0];
      return {
        user: {
          ...user,
          plan: userData?.plan,
          twoFactorEnabled: userData?.twoFactorEnabled ?? false,
          onboardingCompleted: userData?.onboardingCompleted ?? false,
          clinic: clinicRecord?.clinicId
            ? {
                id: clinicRecord.clinicId,
                name: clinicRecord.clinic?.name,
                logoUrl: clinicRecord.clinic?.logoUrl,
                clinicType: clinicRecord.clinic?.clinicType ?? "medical_clinic",
                primaryColor: clinicRecord.clinic?.primaryColor,
                secondaryColor: clinicRecord.clinic?.secondaryColor,
                accentColor: clinicRecord.clinic?.accentColor,
                plan: clinicRecord.clinic?.plan ?? "starter",
              }
            : undefined,
          role: clinicRecord?.role ?? "owner",
        },
        session,
      };
    }),
  ],
  user: {
    modelName: "usersTable",
    additionalFields: {
      stripeCustomerId: {
        type: "string",
        fieldName: "stripeCustomerId",
        required: false,
      },
      stripeSubscriptionId: {
        type: "string",
        fieldName: "stripeSubscriptionId",
        required: false,
      },
      plan: {
        type: "string",
        fieldName: "plan",
        required: false,
      },
      twoFactorEnabled: {
        type: "boolean",
        fieldName: "twoFactorEnabled",
        required: false,
      },
      onboardingCompleted: {
        type: "boolean",
        fieldName: "onboardingCompleted",
        required: false,
      },
      referralSource: {
        type: "string",
        fieldName: "referralSource",
        required: false,
      },
    },
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: FIVE_MINUTES,
    },
    modelName: "sessionsTable",
  },
  account: {
    modelName: "accountsTable",
  },
  verification: {
    modelName: "verificationsTable",
  },
  emailAndPassword: {
    enabled: true,
  },
  databaseHooks: {
    session: {
      create: {
        after: async (session) => {
          try {
            const userClinic = await db.query.usersToClinicsTable.findFirst({
              where: eq(usersToClinicsTable.userId, session.userId),
            });
            if (userClinic) {
              await db.insert(auditLogsTable).values({
                clinicId: userClinic.clinicId,
                userId: session.userId,
                action: "login",
                module: "auth",
                description: "Usuario fez login",
                ipAddress: session.ipAddress ?? undefined,
                userAgent: session.userAgent ?? undefined,
              });
            }
          } catch (error) {
            console.error("[AuditLog] Failed to log login:", error);
          }
        },
      },
    },
  },
});
