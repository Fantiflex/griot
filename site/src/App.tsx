import React, { useEffect, useState } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Eye,
  Github,
  LayoutDashboard,
  MessageCircle,
  Mic,
  Server,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react';
import { AfricaMapSvg } from '@app/components/AfricaMapSvg';
import { NdopBadgeMotif, NdopMotifWatermark } from '@app/components/NdopMotifSvg';
import { CHARTER_URL, COPY, REPO_URL, type SiteLang, type Tone } from './copy';
import { Demo } from './demo/Demo';
import { Reveal } from './Reveal';
import { HeroVisual } from './visuals/HeroVisual';
import { ClassroomIllustration } from './visuals/ClassroomIllustration';
import { ArchitectureDiagram } from './visuals/ArchitectureDiagram';

const BASE = import.meta.env.BASE_URL;

function initialLang(): SiteLang {
  try {
    const saved = localStorage.getItem('legriot_site_lang');
    if (saved === 'en' || saved === 'fr') return saved;
  } catch {
    /* stockage indisponible */
  }
  return 'en';
}

const TONE: Record<Tone, { tag: string; stat: string; border: string }> = {
  red: { tag: 'bg-red-soft text-red', stat: 'text-red', border: 'border-red/15' },
  amber: { tag: 'bg-amber-soft text-amber', stat: 'text-amber', border: 'border-amber/15' },
  green: { tag: 'bg-green-soft text-green', stat: 'text-green', border: 'border-green/15' },
  clay: { tag: 'bg-accent-soft text-accent', stat: 'text-accent', border: 'border-accent/15' },
};

const ICONS: Record<string, React.FC<{ className?: string }>> = {
  users: Users,
  voice: MessageCircle,
  teacher: LayoutDashboard,
  server: Server,
  eye: Eye,
  mic: Mic,
  shield: ShieldCheck,
};

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
    ['solution', c.nav.solution],
    ['demo', c.nav.demo],
    ['tech', c.nav.tech],
    ['status', c.nav.status],
  ];

  return (
    <div className="min-h-screen bg-bg text-ink overflow-x-clip">
      {/* ================= Navigation ================= */}
      <header className="sticky top-0 z-40 bg-bg/85 backdrop-blur border-b border-line">
        <div className="max-w-6xl mx-auto px-5 h-[68px] flex items-center justify-between gap-4">
          <a href="#top" className="shrink-0">
            <SiteLogo />
          </a>
          <nav className="hidden lg:flex items-center gap-1 text-sm">
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
            <a href="#demo" className="btn btn-primary rounded-full px-3.5 sm:px-4 py-2 ml-1 sm:ml-2 text-xs sm:text-sm">
              <Sparkles className="w-3.5 h-3.5 text-accent" /> <span className="hidden sm:inline">{c.nav.cta}</span>
              <span className="sm:hidden">{c.nav.demo}</span>
            </a>
          </div>
        </div>
      </header>

      <main id="top">
        {/* ================= Hero ================= */}
        <section className="relative overflow-hidden border-b border-line">
          <div className="absolute inset-0 flex items-center justify-center lg:justify-start pointer-events-none" aria-hidden="true">
            <AfricaMapSvg className="w-[640px] h-[640px] lg:w-[820px] lg:h-[820px] lg:-ml-40 translate-y-12" opacity={0.18} />
          </div>
          <div className="relative max-w-6xl mx-auto px-5 pt-16 sm:pt-24 pb-16 sm:pb-24 grid lg:grid-cols-[1.12fr_1fr] gap-12 lg:gap-8 items-center">
            <div className="text-center lg:text-left">
              <h1 className="font-display font-semibold text-[42px] leading-[1.03] sm:text-6xl lg:text-[64px] lg:leading-[1.02]">
                <span className="block">{c.hero.titleA}</span>
                <span className="block italic text-accent mt-1">{c.hero.titleB}</span>
              </h1>
              <p className="mt-7 text-lg text-ink-2 leading-relaxed max-w-xl mx-auto lg:mx-0">{c.hero.body}</p>
              <div className="mt-9 flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <a href="#demo" className="btn btn-primary rounded-full px-6 py-3.5 text-base">
                  <Sparkles className="w-4 h-4 text-accent" /> {c.hero.ctaDemo} <ArrowRight className="w-4 h-4" />
                </a>
                <a href={REPO_URL} className="btn btn-outline rounded-full px-6 py-3.5 text-base bg-surface/70">
                  <Github className="w-4 h-4" /> {c.hero.ctaCode}
                </a>
              </div>
              <ul className="mt-9 flex flex-wrap justify-center lg:justify-start gap-x-6 gap-y-2 text-xs text-muted font-mono">
                {c.hero.meta.map((m) => (
                  <li key={m} className="inline-flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rotate-45 bg-accent" />
                    {m}
                  </li>
                ))}
              </ul>
            </div>
            <Reveal>
              <HeroVisual lang={lang} />
            </Reveal>
          </div>
        </section>

        {/* ================= Chiffres ================= */}
        <section id="problem" className="max-w-6xl mx-auto px-5 py-20 sm:py-24">
          <div className="grid md:grid-cols-3 gap-5">
            {c.stats.cards.map((card, i) => {
              const tone = TONE[card.tone];
              return (
                <Reveal key={card.stat} delay={i * 90}>
                  <a href={card.url} className={`group block h-full rounded-3xl bg-surface border ${tone.border} p-7 hover:-translate-y-0.5 hover:shadow-[0_20px_40px_-28px_rgba(20,19,17,0.35)] transition`}>
                    <div className="flex items-center justify-between gap-3">
                      <span className={`font-mono text-[11px] font-medium uppercase tracking-wider px-2.5 py-1 rounded-md ${tone.tag}`}>{card.tag}</span>
                      <span className="font-mono text-[11px] text-muted inline-flex items-center gap-1">
                        {card.source} <ArrowUpRight className="w-3 h-3 opacity-40 group-hover:opacity-100 transition-opacity" />
                      </span>
                    </div>
                    <div className={`mt-6 font-display font-semibold text-5xl tracking-tight ${tone.stat}`}>{card.stat}</div>
                    <div className="mt-3 font-semibold leading-snug">{card.title}</div>
                    <p className="mt-2 text-sm text-ink-2 leading-relaxed">{card.body}</p>
                  </a>
                </Reveal>
              );
            })}
          </div>
          <p className="mt-8 text-center text-xs text-muted font-mono italic">{c.stats.footnote}</p>
        </section>

        {/* ================= Solution ================= */}
        <section id="solution" className="max-w-6xl mx-auto px-5 pb-20 sm:pb-24">
          <Reveal>
            <SectionHead eyebrow={c.solution.eyebrow} title={c.solution.title} body={c.solution.body} center />
          </Reveal>

          <div className="mt-14 space-y-6">
            {c.solution.features.map((f, i) => (
              <Reveal key={f.title}>
                <div className="rounded-3xl bg-surface border border-line overflow-hidden grid lg:grid-cols-2">
                  <figure className={`relative ${i % 2 === 1 ? 'lg:order-2' : ''}`}>
                    <img src={`${BASE}${f.img}`} alt={f.alt} loading="lazy" className="w-full h-full object-cover min-h-[260px] max-h-[460px]" />
                    <figcaption className="absolute top-3 left-3 font-mono text-[10px] uppercase tracking-wider bg-surface/85 backdrop-blur px-2 py-1 rounded-md text-muted">
                      {c.solution.illustration}
                    </figcaption>
                  </figure>
                  <div className="p-8 sm:p-12 flex flex-col justify-center">
                    <span className="font-mono text-[11px] font-medium uppercase tracking-wider text-accent">{f.tag}</span>
                    <h3 className="mt-3 font-display font-semibold text-3xl leading-tight">{f.title}</h3>
                    <p className="mt-4 text-ink-2 leading-relaxed">{f.body}</p>
                    <ul className="mt-6 flex flex-wrap gap-2">
                      {f.points.map((p) => (
                        <li key={p} className="inline-flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-full border border-line bg-bg">
                          <Check className="w-3.5 h-3.5 text-green" /> {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </Reveal>
            ))}

            {/* Ratio 1 : 8, avec la classe vue du dessus */}
            <Reveal>
              <div className="rounded-3xl bg-ink text-white overflow-hidden relative">
                <NdopMotifWatermark className="absolute inset-0 w-full h-full text-white" opacity={0.035} />
                <div className="relative p-8 sm:p-12 grid lg:grid-cols-[auto_1fr_auto] gap-8 lg:gap-12 items-end">
                  <div className="font-display font-semibold text-7xl sm:text-8xl text-accent tracking-tight leading-none">{c.solution.ratio.stat}</div>
                  <div>
                    <div className="font-display text-2xl sm:text-3xl font-semibold leading-tight">{c.solution.ratio.title}</div>
                    <p className="mt-3 text-white/70 leading-relaxed max-w-lg">{c.solution.ratio.body}</p>
                  </div>
                  <dl className="flex gap-8">
                    {c.solution.counts.map((k) => (
                      <div key={k.label}>
                        <dt className="sr-only">{k.label}</dt>
                        <dd className="font-display font-semibold text-4xl">{k.n}</dd>
                        <div className="text-xs text-white/55 font-mono uppercase tracking-wider mt-1">{k.label}</div>
                      </div>
                    ))}
                  </dl>
                </div>
                <div className="relative px-4 sm:px-10 pb-6 sm:pb-10">
                  <ClassroomIllustration label={c.solution.classroomLabel} />
                </div>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ================= Piliers ================= */}
        <section className="border-y border-line bg-surface">
          <div className="max-w-6xl mx-auto px-5 py-20 sm:py-24">
            <Reveal>
              <SectionHead eyebrow={c.pillars.eyebrow} title={c.pillars.title} center />
            </Reveal>
            <div className="mt-14 grid md:grid-cols-3 gap-5">
              {c.pillars.items.map((p, i) => {
                const Icon = ICONS[p.icon];
                return (
                  <Reveal key={p.title} delay={i * 90}>
                    <div className="h-full rounded-3xl bg-bg border border-line p-7 flex flex-col">
                      <IconTile icon={Icon} />
                      <h3 className="mt-6 font-display font-semibold text-2xl">{p.title}</h3>
                      <p className="mt-3 text-sm text-ink-2 leading-relaxed flex-1">{p.body}</p>
                      <div className="mt-6 pt-4 border-t border-line font-mono text-[11px] text-muted">{p.tags}</div>
                    </div>
                  </Reveal>
                );
              })}
            </div>
          </div>
        </section>

        {/* ================= Fonctionnement ================= */}
        <section className="max-w-6xl mx-auto px-5 py-20 sm:py-24">
          <Reveal>
            <SectionHead eyebrow={c.how.eyebrow} title={c.how.title} />
          </Reveal>
          <ol className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-10">
            {c.how.steps.map((s, i) => (
              <Reveal as="li" key={s.title} delay={i * 80} className="border-t-2 border-ink pt-5">
                <div className="font-display italic text-3xl text-accent">0{i + 1}</div>
                <div className="mt-3 font-semibold">{s.title}</div>
                <p className="mt-2 text-sm text-ink-2 leading-relaxed">{s.body}</p>
              </Reveal>
            ))}
          </ol>
        </section>

        {/* ================= Démo ================= */}
        <section id="demo" className="bg-surface border-y border-line">
          <div className="max-w-6xl mx-auto px-5 py-20 sm:py-24">
            <Reveal>
              <SectionHead eyebrow={c.demo.eyebrow} title={c.demo.title} body={c.demo.body} />
            </Reveal>
            <div className="mt-12">
              <Demo siteLang={lang} />
            </div>
            <p className="mt-8 text-xs text-muted max-w-2xl font-mono">{c.demo.note}</p>
          </div>
        </section>

        {/* ================= Technologie ================= */}
        <section id="tech" className="max-w-6xl mx-auto px-5 py-20 sm:py-24">
          <Reveal>
            <SectionHead eyebrow={c.tech.eyebrow} title={c.tech.title} body={c.tech.body} />
          </Reveal>

          <Reveal className="mt-12">
            <ArchitectureDiagram arch={c.tech.arch} />
          </Reveal>

          <div className="mt-5 grid md:grid-cols-2 gap-5">
            {c.tech.cards.map((card, i) => {
              const Icon = ICONS[card.icon];
              return (
                <Reveal key={card.title} delay={(i % 2) * 90}>
                  <div className="h-full rounded-3xl bg-surface border border-line p-7">
                    <div className="flex items-start justify-between gap-4">
                      <IconTile icon={Icon} />
                      <span className={`font-mono text-[11px] px-2.5 py-1 rounded-md text-right ${card.done ? 'bg-green-soft text-green' : 'bg-amber-soft text-amber'}`}>{card.tag}</span>
                    </div>
                    <h3 className="mt-6 font-display font-semibold text-2xl leading-snug">{card.title}</h3>
                    <p className="mt-3 text-sm text-ink-2 leading-relaxed">{card.body}</p>
                    {'link' in card && card.link && (
                      <a href={card.link.url} className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-accent hover:text-accent-2">
                        {card.link.label} <ArrowUpRight className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>
                </Reveal>
              );
            })}
          </div>

          <Reveal className="mt-5">
            <div className="rounded-3xl bg-surface border border-line p-7 sm:p-10 grid lg:grid-cols-[1fr_1.3fr] gap-10 items-center">
              <div>
                <h3 className="font-display font-semibold text-3xl leading-tight">{c.tech.loop.title}</h3>
                <p className="mt-4 text-ink-2 leading-relaxed">{c.tech.loop.body}</p>
                <span className="mt-5 inline-block font-mono text-[11px] px-2.5 py-1 rounded-md bg-amber-soft text-amber">{c.tech.loop.status}</span>
              </div>
              <LoopDiagram steps={c.tech.loop.steps} />
            </div>
          </Reveal>
        </section>

        {/* ================= Avancement ================= */}
        <section id="status" className="border-t border-line bg-surface">
          <div className="max-w-6xl mx-auto px-5 py-20 sm:py-24">
            <Reveal>
              <SectionHead eyebrow={c.status.eyebrow} title={c.status.title} />
            </Reveal>
            <div className="mt-12 grid md:grid-cols-3 gap-5">
              {c.status.cols.map((col, i) => (
                <Reveal key={col.title} delay={i * 90}>
                  <div className={`h-full rounded-3xl p-7 ${i === 2 ? 'bg-ink text-white' : 'bg-bg border border-line'}`}>
                    <div className="flex items-center gap-2.5 font-display font-semibold text-xl">
                      <span className={`w-2.5 h-2.5 rotate-45 ${i === 0 ? 'bg-green' : i === 1 ? 'bg-amber' : 'bg-accent'}`} />
                      {col.title}
                    </div>
                    <ul className={`mt-5 space-y-3 text-sm leading-relaxed ${i === 2 ? 'text-white/80' : 'text-ink-2'}`}>
                      {col.items.map((item) => (
                        <li key={item} className="pl-5 relative">
                          <Check className={`absolute left-0 top-0.5 w-3.5 h-3.5 ${i === 0 ? 'text-green' : i === 2 ? 'text-accent' : 'text-muted'}`} />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* ================= Contact ================= */}
        <section className="max-w-6xl mx-auto px-5 py-20 sm:py-24">
          <Reveal>
            <div className="relative rounded-3xl bg-ink text-white p-10 sm:p-16 overflow-hidden text-center">
              <NdopMotifWatermark className="absolute inset-0 w-full h-full text-accent" opacity={0.08} />
              <div className="relative">
                <h2 className="font-display font-semibold text-3xl sm:text-5xl leading-tight max-w-3xl mx-auto">{c.contact.title}</h2>
                <p className="mt-4 text-white/70 max-w-xl mx-auto">{c.contact.body}</p>
                <a href={REPO_URL} className="mt-8 btn bg-white text-ink hover:bg-white/90 rounded-full px-6 py-3.5 text-base">
                  <Github className="w-4 h-4" /> {c.contact.cta}
                </a>
              </div>
            </div>
          </Reveal>
        </section>
      </main>

      <footer className="border-t border-line">
        <div className="max-w-6xl mx-auto px-5 py-10 flex flex-col md:flex-row items-center justify-between gap-6 text-sm">
          <SiteLogo small />
          <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-ink-2">
            <a href="#demo" className="hover:text-ink">{c.footer.demo}</a>
            <a href={CHARTER_URL} className="hover:text-ink">{c.footer.charter}</a>
            <a href={REPO_URL} className="hover:text-ink">{c.footer.code}</a>
          </nav>
          <span className="text-xs text-muted">© 2026 LeGriot · {c.footer.licence}</span>
        </div>
      </footer>
    </div>
  );
};

/* ---------------------------------------------------------------- */

/** Logo : losange Ndop (motif des pagnes du royaume Bamoun) dans un carré sombre, nom en serif. */
const SiteLogo: React.FC<{ small?: boolean }> = ({ small }) => (
  <span className="inline-flex items-center gap-2.5">
    <span className={`${small ? 'w-7 h-7 rounded-lg' : 'w-9 h-9 rounded-xl'} bg-ink flex items-center justify-center`}>
      <NdopBadgeMotif size={small ? 15 : 20} className="text-accent" />
    </span>
    <span className={`font-display font-semibold ${small ? 'text-base text-ink' : 'text-[22px]'}`}>LeGriot</span>
  </span>
);

const SectionHead: React.FC<{ eyebrow: string; title: string; body?: string; center?: boolean }> = ({ eyebrow, title, body, center }) => (
  <div className={center ? 'text-center max-w-3xl mx-auto' : 'max-w-3xl'}>
    <span className="inline-flex items-center gap-2 font-mono text-[11px] font-medium uppercase tracking-wider text-accent bg-accent-soft px-3 py-1.5 rounded-full">
      <NdopBadgeMotif size={12} className="text-accent" /> {eyebrow}
    </span>
    <h2 className="mt-5 font-display font-semibold text-4xl sm:text-5xl leading-[1.08]">{title}</h2>
    {body && <p className={`mt-5 text-lg text-ink-2 leading-relaxed ${center ? 'mx-auto max-w-2xl' : 'max-w-2xl'}`}>{body}</p>}
  </div>
);

const IconTile: React.FC<{ icon: React.FC<{ className?: string }> }> = ({ icon: Icon }) => (
  <span className="w-12 h-12 rounded-2xl bg-ink flex items-center justify-center shrink-0">
    <Icon className="w-5 h-5 text-accent" />
  </span>
);

/** Boucle d'amélioration continue : six étapes, la dernière renvoie à la première. */
const LoopDiagram: React.FC<{ steps: readonly string[] }> = ({ steps }) => (
  <ol className="grid grid-cols-2 sm:grid-cols-3 gap-3">
    {steps.map((s, i) => (
      <li key={s} className="relative rounded-2xl border border-line bg-bg px-4 py-3.5">
        <div className="font-display italic text-lg text-accent">{String(i + 1).padStart(2, '0')}</div>
        <div className="mt-0.5 text-sm font-medium">{s}</div>
        {i === steps.length - 1 && (
          <span className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-accent text-white text-sm flex items-center justify-center" aria-hidden="true">
            ↺
          </span>
        )}
      </li>
    ))}
  </ol>
);
