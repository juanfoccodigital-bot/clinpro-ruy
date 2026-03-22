"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";

import UpsertEmployeeForm from "./upsert-employee-form";

const AddEmployeeButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="bg-white text-[#261C10] hover:bg-white/90 shadow-sm font-semibold">
          <Plus />
          Adicionar funcionario
        </Button>
      </DialogTrigger>
      <UpsertEmployeeForm
        isOpen={isOpen}
        onSuccess={() => setIsOpen(false)}
      />
    </Dialog>
  );
};

export default AddEmployeeButton;
