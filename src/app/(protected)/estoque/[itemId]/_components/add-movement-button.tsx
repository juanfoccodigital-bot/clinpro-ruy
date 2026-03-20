"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";

import AddMovementForm from "./add-movement-form";

interface AddMovementButtonProps {
  stockItemId: string;
}

const AddMovementButton = ({ stockItemId }: AddMovementButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus />
          Nova movimentacao
        </Button>
      </DialogTrigger>
      <AddMovementForm
        isOpen={isOpen}
        stockItemId={stockItemId}
        onSuccess={() => setIsOpen(false)}
      />
    </Dialog>
  );
};

export default AddMovementButton;
