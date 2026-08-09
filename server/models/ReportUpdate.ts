import mongoose, { Schema, Document } from 'mongoose';

export interface IReportUpdate extends Document {
  reportId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  type: 'status_change' | 'assignment' | 'note' | 'citizen_feedback';
  previousStatus?: string;
  newStatus?: string;
  note?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReportUpdateSchema = new Schema(
  {
    reportId: { type: Schema.Types.ObjectId, ref: 'Report', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: ['status_change', 'assignment', 'note', 'citizen_feedback'],
      required: true,
    },
    previousStatus: { type: String },
    newStatus: { type: String },
    note: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.ReportUpdate || mongoose.model<IReportUpdate>('ReportUpdate', ReportUpdateSchema);
