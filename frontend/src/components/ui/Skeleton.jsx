const pulse = `
  @keyframes skeleton-pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
  }
`;

function injectStyles() {
  if (typeof document !== 'undefined' && !document.getElementById('skeleton-styles')) {
    const style = document.createElement('style');
    style.id = 'skeleton-styles';
    style.textContent = pulse;
    document.head.appendChild(style);
  }
}

export function Skeleton({ width = '100%', height = '1rem', borderRadius = '0.375rem', style = {} }) {
  injectStyles();
  return (
    <div style={{
      width,
      height,
      borderRadius,
      background: '#e5e7eb',
      animation: 'skeleton-pulse 1.5s ease-in-out infinite',
      ...style,
    }} />
  );
}

export function SkeletonTable({ rows = 5, cols = 4 }) {
  return (
    <div style={{ width: '100%' }}>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} style={{ display: 'flex', gap: '1rem', padding: '0.75rem 0', borderBottom: '1px solid #f3f4f6' }}>
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton key={c} height="0.875rem" style={{ flex: 1 }} />
          ))}
        </div>
      ))}
    </div>
  );
}

export function SkeletonCard({ height = '5rem' }) {
  return (
    <div style={{ padding: '1rem', borderRadius: '0.75rem', border: '1px solid #f3f4f6', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <Skeleton width="40%" height="0.75rem" />
      <Skeleton height={height} borderRadius="0.5rem" />
    </div>
  );
}
