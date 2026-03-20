"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ActivityIcon, TrashIcon } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";

import { deleteVitals } from "@/actions/delete-vitals";
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
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { vitalsTable } from "@/db/schema";

import AddVitalsButton from "./add-vitals-button";

interface VitalsTableProps {
  patientId: string;
  vitals: (typeof vitalsTable.$inferSelect)[];
}

const formatTemperature = (temp: number | null) => {
  if (temp === null || temp === undefined) return "-";
  return `${(temp / 10).toFixed(1)}°C`;
};

const formatWeight = (weight: number | null) => {
  if (weight === null || weight === undefined) return "-";
  return `${(weight / 1000).toFixed(1)}kg`;
};

const formatHeight = (height: number | null) => {
  if (height === null || height === undefined) return "-";
  return `${height}cm`;
};

const formatBP = (
  systolic: number | null,
  diastolic: number | null,
) => {
  if (systolic === null || diastolic === null) return "-";
  return `${systolic}/${diastolic}`;
};

const formatValue = (value: number | null, suffix: string) => {
  if (value === null || value === undefined) return "-";
  return `${value}${suffix}`;
};

const VitalsTable = ({ patientId, vitals }: VitalsTableProps) => {
  const deleteVitalsAction = useAction(deleteVitals, {
    onSuccess: () => {
      toast.success("Sinais vitais deletados com sucesso.");
    },
    onError: () => {
      toast.error("Erro ao deletar sinais vitais.");
    },
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Sinais Vitais</h3>
        <AddVitalsButton patientId={patientId} />
      </div>

      {vitals.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ActivityIcon className="text-muted-foreground mb-4 h-12 w-12" />
            <p className="text-muted-foreground text-sm">
              Nenhum registro de sinais vitais encontrado
            </p>
            <p className="text-muted-foreground text-xs">
              Registre os sinais vitais clicando no botão acima
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data</TableHead>
                  <TableHead>PA (mmHg)</TableHead>
                  <TableHead>FC (bpm)</TableHead>
                  <TableHead>Temp.</TableHead>
                  <TableHead>Peso</TableHead>
                  <TableHead>Altura</TableHead>
                  <TableHead>SpO2</TableHead>
                  <TableHead>FR (rpm)</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vitals.map((vital) => (
                  <TableRow key={vital.id}>
                    <TableCell className="text-xs">
                      {format(
                        new Date(vital.createdAt),
                        "dd/MM/yyyy HH:mm",
                        { locale: ptBR },
                      )}
                    </TableCell>
                    <TableCell>
                      {formatBP(vital.systolicBP, vital.diastolicBP)}
                    </TableCell>
                    <TableCell>
                      {formatValue(vital.heartRate, "bpm")}
                    </TableCell>
                    <TableCell>
                      {formatTemperature(vital.temperature)}
                    </TableCell>
                    <TableCell>
                      {formatWeight(vital.weightInGrams)}
                    </TableCell>
                    <TableCell>
                      {formatHeight(vital.heightInCm)}
                    </TableCell>
                    <TableCell>
                      {formatValue(vital.oxygenSaturation, "%")}
                    </TableCell>
                    <TableCell>
                      {formatValue(vital.respiratoryRate, "rpm")}
                    </TableCell>
                    <TableCell>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <TrashIcon className="h-4 w-4 text-red-500" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Tem certeza que deseja deletar estes sinais
                              vitais?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              Essa ação não pode ser revertida. O registro
                              será permanentemente removido.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() =>
                                deleteVitalsAction.execute({
                                  id: vital.id,
                                })
                              }
                            >
                              Deletar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default VitalsTable;
