"use client";

import { differenceInYears } from "date-fns";
import { MailIcon, MegaphoneIcon, PhoneIcon, TagIcon } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { patientProfilesTable, patientsTable } from "@/db/schema";

interface PatientHeaderProps {
  patient: typeof patientsTable.$inferSelect;
  profile: typeof patientProfilesTable.$inferSelect | null;
}

const PatientHeader = ({ patient, profile }: PatientHeaderProps) => {
  const initials = patient.name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const age =
    profile?.dateOfBirth
      ? differenceInYears(new Date(), new Date(profile.dateOfBirth))
      : null;

  return (
    <Card>
      <CardContent className="flex items-center gap-6 p-6">
        <Avatar className="h-20 w-20">
          <AvatarFallback className="text-2xl font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl font-bold">{patient.name}</h2>
            <Badge variant="secondary">
              {patient.sex === "male" ? "Masculino" : "Feminino"}
            </Badge>
            {profile?.bloodType && (
              <Badge variant="outline">{profile.bloodType}</Badge>
            )}
            {age !== null && (
              <Badge variant="outline">{age} anos</Badge>
            )}
            {patient.leadSource && (
              <Badge variant="secondary" className="gap-1">
                <MegaphoneIcon className="h-3 w-3" />
                {patient.leadSource}
              </Badge>
            )}
            {patient.leadSourceDetail && (
              <Badge variant="outline" className="gap-1">
                <TagIcon className="h-3 w-3" />
                {patient.leadSourceDetail}
              </Badge>
            )}
            {patient.leadAdName && (
              <Badge variant="outline" className="gap-1">
                {patient.leadAdName}
              </Badge>
            )}
          </div>
          <div className="text-muted-foreground flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <MailIcon className="h-4 w-4" />
              <span>{patient.email}</span>
            </div>
            <Separator orientation="vertical" className="h-4" />
            <div className="flex items-center gap-1">
              <PhoneIcon className="h-4 w-4" />
              <span>{patient.phoneNumber}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PatientHeader;
