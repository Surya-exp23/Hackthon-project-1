import dns from 'dns';
dns.setServers(['8.8.8.8', '1.1.1.1']);
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import User from '../api/models/User';
import Report from '../api/models/Report';
import ReportUpdate from '../api/models/ReportUpdate';
import Notification from '../api/models/Notification';
import { calculatePriorityScore, getLocationRiskForCategory } from '../api/services/priorityService';

dotenv.config();

const SEED_DB = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI as string);
    console.log('Connected!');

    console.log('Clearing old data...');
    await User.deleteMany({});
    await Report.deleteMany({});
    await ReportUpdate.deleteMany({});
    await Notification.deleteMany({});

    console.log('Creating users...');
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('password123', salt);

    const citizen = await User.create({ name: 'Ananya Citizen', email: 'citizen@example.com', passwordHash, role: 'citizen' });
    const admin = await User.create({ name: 'Rajesh Admin', email: 'admin@example.com', passwordHash, role: 'admin' });
    const worker = await User.create({ name: 'Vikram Worker', email: 'worker@example.com', passwordHash, role: 'department' });

    console.log('Creating reports...');
    
    const categories = ['pothole', 'garbage_waste', 'streetlight', 'water_leakage', 'open_drainage'];
    const severities = ['low', 'medium', 'high', 'critical'];
    const statuses = ['open', 'assigned', 'in_progress', 'resolved'];
    
    // Base coords (e.g. some central city location, let's say Jodhpur approx 26.2389, 73.0243)
    const baseLng = 73.0243;
    const baseLat = 26.2389;

    const reports = [];

    for (let i = 0; i < 40; i++) {
      const category = categories[Math.floor(Math.random() * categories.length)];
      const severity = severities[Math.floor(Math.random() * severities.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)];
      const lng = baseLng + (Math.random() - 0.5) * 0.05; // ~2.5km spread
      const lat = baseLat + (Math.random() - 0.5) * 0.05;
      
      const locationRisk = getLocationRiskForCategory(category);
      const daysUnresolved = Math.floor(Math.random() * 10);
      
      const priorityScore = calculatePriorityScore(
        severity, 
        0.8, // mock confidence
        0, 
        Math.floor(Math.random() * 10), // random POI boost
        locationRisk,
        status === 'resolved' ? 0 : daysUnresolved
      );

      const report = new Report({
        userId: citizen._id,
        imageUrl: `https://picsum.photos/seed/${i}/400/300`, // placeholder image
        description: `This is a sample report for a ${category}`,
        location: {
          type: 'Point',
          coordinates: [lng, lat]
        },
        category,
        severity,
        confidence: 0.85 + (Math.random() * 0.1),
        aiSummary: `AI detected a ${severity} severity ${category}. Needs attention.`,
        recommendedDepartment: 'Public Works',
        status,
        priorityScore,
        createdAt: new Date(Date.now() - daysUnresolved * 24 * 60 * 60 * 1000)
      });
      
      if (status === 'resolved') {
        report.resolvedAt = new Date();
      }

      await report.save();
      reports.push(report);
      
      // Also seed some updates
      if (status !== 'open') {
        await ReportUpdate.create({
          reportId: report._id,
          userId: admin._id,
          type: 'status_change',
          previousStatus: 'open',
          newStatus: status,
          note: 'Processing this issue.',
          createdAt: report.createdAt
        });
      }
    }

    console.log(`Created ${reports.length} reports!`);
    
    console.log('Seed completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seed Error:', error);
    process.exit(1);
  }
};

SEED_DB();
