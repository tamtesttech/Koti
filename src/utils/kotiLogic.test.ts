import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildFallbackExercises,
  CALM_INSTRUMENTS,
  calculatePhq9Score,
  classifyPhq9Severity,
  comparePhq9Months,
  formatMoodTrendsSummary,
  formatTherapistReport,
  generateGentleMelody,
  getFocusDisplayLabel,
  mapEmotionToPentatonicNote,
  PENTATONIC_SCALE,
} from './kotiLogic';
import { DEFAULT_PROFILE, SEEDED_PHQ9_HISTORY, SEEDED_SONGS } from '../data/kotiData';

test('generateGentleMelody produces neutral mid-register tunes across calm instruments independent of emotion', () => {
  const validNotes = new Set<string>(PENTATONIC_SCALE.map((p) => p.note));

  const tuneA = generateGentleMelody(0);
  const tuneB = generateGentleMelody(1);
  const mappedHeavy = mapEmotionToPentatonicNote('Heavy', 9, 2);
  const mappedJoyful = mapEmotionToPentatonicNote('Joyful', 2, 2);

  assert.ok(tuneA.melody.length >= 3);
  assert.ok(tuneA.melody.every((n) => validNotes.has(n)));
  assert.ok(CALM_INSTRUMENTS.includes(tuneA.instrument));
  assert.notDeepEqual(tuneA.melody, tuneB.melody);
  assert.notEqual(tuneA.instrument, tuneB.instrument);
  // Same variation index yields identical neutral tune & instrument regardless of emotion or intensity
  assert.deepEqual(mappedHeavy.melody, mappedJoyful.melody);
  assert.equal(mappedHeavy.instrument, mappedJoyful.instrument);
});

test('getFocusDisplayLabel resolves custom Other focus cleanly', () => {
  assert.equal(getFocusDisplayLabel(DEFAULT_PROFILE), 'Self-Love');
  assert.equal(
    getFocusDisplayLabel({ ...DEFAULT_PROFILE, coreFocus: 'Other', customFocus: 'Gentle mornings' }),
    'Gentle mornings'
  );
  assert.equal(
    getFocusDisplayLabel({ ...DEFAULT_PROFILE, coreFocus: 'Other', customFocus: '   ' }),
    'Other'
  );
});

test('PHQ-9 scoring and clinical severity band classification match standard cutoffs', () => {
  assert.equal(calculatePhq9Score([0, 0, 0, 0, 0, 0, 0, 0, 0]), 0);
  assert.equal(calculatePhq9Score([3, 3, 3, 3, 3, 3, 3, 3, 3]), 27);
  assert.equal(calculatePhq9Score([1, 1, 1, 1, 0, 0, 0, 0, 0]), 4);

  assert.equal(classifyPhq9Severity(0), 'Minimal');
  assert.equal(classifyPhq9Severity(4), 'Minimal');
  assert.equal(classifyPhq9Severity(5), 'Mild');
  assert.equal(classifyPhq9Severity(9), 'Mild');
  assert.equal(classifyPhq9Severity(10), 'Moderate');
  assert.equal(classifyPhq9Severity(14), 'Moderate');
  assert.equal(classifyPhq9Severity(15), 'Moderately Severe');
  assert.equal(classifyPhq9Severity(19), 'Moderately Severe');
  assert.equal(classifyPhq9Severity(20), 'Severe');
  assert.equal(classifyPhq9Severity(27), 'Severe');
});

test('comparePhq9Months computes delta and clinical narrative accurately', () => {
  const oct = SEEDED_PHQ9_HISTORY[2]; // 8
  const sep = SEEDED_PHQ9_HISTORY[1]; // 12
  const improved = comparePhq9Months(oct, sep);
  assert.equal(improved.delta, -4);
  assert.match(improved.summary, /4 points lower/);

  const baselineOnly = comparePhq9Months(oct, undefined);
  assert.equal(baselineOnly.delta, 0);
  assert.match(baselineOnly.summary, /Baseline/);
});

test('buildFallbackExercises produces 3 tailored exercises adapting to custom focus and Void tags without quotes', () => {
  const exercises = buildFallbackExercises(
    { ...DEFAULT_PROFILE, coreFocus: 'Other', customFocus: 'Quiet stillness', hobbies: ['Gardening'] },
    ['Evening overthinking']
  );
  assert.equal(exercises.length, 3);
  assert.equal(exercises[0].focus, 'Other');
  assert.match(exercises[0].groundingPrompt, /Evening overthinking/);
  assert.match(exercises[0].groundingPrompt, /quiet stillness/i);
  assert.ok(exercises.some((ex) => ex.kind === 'breathing'));
  assert.ok(exercises.every((ex) => !/[""“”]/.test(ex.groundingPrompt) && !/[""“”]/.test(ex.title)));
});

test('formatTherapistReport generates complete clinical summary with PHQ-9, mood trends, and completed exercises', () => {
  const exercises = buildFallbackExercises(DEFAULT_PROFILE, ['Quiet fatigue']);
  exercises[0].completed = true;
  exercises[0].userResponse = 'Rested for 15 minutes without guilt.';

  const report = formatTherapistReport({
    profile: { ...DEFAULT_PROFILE, coreFocus: 'Other', customFocus: 'Slow pacing' },
    phq9History: SEEDED_PHQ9_HISTORY,
    songs: SEEDED_SONGS,
    deskExercises: exercises,
    voidHistory: [
      {
        id: 'v1',
        userText: 'Tired today',
        empathy: 'It makes sense.',
        affirmation: 'I am safe to rest.',
        emotionalTag: 'Quiet fatigue',
        createdAt: '2026-11-14T10:00:00Z',
      },
    ],
    generatedDate: '2026-11-14',
  });

  assert.match(report, /Primary Wellness Focus: Slow pacing/);
  assert.match(report, /PHQ-9 DEPRESSION SCREENING/);
  assert.match(report, /8 \/ 27 — Mild/);
  assert.match(report, /Rested for 15 minutes without guilt/);
  assert.match(report, /Quiet fatigue/);
  assert.ok(!/[“”]/.test(report));
  assert.ok(formatMoodTrendsSummary(SEEDED_SONGS).includes('November 2026'));
});
