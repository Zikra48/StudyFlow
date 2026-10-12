import React from 'react';
import {
  Menu,
  Timer,
  Play,
  Pause,
  Plus,
  Sparkles,
  BookOpen,
  CheckCircle2,
} from 'lucide-react';
import { useStudy } from '../context/StudyContext';
import { NavTab } from './Sidebar';

interface HeaderProps {
  activeTab: NavTab;
  setActiveTab: (tab: NavTab) => void;
  setMobileOpen: (open: boolean) => void;
  onOpenTaskModal: () => void;
  onOpenSubjectModal: () => void;
  onOpenTimerModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  setMobileOpen,
  onOpenTaskModal,
  onOpenSubjectModal,
  onOpenTimerModal,
}) => {
  const { activeTimer, resumeTimer, pauseTimer, subjects } = useStudy();

  const titleMap: Record<NavTab, { title: string; subtitle: string }> = {
    dashboard: {
      title: 'Dashboard',
      subtitle: 'Your weekly study progress, urgent deadlines, and priority focus.',
    },
    subjects: {
      title: 'Subject Management',
      subtitle: 'Track courses, target hours, instructors, and final exam milestones.',
    },
    tasks: {
      title: 'Tasks & Assignments',
      subtitle: 'Organize problem sets, readings, projects, and study milestones.',
    },
    planner: {
      title: 'AI Study Planner',
      subtitle: 'Gemini-powered 7-day realistic study schedule tailored to your deadlines.',
    },
    calendar: {
      title: 'Master Academic Calendar',
      subtitle: 'Month & week views of exams, assignments, and logged study sessions.',
    },
    analytics: {
      title: 'Progress & Analytics',
      subtitle: 'Visualize your weekly study hours, subject allocation, and completion rates.',
    },
    assistant: {
      title: 'AI Study Assistant',
      subtitle: 'Ask academic strategy questions, revision breakdowns, and prioritization tips.',
    },
    settings: {
      title: 'Settings & Preferences',
      subtitle: 'Customize your academic profile, study targets, timer, and theme.',
    },
  };

  const { title, subtitle } = titleMap[activeTab];

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const activeSubject = subjects.find((s) => s.id === activeTimer.subjectId);

  return (
    <header className="sticky top-0 z-30 flex h-18 w-full items-center justify-between border-b border-slate-200/80 bg-white/80 px-4 sm:px-8 backdrop-blur-md dark:border-slate-800/80 dark:bg-slate-900/80">
      {/* Left: Mobile Toggle & Page Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setMobileOpen(true)}
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div>
          <h1 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white sm:text-xl">
            {title}
          </h1>
          <p className="hidden text-xs text-slate-500 dark:text-slate-400 sm:block">
            {subtitle}
          </p>
        </div>
      </div>

      {/* Right: Active Timer Pill & Quick Actions */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Floating Focus Timer Widget */}
        <div className="flex items-center rounded-xl border border-slate-200 bg-slate-50 p-1 dark:border-slate-700 dark:bg-slate-800/80 shadow-xs">
          <button
            onClick={onOpenTimerModal}
            className="flex items-center gap-2 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:text-indigo-600 dark:text-slate-300 dark:hover:text-indigo-400 transition-colors"
            title="Open Focus Timer"
          >
            <div
              className={`flex h-6 w-6 items-center justify-center rounded-md ${
                activeTimer.isRunning
                  ? 'bg-indigo-600 text-white animate-pulse'
                  : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
              }`}
            >
              <Timer className="h-3.5 w-3.5" />
            </div>
            <div className="text-left font-mono">
              <span className="font-bold text-xs">{formatTimer(activeTimer.timeLeft)}</span>
              <span className="hidden md:inline ml-1.5 text-[10px] text-slate-500 dark:text-slate-400">
                {activeTimer.mode === 'focus' ? 'Focus' : 'Break'}
                {activeSubject ? ` • ${activeSubject.name.split(' ')[0]}` : ''}
              </span>
            </div>
          </button>

          <button
            onClick={() => (activeTimer.isRunning ? pauseTimer() : resumeTimer())}
            className="flex h-7 w-7 items-center justify-center rounded-lg bg-white text-slate-700 hover:bg-slate-100 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 shadow-xs transition-colors ml-1"
            title={activeTimer.isRunning ? 'Pause Timer' : 'Resume Timer'}
          >
            {activeTimer.isRunning ? (
              <Pause className="h-3.5 w-3.5" />
            ) : (
              <Play className="h-3.5 w-3.5 fill-current text-indigo-600 dark:text-indigo-400" />
            )}
          </button>
        </div>

        {/* Quick Add Task Button */}
        <button
          onClick={onOpenTaskModal}
          className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3 py-2 text-xs font-semibold text-white shadow-sm shadow-indigo-600/20 hover:bg-indigo-700 active:scale-95 transition-all"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Add Task</span>
        </button>

        {/* Quick Add Subject (shown on larger screens) */}
        <button
          onClick={onOpenSubjectModal}
          className="hidden md:flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-750 transition-colors"
        >
          <BookOpen className="h-3.5 w-3.5 text-slate-500" />
          <span>New Subject</span>
        </button>

        {/* AI Planner trigger if not currently on planner */}
        {activeTab !== 'planner' && (
          <button
            onClick={() => setActiveTab('planner')}
            className="hidden xl:flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-3 py-2 text-xs font-semibold text-white shadow-sm hover:opacity-95 transition-opacity"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>AI Plan</span>
          </button>
        )}
      </div>
    </header>
  );
};
