import { WorkoutLog, AnalyticsPoint } from '../types';

/**
 * Bannister Impulse-Response Model Service
 * Adapted for weightlifting analytics.
 */
export class FitnessAnalyticsService {
  private static readonly DECAY_FITNESS = 42; // CTL Time Constant
  private static readonly DECAY_FATIGUE = 7;  // ATL Time Constant

  /**
   * Calculates the Exponential Moving Average (EMA)
   */
  private static calculateEMA(
    todayValue: number, 
    prevEMA: number, 
    timeConstant: number
  ): number {
    const k = 2 / (timeConstant + 1);
    return (todayValue * k) + (prevEMA * (1 - k));
  }

  /**
   * Processes raw workout logs into Bannister model data points.
   * 
   * Formulas:
   * Stress (Daily) = Total Volume Load / Estimated 1RM (Normalized load)
   * Fitness (CTL) = EMA(Stress, 42)
   * Fatigue (ATL) = EMA(Stress, 7)
   * Form (TSB) = Fitness - Fatigue
   */
  public static generateBannisterData(logs: WorkoutLog[]): AnalyticsPoint[] {
    // 1. Sort logs by date ascending
    const sortedLogs = [...logs].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // 2. Aggregate volume by day (handling multiple workouts per day)
    const dailyVolume = new Map<string, { volume: number; max1rm: number }>();

    for (const log of sortedLogs) {
      const dateKey = new Date(log.date).toISOString().split('T')[0];
      const existing = dailyVolume.get(dateKey) || { volume: 0, max1rm: 0 };
      
      dailyVolume.set(dateKey, {
        volume: existing.volume + log.totalVolumeLoad,
        // We use the max 1RM of the day to normalize stress relative to capacity
        max1rm: Math.max(existing.max1rm, log.estimated1RM || 1), 
      });
    }

    const dataPoints: AnalyticsPoint[] = [];
    let prevFitness = 0;
    let prevFatigue = 0;

    // Fill in gaps? For simplicity, we stick to logged days, 
    // but a real system should fill missing days with 0 stress.
    // Let's iterate through a date range for a smooth chart.
    
    if (sortedLogs.length === 0) return [];

    const startDate = new Date(sortedLogs[0].date);
    const endDate = new Date();
    
    for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
      const dateKey = d.toISOString().split('T')[0];
      const dayData = dailyVolume.get(dateKey);

      // Calculate Daily Stress (Trimp equivalent)
      // If no workout, stress is 0.
      // If workout, Stress = Volume / Capacity (1RM) * Scaling Factor (e.g. 0.01 for readability)
      let dailyStress = 0;
      if (dayData && dayData.max1rm > 0) {
        dailyStress = (dayData.volume / dayData.max1rm) * 10; 
      }

      const fitness = this.calculateEMA(dailyStress, prevFitness, this.DECAY_FITNESS);
      const fatigue = this.calculateEMA(dailyStress, prevFatigue, this.DECAY_FATIGUE);
      const form = fitness - fatigue;

      dataPoints.push({
        date: dateKey,
        stress: dailyStress,
        fitness,
        fatigue,
        form
      });

      prevFitness = fitness;
      prevFatigue = fatigue;
    }

    return dataPoints;
  }
}