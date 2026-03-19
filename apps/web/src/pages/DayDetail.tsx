import { useParams, useNavigate } from 'react-router-dom';
import { useDayLogs, useDailyAnalytics } from '../api/hooks';
import { useAppStore } from '../store';
import { formatDateLong } from '../utils/date';
import type { FoodLog, MealType } from '../types';

const MEAL_ORDER: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack'];
const MEAL_LABELS: Record<MealType, string> = { breakfast: 'Breakfast', lunch: 'Lunch', dinner: 'Dinner', snack: 'Snack' };

export default function DayDetail() {
  const { date } = useParams<{ date: string }>();
  const navigate = useNavigate();
  const userId = useAppStore(s => s.selectedUserId)!;
  const { data: logs = [] } = useDayLogs(userId, date!);
  const { data: summary } = useDailyAnalytics(userId, date!);

  return (
    <div className="pb-20 max-w-lg mx-auto">
      <div className="bg-white border-b border-gray-100 px-4 pt-10 pb-4 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-green-600 text-lg">←</button>
        <h1 className="text-lg font-bold text-gray-800">{formatDateLong(date!)}</h1>
      </div>

      {/* Totals */}
      <div className="mx-4 mt-4 bg-green-50 rounded-2xl p-4 grid grid-cols-4 gap-3 text-center">
        {[
          { label: 'Calories', value: Math.round(summary?.calories ?? 0), unit: 'kcal', color: 'text-green-600' },
          { label: 'Protein', value: Math.round(summary?.protein ?? 0), unit: 'g', color: 'text-blue-500' },
          { label: 'Carbs', value: Math.round(summary?.carbs ?? 0), unit: 'g', color: 'text-orange-500' },
          { label: 'Fat', value: Math.round(summary?.fat ?? 0), unit: 'g', color: 'text-pink-500' },
        ].map(({ label, value, unit, color }) => (
          <div key={label}>
            <p className={`text-xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-gray-400">{unit}</p>
            <p className="text-xs text-gray-500">{label}</p>
          </div>
        ))}
      </div>

      {/* Logs by meal */}
      <div className="px-4 mt-4 space-y-3">
        {MEAL_ORDER.map(meal => {
          const mealLogs = logs.filter((l: FoodLog) => l.meal === meal);
          if (mealLogs.length === 0) return null;
          return (
            <div key={meal} className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <p className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-50">
                {MEAL_LABELS[meal]}
              </p>
              {mealLogs.map((log: FoodLog) => (
                <div key={log.id} className="flex items-center justify-between px-4 py-3 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-gray-800">{log.foodItem.name}</p>
                    <p className="text-xs text-gray-400">{log.quantity}{log.foodItem.servingUnit}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-green-600">{Math.round(log.caloriesConsumed)} kcal</p>
                    <p className="text-xs text-gray-400">
                      P:{Math.round(log.proteinConsumed)} C:{Math.round(log.carbsConsumed)} F:{Math.round(log.fatConsumed)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          );
        })}
        {logs.length === 0 && <p className="text-center text-gray-400 text-sm mt-8">No food logged this day.</p>}
      </div>
    </div>
  );
}
