"use client";

import { EditIcon } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { doctorCommissionsTable, doctorsTable } from "@/db/schema";

import CommissionForm from "./commission-form";

interface CommissionTableActionsProps {
  doctor: typeof doctorsTable.$inferSelect;
  commission?: typeof doctorCommissionsTable.$inferSelect;
  doctors: (typeof doctorsTable.$inferSelect)[];
}

const CommissionTableActions = ({
  doctor,
  commission,
}: CommissionTableActionsProps) => {
  const [dialogIsOpen, setDialogIsOpen] = useState(false);

  return (
    <Dialog open={dialogIsOpen} onOpenChange={setDialogIsOpen}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setDialogIsOpen(true)}
      >
        <EditIcon className="mr-1 h-4 w-4" />
        {commission ? "Editar" : "Definir"}
      </Button>
      <CommissionForm
        isOpen={dialogIsOpen}
        commission={commission}
        doctors={[doctor]}
        onSuccess={() => setDialogIsOpen(false)}
      />
    </Dialog>
  );
};

export default CommissionTableActions;
