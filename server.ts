import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));

// Server-side Gemini client
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({
  apiKey,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// API: Generate complete 3-workshop learning journey from any story/person/event
app.post('/api/generate-journey', async (req, res) => {
  try {
    const { topic, gradeLevel = 'Middle School (Ages 10-14)', language = 'English', context = 'Classroom with 40-70 students, 1 phone per group of 8' } = req.body;

    if (!topic || typeof topic !== 'string') {
      return res.status(400).json({ error: 'Topic or story title is required' });
    }

    if (!apiKey) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is not configured on the server' });
    }

    const prompt = `You are a master West African Griot and innovative pedagogical director for "LeGriot".
Create an interdisciplinary interactive learning journey for a large classroom (40-70 students) where students work in small groups of 8 with only ONE smartphone per group, rotating across THREE distinct workshops during the day.

Topic/Story/Person/Event: "${topic}"
Target Grade/Age: ${gradeLevel}
Language: ${language}
Classroom constraints: ${context}

The 3 workshops MUST connect this single story to distinct disciplines:
1. Geometry & Spatial Logic / Architectural Math (hands-on with sticks, slates, compass, geometric patterns, angles, or scaling)
2. Language, Writing & Oral Debate (analyzing proverbs, drafting an ancient decree, speechwriting, or ethical debate)
3. Geography, History & Living World / Ecology (mapping trade/migration routes, river basin hydrology, seasonal ecology, or social structures)

Provide a rich JSON response strictly following this structure:
{
  "id": "generated-${Date.now()}",
  "title": "Inspiring Title",
  "subtitle": "Short captivating hook (1 sentence)",
  "culture": "Region / Cultural context (e.g. Ancient Mali, Hausaland, Swahili Coast, Nile Valley, etc.)",
  "period": "Historical era or century",
  "theme": "Core theme (e.g. Resilience, Sustainable Architecture, Collective Wisdom)",
  "icon": "One of: Castle, BookOpen, Compass, Ruler, Sun, Feather, TreePine, Flame, Mountain",
  "griotPrologue": "Rich, poetic oral story opening (2-3 paragraphs) that can be read aloud or listened to by the group. It sets the scene, introduces the problem/hero, and ends with a cliffhanger or mystery.",
  "coreQuestion": "The central question the whole class must resolve together by the end of the 3 workshops",
  "materialsNeeded": "Simple low-cost items (e.g. Slate, chalk, 8 equal sticks or twigs, string, ruler)",
  "workshops": [
    {
      "id": "workshop-geometry",
      "title": "Workshop 1: Geometry & Architectural Logic Title",
      "subject": "Geometry & Measurement",
      "curriculumConnection": "Standard geometry concept (e.g. Triangles, Perimeters, Arches, Ratios)",
      "contextStory": "Short narrative linking the main story to this mathematical/geometric challenge",
      "handsOnChallenge": "Clear physical action using slates, chalk or sticks (e.g. 'Use 6 equal sticks to construct...')",
      "interactiveSteps": [
        "Step 1: Observation prompt for the 8 students",
        "Step 2: Measurement or calculation puzzle",
        "Step 3: Verification with the group"
      ],
      "groupQuestion": "The primary question the group must discuss and agree upon",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctOptionIndex": 1,
      "explanation": "Why this is correct, explaining both the math and the story context",
      "hints": [
        "Hint 1: Gentle nudge about the geometry/principle",
        "Hint 2: Deeper formula or clue",
        "Griot's Secret: The key wisdom to unlock the answer"
      ],
      "teacherGuideNote": "Quick observation cue for the teacher when walking past this group (e.g. 'Check if students are measuring from the center')"
    },
    {
      "id": "workshop-writing",
      "title": "Workshop 2: Language, Writing & Oral Debate Title",
      "subject": "Writing & Oral Debate",
      "curriculumConnection": "Rhetoric, proverb analysis, argumentative writing, or dramatic dialogue",
      "contextStory": "Short narrative linking the main story to a speech, proverb or diplomatic conflict",
      "handsOnChallenge": "Writing and speech exercise for the Scribe and Orator",
      "interactiveSteps": [
        "Step 1: Read and decipher the ancient proverb or speech",
        "Step 2: Each student shares one argument in the circle",
        "Step 3: Scribe records the group's consensus decree"
      ],
      "groupQuestion": "The dilemma or writing challenge for the group",
      "options": ["Choice A: Principled stance", "Choice B: Pragmatic stance", "Choice C: Traditional stance", "Choice D: Innovative synthesis"],
      "correctOptionIndex": 3,
      "explanation": "Deeper reflection on rhetoric and collective wisdom",
      "hints": [
        "Hint 1: Consider the long-term impact on the community",
        "Hint 2: How would an ancient Griot frame this argument?",
        "Griot's Secret: Words once spoken cannot be unsaid; balance strength with mercy"
      ],
      "teacherGuideNote": "Listen to whether all 8 voices spoke before the Scribe writes."
    },
    {
      "id": "workshop-geography",
      "title": "Workshop 3: Geography, History & Living World Title",
      "subject": "Geography & History",
      "curriculumConnection": "Trade routes, physical topography, climate adaptation, or historical timelines",
      "contextStory": "Short narrative connecting the story to land, navigation, river ecosystems, or trade",
      "handsOnChallenge": "Mapping or timeline puzzle on slates",
      "interactiveSteps": [
        "Step 1: Identify the geographical landmarks (river bend, desert oasis, mountain pass)",
        "Step 2: Trace the resource supply chain (salt, gold, grain, clay)",
        "Step 3: Solve the environmental or logistical riddle"
      ],
      "groupQuestion": "The strategic geographical or historical decision question",
      "options": ["Route/Strategy 1", "Route/Strategy 2", "Route/Strategy 3", "Route/Strategy 4"],
      "correctOptionIndex": 0,
      "explanation": "Historical and geographical reality explanation",
      "hints": [
        "Hint 1: Look at the seasonal flood patterns of the river",
        "Hint 2: Consider water sources for caravans",
        "Griot's Secret: The land dictates the journey; follow the ancient trade winds"
      ],
      "teacherGuideNote": "Check if the group has drawn the compass rose and key landmarks."
    }
  ],
  "plenaryCouncil": {
    "title": "The Grand Council of the Baobab (Plenary Assembly)",
    "description": "How the 3 workshops combine into one grand revelation for the whole classroom",
    "finalChallengePrompt": "Synthesis question where the Orator of each group presents their workshop's discovery to answer the central mystery."
  }
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.7,
      },
    });

    const responseText = response.text || '{}';
    const parsedData = JSON.parse(responseText);

    res.json(parsedData);
  } catch (error: any) {
    console.error('Error generating journey:', error);
    res.status(500).json({
      error: 'Failed to generate learning journey',
      details: error.message || String(error),
    });
  }
});

// API: Griot Audio Narration using Gemini TTS
app.post('/api/griot-narrate', async (req, res) => {
  try {
    const { text, voice = 'Puck' } = req.body;

    if (!text || typeof text !== 'string') {
      return res.status(400).json({ error: 'Text to narrate is required' });
    }

    if (!apiKey) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is not configured on the server' });
    }

    // Call Gemini 3.8 Flash Lite TTS
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: text.slice(0, 1500), // Trim for optimal speech delivery
              speechMetadata: {
                style: 'Authentic African oral storyteller with a distinct natural African accent, warm rhythmic cadence, clear and reassuring for children learning around a classroom desk',
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voice || 'Puck' },
          },
        },
      },
    });

    const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;

    if (!base64Audio) {
      return res.status(500).json({ error: 'No audio returned from Gemini TTS' });
    }

    res.json({
      audioBase64: base64Audio,
      mimeType: 'audio/pcm;rate=24000',
    });
  } catch (error: any) {
    console.error('Error synthesizing speech:', error);
    res.status(500).json({
      error: 'Failed to generate voice narration',
      details: error.message || String(error),
    });
  }
});

// API: Ask the Griot for guidance (in-character hint or answer)
app.post('/api/ask-griot', async (req, res) => {
  try {
    const { question, workshopTitle, storyTitle, currentStep } = req.body;

    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }

    if (!apiKey) {
      return res.status(500).json({ error: 'GEMINI_API_KEY is not configured' });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `You are the village Griot guiding a small circle of 8 young students who are huddled around a single smartphone in a busy classroom.
Current Journey: "${storyTitle || 'The Tale of Old Mali'}"
Current Workshop: "${workshopTitle || 'Hands-on Challenge'}"
Step: "${currentStep || 'Group Discussion'}"

Students' question or struggle: "${question}"

Provide a warm, inspiring 2-3 sentence response in the voice of an authentic Griot.
Include a subtle riddle or hint that encourages them to cooperate, look at their slate, or measure again together. Never just give away the raw answer; empower them to solve it as a team.`,
      config: {
        systemInstruction: 'You are an elder African Griot: wise, poetic, encouraging, speaking clearly to young learners.',
        temperature: 0.8,
      },
    });

    res.json({ answer: response.text });
  } catch (error: any) {
    console.error('Error asking griot:', error);
    res.status(500).json({ error: 'Griot is silent right now', details: error.message });
  }
});

// Dev vs Prod Vite mounting
if (process.env.NODE_ENV !== 'production') {
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  // Locate built static files whether running root server.ts or bundled dist/server.js
  const clientDistPath = fs.existsSync(path.join(__dirname, 'dist', 'index.html'))
    ? path.join(__dirname, 'dist')
    : fs.existsSync(path.join(__dirname, 'index.html'))
    ? __dirname
    : path.join(__dirname, 'dist');

  console.log(`Serving static production files from: ${clientDistPath}`);
  app.use(express.static(clientDistPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`LeGriot server running on port ${PORT}`);
});
