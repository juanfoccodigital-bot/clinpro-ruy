"use client";

import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CalendarIcon, Clock, DollarSign, FileText, User } from "lucide-react";
import { useAction } from "next-safe-action/hooks";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { NumericFormat } from "react-number-format";
import { toast } from "sonner";

import { addAppointment } from "@/actions/add-appointment";
import { moveContactToStage } from "@/actions/crm-pipeline";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface QuickScheduleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contactId: string;
  contactName: string;
  stageId: string;
}

export default function QuickScheduleDialog({
  open,
  onOpenChange,
  contactId,
  contactName,
  stageId,
}: QuickScheduleDialogProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [date, setDate] = useState<Date | undefined>(undefined);
  const [time, setTime] = useState("");
  const [priceInCents, setPriceInCents] = useState<number>(0);
  const [notes, setNotes] = useState("");

  const createAppointmentAction = useAction(addAppointment);

  const resetForm = () => {
    setDate(undefined);
    setTime("");
    setPriceInCents(0);
    setNotes("");
  };

  const handleScheduleAndMove = () => {
    if (!date) {
      toast.error("Selecione uma data para o agendamento.");
      return;
    }
    if (!time || !/^\d{2}:\d{2}$/.test(time)) {
      toast.error("Informe um horario valido (ex: 14:30).");
      return;
    }
    if (priceInCents <= 0) {
      toast.error("Informe o valor do procedimento.");
      return;
    }

    startTransition(async () => {
      try {
        // Create appointment via safe action
        const result = await createAppointmentAction.executeAsync({
          patientId: contactId,
          date,
          time,
          appointmentPriceInCents: priceInCents,
        });

        if (result?.serverError || result?.validationErrors) {
          toast.error("Erro ao criar agendamento.");
          return;
        }

        // Move contact to stage
        await moveContactToStage({
          patientId: contactId,
          stageId,
          notes: notes || undefined,
        });

        toast.success("Agendamento criado e contato movido com sucesso!");
        router.refresh();
        resetForm();
        onOpenChange(false);
      } catch {
        toast.error("Erro ao criar agendamento.");
      }
    });
  };

  const handleMoveOnly = () => {
    startTransition(async () => {
      try {
        await moveContactToStage({
          patientId: contactId,
          stageId,
          notes: notes || undefined,
        });

        toast.success("Contato movido com sucesso!");
        router.refresh();
        resetForm();
        onOpenChange(false);
      } catch {
        toast.error("Erro ao mover contato.");
      }
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!v) resetForm();
        onOpenChange(v);
      }}
    >
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100">
              <CalendarIcon className="h-4 w-4 text-amber-600" />
            </div>
            Agendar Consulta
          </DialogTitle>
          <DialogDescription>
            O contato sera movido para a etapa &quot;Agendado&quot;. Deseja
            criar um agendamento?
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Patient name */}
          <div className="flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
            <User className="h-4 w-4 text-amber-600" />
            <span className="text-sm font-medium text-amber-800">
              {contactName}
            </span>
          </div>

          {/* Date picker */}
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5 text-sm font-medium">
              <CalendarIcon className="h-3.5 w-3.5 text-muted-foreground" />
              Data
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date
                    ? format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                    : "Selecionar data"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  locale={ptBR}
                  disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Time input */}
          <div className="space-y-2">
            <Label htmlFor="schedule-time" className="flex items-center gap-1.5 text-sm font-medium">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              Horario
            </Label>
            <Input
              id="schedule-time"
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              placeholder="14:30"
            />
          </div>

          {/* Price input */}
          <div className="space-y-2">
            <Label className="flex items-center gap-1.5 text-sm font-medium">
              <DollarSign className="h-3.5 w-3.5 text-muted-foreground" />
              Valor do procedimento
            </Label>
            <NumericFormat
              value={priceInCents / 100}
              onValueChange={(values) => {
                setPriceInCents(Math.round((values.floatValue || 0) * 100));
              }}
              decimalScale={2}
              fixedDecimalScale
              decimalSeparator=","
              thousandSeparator="."
              prefix="R$ "
              allowNegative={false}
              customInput={Input}
              placeholder="R$ 0,00"
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="schedule-notes" className="flex items-center gap-1.5 text-sm font-medium">
              <FileText className="h-3.5 w-3.5 text-muted-foreground" />
              Observacoes
            </Label>
            <Textarea
              id="schedule-notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Procedimento, observacoes..."
              className="min-h-20 resize-none"
            />
          </div>
        </div>

        <DialogFooter className="flex-col gap-2 sm:flex-row">
          <Button
            variant="outline"
            onClick={handleMoveOnly}
            disabled={isPending || createAppointmentAction.isPending}
            className="w-full sm:w-auto"
          >
            {isPending ? "Movendo..." : "Apenas Mover"}
          </Button>
          <Button
            onClick={handleScheduleAndMove}
            disabled={isPending || createAppointmentAction.isPending}
            className="w-full bg-amber-500 text-white hover:bg-amber-600 sm:w-auto"
          >
            <CalendarIcon className="mr-1 h-3.5 w-3.5" />
            {isPending || createAppointmentAction.isPending ? "Agendando..." : "Agendar e Mover"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
