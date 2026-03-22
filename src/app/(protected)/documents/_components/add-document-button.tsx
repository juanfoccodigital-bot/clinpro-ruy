"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { patientsTable } from "@/db/schema";

import UpsertDocumentForm from "./upsert-document-form";

interface AddDocumentButtonProps {
  patients: (typeof patientsTable.$inferSelect)[];
}

const AddDocumentButton = ({ patients }: AddDocumentButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-white text-[#261C10] hover:bg-white/90 shadow-sm font-semibold">
          <Plus />
          Adicionar documento
        </Button>
      </DialogTrigger>
      <UpsertDocumentForm
        isOpen={isOpen}
        patients={patients}
        onSuccess={() => setIsOpen(false)}
      />
    </Dialog>
  );
};

export default AddDocumentButton;
