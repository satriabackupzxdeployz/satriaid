import React, { useState, useEffect } from 'react';
import { useOrders } from '../hooks/useOrders';

const STATUS_MAP = {
  success: { cls: 'status-success', icon: 'fa-check-circle', text: 'Berhasil' },
  cancelled: { cls: 'status-cancelled', icon: 'fa-times-circle', text: 'Dibatalkan' },
  expired: { cls: 'status-expired', icon: 'fa-hourglass-end', text: 'Kadaluarsa' },
  pending: { cls: 'status-pending', icon: 'fa-clock', text: 'Pending' },
};

function CountdownTimer({ expiryTime }) {
  const [remaining, setRemaining] = useState(() => Math.max(0, expiryTime - Date.now()));

  useEffect(() => {
    const iv = setInterval(() => {
      const r = Math.max(0, expiryTime - Date.now());
      setRemaining(r);
      if (r === 0) clearInterval(iv);
    }, 1000);
    return () => clearInterval(iv);
  }, [expiryTime]);

  if (remaining <= 0) return <span style={{ color: '#dc2626', fontSize: '.75rem' }}>Kadaluarsa</span>;
  const m = Math.floor(remaining / 60000);
  const s = Math.floor((remaining % 60000) / 1000);
  return (
    <span style={{ color: '#d97706', fontSize: '.75rem', fontWeight: 600 }}>
      <i className="fas fa-hourglass-half" style={{ marginRight: '.25rem' }}></i>
      Sisa: {m}m {s}d
    </span>
  );
}

export default function HistorySection() {
  const { orders } = useOrders();

  const formatDate = (ts) => new Date(ts).toLocaleDateString('id-ID', {
    day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
  });

  if (orders.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 1rem', background: 'white', borderRadius: '1.25rem', boxShadow: '0 4px 15px rgba(0,0,0,.05)', border: '1px solid #f3f4f6' }}>
        <i className="fas fa-receipt" style={{ fontSize: '4rem', color: '#d1d5db', marginBottom: '1rem', display: 'block' }}></i>
        <p style={{ color: '#6b7280' }}>Belum ada transaksi</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '.75rem' }}>
      {orders.map((order) => {
        const s = STATUS_MAP[order.status] || STATUS_MAP.pending;
        const priceFormatted = 'Rp' + order.price.toLocaleString('id-ID');
        return (
          <div key={order.id} style={{ background: 'white', padding: '1rem', borderRadius: '.75rem', boxShadow: '0 2px 8px rgba(0,0,0,.05)', border: '1px solid #f3f4f6' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p style={{ fontWeight: 700 }}>{order.productName}</p>
                <p style={{ fontSize: '.75rem', color: '#6b7280', marginTop: '.25rem' }}>{formatDate(order.createdAt)}</p>
                {order.status === 'pending' && order.expiryTime && (
                  <CountdownTimer expiryTime={order.expiryTime} />
                )}
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{ fontSize: '1.125rem', fontWeight: 900 }}>{priceFormatted}</p>
                <span className={`${s.cls}`} style={{ display: 'inline-block', padding: '.2rem .65rem', borderRadius: 999, fontSize: '.7rem', fontWeight: 700, marginTop: '.25rem' }}>
                  <i className={`fas ${s.icon}`} style={{ marginRight: '.25rem' }}></i>{s.text}
                </span>
              </div>
            </div>
            {order.status === 'success' && order.fileUrl && (
              <a
                href={order.fileUrl}
                target="_blank"
                rel="noreferrer"
                className="btn-download"
                style={{ marginTop: '.75rem', width: '100%', justifyContent: 'center', fontSize: '.875rem', padding: '.625rem 1rem' }}
              >
                <i className="fas fa-download"></i> Download Produk
              </a>
            )}
          </div>
        );
      })}
    </div>
  );
}
