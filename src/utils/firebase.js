import { initializeApp, getApps } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const missing = Object.entries(firebaseConfig).filter(([, v]) => !v).map(([k]) => k);
if (missing.length > 0) {
  console.error('[Firebase] ENV variables belum diset di Vercel:', missing);
}

let app;
let db;

try {
  if (!firebaseConfig.databaseURL) throw new Error('VITE_FIREBASE_DATABASE_URL belum diset!');
  app = getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig);
  db = getDatabase(app);
  console.log('[Firebase] Terhubung ke:', firebaseConfig.databaseURL);
} catch (e) {
  console.error('[Firebase] Gagal inisialisasi:', e.message);
  db = null;
}

export { db };
