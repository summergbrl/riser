import { Router } from 'express';
import { sendAlert } from '../services/alertService.js';

const router = Router();


// POST /alert { location, message }
router.post('/', async (req, res) => {
  const { location, message } = req.body;
  await sendAlert(location, message);
  res.json({ status: 'Alert sent' });
});

// POST /alert/notify { userId, area, risk }
router.post('/notify', async (req, res) => {
  const { userId, area, risk } = req.body;
  // Custom notification logic for users in flood-risk zones
  // TODO: Integrate with push/email/SMS services
  res.json({ status: `Notification sent to user ${userId} for ${area} (${risk})` });
});

export default router;
