export const config = { api: { bodyParser: { sizeLimit: '50mb' } } };

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const { fileBase64, fileName, mimeType, caption } = req.body;
  const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
  const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

  try {
    const buffer = Buffer.from(fileBase64, 'base64');
    const blob = new Blob([buffer], { type: mimeType });
    const formData = new FormData();
    formData.append('chat_id', CHAT_ID);
    formData.append('caption', caption || fileName);

    let endpoint, fileField;
    if (mimeType && mimeType.startsWith('image/')) {
      endpoint = 'sendPhoto';
      fileField = 'photo';
    } else {
      endpoint = 'sendDocument';
      fileField = 'document';
    }
    formData.append(fileField, blob, fileName);

    const tgRes = await fetch(`https://api.telegram.org/bot${TOKEN}/${endpoint}`, {
      method: 'POST',
      body: formData,
    });
    const tgData = await tgRes.json();

    if (!tgData.ok) return res.status(500).json({ success: false, error: tgData.description });

    const msg = tgData.result;
    let fileId;

    if (endpoint === 'sendPhoto') {
      const photos = msg.photo;
      fileId = photos[photos.length - 1].file_id;
    } else {
      fileId = msg.document.file_id;
    }

    const fileInfoRes = await fetch(`https://api.telegram.org/bot${TOKEN}/getFile?file_id=${fileId}`);
    const fileInfoData = await fileInfoRes.json();
    const tgFileUrl = `https://api.telegram.org/file/bot${TOKEN}/${fileInfoData.result.file_path}`;

    return res.status(200).json({
      success: true,
      fileId,
      fileUrl: tgFileUrl,
      messageId: msg.message_id,
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
