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

    const prompt = `You are a Reddit research expert. Generate search tags for researching "${topic}" with goal: "${goal || 'general research'}".

Create a flat list of 20-30 highly specific, useful search tags including:
- Key people/figures (current champions, CEOs, influencers, experts) - spell names correctly
- Recent events and news (2024-2025)
- Community slang and jargon
- Hot debates and controversies  
- Common problems and complaints
- Popular products/brands discussed
- Specific subtopics people care about

Also list 6-10 relevant subreddits.

RULES:
- Be SPECIFIC not generic (not "tips" but actual terms like "progressive overload" or "Ilia Topuria")
- Include CURRENT events and figures
- Use terms the community actually uses

Respond with ONLY valid JSON:
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
