import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store';
import { useDailyAnalytics, useDayLogs, useDeleteLog } from '../api/hooks';
import { today, formatDateLong } from '../utils/date';
import MacroBar from '../components/MacroBar';
import type { FoodLog, MealType } from '../types';

const MEALS: { key: MealType; label: string; icon: string }[] = [
  { key: 'breakfast', label: 'Breakfast', icon: '🌅' },
  { key: 'lunch', label: 'Lunch', icon: '☀️' },
  { key: 'dinner', label: 'Dinner', icon: '🌙' },
  { key: 'snack', label: 'Snack', icon: '🍎' },
];

export default function Dashboard() {
  const navigate = useNavigate();
  const userId = useAppStore(s => s.selectedUserId)!;
  const date = today();
  const { data: summary } = useDailyAnalytics(userId, date);
  const { data: logs = [] } = useDayLogs(userId, date);
  const deleteLog = useDeleteLog();

  const calPct = Math.min(((summary?.calories ?? 0) / (summary?.targets.calories ?? 2000)) * 100, 100);
  const remaining = Math.max(0, (summary?.targets.calories ?? 2000) - Math.round(summary?.calories ?? 0));

  return (
    <div className="pb-20 max-w-lg mx-auto">
      {/* Header */}
      <div className="bg-green-600 text-white px-4 pt-10 pb-6">
        <p className="text-green-200 text-sm">{formatDateLong(date)}</p>
        <div className="flex items-end justify-between mt-2">
          <div>
            <p className="text-5xl font-bold">{Math.round(summary?.calories ?? 0)}</p>
            <p className="text-green-200 text-sm">kcal consumed</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-semibold">{remaining}</p>
            <p className="text-green-200 text-sm">remaining</p>
          </div>
        </div>
        {/* Progress bar */}
        <div className="mt-4 h-3 bg-green-800 rounded-full overflow-hidden">
          <div className="h-full bg-white rounded-full transition-all" style={{ width: `${calPct}%` }} />
        </div>
        <p className="text-green-200 text-xs mt-1">Target: {summary?.targets.calories ?? 2000} kcal</p>
      </div>

      {/* Macro bars */}
      <div className="mx-4 -mt-4 bg-white rounded-2xl shadow-sm p-4 flex gap-4">
        <MacroBar label="Protein" value={summary?.protein ?? 0} target={summary?.targets.protein ?? 150} color="#3b82f6" />
        <MacroBar label="Carbs" value={summary?.carbs ?? 0} target={summary?.targets.carbs ?? 250} color="#f97316" />
        <MacroBar label="Fat" value={summary?.fat ?? 0} target={summary?.targets.fat ?? 65} color="#ec4899" />
      </div>

      {/* Meal sections */}
      <div className="mt-4 mx-4 space-y-3">
        {MEALS.map(({ key, label, icon }) => {
          const mealLogs = logs.filter((l: FoodLog) => l.meal === key);
          const mealCal = mealLogs.reduce((s, l) => s + l.caloriesConsumed, 0);
          return (
            <div key={key} className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-50">
                <div className="flex items-center gap-2">
                  <span>{icon}</span>
                  <span className="font-semibold text-gray-700">{label}</span>
                  {mealCal > 0 && <span className="text-xs text-gray-400">{Math.round(mealCal)} kcal</span>}
                </div>
                <button
                  onClick={() => navigate('/search')}
                  className="w-7 h-7 bg-green-50 text-green-600 rounded-full flex items-center justify-center text-lg hover:bg-green-100 active:scale-90 transition-all"
                >+</button>
              </div>
              {mealLogs.map((log: FoodLog) => (
                <div key={log.id} className="flex items-center justify-between px-4 py-2.5 border-b border-gray-50 last:border-0">
                  <div>
                    <p className="text-sm text-gray-800">{log.foodItem.name}</p>
                    <p className="text-xs text-gray-400">{log.quantity}{log.foodItem.servingUnit} · {Math.round(log.caloriesConsumed)} kcal</p>
                  </div>
                  <button
                    onClick={() => deleteLog.mutate(log.id)}
                    className="text-gray-300 hover:text-red-400 text-lg leading-none ml-3 transition-colors"
                  >×</button>
                </div>
              ))}
            </div>
          );
        })}
      </div>
    </div>
  );
}
