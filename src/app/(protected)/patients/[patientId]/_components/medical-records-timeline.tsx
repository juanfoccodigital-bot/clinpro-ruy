"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  ChevronDownIcon,
  ChevronUpIcon,
  FileTextIcon,
  LockIcon,
  TrashIcon,
} from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useState } from "react";
import { toast } from "sonner";

import { deleteMedicalRecord } from "@/actions/delete-medical-record";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { medicalRecordsTable } from "@/db/schema";

import AddMedicalRecordButton from "./add-medical-record-button";

const recordTypeLabels: Record<string, string> = {
  anamnesis: "Anamnese",
  evolution: "Evolução",
  exam_result: "Resultado de Exame",
  prescription: "Receita",
  certificate: "Atestado",
  referral: "Encaminhamento",
};

const recordTypeColors: Record<string, string> = {
  anamnesis: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  evolution:
    "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  exam_result:
    "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300",
  prescription:
    "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  certificate:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  referral: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
};

interface MedicalRecordsTimelineProps {
  patientId: string;
  medicalRecords: (typeof medicalRecordsTable.$inferSelect)[];
}

const MedicalRecordsTimeline = ({
  patientId,
  medicalRecords,
}: MedicalRecordsTimelineProps) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const deleteRecordAction = useAction(deleteMedicalRecord, {
    onSuccess: () => {
      toast.success("Registro deletado com sucesso.");
    },
    onError: () => {
      toast.error("Erro ao deletar registro.");
    },
  });

  const handleToggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Ficha Clínica</h3>
        <AddMedicalRecordButton patientId={patientId} />
      </div>

      {medicalRecords.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileTextIcon className="text-muted-foreground mb-4 h-12 w-12" />
            <p className="text-muted-foreground text-sm">
              Nenhum registro clínico encontrado
            </p>
            <p className="text-muted-foreground text-xs">
              Adicione o primeiro registro clicando no botão acima
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {medicalRecords.map((record) => {
            const isExpanded = expandedId === record.id;
            return (
              <Card key={record.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div
                      className="flex-1 cursor-pointer"
                      onClick={() => handleToggleExpand(record.id)}
                    >
                      <div className="flex items-center gap-2">
                        <span
                          className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ${recordTypeColors[record.type] ?? ""}`}
                        >
                          {recordTypeLabels[record.type] ?? record.type}
                        </span>
                        {record.isPrivate && (
                          <LockIcon className="text-muted-foreground h-3 w-3" />
                        )}
                        {record.cid10Code && (
                          <Badge variant="outline" className="text-xs">
                            {record.cid10Code}
                          </Badge>
                        )}
                      </div>
                      <h4 className="mt-1 font-medium">{record.title}</h4>
                      <div className="text-muted-foreground mt-1 flex items-center gap-2 text-xs">
                        <span>
                          {format(
                            new Date(record.createdAt),
                            "dd 'de' MMMM 'de' yyyy 'às' HH:mm",
                            { locale: ptBR },
                          )}
                        </span>
                      </div>
                      {!isExpanded && (
                        <p className="text-muted-foreground mt-2 line-clamp-2 text-sm">
                          {record.content}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleToggleExpand(record.id)}
                      >
                        {isExpanded ? (
                          <ChevronUpIcon className="h-4 w-4" />
                        ) : (
                          <ChevronDownIcon className="h-4 w-4" />
                        )}
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <TrashIcon className="h-4 w-4 text-red-500" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Tem certeza que deseja deletar este registro?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Essa ação não pode ser revertida. O registro
                              clínico será permanentemente removido.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() =>
                                deleteRecordAction.execute({
                                  id: record.id,
                                })
                              }
                            >
                              Deletar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="mt-4 space-y-3 border-t pt-4">
                      <div className="whitespace-pre-wrap text-sm">
                        {record.content}
                      </div>
                      {record.cid10Code && record.cid10Description && (
                        <div className="rounded-md bg-gray-50 p-3 dark:bg-gray-900">
                          <p className="text-xs font-medium">CID-10</p>
                          <p className="text-sm">
                            {record.cid10Code} - {record.cid10Description}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MedicalRecordsTimeline;
