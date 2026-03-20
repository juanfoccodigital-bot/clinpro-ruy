"use server";

import { headers } from "next/headers";

import { auth } from "@/lib/auth";

const META_API_VERSION = "v21.0";
const META_BASE_URL = `https://graph.facebook.com/${META_API_VERSION}`;

interface MetaAdsConfig {
  accessToken: string;
  adAccountId: string;
}

function getMetaConfig(): MetaAdsConfig {
  const accessToken = process.env.META_ADS_ACCESS_TOKEN;
  const adAccountId = process.env.META_ADS_AD_ACCOUNT_ID;

  if (!accessToken || !adAccountId) {
    throw new Error("META_ADS_ACCESS_TOKEN and META_ADS_AD_ACCOUNT_ID are required");
  }

  return { accessToken, adAccountId };
}

async function metaFetch(endpoint: string, params: Record<string, string> = {}) {
  const { accessToken } = getMetaConfig();
  const url = new URL(`${META_BASE_URL}${endpoint}`);
  url.searchParams.set("access_token", accessToken);
  for (const [key, value] of Object.entries(params)) {
    url.searchParams.set(key, value);
  }

  const res = await fetch(url.toString(), {
    next: { revalidate: 300 }, // cache 5 min
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    console.error("Meta API error:", error);
    throw new Error(error?.error?.message || "Meta API request failed");
  }

  return res.json();
}

export interface MetaAdsCampaign {
  id: string;
  name: string;
  status: string;
  objective: string;
  dailyBudget: number;
  spend: number;
  impressions: number;
  clicks: number;
  leads: number;
  cpl: number;
  cpm: number;
  ctr: number;
  frequency: number;
}

export interface MetaAdsOverview {
  totalSpend: number;
  totalImpressions: number;
  totalClicks: number;
  totalLeads: number;
  totalReach: number;
  avgCpl: number;
  avgCpm: number;
  avgCtr: number;
  avgFrequency: number;
  leadCampaignSpend: number;
  campaigns: MetaAdsCampaign[];
  dailyData: { date: string; spend: number; leads: number; clicks: number; impressions: number }[];
  topCreatives: { id: string; name: string; thumbnailUrl: string; spend: number; leads: number; cpl: number; ctr: number }[];
}

export async function getMetaAdsData(dateFrom: string, dateTo: string): Promise<MetaAdsOverview> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) throw new Error("Unauthorized");

  const { adAccountId } = getMetaConfig();
  const timeRange = JSON.stringify({ since: dateFrom, until: dateTo });

  // Fetch account-level insights
  const [accountInsights, campaignsData, dailyInsights, adInsights] = await Promise.all([
    // Overall metrics
    metaFetch(`/act_${adAccountId}/insights`, {
      fields: "spend,impressions,clicks,reach,cpm,ctr,frequency,actions,cost_per_action_type",
      time_range: timeRange,
      level: "account",
    }),
    // Campaigns
    metaFetch(`/act_${adAccountId}/campaigns`, {
      fields: "id,name,status,objective,daily_budget,insights.time_range(" + timeRange + "){spend,impressions,clicks,cpm,ctr,frequency,actions,cost_per_action_type}",
      filtering: JSON.stringify([{ field: "delivery_info", operator: "IN", value: ["active", "inactive", "completed"] }]),
      limit: "50",
    }),
    // Daily breakdown
    metaFetch(`/act_${adAccountId}/insights`, {
      fields: "spend,impressions,clicks,actions",
      time_range: timeRange,
      time_increment: "1",
      level: "account",
    }),
    // Top creatives (ad level)
    metaFetch(`/act_${adAccountId}/ads`, {
      fields: "id,name,creative{thumbnail_url,title},insights.time_range(" + timeRange + "){spend,impressions,clicks,ctr,actions,cost_per_action_type}",
      filtering: JSON.stringify([{ field: "delivery_info", operator: "IN", value: ["active", "inactive", "completed"] }]),
      limit: "20",
    }),
  ]);

  // Parse account-level data
  const acct = accountInsights?.data?.[0] || {};
  const totalSpend = parseFloat(acct.spend || "0");
  const totalImpressions = parseInt(acct.impressions || "0");
  const totalClicks = parseInt(acct.clicks || "0");
  const totalReach = parseInt(acct.reach || "0");
  const avgCpm = parseFloat(acct.cpm || "0");
  const avgCtr = parseFloat(acct.ctr || "0");
  const avgFrequency = parseFloat(acct.frequency || "0");

  // Extract leads = new messaging contacts (real leads)
  const getLeads = (actions: Array<{ action_type: string; value: string }> | undefined) => {
    if (!actions) return 0;
    // Priority: messaging conversations started > onsite_conversion.messaging > lead
    const messagingTypes = [
      "onsite_conversion.messaging_conversation_started_7d",
      "onsite_conversion.messaging_first_reply",
      "messaging_conversation_started_7d",
    ];
    for (const type of messagingTypes) {
      const found = actions.find((a) => a.action_type === type);
      if (found) return parseInt(found.value || "0");
    }
    // Fallback to traditional lead
    const lead = actions.find(
      (a) => a.action_type === "lead" || a.action_type === "onsite_conversion.lead_grouped"
    );
    return parseInt(lead?.value || "0");
  };

  // Check if campaign name qualifies for lead spend calculation
  const isLeadCampaign = (name: string) => {
    const lower = name.toLowerCase();
    const excluded = ["reconhecimento", "base"];
    if (excluded.some((ex) => lower.includes(ex))) return false;
    return lower.includes("lead");
  };

  const totalLeads = getLeads(acct.actions);

  // Parse campaigns
  const campaigns: MetaAdsCampaign[] = (campaignsData?.data || []).map((c: Record<string, unknown>) => {
    const ins = (c.insights as Record<string, unknown>)?.data as Record<string, unknown>[] | undefined;
    const ci = ins?.[0] || {};
    const campaignLeads = getLeads(ci.actions as Array<{ action_type: string; value: string }> | undefined);
    const campaignSpend = parseFloat(ci.spend as string || "0");
    return {
      id: c.id as string,
      name: c.name as string,
      status: c.status as string,
      objective: c.objective as string,
      dailyBudget: parseFloat(c.daily_budget as string || "0") / 100,
      spend: campaignSpend,
      impressions: parseInt(ci.impressions as string || "0"),
      clicks: parseInt(ci.clicks as string || "0"),
      leads: campaignLeads,
      cpl: campaignLeads > 0 ? campaignSpend / campaignLeads : 0,
      cpm: parseFloat(ci.cpm as string || "0"),
      ctr: parseFloat(ci.ctr as string || "0"),
      frequency: parseFloat(ci.frequency as string || "0"),
    };
  });

  // Parse daily data
  const dailyData = (dailyInsights?.data || []).map((d: Record<string, unknown>) => ({
    date: d.date_start as string,
    spend: parseFloat(d.spend as string || "0"),
    leads: getLeads(d.actions as Array<{ action_type: string; value: string }> | undefined),
    clicks: parseInt(d.clicks as string || "0"),
    impressions: parseInt(d.impressions as string || "0"),
  }));

  // Parse top creatives
  const topCreatives = (adInsights?.data || [])
    .filter((a: Record<string, unknown>) => (a.insights as Record<string, unknown>)?.data)
    .map((a: Record<string, unknown>) => {
      const ins = ((a.insights as Record<string, unknown>)?.data as Record<string, unknown>[])?.[0] || {};
      const creative = a.creative as Record<string, unknown> | undefined;
      return {
        id: a.id as string,
        name: (creative?.title as string) || (a.name as string),
        thumbnailUrl: (creative?.thumbnail_url as string) || "",
        spend: parseFloat(ins.spend as string || "0"),
        leads: getLeads(ins.actions as Array<{ action_type: string; value: string }> | undefined),
        cpl: (() => {
          const s = parseFloat(ins.spend as string || "0");
          const l = getLeads(ins.actions as Array<{ action_type: string; value: string }> | undefined);
          return l > 0 ? s / l : 0;
        })(),
        ctr: parseFloat(ins.ctr as string || "0"),
      };
    })
    .sort((a: { spend: number }, b: { spend: number }) => b.spend - a.spend)
    .slice(0, 10);

  // CPL real = gasto apenas de campanhas com "leads" no nome (excluindo "reconhecimento" e "base") / total de leads reais
  const leadCampaignSpend = campaigns
    .filter((c) => isLeadCampaign(c.name))
    .reduce((sum, c) => sum + c.spend, 0);
  const realCpl = totalLeads > 0 ? leadCampaignSpend / totalLeads : 0;

  return {
    totalSpend,
    totalImpressions,
    totalClicks,
    totalLeads,
    totalReach,
    avgCpl: realCpl,
    avgCpm,
    avgCtr,
    avgFrequency,
    leadCampaignSpend,
    campaigns,
    dailyData,
    topCreatives,
  };
}
