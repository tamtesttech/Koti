import * as Tone from 'tone';
import { InstrumentKind, MoodNote } from '../types/koti';

type InstrumentVoices = Record<InstrumentKind, Tone.PolySynth>;

let voices: InstrumentVoices | null = null;
let reverb: Tone.Reverb | null = null;
let activeTimeouts: number[] = [];

async function ensureVoices(): Promise<InstrumentVoices | null> {
  if (typeof window === 'undefined') return null;
  try {
    await Tone.start();
    if (!voices) {
      reverb = new Tone.Reverb({ decay: 2.6, wet: 0.35 }).toDestination();

      // Bamboo Flute: soft airy sine with slow breath-like attack
      const flute = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'sine' },
        envelope: { attack: 0.14, decay: 0.3, sustain: 0.5, release: 1.2 },
        volume: -10,
      }).connect(reverb);

      // Celtic Harp: warm plucked triangle with gentle ringing release
      const harp = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'triangle' },
        envelope: { attack: 0.012, decay: 0.6, sustain: 0.15, release: 1.8 },
        volume: -9,
      }).connect(reverb);

      // Wood Kalimba: warm percussive sine tine with short resonant decay
      const kalimba = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'sine' },
        envelope: { attack: 0.008, decay: 0.42, sustain: 0.06, release: 0.9 },
        volume: -8,
      }).connect(reverb);

      // Felt Piano: muted warm triangle-sine felt hammer
      const feltPiano = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'triangle' },
        envelope: { attack: 0.03, decay: 0.5, sustain: 0.25, release: 1.5 },
        volume: -9,
      }).connect(reverb);

      // Celesta: delicate soft chime
      const celesta = new Tone.PolySynth(Tone.Synth, {
        oscillator: { type: 'sine' },
        envelope: { attack: 0.015, decay: 0.7, sustain: 0.12, release: 2.0 },
        volume: -11,
      }).connect(reverb);

      voices = {
        Flute: flute,
        Harp: harp,
        Kalimba: kalimba,
        'Felt Piano': feltPiano,
        Celesta: celesta,
      };
    }
    return voices;
  } catch {
    return null;
  }
}

export function stopMelodyPlayback(): void {
  for (const id of activeTimeouts) {
    window.clearTimeout(id);
  }
  activeTimeouts = [];
}

/**
 * Plays a short neutral mid-register melodic phrase using the chosen calm acoustic instrument.
 */
export async function playTunePhrase(
  notes: string[],
  instrument: InstrumentKind = 'Harp'
): Promise<void> {
  stopMelodyPlayback();
  if (!notes || notes.length === 0) return;
  const v = await ensureVoices();
  const synth = v?.[instrument] ?? v?.['Felt Piano'];
  const stepMs = 310;

  notes.forEach((n, idx) => {
    const t = window.setTimeout(() => {
      if (synth) {
        try {
          synth.triggerAttackRelease(n, '4n');
        } catch {
          // Ignore audio errors
        }
      }
    }, idx * stepMs);
    activeTimeouts.push(t);
  });
}

/**
 * Plays every mood entry's neutral melodic phrase sequentially across its varied instruments.
 */
export async function playMelodySequence(
  entries: MoodNote[],
  onStep: (index: number | null) => void
): Promise<void> {
  stopMelodyPlayback();
  if (entries.length === 0) {
    onStep(null);
    return;
  }

  const v = await ensureVoices();
  let cursorMs = 0;

  entries.forEach((item, idx) => {
    const phrase =
      item.melody && item.melody.length > 0 ? item.melody : [item.note || 'G4'];
    const inst: InstrumentKind = item.instrument || 'Felt Piano';
    const synth = v?.[inst] ?? v?.['Felt Piano'];
    const entryStart = cursorMs;

    const highlightTimer = window.setTimeout(() => {
      onStep(idx);
    }, entryStart);
    activeTimeouts.push(highlightTimer);

    phrase.forEach((pitch, pIdx) => {
      const noteTimer = window.setTimeout(() => {
        if (synth) {
          try {
            synth.triggerAttackRelease(pitch, '4n');
          } catch {
            // Ignore audio errors
          }
        }
      }, entryStart + pIdx * 280);
      activeTimeouts.push(noteTimer);
    });

    cursorMs += phrase.length * 280 + 260;
  });

  const endTimeout = window.setTimeout(() => {
    onStep(null);
  }, cursorMs + 300);
  activeTimeouts.push(endTimeout);
}
