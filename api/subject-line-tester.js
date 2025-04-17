// pages/api/subject-line-tester.js
export default async function handler(req, res) {
  // ——— CORS HEADERS ———
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  // ——————————————

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { subject, tone = 'default' } = req.body;

  if (!subject || subject.trim().length === 0) {
    return res.status(400).json({ error: 'Subject line is required' });
  }

  const prompt = `
You are a B2B email marketing expert who evaluates subject lines for cold emails. You assess based on 4 core attributes: 
1. Clarity – Is the subject clear and easy to understand?
2. Curiosity – Does it spark interest?
3. Personalization – Could it feel unique to the reader?
4. Spam Risk – Does it trigger filters or look like mass spam?

You return a detailed analysis with scores from 1 to 10 for each category. Then, you calculate a total score out of 100 (by summing the 4 scores and multiplying by 2.5). You give expert feedback, then rewrite the subject line in 3 better variations with different tones or angles. If a tone is requested, use it for the rewrites.

Use this format exactly:
---
Subject Line Score: [total_score]/100

* Clarity: X/10  
* Curiosity: X/10  
* Personalization: X/10  
* Spam Risk: X/10  

Feedback:  
[Feedback here]

Suggested Alternatives:
1. [Alt 1]
2. [Alt 2]
3. [Alt 3]

Keep subject lines under 10 words and avoid salesy phrases.

Evaluate this cold email subject line:  
"${subject}"

Tone to apply for rewrites: ${tone}
`;

  try {
    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7
      })
    });

    const data = await openaiRes.json();
    const analysis = data.choices?.[0]?.message?.content?.trim();

    if (!analysis) {
      return res.status(500).json({ error: 'Failed to generate analysis.' });
    }

    return res.status(200).json({ analysis });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Internal Server Error' });
  }
}
