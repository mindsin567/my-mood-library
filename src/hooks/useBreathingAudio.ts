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

  // Update drone volume when volume prop changes
  useEffect(() => {
    if (droneGainRef.current && isPlayingRef.current && ctxRef.current) {
      droneGainRef.current.gain.setTargetAtTime(volume * 0.06, ctxRef.current.currentTime, 0.5);
    }
  }, [volume]);

  const startAmbient = useCallback(() => {
    if (isPlayingRef.current) return;
    const ctx = getCtx();

    // Master gain
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(volume * 0.06, ctx.currentTime + 3);
    gain.connect(ctx.destination);
    droneGainRef.current = gain;

    // Very gentle, low-frequency warm pad — just pure sine tones in a consonant chord
    // Using a soft A-minor feel: A2, C3, E3 with very slow detune for shimmer
    const voices: { freq: number; vol: number }[] = [
      { freq: 110, vol: 0.4 },   // A2
      { freq: 130.81, vol: 0.3 }, // C3
      { freq: 164.81, vol: 0.25 }, // E3
      { freq: 220, vol: 0.15 },   // A3 (soft octave)
    ];

    const oscs = voices.map(({ freq, vol }, i) => {
      const osc = ctx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      // Very subtle slow detune for gentle movement
      osc.detune.setValueAtTime(0, ctx.currentTime);
      osc.detune.linearRampToValueAtTime(i % 2 === 0 ? 3 : -3, ctx.currentTime + 10);

      const oscGain = ctx.createGain();
      oscGain.gain.setValueAtTime(vol, ctx.currentTime);
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
      droneGainRef.current.gain.setTargetAtTime(0, ctx.currentTime, 1.0);
    }
    setTimeout(() => {
      droneOscsRef.current.forEach(o => { try { o.stop(); } catch {} });
      droneOscsRef.current = [];
      isPlayingRef.current = false;
    }, 3000);
  }, []);

  // Play a very soft, high-pitched bell chime for step transitions
  const playChime = useCallback(() => {
    if (volume === 0) return;
    const ctx = getCtx();

    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0, ctx.currentTime);
    gain.gain.linearRampToValueAtTime(volume * 0.12, ctx.currentTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.8);
    gain.connect(ctx.destination);

    // Soft bell — a high sine with a gentle harmonic
    const osc = ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime); // A5 — gentle bell
    osc.frequency.exponentialRampToValueAtTime(860, ctx.currentTime + 1.5); // slight drop
    osc.connect(gain);
    osc.start();
    osc.stop(ctx.currentTime + 1.8);

    // Soft overtone
    const gain2 = ctx.createGain();
    gain2.gain.setValueAtTime(0, ctx.currentTime);
    gain2.gain.linearRampToValueAtTime(volume * 0.04, ctx.currentTime + 0.05);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 1.2);
    gain2.connect(ctx.destination);

    const osc2 = ctx.createOscillator();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(1320, ctx.currentTime); // E6
    osc2.connect(gain2);
    osc2.start();
    osc2.stop(ctx.currentTime + 1.2);
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
