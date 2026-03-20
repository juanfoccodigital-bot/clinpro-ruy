"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";

import UpsertStockItemForm from "./upsert-stock-item-form";

const AddStockItemButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus />
          Adicionar item
        </Button>
      </DialogTrigger>
      <UpsertStockItemForm
        isOpen={isOpen}
        onSuccess={() => setIsOpen(false)}
      />
    </Dialog>
  );
};

export default AddStockItemButton;
