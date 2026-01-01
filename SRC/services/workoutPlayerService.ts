import { useState, useEffect, useCallback, useRef } from 'react';
import { PlayerState, WorkoutSet } from '../types';

// Mock Sound Player
const playBeep = () => {
  // In a real browser environment, we'd play an Audio file.
  // For demo, we just log.
  console.log("BEEP!");
  // Simple oscillator beep if allowed by browser policy
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContext) {
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 800;
      gain.gain.value = 0.1;
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    }
  } catch (e) {
    // Ignore audio errors
  }
};

interface UseWorkoutPlayerProps {
  initialSets: WorkoutSet[];
  restTimeSeconds: number;
  onSave: (sets: WorkoutSet[]) => void;
}

export const useWorkoutPlayer = ({ initialSets, restTimeSeconds, onSave }: UseWorkoutPlayerProps) => {
  const [state, setState] = useState<PlayerState>(PlayerState.WARMUP);
  const [sets, setSets] = useState<WorkoutSet[]>(initialSets);
  const [restTimer, setRestTimer] = useState(0);
  const [activeSetIndex, setActiveSetIndex] = useState(0);

  // Persistence (Offline-first / Recovery)
  useEffect(() => {
    const savedState = localStorage.getItem('activeWorkout');
    if (savedState) {
      try {
        const parsed = JSON.parse(savedState);
        setSets(parsed.sets);
        setState(parsed.state);
        setActiveSetIndex(parsed.activeSetIndex);
      } catch (e) {
        console.error("Failed to load cached workout", e);
      }
    }
  }, []);

  // Save state on change
  useEffect(() => {
    localStorage.setItem('activeWorkout', JSON.stringify({
      sets,
      state,
      activeSetIndex
    }));
  }, [sets, state, activeSetIndex]);

  // Wakelock Simulation
  useEffect(() => {
    let wakeLock: any = null;
    const requestWakeLock = async () => {
      if (state === PlayerState.WORKING && 'wakeLock' in navigator) {
        try {
          wakeLock = await (navigator as any).wakeLock.request('screen');
        } catch (err) {
          console.error(err);
        }
      }
    };
    requestWakeLock();
    return () => {
      if (wakeLock) wakeLock.release();
    };
  }, [state]);

  // Timer Logic
  useEffect(() => {
    let interval: any;
    if (state === PlayerState.RESTING && restTimer > 0) {
      interval = setInterval(() => {
        setRestTimer((prev) => {
          if (prev <= 4 && prev > 1) {
             // Play beep on 3, 2, 1 (offset by 1 sec delay of interval)
             playBeep();
          }
          if (prev <= 1) {
            // Timer Finished
            playBeep();
            setState(PlayerState.WORKING);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (state === PlayerState.RESTING && restTimer === 0) {
      // Safety catch if timer hits 0
      setState(PlayerState.WORKING);
    }
    return () => clearInterval(interval);
  }, [state, restTimer]);

  const toggleSet = useCallback((setId: string) => {
    setSets((prevSets) => {
      const newSets = prevSets.map((s, idx) => {
        if (s.id === setId) {
            const isCompleting = !s.completed;
            
            if (isCompleting) {
                // Logic: If checking a box, trigger rest
                setState(PlayerState.RESTING);
                setRestTimer(restTimeSeconds);
                // Advance active set index
                setActiveSetIndex(Math.min(prevSets.length - 1, idx + 1));
            }
            return { ...s, completed: isCompleting };
        }
        return s;
      });
      return newSets;
    });
  }, [restTimeSeconds]);

  const finishWorkout = useCallback(() => {
    setState(PlayerState.FINISHED);
    onSave(sets);
    localStorage.removeItem('activeWorkout');
  }, [sets, onSave]);

  const startWorkout = useCallback(() => {
    setState(PlayerState.WORKING);
  }, []);

  return {
    state,
    sets,
    restTimer,
    activeSetIndex,
    toggleSet,
    startWorkout,
    finishWorkout,
    resetRest: () => setState(PlayerState.WORKING)
  };
};