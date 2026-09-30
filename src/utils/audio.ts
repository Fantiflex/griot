// Web Audio API Sound Synthesizer & Authentic African Accent Speech Engine for LeGriot
let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// Low resonance Djembe bass beat
export function playDjembeBass(freq: number = 70, duration: number = 0.5) {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(35, ctx.currentTime + duration);

    gain.gain.setValueAtTime(0.7, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (err) {
    console.warn('Audio play error:', err);
  }
}

// Sharp Djembe rim slap
export function playDjembeSlap() {
  try {
    const ctx = getAudioContext();
    const osc = ctx.createOscillator();
    const filter = ctx.createBiquadFilter();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(320, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 0.15);

    filter.type = 'bandpass';
    filter.frequency.value = 850;
    filter.Q.value = 2.5;

    gain.gain.setValueAtTime(0.45, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  } catch (err) {
    console.warn('Audio play error:', err);
  }
}

// Classroom Rotation Drum Call
export function playRotationCall() {
  try {
    const rhythm = [
      { type: 'bass', delay: 0 },
      { type: 'bass', delay: 200 },
      { type: 'slap', delay: 400 },
      { type: 'slap', delay: 550 },
      { type: 'bass', delay: 700 },
      { type: 'slap', delay: 900 },
      { type: 'slap', delay: 1050 },
      { type: 'bass', delay: 1300 },
    ];

    rhythm.forEach(({ type, delay }) => {
      setTimeout(() => {
        if (type === 'bass') playDjembeBass(75, 0.45);
        else playDjembeSlap();
      }, delay);
    });
  } catch (err) {
    console.warn('Rotation call error:', err);
  }
}

// Fanfare when a group solves a puzzle
export function playCelebration() {
  try {
    const ctx = getAudioContext();
    const notes = [261.63, 329.63, 392.0, 523.25, 659.25]; // C, E, G, C, E
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        gain.gain.setValueAtTime(0.25, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      }, idx * 90);
    });
    setTimeout(() => playDjembeBass(65, 0.6), 400);
  } catch (err) {
    console.warn('Celebration audio error:', err);
  }
}

// Play raw PCM audio returned by TTS
export async function playPcmAudio(base64Data: string, sampleRate = 24000): Promise<void> {
  const ctx = getAudioContext();
  const binaryString = window.atob(base64Data);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  const int16 = new Int16Array(bytes.buffer);
  const audioBuffer = ctx.createBuffer(1, int16.length, sampleRate);
  const channelData = audioBuffer.getChannelData(0);
  for (let i = 0; i < int16.length; i++) {
    channelData[i] = int16[i] / 32768.0;
  }
  const source = ctx.createBufferSource();
  source.buffer = audioBuffer;
  source.connect(ctx.destination);
  source.start();
  return new Promise((resolve) => {
    source.onended = () => resolve();
  });
}

// Supported African Accent Dialects
export type AfricanAccentDialect = 
  | 'west-african'      // Nigerian / Ghanaian / Cameroonian English
  | 'east-african'      // Kenyan / Tanzanian / Ugandan English
  | 'southern-african'  // South African / Zimbabwean English
  | 'franco-african';   // Senegalese / Ivorian / Cameroonian French

export interface AccentProfile {
  id: AfricanAccentDialect;
  name: string;
  region: string;
  sampleGreeting: string;
  locales: string[];
  keywords: string[];
}

export const AFRICAN_ACCENT_PROFILES: AccentProfile[] = [
  {
    id: 'west-african',
    name: 'West African English',
    region: 'Nigeria, Ghana, Cameroon',
    sampleGreeting: "Greetings my children! I am right here at your table. Let us discover the geometry together.",
    locales: ['en-NG', 'en-GH', 'en-CM', 'pcm', 'en_NG', 'en_GH'],
    keywords: ['nigeria', 'ghana', 'ezinne', 'wande', 'kofi', 'kwame', 'amara', 'lagos', 'accra'],
  },
  {
    id: 'east-african',
    name: 'East African English',
    region: 'Kenya, Tanzania, Uganda',
    sampleGreeting: "Habari students! Look closely at the pattern on the table. Every shape has a story.",
    locales: ['en-KE', 'en-TZ', 'en-UG', 'sw-KE', 'sw-TZ'],
    keywords: ['kenya', 'tanzania', 'uganda', 'swahili', 'nairobi', 'zulu'],
  },
  {
    id: 'southern-african',
    name: 'Southern African English',
    region: 'South Africa, Zimbabwe',
    sampleGreeting: "Dumelang! Gather around the paper, Table 4. Let us trace these lines with care.",
    locales: ['en-ZA', 'en-ZW', 'en_ZA'],
    keywords: ['south africa', 'ayanda', 'thando', 'sizwe', 'leah', 'joburg'],
  },
  {
    id: 'franco-african',
    name: 'Franco-African Oral',
    region: 'Sénégal, Côte d\'Ivoire, Cameroun',
    sampleGreeting: "Bonjour les enfants! Observez bien ce pagne royal. Les lignes parallèles avancent ensemble.",
    locales: ['fr-SN', 'fr-CM', 'fr-CI', 'fr-GA', 'fr_SN', 'fr_CM'],
    keywords: ['senegal', 'dakar', 'abidjan', 'cameroun', 'adama', 'fatou'],
  },
];

let selectedDialect: AfricanAccentDialect = 'west-african';

export function setSelectedAfricanDialect(dialect: AfricanAccentDialect) {
  selectedDialect = dialect;
}

export function getSelectedAfricanDialect(): AfricanAccentDialect {
  return selectedDialect;
}

// Find best matching African-accent voice in browser speech synthesis
export function findAfricanAccentVoice(dialect?: AfricanAccentDialect): { voice: SpeechSynthesisVoice | null; isNativeAfrican: boolean; label: string } {
  if (!('speechSynthesis' in window)) return { voice: null, isNativeAfrican: false, label: 'Speech not supported' };
  
  const voices = window.speechSynthesis.getVoices();
  const targetDialect = dialect || selectedDialect;
  const profile = AFRICAN_ACCENT_PROFILES.find(p => p.id === targetDialect) || AFRICAN_ACCENT_PROFILES[0];

  // 1. Look for explicit target dialect locales
  const dialectMatch = voices.find(v => 
    profile.locales.some(loc => v.lang.toLowerCase().replace('_', '-').includes(loc.toLowerCase()))
  );
  if (dialectMatch) {
    return { voice: dialectMatch, isNativeAfrican: true, label: `${dialectMatch.name} (${dialectMatch.lang})` };
  }

  // 2. Look for name matches containing dialect keywords
  const keywordMatch = voices.find(v => 
    profile.keywords.some(kw => v.name.toLowerCase().includes(kw))
  );
  if (keywordMatch) {
    return { voice: keywordMatch, isNativeAfrican: true, label: `${keywordMatch.name} (African dataset)` };
  }

  // 3. Fallback to ANY African locale in browser
  const anyAfricanLocales = ['en-ng', 'en-za', 'en-gh', 'en-ke', 'fr-sn', 'fr-cm', 'fr-ci', 'sw'];
  const genericAfricanMatch = voices.find(v => 
    anyAfricanLocales.some(loc => v.lang.toLowerCase().replace('_', '-').includes(loc))
  );
  if (genericAfricanMatch) {
    return { voice: genericAfricanMatch, isNativeAfrican: true, label: `${genericAfricanMatch.name} (${genericAfricanMatch.lang})` };
  }

  // 4. Fallback to deep, warm natural voices with African storytelling cadence parameters
  const warmMatch = voices.find(v => 
    (v.name.includes('Natural') || v.name.includes('Deep') || v.name.includes('Guy') || v.name.includes('George') || v.name.includes('Male')) && 
    (v.lang.startsWith('en') || v.lang.startsWith('fr'))
  );
  if (warmMatch) {
    return { voice: warmMatch, isNativeAfrican: false, label: `${warmMatch.name} (Tuned with African oral prosody)` };
  }

  const defaultVoice = voices.find(v => v.lang.startsWith('en')) || voices[0] || null;
  return { voice: defaultVoice, isNativeAfrican: false, label: defaultVoice ? `${defaultVoice.name} (Tuned with African oral prosody)` : 'Default' };
}

// Convert text into African oral storytelling rhythm (natural pauses, warm vocal emphasis)
function formatForAfricanOralDelivery(text: string): string {
  let cleaned = text.replace(/[*_~`#]/g, '');
  // Insert slight micro-pauses after key oral transition words
  cleaned = cleaned.replace(/\b(Listen|Look|Observe|Notice|Remember|Now|Table 4|My students)\b/gi, '$1,');
  // Clean double commas
  cleaned = cleaned.replace(/,\s*,/g, ',');
  return cleaned;
}

// Speech synthesis with African storytelling prosody and cadence
export function speakWithWebSpeech(
  text: string, 
  onEnd?: () => void,
  dialect?: AfricanAccentDialect
): () => void {
  if (!('speechSynthesis' in window)) {
    console.warn('Speech synthesis not supported');
    onEnd?.();
    return () => {};
  }

  window.speechSynthesis.cancel();
  
  const speechText = formatForAfricanOralDelivery(text);
  const utterance = new SpeechSynthesisUtterance(speechText);
  
  // African oral storytelling prosody:
  // - Unhurried, rhythmic, syllable-timed cadence (rate 0.86 - 0.88)
  // - Warm, grounded chest resonance pitch (0.91)
  utterance.rate = 0.87;
  utterance.pitch = 0.91;
  utterance.volume = 1.0;

  const { voice, isNativeAfrican } = findAfricanAccentVoice(dialect);
  if (voice) {
    utterance.voice = voice;
    // If native African voice, rate can be slightly more conversational
    if (isNativeAfrican) {
      utterance.rate = 0.92;
      utterance.pitch = 0.94;
    }
  }

  utterance.onend = () => onEnd?.();
  utterance.onerror = () => onEnd?.();

  window.speechSynthesis.speak(utterance);

  return () => {
    window.speechSynthesis.cancel();
  };
}

// High-level instructor speech: Tries server Gemini TTS configured with authentic African storyteller style first, falls back to Web Speech
export async function speakInstructorDialogue(
  text: string,
  onStart?: () => void,
  onEnd?: () => void,
  dialect?: AfricanAccentDialect
): Promise<() => void> {
  onStart?.();

  // Try calling server-side Gemini TTS configured with authentic African storyteller style
  try {
    const res = await fetch('/api/griot-narrate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text,
        voice: 'Puck',
        dialect: dialect || selectedDialect,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.audioBase64) {
        let isCancelled = false;
        playPcmAudio(data.audioBase64, 24000).then(() => {
          if (!isCancelled) onEnd?.();
        });
        return () => {
          isCancelled = true;
        };
      }
    }
  } catch (e) {
    // Graceful fallback to client-side African speech synthesis
  }

  // Fallback to client-side speech synthesis with African prosody
  return speakWithWebSpeech(text, onEnd, dialect);
}
