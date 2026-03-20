"use client";

import { PlusIcon } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import UpsertMedicalRecordForm from "./upsert-medical-record-form";

interface AddMedicalRecordButtonProps {
  patientId: string;
}

const AddMedicalRecordButton = ({
  patientId,
}: AddMedicalRecordButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusIcon />
          Novo Registro
        </Button>
      </DialogTrigger>
      <UpsertMedicalRecordForm
        patientId={patientId}
        isOpen={isOpen}
        onSuccess={() => setIsOpen(false)}
      />
    </Dialog>
  );
};

export default AddMedicalRecordButton;
