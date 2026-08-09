import { Request, Response } from 'express';
import Report from '../models/Report';
import { asyncHandler } from '../utils/asyncHandler';

export const getMapIssues = asyncHandler(async (req: Request, res: Response) => {
  const { bbox, status, category } = req.query;
  
  const filter: any = { duplicateOf: { $exists: false } }; // Return canonical only

  if (status) filter.status = status;
  if (category) filter.category = category;

  if (bbox) {
    // bbox format: minLng,minLat,maxLng,maxLat
    const [minLng, minLat, maxLng, maxLat] = (bbox as string).split(',').map(Number);
    filter.location = {
      $geoWithin: {
        $box: [
          [minLng, minLat],
          [maxLng, maxLat],
        ],
      },
    };
  }

  // Return a lightweight payload for map markers
  const issues = await Report.find(filter).select('_id location severity category status priorityScore').lean();
  
  const mappedIssues = issues.map((issue: any) => ({
    id: issue._id,
    lng: issue.location.coordinates[0],
    lat: issue.location.coordinates[1],
    severity: issue.severity,
    category: issue.category,
    status: issue.status,
    priorityScore: issue.priorityScore
  }));

  res.status(200).json({ issues: mappedIssues });
});
