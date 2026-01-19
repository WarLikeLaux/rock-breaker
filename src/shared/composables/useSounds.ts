import { ref, type Ref } from 'vue';
import { loadSettings, saveSettings } from '@/features/game/store/storage';

export interface SoundStore {
  soundEnabled: Ref<boolean>;
  playHit: () => void;
  playComplete: () => void;
  playVictory: () => void;
  playClick: () => void;
  playRockTap: () => void;
  playHeal: () => void;
  toggleSound: () => void;
}

const soundEnabled = ref<boolean>(loadSettings().soundEnabled ?? true);

let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioContext) {
    const AudioContextConstructor =
      window.AudioContext ||
      (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (AudioContextConstructor) {
      audioContext = new AudioContextConstructor();
    }
  }
  return audioContext!;
}

function playTone(
  frequency: number,
  duration: number,
  type: OscillatorType = 'sine',
  volume: number = 0.3,
): void {
  if (!soundEnabled.value) return;

  try {
    const ctx = getAudioContext();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);

    gainNode.gain.setValueAtTime(volume, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);

    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  } catch {
    void 0;
  }
}

function playHit(): void {
  if (!soundEnabled.value) return;
  const ctx = getAudioContext();
  const t = ctx.currentTime;

  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'triangle';
  osc.frequency.setValueAtTime(120, t);
  osc.frequency.exponentialRampToValueAtTime(40, t + 0.1);
  gain.gain.setValueAtTime(0.5, t);
  gain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(t);
  osc.stop(t + 0.15);

  const bufferSize = ctx.sampleRate * 0.1;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }
  const noise = ctx.createBufferSource();
  noise.buffer = buffer;
  const noiseGain = ctx.createGain();
  const filter = ctx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(600, t);

  noiseGain.gain.setValueAtTime(0.2, t);
  noiseGain.gain.exponentialRampToValueAtTime(0.01, t + 0.1);

  noise.connect(filter);
  filter.connect(noiseGain);
  noiseGain.connect(ctx.destination);
  noise.start(t);
}

function playComplete(): void {
  playTone(523, 0.1, 'sine', 0.3);
  setTimeout(() => playTone(659, 0.1, 'sine', 0.3), 100);
  setTimeout(() => playTone(784, 0.15, 'sine', 0.3), 200);
}

function playVictory(): void {
  const notes = [523, 659, 784, 1047];
  notes.forEach((freq, i) => {
    setTimeout(() => playTone(freq, 0.2, 'sine', 0.3), i * 150);
  });
}

function playClick(): void {
  playTone(800, 0.05, 'sine', 0.1);
}

function playRockTap(): void {
  playTone(80, 0.1, 'triangle', 0.2);
  setTimeout(() => playTone(60, 0.15, 'triangle', 0.15), 30);
}

function playHeal(): void {
  playTone(400, 0.15, 'sine', 0.15);
  setTimeout(() => playTone(300, 0.2, 'sine', 0.1), 80);
}

function toggleSound(): void {
  soundEnabled.value = !soundEnabled.value;
  const settings = loadSettings();
  settings.soundEnabled = soundEnabled.value;
  saveSettings(settings);
}

export function useSounds(): SoundStore {
  return {
    soundEnabled,
    playHit,
    playComplete,
    playVictory,
    playClick,
    playRockTap,
    playHeal,
    toggleSound,
  };
}
