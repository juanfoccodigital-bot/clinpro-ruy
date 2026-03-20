"use client";

import { Plus } from "lucide-react";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";

import UpsertCampaignForm from "./upsert-campaign-form";

const AddCampaignButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus />
          Nova campanha
        </Button>
      </DialogTrigger>
      <UpsertCampaignForm
        isOpen={isOpen}
        onSuccess={() => setIsOpen(false)}
      />
    </Dialog>
  );
};

export default AddCampaignButton;
