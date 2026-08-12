import { GoogleGenerativeAI } from '@google/generative-ai';
import { logger } from '../utils/logger';

// Confirmed working model for this API key (gemini-1.5-flash is decommissioned)
const GEMINI_MODEL = 'gemini-3.5-flash';

export const analyzeCivicIssue = async (imageUrl: string, description?: string) => {
  const apiKey = process.env.AI_API_KEY || '';
  if (!apiKey) {
    logger.error('AI_API_KEY is not set');
    return fallback();
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
      model: GEMINI_MODEL,
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.1, // low temperature = deterministic, structured output
      },
    });

    // Fetch image and encode as base64
    const imageResp = await fetch(imageUrl);
    if (!imageResp.ok) throw new Error(`Failed to fetch image: ${imageResp.status}`);
    const arrayBuffer = await imageResp.arrayBuffer();
    const base64Image = Buffer.from(arrayBuffer).toString('base64');
    const mimeType = (imageResp.headers.get('content-type') || 'image/jpeg').split(';')[0].trim();

    const prompt = `You are a professional civic-issue classification system for a smart city platform.
Analyze the image${description ? ` and description: "${description}"` : ''}.
Return ONLY valid JSON — no markdown, no prose, no code fences.

Categories (pick exactly one): road_damage, pothole, garbage_waste, streetlight, water_leakage, drainage, sidewalk, traffic_hazard, public_infrastructure, other
Severity (pick exactly one): low, medium, high, critical

Required JSON schema:
{
  "category": "<category>",
  "issueType": "<short issue type, e.g. 'pothole', 'broken_light'>",
  "severity": "<severity>",
  "confidence": <float 0.0-1.0>,
  "summary": "<1-2 sentence professional summary of the civic issue>",
  "recommendedDepartment": "<department name>",
  "riskFactors": ["<risk factor 1>", "<risk factor 2>"]
}`;

    const result = await model.generateContent([
      prompt,
      { inlineData: { data: base64Image, mimeType } },
    ]);

    const text = result.response.text();
    // Strip any accidental markdown fences the model might add
    const sanitized = text.replace(/```json\s*|```/g, '').trim();
    const parsed = JSON.parse(sanitized);

    logger.info(`AI Analysis complete: category=${parsed.category}, severity=${parsed.severity}, confidence=${parsed.confidence}`);
    return parsed;

  } catch (error: any) {
    logger.error('AI Analysis failed:', error?.message || error);
    return fallback();
  }
};

function fallback() {
  return {
    category: 'other',
    issueType: 'general_issue',
    severity: 'medium',
    confidence: 0.5,
    summary: 'AI analysis unavailable. Please review and classify manually.',
    recommendedDepartment: 'general_services',
    riskFactors: ['needs_manual_review'],
  };
}
