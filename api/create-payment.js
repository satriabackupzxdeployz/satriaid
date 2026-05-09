export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { amount, productName, seller, customerPhone } = req.body;

  if (!amount || isNaN(amount) || amount < 1000) {
    return res.status(400).json({ success: false, error: 'Amount tidak valid. Minimal Rp 1.000.' });
  }

  const isBimoli  = seller === 'Bimoli';
  const apiKey    = isBimoli ? process.env.BIMOLI_QRIS_API_KEY    : process.env.QRIS_API_KEY;
  const apiSecret = isBimoli ? process.env.BIMOLI_QRIS_API_SECRET : process.env.QRIS_API_SECRET;

  if (!apiKey || !apiSecret) {
    return res.status(500).json({ success: false, error: 'API key belum dikonfigurasi di env.' });
  }

  // order_id unik — sesuai docs: string, optional tapi best practice diisi
  const order_id       = `WEB-${Date.now()}`;
  const customer_name  = productName ? `Pembeli ${productName}` : 'Pembeli Web';
  const customer_phone = customerPhone || '';

  // callback_url = URL webhook Vercel ini
  // Ambil dari env WEBHOOK_URL, fallback ke host request
  const protocol     = req.headers['x-forwarded-proto'] || 'https';
  const host         = req.headers['x-forwarded-host'] || req.headers.host;
  const callback_url = process.env.WEBHOOK_URL || `${protocol}://${host}/api/webhook`;

  // Payload persis sesuai dokumentasi qris.pw
  const payload = {
    amount:         Number(amount),
    order_id,
    customer_name,
    customer_phone,
    callback_url,
  };

  console.log('[create-payment] Sending to qris.pw:', JSON.stringify(payload));

  try {
    const qrisRes = await fetch('https://qris.pw/api/create-payment.php', {
      method:  'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key':    apiKey,
        'X-API-Secret': apiSecret,
      },
      body: JSON.stringify(payload),
    });

    // Baca response sebagai text dulu untuk logging kalau gagal
    const rawText = await qrisRes.text();
    console.log('[create-payment] qris.pw raw response:', rawText);

    let data;
    try {
      data = JSON.parse(rawText);
    } catch {
      return res.status(502).json({
        success: false,
        error: 'Response dari qris.pw bukan JSON.',
        raw: rawText,
      });
    }

    // Docs: response sukses selalu ada field success:true dan transaction_id
    if (!data.success) {
      return res.status(400).json({
        success: false,
        error: data.error || 'qris.pw menolak request.',
        detail: data,
      });
    }

    // Kembalikan semua field dari docs response ke frontend:
    // transaction_id, order_id, amount, qris_url, qris_string, expires_at, created_at
    return res.status(200).json({
      success:        true,
      transaction_id: data.transaction_id,
      order_id:       data.order_id || order_id,
      amount:         data.amount,
      qris_url:       data.qris_url,
      qris_string:    data.qris_string,
      expires_at:     data.expires_at,
      created_at:     data.created_at,
    });

  } catch (err) {
    console.error('[create-payment] Fetch error:', err.message);
    return res.status(500).json({ success: false, error: err.message });
  }
}
