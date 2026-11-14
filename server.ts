import 'dotenv/config';
import express from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { GoogleGenAI, Type } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT) || 3000;
const MODEL_NAME = 'gemini-4-hydrogen';

function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured in the server environment.');
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '1mb' }));

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, model: MODEL_NAME, hasKey: Boolean(process.env.GEMINI_API_KEY) });
  });

  app.post('/api/desk/exercises', async (req, res) => {
    try {
      const { profile, recentVoidTags = [], previousTitles = [] } = req.body ?? {};
      if (!profile) {
        return res.status(400).json({ error: 'Missing user profile context.' });
      }

      const ai = getGeminiClient();

      const custom = profile.customAnswers || {};
      const joinWithCustom = (arr: string[] = [], customVal?: string) => {
        const list = [...arr, ...(customVal?.trim() ? [customVal.trim()] : [])];
        return list.join(', ');
      };

      const focusLabel =
        profile.coreFocus === 'Other' && profile.customFocus?.trim()
          ? profile.customFocus.trim()
          : profile.coreFocus || 'Self-Love';

      const prompt = [
        'Generate exactly 3 distinct, gentle, concise daily wellness exercises for post-depression or post-TMS recovery.',
        'Strict tone rules: warm, grounded, minimal words (1 crisp sentence per groundingPrompt), zero toxic positivity, and never wrap text in quotation marks.',
        `User primary focus area: ${focusLabel}`,
        `Hobbies & comforts: ${joinWithCustom(profile.hobbies, custom.hobbies) || 'Quiet rest'}`,
        `Recovery timeline: ${joinWithCustom(profile.recoveryDuration, custom.recoveryDuration) || 'Ongoing'}`,
        `What feels heaviest right now: ${joinWithCustom(profile.heaviestSituations, custom.heaviestSituations) || 'Fatigue'}`,
        `Where they hope to grow: ${joinWithCustom(profile.growthGoals, custom.growthGoals) || 'Self-compassion'}`,
        recentVoidTags.length > 0
          ? `Recent emotional themes logged privately in The Void (adapt gently without repeating verbatim): ${recentVoidTags.join(', ')}`
          : 'No recent Void emotional themes logged yet.',
        previousTitles.length > 0
          ? `Avoid repeating these previous exercise titles: ${previousTitles.join(', ')}`
          : '',
        'Include 2 reflection exercises (each with a short 1-sentence groundingPrompt and a half-sentence sentenceStarter) and 1 two-minute breathing exercise (kind breathing).',
      ]
        .filter(Boolean)
        .join('\n');

      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
        config: {
          systemInstruction:
            'You are Koti, a calm post-depression and post-TMS wellness companion. Keep prompts concise (1 sentence), realistic for low energy, free of toxic positivity, and free of quotation marks.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING, description: 'Short exercise title (3-6 words).' },
                kind: {
                  type: Type.STRING,
                  description: 'Either reflection or breathing.',
                },
                groundingPrompt: {
                  type: Type.STRING,
                  description: '1 warm, grounded sentence guiding the user, without quotation marks.',
                },
                sentenceStarter: {
                  type: Type.STRING,
                  description: 'Half-sentence prompt for reflection exercises, e.g. Today I am allowing myself to...',
                },
                adaptedNote: {
                  type: Type.STRING,
                  description: 'Optional short 2-4 word theme label if adapted from recent Void tags.',
                },
              },
              required: ['title', 'kind', 'groundingPrompt'],
            },
          },
        },
      });

      const raw = (response.text ?? '[]').trim();
      const parsed = JSON.parse(raw) as Array<{
        title: string;
        kind: string;
        groundingPrompt: string;
        sentenceStarter?: string;
        adaptedNote?: string;
      }>;

      const stripQuotes = (val: string) => val.replace(/["“”]/g, '').trim();

      const exercises = parsed.slice(0, 3).map((item, idx) => {
        const isBreathing = item.kind === 'breathing';
        return {
          id: `gemini-ex-${Date.now()}-${idx}`,
          title: stripQuotes(item.title),
          focus: profile.coreFocus || 'Self-Love',
          kind: isBreathing ? 'breathing' : 'reflection',
          groundingPrompt: stripQuotes(item.groundingPrompt),
          sentenceStarter: isBreathing
            ? undefined
            : stripQuotes(
                item.sentenceStarter || 'Right now, one small thing I notice is...'
              ),
          breathingPattern: isBreathing
            ? { inhaleSec: 4, holdSec: 4, exhaleSec: 6, durationSec: 120 }
            : undefined,
          completed: false,
          adaptedFromTag:
            idx === 0 && recentVoidTags.length > 0
              ? recentVoidTags[0]
              : item.adaptedNote
                ? stripQuotes(item.adaptedNote)
                : undefined,
        };
      });

      if (exercises.length === 0) {
        throw new Error('Gemini returned an empty exercise list.');
      }

      return res.json({ exercises, source: 'gemini' });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate personalized exercises.';
      console.error('[/api/desk/exercises] Error:', message);
      return res.status(502).json({ error: message });
    }
  });

  app.post('/api/void/release', async (req, res) => {
    try {
      const { text, profile } = req.body ?? {};
      if (!text || typeof text !== 'string' || !text.trim()) {
        return res.status(400).json({ error: 'Please share a thought or feeling before releasing it.' });
      }

      const ai = getGeminiClient();

      const focusContext = profile
        ? profile.coreFocus === 'Other' && profile.customFocus?.trim()
          ? profile.customFocus.trim()
          : profile.coreFocus
        : '';

      const prompt = [
        'A user inside Koti (The Void, a Kintsugi emotional release space) shared these raw thoughts:',
        text.trim(),
        profile
          ? `Context: Focus=${focusContext}, Heavy areas=${(profile.heaviestSituations || []).join(', ')}`
          : '',
        'Respond with three fields, with NO quotation marks anywhere in your output:',
        '1) empathy: 1-2 short, warm, grounded sentences validating the exact emotions they shared. Zero toxic positivity or clichés.',
        '2) affirmation: Strictly 1 short, sweet, believable first-person sentence (3 to 8 words) directly related to what they wrote, such as I am loved., I am abundant., I trust myself., or I am safe to rest.',
        '3) emotionalTag: Concise 2-4 word theme (e.g., Nighttime overthinking, Post-TMS exhaustion, Lonely heaviness).',
      ]
        .filter(Boolean)
        .join('\n');

      const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
        config: {
          systemInstruction:
            'You are the quiet companion inside The Void of Koti. Validate pain concisely and honestly without hollow clichés. Keep affirmations to 1 short sweet sentence related to their words. Never include quotation marks.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              empathy: { type: Type.STRING },
              affirmation: { type: Type.STRING },
              emotionalTag: { type: Type.STRING },
            },
            required: ['empathy', 'affirmation', 'emotionalTag'],
          },
        },
      });

      const raw = (response.text ?? '{}').trim();
      const parsed = JSON.parse(raw) as {
        empathy?: string;
        affirmation?: string;
        emotionalTag?: string;
      };

      if (!parsed.empathy || !parsed.affirmation || !parsed.emotionalTag) {
        throw new Error('Incomplete response from Gemini.');
      }

      const stripQuotes = (val: string) => val.replace(/["“”]/g, '').trim();

      return res.json({
        empathy: stripQuotes(parsed.empathy),
        affirmation: stripQuotes(parsed.affirmation),
        emotionalTag: stripQuotes(parsed.emotionalTag),
        source: 'gemini',
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to reach The Void companion right now.';
      console.error('[/api/void/release] Error:', message);
      return res.status(502).json({ error: message });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      const indexHtml = path.join(distDir, 'index.html');
      if (fs.existsSync(indexHtml)) {
        res.sendFile(indexHtml);
      } else {
        res.status(404).send('Build output not found.');
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Koti server listening on http://localhost:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start Koti server:', err);
  process.exit(1);
});
