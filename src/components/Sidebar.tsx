import React from 'react';
import {
  LayoutDashboard,
  BookOpen,
  CheckSquare,
  Sparkles,
  Calendar,
  BarChart3,
  BotMessageSquare,
  Settings,
  GraduationCap,
  Moon,
  Sun,
  Flame,
  X,
} from 'lucide-react';
import { useStudy } from '../context/StudyContext';

export type NavTab =
  | 'dashboard'
  | 'subjects'
  | 'tasks'
  | 'planner'
  | 'calendar'
  | 'analytics'
  | 'assistant'
  | 'settings';

interface SidebarProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  mobileOpen,
  setMobileOpen,
}) => {
  const { tasks, upcomingExams, userSettings, toggleTheme } = useStudy();

  const pendingTasksCount = tasks.filter((t) => t.status !== 'Completed').length;
  const urgentExamsCount = upcomingExams.filter((e) => {
    const diff =
      (new Date(e.examDate).getTime() - new Date().setHours(0, 0, 0, 0)) / (1000 * 3600 * 24);
    return diff >= 0 && diff <= 14;
  }).length;

  const navItems = [
    {
      id: 'dashboard' as NavTab,
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'subjects' as NavTab,
      label: 'Subjects',
      icon: BookOpen,
      badge: null,
    },
    {
      id: 'tasks' as NavTab,
      label: 'Tasks & Deadlines',
      icon: CheckSquare,
      badge: pendingTasksCount > 0 ? pendingTasksCount : null,
      badgeColor: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300',
    },
    {
      id: 'planner' as NavTab,
      label: 'AI Study Planner',
      icon: Sparkles,
      badge: 'AI',
      badgeColor:
        'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-sm font-semibold',
      highlight: true,
    },
    {
      id: 'calendar' as NavTab,
      label: 'Calendar',
      icon: Calendar,
      badge: urgentExamsCount > 0 ? `${urgentExamsCount} exams` : null,
      badgeColor: 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300',
    },
    {
      id: 'analytics' as NavTab,
      label: 'Progress Analytics',
      icon: BarChart3,
      badge: null,
    },
    {
      id: 'assistant' as NavTab,
      label: 'Study Assistant',
      icon: BotMessageSquare,
      badge: 'Gemini',
      badgeColor: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300',
    },
    {
      id: 'settings' as NavTab,
      label: 'Settings',
      icon: Settings,
      badge: null,
    },
  ];

  const handleNavClick = (tab: NavTab) => {
    setActiveTab(tab);
    setMobileOpen(false);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm lg:hidden transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex w-72 flex-col border-r border-slate-200/80 bg-white dark:border-slate-800/80 dark:bg-slate-900 transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="flex h-18 items-center justify-between border-b border-slate-100 px-6 dark:border-slate-800/60">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 text-white shadow-md shadow-indigo-500/20">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                  StudyFlow
                </span>
                <span className="rounded-md bg-indigo-100 px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                  AI
                </span>
              </div>
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                Plan Smarter. Study Better.
              </p>
            </div>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1.5">
          <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Main Workspace
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`group flex w-full items-center justify-between rounded-xl px-3.5 py-2.5 text-sm font-semibold transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/20'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800/80 dark:hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`h-4.5 w-4.5 transition-transform group-hover:scale-110 ${
                      isActive
                        ? 'text-white'
                        : item.highlight
                        ? 'text-indigo-500 dark:text-indigo-400'
                        : 'text-slate-400 group-hover:text-slate-600 dark:text-slate-400 dark:group-hover:text-slate-200'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${
                      isActive ? 'bg-white/20 text-white' : item.badgeColor
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Study Streak Card */}
        <div className="px-4 py-2">
          <div className="rounded-xl border border-amber-200/80 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent p-3 dark:border-amber-900/40">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500 text-white">
                  <Flame className="h-4 w-4 fill-white" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    5 Days Streak!
                  </div>
                  <div className="text-[10px] text-slate-500 dark:text-slate-400">
                    Keep your study flow alive
                  </div>
                </div>
              </div>
              <span className="text-xs font-extrabold text-amber-600 dark:text-amber-400">
                Top 5%
              </span>
            </div>
          </div>
        </div>

        {/* User Card & Theme Switcher */}
        <div className="border-t border-slate-100 p-4 dark:border-slate-800/60">
          <div className="flex items-center justify-between">
            <div
              onClick={() => handleNavClick('settings')}
              className="flex items-center gap-3 cursor-pointer group flex-1 mr-2 overflow-hidden"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-xs font-bold text-white shadow-sm">
                {userSettings.studentName
                  .split(' ')
                  .map((n) => n[0])
                  .join('')}
              </div>
              <div className="min-w-0">
                <div className="truncate text-xs font-bold text-slate-900 group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400">
                  {userSettings.studentName}
                </div>
                <div className="truncate text-[11px] text-slate-400 dark:text-slate-500">
                  {userSettings.university}
                </div>
              </div>
            </div>

            <button
              onClick={toggleTheme}
              title={`Switch to ${userSettings.theme === 'dark' ? 'Light' : 'Dark'} Mode`}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
            >
              {userSettings.theme === 'dark' ? (
                <Sun className="h-4 w-4 text-amber-400" />
              ) : (
                <Moon className="h-4 w-4 text-indigo-500" />
              )}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
