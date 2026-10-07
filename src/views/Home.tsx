import React, { useEffect, useState } from 'react';
import { Users, Smartphone, Presentation, Cpu, Mic, Camera, ShieldCheck } from 'lucide-react';
import type { HealthReport, Lang } from '@shared/types';
import { api } from '@/lib/api';
import { ui } from '@/lib/i18n';
import { NdopBadgeMotif } from '@/components/NdopMotifSvg';

export const Home: React.FC<{ navigate: (parts: string[]) => void; lang: Lang; setLang: (l: Lang) => void }> = ({ navigate, lang, setLang }) => {
  const [health, setHealth] = useState<HealthReport | null>(null);

  useEffect(() => {
    api.health().then(setHealth).catch(() => setHealth(null));
  }, []);

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-stone-900">
      <header className="max-w-5xl mx-auto px-5 pt-6 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-stone-900 flex items-center justify-center">
            <NdopBadgeMotif size={20} className="text-[#A36B46]" />
          </div>
          <span className="font-serif font-black text-xl tracking-tight">LeGriot</span>
        </div>
        <div className="flex items-center gap-1 text-xs font-bold">
          {(['fr', 'sw'] as Lang[]).map((l) => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={`px-3 py-1.5 rounded-lg transition-colors ${lang === l ? 'bg-stone-900 text-white' : 'text-stone-500 hover:bg-stone-200'}`}
            >
              {l === 'fr' ? 'Français' : 'Kiswahili'}
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-5 pt-14 pb-20">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-[#A36B46] font-bold">
          {lang === 'fr' ? 'Un téléphone par table · IA souveraine · Support robotisé' : 'Simu moja kwa meza · AI huru · Kishikilio cha roboti'}
        </p>
        <h1 className="font-serif font-black text-4xl sm:text-6xl leading-[1.02] mt-3 max-w-3xl">{ui('tagline', lang)}</h1>
        <p className="mt-5 text-stone-600 max-w-2xl leading-relaxed">
          {lang === 'fr'
            ? 'Le Griot raconte, questionne, regarde l’ardoise, lit ce que le groupe a écrit et relance avec un indice. Un modèle à poids ouverts, hébergé sur vos serveurs, fine-tuné sur votre charte, vos langues et vos programmes.'
            : 'Griot anasimulia, anauliza, anaangalia ubao, anasoma walichoandika na kuwapa kidokezo. Modeli huria, inayohifadhiwa kwenye seva zenu, iliyorekebishwa kwa mkataba wenu, lugha zenu na mitaala yenu.'}
        </p>

        <div className="mt-10 grid sm:grid-cols-2 gap-4">
          <button
            onClick={() => navigate(['prof'])}
            className="group text-left p-6 rounded-3xl bg-stone-900 text-white dair-shadow-terracotta hover:-translate-y-0.5 transition-transform"
          >
            <div className="w-11 h-11 rounded-2xl bg-white/10 flex items-center justify-center mb-4">
              <Users className="w-5 h-5 text-[#A36B46]" />
            </div>
            <div className="font-serif font-black text-2xl">{ui('teacherEntry', lang)}</div>
            <div className="text-sm text-stone-300 mt-1.5">
              {lang === 'fr' ? 'Créer la classe, obtenir le code, suivre tous les groupes en direct.' : 'Unda darasa, pata nambari, fuatilia vikundi vyote moja kwa moja.'}
            </div>
          </button>
          <button
            onClick={() => navigate(['groupe'])}
            className="group text-left p-6 rounded-3xl bg-[#A36B46] text-white dair-shadow hover:-translate-y-0.5 transition-transform"
          >
            <div className="w-11 h-11 rounded-2xl bg-white/15 flex items-center justify-center mb-4">
              <Smartphone className="w-5 h-5" />
            </div>
            <div className="font-serif font-black text-2xl">{ui('groupEntry', lang)}</div>
            <div className="text-sm text-white/85 mt-1.5">
              {lang === 'fr' ? 'Entrer le code, poser le téléphone sur le support, laisser le Griot faire cours.' : 'Ingiza nambari, weka simu kwenye kishikilio, mwache Griot afundishe.'}
            </div>
          </button>
        </div>

        <button onClick={() => navigate(['pitch'])} className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-stone-600 hover:text-stone-900">
          <Presentation className="w-4 h-4" /> {ui('pitch', lang)}
        </button>

        <section className="mt-16 grid sm:grid-cols-4 gap-3 text-sm">
          <Feature icon={<Cpu className="w-4 h-4" />} title={lang === 'fr' ? 'Modèle ouvert, chez vous' : 'Modeli huria, kwenu'} body={lang === 'fr' ? 'Gemma 3 auto-hébergé, API compatible OpenAI, fine-tuning LoRA documenté.' : 'Gemma 3 inayojihifadhi, API inayolingana na OpenAI, LoRA imeandikwa.'} />
          <Feature icon={<Camera className="w-4 h-4" />} title={lang === 'fr' ? 'Il comprend en voyant' : 'Anaelewa kwa kuona'} body={lang === 'fr' ? 'Le support s’incline, la caméra lit l’ardoise quand elle ne bouge plus.' : 'Kishikilio kinainama, kamera inasoma ubao ukiacha kusogea.'} />
          <Feature icon={<Mic className="w-4 h-4" />} title={lang === 'fr' ? 'Une voix, des langues' : 'Sauti moja, lugha nyingi'} body={lang === 'fr' ? 'Français et kiswahili aujourd’hui, voix ouverte fine-tunable demain.' : 'Kifaransa na Kiswahili leo, sauti huria inayorekebishwa kesho.'} />
          <Feature icon={<ShieldCheck className="w-4 h-4" />} title={lang === 'fr' ? 'Charte éthique versionnée' : 'Mkataba wa maadili'} body={lang === 'fr' ? 'Socratique, inclusif, ancré en Afrique. Le même texte guide le modèle et filtre ses données.' : 'Kisokrati, jumuishi, kilichokita Afrika. Maandishi yale yale yanaongoza modeli na kuchuja data.'} />
        </section>

        <section className="mt-12 rounded-2xl border border-stone-200 bg-white p-4 text-xs text-stone-600 flex flex-wrap gap-x-6 gap-y-2">
          <span className="font-bold text-stone-800">{ui('health', lang)}</span>
          {health ? (
            <>
              <Dot ok={health.llm.reachable && !health.llm.error} label={health.llm.reachable && !health.llm.error ? `${ui('llmOk', lang)} · ${health.llm.model}` : `${ui('llmDown', lang)}${health.llm.error ? ` (${health.llm.error})` : ''}`} />
              <Dot ok={health.tts.reachable} label={health.tts.reachable ? ui('ttsOk', lang) : ui('ttsDown', lang)} />
              <Dot ok={true} label={health.perception.mathpix ? ui('mathpixOn', lang) : ui('visionOn', lang)} />
            </>
          ) : (
            <span>{ui('connecting', lang)}</span>
          )}
        </section>
      </main>
    </div>
  );
};

const Feature: React.FC<{ icon: React.ReactNode; title: string; body: string }> = ({ icon, title, body }) => (
  <div className="rounded-2xl border border-stone-200 bg-white p-4">
    <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center text-[#A36B46] mb-3">{icon}</div>
    <div className="font-bold text-stone-900">{title}</div>
    <div className="text-stone-500 mt-1 leading-relaxed">{body}</div>
  </div>
);

const Dot: React.FC<{ ok: boolean; label: string }> = ({ ok, label }) => (
  <span className="inline-flex items-center gap-1.5">
    <span className={`w-2 h-2 rounded-full ${ok ? 'bg-emerald-500' : 'bg-amber-500'}`} />
    {label}
  </span>
);
