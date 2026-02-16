import { useRef, useCallback, useEffect } from 'react';

type BreathingAudioOptions = {
  volume: number; // 0-1
};

export const useBreathingAudio = ({ volume }: BreathingAudioOptions) => {
  const ctxRef = useRef<AudioContext | null>(null);
  const droneGainRef = useRef<GainNode | null>(null);
  const droneOscsRef = useRef<OscillatorNode[]>([]);
  const isPlayingRef = useRef(false);

  const getCtx = useCallback(() => {
    if (!ctxRef.current) {
      ctxRef.current = new AudioContext();
    }
    if (ctxRef.current.state === 'suspended') {
      ctxRef.current.resume();
    }
    return ctxRef.current;
  }, []);

  // Update drone volume when volume changes
  useEffect(() => {
    if (droneGainRef.current && isPlayingRef.current) {
      droneGainRef.current.gain.setTargetAtTime(volume * 0.12, ctxRef.current!.currentTime, 0.3);
    }
  }, [volume]);

  const startAmbient = useCallback(() => {
    if (isPlayingRef.current) return;
    const ctx = getCtx();
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(volume * 0.12, ctx.currentTime + 2);
    gain.connect(ctx.destination);
    droneGainRef.current = gain;

    // Create a warm pad with layered sine waves
    const freqs = [110, 165, 220, 330]; // A2, E3, A3, E4 — open fifths
    const oscs = freqs.map((f, i) => {
      const osc = ctx.createOscillator();
      osc.type = i < 2 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(f, ctx.currentTime);
      // Slow detune for movement
      osc.detune.setValueAtTime(0, ctx.currentTime);
      osc.detune.linearRampToValueAtTime(i % 2 === 0 ? 8 : -8, ctx.currentTime + 6);

      const oscGain = ctx.createGain();
      oscGain.gain.setValueAtTime(i < 2 ? 0.5 : 0.25, ctx.currentTime);
      osc.connect(oscGain);
      oscGain.connect(gain);
      osc.start();
      return osc;
    });

    droneOscsRef.current = oscs;
    isPlayingRef.current = true;
  }, [getCtx, volume]);

  const stopAmbient = useCallback(() => {
    if (!isPlayingRef.current || !ctxRef.current) return;
    const ctx = ctxRef.current;
    if (droneGainRef.current) {
      droneGainRef.current.gain.setTargetAtTime(0, ctx.currentTime, 0.5);
    }
    setTimeout(() => {
      droneOscsRef.current.forEach(o => { try { o.stop(); } catch {} });
      droneOscsRef.current = [];
      isPlayingRef.current = false;
    }, 2000);
  }, []);

  // Play a gentle chime for step transitions
  const playChime = useCallback(() => {
    if (volume === 0) return;
    const ctx = getCtx();
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(volume * 0.25, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
    gain.connect(ctx.destination);

    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(528, ctx.currentTime); // C5 — solfeggio frequency
    osc.connect(gain);
    osc.start();
    osc.stop(ctx.currentTime + 1.2);

    // Harmonic overtone
    const osc2 = ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(792, ctx.currentTime);
    const gain2 = ctx.createGain();
    gain2.gain.setValueAtTime(volume * 0.1, ctx.currentTime);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start();
    osc2.stop(ctx.currentTime + 0.8);
  }, [getCtx, volume]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      droneOscsRef.current.forEach(o => { try { o.stop(); } catch {} });
      if (ctxRef.current) {
        ctxRef.current.close();
        ctxRef.current = null;
      }
      isPlayingRef.current = false;
    };
  }, []);

  return { startAmbient, stopAmbient, playChime };
};
