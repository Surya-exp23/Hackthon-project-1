import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Report from '../models/Report';
import { asyncHandler } from '../utils/asyncHandler';
import { analyzeCivicIssue } from '../services/aiService';
import { calculatePriorityScore, getLocationRiskForCategory } from '../services/priorityService';
import { findDuplicates } from '../services/duplicateService';

// Run AI analysis manually before creating a report
export const analyzeReport = asyncHandler(async (req: Request, res: Response) => {
  const { imageUrl, description } = req.body;
  if (!imageUrl) {
    return res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'Image URL is required' } });
  }

  const aiResult = await analyzeCivicIssue(imageUrl, description);
  res.status(200).json(aiResult);
});

// Check for duplicates
export const checkDuplicates = asyncHandler(async (req: Request, res: Response) => {
  const { lng, lat, category, aiSummary } = req.body;
  if (lng == null || lat == null) {
    return res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'lng and lat are required' } });
  }

  const duplicates = await findDuplicates(Number(lng), Number(lat), category, aiSummary);
  res.status(200).json({ candidates: duplicates });
});

// Create a Report
export const createReport = asyncHandler(async (req: any, res: Response) => {
  const { imageUrl, description, location, address, category, issueType, severity, confidence, aiSummary, recommendedDepartment, riskFactors, duplicateOf } = req.body;

  let reportData: any = {
    userId: req.user.id,
    imageUrl,
    description,
    location,
    address,
    category,
    issueType,
    severity,
    confidence,
    aiSummary,
    recommendedDepartment,
    riskFactors,
    status: 'open',
  };

  if (duplicateOf) {
    const parentReport = await Report.findById(duplicateOf);
    if (!parentReport) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Parent report not found to merge' } });
    }
    
    // Save as duplicate
    reportData.duplicateOf = duplicateOf;
    const report = await Report.create(reportData);

    // Update parent
    parentReport.relatedReports.push(report._id as mongoose.Types.ObjectId);
    
    // Recalculate parent priority
    const duplicateCount = parentReport.relatedReports.length;
    const locationRisk = getLocationRiskForCategory(parentReport.category);
    // Rough days unresolved calculation
    const daysUnresolved = Math.floor((Date.now() - new Date(parentReport.createdAt).getTime()) / (1000 * 60 * 60 * 24));
    
    parentReport.priorityScore = calculatePriorityScore(
      parentReport.severity,
      parentReport.confidence,
      duplicateCount,
      0, // nearbyPOIBoost (placeholder for MVP)
      locationRisk,
      daysUnresolved
    );

    await parentReport.save();

    return res.status(201).json({ report });
  } else {
    // Calculate initial priority score
    const locationRisk = getLocationRiskForCategory(category);
    reportData.priorityScore = calculatePriorityScore(
      severity,
      confidence,
      0, // 0 duplicates
      0, // nearbyPOIBoost
      locationRisk,
      0  // 0 days unresolved
    );

    const report = await Report.create(reportData);
    return res.status(201).json({ report });
  }
});

// List Reports (with filtering)
export const getReports = asyncHandler(async (req: Request, res: Response) => {
  const { status, category, severity, near, radius, userId } = req.query;
  const filter: any = { duplicateOf: { $exists: false } }; // Return canonical only

  if (status) filter.status = status;
  if (category) filter.category = category;
  if (severity) filter.severity = severity;
  if (userId) filter.userId = userId;
  
  if (near && radius) {
    const [lng, lat] = (near as string).split(',').map(Number);
    filter.location = {
      $near: {
        $geometry: { type: 'Point', coordinates: [lng, lat] },
        $maxDistance: Number(radius),
      },
    };
  }

  const reports = await Report.find(filter).sort({ priorityScore: -1 });
  res.status(200).json({ reports, total: reports.length });
});

// Get Single Report
export const getReportById = asyncHandler(async (req: Request, res: Response) => {
  const report = await Report.findById(req.params.id)
    .populate('userId', 'name')
    .populate('relatedReports');
    
  if (!report) {
    return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Report not found' } });
  }

  res.status(200).json({ report });
});
