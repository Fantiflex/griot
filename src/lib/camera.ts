import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * Caméra du téléphone posé sur le support, pointée vers l'ardoise.
 *  - flux vidéo arrière en basse résolution (économie de batterie et de réseau)
 *  - détection de « fin d'écriture » : quand l'image ne change plus pendant `stableMs`
 *    après avoir changé, on déclenche une capture. Le Griot « comprend en voyant ».
 */

export interface CameraOptions {
  /** Activer la détection automatique. */
  autoCapture: boolean;
  /** Durée d'immobilité requise avant capture (ms). */
  stableMs?: number;
  /** Période d'analyse (ms). */
  sampleMs?: number;
  /** Seuil de différence moyenne par pixel (0-255) au-dessus duquel on considère que ça bouge. */
  motionThreshold?: number;
  /** Différence minimale cumulée depuis la dernière capture pour considérer qu'il y a du nouveau. */
  changeThreshold?: number;
  onAutoCapture?: (dataUrl: string) => void;
}

export type CameraStatus = 'idle' | 'starting' | 'live' | 'blocked';

export function useSlateCamera(enabled: boolean, opts: CameraOptions) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [status, setStatus] = useState<CameraStatus>('idle');
  const [motion, setMotion] = useState(0);
  const [stableFor, setStableFor] = useState(0);
  const optsRef = useRef(opts);
  optsRef.current = opts;
  const armedRef = useRef(true);

  // Flux vidéo
  useEffect(() => {
    if (!enabled) {
      setStatus('idle');
      return;
    }
    let stream: MediaStream | null = null;
    let cancelled = false;
    setStatus('starting');
    const constraintsList: MediaStreamConstraints[] = [
      { video: { facingMode: { ideal: 'environment' }, width: { ideal: 640 }, height: { ideal: 480 } }, audio: false },
      { video: true, audio: false },
    ];
    (async () => {
      for (const c of constraintsList) {
        try {
          stream = await navigator.mediaDevices.getUserMedia(c);
          break;
        } catch {
          /* essai suivant */
        }
      }
      if (cancelled) {
        stream?.getTracks().forEach((t) => t.stop());
        return;
      }
      if (!stream) return setStatus('blocked');
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => {});
      }
      setStatus('live');
    })();
    return () => {
      cancelled = true;
      stream?.getTracks().forEach((t) => t.stop());
      if (videoRef.current) videoRef.current.srcObject = null;
    };
  }, [enabled]);

  const grabFrame = useCallback((quality = 0.7): string | null => {
    const video = videoRef.current;
    if (!video || video.readyState < 2 || !video.videoWidth) return null;
    const canvas = canvasRef.current ?? (canvasRef.current = document.createElement('canvas'));
    const w = Math.min(960, video.videoWidth);
    const h = Math.round((w / video.videoWidth) * video.videoHeight);
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.drawImage(video, 0, 0, w, h);
    return canvas.toDataURL('image/jpeg', quality);
  }, []);

  /** Réarme la détection après qu'une lecture a été traitée. */
  const rearm = useCallback(() => {
    armedRef.current = true;
  }, []);

  // Détection de stabilité
  useEffect(() => {
    if (status !== 'live') return;
    const sampleMs = opts.sampleMs ?? 500;
    const small = document.createElement('canvas');
    small.width = 48;
    small.height = 36;
    const sctx = small.getContext('2d', { willReadFrequently: true });
    let prev: Uint8ClampedArray | null = null;
    let sinceCapture = 0; // changement cumulé depuis la dernière capture
    let stableSince: number | null = null;

    const tick = () => {
      const video = videoRef.current;
      const o = optsRef.current;
      if (!video || !sctx || video.readyState < 2) return;
      sctx.drawImage(video, 0, 0, small.width, small.height);
      const data = sctx.getImageData(0, 0, small.width, small.height).data;
      if (prev) {
        let diff = 0;
        for (let i = 0; i < data.length; i += 4) {
          diff += Math.abs(data[i] - prev[i]) + Math.abs(data[i + 1] - prev[i + 1]) + Math.abs(data[i + 2] - prev[i + 2]);
        }
        const avg = diff / (data.length / 4) / 3;
        setMotion(avg);
        const threshold = o.motionThreshold ?? 6;
        if (avg > threshold) {
          stableSince = null;
          sinceCapture += avg;
          setStableFor(0);
        } else {
          stableSince ??= Date.now();
          const stable = Date.now() - stableSince;
          setStableFor(stable);
          const needed = o.stableMs ?? 2500;
          if (o.autoCapture && armedRef.current && stable >= needed && sinceCapture >= (o.changeThreshold ?? 20)) {
            const frame = grabFrame();
            if (frame) {
              armedRef.current = false;
              sinceCapture = 0;
              o.onAutoCapture?.(frame);
            }
          }
        }
      }
      prev = new Uint8ClampedArray(data);
    };
    const id = setInterval(tick, sampleMs);
    return () => clearInterval(id);
  }, [status, grabFrame, opts.sampleMs]);

  return { videoRef, status, motion, stableFor, grabFrame, rearm };
}
