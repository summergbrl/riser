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


// Store latest data in memory for demo
let latestFloodData = null;
let latestWeatherData = null;

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  // Send latest data on connect
  if (latestFloodData) socket.emit('flood', latestFloodData);
  if (latestWeatherData) socket.emit('weather', latestWeatherData);
});

// Periodically fetch and emit updates
import { fetchWeatherData, fetchFloodData } from './services/dataSources.js';
const LOCATION = 'Manila,PH';
setInterval(async () => {
  try {
    latestFloodData = await fetchFloodData();
    io.emit('flood', latestFloodData);
    latestWeatherData = await fetchWeatherData(LOCATION);
    io.emit('weather', latestWeatherData);
  } catch (err) {
    console.error('Error updating data:', err.message);
  }
}, 300000); // every 5 minutes

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`Riser backend running on port ${PORT}`);
});
