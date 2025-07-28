const PulseIndicator = ({ color = '#10b981', size = 8, isActive = true }) => {
  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      {/* Main dot */}
      <div
        style={{
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: '50%',
          background: color,
          position: 'relative',
          zIndex: 2
        }}
      />
      
      {/* Pulse rings */}
      {isActive && (
        <>
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: `${size * 2}px`,
              height: `${size * 2}px`,
              borderRadius: '50%',
              border: `1px solid ${color}`,
              transform: 'translate(-50%, -50%)',
              animation: 'pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
              opacity: 0
            }}
          />
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              width: `${size * 3}px`,
              height: `${size * 3}px`,
              borderRadius: '50%',
              border: `1px solid ${color}`,
              transform: 'translate(-50%, -50%)',
              animation: 'pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite 1s',
              opacity: 0
            }}
          />
        </>
      )}
      
      <style jsx>{`
        @keyframes pulse-ring {
          0% {
            transform: translate(-50%, -50%) scale(0.33);
            opacity: 1;
          }
          80%, 100% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default PulseIndicator;