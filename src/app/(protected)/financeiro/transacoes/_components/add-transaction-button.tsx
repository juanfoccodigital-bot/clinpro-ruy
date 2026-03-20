"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { patientsTable } from "@/db/schema";

import UpsertTransactionForm from "./upsert-transaction-form";

interface AddTransactionButtonProps {
  patients: (typeof patientsTable.$inferSelect)[];
}

const AddTransactionButton = ({
  patients,
}: AddTransactionButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus />
          Adicionar transacao
        </Button>
      </DialogTrigger>
      <UpsertTransactionForm
        isOpen={isOpen}
        patients={patients}
        onSuccess={() => setIsOpen(false)}
      />
    </Dialog>
  );
};

export default AddTransactionButton;
