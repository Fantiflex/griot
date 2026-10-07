import http from 'http';

/**
 * Faux serveur de modèle compatible OpenAI, pour développer et tester sans Ollama ni GPU.
 * Il comprend les trois types de requêtes du Griot (jugement JSON, question libre, résumé)
 * et renvoie des réponses plausibles. Lancer : npm run mock:llm  puis  LLM_BASE_URL=http://localhost:11435/v1
 */

const PORT = Number(process.env.MOCK_LLM_PORT ?? 11435);
const MODEL = process.env.LLM_MODEL ?? 'gemma3:4b';

function lastUserText(messages: { role: string; content: unknown }[]): string {
  const last = [...messages].reverse().find((m) => m.role === 'user');
  if (!last) return '';
  if (typeof last.content === 'string') return last.content;
  if (Array.isArray(last.content)) return last.content.map((p) => (p as { text?: string }).text ?? '').join('\n');
  return '';
}

function isSwahili(messages: { role: string; content: unknown }[]): boolean {
  const sys = messages.find((m) => m.role === 'system');
  return typeof sys?.content === 'string' && sys.content.includes('Kiswahili tu');
}

function answerFor(messages: { role: string; content: unknown }[]): string {
  const user = lastUserText(messages);
  const sw = isSwahili(messages);
  const hasImage = messages.some((m) => Array.isArray(m.content) && m.content.some((p) => (p as { type?: string }).type === 'image_url'));

  if (hasImage) {
    return JSON.stringify({ text: '8', confidence: 0.6, empty: false });
  }
  if (user.includes('Juge cette réponse')) {
    const expected = user.match(/Réponse attendue : (.+)/)?.[1]?.trim();
    const written = user.match(/« (.+?) »/)?.[1]?.trim() ?? '';
    const norm = (s: string) => s.toLowerCase().replace(/\s+/g, ' ').trim();
    const correct = Boolean(expected && norm(written).includes(norm(expected)));
    const last = /Essai numéro (\d+) sur (\d+)/.exec(user);
    const final = last && last[1] === last[2];
    if (correct) {
      return JSON.stringify({
        correct: true,
        partial: false,
        feedback: sw ? 'Hongera! Mmehesabu kwa usahihi, na mmefanya kazi pamoja kama wafanyabiashara wa kweli wa Kilwa.' : 'Bravo ! Vous avez compté juste, et vous l’avez fait ensemble, comme de vrais marchands de Kilwa.',
        hint: '',
      });
    }
    return JSON.stringify({
      correct: false,
      partial: written.length > 0,
      feedback: final
        ? sw ? 'Mmejaribu kwa moyo. Njia ni hii: panga magunia matatu matatu, kisha hesabu vitambaa viwili kwa kila kundi.' : 'Vous avez cherché avec cœur. Voici le chemin : groupez les sacs par trois, puis comptez deux rouleaux par groupe.'
        : sw ? 'Si bado. Kuna kitu sahihi hapa, lakini angalieni uwiano tena.' : 'Pas encore. Il y a une idée juste là-dedans, mais regardez encore la proportion.',
      hint: final ? '' : sw ? 'Mkiwa na magunia matatu, mnapata vitambaa vingapi? Na mara nne?' : 'Avec trois sacs, combien de rouleaux ? Et quatre fois plus ?',
    });
  }
  if (user.includes('L’atelier est terminé')) {
    return sw
      ? 'Mmemaliza safari hii kama mabaharia wa Kilwa: kwa uvumilivu na kwa pamoja. Msemaji, simulia Baraza Kuu jinsi mlivyopima kwa haki.'
      : 'Vous avez fini ce voyage comme les marins de Kilwa : avec patience et ensemble. Orateur, raconte au Grand Conseil comment vous avez mesuré avec justice.';
  }
  return sw
    ? 'Swali zuri, watoto wa mbuyu. Angalieni mawe yenu: mkiyapanga matatu matatu, ubao utawaambia nini?'
    : 'Belle question, enfants du baobab. Regardez vos cailloux : si vous les groupez par trois, que vous dit l’ardoise ?';
}

const server = http.createServer((req, res) => {
  if (req.url?.endsWith('/models')) {
    res.setHeader('Content-Type', 'application/json');
    return res.end(JSON.stringify({ object: 'list', data: [{ id: MODEL, object: 'model' }] }));
  }
  if (req.method === 'POST' && req.url?.endsWith('/chat/completions')) {
    let body = '';
    req.on('data', (c) => (body += c));
    req.on('end', () => {
      let messages: { role: string; content: unknown }[] = [];
      try {
        messages = JSON.parse(body).messages ?? [];
      } catch {
        /* vide */
      }
      const content = answerFor(messages);
      res.setHeader('Content-Type', 'application/json');
      setTimeout(() => {
        res.end(
          JSON.stringify({
            id: 'mock',
            object: 'chat.completion',
            model: MODEL,
            choices: [{ index: 0, message: { role: 'assistant', content }, finish_reason: 'stop' }],
          }),
        );
      }, 400);
    });
    return;
  }
  res.statusCode = 404;
  res.end('not found');
});

server.listen(PORT, () => console.log(`Mock LLM (OpenAI-compatible) sur http://localhost:${PORT}/v1 — modèle ${MODEL}`));
