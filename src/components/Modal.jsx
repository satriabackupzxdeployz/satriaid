import React, { useEffect } from 'react';

export default function Modal({ id, show, onClose, children, maxWidth = 500 }) {
  useEffect(() => {
    if (show) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => { document.body.style.overflow = 'auto'; };
  }, [show]);

  useEffect(() => {
    const handler = (e) => { if (e.key === 'Escape' && show) onClose(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div
      className="modal-overlay active"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="modal-content" style={{ maxWidth }}>
        {children}
      </div>
    </div>
  );
}
