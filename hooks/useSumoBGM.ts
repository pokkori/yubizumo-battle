import { useRef, useCallback } from "react";

/**
 * 指相撲バトル BGM
 * 和太鼓リズム + 祭りのメロディ (Web Audio API)
 */
export function useSumoBGM() {
  const ctxRef = useRef<AudioContext | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const stopFnsRef = useRef<(() => void)[]>([]);
  const mutedRef = useRef(false);
  const activeRef = useRef(false);

  const getCtx = useCallback(() => {
    if (!ctxRef.current) {
      ctxRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    if (ctxRef.current.state === "suspended") ctxRef.current.resume();
    return ctxRef.current;
  }, []);

  const startBGM = useCallback(() => {
    if (activeRef.current) return;
    activeRef.current = true;
    const ctx = getCtx();
    const masterGain = ctx.createGain();
    masterGain.gain.value = mutedRef.current ? 0 : 0.18;
    masterGain.connect(ctx.destination);
    gainRef.current = masterGain;

    const BPM = 140;
    const beat = 60 / BPM;
    const lookahead = 0.05;

    let nextBeat = ctx.currentTime + 0.1;
    let beatCount = 0;

    // 和太鼓パターン: ドンドコドドン
    const taikoPattern = [1, 0, 0.6, 0, 1, 0, 0.6, 0.4]; // 8分音符
    // メロディ (ヨナ抜き長音階 C E G A B)
    const melodySeq = [261.6, 329.6, 392, 440, 493.9, 440, 392, 329.6,
                       261.6, 329.6, 392, 440, 523.3, 493.9, 440, 392];
    let melodyIdx = 0;

    function scheduleNote(t: number) {
      const step = beatCount % 8;

      // 和太鼓
      const vol = taikoPattern[step];
      if (vol > 0) {
        // ドン音 (低音)
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.connect(g); g.connect(masterGain);
        osc.type = "sine";
        osc.frequency.setValueAtTime(60 + vol * 20, t);
        osc.frequency.exponentialRampToValueAtTime(30, t + 0.12);
        g.gain.setValueAtTime(vol * 0.8, t);
        g.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
        osc.start(t); osc.stop(t + 0.16);

        // ノイズ (タッチ感)
        const bufSize = Math.floor(ctx.sampleRate * 0.06);
        const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
        const data = buf.getChannelData(0);
        for (let i = 0; i < bufSize; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / bufSize);
        const noise = ctx.createBufferSource();
        const ng = ctx.createGain();
        noise.buffer = buf; noise.connect(ng); ng.connect(masterGain);
        ng.gain.setValueAtTime(vol * 0.25, t);
        ng.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
        noise.start(t);
      }

      // メロディ (4拍毎)
      if (step % 4 === 0) {
        const freq = melodySeq[melodyIdx % melodySeq.length];
        melodyIdx++;
        const mosc = ctx.createOscillator();
        const mg = ctx.createGain();
        const mfilt = ctx.createBiquadFilter();
        mfilt.type = "lowpass"; mfilt.frequency.value = 2000;
        mosc.connect(mfilt); mfilt.connect(mg); mg.connect(masterGain);
        mosc.type = "triangle";
        mosc.frequency.setValueAtTime(freq, t);
        mg.gain.setValueAtTime(0.12, t);
        mg.gain.exponentialRampToValueAtTime(0.001, t + beat * 1.8);
        mosc.start(t); mosc.stop(t + beat * 2);
      }

      beatCount++;
    }

    let running = true;
    function scheduler() {
      if (!running) return;
      const ctx2 = ctxRef.current;
      if (!ctx2) return;
      while (nextBeat < ctx2.currentTime + lookahead + beat) {
        scheduleNote(nextBeat);
        nextBeat += beat / 2; // 8分音符
      }
      const tid = setTimeout(scheduler, 20);
      stopFnsRef.current.push(() => clearTimeout(tid));
    }
    scheduler();

    return () => { running = false; };
  }, [getCtx]);

  const stopBGM = useCallback(() => {
    activeRef.current = false;
    stopFnsRef.current.forEach(f => f());
    stopFnsRef.current = [];
    if (gainRef.current) {
      gainRef.current.gain.setTargetAtTime(0, ctxRef.current?.currentTime ?? 0, 0.1);
    }
  }, []);

  const setMuted = useCallback((muted: boolean) => {
    mutedRef.current = muted;
    if (gainRef.current && ctxRef.current) {
      gainRef.current.gain.setTargetAtTime(muted ? 0 : 0.18, ctxRef.current.currentTime, 0.1);
    }
  }, []);

  return { startBGM, stopBGM, setMuted };
}
