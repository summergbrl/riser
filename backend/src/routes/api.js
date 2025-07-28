import { Router } from 'express';
import { fetchWeatherData, fetchFloodData } from '../services/dataSources.js';

const router = Router();


// GET /api/weather?location=Manila,PH
router.get('/weather', async (req, res) => {
  try {
    const location = req.query.location || 'Manila,PH';
    const data = await fetchWeatherData(location);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/flood
router.get('/flood', async (req, res) => {
  try {
    const data = await fetchFloodData();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
