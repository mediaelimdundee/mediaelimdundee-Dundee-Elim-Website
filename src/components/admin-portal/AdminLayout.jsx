// @ts-nocheck
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Calendar,
  Church,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Users,
  Globe,
} from 'lucide-react';
import NoticeBanner from '@/components/admin-portal/NoticeBanner';
import StickyPublishBar from '@/components/admin-portal/StickyPublishBar';
import { useAdminAuth } from '@/contexts/AdminAuthContext';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/admin/website/global', icon: Globe, label: 'Website', matchPrefix: '/admin/website/' },
  { to: '/admin/sermons', icon: BookOpen, label: 'Sermons' },
  { to: '/admin/events', icon: Calendar, label: 'Events' },
  { to: '/admin/ministries', icon: Users, label: 'Ministries' },
  { to: '/admin/messages', icon: MessageSquare, label: 'Messages' },
];

export default function AdminLayout() {
  const auth = useAdminAuth();
  const location = useLocation();
  const navigate = useNavigate();

  async function handleLogout() {
    await auth.signOut();
    navigate('/admin/login');
  }

  return (
    <div className="admin-portal-theme min-h-screen text-foreground">
      <div className="border-b border-[#dbe1ea] bg-white/85 backdrop-blur lg:hidden">
        <div className="flex items-center justify-between px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e3b341] text-slate-950 shadow-sm">
              <Church className="h-4 w-4" />
            </div>
            <div>
              <p className="font-display text-sm font-semibold leading-none text-foreground">Elim Dundee</p>
              <p className="mt-0.5 text-xs text-muted-foreground">Admin</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="rounded-xl border border-[#dbe1ea] bg-white px-3 py-2 text-xs font-medium text-muted-foreground shadow-sm"
          >
            Log out
          </button>
        </div>
        <div className="overflow-x-auto px-4 pb-4">
          <div className="flex min-w-max gap-2">
            {navItems.map(({ to, icon: Icon, label, matchPrefix }) => {
              const isActive = matchPrefix ? location.pathname.startsWith(matchPrefix) : location.pathname === to;
              return (
                <NavLink
                  key={to}
                  to={to}
                  className={cn(
                    'inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors',
                    isActive ? 'bg-[#4857d6] text-white' : 'border border-[#dbe1ea] bg-white text-muted-foreground',
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span>{label}</span>
                </NavLink>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex min-h-screen">
      <aside className="hidden w-64 shrink-0 border-r border-[#2b3040] bg-[#1d2230] text-[#c9d0dc] shadow-[12px_0_32px_rgba(12,18,32,0.22)] lg:flex lg:flex-col">
        <div className="border-b border-[#2b3040] px-5 py-6">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#e3b341] text-slate-950 shadow-sm">
              <Church className="h-4 w-4" />
            </div>
            <div>
              <p className="font-display text-sm font-semibold leading-none text-white">Elim Dundee</p>
              <p className="mt-0.5 text-xs text-[#c9d0dc]">Admin</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4">
          {navItems.map(({ to, icon: Icon, label, matchPrefix }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => cn(
                'mb-1 flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all',
                (matchPrefix ? location.pathname.startsWith(matchPrefix) : isActive)
                  ? 'bg-[#e3b341] text-slate-950 shadow-sm'
                  : 'text-[#c9d0dc] hover:bg-[#2a3040] hover:text-white',
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-[#2b3040] p-3">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-[#c9d0dc] transition-all hover:bg-[#2a3040] hover:text-white"
          >
            <LogOut className="h-4 w-4" />
            <span>Log out</span>
          </button>
        </div>
      </aside>

      <main className="min-w-0 flex-1 overflow-y-auto bg-transparent">
        <div className="mx-auto max-w-[1260px] px-4 py-5 sm:px-6 lg:px-8 lg:py-8">
          <NoticeBanner />
          <StickyPublishBar />
          <Outlet />
        </div>
      </main>
      </div>
    </div>
  );
}
