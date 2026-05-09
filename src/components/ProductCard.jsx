import React from 'react';

const BADGE_COLORS = {
  'BEST SELLER': '#16a34a',
  'POPULER': '#f97316',
  'BARU': '#2563eb',
  'PREMIUM': '#9333ea',
  'HEMAT': '#0d9488',
  'DISKON': '#ef4444',
};

const GRADIENTS = [
  'linear-gradient(135deg,#4ade80,#16a34a)',
  'linear-gradient(135deg,#fbbf24,#f97316)',
  'linear-gradient(135deg,#60a5fa,#4f46e5)',
  'linear-gradient(135deg,#c084fc,#ec4899)',
  'linear-gradient(135deg,#2dd4bf,#06b6d4)',
  'linear-gradient(135deg,#f87171,#ef4444)',
];

const ICONS = ['fa-file-alt','fa-image','fa-book','fa-video','fa-font','fa-share-alt'];

export default function ProductCard({ product, index, onBuy }) {
  const priceFormatted = 'Rp' + product.price.toLocaleString('id-ID');
  const discountFormatted = product.discountPrice ? 'Rp' + product.discountPrice.toLocaleString('id-ID') : null;
  const gradient = product.gradient || GRADIENTS[index % GRADIENTS.length];
  const icon = product.icon || ICONS[index % ICONS.length];
  const isBimoli = product.seller === 'Bimoli';
  const sellerLabel = isBimoli ? '© Bimoli' : '© Satriadevs';

  return (
    <div className="card-product animate-fadeInUp" style={{ animationDelay: `${index * 0.08}s` }}>
      <div style={{ position:'relative', background:'#f9fafb', minHeight:180, display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden' }}>
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} style={{ width:'100%', maxHeight:288, objectFit:'contain' }} onContextMenu={e=>e.preventDefault()} draggable={false} />
        ) : (
          <div style={{ width:'100%', height:192, background:gradient, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <i className={`fas ${icon}`} style={{ fontSize:'4.5rem', color:'rgba(255,255,255,0.2)' }}></i>
          </div>
        )}
        {product.badge && (
          <span className="tag-badge" style={{ background: BADGE_COLORS[product.badge] || '#4b5563' }}>{product.badge}</span>
        )}
      </div>

      <div style={{ padding:'1rem' }}>
        <h3 style={{ fontWeight:700, fontSize:'1rem' }}>{product.name}</h3>
        <p style={{ color:'#6b7280', fontSize:'.75rem', marginTop:'.25rem' }} className="line-clamp-2">{product.description}</p>
        <div style={{ marginTop:'.75rem', display:'flex', alignItems:'baseline', gap:'.5rem' }}>
          <span style={{ fontSize:'1.25rem', fontWeight:900 }}>{priceFormatted}</span>
          {discountFormatted && <span style={{ fontSize:'.75rem', color:'#9ca3af', textDecoration:'line-through' }}>{discountFormatted}</span>}
        </div>
        <div style={{ display:'flex', gap:'.5rem', marginTop:'.75rem' }}>
          <button onClick={() => onBuy(product)} className="btn-primary" style={{ flex:1, fontSize:'.875rem', padding:'.625rem 1rem' }}>
            <i className="fas fa-shopping-cart"></i> Beli
          </button>
        </div>
        <p style={{ marginTop:'.4rem', fontSize:'.68rem', color: isBimoli ? '#f9a8d4' : '#d1d5db', textAlign:'right', letterSpacing:'.02em', userSelect:'none' }}>
          {sellerLabel}
        </p>
      </div>
    </div>
  );
}
