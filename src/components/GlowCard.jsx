import { useState } from 'react';

const GlowCard = ({ children, glowColor = '#10b981', className = '', style = {} }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={className}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        background: '#2a2a2a',
        border: '1px solid #404040',
        borderRadius: '8px',
        padding: '16px',
        position: 'relative',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
        boxShadow: isHovered 
          ? `0 8px 25px rgba(${hexToRgb(glowColor)}, 0.3), 0 0 0 1px ${glowColor}20`
          : '0 2px 8px rgba(0, 0, 0, 0.3)',
        ...style
      }}
    >
      {/* Glow effect overlay */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          borderRadius: '8px',
          background: `linear-gradient(135deg, ${glowColor}10, transparent)`,
          opacity: isHovered ? 1 : 0,
          transition: 'opacity 0.3s ease',
          pointerEvents: 'none'
        }}
      />
      
      {/* Content */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {children}
      </div>
    </div>
  );
};

// Helper function to convert hex to rgb
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result 
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : '16, 185, 129'; // fallback to green
}

export default GlowCard;