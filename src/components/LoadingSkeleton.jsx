const LoadingSkeleton = ({ width = '100%', height = '20px', borderRadius = '4px' }) => {
  return (
    <div
      style={{
        width,
        height,
        borderRadius,
        background: 'linear-gradient(90deg, #2a2a2a 25%, #404040 50%, #2a2a2a 75%)',
        backgroundSize: '200% 100%',
        animation: 'shimmer 1.5s infinite',
        position: 'relative',
        overflow: 'hidden'
      }}
    >
      <style jsx>{`
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
      `}</style>
    </div>
  );
};

export default LoadingSkeleton;