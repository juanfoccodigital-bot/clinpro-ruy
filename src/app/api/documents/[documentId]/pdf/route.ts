import dayjs from "dayjs";
import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { db } from "@/db";
import { clinicsTable, documentsTable } from "@/db/schema";
import { auth } from "@/lib/auth";
import {
  generateCertificateHtml,
  generateExamRequestHtml,
  generatePrescriptionHtml,
  generateReferralHtml,
  generateReportHtml,
} from "@/lib/pdf-templates";

interface RouteParams {
  params: Promise<{
    documentId: string;
  }>;
}

export async function GET(_request: Request, { params }: RouteParams) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.clinic?.id) {
    return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
  }

  const { documentId } = await params;

  const document = await db.query.documentsTable.findFirst({
    where: eq(documentsTable.id, documentId),
    with: {
      patient: true,
      doctor: true,
    },
  });

  if (!document) {
    return NextResponse.json(
      { error: "Documento não encontrado" },
      { status: 404 },
    );
  }

  if (document.clinicId !== session.user.clinic.id) {
    return NextResponse.json(
      { error: "Documento não encontrado" },
      { status: 404 },
    );
  }

  const clinic = await db.query.clinicsTable.findFirst({
    where: eq(clinicsTable.id, session.user.clinic.id),
  });

  if (!clinic) {
    return NextResponse.json(
      { error: "Clínica não encontrada" },
      { status: 404 },
    );
  }

  const templateParams = {
    clinic: { name: clinic.name },
    doctor: {
      name: document.doctor.name,
      specialty: document.doctor.specialty,
    },
    patient: { name: document.patient.name },
    content: document.content,
    date: dayjs(document.createdAt).format("DD/MM/YYYY"),
  };

  let html: string;

  switch (document.type) {
    case "prescription":
      html = generatePrescriptionHtml(templateParams);
      break;
    case "certificate":
      html = generateCertificateHtml(templateParams);
      break;
    case "report":
      html = generateReportHtml(templateParams);
      break;
    case "exam_request":
      html = generateExamRequestHtml(templateParams);
      break;
    case "referral":
      html = generateReferralHtml(templateParams);
      break;
    default:
      return NextResponse.json(
        { error: "Tipo de documento inválido" },
        { status: 400 },
      );
  }

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
    },
  });
}
