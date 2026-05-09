import React, { useState, useEffect, useRef } from 'react';
import Modal from './Modal';
import { useOrders } from '../hooks/useOrders';

export default function CheckoutModal({ product, show, onClose }) {
  const [step,        setStep]        = useState('form');
  const [phone,       setPhone]       = useState('');
  const [email,       setEmail]       = useState('');
  const [message,     setMessage]     = useState('');
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState('');
  // Data dari qris.pw — field persis sesuai docs
  const [qrisUrl,     setQrisUrl]     = useState('');
  const [transactionId, setTransactionId] = useState('');
  const [orderId,     setOrderId]     = useState(''); // Firebase push key
  const [gwOrderId,   setGwOrderId]   = useState(''); // order_id dari qris.pw
  const [expiresAt,   setExpiresAt]   = useState('');
  const [orderStatus, setOrderStatus] = useState('pending');
  const [countdown,   setCountdown]   = useState(null);
  const countdownRef = useRef(null);
  const { createOrder, listenToOrder } = useOrders();

  // Reset saat modal ditutup
  useEffect(() => {
    if (!show) {
      setStep('form');
      setPhone(''); setEmail(''); setMessage('');
      setError(''); setLoading(false);
      setQrisUrl(''); setTransactionId('');
      setOrderId(''); setGwOrderId(''); setExpiresAt('');
      setOrderStatus('pending'); setCountdown(null);
      if (countdownRef.current) clearInterval(countdownRef.current);
    }
  }, [show]);

  // Real-time listener Firebase untuk update status
  useEffect(() => {
    if (!orderId) return;
    const unsub = listenToOrder(orderId, (data) => {
      if (data.status === 'success') {
        setOrderStatus('success');
        clearInterval(countdownRef.current);
      } else if (data.status === 'expired') {
        setOrderStatus('expired');
        clearInterval(countdownRef.current);
      }
    });
    return () => { if (typeof unsub === 'function') unsub(); };
  }, [orderId, listenToOrder]);

  async function handleProcess() {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/create-payment', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount:        product.price,
          productName:   product.name,
          seller:        product.seller || 'Satriadevs',
          customerPhone: phone || '',
        }),
      });

      const json = await res.json();

      if (!json.success) {
        setError(json.error || 'Gagal membuat pembayaran. Coba lagi.');
        setLoading(false);
        return;
      }

      // Simpan field dari response qris.pw (sesuai docs)
      setQrisUrl(json.qris_url || '');
      setTransactionId(json.transaction_id || '');
      setGwOrderId(json.order_id || '');
      setExpiresAt(json.expires_at || '');

      // Hitung countdown dari expires_at (format: "2025-10-30 15:00:00")
      let expiryMs = Date.now() + 10 * 60 * 1000; // default 10 menit sesuai docs
      if (json.expires_at) {
        const parsed = new Date(json.expires_at).getTime();
        if (!isNaN(parsed)) expiryMs = parsed;
      }
      const secsLeft = Math.max(0, Math.floor((expiryMs - Date.now()) / 1000));
      setCountdown(secsLeft);
      countdownRef.current = setInterval(() => {
        setCountdown(p => {
          if (p <= 1) { clearInterval(countdownRef.current); return 0; }
          return p - 1;
        });
      }, 1000);

      // Simpan order ke Firebase, pakai transaction_id dan order_id dari gateway
      const fbKey = await createOrder({
        productId:     product.id,
        productName:   product.name,
        price:         product.price,
        seller:        product.seller || 'Satriadevs',
        orderId:       json.order_id,       // untuk webhook lookup
        transactionId: json.transaction_id, // untuk webhook lookup fallback
        phone:         phone   || null,
        email:         email   || null,
        buyerMessage:  message || null,
        expiryTime:    expiryMs,
        method:        'QRIS',
      });

      setOrderId(fbKey); // Firebase push key, untuk listener
      setStep('qris');

    } catch (e) {
      console.error('[checkout]', e);
      setError('Terjadi kesalahan koneksi. Coba lagi.');
    }
    setLoading(false);
  }

  function formatCountdown(secs) {
    if (secs === null) return '--:--';
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  }

  if (!product) return null;

  const priceF  = 'Rp' + product.price.toLocaleString('id-ID');
  const iStyle  = { width:'100%', padding:'.625rem .875rem', border:'1.5px solid #e5e7eb', borderRadius:'.625rem', fontSize:'.875rem', outline:'none', fontFamily:'inherit', background:'#fafafa', boxSizing:'border-box' };
  const lStyle  = { display:'block', fontSize:'.8rem', fontWeight:600, color:'#374151', marginBottom:'.3rem' };

  return (
    <Modal show={show} onClose={onClose} maxWidth={500}>

      {/* Header */}
      <div style={{ padding:'1.25rem', borderBottom:'1px solid #f3f4f6', display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, background:'white', borderRadius:'1.5rem 1.5rem 0 0', zIndex:10 }}>
        <h2 style={{ fontSize:'1.25rem', fontWeight:900, color:'#1f2937' }}>🛒 Checkout</h2>
        <button onClick={onClose} style={{ width:36, height:36, borderRadius:'50%', background:'#f3f4f6', border:'none', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <i className="fas fa-times" style={{ color:'#6b7280' }}></i>
        </button>
      </div>

      <div style={{ padding:'1.25rem', display:'flex', flexDirection:'column', gap:'1rem' }}>

        {/* Info Produk */}
        <div style={{ background:'#f0fdf4', borderRadius:'.75rem', padding:'1rem', display:'flex', alignItems:'center', gap:'.75rem' }}>
          <div style={{ width:44, height:44, borderRadius:'.5rem', background:'#bbf7d0', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <i className="fas fa-shopping-cart" style={{ color:'#15803d' }}></i>
          </div>
          <div>
            <p style={{ fontSize:'.875rem', color:'#166534', fontWeight:600 }}>{product.name}</p>
            <p style={{ fontSize:'1.25rem', fontWeight:900, color:'#14532d' }}>{priceF}</p>
          </div>
        </div>

        {/* ── STEP FORM ── */}
        {step === 'form' && (<>

          {/* Data Pembeli */}
          <div style={{ background:'#f9fafb', borderRadius:'.75rem', padding:'1rem', display:'flex', flexDirection:'column', gap:'.625rem', border:'1px solid #f3f4f6' }}>
            <p style={{ fontSize:'.8rem', fontWeight:700, color:'#374151' }}>
              <i className="fas fa-user-circle" style={{ color:'#9ca3af', marginRight:'.35rem' }}></i>
              Data Pembeli <span style={{ color:'#9ca3af', fontWeight:400 }}>(opsional)</span>
            </p>
            <div>
              <label style={lStyle}>No. Telepon / WhatsApp</label>
              <input style={iStyle} type="tel" placeholder="081234567890" value={phone} onChange={e => setPhone(e.target.value)} />
            </div>
            <div>
              <label style={lStyle}>Email</label>
              <input style={iStyle} type="email" placeholder="email@kamu.com" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div>
              <label style={lStyle}>Pesan untuk Admin</label>
              <textarea style={{ ...iStyle, resize:'vertical', minHeight:60 }} placeholder="Catatan untuk penjual..." value={message} onChange={e => setMessage(e.target.value)} rows={2} />
            </div>
          </div>

          {/* Info Metode */}
          <div style={{ background:'#eff6ff', borderRadius:'.75rem', padding:'.875rem 1rem', border:'1px solid #bfdbfe', display:'flex', alignItems:'center', gap:'.75rem' }}>
            <i className="fas fa-qrcode" style={{ color:'#2563eb', fontSize:'1.25rem' }}></i>
            <div>
              <p style={{ fontWeight:700, color:'#1e40af', fontSize:'.875rem' }}>Pembayaran via QRIS</p>
              <p style={{ fontSize:'.75rem', color:'#3b82f6', marginTop:'.1rem' }}>QR berlaku <strong>10 menit</strong> setelah dibuat</p>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div style={{ background:'#fef2f2', border:'1px solid #fecaca', borderRadius:'.75rem', padding:'.75rem 1rem', color:'#dc2626', fontSize:'.875rem', display:'flex', alignItems:'center', gap:'.5rem' }}>
              <i className="fas fa-exclamation-circle"></i> {error}
            </div>
          )}

          {/* Tombol */}
          <button
            className="btn-primary"
            style={{ width:'100%', padding:'.875rem', fontSize:'1rem', opacity: loading ? 0.65 : 1 }}
            onClick={handleProcess}
            disabled={loading}
          >
            {loading
              ? <><i className="fas fa-spinner fa-spin" style={{ marginRight:'.5rem' }}></i>Membuat QRIS...</>
              : <><i className="fas fa-qrcode" style={{ marginRight:'.5rem' }}></i>Proses QRIS</>
            }
          </button>
        </>)}

        {/* ── STEP QRIS ── */}
        {step === 'qris' && (<>

          {/* Berhasil */}
          {orderStatus === 'success' && (
            <div style={{ textAlign:'center', padding:'2rem 1rem' }}>
              <i className="fas fa-check-circle" style={{ fontSize:'3.5rem', color:'#22c55e', display:'block', marginBottom:'1rem' }}></i>
              <p style={{ fontSize:'1.125rem', fontWeight:700, color:'#15803d' }}>Pembayaran Berhasil!</p>
              <p style={{ color:'#4b7c4b', fontSize:'.875rem', marginTop:'.5rem' }}>Terima kasih sudah membeli {product.name} 🙏</p>
              {product.fileUrl && (
                <a href={product.fileUrl} target="_blank" rel="noreferrer" className="btn-download" style={{ marginTop:'1.5rem', width:'100%', justifyContent:'center', display:'flex' }}>
                  <i className="fas fa-download" style={{ marginRight:'.5rem' }}></i>Download Produk
                </a>
              )}
            </div>
          )}

          {/* Kadaluarsa */}
          {orderStatus === 'expired' && (
            <div style={{ textAlign:'center', padding:'2rem 1rem' }}>
              <i className="fas fa-hourglass-end" style={{ fontSize:'3.5rem', color:'#ef4444', display:'block', marginBottom:'1rem' }}></i>
              <p style={{ fontSize:'1.125rem', fontWeight:700, color:'#dc2626' }}>Pembayaran Kadaluarsa</p>
              <p style={{ color:'#6b7280', fontSize:'.875rem', marginTop:'.5rem' }}>QR sudah expired. Silakan coba lagi.</p>
              <button className="btn-primary" style={{ marginTop:'1.25rem', width:'100%' }} onClick={onClose}>Tutup & Coba Lagi</button>
            </div>
          )}

          {/* Menunggu pembayaran */}
          {orderStatus === 'pending' && (<>
            <div style={{ border:'2px dashed #22c55e', borderRadius:'.75rem', padding:'1.5rem', textAlign:'center', background:'#f0fdf4' }}>
              <p style={{ fontWeight:700, fontSize:'1rem', marginBottom:'.75rem', color:'#15803d' }}>Scan QRIS untuk Membayar</p>
              {qrisUrl
                ? <img src={qrisUrl} alt="QRIS" style={{ width:200, height:200, margin:'0 auto', display:'block', borderRadius:'.5rem' }} onContextMenu={e => e.preventDefault()} draggable={false} />
                : <div style={{ width:200, height:200, margin:'0 auto', background:'#e5e7eb', borderRadius:'.5rem', display:'flex', alignItems:'center', justifyContent:'center' }}>
                    <i className="fas fa-spinner fa-spin" style={{ fontSize:'2rem', color:'#9ca3af' }}></i>
                  </div>
              }
              <p style={{ fontSize:'.75rem', color:'#6b7280', marginTop:'.75rem' }}>Scan dengan e-wallet atau mobile banking</p>
            </div>

            {/* ID Info */}
            <div style={{ background:'#f9fafb', borderRadius:'.75rem', padding:'.75rem 1rem', fontSize:'.78rem', display:'flex', flexDirection:'column', gap:'.3rem', border:'1px solid #f3f4f6' }}>
              {transactionId && (
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <span style={{ color:'#6b7280' }}>Transaction ID</span>
                  <span style={{ fontFamily:'monospace', fontWeight:700, color:'#374151' }}>{transactionId}</span>
                </div>
              )}
              {gwOrderId && (
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <span style={{ color:'#6b7280' }}>Order ID</span>
                  <span style={{ fontFamily:'monospace', fontWeight:700, color:'#374151' }}>{gwOrderId}</span>
                </div>
              )}
              {expiresAt && (
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                  <span style={{ color:'#6b7280' }}>Expired</span>
                  <span style={{ fontWeight:600, color:'#b45309' }}>{expiresAt}</span>
                </div>
              )}
            </div>

            {/* Countdown */}
            <div style={{ background:'#fffbeb', borderRadius:'.75rem', padding:'1rem', textAlign:'center', border:'1px solid #fde68a' }}>
              <p style={{ fontSize:'.75rem', color:'#92400e', marginBottom:'.25rem' }}>
                <i className="fas fa-hourglass-half" style={{ marginRight:'.3rem' }}></i>Sisa waktu pembayaran
              </p>
              <p className={`qris-countdown ${countdown !== null && countdown < 60 ? 'countdown-warning' : ''}`} style={{ color:'#b45309' }}>
                {formatCountdown(countdown)}
              </p>
            </div>

            <p style={{ fontSize:'.75rem', color:'#3b82f6', background:'#eff6ff', padding:'.75rem', borderRadius:'.75rem', textAlign:'center' }}>
              <i className="fas fa-sync fa-spin" style={{ marginRight:'.3rem' }}></i>
              Menunggu konfirmasi... Halaman update otomatis setelah pembayaran berhasil.
            </p>
          </>)}
        </>)}
      </div>
    </Modal>
  );
}
