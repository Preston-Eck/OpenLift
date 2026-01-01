import React, { useState, useEffect } from 'react';
import { ActiveWorkoutScreen } from './components/ActiveWorkoutScreen';
import { AnalyticsChart } from './components/AnalyticsChart';
import { geminiService } from './services/geminiService';
import { FitnessAnalyticsService } from './services/analyticsService';
import { Exercise, Equipment, WorkoutSet, WorkoutLog } from './types';
import { Dumbbell, Activity, BookOpen, BrainCircuit } from 'lucide-react';

// --- MOCK DATA FOR DEMO ---
const MOCK_EQUIPMENT: Equipment[] = [
  { id: '1', name: 'Dumbbells' },
  { id: '2', name: 'Resistance Bands' },
  { id: '3', name: 'Pull-up Bar' }
];

const MOCK_EXERCISE: Exercise = {
  id: 'ex1',
  name: 'Barbell Bench Press',
  description: 'Standard compound chest exercise.',
  targetMuscle: 'Chest',
  requiredEquipment: ['Barbell', 'Bench']
};

const MOCK_SETS: WorkoutSet[] = [
  { id: 's1', reps: 10, weight: 135, completed: false },
  { id: 's2', reps: 8, weight: 145, completed: false },
  { id: 's3', reps: 5, weight: 155, completed: false },
];

// Generate fake logs for the chart
const generateMockLogs = (): WorkoutLog[] => {
  const logs: WorkoutLog[] = [];
  const today = new Date();
  for (let i = 60; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    // Random workout every ~3 days
    if (i % 3 === 0 || i % 7 === 0) {
      logs.push({
        id: `log-${i}`,
        date: d.toISOString(),
        exerciseId: 'ex1',
        sets: [],
        totalVolumeLoad: 5000 + Math.random() * 2000 + (60 - i) * 50, // Slight progressive overload trend
        estimated1RM: 200 + (60 - i),
      });
    }
  }
  return logs;
};
// ---------------------------

enum View {
  DASHBOARD = 'DASHBOARD',
  WORKOUT = 'WORKOUT',
  ANALYTICS = 'ANALYTICS',
  WIKI = 'WIKI'
}

export default function App() {
  const [currentView, setCurrentView] = useState<View>(View.DASHBOARD);
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [analyticsData] = useState(() => FitnessAnalyticsService.generateBannisterData(generateMockLogs()));

  // AI Coach Handler
  const handleAiSubstitute = async () => {
    setIsAiLoading(true);
    const suggestion = await geminiService.generateSubstitute(MOCK_EXERCISE, MOCK_EQUIPMENT);
    setAiSuggestion(suggestion);
    setIsAiLoading(false);
  };

  const renderDashboard = () => (
    <div className="p-6 space-y-6 max-w-2xl mx-auto">
      <header className="flex justify-between items-center mb-8">
        <div>
           <h1 className="text-3xl font-bold text-white tracking-tight">WikiGym</h1>
           <p className="text-gray-400">Community-driven fitness.</p>
        </div>
        <div className="bg-blue-900/30 p-2 rounded-lg border border-blue-500/30">
           <BrainCircuit className="text-blue-400" />
        </div>
      </header>

      {/* Quick Start Card */}
      <div className="bg-gray-800 rounded-2xl p-6 shadow-xl border border-gray-700">
        <h2 className="text-xl font-bold text-white mb-2">Today's Plan</h2>
        <div className="flex items-center justify-between bg-gray-900/50 p-4 rounded-xl border border-gray-700 mb-4">
           <div>
             <h3 className="font-bold text-lg text-gray-200">{MOCK_EXERCISE.name}</h3>
             <p className="text-sm text-gray-500">3 Sets • Chest Hypertrophy</p>
           </div>
           <button 
             onClick={() => setCurrentView(View.WORKOUT)}
             className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold transition"
           >
             Start
           </button>
        </div>

        {/* AI Integration Section */}
        <div className="border-t border-gray-700 pt-4">
           <div className="flex items-center justify-between mb-3">
             <span className="text-sm text-gray-400">Missing equipment?</span>
             <button 
               onClick={handleAiSubstitute}
               disabled={isAiLoading}
               className="text-xs flex items-center gap-1 bg-purple-600/20 text-purple-300 px-3 py-1 rounded-full hover:bg-purple-600/40 transition disabled:opacity-50"
             >
               <BrainCircuit size={14} /> 
               {isAiLoading ? "Asking Coach..." : "Ask AI Coach"}
             </button>
           </div>
           
           {aiSuggestion && (
             <div className="bg-purple-900/20 border border-purple-500/30 p-4 rounded-xl text-sm text-purple-200 animate-fade-in">
               <p className="font-bold mb-1">AI Coach Suggestion:</p>
               {aiSuggestion}
             </div>
           )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <button 
          onClick={() => setCurrentView(View.ANALYTICS)}
          className="p-4 bg-gray-800 rounded-xl border border-gray-700 hover:bg-gray-750 transition flex flex-col items-center gap-2 text-gray-300 hover:text-white"
        >
          <Activity size={24} className="text-green-500" />
          <span className="font-semibold">Analytics</span>
        </button>
        <button 
          onClick={() => setCurrentView(View.WIKI)}
          className="p-4 bg-gray-800 rounded-xl border border-gray-700 hover:bg-gray-750 transition flex flex-col items-center gap-2 text-gray-300 hover:text-white"
        >
          <BookOpen size={24} className="text-yellow-500" />
          <span className="font-semibold">Exercise Wiki</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
      {currentView === View.DASHBOARD && renderDashboard()}
      
      {currentView === View.WORKOUT && (
        <ActiveWorkoutScreen 
          exerciseName={MOCK_EXERCISE.name}
          initialSets={MOCK_SETS}
          onFinish={(sets) => {
            console.log("Workout saved", sets);
            setCurrentView(View.DASHBOARD);
          }}
        />
      )}

      {currentView === View.ANALYTICS && (
        <div className="p-6 h-screen flex flex-col">
          <div className="flex items-center gap-4 mb-6">
            <button onClick={() => setCurrentView(View.DASHBOARD)} className="p-2 hover:bg-gray-800 rounded-full">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
            </button>
            <h2 className="text-2xl font-bold">Progress Analytics</h2>
          </div>
          <div className="flex-1">
             <AnalyticsChart data={analyticsData} />
             <div className="mt-6 text-sm text-gray-400 space-y-2 max-w-2xl">
               <p><strong className="text-blue-400">Fitness (CTL):</strong> 42-day average of training load. Represents chronic training status.</p>
               <p><strong className="text-red-400">Fatigue (ATL):</strong> 7-day average. Represents acute tiredness.</p>
               <p><strong className="text-green-400">Form (TSB):</strong> Fitness minus Fatigue. Positive values indicate readiness to perform.</p>
             </div>
          </div>
        </div>
      )}

      {currentView === View.WIKI && (
        <div className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <button onClick={() => setCurrentView(View.DASHBOARD)} className="p-2 hover:bg-gray-800 rounded-full">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5"/><path d="M12 19l-7-7 7-7"/></svg>
            </button>
            <h2 className="text-2xl font-bold">Exercise Wiki</h2>
          </div>
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h3 className="text-xl font-bold mb-2">{MOCK_EXERCISE.name}</h3>
            <p className="text-gray-400 mb-4">{MOCK_EXERCISE.description}</p>
            <div className="flex gap-2 mb-6">
              <span className="px-3 py-1 bg-gray-700 rounded-full text-xs text-gray-300">Target: {MOCK_EXERCISE.targetMuscle}</span>
              {MOCK_EXERCISE.requiredEquipment.map(eq => (
                <span key={eq} className="px-3 py-1 bg-blue-900/40 text-blue-300 rounded-full text-xs">{eq}</span>
              ))}
            </div>
            <div className="p-4 bg-yellow-900/10 border border-yellow-700/30 rounded-lg">
              <h4 className="font-bold text-yellow-500 mb-1 text-sm">Community Audit Log</h4>
              <p className="text-xs text-gray-500">Last updated by user_123 on {new Date().toLocaleDateString()}</p>
              <code className="block mt-2 text-xs bg-black/30 p-2 rounded text-gray-400 font-mono">
                UPDATE: Description changed from "Chest exercise" to "Standard compound chest exercise."
              </code>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}