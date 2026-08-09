import { Request, Response } from 'express';
import Report from '../models/Report';
import { asyncHandler } from '../utils/asyncHandler';

export const getAnalytics = asyncHandler(async (req: Request, res: Response) => {
  // 1. Totals
  const totalsAgg = await Report.aggregate([
    { $match: { duplicateOf: { $exists: false } } }, // canonical only
    {
      $group: {
        _id: null,
        total: { $sum: 1 },
        critical: { $sum: { $cond: [{ $eq: ['$severity', 'critical'] }, 1, 0] } },
        pending: { $sum: { $cond: [{ $ne: ['$status', 'resolved'] }, 1, 0] } },
        resolved: { $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] } },
        // Calculate average resolution time
        avgResolutionTime: {
          $avg: {
            $cond: [
              { $and: [{ $eq: ['$status', 'resolved'] }, { $ne: ['$resolvedAt', null] }] },
              { $subtract: ['$resolvedAt', '$createdAt'] },
              null
            ]
          }
        }
      }
    }
  ]);

  const totals = totalsAgg[0] || { total: 0, critical: 0, pending: 0, resolved: 0, avgResolutionTime: 0 };
  
  // Convert avgResolutionTime from ms to hours
  const avgResolutionHours = totals.avgResolutionTime ? (totals.avgResolutionTime / (1000 * 60 * 60)).toFixed(1) : 0;
  const resolutionRate = totals.total > 0 ? (totals.resolved / totals.total).toFixed(2) : 0;

  // 2. By Category
  const byCategory = await Report.aggregate([
    { $match: { duplicateOf: { $exists: false } } },
    { $group: { _id: '$category', count: { $sum: 1 } } },
    { $project: { category: '$_id', count: 1, _id: 0 } },
    { $sort: { count: -1 } }
  ]);

  // 3. By Status
  const byStatus = await Report.aggregate([
    { $match: { duplicateOf: { $exists: false } } },
    { $group: { _id: '$status', count: { $sum: 1 } } },
    { $project: { status: '$_id', count: 1, _id: 0 } }
  ]);

  // 4. Trend (Last 7 days simplified)
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  
  const trend = await Report.aggregate([
    { $match: { duplicateOf: { $exists: false }, createdAt: { $gte: sevenDaysAgo } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } },
    { $project: { date: '$_id', count: 1, _id: 0 } }
  ]);

  res.status(200).json({
    totals: {
      total: totals.total,
      critical: totals.critical,
      pending: totals.pending,
      resolved: totals.resolved,
    },
    byCategory,
    byStatus,
    trend,
    avgResolutionHours: Number(avgResolutionHours),
    resolutionRate: Number(resolutionRate)
  });
});
