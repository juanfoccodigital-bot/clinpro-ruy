import { headers } from "next/headers";

import { db } from "@/db";
import { auditLogsTable } from "@/db/schema";

interface LogAuditEventParams {
  clinicId: string;
  userId?: string;
  action:
    | "create"
    | "read"
    | "update"
    | "delete"
    | "login"
    | "logout"
    | "export"
    | "print";
  module: string;
  resourceId?: string;
  resourceType?: string;
  description?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}

export const logAuditEvent = async (params: LogAuditEventParams) => {
  try {
    await db.insert(auditLogsTable).values(params);
  } catch (error) {
    console.error("[AuditLog] Failed to write audit log:", error);
  }
};

export const getRequestInfo = async (): Promise<{
  ipAddress: string | undefined;
  userAgent: string | undefined;
}> => {
  try {
    const hdrs = await headers();
    const ipAddress =
      hdrs.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      hdrs.get("x-real-ip") ??
      undefined;
    const userAgent = hdrs.get("user-agent") ?? undefined;
    return { ipAddress, userAgent };
  } catch {
    return { ipAddress: undefined, userAgent: undefined };
  }
};
