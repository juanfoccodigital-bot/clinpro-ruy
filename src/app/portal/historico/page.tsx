import dayjs from "dayjs";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getPatientMedicalRecords } from "@/data/get-portal-data";
import { getPortalSession } from "@/lib/portal-auth";

const recordTypeLabels: Record<string, string> = {
  anamnesis: "Anamnese",
  evolution: "Evolucao",
  exam_result: "Resultado de Exame",
  prescription: "Prescricao",
  certificate: "Atestado",
  referral: "Encaminhamento",
};

const recordTypeBadgeColors: Record<string, string> = {
  anamnesis: "bg-blue-100 text-blue-800",
  evolution: "bg-green-100 text-green-800",
  exam_result: "bg-amber-100 text-amber-800",
  prescription: "bg-yellow-100 text-yellow-800",
  certificate: "bg-orange-100 text-orange-800",
  referral: "bg-red-100 text-red-800",
};

export default async function PortalHistoricoPage() {
  const session = await getPortalSession();
  if (!session) redirect("/portal/login");

  const records = await getPatientMedicalRecords({
    patientId: session.patient.id,
    clinicId: session.patientUser.clinicId,
  });

  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="mb-6 flex items-center gap-4">
        <Link href="/portal">
          <Button variant="outline" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold">Historico Clinico</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Registros Clinicos</CardTitle>
        </CardHeader>
        <CardContent>
          {records.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">
              Nenhum registro clinico encontrado.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Titulo</TableHead>
                  <TableHead>Profissional</TableHead>
                  <TableHead>CID-10</TableHead>
                  <TableHead>Data</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {records.map((record) => (
                  <TableRow key={record.id}>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={recordTypeBadgeColors[record.type] || ""}
                      >
                        {recordTypeLabels[record.type] || record.type}
                      </Badge>
                    </TableCell>
                    <TableCell>{record.title}</TableCell>
                    <TableCell>{record.doctor.name}</TableCell>
                    <TableCell>
                      {record.cid10Code ? (
                        <span title={record.cid10Description || ""}>
                          {record.cid10Code}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">--</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {dayjs(record.createdAt).format("DD/MM/YYYY")}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
