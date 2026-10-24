// Vercel serverless funksiya: buyurtmani Telegram botga yuboradi.
module.exports = async (req, res) => {
  if (req.method !== "POST") return res.status(405).json({ ok: false });
  const { BOT_TOKEN, CHAT_ID } = process.env;
  if (!BOT_TOKEN || !CHAT_ID) return res.status(500).json({ ok: false });

  const b = req.body || {};
  const clean = (v, n) => String(v || "").slice(0, n).trim();
  const name = clean(b.name, 80), phone = clean(b.phone, 30), addr = clean(b.addr, 200);
  const items = Array.isArray(b.items) ? b.items.slice(0, 50) : [];
  if (!name || phone.length < 9 || !addr || !items.length)
    return res.status(400).json({ ok: false });

  let sum = 0;
  const lines = items.map((i) => {
    const q = Math.max(1, Math.min(999, Number(i.q) || 1));
    const p = Math.max(0, Number(i.p) || 0);
    sum += q * p;
    return `• ${clean(i.n, 80)} × ${q} = ${(q * p).toLocaleString("ru-RU")} soʻm`;
  });
  const text =
    `🛒 Yangi buyurtma\n\n${lines.join("\n")}\n\n` +
    `Jami: ${sum.toLocaleString("ru-RU")} soʻm\n\n` +
    `Ism: ${name}\nTelefon: ${phone}\nManzil: ${addr}`;

  try {
    const r = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: CHAT_ID, text }),
    });
    if (!r.ok) throw new Error("telegram");
    return res.status(200).json({ ok: true });
  } catch (e) {
    return res.status(502).json({ ok: false });
  }
};
