# Riser Web

Flood Monitoring and Alert System for the Philippines

## Features
- Real-time weather and flood data (PAGASA, NOAH, OpenWeatherMap, NOAA)
- GIS map view of flood-prone areas
- Live alerts and notifications
- Search by location
- Modern React UI (Vite)

## Getting Started

### Frontend
```
npm run dev
```

### Backend
```
cd backend
npm install
npm run dev
```

### Database
- See `backend/schema.sql` for PostgreSQL setup

## Expandability
- Add ML models for flood prediction in `backend/src/services`
- Add more data sources/APIs in `backend/src/services/dataSources.js`
