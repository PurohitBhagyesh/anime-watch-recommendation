import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { TrendingUp, Compass, Bookmark } from 'lucide-react';
import { useWatchlist } from '../../context/WatchlistContext';

export const BottomTabBar: React.FC = () => {
  const location = useLocation();
  const { watchlist } = useWatchlist();

  const tabs = [
    { label: 'Home', path: '/', icon: TrendingUp },
    { label: 'Discover', path: '/discover', icon: Compass },
    { label: 'Watchlist', path: '/watchlist', icon: Bookmark, badge: watchlist.length },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden anilist-tabbar">
      <div className="grid grid-cols-3 h-14 max-w-sm mx-auto items-center px-4">
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
                  <span className="absolute -top-1.5 -right-2.5 min-w-[16px] h-4 px-1 bg-[#3db4f2] text-white text-[9px] font-extrabold rounded-full flex items-center justify-center shadow-sm">
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
