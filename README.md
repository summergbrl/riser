Riser: Flood Monitoring and Alert System

Riser is a real-time flood monitoring and alert system for the Philippines. It provides live weather, flood, traffic, and transport data, with a modern React UI and GIS map view. The system is designed for reliability, accessibility, and future expandability (including ML integration).

Features
- Real-time weather and flood data (PAGASA, NOAH, OpenWeatherMap, NOAA)
- GIS map view of flood-prone and affected areas
- Live alerts and notifications (email/SMS)
- Search by location
- Modern, senior-friendly React UI (Vite)
- Responsive and accessible design
- Expandable for future ML models and new data sources

Live site: https://summergbrl.github.io/riser

Project Structure
- `src/` — React frontend
- `backend/` — Node.js/Express backend
- `public/` — Static assets
- `mobile/` — (Optional) React Native/Flutter mobile app

## Expandability
- Add ML models for flood prediction in `backend/src/services`
- Add more data sources/APIs in `backend/src/services/dataSources.js`
