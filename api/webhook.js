export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  const payload = req.body;

  // Log payload untuk debugging
  console.log('[webhook] Received:', JSON.stringify(payload));

  // Field dari qris.pw berdasarkan kode bot Telegram
  const gatewayOrderId     = payload.order_id     || payload.orderId     || null;
  const gatewayTrxId       = payload.transaction_id || payload.transactionId || null;
  const status             = payload.status         || payload.payment_status || null;

  if (!gatewayOrderId && !gatewayTrxId) {
    return res.status(400).json({ success: false, message: 'Missing order_id or transaction_id' });
  }

  const isPaid    = ['paid', 'success', 'PAID', 'SUCCESS'].includes(status);
  const isExpired = ['expired', 'EXPIRED', 'cancelled', 'CANCELLED', 'failed', 'FAILED'].includes(status);
  const newStatus = isPaid ? 'success' : isExpired ? 'expired' : 'pending';

  const DB_URL    = process.env.VITE_FIREBASE_DATABASE_URL;
  const DB_SECRET = process.env.FIREBASE_DATABASE_SECRET;

  if (!DB_URL) {
    return res.status(500).json({ success: false, message: 'VITE_FIREBASE_DATABASE_URL not set' });
  }

  const auth = DB_SECRET ? `?auth=${DB_SECRET}` : '';

  try {
    // Cari order di Firebase berdasarkan field orderId yang tersimpan
    // (Firebase push key ≠ order_id dari payment gateway)
    // Coba match dengan orderId dulu, fallback ke transactionId
    const searchValue = gatewayOrderId || gatewayTrxId;
    const searchField = gatewayOrderId ? 'orderId' : 'transactionId';

    const queryUrl = `${DB_URL}/orders.json${auth ? auth + '&' : '?'}orderBy="${searchField}"&equalTo="${searchValue}"`;
    const searchRes = await fetch(queryUrl);
    const orders    = await searchRes.json();

    // Kalau tidak ketemu dengan orderId, coba dengan transactionId
    let firebaseKey = null;
    if (!orders || typeof orders !== 'object' || Object.keys(orders).length === 0) {
      if (gatewayTrxId && searchField !== 'transactionId') {
        const fallbackUrl = `${DB_URL}/orders.json${auth ? auth + '&' : '?'}orderBy="transactionId"&equalTo="${gatewayTrxId}"`;
        const fallbackRes = await fetch(fallbackUrl);
        const fallbackOrders = await fallbackRes.json();
        if (fallbackOrders && Object.keys(fallbackOrders).length > 0) {
          firebaseKey = Object.keys(fallbackOrders)[0];
        }
      }
    } else {
      firebaseKey = Object.keys(orders)[0];
    }

    if (!firebaseKey) {
      console.warn('[webhook] Order not found for:', searchValue);
      // Tetap return 200 agar payment gateway tidak retry terus
      return res.status(200).json({ success: false, message: 'Order not found, acknowledged' });
    }

    // Update status order di Firebase
    const updateRes = await fetch(
      `${DB_URL}/orders/${firebaseKey}.json${auth}`,
      {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status:    newStatus,
          updatedAt: Date.now(),
          paidAt:    isPaid ? Date.now() : null,
          gatewayPayload: payload,
        }),
      }
    );

    if (!updateRes.ok) {
      const errText = await updateRes.text();
      console.error('[webhook] Firebase update failed:', errText);
      return res.status(500).json({ success: false, message: 'Firebase update failed' });
    }

    console.log(`[webhook] Order ${firebaseKey} updated to: ${newStatus}`);
    return res.status(200).json({ success: true, firebaseKey, newStatus });

  } catch (err) {
    console.error('[webhook] Error:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
}
