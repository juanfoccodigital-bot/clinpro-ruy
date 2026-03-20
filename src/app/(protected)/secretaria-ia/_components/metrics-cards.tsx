"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface MetricsCardsProps {
  metrics: {
    totalConversations: number;
    resolvedConversations: number;
    totalMessages: number;
    totalTokens: number;
  };
}

const MetricsCards = ({ metrics }: MetricsCardsProps) => {
  const resolutionRate =
    metrics.totalConversations > 0
      ? Math.round(
          (metrics.resolvedConversations / metrics.totalConversations) * 100,
        )
      : 0;

  const cards = [
    { title: "Total de Conversas", value: metrics.totalConversations },
    {
      title: "Resolvidas",
      value: `${metrics.resolvedConversations} (${resolutionRate}%)`,
    },
    { title: "Mensagens Processadas", value: metrics.totalMessages },
    {
      title: "Tokens Utilizados",
      value: metrics.totalTokens.toLocaleString("pt-BR"),
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {card.title}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{card.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default MetricsCards;
