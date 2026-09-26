import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { TrendingUp, Compass, Trophy, Bookmark, Calendar } from 'lucide-react';
import { useWatchlist } from '../../context/WatchlistContext';

export const BottomTabBar: React.FC = () => {
  const location = useLocation();
  const { watchlist } = useWatchlist();

  const tabs = [
    { label: 'Home', path: '/', icon: TrendingUp },
    { label: 'Discover', path: '/discover', icon: Compass },
    { label: 'Seasonal', path: '/discover?seasonal=true', icon: Calendar },
    { label: 'Top 100', path: '/discover?sort=SCORE_DESC', icon: Trophy },
    { label: 'My List', path: '/watchlist', icon: Bookmark, badge: watchlist.length },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return (
      location.pathname + location.search === path ||
      (path.startsWith('/discover') &&
        location.pathname === '/discover' &&
        !path.includes('?') &&
        !location.search.includes('seasonal') &&
        !location.search.includes('sort=SCORE_DESC'))
    );
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden anilist-tabbar">
      <div className="grid grid-cols-5 h-14 max-w-md mx-auto items-center px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const active = isActive(tab.path);
          return (
            <Link
              key={tab.label}
              to={tab.path}
              className={`flex flex-col items-center justify-center py-1 transition-all relative ${
                active ? 'text-[#3db4f2]' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform ${active ? 'scale-110' : ''}`} />
                {typeof tab.badge === 'number' && tab.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 min-w-[15px] h-3.5 px-1 bg-[#3db4f2] text-white text-[9px] font-bold rounded-full flex items-center justify-center shadow-sm">
                    {tab.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] tracking-tight mt-0.5 font-bold ${active ? 'text-[#3db4f2]' : ''}`}>
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
