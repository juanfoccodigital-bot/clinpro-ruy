"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";

import UpsertTimeRecordForm from "./upsert-time-record-form";

interface AddTimeRecordButtonProps {
  employeeId: string;
}

const AddTimeRecordButton = ({ employeeId }: AddTimeRecordButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus />
          Novo registro
        </Button>
      </DialogTrigger>
      <UpsertTimeRecordForm
        isOpen={isOpen}
        employeeId={employeeId}
        onSuccess={() => setIsOpen(false)}
      />
    </Dialog>
  );
};

export default AddTimeRecordButton;
