interface DocumentParams {
  clinic: {
    name: string;
  };
  doctor: {
    name: string;
    specialty: string;
  };
  patient: {
    name: string;
  };
  content: string;
  date: string;
}

function baseStyles(): string {
  return `
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: 'Georgia', 'Times New Roman', serif;
      font-size: 14px;
      color: #1a1a1a;
      line-height: 1.6;
      padding: 40px;
      max-width: 800px;
      margin: 0 auto;
    }
    .header {
      text-align: center;
      border-bottom: 2px solid #2c3e50;
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .header h1 {
      font-size: 22px;
      color: #2c3e50;
      margin-bottom: 4px;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .header p {
      font-size: 12px;
      color: #555;
    }
    .document-title {
      text-align: center;
      font-size: 18px;
      font-weight: bold;
      color: #2c3e50;
      margin-bottom: 24px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .patient-info {
      margin-bottom: 24px;
      padding: 12px 16px;
      background-color: #f8f9fa;
      border-left: 3px solid #2c3e50;
    }
    .patient-info p {
      font-size: 13px;
      margin-bottom: 4px;
    }
    .patient-info strong {
      color: #2c3e50;
    }
    .content {
      margin-bottom: 40px;
      min-height: 300px;
      padding: 16px 0;
      white-space: pre-wrap;
      line-height: 1.8;
    }
    .footer {
      margin-top: 60px;
      text-align: center;
    }
    .signature-line {
      width: 300px;
      border-top: 1px solid #1a1a1a;
      margin: 0 auto 8px auto;
    }
    .footer p {
      font-size: 13px;
      color: #333;
    }
    .footer .doctor-name {
      font-weight: bold;
      font-size: 14px;
    }
    .footer .specialty {
      font-size: 12px;
      color: #555;
    }
    .date-location {
      text-align: right;
      font-size: 13px;
      color: #555;
      margin-bottom: 24px;
    }
    @media print {
      body {
        padding: 20px;
      }
    }
  `;
}

function wrapHtml(title: string, body: string): string {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>${baseStyles()}</style>
</head>
<body>
${body}
</body>
</html>`;
}

export function generatePrescriptionHtml({
  clinic,
  doctor,
  patient,
  content,
  date,
}: DocumentParams): string {
  const body = `
  <div class="header">
    <h1>${clinic.name}</h1>
    <p>Documento emitido eletronicamente</p>
  </div>

  <div class="document-title">Receituário</div>

  <div class="date-location">
    <p>Data: ${date}</p>
  </div>

  <div class="patient-info">
    <p><strong>Paciente:</strong> ${patient.name}</p>
  </div>

  <div class="content">${content}</div>

  <div class="footer">
    <div class="signature-line"></div>
    <p class="doctor-name">Dr(a). ${doctor.name}</p>
    <p class="specialty">${doctor.specialty}</p>
  </div>`;

  return wrapHtml("Receituário", body);
}

export function generateCertificateHtml({
  clinic,
  doctor,
  patient,
  content,
  date,
}: DocumentParams): string {
  const body = `
  <div class="header">
    <h1>${clinic.name}</h1>
    <p>Documento emitido eletronicamente</p>
  </div>

  <div class="document-title">Atestado</div>

  <div class="date-location">
    <p>Data: ${date}</p>
  </div>

  <div class="patient-info">
    <p><strong>Paciente:</strong> ${patient.name}</p>
  </div>

  <div class="content">${content}</div>

  <div class="footer">
    <div class="signature-line"></div>
    <p class="doctor-name">Dr(a). ${doctor.name}</p>
    <p class="specialty">${doctor.specialty}</p>
  </div>`;

  return wrapHtml("Atestado", body);
}

export function generateReportHtml({
  clinic,
  doctor,
  patient,
  content,
  date,
}: DocumentParams): string {
  const body = `
  <div class="header">
    <h1>${clinic.name}</h1>
    <p>Documento emitido eletronicamente</p>
  </div>

  <div class="document-title">Relatório Clínico</div>

  <div class="date-location">
    <p>Data: ${date}</p>
  </div>

  <div class="patient-info">
    <p><strong>Paciente:</strong> ${patient.name}</p>
  </div>

  <div class="content">${content}</div>

  <div class="footer">
    <div class="signature-line"></div>
    <p class="doctor-name">Dr(a). ${doctor.name}</p>
    <p class="specialty">${doctor.specialty}</p>
  </div>`;

  return wrapHtml("Relatório Clínico", body);
}

export function generateExamRequestHtml({
  clinic,
  doctor,
  patient,
  content,
  date,
}: DocumentParams): string {
  const body = `
  <div class="header">
    <h1>${clinic.name}</h1>
    <p>Documento emitido eletronicamente</p>
  </div>

  <div class="document-title">Solicitação de Exame</div>

  <div class="date-location">
    <p>Data: ${date}</p>
  </div>

  <div class="patient-info">
    <p><strong>Paciente:</strong> ${patient.name}</p>
  </div>

  <div class="content">${content}</div>

  <div class="footer">
    <div class="signature-line"></div>
    <p class="doctor-name">Dr(a). ${doctor.name}</p>
    <p class="specialty">${doctor.specialty}</p>
  </div>`;

  return wrapHtml("Solicitação de Exame", body);
}

export function generateReferralHtml({
  clinic,
  doctor,
  patient,
  content,
  date,
}: DocumentParams): string {
  const body = `
  <div class="header">
    <h1>${clinic.name}</h1>
    <p>Documento emitido eletronicamente</p>
  </div>

  <div class="document-title">Encaminhamento</div>

  <div class="date-location">
    <p>Data: ${date}</p>
  </div>

  <div class="patient-info">
    <p><strong>Paciente:</strong> ${patient.name}</p>
  </div>

  <div class="content">${content}</div>

  <div class="footer">
    <div class="signature-line"></div>
    <p class="doctor-name">Dr(a). ${doctor.name}</p>
    <p class="specialty">${doctor.specialty}</p>
  </div>`;

  return wrapHtml("Encaminhamento", body);
}
