import type { NextApiRequest, NextApiResponse } from 'next';
import app from '../../../api/index'; // The express app

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  return app(req as any, res as any);
}

export const config = {
  api: {
    bodyParser: false,
    externalResolver: true,
  },
};
