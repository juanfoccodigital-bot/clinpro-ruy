import dayjs from "dayjs";
import { ArrowLeft, Download } from "lucide-react";
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
import { getPatientDocuments } from "@/data/get-portal-data";
import { getPortalSession } from "@/lib/portal-auth";

const typeLabels: Record<string, string> = {
  prescription: "Receita",
  certificate: "Atestado",
  report: "Laudo",
  exam_request: "Solicitacao de Exame",
  referral: "Encaminhamento",
};

const typeBadgeColors: Record<string, string> = {
  prescription: "bg-blue-100 text-blue-800",
  certificate: "bg-green-100 text-green-800",
  report: "bg-amber-100 text-amber-800",
  exam_request: "bg-yellow-100 text-yellow-800",
  referral: "bg-orange-100 text-orange-800",
};

export default async function PortalDocumentosPage() {
  const session = await getPortalSession();
  if (!session) redirect("/portal/login");

  const documents = await getPatientDocuments({
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
        <h1 className="text-2xl font-bold">Meus Documentos</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Documentos</CardTitle>
        </CardHeader>
        <CardContent>
          {documents.length === 0 ? (
            <p className="py-8 text-center text-muted-foreground">
              Nenhum documento encontrado.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Titulo</TableHead>
                  <TableHead>Profissional</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Acoes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {documents.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className={typeBadgeColors[doc.type] || ""}
                      >
                        {typeLabels[doc.type] || doc.type}
                      </Badge>
                    </TableCell>
                    <TableCell>{doc.title}</TableCell>
                    <TableCell>{"—"}</TableCell>
                    <TableCell>
                      {dayjs(doc.createdAt).format("DD/MM/YYYY")}
                    </TableCell>
                    <TableCell>
                      {doc.pdfUrl ? (
                        <a
                          href={doc.pdfUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button variant="outline" size="sm">
                            <Download className="mr-2 h-4 w-4" />
                            Baixar PDF
                          </Button>
                        </a>
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          --
                        </span>
                      )}
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
