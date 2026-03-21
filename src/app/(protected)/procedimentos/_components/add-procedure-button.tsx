"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { stockItemsTable } from "@/db/schema";

import UpsertProcedureForm from "./upsert-procedure-form";

interface AddProcedureButtonProps {
  stockItems: (typeof stockItemsTable.$inferSelect)[];
}

const AddProcedureButton = ({ stockItems }: AddProcedureButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus />
          Novo procedimento
        </Button>
      </DialogTrigger>
      <UpsertProcedureForm
        stockItems={stockItems}
        onSuccess={() => setIsOpen(false)}
        isOpen={isOpen}
      />
    </Dialog>
  );
};

export default AddProcedureButton;
