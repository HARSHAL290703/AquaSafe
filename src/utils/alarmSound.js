const ALARM_SRC = "/alarm.wav";

/** Looping alarm from public/alarm.wav; falls back to Web Audio beeps. */
export function createAlarmSound() {
  let audioContext = null;
  let intervalId = null;
  let wavAudio = null;
  let stopped = false;

  const playWebBeep = () => {
    if (!audioContext || stopped) return;
    const osc = audioContext.createOscillator();
    const gain = audioContext.createGain();
    osc.connect(gain);
    gain.connect(audioContext.destination);
    osc.frequency.value = 880;
    osc.type = "square";
    gain.gain.setValueAtTime(0.25, audioContext.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.35);
    osc.start(audioContext.currentTime);
    osc.stop(audioContext.currentTime + 0.35);
  };

  const startWebAudio = async () => {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return false;
    audioContext = new Ctx();
    if (audioContext.state === "suspended") await audioContext.resume();
    playWebBeep();
    intervalId = setInterval(playWebBeep, 550);
    return true;
  };

  const tryWav = async () => {
    try {
      wavAudio = new Audio(ALARM_SRC);
      wavAudio.loop = true;
      await wavAudio.play();
      return true;
    } catch {
      wavAudio = null;
      return false;
    }
  };

  const start = async () => {
    stopped = false;
    if (await tryWav()) return true;
    return startWebAudio();
  };

  const stop = () => {
    stopped = true;
    clearInterval(intervalId);
    if (wavAudio) {
      wavAudio.pause();
      wavAudio.currentTime = 0;
      wavAudio = null;
    }
    if (audioContext) {
      audioContext.close().catch(() => {});
      audioContext = null;
    }
  };

  return { start, stop };
}
