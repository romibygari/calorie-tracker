import { useNavigate } from 'react-router-dom';
import { useHistoryAnalytics, useUser } from '../api/hooks';
import { useAppStore } from '../store';
import { formatDate } from '../utils/date';
import type { HistoryEntry } from '../types';

export default function History() {
  const navigate = useNavigate();
  const userId = useAppStore(s => s.selectedUserId)!;
  const { data: history = [], isLoading } = useHistoryAnalytics(userId, 30);
  const { data: user } = useUser(userId);
  const sorted = [...history].reverse().filter(e => e.calories > 0);

  return (
    <div className="pb-20 max-w-lg mx-auto">
      <div className="px-4 pt-10 pb-3">
        <h1 className="text-xl font-bold text-gray-800">History</h1>
        <p className="text-sm text-gray-400">Past 30 days</p>
      </div>

      {isLoading && <p className="text-center text-gray-400 mt-16 text-sm">Loading...</p>}
      {!isLoading && sorted.length === 0 && (
        <p className="text-center text-gray-400 mt-16 text-sm">No logs yet. Start tracking today!</p>
      )}

      <div className="px-4 space-y-3">
        {sorted.map((entry: HistoryEntry) => {
          const pct = Math.min((entry.calories / (user?.calorieTarget ?? 2000)) * 100, 100);
          return (
            <div
              key={entry.date}
              onClick={() => navigate(`/history/${entry.date}`)}
              className="bg-white rounded-2xl shadow-sm p-4 cursor-pointer hover:shadow-md active:scale-98 transition-all"
            >
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-gray-700">{formatDate(entry.date)}</span>
                <span className="font-bold text-green-600">{Math.round(entry.calories)} kcal</span>
              </div>
              <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-2">
                <div className="h-full bg-green-400 rounded-full" style={{ width: `${pct}%` }} />
              </div>
              <div className="flex gap-4 text-xs">
                <span className="text-blue-500">P: {Math.round(entry.protein)}g</span>
                <span className="text-orange-500">C: {Math.round(entry.carbs)}g</span>
                <span className="text-pink-500">F: {Math.round(entry.fat)}g</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
