import { useRef, useCallback } from "react";

export function useGameSounds() {
  const ctxRef = useRef<AudioContext | null>(null);

  const getCtx = useCallback(() => {
    if (!ctxRef.current) {
      ctxRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    if (ctxRef.current.state === "suspended") ctxRef.current.resume();
    return ctxRef.current;
  }, []);

  const tone = useCallback((freq: number, type: OscillatorType, dur: number, vol = 0.3, delay = 0) => {
    try {
      const ctx = getCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      osc.type = type;
      const t = ctx.currentTime + delay;
      gain.gain.setValueAtTime(vol, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
      osc.start(t);
      osc.stop(t + dur + 0.05);
    } catch { /* silent fail */ }
  }, [getCtx]);

  // 試合開始「ドン！」
  const playStart = useCallback(() => {
    tone(200, "sine", 0.2, 0.6);
    tone(150, "triangle", 0.3, 0.4, 0.1);
  }, [tone]);

  // 衝突「バチッ」
  const playImpact = useCallback(() => {
    tone(300, "sawtooth", 0.06, 0.5);
    tone(200, "sine", 0.1, 0.3, 0.03);
  }, [tone]);

  // ラウンド勝利「ピン」
  const playRoundWin = useCallback(() => {
    tone(880, "sine", 0.2, 0.4);
    tone(1100, "sine", 0.15, 0.3, 0.12);
  }, [tone]);

  // 試合勝利「ファンファーレ」
  const playMatchWin = useCallback(() => {
    const seq = [523, 659, 784, 659, 1047];
    seq.forEach((f, i) => tone(f, "triangle", 0.3, 0.45, i * 0.12));
  }, [tone]);

  return { playStart, playImpact, playRoundWin, playMatchWin };
}
