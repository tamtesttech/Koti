import React, { useEffect, useState } from 'react';
import { Music, Play, Square, Volume2, X, Check } from 'lucide-react';
import { EmotionKind, InstrumentKind, MonthlySong } from '../types/koti';
import {
  CALM_INSTRUMENTS,
  computeNoteColor,
  generateGentleMelody,
  getAverageMoodIntensity,
  MELODIC_MOTIFS,
} from '../utils/kotiLogic';
import {
  playMelodySequence,
  playTunePhrase,
  stopMelodyPlayback,
} from '../utils/pianoAudio';
import { ClayDescriptionCard } from './ClayDescriptionCard';

interface ThePianoModalProps {
  songs: MonthlySong[];
  onClose: () => void;
  onLogMood: (
    emotion: EmotionKind,
    intensity: number,
    customEmotion?: string
  ) => void;
}

const EMOTIONS: EmotionKind[] = [
  'Calm',
  'Hopeful',
  'Heavy',
  'Anxious',
  'Tired',
  'Joyful',
  'Other',
];

export const ThePianoModal: React.FC<ThePianoModalProps> = ({
  songs,
  onClose,
  onLogMood,
}) => {
  const [activeTab, setActiveTab] = useState<'log' | 'archive'>('log');
  const [selectedEmotion, setSelectedEmotion] = useState<EmotionKind>('Calm');
  const [customEmotion, setCustomEmotion] = useState('');
  const [intensity, setIntensity] = useState<number>(5);
  const [justLoggedLabel, setJustLoggedLabel] = useState<string | null>(null);
  const [playingSongId, setPlayingSongId] = useState<string | null>(null);
  const [activeNoteIdx, setActiveNoteIdx] = useState<number | null>(null);
  const [activeMotifIdx, setActiveMotifIdx] = useState<number | null>(null);

  useEffect(() => {
    return () => {
      stopMelodyPlayback();
    };
  }, []);

  const currentSong = songs.find((s) => s.isCurrent) || songs[songs.length - 1];
  const noteCount = currentSong?.notes.length ?? 0;
  const nextTune = generateGentleMelody(noteCount);

  const handleSubmitMood = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedEmotion === 'Other' && !customEmotion.trim()) {
      return;
    }

    playTunePhrase(nextTune.melody, nextTune.instrument);
    onLogMood(
      selectedEmotion,
      intensity,
      selectedEmotion === 'Other' ? customEmotion.trim() : undefined
    );
    const label =
      selectedEmotion === 'Other' ? customEmotion.trim() : selectedEmotion;
    setJustLoggedLabel(`${label} (${intensity}/10)`);
    if (selectedEmotion === 'Other') {
      setCustomEmotion('');
    }
  };

  const handlePlaySong = (song: MonthlySong) => {
    if (playingSongId === song.id) {
      stopMelodyPlayback();
      setPlayingSongId(null);
      setActiveNoteIdx(null);
      return;
    }
    setPlayingSongId(song.id);
    playMelodySequence(song.notes, (idx) => {
      setActiveNoteIdx(idx);
      if (idx === null) {
        setPlayingSongId(null);
      }
    });
  };

  const handlePreviewMotif = (
    idx: number,
    motif: string[],
    instrument: InstrumentKind
  ) => {
    setActiveMotifIdx(idx);
    playTunePhrase(motif, instrument);
    window.setTimeout(() => setActiveMotifIdx(null), motif.length * 310 + 200);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-[#3B2412]/55 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="piano-modal-title"
    >
      <ClayDescriptionCard
        title={activeTab === 'log' ? 'Mood & Melodies' : 'Song Archive'}
        scrollable
        maxWidthClass="w-full max-w-4xl"
        bodyClassName="py-2"
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-4 border-b border-[#674223]/12">
          <div>
            <p className="text-xs font-semibold text-[#C4863C]">The Piano</p>
            <h2
              id="piano-modal-title"
              className="font-display text-2xl sm:text-3xl font-semibold text-[#4A2D15] mt-0.5"
            >
              Mood & Melodies
            </h2>
          </div>

          <button
            type="button"
            onClick={() => {
              stopMelodyPlayback();
              onClose();
            }}
            aria-label="Close The Piano"
            className="clay-button-secondary w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Segmented Tabs */}
        <div className="mt-4 inline-flex items-center gap-1.5 p-1.5 rounded-2xl bg-[#EAD7C5] border border-[#674223]/14">
          <button
            type="button"
            onClick={() => setActiveTab('log')}
            className={`min-h-[38px] px-4 py-1.5 rounded-xl text-xs sm:text-sm font-semibold cursor-pointer ${
              activeTab === 'log'
                ? 'bg-[#AC6332] text-[#FCF6EF] shadow-sm'
                : 'text-[#4A2D15] hover:bg-[#F4E8DA]/60'
            }`}
          >
            Log Mood
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('archive')}
            className={`min-h-[38px] px-4 py-1.5 rounded-xl text-xs sm:text-sm font-semibold cursor-pointer ${
              activeTab === 'archive'
                ? 'bg-[#AC6332] text-[#FCF6EF] shadow-sm'
                : 'text-[#4A2D15] hover:bg-[#F4E8DA]/60'
            }`}
          >
            Song Archive ({songs.length})
          </button>
        </div>

        {activeTab === 'log' ? (
          <form onSubmit={handleSubmitMood} className="mt-5 space-y-5">
            {/* Emotion Picker */}
            <div className="space-y-2">
              <p className="text-sm font-semibold text-[#4A2D15]">1. Feeling</p>
              <div className="flex flex-wrap gap-2">
                {EMOTIONS.map((emotion) => {
                  const active = selectedEmotion === emotion;
                  return (
                    <button
                      key={emotion}
                      type="button"
                      aria-pressed={active}
                      onClick={() => setSelectedEmotion(emotion)}
                      className={`min-h-[40px] px-4 py-2 rounded-2xl text-xs sm:text-sm font-medium transition-all cursor-pointer ${
                        active
                          ? 'bg-[#655F35] text-[#FCF6EF] shadow-sm'
                          : 'bg-[#EAD7C5] text-[#4A2D15] border border-[#674223]/16 hover:bg-[#E2CBB5]'
                      }`}
                    >
                      {emotion}
                    </button>
                  );
                })}
              </div>

              {selectedEmotion === 'Other' && (
                <div className="pt-1.5">
                  <input
                    type="text"
                    required
                    aria-label="Custom feeling"
                    value={customEmotion}
                    onChange={(e) => setCustomEmotion(e.target.value)}
                    placeholder="Type how it feels..."
                    className="w-full rounded-2xl bg-[#FCF6EF] border border-[#674223]/22 px-4 py-2.5 text-sm text-[#4A2D15] placeholder:text-[#674223]/50 focus:outline-none focus:ring-2 focus:ring-[#AC6332]/50"
                  />
                </div>
              )}
            </div>

            {/* Intensity Slider */}
            <div className="clay-card-soft rounded-3xl p-4 sm:p-5 space-y-2.5">
              <div className="flex items-center justify-between gap-2">
                <label
                  htmlFor="mood-intensity-slider"
                  className="text-sm font-semibold text-[#4A2D15]"
                >
                  2. Intensity
                </label>
                <span className="font-mono-tabular text-sm font-semibold text-[#AC6332]">
                  {intensity} / 10
                </span>
              </div>

              <input
                id="mood-intensity-slider"
                type="range"
                min={1}
                max={10}
                value={intensity}
                onChange={(e) => setIntensity(Number(e.target.value))}
                className="w-full accent-[#AC6332] cursor-pointer h-2.5 rounded-lg"
              />

              <div className="flex justify-between text-[11px] text-[#674223]/80">
                <span>1 · Gentle</span>
                <span>5 · Steady</span>
                <span>10 · Strong</span>
              </div>
            </div>

            {/* Neutral Acoustic Melodies */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-[#674223]">
                  Calm tunes (tap to listen)
                </p>
                <span className="text-xs text-[#C4863C] flex items-center gap-1">
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>Flute · Harp · Kalimba · Piano</span>
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {MELODIC_MOTIFS.slice(0, 4).map((motif, idx) => {
                  const isPlaying = activeMotifIdx === idx;
                  const instrument = CALM_INSTRUMENTS[idx % CALM_INSTRUMENTS.length];
                  return (
                    <button
                      key={motif.join('-')}
                      type="button"
                      onClick={() => handlePreviewMotif(idx, motif, instrument)}
                      className={`min-h-[46px] px-3 py-2 rounded-2xl text-xs font-medium transition-all cursor-pointer flex items-center justify-center gap-1.5 border ${
                        isPlaying
                          ? 'bg-[#C4863C] text-[#FCF6EF] border-[#674223] scale-[0.98]'
                          : 'bg-[#FCF6EF] text-[#4A2D15] border-[#674223]/20 hover:bg-[#EAD7C5]'
                      }`}
                    >
                      <Play className="w-3.5 h-3.5 fill-current shrink-0" />
                      <span>{instrument}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {justLoggedLabel && (
              <div className="rounded-2xl bg-[#EAE8D8] border border-[#655F35]/30 p-3.5 flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs sm:text-sm font-medium text-[#4A2D15] flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#655F35]" />
                  <span>Added {justLoggedLabel} to {currentSong?.title}.</span>
                </span>
                <button
                  type="button"
                  onClick={() => setActiveTab('archive')}
                  className="text-xs font-semibold text-[#AC6332] underline underline-offset-4 cursor-pointer"
                >
                  Listen in Archive
                </button>
              </div>
            )}

            <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
              <p className="text-xs text-[#674223]">
                {currentSong ? `${noteCount} entries this month` : ''}
              </p>
              <button
                type="submit"
                className="clay-button-primary min-h-[46px] px-6 py-2.5 rounded-2xl text-sm font-semibold flex items-center gap-2 cursor-pointer"
              >
                <Music className="w-4 h-4" />
                <span>Log Mood & Play Tune</span>
              </button>
            </div>
          </form>
        ) : (
          <div className="mt-5 space-y-4">
            {songs.map((song) => {
              const isPlaying = playingSongId === song.id;
              const avg = getAverageMoodIntensity(song.notes);
              return (
                <section
                  key={song.id}
                  className={`rounded-3xl p-5 space-y-3.5 ${
                    song.isCurrent
                      ? 'bg-[#FBF3E8] border-2 border-[#C4863C]/50 shadow-sm'
                      : 'clay-card-soft'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold text-[#AC6332]">
                        {song.isCurrent ? `${song.monthLabel} · Current` : song.monthLabel} ·{' '}
                        <span className="font-mono-tabular">{song.notes.length} phrases</span> · Avg{' '}
                        <span className="font-mono-tabular">{avg}/10</span>
                      </p>
                      <h3 className="font-display text-xl font-semibold text-[#4A2D15]">
                        {song.title}
                      </h3>
                    </div>

                    <button
                      type="button"
                      disabled={song.notes.length === 0}
                      onClick={() => handlePlaySong(song)}
                      className={`min-h-[40px] px-5 py-2 rounded-2xl text-xs sm:text-sm font-semibold flex items-center gap-2 shrink-0 cursor-pointer ${
                        isPlaying
                          ? 'bg-[#674223] text-[#FCF6EF]'
                          : 'clay-button-primary'
                      }`}
                    >
                      {isPlaying ? (
                        <>
                          <Square className="w-3.5 h-3.5 fill-current" />
                          <span>Stop</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 fill-current" />
                          <span>Play Song</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {song.notes.map((n, idx) => {
                      const highlighted = isPlaying && activeNoteIdx === idx;
                      const bg = computeNoteColor(n.emotion);
                      const label =
                        n.emotion === 'Other' && n.customEmotion
                          ? n.customEmotion
                          : n.emotion;
                      const phrase =
                        n.melody && n.melody.length > 0 ? n.melody : [n.note || 'G4'];
                      const phraseInst: InstrumentKind = n.instrument || 'Felt Piano';
                      return (
                        <button
                          key={n.id}
                          type="button"
                          onClick={() => playTunePhrase(phrase, phraseInst)}
                          style={{
                            borderColor: highlighted ? '#C4863C' : 'rgba(103,66,35,0.16)',
                            backgroundColor: highlighted ? '#C4863C' : '#FCF6EF',
                            color: highlighted ? '#FCF6EF' : '#4A2D15',
                          }}
                          className={`px-3 py-2 rounded-2xl border text-left transition-transform cursor-pointer ${
                            highlighted ? 'scale-105 shadow-md' : 'hover:bg-[#F4E8DA]'
                          }`}
                        >
                          <div className="flex items-center gap-1.5">
                            <span
                              className="w-2 h-2 rounded-full shrink-0"
                              style={{ backgroundColor: highlighted ? '#FCF6EF' : bg }}
                              aria-hidden="true"
                            />
                            <span className="text-xs font-semibold">{label}</span>
                          </div>
                          <p className="text-[10px] opacity-75 mt-0.5 font-mono-tabular">
                            {n.dayLabel} · {n.intensity}/10 · {phraseInst}
                          </p>
                        </button>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </ClayDescriptionCard>
    </div>
  );
};
