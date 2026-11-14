import {
  CoreFocus,
  DeskExercise,
  EmotionKind,
  InstrumentKind,
  MonthlySong,
  MoodNote,
  Phq9Record,
  Phq9Severity,
  UserProfile,
  VoidSession,
} from '../types/koti';
import { PHQ9_OPTIONS, PHQ9_QUESTIONS } from '../data/kotiData';

/**
 * Mid-register, grounded pentatonic pitches (C4 - A4) so melodies stay warm and neutral
 * without soaring into high octaves that imply bright or intense emotions.
 */
export const PENTATONIC_SCALE = [
  { note: 'C4', frequency: 261.63 },
  { note: 'D4', frequency: 293.66 },
  { note: 'E4', frequency: 329.63 },
  { note: 'G4', frequency: 392.0 },
  { note: 'A4', frequency: 440.0 },
] as const;

export const CALM_INSTRUMENTS: InstrumentKind[] = [
  'Flute',
  'Harp',
  'Kalimba',
  'Felt Piano',
  'Celesta',
];

export const MELODIC_MOTIFS: string[][] = [
  ['C4', 'E4', 'G4', 'E4'],
  ['D4', 'G4', 'A4', 'G4'],
  ['E4', 'G4', 'A4', 'E4'],
  ['G4', 'E4', 'D4', 'E4'],
  ['D4', 'E4', 'G4', 'D4'],
  ['E4', 'A4', 'G4', 'E4'],
  ['C4', 'D4', 'G4', 'E4'],
  ['A4', 'G4', 'E4', 'D4'],
];

export function getFocusDisplayLabel(profile: UserProfile): string {
  if (profile.coreFocus === 'Other' && profile.customFocus?.trim()) {
    return profile.customFocus.trim();
  }
  return profile.coreFocus;
}

/**
 * Selects a neutral, mid-register melodic phrase and rotates calmly across diverse
 * acoustic instruments (Flute, Harp, Kalimba, Felt Piano, Celesta) independent of emotion or intensity.
 */
export function generateGentleMelody(
  variationIndex = 0
): {
  label: string;
  melody: string[];
  instrument: InstrumentKind;
  frequency: number;
} {
  const safeIdx = Math.abs(Math.round(variationIndex));
  const motifIdx = safeIdx % MELODIC_MOTIFS.length;
  const instIdx = safeIdx % CALM_INSTRUMENTS.length;
  const melody = MELODIC_MOTIFS[motifIdx];
  const instrument = CALM_INSTRUMENTS[instIdx];
  const firstNote = melody[0];
  const freqEntry =
    PENTATONIC_SCALE.find((p) => p.note === firstNote) ?? PENTATONIC_SCALE[0];
  return {
    label: `${melody[0]}–${melody[melody.length - 1]}`,
    melody,
    instrument,
    frequency: freqEntry.frequency,
  };
}

export function mapEmotionToPentatonicNote(
  _emotion: EmotionKind,
  _intensity: number,
  variationIndex = 0
): {
  note: string;
  melody: string[];
  instrument: InstrumentKind;
  frequency: number;
} {
  const generated = generateGentleMelody(variationIndex);
  return {
    note: generated.label,
    melody: generated.melody,
    instrument: generated.instrument,
    frequency: generated.frequency,
  };
}

export function calculatePhq9Score(answers: number[]): number {
  return answers.reduce((sum, val) => {
    const safe = Number.isFinite(val) ? Math.max(0, Math.min(3, Math.round(val))) : 0;
    return sum + safe;
  }, 0);
}

export function classifyPhq9Severity(score: number): Phq9Severity {
  if (score <= 4) return 'Minimal';
  if (score <= 9) return 'Mild';
  if (score <= 14) return 'Moderate';
  if (score <= 19) return 'Moderately Severe';
  return 'Severe';
}

export function comparePhq9Months(
  latest: Phq9Record | undefined,
  previous: Phq9Record | undefined
): { delta: number; summary: string } {
  if (!latest || !previous) {
    return {
      delta: 0,
      summary: 'Baseline established. Future monthly check-ins will show longitudinal change.',
    };
  }
  const delta = latest.totalScore - previous.totalScore;
  const unit = Math.abs(delta) === 1 ? 'point' : 'points';
  if (delta < 0) {
    return {
      delta,
      summary: `${Math.abs(delta)} ${unit} lower than ${previous.monthLabel} (${previous.totalScore} → ${latest.totalScore})`,
    };
  }
  if (delta > 0) {
    return {
      delta,
      summary: `${delta} ${unit} higher than ${previous.monthLabel} (${previous.totalScore} → ${latest.totalScore})`,
    };
  }
  return {
    delta: 0,
    summary: `Unchanged from ${previous.monthLabel} (${latest.totalScore})`,
  };
}

export function buildFallbackExercises(
  profile: UserProfile,
  recentVoidTags: string[]
): DeskExercise[] {
  const focus: CoreFocus = profile.coreFocus || 'Self-Love';
  const focusLabel = getFocusDisplayLabel(profile);
  const hobby = profile.hobbies[0] || 'a quiet moment';
  const heavy = profile.heaviestSituations[0] || 'daily fatigue';
  const latestTag = recentVoidTags[0];

  const tagClause = latestTag
    ? `Holding space for ${latestTag}, `
    : '';

  if (focus === 'Gratitude') {
    return [
      {
        id: 'ex-1',
        title: 'One Ordinary Anchor',
        focus: 'Gratitude',
        kind: 'reflection',
        groundingPrompt: `${tagClause}notice one small texture, sound, or routine connected to ${hobby.toLowerCase()} that felt steady today.`,
        sentenceStarter: 'Today, a small steady moment was...',
        completed: false,
        adaptedFromTag: latestTag,
      },
      {
        id: 'ex-2',
        title: 'Two-Minute Warm Exhale',
        focus: 'Gratitude',
        kind: 'breathing',
        groundingPrompt: `When ${heavy.toLowerCase()} shows up, let your shoulders drop while taking slow breaths for two unhurried minutes.`,
        breathingPattern: { inhaleSec: 4, holdSec: 4, exhaleSec: 6, durationSec: 120 },
        completed: false,
      },
      {
        id: 'ex-3',
        title: 'Thanking Your Past Self',
        focus: 'Gratitude',
        kind: 'reflection',
        groundingPrompt: 'Name one tiny thing you did earlier that helped you right now.',
        sentenceStarter: 'I quietly appreciate that earlier I...',
        completed: false,
      },
    ];
  }

  if (focus === 'Breathing') {
    return [
      {
        id: 'ex-1',
        title: '4-4-6 Settling Breath',
        focus: 'Breathing',
        kind: 'breathing',
        groundingPrompt: `${tagClause}follow this unhurried rhythm for two minutes to signal safety to your nervous system.`,
        breathingPattern: { inhaleSec: 4, holdSec: 4, exhaleSec: 6, durationSec: 120 },
        completed: false,
        adaptedFromTag: latestTag,
      },
      {
        id: 'ex-2',
        title: 'Sensory Check-In',
        focus: 'Breathing',
        kind: 'reflection',
        groundingPrompt: `Pause from ${heavy.toLowerCase()} and name one quiet physical sensation you notice right now.`,
        sentenceStarter: 'Right now in this room, I can feel...',
        completed: false,
      },
      {
        id: 'ex-3',
        title: 'Gentle Transition Cue',
        focus: 'Breathing',
        kind: 'reflection',
        groundingPrompt: `Pair one deep exhale with a tiny next step toward ${hobby.toLowerCase()}.`,
        sentenceStarter: 'After this breath, one gentle step I can take is...',
        completed: false,
      },
    ];
  }

  if (focus === 'Other') {
    return [
      {
        id: 'ex-1',
        title: `Exploring ${focusLabel}`,
        focus: 'Other',
        kind: 'reflection',
        groundingPrompt: `${tagClause}notice one tiny way ${focusLabel.toLowerCase()} can show up gently today.`,
        sentenceStarter: `Today, ${focusLabel.toLowerCase()} looks like...`,
        completed: false,
        adaptedFromTag: latestTag,
      },
      {
        id: 'ex-2',
        title: 'Two-Minute Steady Pause',
        focus: 'Other',
        kind: 'breathing',
        groundingPrompt: 'Rest your hands lightly and follow a slow 4-4-6 breath.',
        breathingPattern: { inhaleSec: 4, holdSec: 4, exhaleSec: 6, durationSec: 120 },
        completed: false,
      },
      {
        id: 'ex-3',
        title: 'Quiet Check-In',
        focus: 'Other',
        kind: 'reflection',
        groundingPrompt: `Connect briefly with ${hobby.toLowerCase()} without keeping score.`,
        sentenceStarter: 'One small thing that feels right today is...',
        completed: false,
      },
    ];
  }

  return [
    {
      id: 'ex-1',
      title: 'Permission for Low-Battery Pace',
      focus: 'Self-Love',
      kind: 'reflection',
      groundingPrompt: `${tagClause}write one gentle permission to grant yourself while navigating ${heavy.toLowerCase()}.`,
      sentenceStarter: 'Today I give myself permission to...',
      completed: false,
      adaptedFromTag: latestTag,
    },
    {
      id: 'ex-2',
      title: 'Two-Minute Nervous System Rest',
      focus: 'Self-Love',
      kind: 'breathing',
      groundingPrompt: 'Place one hand lightly over your chest or lap and follow a slow 4-4-6 breath.',
      breathingPattern: { inhaleSec: 4, holdSec: 4, exhaleSec: 6, durationSec: 120 },
      completed: false,
    },
    {
      id: 'ex-3',
      title: 'Kindness Without Conditions',
      focus: 'Self-Love',
      kind: 'reflection',
      groundingPrompt: `Think of how you enjoy ${hobby.toLowerCase()} without keeping score, and write one kind sentence for tonight.`,
      sentenceStarter: 'Even on an imperfect day, I remind myself that...',
      completed: false,
    },
  ];
}

export function formatMoodTrendsSummary(songs: MonthlySong[]): string {
  const current = songs.find((s) => s.isCurrent) || songs[songs.length - 1];
  if (!current || current.notes.length === 0) {
    return 'No mood notes logged in the current cycle yet.';
  }
  const avgIntensity = (
    current.notes.reduce((sum, n) => sum + n.intensity, 0) / current.notes.length
  ).toFixed(1);
  const counts: Record<string, number> = {};
  for (const n of current.notes) {
    const label = n.emotion === 'Other' && n.customEmotion ? n.customEmotion : n.emotion;
    counts[label] = (counts[label] || 0) + 1;
  }
  const topEmotions = Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([k, v]) => `${k} (${v}x)`)
    .join(', ');

  return `${current.monthLabel}: ${current.notes.length} entries · Mean intensity ${avgIntensity}/10 · Top states: ${topEmotions}`;
}

export function formatTherapistReport(params: {
  profile: UserProfile;
  phq9History: Phq9Record[];
  songs: MonthlySong[];
  deskExercises: DeskExercise[];
  voidHistory: VoidSession[];
  generatedDate?: string;
}): string {
  const { profile, phq9History, songs, deskExercises, voidHistory } = params;
  const dateStr = params.generatedDate || new Date().toISOString().slice(0, 10);
  const sortedPhq = [...phq9History].sort(
    (a, b) => new Date(a.dateIso).getTime() - new Date(b.dateIso).getTime()
  );
  const latestPhq = sortedPhq[sortedPhq.length - 1];
  const prevPhq = sortedPhq.length > 1 ? sortedPhq[sortedPhq.length - 2] : undefined;
  const comparison = comparePhq9Months(latestPhq, prevPhq);

  const completedExercises = deskExercises.filter((ex) => ex.completed);
  const moodSummary = formatMoodTrendsSummary(songs);
  const recentThemes = voidHistory
    .slice(0, 5)
    .map((v) => `- ${v.emotionalTag} (${v.createdAt.slice(0, 10)})`)
    .join('\n');

  const itemBreakdown = latestPhq
    ? PHQ9_QUESTIONS.map((q, idx) => {
        const val = latestPhq.answers[idx] ?? 0;
        const opt = PHQ9_OPTIONS.find((o) => o.value === val)?.label ?? 'Not at all';
        return `  Q${idx + 1}. ${q}\n      Score: ${val}/3 (${opt})`;
      }).join('\n')
    : '  No PHQ-9 assessment completed yet.';

  const historyLines = sortedPhq
    .map((r) => `  - ${r.monthLabel}: ${r.totalScore}/27 (${r.severity})`)
    .join('\n');

  const exerciseLines =
    completedExercises.length > 0
      ? completedExercises
          .map(
            (ex) =>
              `  - [${ex.focus}] ${ex.title}${
                ex.userResponse ? `\n    Note: ${ex.userResponse}` : ''
              }`
          )
          .join('\n')
      : '  - No daily exercises completed yet today.';

  return [
    '====================================================================',
    'KOTI WELLNESS — CLINICAL PROGRESS & RECOVERY SUMMARY FOR THERAPIST',
    '====================================================================',
    `Generated: ${dateStr}`,
    `Primary Wellness Focus: ${getFocusDisplayLabel(profile)}`,
    `Recovery Timeline: ${profile.recoveryDuration.join(', ') || 'Not specified'}`,
    `Reported Heavy Areas: ${profile.heaviestSituations.join(', ') || 'Not specified'}`,
    `Growth Intentions: ${profile.growthGoals.join(', ') || 'Not specified'}`,
    '',
    '1. PHQ-9 DEPRESSION SCREENING',
    '--------------------------------------------------------------------',
    latestPhq
      ? `Latest Assessment (${latestPhq.monthLabel}): ${latestPhq.totalScore} / 27 — ${latestPhq.severity}`
      : 'Latest Assessment: Pending',
    `Longitudinal Trend: ${comparison.summary}`,
    '',
    'Monthly History:',
    historyLines || '  None recorded',
    '',
    'Latest 9-Item Breakdown:',
    itemBreakdown,
    '',
    '2. MOOD TRACKER & INTENSITY TRENDS (THE PIANO)',
    '--------------------------------------------------------------------',
    moodSummary,
    '',
    '3. DAILY GROUNDING EXERCISES COMPLETED (MY DESK)',
    '--------------------------------------------------------------------',
    exerciseLines,
    '',
    '4. EMOTIONAL RELEASE THEMES (THE VOID)',
    '--------------------------------------------------------------------',
    recentThemes || '  No emotional release themes logged yet.',
    '====================================================================',
  ].join('\n');
}

export function getTodayKey(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function formatShortDayLabel(date: Date = new Date()): string {
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function computeNoteColor(emotion: EmotionKind): string {
  switch (emotion) {
    case 'Calm':
      return '#655F35';
    case 'Hopeful':
      return '#C4863C';
    case 'Joyful':
      return '#AC6332';
    case 'Heavy':
      return '#674223';
    case 'Anxious':
      return '#8F4F25';
    case 'Tired':
      return '#8C7A68';
    default:
      return '#C4863C';
  }
}

export function getAverageMoodIntensity(notes: MoodNote[]): number {
  if (notes.length === 0) return 0;
  const total = notes.reduce((acc, n) => acc + n.intensity, 0);
  return Math.round((total / notes.length) * 10) / 10;
}
