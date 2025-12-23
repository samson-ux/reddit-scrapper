module.exports = async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { topic, goal } = req.body || {};

    if (!topic) {
        return res.status(400).json({ error: 'Topic is required' });
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;

    if (!apiKey) {
        return res.status(500).json({ 
            error: 'API key not configured' 
        });
    }

    const prompt = `Generate Reddit search tags for "${topic}" (goal: "${goal || 'general research'}").

Return 12-15 SIMPLE tags. Each tag should be 1-2 words MAX. No phrases.

Examples of GOOD tags: UFC, knockout, Jon Jones, title fight, GOAT, weight cut
Examples of BAD tags: "Jon Jones heavyweight championship", "Islam Makhachev dominance"

Also list 4-6 popular subreddits.

JSON only:
{"tags":["tag1","tag2",...],"subreddits":["sub1","sub2",...]}`;

    try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': apiKey,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: 'claude-sonnet-4-20250514',
                max_tokens: 1500,
                messages: [{ role: 'user', content: prompt }]
            })
        });

        const data = await response.json();

        if (!response.ok) {
            return res.status(response.status).json({ 
                error: data.error?.message || 'API request failed' 
            });
        }

        const text = data.content[0].text;
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        
        if (!jsonMatch) {
            return res.status(500).json({ error: 'Could not parse AI response' });
        }

        const result = JSON.parse(jsonMatch[0]);
        return res.status(200).json(result);

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
};
