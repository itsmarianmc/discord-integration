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

    const { commentText, email, name } = req.body;

    // Validierung der Eingabedaten
    if (!commentText || !name || commentText.length < 20) {
        return res.status(400).json({ error: 'Missing or invalid fields' });
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return res.status(400).json({ error: 'Invalid email address' });
    }

    const webhookUrl = process.env.DISCORD_WEBHOOK_URL_COMMENT;

    const payload = {
        content: `📢 **New comment submitted!**\n\n📝 **Comment:** ${commentText}\n📧 **Email:** ${email || 'No email provided'}\n👤 **Name:** ${name}`
    };

    try {
        const response = await fetch(webhookUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorDetails = await response.text(); // Detaillierte Fehlerantwort vom Webhook
            console.error('Webhook Error:', errorDetails);
            return res.status(500).json({ error: 'Webhook error', details: errorDetails });
        }

        return res.status(200).json({ success: true });
    } catch (err) {
        console.error('Unexpected error:', err);
        return res.status(500).json({ error: 'Unexpected error', details: err.message });
    }
}