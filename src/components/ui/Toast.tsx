'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { useState } from 'react';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose: () => void;
}

export function Toast({ message, type = 'info', onClose }: ToastProps) {
  const colors = {
    success: { bg: 'rgba(34,197,94,0.12)', border: 'rgba(34,197,94,0.25)', icon: <CheckCircle size={16} color="var(--low)" /> },
    error: { bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.25)', icon: <AlertCircle size={16} color="var(--critical)" /> },
    info: { bg: 'rgba(59,130,246,0.12)', border: 'rgba(59,130,246,0.25)', icon: <Info size={16} color="var(--accent)" /> },
  };

  const c = colors[type];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 20, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '12px 16px',
        borderRadius: 'var(--radius-md)',
        background: c.bg,
        border: `1px solid ${c.border}`,
        boxShadow: 'var(--shadow-elevated)',
        backdropFilter: 'blur(12px)',
        minWidth: 280,
        maxWidth: 400,
      }}
    >
      {c.icon}
      <span style={{ fontSize: 13, color: 'var(--text-primary)', flex: 1 }}>{message}</span>
      <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 2 }}>
        <X size={14} />
      </button>
    </motion.div>
  );
}

// Global toast container — put in layout
let _toastFn: ((msg: string, type?: 'success' | 'error' | 'info') => void) | null = null;

export const toast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
  _toastFn?.(message, type);
};

export function ToastContainer() {
  const [toasts, setToasts] = useState<{ id: number; message: string; type: 'success' | 'error' | 'info' }[]>([]);

  // Register global fn
  _toastFn = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  };

  return (
    <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 8 }}>
      <AnimatePresence>
        {toasts.map(t => (
          <Toast key={t.id} message={t.message} type={t.type} onClose={() => setToasts(prev => prev.filter(x => x.id !== t.id))} />
        ))}
      </AnimatePresence>
    </div>
  );
}
