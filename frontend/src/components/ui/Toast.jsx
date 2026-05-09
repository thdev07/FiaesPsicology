import { useEffect, useState } from 'react';
import { CheckCircle, XCircle, Info, X } from 'lucide-react';

const VARIANTS = {
  success: { bg: '#16a34a', icon: CheckCircle },
  error:   { bg: '#dc2626', icon: XCircle },
  info:    { bg: '#2563eb', icon: Info },
};

export default function Toast({ message, type = 'info', onClose }) {
  const [visible, setVisible] = useState(false);
  const { bg, icon: Icon } = VARIANTS[type] ?? VARIANTS.info;

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        background: bg,
        color: '#fff',
        padding: '0.75rem 1rem',
        borderRadius: '0.5rem',
        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
        minWidth: '280px',
        maxWidth: '400px',
        pointerEvents: 'auto',
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(12px)',
        transition: 'opacity 0.25s ease, transform 0.25s ease',
        fontSize: '0.9rem',
        fontWeight: 500,
      }}
    >
      <Icon size={18} style={{ flexShrink: 0 }} />
      <span style={{ flex: 1 }}>{message}</span>
      <button
        onClick={onClose}
        style={{
          background: 'none',
          border: 'none',
          color: '#fff',
          cursor: 'pointer',
          padding: 0,
          display: 'flex',
          opacity: 0.8,
        }}
      >
        <X size={16} />
      </button>
    </div>
  );
}
