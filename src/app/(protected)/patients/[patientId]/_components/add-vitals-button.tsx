"use client";

import { PlusIcon } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";

import UpsertVitalsForm from "./upsert-vitals-form";

interface AddVitalsButtonProps {
  patientId: string;
}

const AddVitalsButton = ({ patientId }: AddVitalsButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusIcon />
          Registrar Sinais Vitais
        </Button>
      </DialogTrigger>
      <UpsertVitalsForm
        patientId={patientId}
        isOpen={isOpen}
        onSuccess={() => setIsOpen(false)}
      />
    </Dialog>
  );
};

export default AddVitalsButton;
