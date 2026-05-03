const Groq = require('groq-sdk');

const MODEL = 'llama-3.3-70b-versatile';

const callGroq = async (userMessage, systemPrompt, history = [], requireJson = false) => {
  const key = process.env.GROQ_API_KEY;
  if (!key || key.startsWith('PASTE_YOUR') || key === 'your_groq_api_key') {
    throw Object.assign(new Error('Groq API key is not configured. Add your GROQ_API_KEY to server/.env'), { statusCode: 503 });
  }

  const groq = new Groq({ apiKey: key });

  const messages = [
    { role: 'system', content: systemPrompt },
    ...history,
    { role: 'user', content: userMessage },
  ];

  try {
    const options = {
      model: MODEL,
      messages,
      temperature: 0.4,
      max_tokens: 8192,
    };
    
    if (requireJson) {
      // Note: json_object mode removed - causes silent failures with large outputs
      // Robust regex parsing in each controller handles JSON extraction reliably
    }

    const response = await groq.chat.completions.create(options);

    const content = response.choices?.[0]?.message?.content;
    if (!content) throw new Error('Empty response from AI provider');
    return content;
  } catch (err) {
    if (err.status === 401 || err.message?.includes('401') || err.message?.includes('Invalid API Key')) {
      throw Object.assign(new Error('Invalid Groq API key. Get a free key at console.groq.com'), { statusCode: 401 });
    }
    if (err.status === 429 || err.message?.includes('429')) {
      throw Object.assign(new Error('Groq rate limit reached. Please wait a moment and try again.'), { statusCode: 429 });
    }
    throw err;
  }
};

module.exports = { callGroq };
