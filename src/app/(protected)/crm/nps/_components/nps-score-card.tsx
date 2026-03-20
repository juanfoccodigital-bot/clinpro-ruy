"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface NpsScoreCardProps {
  npsScore: number;
  promoters: number;
  passives: number;
  detractors: number;
  totalResponses: number;
}

const NpsScoreCard = ({
  npsScore,
  promoters,
  passives,
  detractors,
  totalResponses,
}: NpsScoreCardProps) => {
  const getNpsColor = (score: number) => {
    if (score > 50) return "text-green-600";
    if (score >= 0) return "text-yellow-600";
    return "text-red-600";
  };

  const getNpsLabel = (score: number) => {
    if (score > 75) return "Excelente";
    if (score > 50) return "Muito Bom";
    if (score > 0) return "Razoavel";
    return "Critico";
  };

  const getNpsBgColor = (score: number) => {
    if (score > 50) return "bg-green-50 border-green-200";
    if (score >= 0) return "bg-yellow-50 border-yellow-200";
    return "bg-red-50 border-red-200";
  };

  return (
    <Card className={getNpsBgColor(npsScore)}>
      <CardHeader>
        <CardTitle className="text-base">Net Promoter Score (NPS)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-8">
          <div className="text-center">
            <div className={`text-5xl font-bold ${getNpsColor(npsScore)}`}>
              {npsScore}
            </div>
            <p className={`mt-1 text-sm font-medium ${getNpsColor(npsScore)}`}>
              {getNpsLabel(npsScore)}
            </p>
          </div>

          <div className="flex-1 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-green-500" />
                <span className="text-sm">Promotores (9-10)</span>
              </div>
              <span className="font-semibold text-green-600">{promoters}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-yellow-500" />
                <span className="text-sm">Neutros (7-8)</span>
              </div>
              <span className="font-semibold text-yellow-600">{passives}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-red-500" />
                <span className="text-sm">Detratores (0-6)</span>
              </div>
              <span className="font-semibold text-red-600">{detractors}</span>
            </div>
            <div className="border-t pt-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total de Respostas</span>
                <span className="font-semibold">{totalResponses}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default NpsScoreCard;
