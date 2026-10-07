import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Camera, CameraOff, Hand, HelpCircle, Lightbulb, Play, RotateCcw, Send, Volume2, VolumeX, ArrowLeft } from 'lucide-react';
import { SUBJECT_LABELS, t, type ClassroomState, type GroupState, type GriotPose, type GriotUtterance, type Journey, type Lang, type StandMove } from '@shared/types';
import { api } from '@/lib/api';
import { useRealtime } from '@/lib/realtime';
import { ui, phaseLabel } from '@/lib/i18n';
import { speak, stopAll, setMuted, isMuted, unlockAudio, queueLength } from '@/lib/speech';
import { useSlateCamera } from '@/lib/camera';
import { GriotAvatar } from '@/components/GriotAvatar';
import { StandWidget } from '@/components/StandWidget';

/* ================= Rejoindre ================= */

const Join: React.FC<{ lang: Lang; initialCode?: string; onJoin: (code: string, groupId: string) => void; onBack: () => void }> = ({ lang, initialCode, onJoin, onBack }) => {
  const [code, setCode] = useState(initialCode ?? '');
  const [classroom, setClassroom] = useState<ClassroomState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const lookup = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const c = code.trim().toUpperCase();
    if (c.length < 4) return;
    setBusy(true);
    setError(null);
    try {
      setClassroom(await api.getClassroom(c));
    } catch {
      setError(ui('notFound', lang));
      setClassroom(null);
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    if (initialCode) void lookup();
  }, [initialCode]);

  return (
    <div className="min-h-screen bg-stone-950 text-white flex flex-col">
      <div className="p-4 flex items-center gap-2 text-sm text-stone-400">
        <button onClick={onBack} className="p-2 rounded-lg hover:bg-white/10"><ArrowLeft className="w-4 h-4" /></button>
        LeGriot
      </div>
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-16">
        {!classroom ? (
          <form onSubmit={lookup} className="w-full max-w-sm space-y-4 text-center">
            <h1 className="font-serif font-black text-3xl">{ui('groupEntry', lang)}</h1>
            <p className="text-stone-400 text-sm">{ui('enterCode', lang)}</p>
            <input
              autoFocus
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              maxLength={6}
              className="w-full text-center font-mono text-4xl tracking-[0.4em] rounded-2xl bg-white/10 border border-white/20 py-4 focus:outline-none focus:ring-2 focus:ring-[#E5A823]"
              placeholder="ABC123"
            />
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <button disabled={busy} className="w-full rounded-2xl bg-[#A36B46] font-bold py-4 text-lg disabled:opacity-50">{ui('join', lang)}</button>
          </form>
        ) : (
          <div className="w-full max-w-md space-y-4">
            <div className="text-center">
              <div className="font-mono text-[#E5A823] tracking-widest">{classroom.code}</div>
              <h1 className="font-serif font-black text-2xl">{classroom.name}</h1>
              <p className="text-stone-400 text-sm mt-1">{ui('chooseGroup', classroom.lang)}</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {classroom.groups.map((g) => (
                <button key={g.id} onClick={() => onJoin(classroom.code, g.id)} className="rounded-2xl bg-white/10 hover:bg-[#A36B46] border border-white/15 p-4 text-left transition-colors">
                  <div className="text-3xl">{g.totem}</div>
                  <div className="font-bold mt-1">{g.name}</div>
                  <div className="text-[11px] text-stone-400">{g.joinedDevices} {ui('devices', classroom.lang)}</div>
                </button>
              ))}
            </div>
            <button onClick={() => setClassroom(null)} className="w-full text-sm text-stone-400 underline">{ui('back', lang)}</button>
          </div>
        )}
      </div>
    </div>
  );
};

/* ================= Leçon ================= */

const Lesson: React.FC<{ code: string; groupId: string; uiLang: Lang; onLeave: () => void }> = ({ code, groupId, uiLang, onLeave }) => {
  const [classroom, setClassroom] = useState<ClassroomState | null>(null);
  const [group, setGroup] = useState<GroupState | null>(null);
  const [journey, setJourney] = useState<Journey | null>(null);
  const [awake, setAwake] = useState(false);
  const [muted, setMutedState] = useState(isMuted());
  const [pose, setPose] = useState<GriotPose>('welcoming');
  const [speaking, setSpeaking] = useState(false);
  const [current, setCurrent] = useState<GriotUtterance | null>(null);
  const [standPose, setStandPose] = useState<StandMove>({ pan: 90, tilt: 90, ms: 600 });
  const [cameraOn, setCameraOn] = useState(true);
  const [autoCapture, setAutoCapture] = useState(true);
  const [typed, setTyped] = useState('');
  const [question, setQuestion] = useState('');
  const [showAsk, setShowAsk] = useState(false);
  const [flash, setFlash] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const groupRef = useRef<GroupState | null>(null);
  groupRef.current = group;
  const seen = useRef(new Set<string>());

  const lang = classroom?.lang ?? uiLang;
  const workshop = useMemo(() => journey?.workshops.find((w) => w.id === group?.workshopId), [journey, group?.workshopId]);
  const step = workshop?.steps[group?.lesson.stepIndex ?? 0];
  const phase = group?.lesson.phase ?? 'idle';

  const autoContinue = useCallback((u: GriotUtterance) => {
    // Après un récit ou un retour, le Griot enchaîne de lui-même si rien d'autre n'est en attente.
    const g = groupRef.current;
    if (!g || queueLength() > 0) return;
    const p = g.lesson.phase;
    if ((u.kind === 'tell' && p === 'telling') || (p === 'feedback' && (u.kind === 'feedback' || u.kind === 'answer'))) {
      const delay = isMuted() ? Math.min(12_000, 800 + u.text.length * 45) : 1800;
      setTimeout(() => {
        const now = groupRef.current;
        if (now && now.lesson.phase === p && now.lesson.stepIndex === g.lesson.stepIndex) api.continueLesson(code, groupId).catch(() => {});
      }, delay);
    }
  }, [code, groupId]);

  const handleSay = useCallback((u: GriotUtterance) => {
    if (seen.current.has(u.id)) return;
    seen.current.add(u.id);
    setCurrent(u);
    speak(u.text, u.lang, {
      onStart: () => {
        setPose(u.pose);
        setSpeaking(true);
      },
      onEnd: () => {
        setSpeaking(false);
        if (u.pose === 'looking') setPose('looking');
        autoContinue(u);
      },
    });
  }, [autoContinue]);

  const status = useRealtime({ code, role: 'group', groupId }, {
    onClassroom: setClassroom,
    onGroup: setGroup,
    onSay: handleSay,
    onStandMove: (gid, move) => gid === groupId && setStandPose(move),
    onError: setError,
  });

  useEffect(() => {
    api.getClassroom(code).then(setClassroom).catch((e) => setError(e.message));
    api.getGroup(code, groupId).then((g) => {
      setGroup(g);
      setStandPose(g.standPose);
      for (const u of g.transcript) seen.current.add(u.id); // ne pas rejouer l'historique
      const last = g.transcript[g.transcript.length - 1];
      if (last) {
        setCurrent(last);
        setPose(last.pose);
      }
    }).catch(() => {});
    api.journeys().then((js) => setJourney(js.find((j) => j.id === classroom?.journeyId) ?? js[0])).catch(() => {});
    return () => stopAll();
  }, [code, groupId]);

  useEffect(() => {
    if (classroom && journey && classroom.journeyId !== journey.id) {
      api.journeys().then((js) => setJourney(js.find((j) => j.id === classroom.journeyId) ?? js[0]));
    }
  }, [classroom?.journeyId]);

  // Caméra : active quand le Griot attend l'ardoise.
  const wantCamera = awake && cameraOn && (phase === 'waiting_slate' || phase === 'reading');
  const submitImage = useCallback((dataUrl: string) => {
    setFlash(true);
    setTimeout(() => setFlash(false), 250);
    api.submitSlateImage(code, groupId, dataUrl).catch((e) => setError(e.message));
  }, [code, groupId]);
  const cam = useSlateCamera(wantCamera, { autoCapture: autoCapture && phase === 'waiting_slate', onAutoCapture: submitImage, stableMs: 2500 });
  useEffect(() => {
    if (phase === 'waiting_slate') cam.rearm();
  }, [phase, group?.lesson.attempts]);

  const wakeUp = () => {
    unlockAudio();
    setAwake(true);
  };
  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    setMutedState(next);
    if (!next) setSpeaking(false);
  };
  const done = () => {
    const frame = cam.status === 'live' ? cam.grabFrame() : null;
    if (frame) submitImage(frame);
    else if (typed.trim()) {
      api.submitSlateText(code, groupId, typed.trim()).catch((e) => setError(e.message));
      setTyped('');
    }
  };
  const sendTyped = (e: React.FormEvent) => {
    e.preventDefault();
    if (!typed.trim()) return;
    api.submitSlateText(code, groupId, typed.trim()).catch((e) => setError(e.message));
    setTyped('');
  };
  const sendQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;
    api.ask(code, groupId, question.trim()).catch((e) => setError(e.message));
    setQuestion('');
    setShowAsk(false);
  };

  if (!group || !classroom) {
    return (
      <div className="min-h-screen bg-stone-950 text-white flex items-center justify-center text-stone-400">
        {error ?? ui('connecting', uiLang)}
      </div>
    );
  }

  const totalSteps = workshop?.steps.length ?? 0;
  const isWaitingSlate = phase === 'waiting_slate';
  const isReading = phase === 'reading';

  return (
    <div className="min-h-screen bg-stone-950 text-white flex flex-col select-none">
      {/* Réveil : un geste utilisateur est requis pour l'audio sur mobile */}
      {!awake && (
        <button onClick={wakeUp} className="fixed inset-0 z-50 bg-stone-950/95 flex flex-col items-center justify-center gap-6 p-8 text-center">
          <GriotAvatar pose="welcoming" speaking={false} size={160} />
          <div>
            <div className="font-serif font-black text-3xl">{group.totem} {group.name}</div>
            <div className="text-stone-400 mt-2">{ui('tapToStart', lang)}</div>
          </div>
        </button>
      )}

      {/* Barre haute */}
      <header className="px-4 py-2.5 flex items-center justify-between text-xs border-b border-white/10">
        <div className="flex items-center gap-2">
          <button onClick={onLeave} className="p-1.5 rounded-lg hover:bg-white/10"><ArrowLeft className="w-4 h-4" /></button>
          <span className="font-mono text-[#E5A823]">{classroom.code}</span>
          <span className="text-stone-400">· {group.totem} {group.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={status === 'open' ? 'text-emerald-400' : 'text-amber-400'}>●</span>
          <button onClick={toggleMute} className="p-1.5 rounded-lg hover:bg-white/10" title={muted ? ui('unmute', lang) : ui('mute', lang)}>
            {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Griot + bulle */}
      <section className="px-4 pt-4 flex items-start gap-4">
        <GriotAvatar pose={pose} speaking={speaking} size={96} />
        <div className="flex-1 min-w-0">
          <div className="text-[11px] uppercase tracking-wider text-stone-400 font-bold">
            {workshop ? `${t(SUBJECT_LABELS[workshop.subject], lang)} · ${ui('step', lang)} ${Math.min(group.lesson.stepIndex + 1, totalSteps)}/${totalSteps}` : ui('workshop', lang)}
          </div>
          <div className="mt-1.5 relative rounded-2xl rounded-tl-sm bg-white text-stone-900 p-4 text-[15px] leading-relaxed min-h-[84px] shadow-lg">
            {current ? current.text : workshop ? t(workshop.title, lang) : '…'}
            {current?.fromModel && <span className="absolute -bottom-2 right-3 text-[10px] font-bold bg-[#A36B46] text-white px-2 py-0.5 rounded-full">IA</span>}
          </div>
          <div className="mt-2 flex items-center gap-2 text-[11px] text-stone-400">
            <span className="px-2 py-0.5 rounded-md bg-white/10">{phaseLabel(phase, lang)}</span>
            {speaking && <span>{ui('speaking', lang)}</span>}
            {current && !speaking && (
              <button onClick={() => { seen.current.delete(current.id); handleSay(current); }} className="inline-flex items-center gap-1 hover:text-white"><RotateCcw className="w-3 h-3" /> {ui('replay', lang)}</button>
            )}
          </div>
        </div>
      </section>

      {/* Zone centrale : caméra / choix / discussion */}
      <section className="flex-1 px-4 pt-4 pb-3 flex flex-col gap-3">
        {phase === 'idle' && (
          <button onClick={() => api.startLesson(code, groupId)} className="flex-1 min-h-[180px] rounded-3xl bg-[#A36B46] flex flex-col items-center justify-center gap-3 font-serif font-black text-2xl dair-shadow">
            <Play className="w-10 h-10" /> {ui('startLesson', lang)}
            {workshop && <span className="text-sm font-sans font-medium text-white/80">{t(workshop.title, lang)}</span>}
          </button>
        )}

        {(isWaitingSlate || isReading) && (
          <div className={`relative rounded-3xl overflow-hidden bg-black aspect-[4/3] max-h-[42vh] mx-auto w-full ${flash ? 'ring-4 ring-white' : ''}`}>
            {cameraOn ? (
              <>
                <video ref={cam.videoRef} playsInline muted className="w-full h-full object-cover" />
                {cam.status === 'blocked' && <div className="absolute inset-0 flex items-center justify-center text-center text-sm text-stone-300 p-6">{ui('cameraBlocked', lang)}</div>}
                {cam.status === 'starting' && <div className="absolute inset-0 flex items-center justify-center text-stone-400 text-sm">{ui('connecting', lang)}</div>}
                {/* guides */}
                <div className="absolute inset-4 border-2 border-dashed border-white/40 rounded-2xl pointer-events-none" />
                {cam.status === 'live' && isWaitingSlate && (
                  <div className="absolute bottom-2 left-2 right-2 flex items-center gap-2 text-[11px] text-white/90">
                    <span className={`w-2 h-2 rounded-full ${cam.motion > 6 ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                    <span className="flex-1 truncate">{autoCapture ? ui('autoCapture', lang) : ui('camera', lang)}</span>
                    {autoCapture && cam.motion <= 6 && (
                      <span className="h-1.5 w-24 bg-white/20 rounded-full overflow-hidden"><span className="block h-full bg-emerald-400 transition-all" style={{ width: `${Math.min(100, (cam.stableFor / 2500) * 100)}%` }} /></span>
                    )}
                  </div>
                )}
                {isReading && (
                  <div className="absolute inset-0 bg-stone-950/60 flex items-center justify-center font-bold animate-pulse">{ui('readingSlate', lang)}</div>
                )}
              </>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-stone-400 text-sm">{ui('cameraOff', lang)}</div>
            )}
            <div className="absolute top-2 right-2 flex gap-1">
              <button onClick={() => setCameraOn((v) => !v)} className="p-2 rounded-lg bg-black/50">{cameraOn ? <Camera className="w-4 h-4" /> : <CameraOff className="w-4 h-4" />}</button>
              <button onClick={() => setAutoCapture((v) => !v)} className={`px-2 rounded-lg text-[11px] font-bold ${autoCapture ? 'bg-emerald-600' : 'bg-black/50'}`}>AUTO</button>
            </div>
          </div>
        )}

        {isWaitingSlate && (
          <div className="space-y-2">
            <button onClick={done} className="w-full rounded-2xl bg-[#E5A823] text-stone-950 font-black text-lg py-4 flex items-center justify-center gap-2 active:scale-[0.98]">
              <Hand className="w-5 h-5" /> {ui('weAreDone', lang)}
            </button>
            <form onSubmit={sendTyped} className="flex gap-2">
              <input value={typed} onChange={(e) => setTyped(e.target.value)} placeholder={ui('typeAnswer', lang)} className="flex-1 rounded-xl bg-white/10 border border-white/15 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E5A823]" />
              <button className="px-3 rounded-xl bg-white/10"><Send className="w-4 h-4" /></button>
            </form>
          </div>
        )}

        {phase === 'waiting_choice' && step?.options && (
          <div className="grid grid-cols-1 gap-2">
            {step.options.map((o, i) => (
              <button key={i} onClick={() => api.submitChoice(code, groupId, i)} className="rounded-2xl bg-white/10 hover:bg-[#A36B46] border border-white/15 p-4 text-left text-[15px] font-semibold flex items-center gap-3 transition-colors">
                <span className="w-8 h-8 rounded-full bg-[#E5A823] text-stone-950 font-black flex items-center justify-center shrink-0">{i + 1}</span>
                {t(o, lang)}
              </button>
            ))}
          </div>
        )}

        {(phase === 'discussion' || phase === 'telling' || phase === 'feedback' || phase === 'intro') && (
          <button
            onClick={() => {
              stopAll();
              setSpeaking(false);
              api.continueLesson(code, groupId).catch((e) => setError(e.message));
            }}
            className={`w-full rounded-2xl border border-white/15 font-bold py-4 flex items-center justify-center gap-2 ${speaking ? 'bg-white/5 text-stone-400' : 'bg-white/10'}`}
          >
            <Play className="w-4 h-4" /> {ui('continue', lang)}
          </button>
        )}

        {phase === 'done' && (
          <div className="rounded-3xl bg-emerald-700/40 border border-emerald-500/40 p-5 text-center">
            <div className="text-4xl">🎉</div>
            <div className="font-serif font-black text-xl mt-2">{phaseLabel('done', lang)}</div>
            <div className="text-sm text-emerald-100 mt-1">{ui('score', lang)} : {group.lesson.score} · {ui('hints', lang)} : {group.lesson.hintsUsed}</div>
          </div>
        )}
      </section>

      {/* Barre d'actions */}
      <footer className="px-4 pb-4 pt-2 border-t border-white/10 space-y-3">
        <div className="grid grid-cols-3 gap-2 text-xs font-bold">
          <button onClick={() => api.requestHint(code, groupId)} disabled={phase === 'idle' || phase === 'done'} className="rounded-xl bg-white/10 py-3 flex flex-col items-center gap-1 disabled:opacity-40"><Lightbulb className="w-4 h-4 text-[#E5A823]" /> {ui('askHint', lang)}</button>
          <button onClick={() => setShowAsk((v) => !v)} className="rounded-xl bg-white/10 py-3 flex flex-col items-center gap-1"><HelpCircle className="w-4 h-4" /> {ui('askGriot', lang)}</button>
          <button onClick={() => api.setHelp(code, groupId, !group.needsHelp)} className={`rounded-xl py-3 flex flex-col items-center gap-1 ${group.needsHelp ? 'bg-red-600' : 'bg-white/10'}`}><Hand className="w-4 h-4" /> {group.needsHelp ? ui('cancelCall', lang) : ui('callTeacher', lang)}</button>
        </div>
        {showAsk && (
          <form onSubmit={sendQuestion} className="flex gap-2">
            <input autoFocus value={question} onChange={(e) => setQuestion(e.target.value)} placeholder={ui('askGriot', lang)} className="flex-1 rounded-xl bg-white/10 border border-white/15 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#E5A823]" />
            <button className="px-4 rounded-xl bg-[#A36B46] font-bold text-sm">{ui('send', lang)}</button>
          </form>
        )}
        <StandWidget pose={standPose} connected={group.standConnected} lang={lang} compact />
        {error && <p className="text-xs text-red-400">{error}</p>}
      </footer>
    </div>
  );
};

/* ================= Vue racine ================= */

export const GroupPhone: React.FC<{ code?: string; groupId?: string; lang: Lang; navigate: (p: string[]) => void }> = ({ code, groupId, lang, navigate }) => {
  if (code && groupId) return <Lesson code={code} groupId={groupId} uiLang={lang} onLeave={() => navigate(['groupe', code])} />;
  return <Join lang={lang} initialCode={code} onJoin={(c, g) => navigate(['groupe', c, g])} onBack={() => navigate([])} />;
};
