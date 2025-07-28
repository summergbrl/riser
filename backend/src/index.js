import express from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import { Server } from 'socket.io';
import apiRouter from './routes/api.js';
import alertRouter from './routes/alert.js';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());
app.use('/api', apiRouter);
app.use('/alert', alertRouter);


// Store latest data in memory for real-time updates
let latestFloodData = null;
let latestWeatherData = null;
let latestHighwayData = null;
let latestTransportData = null;

// Send initial data to newly connected clients
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  // Send latest data on connect
  if (latestFloodData) socket.emit('flood', latestFloodData);
  if (latestWeatherData) socket.emit('weather', latestWeatherData);
  if (latestHighwayData) socket.emit('traffic', { highways: latestHighwayData });
  if (latestTransportData) socket.emit('transport', latestTransportData);
});

// Periodically fetch and emit updates for all data sources
import { fetchWeatherData, fetchFloodData, fetchHighwayData, fetchPublicTransportData } from './services/dataSources.js';
const LOCATION = 'Manila,PH';

// Real-time data fetching with different intervals for different data types
async function updateFloodData() {
  try {
    latestFloodData = await fetchFloodData();
    io.emit('flood', latestFloodData);
    console.log('Updated flood data:', new Date().toISOString());
  } catch (err) {
    console.error('Error updating flood data:', err.message);
  }
}

async function updateWeatherData() {
  try {
    latestWeatherData = await fetchWeatherData(LOCATION);
    io.emit('weather', latestWeatherData);
    console.log('Updated weather data:', new Date().toISOString());
  } catch (err) {
    console.error('Error updating weather data:', err.message);
  }
}

async function updateHighwayData() {
  try {
    latestHighwayData = await fetchHighwayData();
    io.emit('traffic', { highways: latestHighwayData });
    console.log('Updated highway data:', new Date().toISOString());
  } catch (err) {
    console.error('Error updating highway data:', err.message);
  }
}

async function updateTransportData() {
  try {
    latestTransportData = await fetchPublicTransportData();
    io.emit('transport', latestTransportData);
    console.log('Updated transport data:', new Date().toISOString());
  } catch (err) {
    console.error('Error updating transport data:', err.message);
  }
}

// Different update intervals for different data types
setInterval(updateFloodData, 120000);    // Every 2 minutes - critical for safety
setInterval(updateWeatherData, 300000);  // Every 5 minutes - weather changes slower
setInterval(updateHighwayData, 60000);   // Every 1 minute - traffic changes rapidly
setInterval(updateTransportData, 180000); // Every 3 minutes - public transport updates

// Initial data fetch on server start
updateFloodData();
updateWeatherData(); 
updateHighwayData();
updateTransportData();

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Riser backend running on port ${PORT}`);
});
