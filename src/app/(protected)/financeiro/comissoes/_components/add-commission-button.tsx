"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import { doctorsTable } from "@/db/schema";

import CommissionForm from "./commission-form";

interface AddCommissionButtonProps {
  doctors: (typeof doctorsTable.$inferSelect)[];
}

const AddCommissionButton = ({ doctors }: AddCommissionButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus />
          Definir comissao
        </Button>
      </DialogTrigger>
      <CommissionForm
        isOpen={isOpen}
        doctors={doctors}
        onSuccess={() => setIsOpen(false)}
      />
    </Dialog>
  );
};

export default AddCommissionButton;
