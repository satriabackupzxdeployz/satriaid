import { useState, useEffect } from 'react';
import { db } from '../utils/firebase';
import { ref, onValue, set, push, update } from 'firebase/database';

export function useOrders() {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    if (!db) {
      console.error('[useOrders] db null — cek VITE_FIREBASE_* di Vercel env vars');
      return;
    }
    const ordersRef = ref(db, 'orders');
    const unsub = onValue(
      ordersRef,
      (snapshot) => {
        const data = snapshot.val();
        if (data) {
          const list = Object.entries(data).map(([id, val]) => ({ id, ...val }));
          setOrders(list.sort((a, b) => b.createdAt - a.createdAt));
        } else {
          setOrders([]);
        }
      },
      (err) => {
        console.error('[useOrders] onValue error:', err.message);
      }
    );
    return () => unsub();
  }, []);

  async function createOrder(orderData) {
    if (!db) throw new Error('Database tidak terhubung. Cek env vars Firebase.');
    const ordersRef = ref(db, 'orders');
    const newRef = push(ordersRef);
    await set(newRef, { ...orderData, status: 'pending', createdAt: Date.now() });
    return newRef.key;
  }

  async function updateOrder(id, data) {
    if (!db) throw new Error('Database tidak terhubung. Cek env vars Firebase.');
    const orderRef = ref(db, `orders/${id}`);
    await update(orderRef, { ...data, updatedAt: Date.now() });
  }

  function listenToOrder(orderId, callback) {
    if (!db) return () => {};
    const orderRef = ref(db, `orders/${orderId}`);
    return onValue(orderRef, (snapshot) => {
      if (snapshot.exists()) callback(snapshot.val());
    });
  }

  return { orders, createOrder, updateOrder, listenToOrder };
}
