import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, User } from 'lucide-react';
import { VeytrixLogo } from '../components/VeytrixLogo';
import { useAuth } from '../contexts/AuthContext';

const NAV = [
  { to: '/', label: 'Product' },
  { label: 'Features' },
  { label: 'Templates' },
  { label: 'Learning' },
  { label: 'Company' },
];

export function SiteHeader() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, userProfile, isSignedIn, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const displayName = userProfile?.display_name || user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email || 'Creator';
  const email = user?.email || '';
  const avatarUrl = userProfile?.avatar_url || user?.user_metadata?.avatar_url || user?.user_metadata?.picture || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=0ea5e9&color=fff`;

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSignOut = () => {
    signOut();
    setShowUserMenu(false);
    navigate('/');
  };

  return (
    <header className={`sticky top-0 z-50 w-full transition-all duration-200 ${scrolled ? 'bg-white/95 backdrop-blur shadow-sm border-b border-[#1D2B64]/10 py-2' : 'bg-transparent py-4'}`}>
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6">
        
        {/* LEFT: Logo */}
        <Link to={isSignedIn ? '/home' : '/'} className="flex items-center gap-2 group flex-shrink-0">
          <VeytrixLogo className="h-7 w-7 text-[#1D2B64] transition-transform duration-300 group-hover:rotate-6" />
          <span className="font-display text-lg font-bold tracking-tight text-[#1D2B64]">
            VEYTRIX
          </span>
          <span className="ml-1 rounded-md bg-[#E6F2F8] px-2 py-0.5 text-[10px] font-mono uppercase tracking-widest text-[#1D2B64] font-semibold border border-[#3B6CE7]/20">
            beta
          </span>
        </Link>

        {/* CENTER: Navigation */}
        <nav className="hidden lg:flex items-center gap-1">
          {NAV.map((item, idx) => {
            if (item.to) {
              const active = location.pathname === item.to || (item.to !== '/' && location.pathname.startsWith(item.to));
              return (
                <Link
                  key={idx}
                  to={item.to}
                  className={[
                    "px-4 py-2 text-sm font-medium rounded-full transition-colors",
                    active
                      ? "text-[#1D2B64] bg-[#E6F2F8]"
                      : "text-[#1D2B64]/70 hover:text-[#1D2B64] hover:bg-[#E6F2F8]/50",
                  ].join(" ")}
                >
                  {item.label}
                </Link>
              );
            }
            
            return (
              <span
                key={idx}
                className="px-4 py-2 text-sm font-medium rounded-full text-[#1D2B64]/70 cursor-default"
              >
                {item.label}
              </span>
            );
          })}
        </nav>

        {/* RIGHT: Auth & CTA */}
        <div className="hidden lg:flex items-center gap-4 flex-shrink-0">
          {isSignedIn ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowUserMenu((v) => !v)}
                className="flex items-center gap-2.5 rounded-full bg-white px-2 py-1 border border-[#1D2B64]/10 hover:border-[#3B6CE7]/40 shadow-sm transition-colors"
              >
                <img
                  src={avatarUrl}
                  alt={displayName}
                  className="h-8 w-8 rounded-full border border-[#3B6CE7]/20 object-cover"
                />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-52 rounded-2xl bg-white border border-[#1D2B64]/10 shadow-xl py-2 z-50">
                  <div className="px-4 py-2 mb-2 border-b border-[#1D2B64]/5">
                    <div className="text-sm font-semibold text-[#1D2B64] truncate">{displayName}</div>
                    <div className="text-[10px] text-[#1D2B64]/60 truncate">{email}</div>
                  </div>
                  <Link
                    to="/home"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-[#1D2B64]/80 hover:bg-[#E6F2F8] hover:text-[#1D2B64] transition-colors"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <User className="h-4 w-4" />
                    Home
                  </Link>
                  <Link
                    to="/settings"
                    className="flex items-center gap-2 px-4 py-2 text-sm text-[#1D2B64]/80 hover:bg-[#E6F2F8] hover:text-[#1D2B64] transition-colors"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <User className="h-4 w-4" />
                    Settings
                  </Link>
                  <div className="h-px bg-[#1D2B64]/5 mx-3 my-1" />
                  <button
                    type="button"
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/signin"
              className="text-sm font-medium text-[#1D2B64]/70 hover:text-[#1D2B64] transition-colors"
            >
              Sign in
            </Link>
          )}

          <Link
            to="/home"
            className="inline-flex items-center justify-center rounded-full bg-[#1D2B64] px-5 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-[#3B6CE7] transition-all duration-200"
          >
            Homepage
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="lg:hidden inline-flex items-center justify-center rounded-lg p-2 text-[#1D2B64] hover:bg-[#E6F2F8] transition-colors"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="lg:hidden absolute top-full left-0 right-0 border-b border-[#1D2B64]/10 bg-white/98 backdrop-blur-md shadow-lg">
          <nav className="flex flex-col p-4 gap-2">
            {NAV.map((item, idx) => {
              if (item.to) {
                return (
                  <Link
                    key={idx}
                    to={item.to}
                    className="px-4 py-3 text-base font-medium rounded-xl text-[#1D2B64]/80 hover:text-[#1D2B64] hover:bg-[#E6F2F8] transition-colors"
                    onClick={() => setOpen(false)}
                  >
                    {item.label}
                  </Link>
                );
              }

              return (
                <span
                  key={idx}
                  className="px-4 py-3 text-base font-medium rounded-xl text-[#1D2B64]/60 cursor-default"
                >
                  {item.label}
                </span>
              );
            })}
            
            <div className="h-px bg-[#1D2B64]/10 my-2 mx-4" />
            
            {isSignedIn ? (
              <>
                <div className="flex items-center gap-3 px-4 py-2">
                  <img
                    src={avatarUrl}
                    alt={displayName}
                    className="h-10 w-10 rounded-full border border-[#3B6CE7]/20 object-cover"
                  />
                  <div>
                    <div className="text-sm font-semibold text-[#1D2B64]">{displayName}</div>
                    <div className="text-xs text-[#1D2B64]/60">{email}</div>
                  </div>
                </div>
                <Link
                  to="/home"
                  className="px-4 py-3 text-base font-medium rounded-xl text-[#1D2B64]/80 hover:bg-[#E6F2F8] hover:text-[#1D2B64]"
                  onClick={() => setOpen(false)}
                >
                  Home Dashboard
                </Link>
                <button
                  type="button"
                  onClick={() => { handleSignOut(); setOpen(false); }}
                  className="px-4 py-3 text-base font-medium rounded-xl text-red-600 hover:bg-red-50 text-left"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <Link
                to="/signin"
                className="px-4 py-3 text-base font-medium rounded-xl text-[#1D2B64]/80 hover:bg-[#E6F2F8] hover:text-[#1D2B64]"
                onClick={() => setOpen(false)}
              >
                Sign in
              </Link>
            )}
            
            <Link
              to="/home"
              className="mt-4 flex items-center justify-center rounded-xl bg-[#1D2B64] px-4 py-4 text-base font-medium text-white shadow-sm"
              onClick={() => setOpen(false)}
            >
              Homepage
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
