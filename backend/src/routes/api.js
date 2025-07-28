import { Router } from 'express';
import { fetchWeatherData, fetchFloodData, fetchHighwayData, fetchPublicTransportData } from '../services/dataSources.js';

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

// GET /api/highways - Real-time highway and traffic data
router.get('/highways', async (req, res) => {
  try {
    const data = await fetchHighwayData();
    res.json({ highways: data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/transport - Real-time public transportation data
router.get('/transport', async (req, res) => {
  try {
    const data = await fetchPublicTransportData();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/realtime - All real-time data in one endpoint
router.get('/realtime', async (req, res) => {
  try {
    const location = req.query.location || 'Manila,PH';
    
    // Fetch all data sources in parallel for faster response
    const [weather, flood, highways, transport] = await Promise.all([
      fetchWeatherData(location),
      fetchFloodData(),
      fetchHighwayData(),
      fetchPublicTransportData()
    ]);
    
    res.json({
      timestamp: new Date().toISOString(),
      weather,
      flood,
      highways,
      transport,
      status: 'active'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
