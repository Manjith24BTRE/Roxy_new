import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, LogOut, User } from 'lucide-react';
import { VeytrixLogo } from '../components/VeytrixLogo';
import { useAuth } from '../contexts/AuthContext';

const NAV = [
  { to: '/templates', label: 'Templates' },
  { to: '/learning',  label: 'Learning' },
  { to: '/support',   label: 'Support' },
  { to: '/company',   label: 'Company' },
] as const;

export function SiteHeader() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isSignedIn, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const handleSignOut = () => {
    signOut();
    setShowUserMenu(false);
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 w-full">
      <div className="glass border-b border-border">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-3">
          <Link to={isSignedIn ? '/home' : '/'} className="flex items-center gap-2 group">
            <VeytrixLogo className="h-7 w-7 transition group-hover:rotate-6" />
            <span className="font-display text-lg font-semibold tracking-tight">
              VEYTRIX
            </span>
            <span className="ml-1 rounded-full bg-surface-2 px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
              beta
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-1">
            {NAV.map((item) => {
              const active = location.pathname.startsWith(item.to);
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={[
                    "px-3 py-2 text-sm rounded-md transition",
                    active
                      ? "text-foreground bg-surface-2"
                      : "text-muted-foreground hover:text-foreground hover:bg-surface",
                  ].join(" ")}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right side — changes based on sign-in state */}
          <div className="hidden md:flex items-center gap-2">
            {isSignedIn ? (
              /* Signed-in: Show user avatar, name, and dropdown */
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowUserMenu((v) => !v)}
                  className="flex items-center gap-2.5 rounded-xl glass px-3 py-1.5 border border-border hover:border-primary/40 transition"
                >
                  <img
                    src={user!.avatarUrl}
                    alt={user!.displayName}
                    className="h-7 w-7 rounded-lg border border-primary/30"
                  />
                  <div className="text-left">
                    <div className="text-xs font-medium text-foreground leading-tight">{user!.displayName}</div>
                    <div className="text-[10px] text-muted-foreground leading-tight">{user!.email}</div>
                  </div>
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-52 rounded-xl glass border border-border shadow-elegant py-1 z-50">
                    <Link
                      to="/home"
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-foreground hover:bg-surface-2 transition"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <User className="h-4 w-4 text-muted-foreground" />
                      Home
                    </Link>
                    <Link
                      to="/settings"
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-foreground hover:bg-surface-2 transition"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <User className="h-4 w-4 text-muted-foreground" />
                      Settings
                    </Link>
                    <div className="h-px bg-border mx-2 my-1" />
                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-destructive hover:bg-surface-2 transition"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* Not signed in: Show Sign in + Open Editor */
              <>
                <Link
                  to="/signin"
                  className="px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition"
                >
                  Sign in
                </Link>
                <Link
                  to="/signin"
                  className="inline-flex items-center gap-2 rounded-md bg-gradient-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-glow hover:opacity-95 transition"
                >
                  Open Editor
                  <span aria-hidden>→</span>
                </Link>
              </>
            )}
          </div>

          <button
            className="md:hidden inline-flex items-center justify-center rounded-md p-2 hover:bg-surface"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {open && (
          <div className="md:hidden border-t border-border bg-background/95">
            <nav className="flex flex-col p-3 gap-1">
              {NAV.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="px-3 py-2 text-sm rounded-md text-muted-foreground hover:text-foreground hover:bg-surface"
                  onClick={() => setOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              {isSignedIn ? (
                <>
                  <div className="flex items-center gap-2 px-3 py-2 mt-2">
                    <img
                      src={user!.avatarUrl}
                      alt={user!.displayName}
                      className="h-7 w-7 rounded-lg border border-primary/30"
                    />
                    <div>
                      <div className="text-xs font-medium text-foreground">{user!.displayName}</div>
                      <div className="text-[10px] text-muted-foreground">{user!.email}</div>
                    </div>
                  </div>
                  <Link
                    to="/home"
                    className="px-3 py-2 text-sm rounded-md text-muted-foreground hover:text-foreground hover:bg-surface"
                    onClick={() => setOpen(false)}
                  >
                    Home
                  </Link>
                  <button
                    type="button"
                    onClick={() => { handleSignOut(); setOpen(false); }}
                    className="px-3 py-2 text-sm rounded-md text-destructive hover:bg-surface text-left"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/signin"
                    className="px-3 py-2 text-sm rounded-md text-muted-foreground hover:text-foreground hover:bg-surface"
                    onClick={() => setOpen(false)}
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/signin"
                    className="mt-2 rounded-md bg-gradient-primary px-3 py-2 text-sm font-medium text-primary-foreground text-center"
                    onClick={() => setOpen(false)}
                  >
                    Open Editor
                  </Link>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
