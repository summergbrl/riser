import { useState, useEffect } from 'react';

const FloatingAlert = ({ message, type = 'info', duration = 5000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setIsAnimating(true);
    
    const timer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  const handleClose = () => {
    setIsAnimating(false);
    setTimeout(() => {
      setIsVisible(false);
      onClose?.();
    }, 300);
  };

  const typeStyles = {
    info: {
      background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
      border: '1px solid #3b82f6'
    },
    success: {
      background: 'linear-gradient(135deg, #10b981, #059669)',
      border: '1px solid #10b981'
    },
    warning: {
      background: 'linear-gradient(135deg, #f59e0b, #d97706)',
      border: '1px solid #f59e0b'
    },
    error: {
      background: 'linear-gradient(135deg, #dc2626, #b91c1c)',
      border: '1px solid #dc2626'
    }
  };

  if (!isVisible) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 1000,
        ...typeStyles[type],
        color: 'white',
        padding: '12px 16px',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '500',
        boxShadow: '0 8px 25px rgba(0, 0, 0, 0.3)',
        transform: isAnimating ? 'translateX(0)' : 'translateX(100%)',
        opacity: isAnimating ? 1 : 0,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        cursor: 'pointer',
        maxWidth: '300px'
      }}
      onClick={handleClose}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <span>
          {type === 'info' && '💧'}
          {type === 'success' && '✅'}
          {type === 'warning' && '⚠️'}
          {type === 'error' && '🚨'}
        </span>
        <span>{message}</span>
        <span style={{ marginLeft: 'auto', opacity: 0.7, fontSize: '12px' }}>×</span>
      </div>
    </div>
  );
};

export default FloatingAlert;