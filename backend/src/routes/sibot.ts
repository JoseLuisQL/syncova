/**
 * SaBot AI Route 
 * POST /api/sibot/chat
 */

import { Router } from 'express';
import { authenticate } from '@/middleware/auth';
import { SibotController } from '@/controllers/SibotController';

const router = Router();

// All sibot routes require authentication
router.use(authenticate);

router.get('/bootstrap', (req, res) => {
  res.json({
    success: true,
    data: {
      enabled: true,
      provider: 'google',
      model: 'gemini-2.5-flash',
      features: {
        chat: true,
        streaming: true,
      },
    },
    timestamp: new Date().toISOString(),
  });
});

// Chat endpoint - streaming response
router.post('/chat', SibotController.chat);

export default router;
