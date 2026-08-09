import { GoogleGenerativeAI } from '@google/generative-ai';
import { logger } from '../utils/logger';

export const analyzeCivicIssue = async (imageUrl: string, description?: string) => {
  try {
    const apiKey = process.env.AI_API_KEY || '';
    if (!apiKey) throw new Error('AI_API_KEY is not defined');
    
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      generationConfig: {
        responseMimeType: 'application/json',
      },
    });

    // Fetch the image to pass it as base64 to the model
    const imageResp = await fetch(imageUrl);
    const arrayBuffer = await imageResp.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Image = buffer.toString('base64');
    const mimeType = imageResp.headers.get('content-type') || 'image/jpeg';

    const prompt = `
You are a civic-issue classification system. Analyze the image (and description if provided: "${description || 'No description'}").
Respond ONLY with strict JSON matching the given schema — no prose, no markdown fences.
Categories: road_damage, pothole, garbage_waste, streetlight, water_leakage, drainage, sidewalk, traffic_hazard, public_infrastructure, other.
Severity: low, medium, high, critical.

Schema:
{
  "category": "string",
  "issueType": "string",
  "severity": "string",
  "confidence": 0.0 to 1.0,
  "summary": "1-2 sentence professional summary",
  "recommendedDepartment": "string",
  "riskFactors": ["string"]
}
`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Image,
          mimeType,
        },
      },
    ]);

    const text = result.response.text();
    // Sometimes the model might wrap in ```json ... ``` despite instructions. Let's sanitize.
    const sanitizedText = text.replace(/```json\n?|```/g, '').trim();
    
    return JSON.parse(sanitizedText);
  } catch (error) {
    logger.error('AI Analysis failed:', error);
    // Graceful fallback if the API key is invalid or model fails
    return {
      category: 'other',
      issueType: 'general_issue',
      severity: 'medium',
      confidence: 0.5,
      summary: 'AI analysis unavailable. Please review and classify manually.',
      recommendedDepartment: 'general_services',
      riskFactors: ['needs_manual_review']
    };
  }
};
