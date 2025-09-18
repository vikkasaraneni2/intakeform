import { prisma } from "@/lib/prisma";

export type EstimateInput = {
  panels100A: number;
  panels200A: number;
  transformers45_75: number;
  switchgear2000A: number;
  reportOverheadPct?: number; // default from coeffs
  mobilizationHours?: number; // default from coeffs
  blendedRatePerHour?: number; // default from estimate row
};

export type EstimateResult = {
  fieldHours: number;
  totalHours: number;
  price: number;
  crewSuggestion: string;
};

export async function getCoefficients() {
  let c = await prisma.pricingCoefficients.findFirst();
  if (!c) {
    c = await prisma.pricingCoefficients.create({ data: { id: 1 } });
  }
  return c;
}

export async function estimateFromCounts(input: EstimateInput): Promise<EstimateResult> {
  const coeff = await getCoefficients();
  const panel100H = coeff.panel100AHours;
  const panel200H = coeff.panel200AHours;
  const xfmrH = coeff.transformer45_75H;
  const swgrH = coeff.switchgear2000AH;

  const fieldHours =
    input.panels100A * panel100H +
    input.panels200A * panel200H +
    input.transformers45_75 * xfmrH +
    input.switchgear2000A * swgrH;

  const reportPct = input.reportOverheadPct ?? coeff.reportOverheadPct;
  const mobilize = input.mobilizationHours ?? coeff.mobilizationHours;
  const totalHours = round2(fieldHours * (1 + reportPct) + mobilize);

  const rate = input.blendedRatePerHour ?? 190.6;
  const price = round2(totalHours * rate);

  const wd = coeff.workdayHours || 8;
  const d1 = round1(totalHours / wd);
  const d2 = round1(totalHours / (2 * wd));
  const d3 = round1(totalHours / (3 * wd));
  const crewSuggestion = `1 tech: ~${d1} days; 2 techs: ~${d2} days; 3 techs: ~${d3} days`;

  return { fieldHours: round2(fieldHours), totalHours, price, crewSuggestion };
}

function round2(n: number) { return Math.round(n * 100) / 100; }
function round1(n: number) { return Math.round(n * 10) / 10; }


