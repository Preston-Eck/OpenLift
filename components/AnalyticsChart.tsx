import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { AnalyticsPoint } from '../types';

interface AnalyticsChartProps {
  data: AnalyticsPoint[];
}

export const AnalyticsChart: React.FC<AnalyticsChartProps> = ({ data }) => {
  if (data.length === 0) {
    return <div className="p-8 text-center text-gray-500">No workout data available yet.</div>;
  }

  return (
    <div className="w-full h-[400px] bg-gray-800 rounded-xl p-4 shadow-lg border border-gray-700">
      <h3 className="text-lg font-bold mb-4 text-gray-200">Impulse-Response Model (Fitness vs Fatigue)</h3>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
          <XAxis 
            dataKey="date" 
            stroke="#9CA3AF" 
            tickFormatter={(value) => value.slice(5)} // Show MM-DD
          />
          <YAxis stroke="#9CA3AF" />
          <Tooltip 
            contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', color: '#F3F4F6' }}
            labelStyle={{ color: '#9CA3AF' }}
          />
          <Legend />
          
          {/* Fitness (CTL) - Long Term */}
          <Line 
            type="monotone" 
            dataKey="fitness" 
            name="Fitness (CTL)" 
            stroke="#3B82F6" 
            strokeWidth={3}
            dot={false}
          />
          
          {/* Fatigue (ATL) - Short Term */}
          <Line 
            type="monotone" 
            dataKey="fatigue" 
            name="Fatigue (ATL)" 
            stroke="#EF4444" 
            strokeWidth={2}
            strokeDasharray="5 5" 
            dot={false}
          />
          
          {/* Form (TSB) - Balance */}
          <Line 
            type="monotone" 
            dataKey="form" 
            name="Form (TSB)" 
            stroke="#10B981" 
            strokeWidth={2} 
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};