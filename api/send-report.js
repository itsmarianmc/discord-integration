export default async function handler(req, res) {
    // ✅ CORS-Header setzen
    res.setHeader('Access-Control-Allow-Origin', '*'); // Oder z.B. 'http://localhost:5500'
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // ✅ OPTIONS-Anfragen (Preflight) beantworten
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    // ✅ Nur POST erlauben
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { complaintText, email } = req.body;

    if (!complaintText || !email) {
        return res.status(400).json({ error: 'Missing fields' });
    }

    const webhookUrl = process.env.DISCORD_WEBHOOK_URL_REPORT;

    const payload = {
        content: `📢 **New notification!**\n\n📝 **Message of user:** ${complaintText}\n📧 **Email of user:** ${email}`
    };

    try {
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        if (response.ok) {
            return res.status(200).json({ success: true });
        } else {
            return res.status(500).json({ error: 'Webhook error' });
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: 'Unexpected error' });
    }
}
