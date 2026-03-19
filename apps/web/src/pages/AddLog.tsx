import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useFood, useCreateLog } from '../api/hooks';
import { useAppStore } from '../store';
import { today } from '../utils/date';
import type { MealType } from '../types';

const MEALS: { key: MealType; label: string }[] = [
  { key: 'breakfast', label: 'Breakfast' },
  { key: 'lunch', label: 'Lunch' },
  { key: 'dinner', label: 'Dinner' },
  { key: 'snack', label: 'Snack' },
];

export default function AddLog() {
  const { foodId } = useParams<{ foodId: string }>();
  const navigate = useNavigate();
  const userId = useAppStore(s => s.selectedUserId)!;
  const { data: food } = useFood(Number(foodId));
  const createLog = useCreateLog();

  const [meal, setMeal] = useState<MealType>('lunch');
  const [quantity, setQuantity] = useState('100');

  const qty = parseFloat(quantity) || 0;
  const ratio = food ? qty / food.servingSize : 0;
  const preview = food ? {
    calories: +(food.calories * ratio).toFixed(1),
    protein: +(food.protein * ratio).toFixed(1),
    carbs: +(food.carbs * ratio).toFixed(1),
    fat: +(food.fat * ratio).toFixed(1),
  } : null;

  const handleSave = async () => {
    if (!food || qty <= 0) return;
    await createLog.mutateAsync({ userId, foodItemId: food.id, logDate: today(), meal, quantity: qty });
    navigate('/dashboard');
  };

  if (!food) return <div className="p-8 text-center text-gray-400">Loading...</div>;

  return (
    <div className="pb-24 max-w-lg mx-auto">
      <div className="bg-white border-b border-gray-100 px-4 pt-10 pb-4 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-green-600 text-lg">←</button>
        <h1 className="text-xl font-bold text-gray-800">Log Food</h1>
      </div>

      <div className="px-4 mt-4 space-y-4">
        {/* Food info */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <p className="font-semibold text-gray-800 text-lg">{food.name}</p>
          {food.brand && <p className="text-sm text-gray-400">{food.brand}</p>}
          <p className="text-sm text-gray-500 mt-1">Per {food.servingSize}{food.servingUnit}: {food.calories} kcal</p>
        </div>

        {/* Meal selector */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <p className="text-sm font-medium text-gray-600 mb-2">Meal</p>
          <div className="grid grid-cols-4 gap-2">
            {MEALS.map(m => (
              <button
                key={m.key}
                onClick={() => setMeal(m.key)}
                className={`py-2 rounded-xl text-sm font-medium transition-colors ${
                  meal === m.key ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600'
                }`}
              >{m.label}</button>
            ))}
          </div>
        </div>

        {/* Quantity */}
        <div className="bg-white rounded-2xl shadow-sm p-4">
          <p className="text-sm font-medium text-gray-600 mb-2">Quantity ({food.servingUnit})</p>
          <input
            type="number"
            value={quantity}
            onChange={e => setQuantity(e.target.value)}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-lg focus:outline-none focus:ring-2 focus:ring-green-400"
            min="1"
          />
        </div>

        {/* Preview */}
        {preview && (
          <div className="bg-green-50 rounded-2xl p-4">
            <p className="text-xs text-gray-500 mb-3 font-medium uppercase tracking-wide">Nutritional Preview</p>
            <div className="grid grid-cols-4 gap-3 text-center">
              {[
                { label: 'Calories', value: preview.calories, unit: 'kcal', color: 'text-green-600' },
                { label: 'Protein', value: preview.protein, unit: 'g', color: 'text-blue-500' },
                { label: 'Carbs', value: preview.carbs, unit: 'g', color: 'text-orange-500' },
                { label: 'Fat', value: preview.fat, unit: 'g', color: 'text-pink-500' },
              ].map(({ label, value, unit, color }) => (
                <div key={label}>
                  <p className={`text-xl font-bold ${color}`}>{value}</p>
                  <p className="text-xs text-gray-400">{unit}</p>
                  <p className="text-xs text-gray-500">{label}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Save button */}
      <div className="fixed bottom-20 left-0 right-0 px-4 max-w-lg mx-auto">
        <button
          onClick={handleSave}
          disabled={createLog.isPending || qty <= 0}
          className="w-full bg-green-500 text-white py-4 rounded-2xl font-semibold text-lg shadow-lg hover:bg-green-600 active:scale-95 transition-all disabled:opacity-50"
        >
          {createLog.isPending ? 'Saving...' : 'Add to Log'}
        </button>
      </div>
    </div>
  );
}
