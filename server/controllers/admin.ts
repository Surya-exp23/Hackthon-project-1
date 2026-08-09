import { Request, Response } from 'express';
import Report from '../models/Report';
import ReportUpdate from '../models/ReportUpdate';
import Notification from '../models/Notification';
import { asyncHandler } from '../utils/asyncHandler';
import mongoose from 'mongoose';

// Change Report Status
export const updateReportStatus = asyncHandler(async (req: any, res: Response) => {
  const { status, note } = req.body;
  const { id } = req.params;

  const report = await Report.findById(id);
  if (!report) {
    return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Report not found' } });
  }

  const previousStatus = report.status;
  report.status = status;

  if (status === 'resolved') {
    report.resolvedAt = new Date();
  }

  await report.save();

  // Create ReportUpdate log
  await ReportUpdate.create({
    reportId: report._id,
    userId: req.user.id,
    type: 'status_change',
    previousStatus,
    newStatus: status,
    note,
  });

  // Create Notification for the citizen who created the report
  await Notification.create({
    userId: report.userId,
    reportId: report._id,
    title: 'Report Status Updated',
    message: `Your report has been updated to: ${status.replace('_', ' ')}. ${note ? 'Note: ' + note : ''}`,
    type: 'status_update',
  });

  res.status(200).json({ report });
});

// Assign Department to Report
export const assignReportDepartment = asyncHandler(async (req: any, res: Response) => {
  const { department } = req.body;
  const { id } = req.params;

  const report = await Report.findById(id);
  if (!report) {
    return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Report not found' } });
  }

  report.assignedDepartment = department;
  
  if (report.status === 'open') {
    report.status = 'assigned';
  }
  
  await report.save();

  // Create ReportUpdate log
  await ReportUpdate.create({
    reportId: report._id,
    userId: req.user.id,
    type: 'assignment',
    note: `Assigned to ${department}`,
  });

  res.status(200).json({ report });
});
