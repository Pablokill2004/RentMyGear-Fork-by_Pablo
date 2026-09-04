import { CategoryId } from "@/lib/validation";

export const INSURANCE_RATE_HIGH_RISK = 0.2;
export const INSURANCE_RATE_STANDARD = 0.1;
export const HIGH_RISK_CATEGORY = "fotografia-video" as CategoryId;

/**
 * Returns the insurance rate for a given category.
 * Photography/video equipment is classified as high risk (20%),
 * all other categories are standard (10%).
 */
export function getInsuranceRate(category: CategoryId): number {
  return category === HIGH_RISK_CATEGORY
    ? INSURANCE_RATE_HIGH_RISK
    : INSURANCE_RATE_STANDARD;
}

/**
 * Calculates the insurance fee based on daily rate, rental days, and category.
 */
export function calculateInsuranceFee(
  dailyRate: number,
  days: number,
  category: CategoryId
): number {
  return dailyRate * days * getInsuranceRate(category);
}

export interface PriceBreakdown {
  days: number;
  dailyRate: number;
  subtotal: number;
  insuranceRate: number;
  insuranceFee: number;
  total: number;
}

/**
 * Calculates the full price breakdown including optional insurance.
 */
export function calculatePriceWithInsurance(
  dailyRate: number,
  days: number,
  category: CategoryId,
  insuranceSelected: boolean
): PriceBreakdown {
  const subtotal = dailyRate * days;
  const rate = insuranceSelected ? getInsuranceRate(category) : 0;
  const fee = insuranceSelected ? calculateInsuranceFee(dailyRate, days, category) : 0;

  return {
    days,
    dailyRate,
    subtotal,
    insuranceRate: rate,
    insuranceFee: fee,
    total: subtotal + fee,
  };
}
