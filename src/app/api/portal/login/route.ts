import { NextRequest, NextResponse } from "next/server";

import { authenticatePatient } from "@/lib/portal-auth";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { email, password } = body;

  if (!email || !password) {
    return NextResponse.json(
      { error: "Email e senha sao obrigatorios." },
      { status: 400 },
    );
  }

  const result = await authenticatePatient(email, password);

  if (!result) {
    return NextResponse.json(
      { error: "Email ou senha invalidos." },
      { status: 401 },
    );
  }

  return NextResponse.json({ success: true });
}
