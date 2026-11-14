export type CoreFocus = 'Self-Love' | 'Gratitude' | 'Breathing' | 'Other';

export type InstrumentKind =
  | 'Flute'
  | 'Harp'
  | 'Kalimba'
  | 'Felt Piano'
  | 'Celesta';

export type AppStage = 'intro-questions' | 'intro-focus' | 'tutorial' | 'room';

export type RoomModal = 'none' | 'desk' | 'piano' | 'void' | 'phq9';

export interface UserProfile {
  hobbies: string[];
  recoveryDuration: string[];
  heaviestSituations: string[];
  growthGoals: string[];
  customAnswers?: {
    hobbies?: string;
    recoveryDuration?: string;
    heaviestSituations?: string;
    growthGoals?: string;
  };
  coreFocus: CoreFocus;
  customFocus?: string;
  onboardingCompleted: boolean;
}

export interface DeskExercise {
  id: string;
  title: string;
  focus: CoreFocus;
  kind: 'reflection' | 'breathing';
  groundingPrompt: string;
  sentenceStarter?: string;
  breathingPattern?: {
    inhaleSec: number;
    holdSec: number;
    exhaleSec: number;
    durationSec: number;
  };
  completed: boolean;
  userResponse?: string;
  completedAt?: string;
  adaptedFromTag?: string;
}

export type EmotionKind =
  | 'Calm'
  | 'Hopeful'
  | 'Heavy'
  | 'Anxious'
  | 'Tired'
  | 'Joyful'
  | 'Other';

export interface MoodNote {
  id: string;
  emotion: EmotionKind;
  customEmotion?: string;
  intensity: number; // 1 - 10
  note: string; // neutral mid-register label, e.g., 'C4–G4'
  melody?: string[]; // neutral mid-register melodic phrase
  instrument?: InstrumentKind;
  frequency: number;
  timestamp: string;
  dayLabel: string;
}

export interface MonthlySong {
  id: string;
  title: string;
  monthLabel: string;
  isCurrent?: boolean;
  description: string;
  notes: MoodNote[];
}

export interface VoidSession {
  id: string;
  userText: string;
  empathy: string;
  affirmation: string;
  emotionalTag: string;
  createdAt: string;
}

export interface Phq9Record {
  id: string;
  monthLabel: string;
  dateIso: string;
  answers: number[]; // length 9, values 0..3
  totalScore: number;
  severity: Phq9Severity;
}

export type Phq9Severity =
  | 'Minimal'
  | 'Mild'
  | 'Moderate'
  | 'Moderately Severe'
  | 'Severe';

export interface KotiState {
  profile: UserProfile;
  deskDateKey: string;
  deskExercises: DeskExercise[];
  reminderBadge: string | null;
  songs: MonthlySong[];
  voidHistory: VoidSession[];
  phq9History: Phq9Record[];
}
