import { NavLink } from 'react-router-dom';

const tabs = [
  { to: '/dashboard', icon: '🏠', label: 'Home' },
  { to: '/search', icon: '🔍', label: 'Search' },
  { to: '/history', icon: '📅', label: 'History' },
  { to: '/analytics', icon: '📊', label: 'Charts' },
  { to: '/settings', icon: '⚙️', label: 'Settings' },
];

export default function NavBar() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 max-w-lg mx-auto">
      <div className="flex">
        {tabs.map(tab => (
          <NavLink
            key={tab.to}
            to={tab.to}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center py-2 text-xs gap-0.5 transition-colors ${
                isActive ? 'text-green-600 font-semibold' : 'text-gray-500'
              }`
            }
          >
            <span className="text-lg leading-none">{tab.icon}</span>
            <span>{tab.label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
