import Report from '../models/Report';

// A simple text similarity heuristic for hackathon purposes
const calculateTextSimilarity = (text1: string, text2: string): number => {
  if (!text1 || !text2) return 0;
  
  const words1 = text1.toLowerCase().split(/\W+/);
  const words2 = text2.toLowerCase().split(/\W+/);
  
  const set1 = new Set(words1);
  const set2 = new Set(words2);
  
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  
  return intersection.size / union.size;
};

export const findDuplicates = async (
  lng: number,
  lat: number,
  category: string | undefined,
  aiSummary: string | undefined,
  radiusInMeters: number = 150
) => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const candidates = await Report.find({
    location: {
      $near: {
        $geometry: { type: 'Point', coordinates: [lng, lat] },
        $maxDistance: radiusInMeters,
      },
    },
    createdAt: { $gte: thirtyDaysAgo },
    status: { $ne: 'resolved' }, // mostly care about open/in_progress
  }).lean();

  const results = candidates.map((report: any) => {
    let similarity = 0;
    
    // Geometric score is roughly proportional to distance (max distance is radius)
    // We don't have exact distance here without $geoNear aggregate, but we'll approximate 
    // or just assume if it's in radius, geoScore = 0.8. Let's just use a flat weight.
    const geoScore = 1.0; 
    
    const categoryMatch = report.category === category ? 1.0 : 0.0;
    const textScore = calculateTextSimilarity(aiSummary || '', report.aiSummary || '');

    similarity = 0.4 * geoScore + 0.3 * categoryMatch + 0.3 * textScore;

    return {
      reportId: report._id,
      similarity,
      categoryMatch: categoryMatch === 1.0,
      reportCount: 1 + (report.relatedReports?.length || 0),
    };
  });

  return results.filter(r => r.similarity >= 0.75).sort((a, b) => b.similarity - a.similarity);
};
