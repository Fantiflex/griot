import React, { useEffect, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import type { HealthReport, Lang } from '@shared/types';
import { api } from '@/lib/api';
import { ui } from '@/lib/i18n';
import { Logo } from '@/components/Logo';

export const Home: React.FC<{ navigate: (parts: string[]) => void; lang: Lang; setLang: (l: Lang) => void }> = ({ navigate, lang, setLang }) => {
  const [health, setHealth] = useState<HealthReport | null>(null);

  useEffect(() => {
    api.health().then(setHealth).catch(() => setHealth(null));
  }, []);

  const fr = lang === 'fr';
  const llmOk = Boolean(health && health.llm.reachable && !health.llm.error);

  return (
    <div className="min-h-screen bg-bg text-ink flex flex-col">
      <header className="max-w-5xl w-full mx-auto px-6 h-16 flex items-center justify-between">
        <Logo size={26} accent="var(--color-accent)" />
        <nav className="flex items-center gap-1 text-sm">
          {(['fr', 'sw'] as Lang[]).map((l) => (
            <button key={l} onClick={() => setLang(l)} className={`btn btn-ghost px-3 py-1.5 ${lang === l ? 'text-ink font-semibold' : ''}`}>
              {l === 'fr' ? 'FR' : 'SW'}
            </button>
          ))}
          <button onClick={() => navigate(['pitch'])} className="btn btn-ghost px-3 py-1.5 ml-2">{ui('pitch', lang)}</button>
        </nav>
      </header>

      <main className="flex-1 max-w-5xl w-full mx-auto px-6 pt-20 pb-24">
        <p className="eyebrow">{fr ? 'Un téléphone par table · Modèle ouvert · Support robotisé' : 'Simu moja kwa meza · Modeli huria · Kishikilio cha roboti'}</p>
        <h1 className="mt-5 text-4xl sm:text-6xl font-semibold leading-[1.05] max-w-3xl">{ui('tagline', lang)}</h1>
        <p className="mt-6 text-lg text-ink-2 max-w-2xl leading-relaxed">
          {fr
            ? 'Le Griot raconte, questionne, regarde l’ardoise, lit ce que le groupe a écrit et relance avec un indice. Le modèle est hébergé sur vos serveurs et fine-tuné sur votre charte, vos langues et vos programmes.'
            : 'Griot anasimulia, anauliza, anaangalia ubao, anasoma walichoandika na kuwapa kidokezo. Modeli inahifadhiwa kwenye seva zenu na kurekebishwa kwa mkataba wenu, lugha zenu na mitaala yenu.'}
        </p>

        <div className="mt-10 flex flex-col sm:flex-row gap-3">
          <button onClick={() => navigate(['prof'])} className="btn btn-primary px-5 py-3 text-base">
            {ui('teacherEntry', lang)} <ArrowRight className="w-4 h-4" />
          </button>
          <button onClick={() => navigate(['groupe'])} className="btn btn-outline px-5 py-3 text-base">
            {ui('groupEntry', lang)}
          </button>
        </div>

        <section className="mt-24 grid sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-10 border-t border-line pt-10">
          <Feature n="01" title={fr ? 'Modèle ouvert, chez vous' : 'Modeli huria, kwenu'} body={fr ? 'Gemma 3 auto-hébergé derrière une API standard. Fine-tuning LoRA documenté et reproductible.' : 'Gemma 3 inayojihifadhi nyuma ya API ya kawaida. LoRA imeandikwa na inarudiwa.'} />
          <Feature n="02" title={fr ? 'Il comprend en voyant' : 'Anaelewa kwa kuona'} body={fr ? 'Le support s’incline. La caméra lit l’ardoise dès qu’elle ne bouge plus.' : 'Kishikilio kinainama. Kamera inasoma ubao mara tu unapoacha kusogea.'} />
          <Feature n="03" title={fr ? 'Deux langues, une voix' : 'Lugha mbili, sauti moja'} body={fr ? 'Français et kiswahili. Voix ouverte, fine-tunable, sans dépendance externe.' : 'Kifaransa na Kiswahili. Sauti huria, inayorekebishwa, bila utegemezi wa nje.'} />
          <Feature n="04" title={fr ? 'Charte versionnée' : 'Mkataba uliowekwa'} body={fr ? 'Socratique, inclusif, ancré en Afrique. Le même texte guide le modèle et filtre ses données.' : 'Kisokrati, jumuishi, kilichokita Afrika. Maandishi yale yale yanaongoza modeli na kuchuja data.'} />
        </section>
      </main>

      <footer className="border-t border-line">
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between text-xs text-muted">
          <span>© 2026 LeGriot</span>
          <span className="flex items-center gap-4">
            <Status ok={llmOk} label={health ? (llmOk ? `${ui('llmOk', lang)} · ${health.llm.model}` : ui('llmDown', lang)) : ui('connecting', lang)} />
            {health && <Status ok={health.tts.reachable} label={health.tts.reachable ? ui('ttsOk', lang) : ui('ttsDown', lang)} />}
            {health && <Status ok label={health.perception.mathpix ? 'Mathpix' : fr ? 'Vision' : 'Vision'} />}
          </span>
        </div>
      </footer>
    </div>
  );
};

const Feature: React.FC<{ n: string; title: string; body: string }> = ({ n, title, body }) => (
  <div>
    <div className="font-mono text-xs text-muted">{n}</div>
    <div className="mt-3 font-semibold">{title}</div>
    <p className="mt-1.5 text-sm text-ink-2 leading-relaxed">{body}</p>
  </div>
);

const Status: React.FC<{ ok: boolean; label: string }> = ({ ok, label }) => (
  <span className="inline-flex items-center gap-1.5">
    <span className={`w-1.5 h-1.5 rounded-full ${ok ? 'bg-ok' : 'bg-warn'}`} />
    {label}
  </span>
);
