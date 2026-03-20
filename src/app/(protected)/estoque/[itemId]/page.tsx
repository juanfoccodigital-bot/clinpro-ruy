import dayjs from "dayjs";
import { and, desc, eq } from "drizzle-orm";
import { ArrowLeftIcon } from "lucide-react";
import { headers } from "next/headers";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  PageActions,
  PageContainer,
  PageContent,
  PageDescription,
  PageHeader,
  PageHeaderContent,
  PageTitle,
} from "@/components/ui/page-container";
import { db } from "@/db";
import { stockItemsTable, stockMovementsTable } from "@/db/schema";
import WithAuthentication from "@/hocs/with-authentication";
import { auth } from "@/lib/auth";

import AddMovementButton from "./_components/add-movement-button";
import MovementDataTable from "./_components/movement-data-table";

const categoryLabels: Record<string, string> = {
  medication: "Medicamento",
  material: "Material",
  equipment: "Equipamento",
  epi: "EPI",
  cleaning: "Limpeza",
  office: "Escritorio",
  other: "Outros",
};

const categoryColors: Record<string, string> = {
  medication: "bg-blue-100 text-blue-800 border-blue-200",
  material: "bg-green-100 text-green-800 border-green-200",
  equipment: "bg-amber-100 text-amber-800 border-amber-200",
  epi: "bg-orange-100 text-orange-800 border-orange-200",
  cleaning: "bg-yellow-100 text-yellow-800 border-yellow-200",
  office: "bg-gray-100 text-gray-800 border-gray-200",
  other: "",
};

interface StockItemDetailPageProps {
  params: Promise<{ itemId: string }>;
}

const StockItemDetailPage = async ({ params }: StockItemDetailPageProps) => {
  const { itemId } = await params;
  const session = await auth.api.getSession({
    headers: await headers(),
  });
  const clinicId = session!.user.clinic!.id;

  const item = await db.query.stockItemsTable.findFirst({
    where: and(
      eq(stockItemsTable.id, itemId),
      eq(stockItemsTable.clinicId, clinicId),
    ),
  });

  if (!item) {
    notFound();
  }

  const movements = await db.query.stockMovementsTable.findMany({
    where: and(
      eq(stockMovementsTable.stockItemId, itemId),
      eq(stockMovementsTable.clinicId, clinicId),
    ),
    orderBy: [desc(stockMovementsTable.createdAt)],
  });

  const isBelowMinimum = item.currentQuantity < item.minimumQuantity;

  return (
    <WithAuthentication mustHaveClinic>
      <PageContainer>
        <PageHeader>
          <PageHeaderContent>
            <PageTitle>{item.name}</PageTitle>
            <PageDescription>
              Detalhes e movimentacoes do item de estoque.
            </PageDescription>
          </PageHeaderContent>
          <PageActions>
            <Link href="/estoque">
              <Button variant="outline">
                <ArrowLeftIcon className="mr-2 h-4 w-4" />
                Voltar
              </Button>
            </Link>
            <AddMovementButton stockItemId={item.id} />
          </PageActions>
        </PageHeader>
        <PageContent>
          <Card>
            <CardHeader>
              <CardTitle>Informacoes do Item</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
                <div>
                  <p className="text-muted-foreground text-sm">Categoria</p>
                  <Badge
                    variant="outline"
                    className={categoryColors[item.category]}
                  >
                    {categoryLabels[item.category] ?? item.category}
                  </Badge>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">SKU</p>
                  <p className="font-medium">{item.sku || "-"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">
                    Quantidade Atual
                  </p>
                  <p
                    className={`font-medium ${isBelowMinimum ? "text-red-600" : ""}`}
                  >
                    {item.currentQuantity}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">
                    Quantidade Minima
                  </p>
                  <p className="font-medium">{item.minimumQuantity}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Custo</p>
                  <p className="font-medium">
                    {item.costInCents
                      ? (item.costInCents / 100).toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        })
                      : "-"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">
                    Data de Validade
                  </p>
                  <p className="font-medium">
                    {item.expirationDate
                      ? dayjs(item.expirationDate).format("DD/MM/YYYY")
                      : "-"}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Localizacao</p>
                  <p className="font-medium">{item.location || "-"}</p>
                </div>
                <div>
                  <p className="text-muted-foreground text-sm">Observacoes</p>
                  <p className="font-medium">{item.notes || "-"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <MovementDataTable data={movements} />
        </PageContent>
      </PageContainer>
    </WithAuthentication>
  );
};

export default StockItemDetailPage;
