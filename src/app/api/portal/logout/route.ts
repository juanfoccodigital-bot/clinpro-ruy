import { NextResponse } from "next/server";

import { logoutPatient } from "@/lib/portal-auth";

export async function POST() {
  await logoutPatient();
  return NextResponse.json({ success: true });
}
