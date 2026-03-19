import { useNavigate } from 'react-router-dom';
import { useUsers } from '../api/hooks';
import { useAppStore } from '../store';

export default function ProfileSelect() {
  const { data: users, isLoading } = useUsers();
  const setSelectedUserId = useAppStore(s => s.setSelectedUserId);
  const navigate = useNavigate();

  const select = (id: number) => { setSelectedUserId(id); navigate('/dashboard'); };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-green-50">
      <div className="text-5xl mb-4">🥗</div>
      <h1 className="text-2xl font-bold text-gray-800 mb-1">Calorie Tracker</h1>
      <p className="text-gray-500 mb-10">Who are you?</p>

      {isLoading && <p className="text-gray-400">Connecting...</p>}

      <div className="w-full max-w-sm space-y-4">
        {(users ?? []).map(user => (
          <button
            key={user.id}
            onClick={() => select(user.id)}
            className="w-full bg-white rounded-2xl shadow-sm border border-green-100 p-6 flex items-center gap-4 hover:shadow-md active:scale-95 transition-all"
          >
            <div className="w-14 h-14 rounded-full bg-green-500 flex items-center justify-center text-white text-2xl font-bold shrink-0">
              {user.name[0].toUpperCase()}
            </div>
            <div className="text-left">
              <p className="font-semibold text-gray-800 text-lg">{user.name}</p>
              <p className="text-sm text-gray-500">Target: {user.calorieTarget} kcal/day</p>
            </div>
            <span className="ml-auto text-green-500 text-xl">→</span>
          </button>
        ))}
      </div>

      {!isLoading && (!users || users.length === 0) && (
        <p className="text-red-400 mt-6 text-sm text-center">
          Cannot reach server. Check your internet connection.
        </p>
      )}
    </div>
  );
}
