import { eq } from "drizzle-orm";
import { Stethoscope } from "lucide-react";
import { headers } from "next/headers";

import {
  PageBanner,
  PageContainer,
  PageContent,
} from "@/components/ui/page-container";
import { getTerminology } from "@/config/clinic-types";
import { db } from "@/db";
import { doctorsTable } from "@/db/schema";
import WithAuthentication from "@/hocs/with-authentication";
import { auth } from "@/lib/auth";

import AddDoctorButton from "./_components/add-doctor-button";
import DoctorCard from "./_components/doctor-card";

const DoctorsPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const doctors = await db.query.doctorsTable.findMany({
    where: eq(doctorsTable.clinicId, session!.user.clinic!.id),
  });
  const terms = getTerminology(session!.user.clinic?.clinicType);
  return (
    <WithAuthentication mustHaveClinic>
      <PageContainer>
        <PageBanner
          icon={Stethoscope}
          title={terms.professionals}
          description={`Gerencie os ${terms.professionals.toLowerCase()} da sua clinica`}
        >
          <AddDoctorButton />
        </PageBanner>
        <PageContent>
          <div className="animate-fade-slide-up delay-1 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {doctors.map((doctor, index) => (
              <div key={doctor.id} className="animate-fade-slide-up" style={{ animationDelay: `${(index + 1) * 75}ms` }}>
                <DoctorCard doctor={doctor} />
              </div>
            ))}
          </div>
        </PageContent>
      </PageContainer>
    </WithAuthentication>
  );
};

export default DoctorsPage;
