import { useState } from 'react';
import GlowCard from './GlowCard';
import AnimatedButton from './AnimatedButton';
import PulseIndicator from './PulseIndicator';
import LoadingSkeleton from './LoadingSkeleton';

const ReactBitsDemo = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showDemo, setShowDemo] = useState(false);

  const handleDemo = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setShowDemo(!showDemo);
    }, 2000);
  };

  return (
    <div style={{ 
      position: 'fixed', 
      bottom: '20px', 
      left: '20px', 
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
    }}>
      {/* Demo Toggle Button */}
      <AnimatedButton 
        variant="primary" 
        size="sm" 
        onClick={handleDemo}
        disabled={isLoading}
      >
        {isLoading ? 'Loading...' : 'ReactBits Demo'}
      </AnimatedButton>

      {/* Demo Panel */}
      {showDemo && (
        <GlowCard 
          glowColor="#10b981" 
          style={{ 
            width: '300px',
            transform: 'translateY(0)',
            animation: 'slideUp 0.3s ease-out'
          }}
        >
          <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '12px', color: '#10b981' }}>
            ReactBits Features Demo
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {/* Pulse Indicators */}
            <div>
              <div style={{ fontSize: '12px', color: '#a0a0a0', marginBottom: '6px' }}>
                Pulse Indicators:
              </div>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <PulseIndicator color="#10b981" size={8} isActive={true} />
                <PulseIndicator color="#f59e0b" size={10} isActive={true} />
                <PulseIndicator color="#dc2626" size={12} isActive={true} />
              </div>
            </div>

            {/* Loading Skeletons */}
            <div>
              <div style={{ fontSize: '12px', color: '#a0a0a0', marginBottom: '6px' }}>
                Loading Skeletons:
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <LoadingSkeleton width="100%" height="12px" />
                <LoadingSkeleton width="80%" height="12px" />
                <LoadingSkeleton width="60%" height="12px" />
              </div>
            </div>

            {/* Animated Buttons */}
            <div>
              <div style={{ fontSize: '12px', color: '#a0a0a0', marginBottom: '6px' }}>
                Animated Buttons:
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                <AnimatedButton variant="primary" size="sm">Primary</AnimatedButton>
                <AnimatedButton variant="secondary" size="sm">Secondary</AnimatedButton>
                <AnimatedButton variant="danger" size="sm">Danger</AnimatedButton>
              </div>
            </div>

            {/* Glow Cards */}
            <div>
              <div style={{ fontSize: '12px', color: '#a0a0a0', marginBottom: '6px' }}>
                Nested Glow Card:
              </div>
              <GlowCard glowColor="#3b82f6" style={{ padding: '8px' }}>
                <div style={{ fontSize: '11px', color: '#e5e5e5' }}>
                  Hover me for glow effect! ✨
                </div>
              </GlowCard>
            </div>
          </div>

          <style jsx>{`
            @keyframes slideUp {
              from {
                transform: translateY(20px);
                opacity: 0;
              }
              to {
                transform: translateY(0);
                opacity: 1;
              }
            }
          `}</style>
        </GlowCard>
      )}
    </div>
  );
};

export default ReactBitsDemo;