import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
import { Bell, ChevronDown, CircleUser, Command, Menu, Search, ShieldCheck } from "lucide-react";
import { useState, type ReactNode } from "react";
import { useAuth } from "@/lib/auth-context";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { navSections } from "@/components/shell/nav";
import { cn } from "@/lib/utils";

function Brand() {
  return (
    <Link to="/" className="flex items-center gap-2.5 px-4 py-4">
      <span className="flex size-8 items-center justify-center rounded-md border border-primary/30 bg-primary/12">
        <ShieldCheck className="size-4 text-primary" />
      </span>
      <span className="min-w-0">
        <span className="block truncate text-sm font-semibold leading-tight">Veytrix</span>
        <span className="block truncate text-[11px] uppercase tracking-wider text-muted-foreground">
          Control Centre
        </span>
      </span>
    </Link>
  );
}

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav className="flex-1 overflow-y-auto px-2 pb-6" aria-label="Primary">
      {navSections.map((section) => (
        <div key={section.title} className="mb-5">
          <p className="px-3 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/70">
            {section.title}
          </p>
          <ul className="space-y-0.5">
            {section.items.map((item) => {
              const active = item.to === "/" ? pathname === "/" : pathname.startsWith(item.to);
              return (
                <li key={item.to}>
                  <Link
                    to={item.to as "/"}
                    onClick={onNavigate}
                    className={cn(
                      "group flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors",
                      active
                        ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                        : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground",
                    )}
                  >
                    <item.icon className={cn("size-4 shrink-0", active && "text-primary")} />
                    <span className="truncate">{item.label}</span>
                    {item.badge && (
                      <span className="num ml-auto rounded border border-border bg-muted px-1.5 text-[10px] font-medium text-muted-foreground">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}

function SidebarFooter() {
  return (
    <div className="border-t border-sidebar-border p-3">
      <div className="flex items-center gap-2 rounded-md border border-border bg-surface-raised/60 px-2.5 py-2">
        <span className="size-2 shrink-0 rounded-full bg-muted-foreground" />
        <div className="min-w-0 text-xs">
          <p className="truncate font-medium">Region status</p>
          <p className="num truncate text-muted-foreground">Not configured</p>
        </div>
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, profile, role } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Successfully logged out");
      navigate({ to: "/login" });
    } catch (error) {
      toast.error("Failed to sign out");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-sidebar-border bg-sidebar lg:flex">
        <Brand />
        <SidebarNav />
        <SidebarFooter />
      </aside>

      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-border bg-background/85 px-3 backdrop-blur sm:px-5">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                aria-label="Open navigation"
              >
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 border-sidebar-border bg-sidebar p-0">
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              <div className="flex h-full flex-col">
                <Brand />
                <SidebarNav onNavigate={() => setMobileOpen(false)} />
                <SidebarFooter />
              </div>
            </SheetContent>
          </Sheet>

          <button
            type="button"
            className="hidden h-9 w-72 items-center gap-2 rounded-md border border-border bg-surface px-2.5 text-sm text-muted-foreground transition-colors hover:border-ring/50 md:flex xl:w-96"
          >
            <Search className="size-3.5" />
            <span>Search users, jobs, tickets…</span>
            <span className="ml-auto flex items-center gap-0.5 rounded border border-border px-1 text-[10px]">
              <Command className="size-2.5" />K
            </span>
          </button>

          <div className="ml-auto flex items-center gap-1.5">
            <span className="hidden items-center gap-1.5 rounded-md border border-border bg-surface px-2.5 py-1.5 text-xs text-muted-foreground sm:flex">
              <span className="size-1.5 rounded-full bg-success" />
              Environment · Not configured
            </span>
            <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
              <Bell className="size-4" />
              <span className="absolute right-2 top-2 size-1.5 rounded-full bg-destructive" />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-9 gap-2 px-2">
                  <CircleUser className="size-4" />
                  <span className="hidden text-sm sm:inline">Account</span>
                  <ChevronDown className="hidden size-3.5 opacity-60 sm:inline" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <p className="text-sm font-medium">{profile?.full_name || "Unknown User"}</p>
                  <p className="text-xs font-normal text-muted-foreground">
                    {user?.email || "No email"}
                  </p>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-xs text-muted-foreground">
                  {role?.name ? `Role: ${role.name}` : "Role not configured"}
                </DropdownMenuItem>
                <DropdownMenuItem>Audit my actions</DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut}>Sign out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className="mx-auto w-full max-w-[1600px] space-y-5 px-3 py-5 sm:px-5 sm:py-6">
          {children}
        </main>
      </div>
    </div>
  );
}
