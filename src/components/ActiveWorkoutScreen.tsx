import React from 'react';
import { useWorkoutPlayer } from '../services/workoutPlayerService';
import { WorkoutSet, PlayerState } from '../types';
import { Play, Check, Timer, Save, RotateCcw } from 'lucide-react';

interface ActiveWorkoutScreenProps {
  exerciseName: string;
  initialSets: WorkoutSet[];
  onFinish: (sets: WorkoutSet[]) => void;
}

export const ActiveWorkoutScreen: React.FC<ActiveWorkoutScreenProps> = ({
  exerciseName,
  initialSets,
  onFinish,
}) => {
  const {
    state,
    sets,
    restTimer,
    activeSetIndex,
    toggleSet,
    startWorkout,
    finishWorkout,
    resetRest
  } = useWorkoutPlayer({
    initialSets,
    restTimeSeconds: 60,
    onSave: onFinish
  });

  const getStatusColor = () => {
    switch (state) {
      case PlayerState.WARMUP: return 'bg-yellow-600';
      case PlayerState.WORKING: return 'bg-green-600';
      case PlayerState.RESTING: return 'bg-blue-600';
      case PlayerState.FINISHED: return 'bg-gray-700';
      default: return 'bg-gray-800';
    }
  };

  if (state === PlayerState.FINISHED) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-8 text-center animate-fade-in">
        <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-6">
          <Check size={40} className="text-white" />
        </div>
        <h2 className="text-3xl font-bold mb-2">Workout Complete!</h2>
        <p className="text-gray-400 mb-8">Great job following the plan.</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-blue-600 rounded-lg font-bold hover:bg-blue-500 transition"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full max-w-md mx-auto relative bg-gray-900 shadow-xl overflow-hidden">
      {/* Header / Status Bar */}
      <div className={`p-6 transition-colors duration-500 ${getStatusColor()} shadow-lg`}>
        <h1 className="text-2xl font-bold text-white mb-1">{exerciseName}</h1>
        <div className="flex items-center justify-between">
          <span className="text-white/90 font-medium tracking-wide flex items-center gap-2">
            {state === PlayerState.WARMUP && "WARM UP"}
            {state === PlayerState.WORKING && "WORKING SET"}
            {state === PlayerState.RESTING && "RESTING"}
          </span>
          {state === PlayerState.RESTING && (
            <div className="flex items-center gap-2 bg-black/20 px-3 py-1 rounded-full">
              <Timer size={16} />
              <span className="font-mono text-xl font-bold">{restTimer}s</span>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {state === PlayerState.WARMUP ? (
           <div className="text-center p-8">
             <p className="text-gray-400 mb-6">Prepare your equipment. Click start when ready.</p>
             <button
                onClick={startWorkout}
                className="w-full py-4 bg-green-600 rounded-xl font-bold text-lg hover:bg-green-500 flex items-center justify-center gap-2 transition"
             >
               <Play size={24} /> START WORKOUT
             </button>
           </div>
        ) : (
          <div className="space-y-2">
            {sets.map((set, index) => {
              const isActive = index === activeSetIndex;
              const isPast = index < activeSetIndex;
              
              return (
                <div 
                  key={set.id}
                  className={`
                    flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-300
                    ${isActive ? 'border-blue-500 bg-gray-800 scale-[1.02] shadow-lg' : 'border-gray-800 bg-gray-800/50'}
                    ${set.completed ? 'opacity-70' : ''}
                  `}
                >
                  <div className="flex items-center gap-4">
                    <span className={`
                      w-8 h-8 flex items-center justify-center rounded-full font-bold text-sm
                      ${isActive ? 'bg-blue-500 text-white' : 'bg-gray-700 text-gray-400'}
                    `}>
                      {index + 1}
                    </span>
                    <div>
                      <div className="text-xl font-bold text-white">
                        {set.weight} <span className="text-sm font-normal text-gray-400">lbs</span>
                      </div>
                      <div className="text-sm text-gray-400">{set.reps} reps</div>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleSet(set.id)}
                    className={`
                      w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all
                      ${set.completed 
                        ? 'bg-green-500 border-green-500 text-white' 
                        : 'bg-transparent border-gray-600 text-gray-600 hover:border-gray-400'}
                    `}
                  >
                    <Check size={24} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Sticky Footer Controls */}
      <div className="p-4 bg-gray-900 border-t border-gray-800">
        {state === PlayerState.RESTING && (
           <button 
             onClick={resetRest}
             className="w-full mb-3 py-3 bg-gray-700 rounded-lg text-white font-semibold flex items-center justify-center gap-2 hover:bg-gray-600 transition"
           >
             <RotateCcw size={18} /> Skip Rest
           </button>
        )}
        
        {state !== PlayerState.WARMUP && (
          <button 
            onClick={finishWorkout}
            className="w-full py-4 bg-blue-600 rounded-xl font-bold text-white hover:bg-blue-500 flex items-center justify-center gap-2 shadow-lg transition"
          >
            <Save size={20} /> FINISH WORKOUT
          </button>
        )}
      </div>
    </div>
  );
};