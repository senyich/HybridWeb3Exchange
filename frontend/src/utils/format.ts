import { formatUnits } from "viem";

/* eslint-disable @typescript-eslint/no-explicit-any */
export const formatValue = (
  raw: any,
  decimals: number = 18,
  maxFraction: number = 4
): string | null => {
  if (raw === undefined || raw === null) return null;
  try {
    const floatVal = parseFloat(formatUnits(raw, decimals));
    return floatVal.toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: maxFraction,
    });
  } catch {
    return "0";
  }
};