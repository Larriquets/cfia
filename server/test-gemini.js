import 'dotenv/config';
import { GoogleGenAI } from '@google/genai';

const MODELS = ['gemini-2.5-flash-lite', 'gemini-2.5-flash', 'gemini-2.5-pro'];

const SYSTEM = 'Devolvés SIEMPRE un único objeto JSON válido, sin markdown, con esta forma: { "titulo": "string", "cuerpo": "string" }.';
const USER = 'Escribí un micro-cuento de 2 frases sobre una radio vieja en Marte.';

async function run() {
  if (!process.env.GEMINI_API_KEY) {
    console.error('✗ Falta GEMINI_API_KEY en .env');
    process.exit(1);
  }
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  console.log('✓ GEMINI_API_KEY cargada (len=%d)', process.env.GEMINI_API_KEY.length);
  console.log();

  for (const model of MODELS) {
    console.log(`── ${model} ──`);
    try {
      const t0 = Date.now();
      const resp = await ai.models.generateContent({
        model,
        contents: USER,
        config: {
          systemInstruction: SYSTEM,
          temperature: 0.9,
          maxOutputTokens: 1024,
          responseMimeType: 'application/json',
        },
      });
      const ms = Date.now() - t0;

      const textProp = resp?.text;
      const textKind = typeof textProp;
      let text = '';
      if (textKind === 'string') text = textProp;
      else if (textKind === 'function') { try { text = textProp.call(resp) || ''; } catch {} }

      const cand = resp?.candidates?.[0];
      const partsText = (cand?.content?.parts || []).map((p) => p?.text || '').join('');
      const finalText = text.trim() || partsText.trim();

      console.log(`  ok  (${ms}ms)  finishReason=${cand?.finishReason}  text=<${textKind}>  parts=${partsText.length}ch`);
      console.log('  →', finalText.slice(0, 200).replace(/\n/g, ' '));
      try {
        const parsed = JSON.parse(finalText.slice(finalText.indexOf('{'), finalText.lastIndexOf('}') + 1));
        console.log('  JSON ok · keys:', Object.keys(parsed));
      } catch (e) {
        console.log('  JSON parse falló:', e.message);
      }
    } catch (e) {
      console.log('  ✗', e?.status || '', e?.message || String(e));
    }
    console.log();
  }
}

run().catch((e) => { console.error('FATAL', e); process.exit(1); });
