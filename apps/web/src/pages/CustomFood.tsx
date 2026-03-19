import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateFood } from '../api/hooks';
import { useAppStore } from '../store';

const FIELDS = [
  { key: 'name', label: 'Food Name', required: true, type: 'text' },
  { key: 'brand', label: 'Brand (optional)', type: 'text' },
  { key: 'calories', label: 'Calories (kcal)', required: true, type: 'number' },
  { key: 'protein', label: 'Protein (g)', required: true, type: 'number' },
  { key: 'carbs', label: 'Carbohydrates (g)', required: true, type: 'number' },
  { key: 'fat', label: 'Fat (g)', required: true, type: 'number' },
  { key: 'fiber', label: 'Fiber (g)', type: 'number' },
  { key: 'servingSize', label: 'Serving Size', type: 'number' },
  { key: 'servingUnit', label: 'Unit (g / ml / piece)', type: 'text' },
];

export default function CustomFood() {
  const navigate = useNavigate();
  const userId = useAppStore(s => s.selectedUserId)!;
  const createFood = useCreateFood();
  const [form, setForm] = useState<Record<string, string>>({ servingSize: '100', servingUnit: 'g', fiber: '0' });
  const [error, setError] = useState('');

  const set = (key: string, val: string) => setForm(f => ({ ...f, [key]: val }));

  const handleSave = async () => {
    for (const f of FIELDS.filter(f => f.required)) {
      if (!form[f.key]?.trim()) { setError(`${f.label} is required`); return; }
    }
    setError('');
    await createFood.mutateAsync({
      name: form.name, brand: form.brand || undefined,
      calories: parseFloat(form.calories), protein: parseFloat(form.protein),
      carbs: parseFloat(form.carbs), fat: parseFloat(form.fat),
      fiber: parseFloat(form.fiber ?? '0'), servingSize: parseFloat(form.servingSize ?? '100'),
      servingUnit: form.servingUnit ?? 'g', createdBy: userId,
    });
    navigate('/search');
  };

  return (
    <div className="pb-24 max-w-lg mx-auto">
      <div className="bg-white border-b border-gray-100 px-4 pt-10 pb-4 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-green-600 text-lg">←</button>
        <h1 className="text-xl font-bold text-gray-800">Add Custom Food</h1>
      </div>

      <div className="px-4 mt-4 space-y-3">
        <p className="text-sm text-gray-500">All values per serving size (default: per 100g)</p>
        {FIELDS.map(f => (
          <div key={f.key}>
            <label className="block text-sm font-medium text-gray-600 mb-1">
              {f.label}{f.required && ' *'}
            </label>
            <input
              type={f.type}
              value={form[f.key] ?? ''}
              onChange={e => set(f.key, e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>
        ))}
        {error && <p className="text-red-500 text-sm">{error}</p>}
      </div>

      <div className="fixed bottom-20 left-0 right-0 px-4 max-w-lg mx-auto">
        <button
          onClick={handleSave}
          disabled={createFood.isPending}
          className="w-full bg-green-500 text-white py-4 rounded-2xl font-semibold text-lg shadow-lg hover:bg-green-600 active:scale-95 transition-all disabled:opacity-50"
        >
          {createFood.isPending ? 'Saving...' : 'Save Food'}
        </button>
      </div>
    </div>
  );
}
