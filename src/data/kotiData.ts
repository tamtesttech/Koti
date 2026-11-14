import { MonthlySong, Phq9Record, UserProfile } from '../types/koti';

export interface QuestionnaireQuestion {
  id: keyof Pick<UserProfile, 'hobbies' | 'recoveryDuration' | 'heaviestSituations' | 'growthGoals'>;
  title: string;
  subtitle: string;
  options: string[];
}

export const QUESTIONNAIRE_QUESTIONS: QuestionnaireQuestion[] = [
  {
    id: 'hobbies',
    title: 'Your comforts & hobbies',
    subtitle: 'Select any that feel familiar.',
    options: [
      'Reading',
      'Nature walks',
      'Music',
      'Cooking',
      'Gaming',
      'Crafting',
      'Quiet rest',
      'Gardening',
      'Journaling',
    ],
  },
  {
    id: 'recoveryDuration',
    title: 'Recovery timeline',
    subtitle: 'Where are you right now?',
    options: [
      'Just finished treatment',
      'A few months',
      'Over a year',
      'Prefer not to say',
    ],
  },
  {
    id: 'heaviestSituations',
    title: 'What feels heaviest lately?',
    subtitle: 'Select all that fit.',
    options: [
      'Low energy & fatigue',
      'Overthinking at night',
      'Isolation & screen overload',
      'Lack of motivation',
      'Heavy mornings',
      'Sensory overwhelm',
    ],
  },
  {
    id: 'growthGoals',
    title: 'Where do you hope to grow?',
    subtitle: 'Pick any direction.',
    options: [
      'Daily consistency',
      'Self-compassion',
      'Reconnecting with the real world',
      'Emotional release',
      'Restful sleep',
      'Gentle curiosity',
    ],
  },
];

export const CORE_FOCUS_OPTIONS = [
  {
    id: 'Self-Love' as const,
    title: 'Self-Love',
    description: 'Gentle inner care at a steady pace.',
    accent: '#AC6332',
  },
  {
    id: 'Gratitude' as const,
    title: 'Gratitude',
    description: 'Notice small, ordinary warmth.',
    accent: '#C4863C',
  },
  {
    id: 'Breathing' as const,
    title: 'Breathing',
    description: 'Steady pauses to calm the body.',
    accent: '#655F35',
  },
  {
    id: 'Other' as const,
    title: 'Other',
    description: 'Name your own focus in your own words.',
    accent: '#674223',
  },
];

export interface TutorialStep {
  id: 'desk' | 'piano' | 'void' | 'checkin';
  title: string;
  catLine: string;
  spotlight?: {
    xPct: number;
    yPct: number;
    label: string;
  };
}

export const TUTORIAL_STEPS: TutorialStep[] = [
  {
    id: 'desk',
    title: 'My Desk',
    catLine:
      'Three gentle exercises tailored to your comforts and focus live here each day.',
    spotlight: { xPct: 28, yPct: 43, label: 'My Desk' },
  },
  {
    id: 'piano',
    title: 'The Piano',
    catLine:
      'Log your mood anytime to weave calm instrumental melodies and replay your monthly songs.',
    spotlight: { xPct: 48, yPct: 33, label: 'The Piano' },
  },
  {
    id: 'void',
    title: 'The Void',
    catLine:
      'Behind this door is a quiet, judgment-free space to release heavy thoughts and watch them mend in gold.',
    spotlight: { xPct: 66, yPct: 34, label: 'The Void' },
  },
  {
    id: 'checkin',
    title: 'Monthly Check-In',
    catLine:
      'Once a month, a brief PHQ-9 check-in tracks recovery and exports cleanly for your therapist.',
    spotlight: { xPct: 28, yPct: 43, label: 'Monthly Check-In' },
  },
];

export const PHQ9_QUESTIONS: string[] = [
  'Little interest or pleasure in doing things',
  'Feeling down, depressed, or hopeless',
  'Trouble falling or staying asleep, or sleeping too much',
  'Feeling tired or having little energy',
  'Poor appetite or overeating',
  'Feeling bad about yourself — or that you are a failure or have let yourself or your family down',
  'Trouble concentrating on things, such as reading the newspaper or watching television',
  'Moving or speaking so slowly that other people could have noticed? Or the opposite — being so fidgety or restless that you have been moving around a lot more than usual',
  'Thoughts that you would be better off dead, or of hurting yourself in some way',
];

export const PHQ9_OPTIONS = [
  { value: 0, label: 'Not at all' },
  { value: 1, label: 'Several days' },
  { value: 2, label: 'More than half the days' },
  { value: 3, label: 'Nearly every day' },
];

export const SEEDED_SONGS: MonthlySong[] = [
  {
    id: 'january-2026',
    title: 'Song of January',
    monthLabel: 'January 2026',
    description: 'Calm mid-register acoustic phrases.',
    notes: [
      { id: 'j1', emotion: 'Tired', intensity: 4, note: 'C4–G4', melody: ['C4', 'E4', 'G4', 'E4'], instrument: 'Flute', frequency: 261.63, timestamp: '2026-01-04T09:30:00Z', dayLabel: 'Jan 4' },
      { id: 'j2', emotion: 'Heavy', intensity: 7, note: 'D4–A4', melody: ['D4', 'G4', 'A4', 'G4'], instrument: 'Harp', frequency: 293.66, timestamp: '2026-01-08T20:15:00Z', dayLabel: 'Jan 8' },
      { id: 'j3', emotion: 'Anxious', intensity: 6, note: 'E4–A4', melody: ['E4', 'G4', 'A4', 'E4'], instrument: 'Kalimba', frequency: 329.63, timestamp: '2026-01-12T18:00:00Z', dayLabel: 'Jan 12' },
      { id: 'j4', emotion: 'Calm', intensity: 4, note: 'G4–D4', melody: ['G4', 'E4', 'D4', 'E4'], instrument: 'Felt Piano', frequency: 392.0, timestamp: '2026-01-16T11:20:00Z', dayLabel: 'Jan 16' },
      { id: 'j5', emotion: 'Heavy', intensity: 5, note: 'D4–G4', melody: ['D4', 'E4', 'G4', 'D4'], instrument: 'Celesta', frequency: 293.66, timestamp: '2026-01-20T21:10:00Z', dayLabel: 'Jan 20' },
      { id: 'j6', emotion: 'Tired', intensity: 5, note: 'E4–A4', melody: ['E4', 'A4', 'G4', 'E4'], instrument: 'Flute', frequency: 329.63, timestamp: '2026-01-25T15:40:00Z', dayLabel: 'Jan 25' },
      { id: 'j7', emotion: 'Hopeful', intensity: 6, note: 'C4–A4', melody: ['C4', 'D4', 'G4', 'E4'], instrument: 'Harp', frequency: 261.63, timestamp: '2026-01-29T10:05:00Z', dayLabel: 'Jan 29' },
    ],
  },
  {
    id: 'march-2026',
    title: 'Song of March',
    monthLabel: 'March 2026',
    description: 'Gentle spring acoustic phrases.',
    notes: [
      { id: 'm1', emotion: 'Calm', intensity: 5, note: 'E4–A4', melody: ['E4', 'G4', 'A4', 'G4'], instrument: 'Kalimba', frequency: 329.63, timestamp: '2026-03-03T10:00:00Z', dayLabel: 'Mar 3' },
      { id: 'm2', emotion: 'Hopeful', intensity: 6, note: 'D4–G4', melody: ['D4', 'E4', 'G4', 'A4'], instrument: 'Flute', frequency: 293.66, timestamp: '2026-03-07T14:20:00Z', dayLabel: 'Mar 7' },
      { id: 'm3', emotion: 'Anxious', intensity: 4, note: 'G4–D4', melody: ['G4', 'E4', 'D4', 'G4'], instrument: 'Harp', frequency: 392.0, timestamp: '2026-03-11T19:00:00Z', dayLabel: 'Mar 11' },
      { id: 'm4', emotion: 'Calm', intensity: 7, note: 'C4–G4', melody: ['C4', 'D4', 'E4', 'G4'], instrument: 'Felt Piano', frequency: 261.63, timestamp: '2026-03-15T09:15:00Z', dayLabel: 'Mar 15' },
      { id: 'm5', emotion: 'Joyful', intensity: 7, note: 'A4–D4', melody: ['A4', 'G4', 'E4', 'D4'], instrument: 'Celesta', frequency: 440.0, timestamp: '2026-03-19T16:45:00Z', dayLabel: 'Mar 19' },
      { id: 'm6', emotion: 'Tired', intensity: 3, note: 'E4–D4', melody: ['E4', 'G4', 'D4', 'E4'], instrument: 'Kalimba', frequency: 329.63, timestamp: '2026-03-23T21:00:00Z', dayLabel: 'Mar 23' },
      { id: 'm7', emotion: 'Hopeful', intensity: 8, note: 'D4–A4', melody: ['D4', 'G4', 'E4', 'A4'], instrument: 'Flute', frequency: 293.66, timestamp: '2026-03-28T11:30:00Z', dayLabel: 'Mar 28' },
    ],
  },
  {
    id: 'november-2026',
    title: 'Song of November',
    monthLabel: 'November 2026',
    isCurrent: true,
    description: 'Your living melody this month.',
    notes: [
      { id: 'n1', emotion: 'Calm', intensity: 5, note: 'E4–A4', melody: ['E4', 'G4', 'A4', 'G4'], instrument: 'Harp', frequency: 329.63, timestamp: '2026-11-10T09:00:00Z', dayLabel: 'Nov 10' },
      { id: 'n2', emotion: 'Hopeful', intensity: 6, note: 'D4–G4', melody: ['D4', 'E4', 'G4', 'E4'], instrument: 'Flute', frequency: 293.66, timestamp: '2026-11-12T17:30:00Z', dayLabel: 'Nov 12' },
    ],
  },
];

export const SEEDED_PHQ9_HISTORY: Phq9Record[] = [
  {
    id: 'phq-aug-2026',
    monthLabel: 'August 2026',
    dateIso: '2026-08-15T10:00:00Z',
    answers: [2, 2, 2, 3, 1, 2, 2, 1, 0],
    totalScore: 15,
    severity: 'Moderately Severe',
  },
  {
    id: 'phq-sep-2026',
    monthLabel: 'September 2026',
    dateIso: '2026-09-14T10:00:00Z',
    answers: [1, 2, 2, 2, 1, 1, 2, 1, 0],
    totalScore: 12,
    severity: 'Moderate',
  },
  {
    id: 'phq-oct-2026',
    monthLabel: 'October 2026',
    dateIso: '2026-10-14T10:00:00Z',
    answers: [1, 1, 1, 2, 1, 1, 1, 0, 0],
    totalScore: 8,
    severity: 'Mild',
  },
];

export const DEFAULT_PROFILE: UserProfile = {
  hobbies: ['Reading', 'Music', 'Nature walks'],
  recoveryDuration: ['A few months'],
  heaviestSituations: ['Low energy & fatigue', 'Overthinking at night'],
  growthGoals: ['Self-compassion', 'Daily consistency'],
  coreFocus: 'Self-Love',
  onboardingCompleted: false,
};
