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
        
        // Show floating alert for high risk areas
        const highRiskAreas = newAlerts.filter(alert => alert.risk === 'high');
        if (highRiskAreas.length > 0) {
          const alertId = Date.now();
          setFloatingAlerts(prev => [...prev, {
            id: alertId,
            message: `High flood risk detected in ${highRiskAreas.map(a => a.area).join(', ')}`,
            type: 'error'
          }]);
        }
      }
    });
    
    socket.on('weather', setWeather);
    
    // Listen for real-time notifications
    socket.on('notification', (notification) => {
      setNotifications(prev => [notification, ...prev.slice(0, 4)]);
    });
    
    return () => socket.disconnect();
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

      <div style={{ 
        maxWidth: 1200, 
        margin: '0 auto', 
        padding: '20px'
      }}>
        {/* Emergency Banner */}
        {alerts.some(alert => alert.risk === 'high') && (
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
          gridTemplateColumns: '1fr 2fr', 
          gap: '20px'
        }}>
          {/* Left Sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
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
          </div>

          {/* Main Map Area */}
          <GlowCard glowColor="#3b82f6">
            <div style={{ 
              fontSize: '14px', 
              color: '#a0a0a0', 
              marginBottom: '12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <span>Flood Risk Map</span>
              <div style={{ display: 'flex', gap: '12px', fontSize: '10px' }}>
                <span style={{ color: '#dc2626', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <PulseIndicator color="#dc2626" size={4} isActive={true} /> High
                </span>
                <span style={{ color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <PulseIndicator color="#f59e0b" size={4} isActive={false} /> Moderate
                </span>
                <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <PulseIndicator color="#10b981" size={4} isActive={false} /> Low
                </span>
              </div>
            </div>
            
            <MapContainer 
              center={defaultPosition} 
              zoom={11} 
              style={{ 
                height: '500px', 
                width: '100%', 
                borderRadius: '6px',
                border: '1px solid #404040'
              }}
            >
              <TileLayer
                attribution='&copy; OpenStreetMap'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              {alerts.map((alert, idx) => (
                <CircleMarker
                  center={alert.position}
                  key={idx}
                  radius={alert.risk === 'high' ? 15 : 10}
                  color={
                    alert.risk === 'high' ? '#dc2626' :
                    alert.risk === 'moderate' ? '#f59e0b' : '#10b981'
                  }
                  fillColor={
                    alert.risk === 'high' ? '#dc2626' :
                    alert.risk === 'moderate' ? '#f59e0b' : '#10b981'
                  }
                  fillOpacity={alert.risk === 'high' ? 0.8 : 0.6}
                  weight={alert.risk === 'high' ? 3 : 2}
                >
                  <Popup>
                    <div style={{ 
                      padding: '8px',
                      fontSize: '12px',
                      background: '#1a1a1a',
                      color: '#e5e5e5',
                      borderRadius: '4px'
                    }}>
                      <div style={{ fontWeight: '600', marginBottom: '4px' }}>
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
                  </Popup>
                </CircleMarker>
              ))}
            </MapContainer>
          </GlowCard>

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
        @media (max-width: 768px) {
          .grid-container {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}

export default App;
