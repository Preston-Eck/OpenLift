import React, { useEffect, useState } from 'react';
import { ActiveWorkoutScreen } from './components/ActiveWorkoutScreen';
import { FitnessAnalyticsService } from './services/analyticsService';
import { geminiService } from './services/geminiService';
import { WorkoutLog } from './types';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function App() {
  const [view, setView] = useState<'DASHBOARD' | 'WORKOUT' | 'WIKI'>('DASHBOARD');
  const [logs, setLogs] = useState<WorkoutLog[]>([]);
  const [analyticsData, setAnalyticsData] = useState<any[]>([]);

  // 1. Load Data (Simulated Database Fetch)
  useEffect(() => {
    const savedLogs = localStorage.getItem('openlift_logs');
    if (savedLogs) {
      const parsed = JSON.parse(savedLogs);
      setLogs(parsed);
      // 2. The "Brain" - Calculate Bannister Model on load
      const points = FitnessAnalyticsService.generateBannisterData(parsed);
      setAnalyticsData(points);
    }
  }, [view]);

  // 3. Save Routine
  const handleFinishWorkout = (newSets: any) => {
    const newLog: WorkoutLog = {
      id: Date.now().toString(),
      date: new Date().toISOString(),
      exerciseId: 'bench-press', // dynamic in real app
      sets: newSets,
      totalVolumeLoad: newSets.reduce((acc: number, s: any) => acc + (s.weight * s.reps), 0),
      estimated1RM: Math.max(...newSets.map((s: any) => s.weight * (1 + s.reps/30))) // Epley Formula
    };
    
    const updatedLogs = [...logs, newLog];
    localStorage.setItem('openlift_logs', JSON.stringify(updatedLogs));
    setView('DASHBOARD');
  };

  return (
    <div className="min-h-screen bg-gray-950 text-white font-sans">
      
      {/* --- DASHBOARD VIEW --- */}
      {view === 'DASHBOARD' && (
        <div className="p-6 max-w-4xl mx-auto space-y-8">
          <header className="flex justify-between items-center">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
              OpenLift
            </h1>
            <button 
              onClick={() => setView('WORKOUT')}
              className="bg-blue-600 hover:bg-blue-500 px-6 py-2 rounded-full font-bold shadow-lg transition-all"
            >
              + Start Workout
            </button>
          </header>

          {/* Analytics Chart (The "Elevate" Logic) */}
          <div className="bg-gray-900 p-6 rounded-2xl border border-gray-800 shadow-xl">
            <h2 className="text-xl font-semibold mb-4 text-gray-300">Fitness vs. Fatigue (Bannister Model)</h2>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={analyticsData}>
                  <XAxis dataKey="date" hide />
                  <YAxis stroke="#4b5563" />
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: 'none' }} />
                  <Line type="monotone" dataKey="fitness" stroke="#3b82f6" strokeWidth={3} dot={false} name="Fitness (CTL)" />
                  <Line type="monotone" dataKey="fatigue" stroke="#ef4444" strokeWidth={2} dot={false} name="Fatigue (ATL)" />
                  <Line type="monotone" dataKey="form" stroke="#10b981" strokeWidth={2} dot={false} strokeDasharray="5 5" name="Form (TSB)" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* --- WORKOUT PLAYER VIEW --- */}
      {view === 'WORKOUT' && (
        <ActiveWorkoutScreen 
          exerciseName="Bench Press (Wiki)"
          initialSets={[
            { id: '1', reps: 10, weight: 135, completed: false },
            { id: '2', reps: 8, weight: 155, completed: false },
            { id: '3', reps: 5, weight: 185, completed: false },
          ]}
          onFinish={handleFinishWorkout}
        />
      )}
    </div>
  );
}