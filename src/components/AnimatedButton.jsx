import { useState } from 'react';

const AnimatedButton = ({ children, onClick, variant = 'primary', size = 'md' }) => {
  const [isPressed, setIsPressed] = useState(false);

  const variants = {
    primary: {
      background: 'linear-gradient(135deg, #10b981, #059669)',
      color: '#ffffff',
      border: '1px solid #10b981'
    },
    secondary: {
      background: '#2a2a2a',
      color: '#e5e5e5',
      border: '1px solid #404040'
    },
    danger: {
      background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
      color: '#ffffff',
      border: '1px solid #dc2626'
    }
  };

  const sizes = {
    sm: { padding: '8px 12px', fontSize: '12px' },
    md: { padding: '12px 16px', fontSize: '14px' },
    lg: { padding: '16px 24px', fontSize: '16px' }
  };

  return (
    <button
      onClick={onClick}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      onMouseLeave={(e) => {
        setIsPressed(false);
        if (!isPressed) {
          e.target.style.transform = 'scale(1)';
          e.target.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.3)';
        }
      }}
      onMouseEnter={(e) => {
        e.target.style.transform = 'scale(1.02)';
        e.target.style.boxShadow = '0 6px 12px rgba(0, 0, 0, 0.4)';
      }}
      style={{
        ...variants[variant],
        ...sizes[size],
        borderRadius: '8px',
        cursor: 'pointer',
        fontWeight: '500',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: isPressed ? 'scale(0.95)' : 'scale(1)',
        boxShadow: isPressed 
          ? '0 2px 4px rgba(0, 0, 0, 0.2)' 
          : '0 4px 8px rgba(0, 0, 0, 0.3)',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <span style={{ position: 'relative', zIndex: 1 }}>
        {children}
      </span>
    </button>
  );
};

export default AnimatedButton;