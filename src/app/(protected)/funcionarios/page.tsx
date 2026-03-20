import { eq } from "drizzle-orm";
import { UserCog } from "lucide-react";
import { headers } from "next/headers";

import {
  PageBanner,
  PageContainer,
  PageContent,
} from "@/components/ui/page-container";
import { db } from "@/db";
import { employeesTable } from "@/db/schema";
import WithAuthentication from "@/hocs/with-authentication";
import { auth } from "@/lib/auth";

import AddEmployeeButton from "./_components/add-employee-button";
import EmployeeDataTable from "./_components/employee-data-table";

const FuncionariosPage = async () => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const clinicId = session!.user.clinic!.id;

  const employees = await db.query.employeesTable.findMany({
    where: eq(employeesTable.clinicId, clinicId),
    orderBy: (table, { asc }) => [asc(table.name)],
    with: {
      doctor: true,
    },
  });

  return (
    <WithAuthentication mustHaveClinic>
      <PageContainer>
        <PageBanner
          icon={UserCog}
          title="Funcionarios"
          description="Gerencie os funcionarios da sua clinica"
        >
          <AddEmployeeButton />
        </PageBanner>
        <PageContent>
          <div className="animate-fade-slide-up delay-1">
            <EmployeeDataTable data={employees} />
          </div>
        </PageContent>
      </PageContainer>
    </WithAuthentication>
  );
};

export default FuncionariosPage;
