import dayjs from "dayjs";
import { AlertTriangle, TrendingUp } from "lucide-react";

import {
  PageBanner,
  PageContainer,
  PageContent,
} from "@/components/ui/page-container";
import WithAuthentication from "@/hocs/with-authentication";
import { getMetaAdsData } from "@/actions/meta-ads";

import AdsStatsCards from "./_components/ads-stats-cards";
import AdsDailyChart from "./_components/ads-daily-chart";
import AdsCampaignsTable from "./_components/ads-campaigns-table";
import AdsTopCreatives from "./_components/ads-top-creatives";
import DateFilter from "./_components/date-filter";

interface TrafegoPageProps {
  searchParams: Promise<{
    from?: string;
    to?: string;
  }>;
}

const TrafegoPage = async ({ searchParams }: TrafegoPageProps) => {
  const { from, to } = await searchParams;
  const dateFrom = from || dayjs().startOf("month").format("YYYY-MM-DD");
  const dateTo = to || dayjs().format("YYYY-MM-DD");

  const hasMetaConfig = process.env.META_ADS_ACCESS_TOKEN && process.env.META_ADS_AD_ACCOUNT_ID;

  if (!hasMetaConfig) {
    return (
      <WithAuthentication mustHaveClinic>
        <PageContainer>
          <PageBanner
            icon={TrendingUp}
            title="Tráfego Pago"
            description="Dashboard de performance de anúncios Meta Ads"
          />
          <PageContent>
            <div className="mx-auto max-w-lg py-12">
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-8 text-center space-y-4">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-100">
                  <AlertTriangle className="h-7 w-7 text-amber-600" />
                </div>
                <h3 className="text-lg font-semibold text-amber-900">Meta Ads não configurado</h3>
                <p className="text-sm text-amber-700">
                  Para ativar o dashboard de tráfego pago, adicione as seguintes variáveis no <code className="rounded bg-amber-100 px-1.5 py-0.5 font-mono text-xs">.env</code>:
                </p>
                <div className="rounded-lg bg-white/80 p-4 text-left font-mono text-xs space-y-1">
                  <p><span className="text-amber-600">META_ADS_ACCESS_TOKEN</span>=seu_token_aqui</p>
                  <p><span className="text-amber-600">META_ADS_AD_ACCOUNT_ID</span>=seu_ad_account_id</p>
                </div>
              </div>
            </div>
          </PageContent>
        </PageContainer>
      </WithAuthentication>
    );
  }

  let data;
  let error: string | null = null;

  try {
    data = await getMetaAdsData(dateFrom, dateTo);
  } catch (e) {
    error = e instanceof Error ? e.message : "Erro ao carregar dados do Meta Ads";
  }

  return (
    <WithAuthentication mustHaveClinic>
      <PageContainer>
        <PageBanner
          icon={TrendingUp}
          title="Tráfego Pago"
          description={`Performance de anúncios · ${dayjs(dateFrom).format("DD/MM")} a ${dayjs(dateTo).format("DD/MM/YYYY")}`}
        />

        <PageContent>
          <div className="flex items-center justify-between">
            <DateFilter />
            <span className="text-xs text-muted-foreground">
              {dayjs(dateFrom).format("DD/MM")} — {dayjs(dateTo).format("DD/MM/YYYY")}
            </span>
          </div>

          {error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
              <AlertTriangle className="mx-auto h-8 w-8 text-red-500 mb-2" />
              <p className="font-medium text-red-800">Erro ao carregar dados</p>
              <p className="text-sm text-red-600 mt-1">{error}</p>
            </div>
          ) : data ? (
            <>
              <AdsStatsCards
                totalSpend={data.totalSpend}
                totalImpressions={data.totalImpressions}
                totalClicks={data.totalClicks}
                totalLeads={data.totalLeads}
                totalReach={data.totalReach}
                avgCpl={data.avgCpl}
                avgCpm={data.avgCpm}
                avgCtr={data.avgCtr}
                avgFrequency={data.avgFrequency}
                leadCampaignSpend={data.leadCampaignSpend}
              />

              <AdsDailyChart data={data.dailyData} />

              <AdsCampaignsTable campaigns={data.campaigns} />

              <AdsTopCreatives creatives={data.topCreatives} />
            </>
          ) : null}
        </PageContent>
      </PageContainer>
    </WithAuthentication>
  );
};

export default TrafegoPage;
