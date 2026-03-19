import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ReferenceLine, ResponsiveContainer } from 'recharts';
import { useHistoryAnalytics, useUser } from '../api/hooks';
import { useAppStore } from '../store';

const RANGES = [7, 14, 30] as const;

export default function Analytics() {
  const userId = useAppStore(s => s.selectedUserId)!;
  const [days, setDays] = useState<7 | 14 | 30>(7);
  const { data: history = [] } = useHistoryAnalytics(userId, days);
  const { data: user } = useUser(userId);

  const chartData = history.map(e => ({ date: e.date.slice(5), cal: Math.round(e.calories) }));
  const avg = history.length > 0 ? Math.round(history.reduce((s, e) => s + e.calories, 0) / history.length) : 0;
  const totalP = Math.round(history.reduce((s, e) => s + e.protein, 0));
  const totalC = Math.round(history.reduce((s, e) => s + e.carbs, 0));
  const totalF = Math.round(history.reduce((s, e) => s + e.fat, 0));
  const totalMacros = totalP + totalC + totalF;

  return (
    <div className="pb-20 max-w-lg mx-auto">
      <div className="px-4 pt-10 pb-3">
        <h1 className="text-xl font-bold text-gray-800">Analytics</h1>
      </div>

      {/* Range selector */}
      <div className="px-4 flex gap-2 mb-4">
        {RANGES.map(r => (
          <button
            key={r}
            onClick={() => setDays(r)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              days === r ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600'
            }`}
          >{r} days</button>
        ))}
      </div>

      {/* Avg callout */}
      <div className="mx-4 bg-white rounded-2xl shadow-sm p-4 flex justify-around mb-4">
        <div className="text-center">
          <p className="text-3xl font-bold text-green-600">{avg}</p>
          <p className="text-xs text-gray-400">avg kcal/day</p>
        </div>
        {user && (
          <div className="text-center">
            <p className={`text-3xl font-bold ${avg > user.calorieTarget ? 'text-red-400' : 'text-green-600'}`}>
              {user.calorieTarget}
            </p>
            <p className="text-xs text-gray-400">target kcal</p>
          </div>
        )}
      </div>

      {/* Bar chart */}
      <div className="mx-4 bg-white rounded-2xl shadow-sm p-4 mb-4">
        <p className="text-sm font-medium text-gray-500 mb-3">Daily Calories</p>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={chartData} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
              <XAxis dataKey="date" tick={{ fontSize: 10 }} interval={days === 7 ? 0 : days === 14 ? 1 : 4} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip formatter={(v: number) => [`${v} kcal`, 'Calories']} />
              {user && <ReferenceLine y={user.calorieTarget} stroke="#f87171" strokeDasharray="4 4" />}
              <Bar dataKey="cal" fill="#4ade80" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <p className="text-center text-gray-400 py-10 text-sm">No data yet</p>
        )}
      </div>

      {/* Macro breakdown */}
      {totalMacros > 0 && (
        <div className="mx-4 bg-white rounded-2xl shadow-sm p-4">
          <p className="text-sm font-medium text-gray-500 mb-3">Macro Breakdown (total)</p>
          <div className="flex h-5 rounded-full overflow-hidden mb-3">
            <div className="bg-blue-400 transition-all" style={{ width: `${(totalP / totalMacros) * 100}%` }} />
            <div className="bg-orange-400 transition-all" style={{ width: `${(totalC / totalMacros) * 100}%` }} />
            <div className="bg-pink-400 transition-all" style={{ width: `${(totalF / totalMacros) * 100}%` }} />
          </div>
          <div className="space-y-1.5">
            {[
              { label: 'Protein', value: totalP, color: 'bg-blue-400' },
              { label: 'Carbs', value: totalC, color: 'bg-orange-400' },
              { label: 'Fat', value: totalF, color: 'bg-pink-400' },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex items-center gap-2 text-sm">
                <div className={`w-3 h-3 rounded-full ${color}`} />
                <span className="text-gray-600">{label}</span>
                <span className="ml-auto font-medium text-gray-700">{value}g ({Math.round((value / totalMacros) * 100)}%)</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
