import 'dotenv/config';

const apiKey = process.env.OPENAI_API_KEY;

export async function chat({ messages, model = 'gpt-4o', responseFormat = null, temperature = 0.8 }) {
  if (!apiKey) throw new Error('OPENAI_API_KEY missing');
  const body = { model, messages, temperature };
  if (responseFormat) body.response_format = responseFormat;

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(`OpenAI chat error: ${JSON.stringify(data)}`);
  return data.choices[0].message.content;
}

export async function generateImage({ prompt, size = '1024x1536', model = 'gpt-image-2' }) {
  if (!apiKey) throw new Error('OPENAI_API_KEY missing');
  const res = await fetch('https://api.openai.com/v1/images/generations', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, prompt, size, n: 1 }),
  });
  const data = await res.json();
  if (!data.data) throw new Error(`Image generation failed: ${JSON.stringify(data)}`);
  return Buffer.from(data.data[0].b64_json, 'base64');
}
