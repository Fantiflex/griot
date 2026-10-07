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
import { Logo } from '@/components/Logo';

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
    <div className="night min-h-screen bg-night text-white flex flex-col">
      <div className="h-14 px-4 flex items-center gap-3">
        <button onClick={onBack} className="btn btn-ghost px-2 -ml-2"><ArrowLeft className="w-4 h-4" /></button>
        <Logo size={22} accent="var(--color-accent)" />
      </div>
      <div className="flex-1 flex flex-col items-center justify-center px-6 pb-20">
        {!classroom ? (
          <form onSubmit={lookup} className="w-full max-w-sm space-y-5">
            <div>
              <h1 className="text-2xl font-semibold">{ui('groupEntry', lang)}</h1>
              <p className="text-white/60 text-sm mt-1">{ui('enterCode', lang)}</p>
            </div>
            <input
              autoFocus
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              maxLength={6}
              className="field text-center font-mono text-3xl tracking-[0.35em] py-4"
              placeholder="ABC123"
            />
            {error && <p className="text-danger text-sm">{error}</p>}
            <button disabled={busy} className="btn btn-accent w-full py-3.5 text-base">{ui('join', lang)}</button>
          </form>
        ) : (
          <div className="w-full max-w-md space-y-5">
            <div>
              <div className="font-mono text-xs text-white/50 tracking-widest">{classroom.code}</div>
              <h1 className="text-2xl font-semibold mt-1">{classroom.name}</h1>
              <p className="text-white/60 text-sm mt-1">{ui('chooseGroup', classroom.lang)}</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {classroom.groups.map((g) => (
                <button key={g.id} onClick={() => onJoin(classroom.code, g.id)} className="rounded-xl border border-white/12 bg-white/[0.04] hover:bg-white/10 hover:border-white/30 p-4 text-left transition-colors">
                  <div className="text-2xl">{g.totem}</div>
                  <div className="font-medium mt-2">{g.name}</div>
                  <div className="text-xs text-white/50 mt-0.5">{g.joinedDevices} {ui('devices', classroom.lang)}</div>
                </button>
              ))}
            </div>
            <button onClick={() => setClassroom(null)} className="btn btn-ghost w-full">{ui('back', lang)}</button>
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
    api
      .getGroup(code, groupId)
      .then((g) => {
        setGroup(g);
        setStandPose(g.standPose);
        for (const u of g.transcript) seen.current.add(u.id);
        const last = g.transcript[g.transcript.length - 1];
        if (last) {
          setCurrent(last);
          setPose(last.pose);
        }
      })
      .catch(() => {});
    return () => stopAll();
  }, [code, groupId]);

  useEffect(() => {
    if (!classroom) return;
    api.journeys().then((js) => setJourney(js.find((j) => j.id === classroom.journeyId) ?? js[0])).catch(() => {});
  }, [classroom?.journeyId]);

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
  const continueNow = () => {
    stopAll();
    setSpeaking(false);
    api.continueLesson(code, groupId).catch((e) => setError(e.message));
  };

  if (!group || !classroom) {
    return <div className="night min-h-screen bg-night text-white/60 flex items-center justify-center text-sm">{error ?? ui('connecting', uiLang)}</div>;
  }

  const totalSteps = workshop?.steps.length ?? 0;
  const isWaitingSlate = phase === 'waiting_slate';
  const isReading = phase === 'reading';
  const canContinue = phase === 'discussion' || phase === 'telling' || phase === 'feedback' || phase === 'intro';

  return (
    <div className="night min-h-screen bg-night text-white flex flex-col select-none">
      {!awake && (
        <button onClick={wakeUp} className="fixed inset-0 z-50 bg-night flex flex-col items-center justify-center gap-8 p-8 text-center">
          <GriotAvatar pose="welcoming" speaking={false} size={160} />
          <div>
            <div className="text-2xl font-semibold">{group.totem} {group.name}</div>
            <div className="text-white/50 mt-2 text-sm">{ui('tapToStart', lang)}</div>
          </div>
        </button>
      )}

      <header className="h-12 px-3 flex items-center justify-between text-xs border-b border-white/10">
        <div className="flex items-center gap-2 min-w-0">
          <button onClick={onLeave} className="btn btn-ghost px-2"><ArrowLeft className="w-4 h-4" /></button>
          <span className="font-mono text-white/60">{classroom.code}</span>
          <span className="text-white/40">·</span>
          <span className="text-white/80 truncate">{group.totem} {group.name}</span>
        </div>
        <div className="flex items-center gap-1">
          <span className={`w-1.5 h-1.5 rounded-full mr-1 ${status === 'open' ? 'bg-ok' : 'bg-warn'}`} />
          <button onClick={toggleMute} className="btn btn-ghost px-2" title={muted ? ui('unmute', lang) : ui('mute', lang)}>
            {muted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
        </div>
      </header>

      <section className="px-4 pt-5 flex items-start gap-4">
        <GriotAvatar pose={pose} speaking={speaking} size={88} />
        <div className="flex-1 min-w-0">
          <div className="eyebrow text-white/40">
            {workshop ? `${t(SUBJECT_LABELS[workshop.subject], lang)} · ${ui('step', lang)} ${Math.min(group.lesson.stepIndex + 1, totalSteps)}/${totalSteps}` : ui('workshop', lang)}
          </div>
          <div className="mt-2 relative rounded-2xl rounded-tl-sm bg-white text-ink p-4 text-[15px] leading-relaxed min-h-[84px]">
            {current ? current.text : workshop ? t(workshop.title, lang) : '…'}
            {current?.fromModel && <span className="absolute -bottom-2 right-3 pill bg-accent text-white">IA</span>}
          </div>
          <div className="mt-2 flex items-center gap-3 text-[11px] text-white/50">
            <span>{phaseLabel(phase, lang)}</span>
            {speaking && <span>· {ui('speaking', lang)}</span>}
            {current && !speaking && (
              <button
                onClick={() => {
                  seen.current.delete(current.id);
                  handleSay(current);
                }}
                className="inline-flex items-center gap-1 hover:text-white"
              >
                <RotateCcw className="w-3 h-3" /> {ui('replay', lang)}
              </button>
            )}
          </div>
        </div>
      </section>

      <section className="flex-1 px-4 pt-5 pb-3 flex flex-col gap-3">
        {phase === 'idle' && (
          <button onClick={() => api.startLesson(code, groupId)} className="flex-1 min-h-[180px] rounded-2xl bg-accent hover:bg-accent-2 transition-colors flex flex-col items-center justify-center gap-3 text-xl font-semibold">
            <Play className="w-8 h-8" /> {ui('startLesson', lang)}
            {workshop && <span className="text-sm font-normal text-white/80">{t(workshop.title, lang)}</span>}
          </button>
        )}

        {(isWaitingSlate || isReading) && (
          <div className={`relative rounded-2xl overflow-hidden bg-black aspect-[4/3] max-h-[42vh] mx-auto w-full transition-shadow ${flash ? 'ring-2 ring-white' : ''}`}>
            {cameraOn ? (
              <>
                <video ref={cam.videoRef} playsInline muted className="w-full h-full object-cover" />
                {cam.status === 'blocked' && <div className="absolute inset-0 flex items-center justify-center text-center text-sm text-white/60 p-6">{ui('cameraBlocked', lang)}</div>}
                {cam.status === 'starting' && <div className="absolute inset-0 flex items-center justify-center text-white/50 text-sm">{ui('connecting', lang)}</div>}
                <div className="absolute inset-4 border border-white/30 rounded-xl pointer-events-none" />
                {cam.status === 'live' && isWaitingSlate && (
                  <div className="absolute bottom-2 left-2 right-2 flex items-center gap-2 text-[11px] text-white/80">
                    <span className={`w-1.5 h-1.5 rounded-full ${cam.motion > 6 ? 'bg-warn' : 'bg-ok'}`} />
                    <span className="flex-1 truncate">{autoCapture ? ui('autoCapture', lang) : ui('camera', lang)}</span>
                    {autoCapture && cam.motion <= 6 && (
                      <span className="h-1 w-20 bg-white/20 rounded-full overflow-hidden"><span className="block h-full bg-ok transition-all" style={{ width: `${Math.min(100, (cam.stableFor / 2500) * 100)}%` }} /></span>
                    )}
                  </div>
                )}
                {isReading && <div className="absolute inset-0 bg-night/70 flex items-center justify-center text-sm font-medium animate-pulse">{ui('readingSlate', lang)}</div>}
              </>
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-white/50 text-sm">{ui('cameraOff', lang)}</div>
            )}
            <div className="absolute top-2 right-2 flex gap-1">
              <button onClick={() => setCameraOn((v) => !v)} className="p-2 rounded-lg bg-black/60 hover:bg-black/80">{cameraOn ? <Camera className="w-4 h-4" /> : <CameraOff className="w-4 h-4" />}</button>
              <button onClick={() => setAutoCapture((v) => !v)} className={`px-2 rounded-lg text-[11px] font-mono ${autoCapture ? 'bg-ok text-white' : 'bg-black/60'}`}>AUTO</button>
            </div>
          </div>
        )}

        {isWaitingSlate && (
          <div className="space-y-2">
            <button onClick={done} className="btn btn-accent w-full py-3.5 text-base"><Hand className="w-5 h-5" /> {ui('weAreDone', lang)}</button>
            <form onSubmit={sendTyped} className="flex gap-2">
              <input value={typed} onChange={(e) => setTyped(e.target.value)} placeholder={ui('typeAnswer', lang)} className="field" />
              <button className="btn btn-outline px-3"><Send className="w-4 h-4" /></button>
            </form>
          </div>
        )}

        {phase === 'waiting_choice' && step?.options && (
          <div className="grid grid-cols-1 gap-2">
            {step.options.map((o, i) => (
              <button key={i} onClick={() => api.submitChoice(code, groupId, i)} className="rounded-xl border border-white/12 bg-white/[0.04] hover:bg-white/10 hover:border-white/30 p-4 text-left text-[15px] flex items-center gap-3 transition-colors">
                <span className="w-7 h-7 rounded-full border border-white/30 text-sm font-mono flex items-center justify-center shrink-0">{i + 1}</span>
                {t(o, lang)}
              </button>
            ))}
          </div>
        )}

        {canContinue && (
          <button onClick={continueNow} className={`btn btn-outline w-full py-3.5 ${speaking ? 'opacity-60' : ''}`}>
            <Play className="w-4 h-4" /> {ui('continue', lang)}
          </button>
        )}

        {phase === 'done' && (
          <div className="rounded-2xl border border-ok/40 bg-ok/10 p-5 text-center">
            <div className="text-lg font-semibold">{phaseLabel('done', lang)}</div>
            <div className="text-sm text-white/70 mt-1">{ui('score', lang)} {group.lesson.score} · {ui('hints', lang)} {group.lesson.hintsUsed}</div>
          </div>
        )}
      </section>

      <footer className="px-4 pb-4 pt-3 border-t border-white/10 space-y-3">
        <div className="grid grid-cols-3 gap-2">
          <button onClick={() => api.requestHint(code, groupId)} disabled={phase === 'idle' || phase === 'done'} className="btn btn-outline py-3 flex-col gap-1 text-xs"><Lightbulb className="w-4 h-4" /> {ui('askHint', lang)}</button>
          <button onClick={() => setShowAsk((v) => !v)} className="btn btn-outline py-3 flex-col gap-1 text-xs"><HelpCircle className="w-4 h-4" /> {ui('askGriot', lang)}</button>
          <button onClick={() => api.setHelp(code, groupId, !group.needsHelp)} className={`btn py-3 flex-col gap-1 text-xs ${group.needsHelp ? 'bg-danger text-white' : 'btn-outline'}`}><Hand className="w-4 h-4" /> {group.needsHelp ? ui('cancelCall', lang) : ui('callTeacher', lang)}</button>
        </div>
        {showAsk && (
          <form onSubmit={sendQuestion} className="flex gap-2">
            <input autoFocus value={question} onChange={(e) => setQuestion(e.target.value)} placeholder={ui('askGriot', lang)} className="field" />
            <button className="btn btn-accent">{ui('send', lang)}</button>
          </form>
        )}
        <StandWidget pose={standPose} connected={group.standConnected} lang={lang} compact dark />
        {error && <p className="text-xs text-danger">{error}</p>}
      </footer>
    </div>
  );
};

/* ================= Vue racine ================= */

export const GroupPhone: React.FC<{ code?: string; groupId?: string; lang: Lang; navigate: (p: string[]) => void }> = ({ code, groupId, lang, navigate }) => {
  if (code && groupId) return <Lesson code={code} groupId={groupId} uiLang={lang} onLeave={() => navigate(['groupe', code])} />;
  return <Join lang={lang} initialCode={code} onJoin={(c, g) => navigate(['groupe', c, g])} onBack={() => navigate([])} />;
};
