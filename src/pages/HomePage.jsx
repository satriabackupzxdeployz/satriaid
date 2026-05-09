import React, { useState, useEffect } from 'react';
import SkeletonLoader from '../components/SkeletonLoader';
import ProductCard from '../components/ProductCard';
import CheckoutModal from '../components/CheckoutModal';
import HistorySection from '../components/HistorySection';
import { useProducts } from '../hooks/useProducts';

export default function HomePage() {
  const [loaded, setLoaded] = useState(false);
  const [section, setSection] = useState('catalog');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const { products, loading } = useProducts();

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 1500);
    return () => clearTimeout(t);
  }, []);

  if (!loaded || loading) return <SkeletonLoader />;

  return (
    <div style={{ maxWidth: 768, margin: '0 auto', minHeight: '100vh' }}>
      <div className="wa-banner"></div>

      <div className="profile-section" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
        <img
          src="/assets/profile.jpg"
          alt="Satriadevs"
          className="profile-avatar animate-float"
          onContextMenu={e => e.preventDefault()}
          draggable={false}
        />
        <div style={{ marginTop: '.75rem' }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#1f2937' }}>Satriadevs</h1>
          <p style={{ color: '#6b7280', marginTop: '.375rem', maxWidth: 400, fontSize: '.875rem', lineHeight: 1.6, padding: '0 .5rem' }}>
            Ini website buat jualan produk ku pakai payment gateway biar otomatis ga susah susah lagi manual
          </p>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '.625rem', marginTop: '1rem', flexWrap: 'wrap' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '.375rem', background: 'white', padding: '.5rem .875rem', borderRadius: 999, fontSize: '.75rem', fontWeight: 700, boxShadow: '0 2px 8px rgba(0,0,0,.08)', border: '1px solid #f3f4f6' }}>
            <i className="fas fa-box" style={{ color: '#22c55e' }}></i> {products.length} Produk
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '.375rem', background: 'white', padding: '.5rem .875rem', borderRadius: 999, fontSize: '.75rem', fontWeight: 700, boxShadow: '0 2px 8px rgba(0,0,0,.08)', border: '1px solid #f3f4f6' }}>
            <i className="fas fa-star" style={{ color: '#f59e0b' }}></i> 4.9 Rating
          </span>
        </div>
      </div>

      <div style={{ maxWidth: 768, margin: '0 auto', padding: '1.5rem 1rem 6rem' }}>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '.625rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          <button
            className={`nav-btn ${section === 'catalog' ? 'nav-btn-active' : 'nav-btn-ghost'}`}
            onClick={() => setSection('catalog')}
          >
            <i className="fas fa-th-large"></i> Semua
          </button>
          <button
            className={`nav-btn ${section === 'history' ? 'nav-btn-active-blue' : 'nav-btn-ghost'}`}
            onClick={() => setSection('history')}
          >
            <i className="fas fa-history"></i> Transaksi
          </button>
        </div>

        {section === 'catalog' && (
          products.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 1rem', background: 'white', borderRadius: '1.25rem', boxShadow: '0 4px 15px rgba(0,0,0,.05)', border: '1px solid #f3f4f6', gridColumn: '1/-1' }}>
              <i className="fas fa-box-open" style={{ fontSize: '4rem', color: '#d1d5db', marginBottom: '1rem', display: 'block' }}></i>
              <p style={{ color: '#6b7280' }}>Belum ada produk tersedia</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1.25rem' }}>
              {products.map((p, i) => (
                <ProductCard key={p.id} product={p} index={i} onBuy={setSelectedProduct} />
              ))}
            </div>
          )
        )}

        {section === 'history' && <HistorySection />}

        <div style={{ textAlign: 'center', paddingTop: '2.5rem', marginTop: '2rem', borderTop: '1px solid #e5e7eb' }}>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1.25rem', marginBottom: '1.25rem' }}>
            {['fa-instagram','fa-tiktok','fa-youtube','fa-whatsapp'].map(icon => (
              <a key={icon} href="#" style={{ width: 44, height: 44, borderRadius: '50%', background: 'white', boxShadow: '0 4px 12px rgba(0,0,0,.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6b7280', textDecoration: 'none', transition: 'color .2s' }}>
                <i className={`fab ${icon}`} style={{ fontSize: '1.125rem' }}></i>
              </a>
            ))}
          </div>
          <p style={{ fontSize: '.75rem', color: '#9ca3af' }}>© Satriadevs</p>
        </div>
      </div>

      <CheckoutModal
        product={selectedProduct}
        show={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  );
}
