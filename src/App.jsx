import { MapContainer, TileLayer, Marker, Popup, CircleMarker } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import GlowCard from './components/GlowCard';
import PulseIndicator from './components/PulseIndicator';
import AnimatedButton from './components/AnimatedButton';
import FloatingAlert from './components/FloatingAlert';

const defaultPosition = [14.5995, 120.9842]; // Manila

function App() {
  const [search, setSearch] = useState('');
  const [alerts, setAlerts] = useState([]);
  const [weather, setWeather] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [isOnline, setIsOnline] = useState(true);
  const [floatingAlerts, setFloatingAlerts] = useState([]);
  const [highways, setHighways] = useState([]);
  const [expandedHighway, setExpandedHighway] = useState(null);
  const [transport, setTransport] = useState(null);
  const [lastUpdate, setLastUpdate] = useState(null);

  useEffect(() => {
    // Socket.IO connection for real-time updates
    const socket = io('http://localhost:4000');
    
    socket.on('connect', () => setIsOnline(true));
    socket.on('disconnect', () => setIsOnline(false));
    
    socket.on('flood', data => {
      if (data.areas) {
        const newAlerts = data.areas.map(area => ({
          area: area.name,
          risk: area.risk,
          riskScore: area.riskScore,
          waterLevel: area.waterLevel,
          rainfall: area.rainfall,
          weather: area.weather,
          population: area.population,
          evacuationCenters: area.evacuationCenters,
          emergencyContacts: area.emergencyContacts,
          source: area.source,
          position: [
            area.lat || (area.name === 'Marikina' ? 14.6507 : 
                        area.name === 'Pasig' ? 14.5764 :
                        area.name === 'Cainta' ? 14.5781 :
                        area.name === 'San Mateo' ? 14.6969 : defaultPosition[0]),
            area.lng || (area.name === 'Marikina' ? 121.1029 : 
                        area.name === 'Pasig' ? 121.0851 :
                        area.name === 'Cainta' ? 121.1222 :
                        area.name === 'San Mateo' ? 121.1218 : defaultPosition[1])
          ]
        }));
        
        setAlerts(newAlerts);
        setLastUpdate(new Date().toLocaleTimeString());
        
        // Show floating alert for high risk areas
        const highRiskAreas = newAlerts.filter(alert => alert.risk === 'high' || alert.risk === 'critical');
        if (highRiskAreas.length > 0) {
          const alertId = Date.now();
          setFloatingAlerts(prev => [...prev, {
            id: alertId,
            message: `${highRiskAreas[0].risk === 'critical' ? 'CRITICAL' : 'High'} flood risk detected in ${highRiskAreas.map(a => a.area).join(', ')}`,
            type: 'error'
          }]);
        }
      }
    });
    
    socket.on('weather', setWeather);
    
    // Listen for highway traffic updates
    socket.on('traffic', (data) => {
      if (data.highways) {
        setHighways(data.highways);
        setLastUpdate(new Date().toLocaleTimeString());
        
        // Show floating alert for closed highways
        const closedHighways = data.highways.filter(h => h.status === 'not-passable');
        if (closedHighways.length > 0) {
          const alertId = Date.now();
          setFloatingAlerts(prev => [...prev, {
            id: alertId,
            message: `Highway closed: ${closedHighways.map(h => h.name).join(', ')}`,
            type: 'error'
          }]);
        }
        
        // Show floating alert for heavy traffic
        const heavyTrafficHighways = data.highways.filter(h => h.traffic === 'heavy');
        if (heavyTrafficHighways.length > 0) {
          const alertId = Date.now() + 1;
          setFloatingAlerts(prev => [...prev, {
            id: alertId,
            message: `Heavy traffic on ${heavyTrafficHighways.map(h => h.name).join(', ')}`,
            type: 'warning'
          }]);
        }
      }
    });

    // Listen for public transport updates
    socket.on('transport', (data) => {
      setTransport(data);
      setLastUpdate(new Date().toLocaleTimeString());
      
      // Show alerts for transport issues
      if (data.mrt) {
        const downLines = Object.entries(data.mrt).filter(([_, line]) => line.status === 'maintenance');
        if (downLines.length > 0) {
          const alertId = Date.now() + 2;
          setFloatingAlerts(prev => [...prev, {
            id: alertId,
            message: `MRT maintenance: ${downLines.map(([name]) => name.toUpperCase()).join(', ')}`,
            type: 'warning'
          }]);
        }
      }
    });
    
    // Listen for real-time notifications
    socket.on('notification', (notification) => {
      setNotifications(prev => [notification, ...prev.slice(0, 4)]);
    });
    
    return () => socket.disconnect();
  }, []);

  // Initialize sample highway data with exits/entrances
  useEffect(() => {
    setHighways([
      { 
        name: 'NLEX', 
        fullName: 'North Luzon Expressway', 
        status: 'passable', 
        traffic: 'mild',
        exits: [
          { name: 'Balintawak', status: 'passable', traffic: 'light' },
          { name: 'Mindanao Ave', status: 'passable', traffic: 'moderate' },
          { name: 'Karuhatan', status: 'passable', traffic: 'mild' },
          { name: 'Meycauayan', status: 'passable', traffic: 'light' },
          { name: 'Marilao', status: 'passable', traffic: 'mild' },
          { name: 'Bocaue', status: 'passable', traffic: 'light' },
          { name: 'Balagtas', status: 'passable', traffic: 'light' },
          { name: 'Guiguinto', status: 'passable', traffic: 'mild' },
          { name: 'Plaridel', status: 'passable', traffic: 'light' }
        ]
      },
      { 
        name: 'SLEX', 
        fullName: 'South Luzon Expressway', 
        status: 'passable', 
        traffic: 'heavy',
        exits: [
          { name: 'Magallanes', status: 'passable', traffic: 'heavy' },
          { name: 'Nichols', status: 'passable', traffic: 'heavy' },
          { name: 'Bicutan', status: 'passable', traffic: 'moderate' },
          { name: 'Sucat', status: 'passable', traffic: 'heavy' },
          { name: 'Alabang', status: 'passable', traffic: 'heavy' },
          { name: 'Filinvest', status: 'passable', traffic: 'moderate' },
          { name: 'Southwoods', status: 'passable', traffic: 'mild' },
          { name: 'Carmona', status: 'passable', traffic: 'moderate' },
          { name: 'Santa Rosa', status: 'passable', traffic: 'mild' },
          { name: 'Cabuyao', status: 'passable', traffic: 'light' }
        ]
      },
      { 
        name: 'EDSA', 
        fullName: 'Epifanio de los Santos Avenue', 
        status: 'passable', 
        traffic: 'heavy',
        exits: [
          { name: 'North Ave', status: 'passable', traffic: 'heavy' },
          { name: 'Quezon Ave', status: 'passable', traffic: 'heavy' },
          { name: 'Timog Ave', status: 'passable', traffic: 'heavy' },
          { name: 'Kamuning', status: 'passable', traffic: 'moderate' },
          { name: 'Cubao', status: 'passable', traffic: 'heavy' },
          { name: 'Santolan', status: 'passable', traffic: 'moderate' },
          { name: 'Ortigas', status: 'passable', traffic: 'heavy' },
          { name: 'Shaw Blvd', status: 'passable', traffic: 'heavy' },
          { name: 'Guadalupe', status: 'passable', traffic: 'heavy' },
          { name: 'Ayala', status: 'passable', traffic: 'heavy' },
          { name: 'Magallanes', status: 'passable', traffic: 'moderate' },
          { name: 'Taft Ave', status: 'passable', traffic: 'heavy' }
        ]
      },
      { 
        name: 'C5', 
        fullName: 'Circumferential Road 5', 
        status: 'passable', 
        traffic: 'moderate',
        exits: [
          { name: 'Katipunan Ave', status: 'passable', traffic: 'moderate' },
          { name: 'Libis', status: 'passable', traffic: 'mild' },
          { name: 'Eastwood', status: 'passable', traffic: 'moderate' },
          { name: 'Ortigas Ext', status: 'passable', traffic: 'heavy' },
          { name: 'Lanuza Ave', status: 'passable', traffic: 'moderate' },
          { name: 'Bagong Ilog', status: 'passable', traffic: 'mild' },
          { name: 'Kalayaan Ave', status: 'passable', traffic: 'moderate' },
          { name: 'McKinley', status: 'passable', traffic: 'mild' },
          { name: 'Market Market', status: 'passable', traffic: 'moderate' }
        ]
      },
      { 
        name: 'SKYWAY', 
        fullName: 'Metro Manila Skyway', 
        status: 'passable', 
        traffic: 'light',
        exits: [
          { name: 'Balintawak', status: 'passable', traffic: 'light' },
          { name: 'Nagtahan', status: 'passable', traffic: 'mild' },
          { name: 'Buendia', status: 'passable', traffic: 'light' },
          { name: 'Magallanes', status: 'passable', traffic: 'moderate' },
          { name: 'Alabang', status: 'passable', traffic: 'mild' },
          { name: 'Susana Heights', status: 'passable', traffic: 'light' }
        ]
      },
      { 
        name: 'CAVITEX', 
        fullName: 'Manila-Cavite Expressway', 
        status: 'passable', 
        traffic: 'moderate',
        exits: [
          { name: 'Roxas Blvd', status: 'passable', traffic: 'heavy' },
          { name: 'Coastal Mall', status: 'passable', traffic: 'moderate' },
          { name: 'Kawit', status: 'passable', traffic: 'mild' },
          { name: 'Bacoor', status: 'passable', traffic: 'moderate' },
          { name: 'Imus', status: 'passable', traffic: 'mild' },
          { name: 'Dasmariñas', status: 'passable', traffic: 'light' }
        ]
      },
      { 
        name: 'STAR TOLLWAY', 
        fullName: 'Southern Tagalog Arterial Road', 
        status: 'passable', 
        traffic: 'moderate',
        exits: [
          { name: 'Santo Tomas', status: 'passable', traffic: 'moderate' },
          { name: 'Malvar', status: 'passable', traffic: 'mild' },
          { name: 'Lipa', status: 'passable', traffic: 'light' },
          { name: 'Batangas City', status: 'passable', traffic: 'mild' }
        ]
      },
      { 
        name: 'TPLEX', 
        fullName: 'Tarlac-Pangasinan-La Union Expressway', 
        status: 'passable', 
        traffic: 'light',
        exits: [
          { name: 'Tarlac City', status: 'passable', traffic: 'light' },
          { name: 'Victoria', status: 'passable', traffic: 'light' },
          { name: 'Gerona', status: 'passable', traffic: 'light' },
          { name: 'Paniqui', status: 'passable', traffic: 'light' },
          { name: 'Moncada', status: 'passable', traffic: 'light' },
          { name: 'San Manuel', status: 'passable', traffic: 'light' },
          { name: 'Urdaneta', status: 'passable', traffic: 'mild' }
        ]
      }
    ]);
  }, []);

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: '#1a1a1a',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      fontSize: '16px',
      color: '#e5e5e5'
    }}>
      {/* Minimalist Header */}
      <div style={{ 
        background: '#2a2a2a',
        borderBottom: '1px solid #404040',
        padding: '16px 20px'
      }}>
        <div style={{ 
          maxWidth: 1200, 
          margin: '0 auto', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between'
        }}>
          <h1 style={{ 
            margin: 0, 
            fontSize: '24px', 
            fontWeight: '600', 
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            🌊 Riser
          </h1>
          <div style={{ 
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '14px',
            color: '#a0a0a0'
          }}>
            <PulseIndicator 
              color={isOnline ? '#10b981' : '#ef4444'} 
              size={8} 
              isActive={isOnline} 
            />
            <span>{isOnline ? 'Live' : 'Offline'}</span>
          </div>
        </div>
      </div>

      <div className="container-padding" style={{ 
        maxWidth: 1200, 
        margin: '0 auto', 
        padding: '20px'
      }}>
        {/* System Status Bar */}
        <div style={{
          background: '#2a2a2a',
          border: '1px solid #404040',
          borderRadius: '8px',
          padding: '12px 16px',
          marginBottom: '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <PulseIndicator color={isOnline ? '#10b981' : '#ef4444'} size={6} isActive={isOnline} />
              <span style={{ color: isOnline ? '#10b981' : '#ef4444' }}>
                {isOnline ? 'Real-time Connection Active' : 'Connection Lost'}
              </span>
            </div>
            {lastUpdate && (
              <span style={{ color: '#666' }}>
                Last Update: {lastUpdate}
              </span>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#888' }}>
            <span>Data Sources:</span>
            <span style={{ background: '#3b82f6', color: '#fff', padding: '2px 6px', borderRadius: '3px' }}>
              PAGASA
            </span>
            <span style={{ background: '#10b981', color: '#fff', padding: '2px 6px', borderRadius: '3px' }}>
              NOAH
            </span>
            <span style={{ background: '#f59e0b', color: '#fff', padding: '2px 6px', borderRadius: '3px' }}>
              NOAA
            </span>
            <span style={{ background: '#8b5cf6', color: '#fff', padding: '2px 6px', borderRadius: '3px' }}>
              Traffic
            </span>
          </div>
        </div>

        {/* Emergency Banner */}
        {alerts.some(alert => alert.risk === 'critical' || alert.risk === 'high') && (
          <div style={{
            background: '#dc2626',
            color: 'white',
            padding: '12px 16px',
            borderRadius: '8px',
            marginBottom: '20px',
            fontSize: '14px',
            fontWeight: '500',
            textAlign: 'center',
            border: '1px solid #ef4444'
          }}>
            ⚠️ High Risk Alert
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid-container" style={{ 
          display: 'grid', 
          gridTemplateColumns: '350px 1fr', 
          gap: '20px',
          alignItems: 'start'
        }}>
          {/* Left Sidebar */}
          <div className="sidebar-sticky" style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '16px',
            position: 'sticky',
            top: '20px'
          }}>
            
            {/* Search Box */}
            <GlowCard glowColor="#3b82f6">
              <input
                type="text"
                placeholder="Search location..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ 
                  width: '100%',
                  padding: '12px',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  outline: 'none',
                  background: 'transparent',
                  color: '#e5e5e5'
                }}
              />
            </GlowCard>

            {/* Weather Info */}
            {weather && (
              <GlowCard glowColor="#f59e0b">
                <div style={{ fontSize: '14px', color: '#a0a0a0', marginBottom: '8px' }}>
                  Current Weather
                </div>
                <div style={{ fontSize: '18px', fontWeight: '600', marginBottom: '4px' }}>
                  {Math.round(weather.main.temp)}°C
                </div>
                <div style={{ fontSize: '12px', color: '#a0a0a0', textTransform: 'capitalize' }}>
                  {weather.weather[0].description}
                </div>
              </GlowCard>
            )}

            {/* Flood Alerts */}
            <GlowCard glowColor={alerts.some(a => a.risk === 'high') ? '#dc2626' : '#10b981'}>
              <div style={{ fontSize: '14px', color: '#a0a0a0', marginBottom: '12px' }}>
                Flood Status
              </div>
              
              {alerts.length === 0 ? (
                <div style={{ fontSize: '12px', color: '#10b981', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <PulseIndicator color="#10b981" size={6} isActive={true} />
                  All Clear
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {alerts
                    .filter(a => a.area.toLowerCase().includes(search.toLowerCase()))
                    .map((alert, idx) => (
                      <div key={idx} style={{ 
                        padding: '8px',
                        borderRadius: '4px',
                        background: alert.risk === 'high' ? '#dc262620' : 
                                   alert.risk === 'moderate' ? '#f59e0b20' : '#10b98120',
                        border: `1px solid ${
                          alert.risk === 'high' ? '#dc2626' : 
                          alert.risk === 'moderate' ? '#f59e0b' : '#10b981'
                        }`,
                        fontSize: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}>
                        <PulseIndicator 
                          color={alert.risk === 'high' ? '#dc2626' : 
                                 alert.risk === 'moderate' ? '#f59e0b' : '#10b981'} 
                          size={6} 
                          isActive={alert.risk === 'high'} 
                        />
                        <div>
                          <div style={{ fontWeight: '500', marginBottom: '2px' }}>
                            {alert.area}
                          </div>
                          <div style={{ 
                            color: alert.risk === 'high' ? '#dc2626' : 
                                   alert.risk === 'moderate' ? '#f59e0b' : '#10b981',
                            fontSize: '11px'
                          }}>
                            {alert.risk.toUpperCase()} RISK
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </GlowCard>

            {/* Highway Traffic Status */}
            <GlowCard glowColor="#3b82f6">
              <div style={{ fontSize: '14px', color: '#a0a0a0', marginBottom: '12px' }}>
                Highway Traffic
              </div>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {highways
                  .filter(h => h.name.toLowerCase().includes(search.toLowerCase()) || 
                              h.fullName.toLowerCase().includes(search.toLowerCase()))
                  .map((highway, idx) => (
                    <div key={idx}>
                      {/* Main Highway Row */}
                      <div 
                        style={{ 
                          padding: '8px',
                          borderRadius: '4px',
                          background: '#2a2a2a',
                          border: `1px solid ${
                            highway.status === 'not-passable' ? '#dc2626' :
                            highway.traffic === 'heavy' ? '#f59e0b' :
                            highway.traffic === 'moderate' ? '#f59e0b' :
                            highway.traffic === 'mild' ? '#10b981' : '#10b981'
                          }`,
                          fontSize: '11px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                        onClick={() => setExpandedHighway(expandedHighway === highway.name ? null : highway.name)}
                        onMouseEnter={(e) => {
                          e.target.style.background = '#404040';
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = '#2a2a2a';
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <PulseIndicator 
                            color={
                              highway.status === 'not-passable' ? '#dc2626' :
                              highway.traffic === 'heavy' ? '#f59e0b' :
                              highway.traffic === 'moderate' ? '#f59e0b' :
                              highway.traffic === 'mild' ? '#10b981' : '#10b981'
                            } 
                            size={4} 
                            isActive={highway.status === 'not-passable' || highway.traffic === 'heavy'} 
                          />
                          <div>
                            <div style={{ fontWeight: '600', marginBottom: '1px' }}>
                              {highway.name}
                            </div>
                            <div style={{ fontSize: '9px', color: '#a0a0a0' }}>
                              {highway.fullName}
                            </div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '2px' }}>
                            <div style={{
                              background: highway.status === 'not-passable' ? '#dc2626' : '#10b981',
                              color: 'white',
                              padding: '2px 6px',
                              borderRadius: '3px',
                              fontSize: '8px',
                              fontWeight: '600'
                            }}>
                              {highway.status === 'not-passable' ? 'CLOSED' : 'OPEN'}
                            </div>
                            <div style={{
                              color: highway.traffic === 'heavy' ? '#dc2626' :
                                     highway.traffic === 'moderate' ? '#f59e0b' :
                                     highway.traffic === 'mild' ? '#10b981' : '#10b981',
                              fontSize: '8px',
                              fontWeight: '500'
                            }}>
                              {highway.traffic === 'light' ? 'LIGHT TRAFFIC' :
                               highway.traffic === 'mild' ? 'MILD TRAFFIC' :
                               highway.traffic === 'moderate' ? 'MODERATE TRAFFIC' :
                               highway.traffic === 'heavy' ? 'HEAVY TRAFFIC' : 'NO DATA'}
                            </div>
                          </div>
                          <div style={{
                            transform: expandedHighway === highway.name ? 'rotate(180deg)' : 'rotate(0deg)',
                            transition: 'transform 0.2s ease',
                            fontSize: '12px',
                            color: '#a0a0a0'
                          }}>
                            ▼
                          </div>
                        </div>
                      </div>

                      {/* Expanded Exits/Entrances */}
                      {expandedHighway === highway.name && (
                        <div style={{
                          marginTop: '4px',
                          marginLeft: '12px',
                          padding: '8px',
                          background: '#1a1a1a',
                          borderRadius: '4px',
                          border: '1px solid #404040',
                          animation: 'slideDown 0.2s ease-out'
                        }}>
                          <div style={{ 
                            fontSize: '10px', 
                            color: '#a0a0a0', 
                            marginBottom: '6px',
                            fontWeight: '600'
                          }}>
                            Exits & Entrances ({highway.exits.length})
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                            {highway.exits.map((exit, exitIdx) => (
                              <div key={exitIdx} style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '4px 6px',
                                background: '#2a2a2a',
                                borderRadius: '3px',
                                border: `1px solid ${
                                  exit.status === 'not-passable' ? '#dc2626' :
                                  exit.traffic === 'heavy' ? '#f59e0b' :
                                  exit.traffic === 'moderate' ? '#f59e0b' :
                                  '#404040'
                                }`,
                                fontSize: '9px'
                              }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <PulseIndicator 
                                    color={
                                      exit.status === 'not-passable' ? '#dc2626' :
                                      exit.traffic === 'heavy' ? '#f59e0b' :
                                      exit.traffic === 'moderate' ? '#f59e0b' :
                                      exit.traffic === 'mild' ? '#10b981' : '#10b981'
                                    } 
                                    size={3} 
                                    isActive={exit.status === 'not-passable' || exit.traffic === 'heavy'} 
                                  />
                                  <span style={{ fontWeight: '500' }}>{exit.name}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                  <div style={{
                                    background: exit.status === 'not-passable' ? '#dc2626' : '#10b981',
                                    color: 'white',
                                    padding: '1px 4px',
                                    borderRadius: '2px',
                                    fontSize: '7px',
                                    fontWeight: '600'
                                  }}>
                                    {exit.status === 'not-passable' ? 'CLOSED' : 'OPEN'}
                                  </div>
                                  <div style={{
                                    color: exit.traffic === 'heavy' ? '#dc2626' :
                                           exit.traffic === 'moderate' ? '#f59e0b' :
                                           exit.traffic === 'mild' ? '#10b981' : '#10b981',
                                    fontSize: '7px',
                                    fontWeight: '500'
                                  }}>
                                    {exit.traffic === 'light' ? 'LIGHT' :
                                     exit.traffic === 'mild' ? 'MILD' :
                                     exit.traffic === 'moderate' ? 'MOD' :
                                     exit.traffic === 'heavy' ? 'HEAVY' : 'OK'}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </GlowCard>

            {/* Public Transport Status */}
            <GlowCard glowColor="#8b5cf6">
              <div style={{ 
                fontSize: '14px', 
                color: '#a0a0a0', 
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <span>Public Transport Status</span>
                {transport && (
                  <span style={{ fontSize: '10px', color: '#666' }}>
                    Updated: {lastUpdate}
                  </span>
                )}
              </div>

              {transport ? (
                <div style={{ fontSize: '12px' }}>
                  {/* MRT Status */}
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ color: '#e5e5e5', fontWeight: '600', marginBottom: '6px' }}>MRT Lines</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {Object.entries(transport.mrt).map(([line, status]) => (
                        <div key={line} style={{
                          background: status.status === 'operational' ? '#10b981' : 
                                      status.status === 'maintenance' ? '#f59e0b' : '#dc2626',
                          color: 'white',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '10px',
                          fontWeight: '600'
                        }}>
                          {line.toUpperCase()}: {status.status.toUpperCase()}
                          {status.delays !== 'on-time' && (
                            <div style={{ fontSize: '8px', opacity: 0.9 }}>Delay: {status.delays}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* LRT Status */}
                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ color: '#e5e5e5', fontWeight: '600', marginBottom: '6px' }}>LRT Lines</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {Object.entries(transport.lrt).map(([line, status]) => (
                        <div key={line} style={{
                          background: status.status === 'operational' ? '#10b981' : 
                                      status.status === 'maintenance' ? '#f59e0b' : '#dc2626',
                          color: 'white',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '10px',
                          fontWeight: '600'
                        }}>
                          {line.toUpperCase()}: {status.status.toUpperCase()}
                          {status.delays !== 'on-time' && (
                            <div style={{ fontSize: '8px', opacity: 0.9 }}>Delay: {status.delays}</div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Bus Status */}
                  <div>
                    <div style={{ color: '#e5e5e5', fontWeight: '600', marginBottom: '6px' }}>Bus Routes</div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {Object.entries(transport.buses).map(([route, status]) => (
                        <div key={route} style={{
                          background: status.congestion === 'light' ? '#10b981' : 
                                      status.congestion === 'moderate' ? '#f59e0b' : '#dc2626',
                          color: 'white',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '10px',
                          fontWeight: '600'
                        }}>
                          {route.toUpperCase()}: {status.congestion.toUpperCase()} TRAFFIC
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ color: '#666', fontSize: '12px', textAlign: 'center', padding: '20px' }}>
                  Loading transport data...
                </div>
              )}
            </GlowCard>
          </div>

          {/* Right Side - Main Content */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Affected Areas List */}
            <GlowCard glowColor="#3b82f6">
              <div style={{ 
                fontSize: '14px', 
                color: '#a0a0a0', 
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <span>Metro Manila Flood Status</span>
              <div style={{ display: 'flex', gap: '12px', fontSize: '10px' }}>
                <span style={{ color: '#dc2626', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <PulseIndicator color="#dc2626" size={4} isActive={true} /> Critical/High Risk
                </span>
                <span style={{ color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <PulseIndicator color="#f59e0b" size={4} isActive={false} /> Moderate Risk
                </span>
                <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <PulseIndicator color="#10b981" size={4} isActive={false} /> Low/Minimal Risk
                </span>
              </div>
            </div>

            {/* Simple Visual Map */}
            <div style={{
              background: '#1a1a1a',
              borderRadius: '8px',
              padding: '20px',
              marginBottom: '16px',
              border: '1px solid #404040',
              position: 'relative',
              minHeight: '200px'
            }}>
              <div style={{
                position: 'absolute',
                top: '10px',
                left: '10px',
                fontSize: '12px',
                color: '#a0a0a0',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                🗺️ Metro Manila Cities Overview
              </div>
              
              {/* Simple visual representation */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(5, 1fr)',
                gap: '6px',
                marginTop: '30px'
              }}>
                {[
                  // Cities (17 total)
                  { name: 'Manila', risk: alerts.find(a => a.area === 'Manila')?.risk || 'safe' },
                  { name: 'Quezon City', risk: alerts.find(a => a.area === 'Quezon City')?.risk || 'safe' },
                  { name: 'Caloocan', risk: alerts.find(a => a.area === 'Caloocan')?.risk || 'safe' },
                  { name: 'Las Piñas', risk: alerts.find(a => a.area === 'Las Piñas')?.risk || 'safe' },
                  { name: 'Makati', risk: alerts.find(a => a.area === 'Makati')?.risk || 'safe' },
                  { name: 'Malabon', risk: alerts.find(a => a.area === 'Malabon')?.risk || 'safe' },
                  { name: 'Mandaluyong', risk: alerts.find(a => a.area === 'Mandaluyong')?.risk || 'safe' },
                  { name: 'Marikina', risk: alerts.find(a => a.area === 'Marikina')?.risk || 'safe' },
                  { name: 'Muntinlupa', risk: alerts.find(a => a.area === 'Muntinlupa')?.risk || 'safe' },
                  { name: 'Navotas', risk: alerts.find(a => a.area === 'Navotas')?.risk || 'safe' },
                  { name: 'Parañaque', risk: alerts.find(a => a.area === 'Parañaque')?.risk || 'safe' },
                  { name: 'Pasay', risk: alerts.find(a => a.area === 'Pasay')?.risk || 'safe' },
                  { name: 'Pasig', risk: alerts.find(a => a.area === 'Pasig')?.risk || 'safe' },
                  { name: 'Pateros', risk: alerts.find(a => a.area === 'Pateros')?.risk || 'safe' },
                  { name: 'San Juan', risk: alerts.find(a => a.area === 'San Juan')?.risk || 'safe' },
                  { name: 'Taguig', risk: alerts.find(a => a.area === 'Taguig')?.risk || 'safe' },
                  { name: 'Valenzuela', risk: alerts.find(a => a.area === 'Valenzuela')?.risk || 'safe' }
                ].map((city, idx) => (
                  <div key={idx} style={{
                    background: city.risk === 'high' ? '#dc262640' :
                               city.risk === 'moderate' ? '#f59e0b40' :
                               city.risk === 'low' ? '#10b98140' : '#2a2a2a',
                    border: `2px solid ${
                      city.risk === 'high' ? '#dc2626' :
                      city.risk === 'moderate' ? '#f59e0b' :
                      city.risk === 'low' ? '#10b981' : '#404040'
                    }`,
                    borderRadius: '6px',
                    padding: '8px 4px',
                    textAlign: 'center',
                    fontSize: '10px',
                    fontWeight: '500',
                    position: 'relative',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'scale(1.05)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'scale(1)';
                  }}
                  >
                    {city.risk !== 'safe' && (
                      <div style={{ position: 'absolute', top: '4px', right: '4px' }}>
                        <PulseIndicator 
                          color={city.risk === 'high' ? '#dc2626' : 
                                 city.risk === 'moderate' ? '#f59e0b' : '#10b981'} 
                          size={6} 
                          isActive={city.risk === 'high'} 
                        />
                      </div>
                    )}
                    <div style={{ marginBottom: '2px' }}>{city.name}</div>
                    <div style={{
                      fontSize: '8px',
                      color: city.risk === 'high' ? '#dc2626' :
                             city.risk === 'moderate' ? '#f59e0b' :
                             city.risk === 'low' ? '#10b981' : '#10b981'
                    }}>
                      {city.risk === 'safe' ? 'SAFE' : city.risk.toUpperCase()}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Detailed List */}
            <div>
              <div style={{ fontSize: '14px', color: '#a0a0a0', marginBottom: '12px' }}>
                Detailed Status
              </div>
              
              {alerts.length === 0 ? (
                <div style={{
                  textAlign: 'center',
                  padding: '20px',
                  color: '#10b981',
                  fontSize: '14px'
                }}>
                  <PulseIndicator color="#10b981" size={8} isActive={true} />
                  <div style={{ marginTop: '8px' }}>All areas are safe</div>
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {alerts
                    .filter(a => a.area.toLowerCase().includes(search.toLowerCase()))
                    .sort((a, b) => {
                      const riskOrder = { 'high': 3, 'moderate': 2, 'low': 1 };
                      return riskOrder[b.risk] - riskOrder[a.risk];
                    })
                    .map((alert, idx) => (
                      <div key={idx} style={{
                        background: '#2a2a2a',
                        border: `1px solid ${
                          alert.risk === 'high' ? '#dc2626' :
                          alert.risk === 'moderate' ? '#f59e0b' : '#10b981'
                        }`,
                        borderRadius: '6px',
                        padding: '12px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <PulseIndicator 
                            color={alert.risk === 'critical' ? '#dc2626' :
                                   alert.risk === 'high' ? '#dc2626' : 
                                   alert.risk === 'moderate' ? '#f59e0b' : '#10b981'} 
                            size={8} 
                            isActive={alert.risk === 'critical' || alert.risk === 'high'} 
                          />
                          <div>
                            <div style={{ fontWeight: '600', fontSize: '14px', marginBottom: '2px' }}>
                              {alert.area}
                              {alert.source && (
                                <span style={{ 
                                  fontSize: '8px', 
                                  color: '#666', 
                                  marginLeft: '6px',
                                  background: '#333',
                                  padding: '1px 4px',
                                  borderRadius: '2px'
                                }}>
                                  {alert.source}
                                </span>
                              )}
                            </div>
                            <div style={{ 
                              fontSize: '11px', 
                              color: '#a0a0a0',
                              marginBottom: '4px'
                            }}>
                              {alert.risk === 'critical' ? 'IMMEDIATE EVACUATION REQUIRED' :
                               alert.risk === 'high' ? 'Immediate evacuation may be needed' :
                               alert.risk === 'moderate' ? 'Monitor conditions closely' :
                               'Stay alert and prepared'}
                            </div>
                            {/* Enhanced real-time data display */}
                            <div style={{ 
                              fontSize: '10px', 
                              color: '#888',
                              display: 'flex',
                              gap: '8px',
                              flexWrap: 'wrap'
                            }}>
                              {alert.riskScore && (
                                <span>Risk: {alert.riskScore}%</span>
                              )}
                              {alert.waterLevel && (
                                <span>Water: {alert.waterLevel}m</span>
                              )}
                              {alert.rainfall > 0 && (
                                <span>Rain: {alert.rainfall}mm/hr</span>
                              )}
                              {alert.population && (
                                <span>Pop: {(alert.population / 1000).toFixed(0)}k</span>
                              )}
                              {alert.weather && (
                                <span style={{ 
                                  color: alert.weather.includes('rain') || alert.weather === 'thunderstorm' ? '#f59e0b' : '#666'
                                }}>
                                  {alert.weather.replace('-', ' ')}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div style={{
                          background: alert.risk === 'critical' ? '#dc2626' :
                                     alert.risk === 'high' ? '#dc2626' :
                                     alert.risk === 'moderate' ? '#f59e0b' : '#10b981',
                          color: 'white',
                          padding: '4px 8px',
                          borderRadius: '4px',
                          fontSize: '10px',
                          fontWeight: '600'
                        }}>
                          {alert.risk.toUpperCase()}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </GlowCard>
          </div>

        </div>

        {/* Emergency Contacts - Bottom Section */}
        <div style={{ marginTop: '20px' }}>
          <GlowCard glowColor="#dc2626">
            <div style={{ 
              fontSize: '14px', 
              color: '#dc2626', 
              marginBottom: '12px',
              fontWeight: '600',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <PulseIndicator color="#dc2626" size={6} isActive={true} />
              Emergency Contacts
            </div>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '12px',
              fontSize: '12px',
              color: '#e5e5e5'
            }}>
              <AnimatedButton variant="danger" size="sm" onClick={() => window.open('tel:911')}>
                🚨 Emergency: 911
              </AnimatedButton>
              <AnimatedButton variant="secondary" size="sm" onClick={() => window.open('tel:143')}>
                🚑 Red Cross: 143
              </AnimatedButton>
              <AnimatedButton variant="secondary" size="sm" onClick={() => window.open('tel:+6289115061')}>
                🌊 NDRRMC: (02) 8911-5061
              </AnimatedButton>
              <AnimatedButton variant="secondary" size="sm">
                ⛑️ Local DRRM: Contact Barangay
              </AnimatedButton>
            </div>
          </GlowCard>
        </div>

      </div>

      {/* Floating Alerts */}
      {floatingAlerts.map((alert, index) => (
        <FloatingAlert
          key={alert.id}
          message={alert.message}
          type={alert.type}
          onClose={() => setFloatingAlerts(prev => prev.filter(a => a.id !== alert.id))}
          style={{ top: `${20 + index * 80}px` }}
        />
      ))}

      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @media (max-width: 1024px) {
          .grid-container {
            grid-template-columns: 300px 1fr !important;
            gap: 16px !important;
          }
        }
        
        @media (max-width: 768px) {
          .grid-container {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
          }
          
          .sidebar-sticky {
            position: static !important;
          }
        }
        
        @media (max-width: 480px) {
          .container-padding {
            padding: 12px !important;
          }
        }
      `}</style>
    </div>
  );
}

export default App;
