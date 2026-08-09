export const calculatePriorityScore = (
  severity: string | undefined,
  confidence: number | undefined,
  duplicateCount: number,
  nearbyPOIBoost: number, // 0 to 15 based on schools/hospitals/roads
  locationRiskBase: number, // 0 to 15 based on category
  daysUnresolved: number
): number => {
  // Severity Weight (0-40)
  let severityBase = 0;
  switch (severity) {
    case 'critical': severityBase = 40; break;
    case 'high': severityBase = 30; break;
    case 'medium': severityBase = 18; break;
    case 'low': severityBase = 8; break;
  }
  const effectiveConfidence = Math.max(confidence ?? 0.5, 0.5);
  const severityWeight = severityBase * effectiveConfidence;

  // Community Impact Weight (0-25)
  const communityImpactWeight = Math.min(25, duplicateCount * 4 + nearbyPOIBoost);

  // Location Risk Weight (0-15)
  const locationRiskWeight = Math.min(15, locationRiskBase);

  // Duplicate Weight (0-15)
  const duplicateWeight = Math.min(15, duplicateCount * 3);

  // Age Weight (0-5)
  const ageWeight = Math.min(5, daysUnresolved);

  const totalScore = severityWeight + communityImpactWeight + locationRiskWeight + duplicateWeight + ageWeight;
  
  return Math.min(Math.max(Math.round(totalScore), 0), 100);
};

export const getLocationRiskForCategory = (category?: string): number => {
  switch (category) {
    case 'road_damage':
    case 'pothole':
    case 'traffic_hazard':
      return 15;
    case 'open_drainage':
      return 12;
    case 'water_leakage':
      return 10;
    case 'streetlight':
      return 8;
    case 'garbage_waste':
    case 'sidewalk':
      return 6;
    default:
      return 4;
  }
};
