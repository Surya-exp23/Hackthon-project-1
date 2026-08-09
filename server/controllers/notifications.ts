import { Request, Response } from 'express';
import Notification from '../models/Notification';
import { asyncHandler } from '../utils/asyncHandler';

export const getNotifications = asyncHandler(async (req: any, res: Response) => {
  const notifications = await Notification.find({ userId: req.user.id })
    .sort({ createdAt: -1 })
    .limit(50);
    
  res.status(200).json({ notifications });
});

export const markAsRead = asyncHandler(async (req: any, res: Response) => {
  const { id } = req.params;
  
  const notification = await Notification.findOneAndUpdate(
    { _id: id, userId: req.user.id },
    { read: true },
    { new: true }
  );

  if (!notification) {
    return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Notification not found' } });
  }

  res.status(200).json({ success: true, notification });
});
