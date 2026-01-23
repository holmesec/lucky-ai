export const formatPercentage = (val: number) => `${Math.round(val * 100)}%`;

export const getConfidenceLabel = (p: number): string => {
  if (p > 0.9) return "Absolute Certainty";
  if (p > 0.75) return "Very Likely";
  if (p > 0.6) return "Probable";
  if (p > 0.5) return "Leaning Yes";
  if (p === 0.5) return "Uncertain";
  if (p > 0.4) return "Leaning No";
  if (p > 0.25) return "Doubtful";
  if (p > 0.1) return "Very Unlikely";
  return "Impossible";
};