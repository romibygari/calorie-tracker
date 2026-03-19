import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFoods } from '../api/hooks';
import type { FoodItem } from '../types';

export default function SearchFood() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [debounced, setDebounced] = useState('');
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setDebounced(query), 300);
    return () => { if (timer.current) clearTimeout(timer.current); };
  }, [query]);

  const { data: foods = [], isLoading } = useFoods(debounced);

  return (
    <div className="pb-20 max-w-lg mx-auto">
      <div className="sticky top-0 bg-white border-b border-gray-100 px-4 pt-10 pb-3 z-10">
        <h1 className="text-xl font-bold text-gray-800 mb-3">Search Foods</h1>
        <input
          autoFocus
          type="search"
          placeholder="Search food..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-400"
        />
        <button
          onClick={() => navigate('/custom-food')}
          className="mt-2 w-full text-sm text-green-600 border border-green-200 rounded-xl py-2 hover:bg-green-50 transition-colors"
        >
          + Add Custom Food
        </button>
      </div>

      <div className="px-4 mt-3 space-y-2">
        {debounced.length === 0 && (
          <p className="text-center text-gray-400 mt-16 text-sm">Type to search your food list</p>
        )}
        {isLoading && <p className="text-center text-gray-400 mt-8 text-sm">Searching...</p>}
        {foods.map((food: FoodItem) => (
          <div
            key={food.id}
            onClick={() => navigate(`/add/${food.id}`)}
            className="bg-white rounded-xl shadow-sm border border-gray-50 px-4 py-3 cursor-pointer hover:shadow-md active:scale-98 transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-800 truncate">{food.name}</p>
                {food.brand && <p className="text-xs text-gray-400">{food.brand}</p>}
                <p className="text-xs text-gray-500 mt-0.5">
                  {food.calories} kcal · P:{food.protein}g · C:{food.carbs}g · F:{food.fat}g
                </p>
                <p className="text-xs text-gray-400">per {food.servingSize}{food.servingUnit}</p>
              </div>
              <span className="ml-3 text-green-500 text-xl">+</span>
            </div>
          </div>
        ))}
        {debounced.length > 0 && !isLoading && foods.length === 0 && (
          <p className="text-center text-gray-400 mt-8 text-sm">No results for "{debounced}"</p>
        )}
      </div>
    </div>
  );
}
