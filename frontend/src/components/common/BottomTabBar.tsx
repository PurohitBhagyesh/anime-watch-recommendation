import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { TrendingUp, Compass, Bookmark, User, LogIn } from 'lucide-react';
import { useWatchlist } from '../../context/WatchlistContext';
import { useAuth } from '../../context/AuthContext';

export const BottomTabBar: React.FC = () => {
  const location = useLocation();
  const { watchlist } = useWatchlist();
  const { isAuthenticated, user } = useAuth();

  const tabs = [
    { label: 'Home', path: '/', icon: TrendingUp },
    { label: 'Discover', path: '/discover', icon: Compass },
    { label: 'Watchlist', path: '/watchlist', icon: Bookmark, badge: watchlist.length },
    {
      label: isAuthenticated ? (user?.username || 'Profile') : 'Login',
      path: isAuthenticated ? '/watchlist' : '/login',
      icon: isAuthenticated ? User : LogIn,
      isAvatar: isAuthenticated && !!user?.avatar,
      avatarUrl: user?.avatar,
    },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden royal-tabbar border-t border-white/[0.08]">
      <div className="grid grid-cols-4 h-14 max-w-md mx-auto items-center px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = isActive(tab.path);
          return (
            <Link
              key={tab.label}
              to={tab.path}
              className={`flex flex-col items-center justify-center py-1 transition-all relative ${
                active ? 'text-[#818cf8]' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                {tab.isAvatar && tab.avatarUrl ? (
                  <img
                    src={tab.avatarUrl}
                    alt={tab.label}
                    className={`w-5 h-5 rounded-full object-cover ring-1 ${
                      active ? 'ring-[#6366f1]' : 'ring-white/20'
                    }`}
                  />
                ) : (
                  <Icon className={`w-5 h-5 transition-transform ${active ? 'scale-110' : ''}`} />
                )}
                {typeof tab.badge === 'number' && tab.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 min-w-[16px] h-4 px-1 bg-[#6366f1] text-white text-[9px] font-extrabold rounded-full flex items-center justify-center shadow-sm">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span
                className={`text-[10px] tracking-tight mt-0.5 font-bold truncate max-w-[64px] ${
                  active ? 'text-[#818cf8]' : ''
                }`}
              >
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
