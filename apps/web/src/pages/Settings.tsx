import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser, useUpdateUser } from '../api/hooks';
import { useAppStore } from '../store';

export default function Settings() {
  const navigate = useNavigate();
  const userId = useAppStore(s => s.selectedUserId)!;
  const setSelectedUserId = useAppStore(s => s.setSelectedUserId);
  const { data: user } = useUser(userId);
  const updateUser = useUpdateUser();

  const [name, setName] = useState('');
  const [calTarget, setCalTarget] = useState('');
  const [proteinTarget, setProteinTarget] = useState('');
  const [carbTarget, setCarbTarget] = useState('');
  const [fatTarget, setFatTarget] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name);
      setCalTarget(String(user.calorieTarget));
      setProteinTarget(String(user.proteinTarget));
      setCarbTarget(String(user.carbTarget));
      setFatTarget(String(user.fatTarget));
    }
  }, [user]);

  const handleSave = async () => {
    await updateUser.mutateAsync({ id: userId, data: {
      name,
      calorieTarget: parseInt(calTarget),
      proteinTarget: parseInt(proteinTarget),
      carbTarget: parseInt(carbTarget),
      fatTarget: parseInt(fatTarget),
    }});
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const switchProfile = () => {
    const otherId = userId === 1 ? 2 : 1;
    setSelectedUserId(otherId);
    navigate('/dashboard');
  };

  const fields = [
    { label: 'Your Name', value: name, set: setName, type: 'text', unit: '' },
    { label: 'Calorie Target', value: calTarget, set: setCalTarget, type: 'number', unit: 'kcal' },
    { label: 'Protein Target', value: proteinTarget, set: setProteinTarget, type: 'number', unit: 'g' },
    { label: 'Carb Target', value: carbTarget, set: setCarbTarget, type: 'number', unit: 'g' },
    { label: 'Fat Target', value: fatTarget, set: setFatTarget, type: 'number', unit: 'g' },
  ];

  return (
    <div className="pb-24 max-w-lg mx-auto">
      <div className="px-4 pt-10 pb-3">
        <h1 className="text-xl font-bold text-gray-800">Settings</h1>
      </div>

      <div className="px-4 space-y-3">
        {fields.map(f => (
          <div key={f.label} className="bg-white rounded-xl shadow-sm p-4">
            <label className="block text-xs font-medium text-gray-500 mb-1">{f.label}</label>
            <div className="flex items-center gap-2">
              <input
                type={f.type}
                value={f.value}
                onChange={e => f.set(e.target.value)}
                className="flex-1 border-0 text-lg font-semibold text-gray-800 focus:outline-none"
              />
              {f.unit && <span className="text-sm text-gray-400">{f.unit}</span>}
            </div>
          </div>
        ))}

        <button
          onClick={handleSave}
          disabled={updateUser.isPending}
          className="w-full bg-green-500 text-white py-4 rounded-2xl font-semibold text-lg hover:bg-green-600 active:scale-95 transition-all disabled:opacity-50"
        >
          {saved ? '✓ Saved!' : updateUser.isPending ? 'Saving...' : 'Save Changes'}
        </button>

        <div className="pt-2">
          <button
            onClick={switchProfile}
            className="w-full border border-gray-200 text-gray-500 py-3 rounded-2xl font-medium hover:bg-gray-50 transition-colors"
          >
            Switch to {userId === 1 ? 'Friend' : 'Your'} Profile
          </button>
        </div>
      </div>
    </div>
  );
}
