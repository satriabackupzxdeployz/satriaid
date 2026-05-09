import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import AdminPage from './pages/AdminPage';
import './index.css';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, info) {
    console.error('[App Error]', error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f2f5', padding: '1rem' }}>
          <div style={{ background: 'white', borderRadius: '1.25rem', padding: '2rem', maxWidth: 420, width: '100%', boxShadow: '0 8px 30px rgba(0,0,0,.1)', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚠️</div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#1f2937', marginBottom: '.5rem' }}>Terjadi Kesalahan</h2>
            <p style={{ color: '#6b7280', fontSize: '.875rem', marginBottom: '1rem' }}>
              Aplikasi tidak dapat dimuat. Kemungkinan env variable Firebase belum dikonfigurasi di Vercel.
            </p>
            <details style={{ textAlign: 'left', background: '#f9fafb', borderRadius: '.5rem', padding: '.75rem', fontSize: '.75rem', color: '#374151' }}>
              <summary style={{ cursor: 'pointer', fontWeight: 700 }}>Detail error</summary>
              <pre style={{ marginTop: '.5rem', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{this.state.error?.toString()}</pre>
            </details>
            <button style={{ marginTop: '1rem', padding: '.625rem 1.5rem', background: '#22c55e', color: 'white', border: 'none', borderRadius: 999, fontWeight: 700, cursor: 'pointer' }} onClick={() => window.location.reload()}>
              Coba Lagi
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/satriadevsxadmin_3" element={<AdminPage panel="satria" />} />
          <Route path="/bimolijelek_admin" element={<AdminPage panel="bimoli" />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
