"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { patientsTable } from "@/db/schema";

import UpsertWaitingListForm from "./upsert-waiting-list-form";

interface AddWaitingListButtonProps {
  patients: (typeof patientsTable.$inferSelect)[];
}

const AddWaitingListButton = ({
  patients,
}: AddWaitingListButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus />
          Adicionar a lista
        </Button>
      </DialogTrigger>
      <UpsertWaitingListForm
        isOpen={isOpen}
        patients={patients}
        onSuccess={() => setIsOpen(false)}
      />
    </Dialog>
  );
};

export default AddWaitingListButton;
