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

  const { subject } = req.body;

  if (!subject || subject.trim().length === 0) {
    return res.status(400).json({ error: 'Subject line is required' });
  }

  const prompt = `
You are a B2B cold email expert and subject line strategist.

Your job is to evaluate and improve subject lines used in cold outreach campaigns.

Score the subject line using 4 key attributes. Each is rated out of 25 (total: 100):

1. Clarity – Is it immediately understandable?
2. Curiosity – Does it spark enough interest to open?
3. Personalization Potential – Could it be tailored to the recipient's role, company, or industry?
4. Spam Risk – Does it avoid spammy keywords, formatting, or clickbait?

👉 Add up the 4 scores to give a total out of 100.  
Do not use decimal values or multipliers. Just sum the 4 categories.

Then provide quick expert feedback (1–3 lines): what's good, what can be better.

Finally, rewrite the subject line into 3 better alternatives that follow these rules:
- 2 to 3 words only (max 4 if absolutely needed)
- Feel like natural curiosity triggers or insights
- No salesy buzzwords or fake urgency
- Take inspiration from formats like:
  • "Automate Outreach?"
  • "30% More Replies?"
  • "Sendlane's Secret"
  • "Lead Gen Struggle?"
  • "Time-Saving Trick?"

---

Use this format exactly:

Subject Line Score: [total_score]/100

* Clarity: X/25  
* Curiosity: X/25  
* Personalization: X/25  
* Spam Risk: X/25  

Feedback:  
[Your analysis here.]

Suggested Alternatives:
1. [Alt 1]
2. [Alt 2]
3. [Alt 3]

Now analyze this cold email subject line:  
"${subject}"
`;

  try {
    const openaiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini-2024-07-18',
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
