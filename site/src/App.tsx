import React, { useEffect, useState } from 'react';
import { ArrowRight, ArrowUpRight, Github } from 'lucide-react';
import { Logo } from '@app/components/Logo';
import { COPY, REPO_URL, type SiteLang } from './copy';
import { Demo } from './demo/Demo';
import { TableIllustration } from './TableIllustration';

function initialLang(): SiteLang {
  try {
    const saved = localStorage.getItem('legriot_site_lang');
    if (saved === 'en' || saved === 'fr') return saved;
  } catch {
    /* stockage indisponible */
  }
  return navigator.language?.toLowerCase().startsWith('fr') ? 'fr' : 'en';
}

export const App: React.FC = () => {
  const [lang, setLang] = useState<SiteLang>(initialLang);
  const c = COPY[lang];

  useEffect(() => {
    document.documentElement.lang = lang;
    try {
      localStorage.setItem('legriot_site_lang', lang);
    } catch {
      /* stockage indisponible */
    }
  }, [lang]);

  const nav: [string, string][] = [
    ['problem', c.nav.problem],
    ['how', c.nav.how],
    ['demo', c.nav.demo],
    ['tech', c.nav.tech],
    ['status', c.nav.status],
  ];

  return (
    <div className="min-h-screen bg-bg text-ink">
      {/* ================= Navigation ================= */}
      <header className="sticky top-0 z-40 bg-bg/85 backdrop-blur border-b border-line">
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between gap-4">
          <a href="#top" className="shrink-0" aria-label="LeGriot">
            <Logo size={24} accent="var(--color-accent)" />
          </a>
          <nav className="hidden md:flex items-center gap-1 text-sm">
            {nav.map(([id, label]) => (
              <a key={id} href={`#${id}`} className="btn btn-ghost px-3 py-1.5">
                {label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-1 text-sm">
            {(['en', 'fr'] as SiteLang[]).map((l) => (
              <button key={l} onClick={() => setLang(l)} className={`btn btn-ghost px-2.5 py-1.5 ${lang === l ? 'text-ink font-semibold' : ''}`} aria-pressed={lang === l}>
                {l.toUpperCase()}
              </button>
            ))}
            <a href={REPO_URL} className="btn btn-ghost px-2.5 py-1.5" aria-label={c.nav.code}>
              <Github className="w-4 h-4" />
            </a>
          </div>
        </div>
      </header>

      <main id="top">
        {/* ================= Hero ================= */}
        <section className="max-w-6xl mx-auto px-5 pt-16 sm:pt-24 pb-20 grid lg:grid-cols-[1.15fr_1fr] gap-12 items-center">
          <div>
            <p className="eyebrow">{c.hero.eyebrow}</p>
            <h1 className="mt-5 text-4xl sm:text-[56px] font-semibold leading-[1.04]">{c.hero.title}</h1>
            <p className="mt-6 text-lg text-ink-2 leading-relaxed max-w-xl">{c.hero.body}</p>
            <div className="mt-9 flex flex-col sm:flex-row gap-3">
              <a href="#demo" className="btn btn-primary px-5 py-3 text-base">
                {c.hero.ctaDemo} <ArrowRight className="w-4 h-4" />
              </a>
              <a href={REPO_URL} className="btn btn-outline px-5 py-3 text-base">
                <Github className="w-4 h-4" /> {c.hero.ctaCode}
              </a>
            </div>
            <ul className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-xs text-muted">
              {c.hero.meta.map((m) => (
                <li key={m} className="inline-flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-accent" />
                  {m}
                </li>
              ))}
            </ul>
          </div>
          <div className="card p-6 sm:p-8">
            <TableIllustration caption={c.hero.caption} phoneLabel={c.hero.phoneLabel} slateLabel={c.hero.slateLabel} />
          </div>
        </section>

        {/* ================= Problème ================= */}
        <Section id="problem" eyebrow={c.problem.eyebrow} title={c.problem.title}>
          <div className="grid md:grid-cols-3 gap-4">
            {c.problem.cards.map((card) => (
              <div key={card.stat} className="card p-6">
                <div className="text-3xl font-semibold tracking-tight">{card.stat}</div>
                <div className="mt-1 font-medium">{card.title}</div>
                <p className="mt-3 text-sm text-ink-2 leading-relaxed">{card.body}</p>
                {'source' in card && card.source && (
                  <a href={card.source.url} className="mt-4 inline-flex items-center gap-1 text-xs text-muted hover:text-ink">
                    {card.source.label} <ArrowUpRight className="w-3 h-3" />
                  </a>
                )}
              </div>
            ))}
          </div>
        </Section>

        {/* ================= Fonctionnement ================= */}
        <Section id="how" eyebrow={c.how.eyebrow} title={c.how.title}>
          <ol className="grid sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-10">
            {c.how.steps.map((s, i) => (
              <li key={s.title} className="border-t border-ink pt-5">
                <div className="font-mono text-xs text-muted">0{i + 1}</div>
                <div className="mt-3 font-semibold">{s.title}</div>
                <p className="mt-2 text-sm text-ink-2 leading-relaxed">{s.body}</p>
              </li>
            ))}
          </ol>
        </Section>

        {/* ================= Démo ================= */}
        <section id="demo" className="bg-surface border-y border-line">
          <div className="max-w-6xl mx-auto px-5 py-20 sm:py-24">
            <div className="max-w-2xl">
              <p className="eyebrow">{c.demo.eyebrow}</p>
              <h2 className="mt-4 text-3xl sm:text-4xl font-semibold leading-tight">{c.demo.title}</h2>
              <p className="mt-4 text-ink-2 leading-relaxed">{c.demo.body}</p>
            </div>
            <div className="mt-12">
              <Demo siteLang={lang} />
            </div>
            <p className="mt-8 text-xs text-muted max-w-2xl">{c.demo.note}</p>
          </div>
        </section>

        {/* ================= Technologie ================= */}
        <Section id="tech" eyebrow={c.tech.eyebrow} title={c.tech.title}>
          <div className="grid md:grid-cols-2 gap-4">
            {c.tech.cards.map((card) => (
              <div key={card.title} className="card p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="font-semibold">{card.title}</div>
                  <span className={`pill shrink-0 ${/develop|développement/i.test(card.tag) ? 'bg-warn-soft text-warn' : 'bg-ok-soft text-ok'}`}>{card.tag}</span>
                </div>
                <p className="mt-3 text-sm text-ink-2 leading-relaxed">{card.body}</p>
                {'link' in card && card.link && (
                  <a href={card.link.url} className="mt-4 inline-flex items-center gap-1 text-sm font-medium hover:text-accent">
                    {card.link.label} <ArrowUpRight className="w-3.5 h-3.5" />
                  </a>
                )}
              </div>
            ))}
          </div>

          {/* Boucle d'amélioration continue */}
          <div className="mt-6 card p-6 sm:p-8">
            <div className="grid lg:grid-cols-[1fr_1.4fr] gap-8 items-center">
              <div>
                <div className="text-xl font-semibold">{c.tech.loop.title}</div>
                <p className="mt-3 text-sm text-ink-2 leading-relaxed">{c.tech.loop.body}</p>
                <span className="mt-4 pill bg-warn-soft text-warn">{c.tech.loop.status}</span>
              </div>
              <LoopDiagram steps={c.tech.loop.steps} />
            </div>
          </div>
        </Section>

        {/* ================= Principes ================= */}
        <section className="max-w-6xl mx-auto px-5 pb-20">
          <p className="eyebrow mb-5">{c.charter.eyebrow}</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-px bg-line border border-line rounded-[14px] overflow-hidden">
            {c.charter.items.map((p) => (
              <div key={p.title} className="bg-surface p-5">
                <div className="font-semibold text-sm">{p.title}</div>
                <p className="mt-1.5 text-sm text-ink-2 leading-relaxed">{p.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ================= Avancement ================= */}
        <Section id="status" eyebrow={c.status.eyebrow} title={c.status.title}>
          <div className="grid md:grid-cols-3 gap-4">
            {c.status.cols.map((col, i) => (
              <div key={col.title} className={`card p-6 ${i === 2 ? 'border-ink' : ''}`}>
                <div className="flex items-center gap-2 font-semibold">
                  <span className={`w-2 h-2 rounded-full ${i === 0 ? 'bg-ok' : i === 1 ? 'bg-warn' : 'bg-accent'}`} />
                  {col.title}
                </div>
                <ul className="mt-4 space-y-3 text-sm text-ink-2 leading-relaxed">
                  {col.items.map((item) => (
                    <li key={item} className="pl-4 relative">
                      <span className="absolute left-0 top-2 w-1.5 h-px bg-muted" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </Section>

        {/* ================= Contact ================= */}
        <section className="max-w-6xl mx-auto px-5 pb-24">
          <div className="rounded-[20px] bg-ink text-white p-8 sm:p-12 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <div className="text-2xl sm:text-3xl font-semibold">{c.contact.title}</div>
              <p className="mt-2 text-white/70 max-w-xl">{c.contact.body}</p>
            </div>
            <a href={REPO_URL} className="btn bg-white text-ink hover:bg-white/90 px-5 py-3 text-base shrink-0">
              <Github className="w-4 h-4" /> {c.contact.cta}
            </a>
          </div>
        </section>
      </main>

      <footer className="border-t border-line">
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between text-xs text-muted">
          <Logo size={18} />
          <span>
            © 2026 LeGriot · {c.footer.licence} ·{' '}
            <a href={REPO_URL} className="hover:text-ink">
              GitHub
            </a>
          </span>
        </div>
      </footer>
    </div>
  );
};

const Section: React.FC<{ id: string; eyebrow: string; title: string; children: React.ReactNode }> = ({ id, eyebrow, title, children }) => (
  <section id={id} className="max-w-6xl mx-auto px-5 py-20 sm:py-24">
    <p className="eyebrow">{eyebrow}</p>
    <h2 className="mt-4 mb-10 text-3xl sm:text-4xl font-semibold leading-tight max-w-3xl">{title}</h2>
    {children}
  </section>
);

/** Boucle d'amélioration continue : six étapes, la dernière renvoie à la première. */
const LoopDiagram: React.FC<{ steps: readonly string[] }> = ({ steps }) => (
  <ol className="grid grid-cols-2 sm:grid-cols-3 gap-3 relative">
    {steps.map((s, i) => (
      <li key={s} className="relative rounded-xl border border-line bg-bg px-4 py-3">
        <div className="font-mono text-[11px] text-muted">{String(i + 1).padStart(2, '0')}</div>
        <div className="mt-1 text-sm font-medium">{s}</div>
        {i === steps.length - 1 && (
          <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-accent text-white text-xs flex items-center justify-center" aria-hidden="true">
            ↺
          </span>
        )}
      </li>
    ))}
  </ol>
);
