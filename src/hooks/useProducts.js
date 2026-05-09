import { useState, useEffect } from 'react';
import { db } from '../utils/firebase';
import { ref, onValue, set, remove, push, update } from 'firebase/database';

export function useProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!db) {
      console.error('[useProducts] db null — cek VITE_FIREBASE_* di Vercel env vars');
      setLoading(false);
      return;
    }
    const productsRef = ref(db, 'products');
    const unsub = onValue(
      productsRef,
      (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const list = Object.entries(data).map(([id, val]) => ({ id, ...val }));
          setProducts(list);
        } else {
          setProducts([]);
        }
        setLoading(false);
      },
      (err) => {
        console.error('[useProducts] onValue error:', err.message);
        setLoading(false);
      }
    );
    return () => unsub();
  }, []);

  async function addProduct(productData) {
    if (!db) throw new Error('Database tidak terhubung. Cek env vars Firebase.');
    const productsRef = ref(db, 'products');
    const newRef = push(productsRef);
    await set(newRef, { ...productData, createdAt: Date.now() });
    return newRef.key;
  }

  async function updateProduct(id, productData) {
    if (!db) throw new Error('Database tidak terhubung. Cek env vars Firebase.');
    const productRef = ref(db, `products/${id}`);
    await update(productRef, { ...productData, updatedAt: Date.now() });
  }

  async function deleteProduct(product) {
    if (!db) throw new Error('Database tidak terhubung. Cek env vars Firebase.');
    await fetch('/api/delete-media', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        imageTgMsgId: product.imageTgMsgId || null,
        fileTgMsgId: product.fileTgMsgId || null,
      }),
    });
    const productRef = ref(db, `products/${product.id}`);
    await remove(productRef);
  }

  return { products, loading, addProduct, updateProduct, deleteProduct };
}
