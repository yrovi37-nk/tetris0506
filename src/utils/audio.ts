let audioCtx: AudioContext | null = null;
let isBgmPlaying = false;
let nextNoteTime = 0;
let noteIndex = 0;
let scheduleTimer = 0;

const TEMPO = 150;
const BEAT = 60 / TEMPO;

// Classic Tetris Theme A (Korobeiniki) Melody
const MELODY = [
  [659.25, 1], [493.88, 0.5], [523.25, 0.5], [587.33, 1], [523.25, 0.5], [493.88, 0.5],
  [440.00, 1], [440.00, 0.5], [523.25, 0.5], [659.25, 1], [587.33, 0.5], [523.25, 0.5],
  [493.88, 1.5], [523.25, 0.5], [587.33, 1], [659.25, 1], [523.25, 1], [440.00, 1], [440.00, 1.5], [0, 0.5],
];

export const initAudio = () => {
  try {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    
    // Play a silent tone to properly unlock audio on some browsers
    if (audioCtx) {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      gain.gain.value = 0;
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.001);
    }

  } catch (e) {
    console.error("Audio init error", e);
  }
};

function scheduleBGM() {
  if (!isBgmPlaying || !audioCtx) return;
  
  while (nextNoteTime < audioCtx.currentTime + 0.1) {
      const [freq, beats] = MELODY[noteIndex];
      const duration = beats * BEAT;
      
      if (freq > 0) {
          try {
              const osc = audioCtx.createOscillator();
              const gain = audioCtx.createGain();
              osc.type = 'square';
              osc.frequency.value = freq;
              
              // Increased volume for retro BGM (approx 3x)
              gain.gain.setValueAtTime(0.09, nextNoteTime);
              gain.gain.exponentialRampToValueAtTime(0.01, nextNoteTime + duration * 0.8);
              
              osc.connect(gain);
              gain.connect(audioCtx.destination);
              osc.start(nextNoteTime);
              osc.stop(nextNoteTime + duration * 0.9);
          } catch (e) {}
      }
      nextNoteTime += duration;
      noteIndex = (noteIndex + 1) % MELODY.length;
  }
  scheduleTimer = window.setTimeout(scheduleBGM, 25);
}

export const playBGM = () => {
  if (isBgmPlaying) return;
  isBgmPlaying = true;
  if (audioCtx) {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    nextNoteTime = audioCtx.currentTime + 0.1;
    scheduleBGM();
  }
};

export const stopBGM = () => {
  isBgmPlaying = false;
  window.clearTimeout(scheduleTimer);
  noteIndex = 0;
};

export const pauseBGM = () => {
  isBgmPlaying = false;
  window.clearTimeout(scheduleTimer);
};

export const resumeBGM = () => {
  playBGM();
};

const playTone = (frequency: number, type: OscillatorType, duration: number, vol = 0.1) => {
  if (!audioCtx) return;
  
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  
  try {
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, audioCtx.currentTime);

    gainNode.gain.setValueAtTime(vol, audioCtx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.start();
    oscillator.stop(audioCtx.currentTime + duration);
  } catch (e) {
    console.error("Audio play error", e);
  }
};

export const playMoveSound = () => {
  playTone(300, 'square', 0.05, 0.2);
};

export const playRotateSound = () => {
  playTone(400, 'square', 0.05, 0.2);
};

export const playDropSound = () => {
  playTone(150, 'square', 0.15, 0.3);
};

export const playClearSound = () => {
  if (!audioCtx) return;
  if (audioCtx.state === 'suspended') audioCtx.resume();
  const now = audioCtx.currentTime;
  const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
  notes.forEach((freq, i) => {
    try {
      const osc = audioCtx!.createOscillator();
      const gain = audioCtx!.createGain();
      osc.type = 'square';
      osc.frequency.value = freq;
      
      gain.gain.setValueAtTime(0.3, now + i * 0.1);
      gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.1 + 0.1);
      
      osc.connect(gain);
      gain.connect(audioCtx!.destination);
      
      osc.start(now + i * 0.1);
      osc.stop(now + i * 0.1 + 0.1);
    } catch (e) {}
  });
};

export const playLevelUpSound = () => {
  if (!audioCtx) return;
  if (audioCtx.state === 'suspended') audioCtx.resume();
  const now = audioCtx.currentTime;
  const notes = [440, 554.37, 659.25, 880]; // A4, C#5, E5, A5
  notes.forEach((freq, i) => {
    try {
      const osc = audioCtx!.createOscillator();
      const gain = audioCtx!.createGain();
      osc.type = 'square';
      osc.frequency.value = freq;
      
      gain.gain.setValueAtTime(0.3, now + i * 0.15);
      gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.15 + 0.15);
      
      osc.connect(gain);
      gain.connect(audioCtx!.destination);
      
      osc.start(now + i * 0.15);
      osc.stop(now + i * 0.15 + 0.15);
    } catch (e) {}
  });
};

export const playGameOverSound = () => {
  if (!audioCtx) return;
  if (audioCtx.state === 'suspended') audioCtx.resume();
  const now = audioCtx.currentTime;
  const notes = [300, 280, 260, 240, 200];
  notes.forEach((freq, i) => {
    try {
      const osc = audioCtx!.createOscillator();
      const gain = audioCtx!.createGain();
      osc.type = 'sawtooth';
      osc.frequency.value = freq;
      
      gain.gain.setValueAtTime(0.3, now + i * 0.2);
      gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.2 + 0.2);
      
      osc.connect(gain);
      gain.connect(audioCtx!.destination);
      
      osc.start(now + i * 0.2);
      osc.stop(now + i * 0.2 + 0.2);
    } catch (e) {}
  });
};
