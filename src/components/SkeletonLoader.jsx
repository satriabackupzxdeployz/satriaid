import React from 'react';

export default function SkeletonLoader() {
  return (
    <div style={{maxWidth:768,margin:'0 auto',padding:'1.5rem 1rem'}}>
      <div className="skeleton" style={{width:'100%',height:220,borderRadius:'0 0 1.5rem 1.5rem',marginBottom:'1rem'}}></div>
      <div style={{display:'flex',justifyContent:'center',marginTop:-70,marginBottom:'1rem'}}>
        <div className="skeleton-circle" style={{width:112,height:112,border:'4px solid white',boxShadow:'0 4px 20px rgba(0,0,0,.1)'}}></div>
      </div>
      <div style={{textAlign:'center',marginBottom:'2rem'}}>
        <div className="skeleton" style={{height:20,width:160,margin:'0 auto 8px'}}></div>
        <div className="skeleton" style={{height:14,width:256,margin:'0 auto'}}></div>
      </div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(2,1fr)',gap:20}}>
        {[1,2,3,4].map(i => (
          <div key={i} className="skeleton" style={{height:260,borderRadius:'1.25rem'}}></div>
        ))}
      </div>
    </div>
  );
}
