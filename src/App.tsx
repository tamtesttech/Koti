import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  DEFAULT_PROFILE,
  SEEDED_PHQ9_HISTORY,
  SEEDED_SONGS,
} from './data/kotiData';
import {
  AppStage,
  EmotionKind,
  KotiState,
  MoodNote,
  Phq9Record,
  RoomModal,
  UserProfile,
  VoidSession,
} from './types/koti';
import {
  buildFallbackExercises,
  formatShortDayLabel,
  getFocusDisplayLabel,
  getTodayKey,
  mapEmotionToPentatonicNote,
} from './utils/kotiLogic';
import { TopBar } from './components/TopBar';
import { IntroFlow } from './components/IntroFlow';
import { IsometricRoom } from './components/IsometricRoom';
import { MyDeskModal } from './components/MyDeskModal';
import { ThePianoModal } from './components/ThePianoModal';
import { TheVoidView } from './components/TheVoidView';
import { Phq9Modal } from './components/Phq9Modal';
import warmBackdrop from './assets/images/koti_warm_backdrop_1794686086262.jpg';

const STORAGE_KEY = 'koti_wellness_state_v1';

function createInitialState(): KotiState {
  const today = getTodayKey();
  return {
    profile: { ...DEFAULT_PROFILE },
    deskDateKey: today,
    deskExercises: buildFallbackExercises(DEFAULT_PROFILE, []),
    reminderBadge: null,
    songs: SEEDED_SONGS,
    voidHistory: [],
    phq9History: SEEDED_PHQ9_HISTORY,
  };
}

function loadState(): KotiState {
  if (typeof window === 'undefined') return createInitialState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return createInitialState();
    const parsed = JSON.parse(raw) as Partial<KotiState>;
    const base = createInitialState();
    return {
      ...base,
      ...parsed,
      profile: { ...base.profile, ...(parsed.profile || {}) },
      songs: parsed.songs && parsed.songs.length > 0 ? parsed.songs : base.songs,
      phq9History:
        parsed.phq9History && parsed.phq9History.length > 0
          ? parsed.phq9History
          : base.phq9History,
      deskExercises:
        parsed.deskExercises && parsed.deskExercises.length > 0
          ? parsed.deskExercises
          : base.deskExercises,
      voidHistory: parsed.voidHistory || [],
    };
  } catch {
    return createInitialState();
  }
}

export default function App() {
  const [state, setState] = useState<KotiState>(loadState);
  const [stage, setStage] = useState<AppStage>(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('autostart') === '1') return 'room';
    }
    const saved = loadState();
    return saved.profile.onboardingCompleted ? 'room' : 'intro-questions';
  });
  const [tutorialIndex, setTutorialIndex] = useState<number>(0);
  const [activeModal, setActiveModal] = useState<RoomModal>('none');
  const [deskLoading, setDeskLoading] = useState<boolean>(false);
  const [deskError, setDeskError] = useState<string | null>(null);
  const [deskFetchedWithAi, setDeskFetchedWithAi] = useState<boolean>(false);

  // Background music state (/bg_music.mp3 at 15% volume)
  const bgAudioRef = useRef<HTMLAudioElement | null>(null);
  const [bgMusicUnlocked, setBgMusicUnlocked] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore storage quota errors
    }
  }, [state]);

  // Keep /bg_music.mp3 synchronized with Void silence rule and global mute toggle
  useEffect(() => {
    const audio = bgAudioRef.current;
    if (!audio) return;
    audio.volume = 0.15;

    const shouldSilence = activeModal === 'void' || isMuted;
    if (shouldSilence) {
      audio.pause();
      return;
    }

    if (bgMusicUnlocked) {
      audio.play().catch(() => {
        // Ignore autoplay restrictions if not triggered by direct gesture
      });
    }
  }, [activeModal, bgMusicUnlocked, isMuted]);

  const handleStartMusicFromIntro = useCallback(() => {
    setBgMusicUnlocked(true);
    const audio = bgAudioRef.current;
    if (!audio || isMuted || activeModal === 'void') return;
    audio.volume = 0.15;
    audio.play().catch(() => {
      // Ignore playback errors in restricted environments
    });
  }, [activeModal, isMuted]);

  const handleToggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const nextMuted = !prev;
      const audio = bgAudioRef.current;
      if (audio) {
        if (nextMuted) {
          audio.pause();
        } else {
          setBgMusicUnlocked(true);
          if (activeModal !== 'void') {
            audio.volume = 0.15;
            audio.play().catch(() => {});
          }
        }
      }
      return nextMuted;
    });
  }, [activeModal]);

  const recentVoidTags = useMemo(
    () => state.voidHistory.map((v) => v.emotionalTag).slice(0, 4),
    [state.voidHistory]
  );

  const fetchPersonalizedDesk = useCallback(
    async (profile: UserProfile, voidTags: string[], force = false) => {
      if (!force && deskFetchedWithAi) return;
      setDeskLoading(true);
      setDeskError(null);
      try {
        const res = await fetch('/api/desk/exercises', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            profile,
            recentVoidTags: voidTags,
            previousTitles: state.deskExercises.map((e) => e.title),
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Could not reach Gemini API.');
        }
        setState((prev) => ({
          ...prev,
          deskDateKey: getTodayKey(),
          deskExercises: data.exercises,
        }));
        setDeskFetchedWithAi(true);
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Service unavailable';
        setDeskError(msg);
        setState((prev) => ({
          ...prev,
          deskExercises: buildFallbackExercises(profile, voidTags),
        }));
      } finally {
        setDeskLoading(false);
      }
    },
    [deskFetchedWithAi, state.deskExercises]
  );

  const handleOpenModal = (modal: RoomModal) => {
    setActiveModal(modal);
    if (modal === 'desk' && !deskFetchedWithAi) {
      fetchPersonalizedDesk(state.profile, recentVoidTags, false);
    }
  };

  const handleUpdateProfile = (nextProfile: UserProfile) => {
    setState((prev) => ({
      ...prev,
      profile: nextProfile,
      deskExercises: buildFallbackExercises(
        nextProfile,
        prev.voidHistory.map((v) => v.emotionalTag)
      ),
    }));
    setDeskFetchedWithAi(false);
  };

  const handleCompleteOnboarding = () => {
    const finalized: UserProfile = {
      ...state.profile,
      onboardingCompleted: true,
    };
    setState((prev) => ({
      ...prev,
      profile: finalized,
      deskExercises: buildFallbackExercises(
        finalized,
        prev.voidHistory.map((v) => v.emotionalTag)
      ),
    }));
    setDeskFetchedWithAi(false);
    setTutorialIndex(0);
    setStage('tutorial');
  };

  const handleSkipOnboarding = () => {
    const finalized: UserProfile = {
      ...state.profile,
      onboardingCompleted: true,
    };
    setState((prev) => ({ ...prev, profile: finalized }));
    setTutorialIndex(0);
    setStage('tutorial');
  };

  const handleCompleteExercise = (exerciseId: string, responseText: string) => {
    setState((prev) => ({
      ...prev,
      deskExercises: prev.deskExercises.map((ex) =>
        ex.id === exerciseId
          ? {
              ...ex,
              completed: true,
              userResponse: responseText,
              completedAt: new Date().toISOString(),
            }
          : ex
      ),
      reminderBadge: responseText,
    }));
  };

  const handleLogMood = (
    emotion: EmotionKind,
    intensity: number,
    customEmotion?: string
  ) => {
    const currentSong =
      state.songs.find((s) => s.isCurrent) || state.songs[state.songs.length - 1];
    const variationIndex = currentSong ? currentSong.notes.length : 0;
    const { note, melody, instrument, frequency } = mapEmotionToPentatonicNote(
      emotion,
      intensity,
      variationIndex
    );
    const newNote: MoodNote = {
      id: `note-${Date.now()}`,
      emotion,
      customEmotion,
      intensity,
      note,
      melody,
      instrument,
      frequency,
      timestamp: new Date().toISOString(),
      dayLabel: formatShortDayLabel(),
    };

    setState((prev) => ({
      ...prev,
      songs: prev.songs.map((song) =>
        song.isCurrent ? { ...song, notes: [...song.notes, newNote] } : song
      ),
    }));
  };

  const handleSaveVoidSession = (session: VoidSession) => {
    setState((prev) => {
      const nextHistory = [session, ...prev.voidHistory];
      const nextTags = nextHistory.map((v) => v.emotionalTag).slice(0, 4);
      return {
        ...prev,
        voidHistory: nextHistory,
        // Immediately reflect closed-loop tag while allowing fresh AI fetch next Desk visit
        deskExercises: buildFallbackExercises(prev.profile, nextTags),
      };
    });
    setDeskFetchedWithAi(false);
  };

  const handleSubmitPhq9 = (record: Phq9Record) => {
    setState((prev) => ({
      ...prev,
      phq9History: [...prev.phq9History, record],
    }));
  };

  const handleResetDemo = () => {
    const fresh = createInitialState();
    setState(fresh);
    setActiveModal('none');
    setTutorialIndex(0);
    setDeskFetchedWithAi(false);
    setDeskError(null);
    setBgMusicUnlocked(false);
    if (bgAudioRef.current) {
      bgAudioRef.current.pause();
      bgAudioRef.current.currentTime = 0;
    }
    setStage('intro-questions');
  };

  const latestPhq =
    state.phq9History.length > 0
      ? state.phq9History[state.phq9History.length - 1]
      : undefined;

  return (
    <div
      className="min-h-screen w-full text-[#4A2D15] flex flex-col relative isolate"
      data-stage={stage}
      data-modal={activeModal}
      data-music-muted={isMuted ? 'true' : 'false'}
      data-music-unlocked={bgMusicUnlocked ? 'true' : 'false'}
    >
      {/* Atmospheric clay cottage background */}
      <div className="fixed inset-0 -z-10 pointer-events-none" aria-hidden="true">
        <img
          src={warmBackdrop}
          alt=""
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-[#DCC3AC]/52" />
      </div>

      {/* Continuous low-volume background ambient audio (silent in The Void) */}
      <audio
        ref={bgAudioRef}
        src="/bg_music.mp3"
        loop
        preload="auto"
      />

      <TopBar
        coreFocus={getFocusDisplayLabel(state.profile)}
        showDemoMenu={true}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        onReplayIntro={() => {
          setActiveModal('none');
          setBgMusicUnlocked(false);
          if (bgAudioRef.current) {
            bgAudioRef.current.pause();
            bgAudioRef.current.currentTime = 0;
          }
          setStage('intro-questions');
        }}
        onReplayTutorial={() => {
          setActiveModal('none');
          setTutorialIndex(0);
          setStage('tutorial');
        }}
        onOpenMonthlyCheckIn={() => {
          setStage('room');
          setActiveModal('phq9');
        }}
        onResetDemo={handleResetDemo}
      />

      {(stage === 'intro-questions' || stage === 'intro-focus') && (
        <IntroFlow
          step={stage}
          profile={state.profile}
          onUpdateProfile={handleUpdateProfile}
          onContinueToFocus={() => setStage('intro-focus')}
          onBackToQuestions={() => setStage('intro-questions')}
          onCompleteOnboarding={handleCompleteOnboarding}
          onSkip={handleSkipOnboarding}
          onStartMusic={handleStartMusicFromIntro}
        />
      )}

      {(stage === 'tutorial' || stage === 'room') && (
        <IsometricRoom
          isTutorial={stage === 'tutorial'}
          tutorialIndex={tutorialIndex}
          onTutorialNext={() => {
            if (tutorialIndex >= 3) {
              setStage('room');
            } else {
              setTutorialIndex((i) => i + 1);
            }
          }}
          onTutorialPrev={() => setTutorialIndex((i) => Math.max(0, i - 1))}
          onTutorialSkip={() => setStage('room')}
          onOpenModal={handleOpenModal}
          deskExercises={state.deskExercises}
          reminderBadge={state.reminderBadge}
          latestPhq9Label={
            latestPhq ? `Last: ${latestPhq.totalScore}/27` : undefined
          }
        />
      )}

      {activeModal === 'desk' && (
        <MyDeskModal
          profile={state.profile}
          exercises={state.deskExercises}
          recentVoidTags={recentVoidTags}
          loading={deskLoading}
          error={deskError}
          onClose={() => setActiveModal('none')}
          onRefreshExercises={() =>
            fetchPersonalizedDesk(state.profile, recentVoidTags, true)
          }
          onCompleteExercise={handleCompleteExercise}
          onOpenMonthlyCheckIn={() => setActiveModal('phq9')}
        />
      )}

      {activeModal === 'piano' && (
        <ThePianoModal
          songs={state.songs}
          onClose={() => setActiveModal('none')}
          onLogMood={handleLogMood}
        />
      )}

      {activeModal === 'void' && (
        <TheVoidView
          profile={state.profile}
          onClose={() => setActiveModal('none')}
          onSaveSession={handleSaveVoidSession}
        />
      )}

      {activeModal === 'phq9' && (
        <Phq9Modal
          profile={state.profile}
          phq9History={state.phq9History}
          songs={state.songs}
          deskExercises={state.deskExercises}
          voidHistory={state.voidHistory}
          onClose={() => setActiveModal('none')}
          onSubmitPhq9={handleSubmitPhq9}
        />
      )}
    </div>
  );
}
