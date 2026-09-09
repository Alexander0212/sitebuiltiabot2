export type InvestmentInputs = {
  propertyPrice: number;
  monthlyRent: number;
  monthlyExpenses: number;
};

export type InvestmentResult = {
  annualRent: number;
  annualExpenses: number;
  netAnnualIncome: number;
  estimatedYield: number;
  expensesExceedRent: boolean;
};

export const INVESTMENT_LIMITS = {
  propertyPrice: { min: 50_000, max: 650_000, step: 1_000 },
  monthlyRent: { min: 400, max: 5_000, step: 10 },
  monthlyExpenses: { min: 0, max: 1_500, step: 10 },
} as const;

export const DEFAULT_INVESTMENT_INPUTS: InvestmentInputs = {
  propertyPrice: 150_000,
  monthlyRent: 1_100,
  monthlyExpenses: 180,
};

function safeNumber(value: number) {
  return Number.isFinite(value) ? value : 0;
}

export function calculateInvestment(
  inputs: InvestmentInputs,
): InvestmentResult {
  const propertyPrice = Math.max(0, safeNumber(inputs.propertyPrice));
  const monthlyRent = Math.max(0, safeNumber(inputs.monthlyRent));
  const monthlyExpenses = Math.max(0, safeNumber(inputs.monthlyExpenses));

  const annualRent = monthlyRent * 12;
  const annualExpenses = monthlyExpenses * 12;
  const rawNet = annualRent - annualExpenses;
  const netAnnualIncome = Math.max(0, rawNet);
  const estimatedYield =
    propertyPrice > 0 ? Math.max(0, (netAnnualIncome / propertyPrice) * 100) : 0;

  return {
    annualRent,
    annualExpenses,
    netAnnualIncome,
    estimatedYield,
    expensesExceedRent: rawNet < 0,
  };
}
