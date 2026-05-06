export function calculateFRS(profile) {
  if (!profile) return 0;

  // 1. Financial Maturity (0-10)
  let financialMaturity = 0;
  if (profile.stage === 'Scale') financialMaturity = 10;
  else if (profile.stage === 'Growth') financialMaturity = 7;
  else if (profile.stage === 'MVP') financialMaturity = 5;
  else if (profile.stage === 'Idea') financialMaturity = 2;

  // 2. Compliance Score (0-10) - hardcoded for demo
  const complianceScore = 6;

  // 3. Market Validation Score (0-10)
  const teamSize = Number(profile.teamSize) || 0;
  const marketValidationScore = teamSize > 3 ? 7 : 4;

  // 4. Documentation Score (0-10)
  const documentationScore = profile.onboardingComplete ? 8 : 3;

  // Formula
  const rawScore = 
    (0.3 * financialMaturity) + 
    (0.25 * complianceScore) + 
    (0.25 * marketValidationScore) + 
    (0.2 * documentationScore);

  // Convert to 0-100 and round
  return Math.round(rawScore * 10);
}
