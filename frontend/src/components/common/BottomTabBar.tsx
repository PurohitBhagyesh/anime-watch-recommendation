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
      label: isAuthenticated ? (user?.username || 'Account') : 'Login',
      path: isAuthenticated ? '/account' : '/login',
      icon: isAuthenticated ? User : LogIn,
      isAvatar: isAuthenticated && !!user?.avatar,
      avatarUrl: user?.avatar,
    },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    if (path === '/account') {
      return location.pathname.startsWith('/account') || location.pathname.startsWith('/settings');
    }
    if (path === '/login') {
      return (
        location.pathname.startsWith('/login') ||
        location.pathname.startsWith('/signup') ||
        location.pathname.startsWith('/auth')
      );
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 md:hidden pointer-events-none px-[max(0.75rem,env(safe-area-inset-left,0px))] pr-[max(0.75rem,env(safe-area-inset-right,0px))] pb-[max(env(safe-area-inset-bottom,0px),10px)]">
      <nav
        aria-label="Mobile bottom navigation"
        className="pointer-events-auto anilist-tabbar rounded-[26px] max-w-md mx-auto p-1.5"
      >
        <div className="grid grid-cols-4 items-center gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = isActive(tab.path);
            return (
              <Link
                key={tab.path}
                to={tab.path}
                aria-current={active ? 'page' : undefined}
                className={`flex flex-col items-center justify-center min-h-[48px] py-1.5 px-1 rounded-[20px] transition-all duration-300 relative active:scale-95 ${
                  active
                    ? 'bg-white/[0.13] text-[#7dd3fc] border border-white/[0.16] shadow-[inset_0_1px_0_rgba(255,255,255,0.22)]'
                    : 'text-slate-400 hover:text-slate-100 border border-transparent'
                }`}
              >
                <div className="relative">
                  {tab.isAvatar && tab.avatarUrl ? (
                    <img
                      src={tab.avatarUrl}
                      alt=""
                      loading="lazy"
                      className={`w-5 h-5 rounded-full object-cover ring-1 ${
                        active ? 'ring-[#7dd3fc]' : 'ring-white/25'
                      }`}
                    />
                  ) : (
                    <Icon
                      aria-hidden="true"
                      className={`w-[19px] h-[19px] transition-transform duration-300 ${
                        active ? 'scale-105 text-[#3db4f2]' : ''
                      }`}
                    />
                  )}
                  {typeof tab.badge === 'number' && tab.badge > 0 && (
                    <span className="absolute -top-1.5 -right-2.5 min-w-[16px] h-4 px-1 bg-[#3db4f2] text-[#06101c] text-[9px] font-extrabold rounded-full flex items-center justify-center shadow-sm">
                      {tab.badge > 99 ? '99+' : tab.badge}
                    </span>
                  )}
                </div>
                <span
                  className={`text-[10px] tracking-tight mt-0.5 font-semibold truncate max-w-[70px] ${
                    active ? 'text-white font-bold' : ''
                  }`}
                >
                  {tab.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
};
