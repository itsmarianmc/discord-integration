export default async function handler(req, res) {
    // ✅ CORS-Header setzen
    res.setHeader('Access-Control-Allow-Origin', '*'); // oder z.B. 'http://localhost:5500'
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

    const { commentText, username, email } = req.body;

    // Validierung der Pflichtfelder: commentText (mind. 20 Zeichen) und username
    if (!commentText || commentText.trim().length < 20 || !username) {
        return res.status(400).json({ error: 'Missing fields: Kommentartext (min. 20 Zeichen) und Name sind erforderlich.' });
    }

    // Falls eine Email angegeben wurde, diese validieren
    if (email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Invalid email format' });
        }
    }

    // Verwende hier deinen Discord-Webhook (Passe den Environment-Variable-Key ggf. an)
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL_COMMENT;

    const payload = {
        content: `📢 **New Comment!**\n\n📝 **Comment:** ${commentText}\n👤 **Username:** ${username}` + 
                 (email ? `\n📧 **Email:** ${email}` : '')
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