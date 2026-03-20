import {
  Activity,
  Baby,
  Bone,
  Brain,
  Eye,
  Hand,
  Heart,
  Hospital,
  Stethoscope,
} from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface TopSpecialtiesProps {
  topSpecialties: {
    specialty: string;
    appointments: number;
  }[];
}

const getSpecialtyIcon = (specialty: string) => {
  const specialtyLower = specialty.toLowerCase();

  if (specialtyLower.includes("cardiolog")) return Heart;
  if (
    specialtyLower.includes("ginecolog") ||
    specialtyLower.includes("obstetri")
  )
    return Baby;
  if (specialtyLower.includes("pediatr")) return Activity;
  if (specialtyLower.includes("dermatolog")) return Hand;
  if (
    specialtyLower.includes("ortoped") ||
    specialtyLower.includes("traumatolog")
  )
    return Bone;
  if (specialtyLower.includes("oftalmolog")) return Eye;
  if (specialtyLower.includes("neurolog")) return Brain;

  return Stethoscope;
};

export default function TopSpecialties({
  topSpecialties,
}: TopSpecialtiesProps) {
  const maxAppointments = Math.max(
    ...topSpecialties.map((i) => i.appointments),
    1,
  );
  return (
    <Card className="hover:shadow-lg">
      <CardHeader className="flex flex-row items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10">
          <Hospital className="h-4 w-4 text-amber-600" />
        </div>
        <CardTitle>Procedimentos Populares</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {topSpecialties.map((specialty) => {
            const Icon = getSpecialtyIcon(specialty.specialty);
            const progressValue =
              (specialty.appointments / maxAppointments) * 100;

            return (
              <div
                key={specialty.specialty}
                className="group flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-muted/50"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 transition-transform duration-300 group-hover:scale-110">
                  <Icon className="text-primary h-5 w-5" />
                </div>
                <div className="flex w-full flex-col justify-center gap-1">
                  <div className="flex w-full justify-between">
                    <h3 className="text-sm font-medium">{specialty.specialty}</h3>
                    <span className="text-sm font-bold tabular-nums">
                      {specialty.appointments}
                    </span>
                  </div>
                  <Progress value={progressValue} className="h-1.5 w-full" />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
