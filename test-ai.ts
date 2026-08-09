import dotenv from 'dotenv';
dotenv.config();

import { analyzeCivicIssue } from './server/services/aiService';

async function test() {
  const result = await analyzeCivicIssue('https://res.cloudinary.com/demo/image/upload/sample.jpg', 'Testing');
  console.log('Result:', result);
}

test();
