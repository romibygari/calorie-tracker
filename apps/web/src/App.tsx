import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAppStore } from './store';
import NavBar from './components/NavBar';
import ProfileSelect from './pages/ProfileSelect';
import Dashboard from './pages/Dashboard';
import SearchFood from './pages/SearchFood';
import AddLog from './pages/AddLog';
import CustomFood from './pages/CustomFood';
import History from './pages/History';
import DayDetail from './pages/DayDetail';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';

function AppRoutes() {
  const userId = useAppStore(s => s.selectedUserId);

  if (!userId) return (
    <Routes>
      <Route path="*" element={<ProfileSelect />} />
    </Routes>
  );

  return (
    <>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/search" element={<SearchFood />} />
        <Route path="/add/:foodId" element={<AddLog />} />
        <Route path="/custom-food" element={<CustomFood />} />
        <Route path="/history" element={<History />} />
        <Route path="/history/:date" element={<DayDetail />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
      <NavBar />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gray-50 max-w-lg mx-auto relative">
        <AppRoutes />
      </div>
    </BrowserRouter>
  );
}
