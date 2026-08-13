import mongoose, { Schema, Document } from 'mongoose';

export interface IReport extends Document {
  userId: mongoose.Types.ObjectId;
  imageUrl: string;
  description?: string;
  location: {
    type: string;
    coordinates: number[]; // [longitude, latitude]
  };
  address?: string;
  
  // AI Derived fields
  category?: string;
  issueType?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  confidence?: number;
  aiSummary?: string;
  recommendedDepartment?: string;
  riskFactors?: string[];
  
  // Status & Triage
  status: 'open' | 'assigned' | 'in_progress' | 'resolved';
  priorityScore: number;
  
  // Relations
  assignedDepartment?: string;
  duplicateOf?: mongoose.Types.ObjectId;
  relatedReports: mongoose.Types.ObjectId[];
  
  // Resolution
  resolutionImageUrl?: string;
  resolvedAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

const ReportSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    imageUrl: { type: String, required: true },
    description: { type: String },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        required: true,
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },
    address: { type: String },
    
    category: { type: String },
    issueType: { type: String },
    severity: { type: String, enum: ['low', 'medium', 'high', 'critical'] },
    confidence: { type: Number },
    aiSummary: { type: String },
    recommendedDepartment: { type: String },
    riskFactors: { type: [String], default: [] },
    
    status: {
      type: String,
      enum: ['open', 'assigned', 'in_progress', 'resolved'],
      default: 'open',
    },
    priorityScore: { type: Number, default: 0 },
    
    assignedDepartment: { type: String },
    duplicateOf: { type: Schema.Types.ObjectId, ref: 'Report' },
    relatedReports: [{ type: Schema.Types.ObjectId, ref: 'Report' }],
    
    resolutionImageUrl: { type: String },
    resolvedAt: { type: Date },
  },
  { timestamps: true }
);

// Index for geospatial queries
ReportSchema.index({ location: '2dsphere' });
// Index for priority queue
ReportSchema.index({ status: 1, priorityScore: -1 });

export default mongoose.models.Report || mongoose.model<IReport>('Report', ReportSchema);
