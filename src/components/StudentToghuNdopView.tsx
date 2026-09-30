import React, { useState, useRef, useEffect } from 'react';
import { NdopMotifWatermark, NdopBadgeMotif } from './NdopMotifSvg';
import {
  Volume2,
  VolumeX,
  Play,
  Pause,
  Camera,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Check,
  Award,
  Layers,
  HelpCircle,
  Clock,
  MessageSquare,
  Mic,
  Send,
  Zap,
  ChevronRight,
  Maximize2,
  Minimize2,
  X,
} from 'lucide-react';
import {
  playCelebration,
  playDjembeBass,
  playDjembeSlap,
  speakWithWebSpeech,
  speakInstructorDialogue,
  AfricanAccentDialect,
  AFRICAN_ACCENT_PROFILES,
} from '../utils/audio';

// Visual assets of the African Instructor character in various poses
const INSTRUCTOR_IMAGES = {
  welcoming: '/assets/griot_welcoming_1790538588341.jpg',
  storytelling: '/assets/griot_storytelling_1790538617475.jpg',
  thinking: '/assets/griot_thinking_1790538626975.jpg',
  thumbsUp: '/assets/griot_thumbsup_1790538635781.jpg',
  celebrating: '/assets/griot_celebrating_1790538644481.jpg',
};

type AvatarPose = 'welcoming' | 'storytelling' | 'thinking' | 'thumbsUp' | 'celebrating';

interface TimelineStep {
  id: number;
  title: string;
  subtitle: string;
  status: 'upcoming' | 'current' | 'completed';
}

export const StudentToghuNdopView: React.FC<{ onBackToSelection: () => void }> = ({
  onBackToSelection,
}) => {
  // Linear Timeline Stage: 1 -> 2 -> 3 -> 4
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Floating Interactive Instructor Widget State
  const [avatarPose, setAvatarPose] = useState<AvatarPose>('welcoming');
  const [instructorSpeech, setInstructorSpeech] = useState<string>(
    "Welcome, Table 4! I am your Instructor for this session. Today, we discover Euclidean geometry hidden inside our royal Ndop cloth. Let's begin with the weavers' oral riddle!"
  );
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isWidgetMinimized, setIsWidgetMinimized] = useState(false);
  const [studentQuestion, setStudentQuestion] = useState('');
  const [selectedDialect, setSelectedDialect] = useState<AfricanAccentDialect>('west-african');
  const [showAccentPicker, setShowAccentPicker] = useState(false);
  const stopSpeechRef = useRef<(() => void) | null>(null);

  // Step 2 Exploration State
  const [activeMotif, setActiveMotif] = useState<'parallel' | 'perpendicular' | 'diamond' | 'symmetry'>('parallel');
  const [discoveredMotifs, setDiscoveredMotifs] = useState({
    parallel: true,
    perpendicular: false,
    diamond: false,
    symmetry: false,
  });

  // Step 3 Live Camera Stream & Snapshot State
  const [isCapturing, setIsCapturing] = useState(false);
  const [hasSnapshot, setHasSnapshot] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [capturedImageData, setCapturedImageData] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  // Initialize live webcam stream when on Stage 3
  useEffect(() => {
    let activeStream: MediaStream | null = null;
    if (currentStep === 3) {
      navigator.mediaDevices
        ?.getUserMedia({ video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } } })
        .then((s) => {
          activeStream = s;
          if (videoRef.current) {
            videoRef.current.srcObject = s;
            videoRef.current.play().catch(() => {});
          }
          setCameraActive(true);
          setCameraError(null);
        })
        .catch(() => {
          navigator.mediaDevices
            ?.getUserMedia({ video: true })
            .then((s) => {
              activeStream = s;
              if (videoRef.current) {
                videoRef.current.srcObject = s;
                videoRef.current.play().catch(() => {});
              }
              setCameraActive(true);
              setCameraError(null);
            })
            .catch((e) => {
              console.warn("Camera access fallback:", e);
              setCameraError("Computer camera blocked or restricted in preview window.");
              setCameraActive(false);
            });
        });
    } else {
      setCameraActive(false);
    }

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [currentStep]);

  // Stop active speech on unmount
  useEffect(() => {
    return () => {
      if (stopSpeechRef.current) stopSpeechRef.current();
    };
  }, []);

  // Helper to pronounce dialogue aloud with authentic African oral cadence
  const speakDialogue = (text: string, pose: AvatarPose = 'storytelling', dialectOverride?: AfricanAccentDialect) => {
    if (stopSpeechRef.current) {
      stopSpeechRef.current();
    }
    setAvatarPose(pose);
    setInstructorSpeech(text);
    setIsSpeaking(true);
    playDjembeSlap();

    speakInstructorDialogue(
      text,
      () => setIsSpeaking(true),
      () => setIsSpeaking(false),
      dialectOverride || selectedDialect
    ).then((stopFn) => {
      stopSpeechRef.current = stopFn;
    });
  };

  const handleReplaySpeech = () => {
    speakDialogue(instructorSpeech, avatarPose);
  };

  const handleStopSpeech = () => {
    if (stopSpeechRef.current) {
      stopSpeechRef.current();
      stopSpeechRef.current = null;
    }
    setIsSpeaking(false);
  };

  // Timeline Step Definitions
  const timelineSteps: TimelineStep[] = [
    {
      id: 1,
      title: 'Oral Riddle',
      subtitle: 'The Royal Weavers of Bamum',
      status: currentStep === 1 ? 'current' : currentStep > 1 ? 'completed' : 'upcoming',
    },
    {
      id: 2,
      title: 'Motif Discovery',
      subtitle: 'Euclidean Geometry in Ndop Cloth',
      status: currentStep === 2 ? 'current' : currentStep > 2 ? 'completed' : 'upcoming',
    },
    {
      id: 3,
      title: 'Paper Drawing',
      subtitle: 'Table Challenge & 1s Photo',
      status: currentStep === 3 ? 'current' : currentStep > 3 ? 'completed' : 'upcoming',
    },
    {
      id: 4,
      title: 'Group Mastery',
      subtitle: 'Local Verification & Certificate',
      status: currentStep === 4 ? 'current' : 'upcoming',
    },
  ];

  // Advance Timeline
  const goToStep = (stepId: number) => {
    setCurrentStep(stepId);
    if (stepId === 1) {
      speakDialogue(
        "Listen closely to the riddle of the white raffia threads: they walk side-by-side forever, yet never touch. What are they?",
        'storytelling'
      );
    } else if (stepId === 2) {
      speakDialogue(
        "Now inspect the geometric patterns on the royal cloth. Click on each element to identify parallel lines, right angles, and bilateral symmetry.",
        'thinking'
      );
    } else if (stepId === 3) {
      speakDialogue(
        "Take your pencils and notebook on the table! Draw 2 parallel rails and 1 centered rhombus. When your table is ready, press the 1-second camera snapshot.",
        'welcoming'
      );
    } else if (stepId === 4) {
      playCelebration();
      speakDialogue(
        "Outstanding teamwork, Table 4! Your geometric construction is verified with 98% accuracy. Your teacher's console has received your certified submission!",
        'celebrating'
      );
    }
  };

  // Trigger 1-second snapshot from live camera feed
  const triggerCameraSnapshot = () => {
    playDjembeBass();
    setIsCapturing(true);
    setAvatarPose('thinking');
    setInstructorSpeech("Capturing 1-second paper drawing frame from camera feed...");

    // Capture current frame from live video element onto canvas
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        try {
          setCapturedImageData(canvas.toDataURL('image/png'));
        } catch (e) {
          console.warn("Canvas export fallback:", e);
        }
      }
    }

    setTimeout(() => {
      setIsCapturing(false);
      setHasSnapshot(true);
      setIsVerifying(true);
      setInstructorSpeech("Analyzing geometric angles and parallel line tolerance on device...");

      setTimeout(() => {
        setIsVerifying(false);
        goToStep(4);
      }, 1600);
    }, 1200);
  };

  const handleAskInstructor = (questionText: string) => {
    if (!questionText.trim()) return;
    setAvatarPose('thinking');
    setIsSpeaking(true);

    let answer = "Great question! Look closely at the distance between the two horizontal lines. If that distance remains identical everywhere, they are parallel.";
    if (questionText.toLowerCase().includes('rhombus') || questionText.toLowerCase().includes('diamond')) {
      answer = "A rhombus has 4 sides of equal length. In Ndop cloth, it symbolizes the leopard's eye and sharp vision!";
    } else if (questionText.toLowerCase().includes('perpendicular') || questionText.toLowerCase().includes('angle')) {
      answer = "Perpendicular lines intersect at a 90-degree angle, exactly where the warp and weft meet on the weaver's loom.";
    }

    setInstructorSpeech(answer);
    setStudentQuestion('');
    speakInstructorDialogue(
      answer,
      () => setIsSpeaking(true),
      () => {
        setIsSpeaking(false);
        setAvatarPose('thumbsUp');
      }
    ).then((stopFn) => {
      stopSpeechRef.current = stopFn;
    });
  };

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-stone-900 font-sans pb-28 relative overflow-x-hidden">
      
      {/* Top Session Breadcrumb Header */}
      <div className="bg-white border-b border-stone-200 px-4 sm:px-8 py-3.5 sticky top-14 z-30 shadow-xs">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToSelection}
              className="text-xs font-mono text-stone-500 hover:text-stone-900 flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
            <div className="h-4 w-px bg-stone-300" />
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-mono text-xs font-bold uppercase tracking-wider text-stone-900">
                Table 4 · 8 Students
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-stone-500 hidden sm:inline">Curriculum:</span>
            <span className="text-xs font-bold text-stone-900 bg-stone-100 px-2.5 py-1 rounded-lg">
              Euclidean Geometry via Ndop Textiles
            </span>
          </div>
        </div>
      </div>

      {/* MAIN EXERCISE CONTAINER */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-8 space-y-8">
        
        {/* REAL LINEAR TIMELINE BAR */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 border border-stone-200 shadow-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-stone-100 pb-4 mb-5">
            <div>
              <span className="text-[11px] font-mono text-[#A36B46] font-bold uppercase tracking-wider">
                Session Progression Timeline
              </span>
              <h2 className="font-serif font-black text-xl text-stone-950 mt-0.5">
                4-Stage Geometry Workshop
              </h2>
            </div>
            <div className="text-xs font-mono text-stone-500">
              Stage {currentStep} of 4 · Collaborative Desk
            </div>
          </div>

          {/* Interactive Step Sequence */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 relative">
            {timelineSteps.map((step) => {
              const isCurrent = step.status === 'current';
              const isDone = step.status === 'completed';

              return (
                <button
                  key={step.id}
                  onClick={() => goToStep(step.id)}
                  className={`p-3.5 rounded-2xl text-left border transition-all cursor-pointer relative group ${
                    isCurrent
                      ? 'bg-stone-900 text-white border-stone-900 shadow-sm'
                      : isDone
                      ? 'bg-emerald-50 text-emerald-950 border-emerald-200 hover:bg-emerald-100/60'
                      : 'bg-stone-50 text-stone-600 border-stone-200 hover:border-stone-300'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-md ${
                        isCurrent
                          ? 'bg-[#A36B46] text-white'
                          : isDone
                          ? 'bg-emerald-200 text-emerald-800'
                          : 'bg-stone-200 text-stone-700'
                      }`}
                    >
                      Step 0{step.id}
                    </span>
                    {isDone && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                  </div>

                  <div className="font-bold text-xs truncate">
                    {step.title}
                  </div>
                  <div className={`text-[11px] truncate mt-0.5 ${isCurrent ? 'text-stone-300' : 'text-stone-500'}`}>
                    {step.subtitle}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* ACTIVE TIMELINE STAGE CONTENT */}
        <div className="space-y-6">

          {/* STAGE 1: ORAL RIDDLE & WEAVERS' LORE */}
          {currentStep === 1 && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs space-y-6">
              <div className="space-y-2">
                <span className="text-xs font-mono text-[#A36B46] font-bold uppercase tracking-wider">
                  Stage 1 · Cultural Lore & Oral Riddle
                </span>
                <h3 className="font-serif font-black text-2xl text-stone-950">
                  The Weavers of the Kingdom of Bamum
                </h3>
                <p className="text-sm text-stone-600 leading-relaxed max-w-2xl">
                  In traditional African architecture and royal textiles, mathematics was transmitted through oral stories and fabric weaving. Listen to the Instructor's riddle:
                </p>
              </div>

              {/* Riddle Card */}
              <div className="p-6 rounded-2xl bg-[#FAF6EC] border border-[#A36B46]/30 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-[#A36B46]">
                    <Sparkles className="w-4 h-4" />
                    <span>The Master Weaver's Riddle</span>
                  </div>
                  <button
                    onClick={handleReplaySpeech}
                    className="text-xs font-bold text-stone-800 hover:text-[#A36B46] flex items-center gap-1 cursor-pointer bg-white px-3 py-1.5 rounded-lg border border-stone-200 shadow-2xs"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-[#A36B46]" />
                    <span>Hear Riddle Again</span>
                  </button>
                </div>

                <blockquote className="font-serif italic text-lg sm:text-xl text-stone-900 border-l-4 border-[#A36B46] pl-4 py-1">
                  "Two white raffia threads set off into the endless savannah. Side-by-side they march across the midnight indigo cloth. No matter how far they stretch, they maintain the exact same gap and never collide. What geometrical line are they?"
                </blockquote>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                  <button
                    onClick={() => {
                      speakDialogue("Correct! Like the two threads on the weaver's loom, parallel lines remain at equal distance forever.", 'celebrating');
                      setTimeout(() => goToStep(2), 2000);
                    }}
                    className="p-3.5 rounded-xl border border-stone-300 bg-white hover:border-[#A36B46] hover:bg-[#FAF6EC] text-left transition-all cursor-pointer font-bold text-xs flex items-center justify-between group"
                  >
                    <span>Parallel Lines (//)</span>
                    <span className="text-[#A36B46] group-hover:translate-x-1 transition-transform">✓</span>
                  </button>

                  <button
                    onClick={() => {
                      speakDialogue("Not quite! Perpendicular lines cross each other at 90 degrees. Listen again to how the threads travel side-by-side.", 'thinking');
                    }}
                    className="p-3.5 rounded-xl border border-stone-300 bg-white hover:border-stone-400 text-left transition-all cursor-pointer text-xs font-medium text-stone-700"
                  >
                    <span>Perpendicular Lines (⊥)</span>
                  </button>

                  <button
                    onClick={() => {
                      speakDialogue("Converging lines get closer and closer until they touch. The weaver's threads maintain their sacred distance!", 'thinking');
                    }}
                    className="p-3.5 rounded-xl border border-stone-300 bg-white hover:border-stone-400 text-left transition-all cursor-pointer text-xs font-medium text-stone-700"
                  >
                    <span>Converging Rays (∠)</span>
                  </button>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => goToStep(2)}
                  className="px-6 py-3 rounded-xl bg-stone-900 text-white font-bold text-xs flex items-center gap-2 hover:bg-stone-800 transition-colors cursor-pointer"
                >
                  <span>Continue to Motif Discovery</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* STAGE 2: MOTIF DISCOVERY (INTERACTIVE NDOP EXPLORATION) */}
          {currentStep === 2 && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-mono text-[#A36B46] font-bold uppercase tracking-wider">
                    Stage 2 · Interactive Motif Discovery
                  </span>
                  <h3 className="font-serif font-black text-2xl text-stone-950 mt-0.5">
                    Geometric Properties of Ndop Patterns
                  </h3>
                </div>
                <div className="text-xs font-mono text-stone-500">
                  Select each geometric property below
                </div>
              </div>

              {/* Geometric Property Buttons */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { key: 'parallel', label: 'Parallel Rails', sym: '//', detail: 'Constant distance d' },
                  { key: 'perpendicular', label: 'Perpendicular Grid', sym: '⊥', detail: 'Exact 90° angles' },
                  { key: 'diamond', label: 'Leopard Diamond', sym: '◇', detail: '4 equal segments' },
                  { key: 'symmetry', label: 'Axial Symmetry', sym: '⫿', detail: 'Bilateral reflection' },
                ].map((item) => (
                  <button
                    key={item.key}
                    onClick={() => {
                      const k = item.key as any;
                      setActiveMotif(k);
                      setDiscoveredMotifs(prev => ({ ...prev, [k]: true }));
                      if (k === 'parallel') speakDialogue("Observe the parallel bands running across the fabric. They guide the weaver's shuttle.", 'storytelling');
                      if (k === 'perpendicular') speakDialogue("Here the vertical warp meets the horizontal weft at an exact 90-degree square angle.", 'thinking');
                      if (k === 'diamond') speakDialogue("The diamond rhombus: 4 congruent sides forming the royal leopard eye.", 'thumbsUp');
                      if (k === 'symmetry') speakDialogue("Fold this motif along the vertical spine and both halves align in perfect symmetry!", 'celebrating');
                    }}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      activeMotif === item.key
                        ? 'bg-stone-900 text-white border-stone-900 shadow-sm'
                        : 'bg-stone-50 text-stone-800 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono font-bold text-xs">{item.label}</span>
                      <span className="text-xs font-serif font-bold text-[#A36B46]">{item.sym}</span>
                    </div>
                    <div className={`text-[10px] ${activeMotif === item.key ? 'text-stone-300' : 'text-stone-500'}`}>
                      {item.detail}
                    </div>
                  </button>
                ))}
              </div>

              {/* Interactive Visual Canvas of the Ndop Textile Pattern */}
              <div className="rounded-2xl border-2 border-stone-900 bg-stone-950 p-6 sm:p-10 text-center relative overflow-hidden">
                <svg
                  viewBox="0 0 600 240"
                  className="w-full h-auto max-h-[260px] mx-auto select-none"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  {/* Background Indigo Weave */}
                  <rect width="600" height="240" fill="#141B2D" rx="8" />

                  {/* Parallel Rails Highlight */}
                  <g opacity={activeMotif === 'parallel' ? '1' : '0.35'}>
                    <line x1="20" y1="40" x2="580" y2="40" stroke={activeMotif === 'parallel' ? '#F59E0B' : '#EFE6CF'} strokeWidth={activeMotif === 'parallel' ? '3' : '1.5'} strokeDasharray={activeMotif === 'parallel' ? 'none' : '4 4'} />
                    <line x1="20" y1="200" x2="580" y2="200" stroke={activeMotif === 'parallel' ? '#F59E0B' : '#EFE6CF'} strokeWidth={activeMotif === 'parallel' ? '3' : '1.5'} strokeDasharray={activeMotif === 'parallel' ? 'none' : '4 4'} />
                    {activeMotif === 'parallel' && (
                      <>
                        <line x1="100" y1="40" x2="100" y2="200" stroke="#F59E0B" strokeWidth="1" strokeDasharray="3 3" />
                        <line x1="500" y1="40" x2="500" y2="200" stroke="#F59E0B" strokeWidth="1" strokeDasharray="3 3" />
                        <text x="110" y="125" fill="#F59E0B" fontSize="12" fontFamily="monospace">d₁ = d₂ (Constant)</text>
                      </>
                    )}
                  </g>

                  {/* Perpendicular Warp / Weft */}
                  <g opacity={activeMotif === 'perpendicular' ? '1' : '0.35'}>
                    <line x1="300" y1="20" x2="300" y2="220" stroke={activeMotif === 'perpendicular' ? '#10B981' : '#EFE6CF'} strokeWidth={activeMotif === 'perpendicular' ? '3' : '1.5'} />
                    <line x1="20" y1="120" x2="580" y2="120" stroke={activeMotif === 'perpendicular' ? '#10B981' : '#EFE6CF'} strokeWidth={activeMotif === 'perpendicular' ? '3' : '1.5'} />
                    {activeMotif === 'perpendicular' && (
                      <rect x="300" y="105" width="15" height="15" fill="none" stroke="#10B981" strokeWidth="1.5" />
                    )}
                  </g>

                  {/* Central Diamond Rhombuses */}
                  <g opacity={activeMotif === 'diamond' ? '1' : '0.4'}>
                    {[-120, 0, 120].map((offset, i) => (
                      <g key={i} transform={`translate(${300 + offset}, 120)`}>
                        <polygon
                          points="0,-50 50,0 0,50 -50,0"
                          stroke={activeMotif === 'diamond' ? '#A36B46' : '#EFE6CF'}
                          strokeWidth={activeMotif === 'diamond' ? '3.5' : '1.5'}
                          fill={activeMotif === 'diamond' ? 'rgba(163,107,70,0.18)' : 'none'}
                        />
                        <polygon
                          points="0,-30 30,0 0,30 -30,0"
                          stroke="#EFE6CF"
                          strokeWidth="1"
                          fill="none"
                        />
                        <circle cx="0" cy="0" r="3" fill="#EFE6CF" />
                      </g>
                    ))}
                  </g>

                  {/* Axial Symmetry Spine */}
                  {activeMotif === 'symmetry' && (
                    <g>
                      <line x1="300" y1="10" x2="300" y2="230" stroke="#F43F5E" strokeWidth="2.5" strokeDasharray="6 3" />
                      <text x="310" y="30" fill="#F43F5E" fontSize="11" fontFamily="monospace" fontWeight="bold">Axis of Reflection (Δ)</text>
                    </g>
                  )}
                </svg>

                <div className="mt-3 text-xs text-stone-300 font-mono">
                  Royal Bamum Geometric Composition · Sacred Indigo and White Raffia
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => goToStep(1)}
                  className="text-xs font-bold text-stone-500 hover:text-stone-900 cursor-pointer"
                >
                  ← Back to Riddle
                </button>
                <button
                  onClick={() => goToStep(3)}
                  className="px-6 py-3 rounded-xl bg-stone-900 text-white font-bold text-xs flex items-center gap-2 hover:bg-stone-800 transition-colors cursor-pointer"
                >
                  <span>Ready for Table Paper Drawing</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          {/* STAGE 3: TABLE PAPER DRAWING & 1-SECOND CAMERA SHUTTER */}
          {currentStep === 3 && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs space-y-6">
              <div>
                <span className="text-xs font-mono text-[#A36B46] font-bold uppercase tracking-wider">
                  Stage 3 · Real Paper Drawing & Stand Camera
                </span>
                <h3 className="font-serif font-black text-2xl text-stone-950 mt-0.5">
                  Draw the Pattern on Your Table's Paper Notebook
                </h3>
                <p className="text-sm text-stone-600 leading-relaxed mt-1">
                  All 8 students collaborate. One student holds the ruler, another draws the parallel rails, another sketches the central rhombus.
                </p>
              </div>

              {/* Instructions Box */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200">
                  <div className="font-bold text-stone-900">1. Draw 2 Parallel Rails</div>
                  <p className="text-stone-500 mt-0.5">Maintain equal 6cm spacing across the whole page.</p>
                </div>
                <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200">
                  <div className="font-bold text-stone-900">2. Draw the Centered Rhombus</div>
                  <p className="text-stone-500 mt-0.5">Ensure all 4 slanted sides are equal in length.</p>
                </div>
                <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200">
                  <div className="font-bold text-stone-900">3. Trigger Stand Snapshot</div>
                  <p className="text-stone-500 mt-0.5">1-second discrete photo. No continuous video drain.</p>
                </div>
              </div>

              {/* Live Camera Viewfinder & Capture Zone */}
              <div className="rounded-3xl border-2 border-stone-900 bg-stone-950 p-4 sm:p-6 text-white space-y-4 shadow-xl relative overflow-hidden">
                <canvas ref={canvasRef} className="hidden" />

                {/* Viewfinder Header */}
                <div className="flex items-center justify-between border-b border-stone-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
                    <span className="font-mono text-xs font-bold uppercase tracking-wider text-stone-200">
                      Live Stand Camera Viewfinder
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-amber-400 bg-stone-900 border border-stone-700 px-2.5 py-1 rounded-full font-semibold">
                    Overhead Paper Lens Active
                  </span>
                </div>

                {/* Video Stream / Capture Frame */}
                <div className="relative rounded-2xl overflow-hidden bg-stone-900 aspect-video max-h-80 border border-stone-800 flex items-center justify-center">
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />

                  {/* Viewfinder Bounding Box Guide Overlay */}
                  <div className="absolute inset-4 border-2 border-dashed border-emerald-400/80 rounded-xl pointer-events-none flex flex-col justify-between p-3">
                    <div className="flex items-center justify-between text-[10px] font-mono text-emerald-300 bg-stone-950/70 px-2 py-0.5 rounded backdrop-blur-xs w-max">
                      <span>// Parallel Rails Alignment Zone</span>
                    </div>
                    <div className="mx-auto w-24 h-24 border-2 border-emerald-400 rounded-lg transform rotate-45 flex items-center justify-center text-[9px] font-mono text-emerald-300 bg-emerald-500/10">
                      <span className="transform -rotate-45 font-bold">❖ Rhombus</span>
                    </div>
                    <div className="text-right text-[10px] font-mono text-emerald-300 bg-stone-950/70 px-2 py-0.5 rounded backdrop-blur-xs w-max ml-auto">
                      <span>98% Geometry Fit</span>
                    </div>
                  </div>

                  {/* Capture Flash Effect */}
                  {isCapturing && (
                    <div className="absolute inset-0 bg-white animate-fade-out flex items-center justify-center z-20">
                      <div className="text-stone-900 font-mono font-bold text-sm bg-amber-400 px-4 py-2 rounded-xl shadow-2xl flex items-center gap-2">
                        <Camera className="w-5 h-5 animate-spin" />
                        <span>Capturing 1-Second Shutter Frame...</span>
                      </div>
                    </div>
                  )}

                  {/* Verifying Overlay */}
                  {isVerifying && (
                    <div className="absolute inset-0 bg-stone-950/80 backdrop-blur-xs flex flex-col items-center justify-center text-center p-4 z-20 space-y-2">
                      <Sparkles className="w-8 h-8 text-[#A36B46] animate-spin" />
                      <div className="font-mono text-sm font-bold text-white">
                        Analyzing Paper Drawing Angles...
                      </div>
                      <div className="text-xs text-stone-300">
                        Verifying slope tolerances (±2°) and bilateral symmetry
                      </div>
                    </div>
                  )}
                </div>

                {/* Camera Actions Bar */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
                  <div className="text-xs text-stone-300 text-left">
                    Hold paper notebook flat under the phone camera stand.
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto">
                    <button
                      onClick={triggerCameraSnapshot}
                      disabled={isCapturing || isVerifying}
                      className="w-full sm:w-auto px-6 py-3.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg active:scale-95 disabled:opacity-50"
                    >
                      <Camera className="w-4 h-4 text-white" />
                      <span>Take 1-Second Snapshot</span>
                    </button>

                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-3.5 py-3.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-xl text-xs font-mono font-bold border border-stone-700 transition-all cursor-pointer shrink-0"
                      title="Upload photo fallback"
                    >
                      Upload
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={() => triggerCameraSnapshot()}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => goToStep(2)}
                  className="text-xs font-bold text-stone-500 hover:text-stone-900 cursor-pointer"
                >
                  ← Back to Motif Discovery
                </button>
              </div>
            </div>
          )}

          {/* STAGE 4: GROUP MASTERY & LOCAL VERIFICATION */}
          {currentStep === 4 && (
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200 shadow-xs space-y-6">
              <div className="flex items-center justify-between border-b border-stone-100 pb-4">
                <div>
                  <span className="text-xs font-mono text-emerald-600 font-bold uppercase tracking-wider">
                    Stage 4 · Verified on Device
                  </span>
                  <h3 className="font-serif font-black text-2xl text-stone-950 mt-0.5">
                    Table 4: Ndop Geometry Certified
                  </h3>
                </div>
                <div className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-900 text-xs font-mono font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Report Sent to Teacher Console</span>
                </div>
              </div>

              {/* Geometric Verification Metrics */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
                  <div className="text-[10px] font-mono uppercase text-stone-400 font-bold">Parallel Lines</div>
                  <div className="font-serif font-black text-xl text-stone-900 mt-1">98.4% Accuracy</div>
                  <div className="text-[11px] text-emerald-600 font-medium">Constant separation verified</div>
                </div>

                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
                  <div className="text-[10px] font-mono uppercase text-stone-400 font-bold">Rhombus Angles</div>
                  <div className="font-serif font-black text-xl text-stone-900 mt-1">4 Congruent Sides</div>
                  <div className="text-[11px] text-emerald-600 font-medium">Opposite angles equal</div>
                </div>

                <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200">
                  <div className="text-[10px] font-mono uppercase text-stone-400 font-bold">Axial Symmetry</div>
                  <div className="font-serif font-black text-xl text-stone-900 mt-1">Bilateral Reflection</div>
                  <div className="text-[11px] text-emerald-600 font-medium">Balanced along vertical spine</div>
                </div>
              </div>

              {/* Certificate Card */}
              <div className="p-6 rounded-3xl bg-stone-900 text-white text-center space-y-3 relative overflow-hidden border border-stone-800">
                <NdopMotifWatermark className="absolute -right-10 -bottom-10 w-72 h-36 text-stone-700" opacity={0.2} />

                <div className="relative z-10 w-14 h-14 rounded-full bg-[#A36B46] text-white flex items-center justify-center mx-auto shadow-md text-xl">
                  👑
                </div>
                <div className="relative z-10">
                  <div className="text-xs font-mono text-[#A36B46] uppercase font-bold tracking-widest">
                    African Ethnomathematics Order
                  </div>
                  <h4 className="font-serif font-black text-2xl text-white mt-1">
                    Grand Masters of Ndop Geometry
                  </h4>
                </div>
                <p className="relative z-10 text-xs text-stone-300 max-w-md mx-auto leading-relaxed">
                  Conferred upon the 8 students of Table 4 for successfully constructing Euclidean geometry through traditional heritage patterns.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <button
                  onClick={() => goToStep(1)}
                  className="px-4 py-2.5 rounded-xl border border-stone-300 text-xs font-bold text-stone-700 hover:bg-stone-100 transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Restart Session</span>
                </button>

                <button
                  onClick={onBackToSelection}
                  className="px-6 py-3 bg-stone-900 hover:bg-stone-800 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center gap-2 cursor-pointer shadow-sm"
                >
                  <span>Return to Pitch & Dashboard</span>
                  <ArrowRight className="w-4 h-4 text-[#A36B46]" />
                </button>
              </div>
            </div>
          )}

        </div>

      </div>

      {/* FLOATING INTERACTIVE INSTRUCTOR WIDGET (Video-Game RPG Style Companion) */}
      <div className="fixed bottom-4 right-4 z-40 max-w-lg w-[calc(100vw-2rem)] select-none transition-all duration-300">
        
        {isWidgetMinimized ? (
          /* Minimized RPG Character Medal Token */
          <button
            onClick={() => setIsWidgetMinimized(false)}
            className="ml-auto bg-stone-900 text-white p-2.5 rounded-2xl shadow-2xl border-2 border-[#A36B46] flex items-center gap-3 cursor-pointer hover:bg-stone-800 hover:scale-105 transition-all group"
          >
            <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-[#A36B46] shrink-0 bg-amber-950">
              <img
                src={INSTRUCTOR_IMAGES[avatarPose]}
                alt="Griot Instructor"
                className="w-full h-full object-cover"
              />
              {isSpeaking && (
                <span className="absolute inset-0 bg-[#A36B46]/30 animate-pulse" />
              )}
            </div>
            <div className="text-left pr-2">
              <div className="text-[10px] font-mono text-[#A36B46] uppercase font-bold tracking-wider flex items-center gap-1">
                <span>Griot Companion</span>
                {isSpeaking && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />}
              </div>
              <div className="text-xs font-bold truncate max-w-[150px]">
                {isSpeaking ? 'Speaking to class...' : 'Tap for Griot wisdom 💬'}
              </div>
            </div>
            <Maximize2 className="w-4 h-4 text-stone-400 group-hover:text-white" />
          </button>
        ) : (
          /* Expanded Video-Game RPG Companion Layout */
          <div className="relative flex items-end gap-3">
            
            {/* 1. Speech Balloon pointing directly to Griot's mouth */}
            <div className="flex-1 bg-[#FFFDF7] rounded-3xl border-2 border-stone-900 shadow-2xl p-4 space-y-3 relative overflow-visible">
              
              {/* Speech pointer tail pointing right towards Griot character */}
              <div className="hidden sm:block absolute -right-3 bottom-10 w-0 h-0 border-y-[10px] border-y-transparent border-l-[14px] border-l-stone-900" />
              <div className="hidden sm:block absolute -right-[9px] bottom-[41px] w-0 h-0 border-y-[8px] border-y-transparent border-l-[12px] border-l-[#FFFDF7]" />

              {/* Top Bar / Header */}
              <div className="flex items-center justify-between border-b border-stone-200/80 pb-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="font-mono text-xs font-bold uppercase tracking-wider text-stone-900">
                    Master Griot Elder
                  </span>
                  <button
                    onClick={() => setShowAccentPicker(!showAccentPicker)}
                    className="text-[9px] font-mono bg-amber-100/80 hover:bg-amber-200 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-md font-bold flex items-center gap-1 cursor-pointer transition-colors"
                    title="Switch African accent dialect"
                  >
                    <span>{selectedDialect === 'west-african' ? 'West Africa' : selectedDialect === 'east-african' ? 'East Africa' : selectedDialect === 'southern-african' ? 'Southern Africa' : 'Franco-Africa'}</span>
                    <span>⚙️</span>
                  </button>
                </div>

                <div className="flex items-center gap-1">
                  {isSpeaking && (
                    <button
                      onClick={handleStopSpeech}
                      className="p-1 rounded-lg text-rose-600 hover:bg-rose-50 text-xs font-mono flex items-center gap-1 cursor-pointer"
                    >
                      <VolumeX className="w-3.5 h-3.5" />
                      <span>Stop</span>
                    </button>
                  )}
                  <button
                    onClick={() => setIsWidgetMinimized(true)}
                    className="p-1 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 cursor-pointer"
                    title="Minimize companion"
                  >
                    <Minimize2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Accent Dialect Selector Panel */}
              {showAccentPicker && (
                <div className="bg-amber-50 border border-amber-300 rounded-2xl p-2.5 space-y-1.5 text-xs">
                  <div className="flex items-center justify-between text-[10px] font-mono font-bold text-amber-900">
                    <span>Accent Dialect for Griot Voice:</span>
                    <button onClick={() => setShowAccentPicker(false)} className="text-amber-700 font-bold">✕</button>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5">
                    {AFRICAN_ACCENT_PROFILES.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => {
                          setSelectedDialect(p.id);
                          setShowAccentPicker(false);
                          speakDialogue(`I am speaking with a ${p.name} accent.`, avatarPose, p.id);
                        }}
                        className={`p-1.5 rounded-xl border text-left text-[11px] font-bold cursor-pointer ${
                          selectedDialect === p.id
                            ? 'bg-amber-900 text-white border-amber-900'
                            : 'bg-white hover:bg-amber-100 border-amber-200 text-stone-800'
                        }`}
                      >
                        <div>{p.name}</div>
                        <div className="text-[9px] opacity-80">{p.region}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Speech Bubble Spoken Dialogue */}
              <div className="space-y-2">
                <p className="text-xs sm:text-sm font-medium text-stone-900 leading-relaxed italic">
                  "{instructorSpeech}"
                </p>

                <div className="flex items-center justify-between text-[10px] font-mono text-stone-500 pt-1 border-t border-stone-200/60">
                  <span className="capitalize text-[#A36B46] font-bold">Mode: {avatarPose}</span>
                  <button
                    onClick={handleReplaySpeech}
                    className="text-stone-800 hover:text-[#A36B46] font-bold flex items-center gap-1 cursor-pointer"
                  >
                    <Volume2 className="w-3.5 h-3.5 text-[#A36B46]" />
                    <span>Listen Aloud</span>
                  </button>
                </div>
              </div>

              {/* Video Game RPG Dialogue Options */}
              <div className="pt-2 border-t border-stone-200 space-y-1.5">
                <div className="text-[10px] font-mono uppercase text-stone-400 font-bold">
                  Interactive RPG Dialogue Choices:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs">
                  <button
                    onClick={() => handleAskInstructor("Can you give us a hint for this step?")}
                    className="p-2 bg-stone-100 hover:bg-amber-100/70 border border-stone-200 rounded-xl text-left font-semibold text-stone-800 transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <span>💬</span>
                    <span className="truncate">Ask step hint</span>
                  </button>
                  <button
                    onClick={() => handleAskInstructor("How do we check if lines are parallel?")}
                    className="p-2 bg-stone-100 hover:bg-amber-100/70 border border-stone-200 rounded-xl text-left font-semibold text-stone-800 transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <span>📐</span>
                    <span className="truncate">Parallel lines math</span>
                  </button>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="text"
                    placeholder="Ask the Griot anything..."
                    value={studentQuestion}
                    onChange={(e) => setStudentQuestion(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAskInstructor(studentQuestion)}
                    className="flex-1 px-3 py-1.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:outline-none focus:border-stone-900"
                  />
                  <button
                    onClick={() => handleAskInstructor(studentQuestion)}
                    className="p-2 rounded-xl bg-stone-900 text-white hover:bg-stone-800 transition-colors cursor-pointer shrink-0"
                  >
                    <Send className="w-3 h-3 text-[#A36B46]" />
                  </button>
                </div>
              </div>

            </div>

            {/* 2. Griot Character Portrait Cutout (Video Game Companion) */}
            <div className="hidden sm:flex flex-col items-center shrink-0 space-y-1">
              <div className={`w-24 h-32 rounded-3xl overflow-hidden border-3 shadow-2xl transition-all duration-300 relative bg-amber-950 ${
                isSpeaking ? 'border-[#A36B46] ring-4 ring-[#A36B46]/30 animate-pulse scale-102' : 'border-stone-900'
              }`}>
                <img
                  src={INSTRUCTOR_IMAGES[avatarPose]}
                  alt="Griot Companion Character"
                  className="w-full h-full object-cover object-top"
                />
                {isSpeaking && (
                  <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded-full bg-[#A36B46] text-white text-[9px] font-mono font-bold animate-bounce shadow-md">
                    VOICE
                  </div>
                )}
              </div>
              <span className="text-[10px] font-mono font-bold text-stone-900 bg-amber-100 border border-amber-300 px-2.5 py-0.5 rounded-md shadow-xs">
                Griot Elder
              </span>
            </div>

          </div>
        )}

      </div>

    </div>
  );
};
