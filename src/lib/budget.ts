export type BudgetGoal = "live" | "invest";

export type FamilySize = 1 | 2 | 3 | 4;

export type BudgetInputs = {
  monthlyIncome: number;
  downPayment: number;
  termYears: number;
  familySize: FamilySize;
  goal: BudgetGoal;
};

export type BudgetResult = {
  comfortableMonthlyPayment: number;
  maximumPropertyBudget: number;
  estimatedMonthlyPayment: number;
  propertyTypeRecommendation: string;
  recommendedArea: string;
  recommendedLocations: string[];
};

export const BUDGET_LIMITS = {
  income: { min: 600, max: 15000, step: 50 },
  downPayment: { min: 5000, max: 250000, step: 1000 },
  termYears: { min: 5, max: 25, step: 1 },
} as const;

export const DEFAULT_BUDGET_INPUTS: BudgetInputs = {
  monthlyIncome: 4000,
  downPayment: 45000,
  termYears: 20,
  familySize: 3,
  goal: "live",
};

const DEMO_ANNUAL_RATE = 0.08;
const INCOME_RATIO = { live: 0.25, invest: 0.18 } as const;
const MIN_DOWN_SHARE = { live: 0.22, invest: 0.3 } as const;
const MIN_BUDGET = 35_000;
const MAX_BUDGET = 650_000;

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function loanCapacity(monthlyPayment: number, years: number, annualRate: number) {
  if (monthlyPayment <= 0 || years <= 0) {
    return 0;
  }

  const rate = annualRate / 12;
  const periods = years * 12;

  if (rate === 0) {
    return monthlyPayment * periods;
  }

  return (monthlyPayment * (1 - (1 + rate) ** -periods)) / rate;
}

function monthlyPaymentForLoan(
  principal: number,
  years: number,
  annualRate: number,
) {
  if (principal <= 0 || years <= 0) {
    return 0;
  }

  const rate = annualRate / 12;
  const periods = years * 12;

  if (rate === 0) {
    return principal / periods;
  }

  return (principal * rate) / (1 - (1 + rate) ** -periods);
}

function recommendLivingFormat(familySize: FamilySize, budget: number) {
  const byFamily = {
    1: {
      propertyTypeRecommendation: "Студії та 1-кімнатні",
      recommendedArea: "28-48 м²",
      rooms: 1,
    },
    2: {
      propertyTypeRecommendation: "1-2-кімнатні квартири",
      recommendedArea: "45-70 м²",
      rooms: 2,
    },
    3: {
      propertyTypeRecommendation: "2-кімнатні квартири",
      recommendedArea: "65-85 м²",
      rooms: 2,
    },
    4: {
      propertyTypeRecommendation: "2-3-кімнатні квартири",
      recommendedArea: "80-110 м²",
      rooms: 3,
    },
  } as const;

  const byBudget =
    budget < 85_000
      ? {
          propertyTypeRecommendation: "Студії та 1-кімнатні",
          recommendedArea: "28-45 м²",
          rooms: 1,
        }
      : budget < 140_000
        ? {
            propertyTypeRecommendation: "1-2-кімнатні квартири",
            recommendedArea: "45-70 м²",
            rooms: 2,
          }
        : budget < 260_000
          ? {
              propertyTypeRecommendation: "2-кімнатні квартири",
              recommendedArea: "65-85 м²",
              rooms: 2,
            }
          : {
              propertyTypeRecommendation: "2-3-кімнатні квартири",
              recommendedArea: "80-110 м²",
              rooms: 3,
            };

  const family = byFamily[familySize];
  return family.rooms <= byBudget.rooms ? family : byBudget;
}

function recommendInvestmentFormat(budget: number) {
  if (budget < 100_000) {
    return {
      propertyTypeRecommendation: "Студії під оренду",
      recommendedArea: "22-38 м²",
    };
  }

  if (budget < 180_000) {
    return {
      propertyTypeRecommendation: "1-кімнатні під оренду",
      recommendedArea: "35-52 м²",
    };
  }

  return {
    propertyTypeRecommendation: "1-2-кімнатні з орендним попитом",
    recommendedArea: "45-70 м²",
  };
}

function recommendLocations(goal: BudgetGoal, budget: number) {
  if (goal === "invest") {
    if (budget < 120_000) {
      return ["Оболонь", "Солом'янка", "Нивки"];
    }
    if (budget < 220_000) {
      return ["Поділ", "Оболонь", "Шулявка"];
    }
    return ["Поділ", "Центр", "Печерськ"];
  }

  if (budget < 90_000) {
    return ["Оболонь", "Троєщина", "Харківський"];
  }
  if (budget < 160_000) {
    return ["Оболонь", "Солом'янка", "Деміївка"];
  }
  if (budget < 280_000) {
    return ["Центр", "Поділ", "Оболонь"];
  }
  return ["Печерськ", "Поділ", "Центр"];
}

export function calculateBudget(inputs: BudgetInputs): BudgetResult {
  const income = clamp(
    inputs.monthlyIncome,
    BUDGET_LIMITS.income.min,
    BUDGET_LIMITS.income.max,
  );
  const downPayment = clamp(
    inputs.downPayment,
    BUDGET_LIMITS.downPayment.min,
    BUDGET_LIMITS.downPayment.max,
  );
  const termYears = clamp(
    inputs.termYears,
    BUDGET_LIMITS.termYears.min,
    BUDGET_LIMITS.termYears.max,
  );

  const comfortableMonthlyPayment = Math.round(
    income * INCOME_RATIO[inputs.goal],
  );

  const fromLoan =
    loanCapacity(comfortableMonthlyPayment, termYears, DEMO_ANNUAL_RATE) +
    downPayment;
  const fromDownPayment = downPayment / MIN_DOWN_SHARE[inputs.goal];

  const rawBudget = Math.min(fromLoan, fromDownPayment);
  const maximumPropertyBudget = clamp(
    Math.round(rawBudget / 1000) * 1000,
    MIN_BUDGET,
    MAX_BUDGET,
  );

  const loanPrincipal = Math.max(0, maximumPropertyBudget - downPayment);
  const estimatedMonthlyPayment = Math.round(
    monthlyPaymentForLoan(loanPrincipal, termYears, DEMO_ANNUAL_RATE),
  );

  const format =
    inputs.goal === "invest"
      ? recommendInvestmentFormat(maximumPropertyBudget)
      : recommendLivingFormat(inputs.familySize, maximumPropertyBudget);

  return {
    comfortableMonthlyPayment,
    maximumPropertyBudget,
    estimatedMonthlyPayment,
    propertyTypeRecommendation: format.propertyTypeRecommendation,
    recommendedArea: format.recommendedArea,
    recommendedLocations: recommendLocations(inputs.goal, maximumPropertyBudget),
  };
}
