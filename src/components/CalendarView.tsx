import React, { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Filter,
  Plus,
  BookOpen,
} from 'lucide-react';
import { useStudy } from '../context/StudyContext';
import { CalendarEvent } from '../types';
import { getSubjectColorClass } from '../utils/helpers';

interface CalendarViewProps {
  onOpenTaskModal: () => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ onOpenTaskModal }) => {
  const { calendarEvents, subjects } = useStudy();

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState(new Date().toISOString().split('T')[0]);
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');

  // Event Type Filters
  const [filterType, setFilterType] = useState<'all' | 'exam' | 'assignment' | 'study_session'>('all');

  const filteredEvents = useMemo(() => {
    if (filterType === 'all') return calendarEvents;
    return calendarEvents.filter((e) => e.type === filterType);
  }, [calendarEvents, filterType]);

  // Calendar calculations
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];

  const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 is Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const prevMonthDays = new Date(year, month, 0).getDate();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDateStr(today.toISOString().split('T')[0]);
  };

  // Group events by YYYY-MM-DD
  const eventsByDate = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {};
    filteredEvents.forEach((ev) => {
      if (!map[ev.date]) map[ev.date] = [];
      map[ev.date].push(ev);
    });
    return map;
  }, [filteredEvents]);

  // Selected date events
  const selectedDayEvents = eventsByDate[selectedDateStr] || [];

  const getEventBadge = (type: CalendarEvent['type']) => {
    switch (type) {
      case 'exam':
        return 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300 border-rose-200 dark:border-rose-900';
      case 'assignment':
        return 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border-indigo-200 dark:border-indigo-900';
      case 'study_session':
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900';
      default:
        return 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border-amber-200 dark:border-amber-900';
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* Top Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Academic Calendar & Timeline
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            View upcoming exams, assignment deadlines, and logged study sessions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Navigation Controls */}
          <div className="flex items-center rounded-2xl border border-slate-200 bg-white p-1 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <button
              onClick={handlePrevMonth}
              className="rounded-xl p-1.5 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              title="Previous Month"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="px-3 text-xs font-extrabold text-slate-900 dark:text-white">
              {monthNames[month]} {year}
            </span>
            <button
              onClick={handleNextMonth}
              className="rounded-xl p-1.5 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
              title="Next Month"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <button
            onClick={handleToday}
            className="rounded-2xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 shadow-xs transition-colors"
          >
            Today
          </button>

          <button
            onClick={onOpenTaskModal}
            className="flex items-center gap-1.5 rounded-2xl bg-indigo-600 px-3.5 py-2 text-xs font-bold text-white shadow-sm hover:bg-indigo-700 transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Add Event</span>
          </button>
        </div>
      </div>

      {/* Legend & Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white p-3 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
          <Filter className="h-3.5 w-3.5" />
          <span>Filter Events:</span>
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setFilterType('all')}
            className={`rounded-xl px-2.5 py-1 text-xs font-bold transition-all ${
              filterType === 'all'
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
            }`}
          >
            All Events
          </button>
          <button
            onClick={() => setFilterType('exam')}
            className={`flex items-center gap-1 rounded-xl px-2.5 py-1 text-xs font-bold transition-all ${
              filterType === 'exam'
                ? 'bg-rose-600 text-white'
                : 'text-rose-600 hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/40'
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-rose-500" />
            <span>Exams</span>
          </button>
          <button
            onClick={() => setFilterType('assignment')}
            className={`flex items-center gap-1 rounded-xl px-2.5 py-1 text-xs font-bold transition-all ${
              filterType === 'assignment'
                ? 'bg-indigo-600 text-white'
                : 'text-indigo-600 hover:bg-indigo-50 dark:text-indigo-400 dark:hover:bg-indigo-950/40'
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-indigo-500" />
            <span>Assignments</span>
          </button>
          <button
            onClick={() => setFilterType('study_session')}
            className={`flex items-center gap-1 rounded-xl px-2.5 py-1 text-xs font-bold transition-all ${
              filterType === 'study_session'
                ? 'bg-emerald-600 text-white'
                : 'text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-950/40'
            }`}
          >
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span>Study Sessions</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Calendar on Left (2/3), Selected Day Sidebar on Right (1/3) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Calendar Grid */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-4 sm:p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 lg:col-span-2">
          {/* Day of Week Headers */}
          <div className="grid grid-cols-7 text-center font-bold text-xs text-slate-400 pb-3 border-b border-slate-100 dark:border-slate-800">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          {/* Days Cells */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2 pt-2">
            {/* Previous Month trailing days */}
            {Array.from({ length: firstDayOfMonth }).map((_, i) => {
              const dayNum = prevMonthDays - firstDayOfMonth + i + 1;
              return (
                <div
                  key={`prev-${i}`}
                  className="min-h-[85px] rounded-xl p-1.5 text-slate-300 dark:text-slate-700 bg-slate-50/40 dark:bg-slate-850/40 text-xs"
                >
                  <span className="font-semibold">{dayNum}</span>
                </div>
              );
            })}

            {/* Current Month Days */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const pad = (n: number) => n.toString().padStart(2, '0');
              const dateStr = `${year}-${pad(month + 1)}-${pad(dayNum)}`;
              const dayEvents = eventsByDate[dateStr] || [];
              const isToday = dateStr === todayStr;
              const isSelected = dateStr === selectedDateStr;

              return (
                <div
                  key={`curr-${i}`}
                  onClick={() => setSelectedDateStr(dateStr)}
                  className={`group min-h-[85px] sm:min-h-[95px] rounded-xl p-1.5 sm:p-2 cursor-pointer transition-all border ${
                    isSelected
                      ? 'border-indigo-600 bg-indigo-50/50 dark:border-indigo-500 dark:bg-indigo-950/30'
                      : isToday
                      ? 'border-indigo-300 bg-white dark:border-indigo-800 dark:bg-slate-900'
                      : 'border-transparent hover:border-slate-200 hover:bg-slate-50 dark:hover:border-slate-800 dark:hover:bg-slate-850/60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                        isToday
                          ? 'bg-indigo-600 text-white'
                          : isSelected
                          ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300'
                          : 'text-slate-800 dark:text-slate-200'
                      }`}
                    >
                      {dayNum}
                    </span>

                    {dayEvents.length > 0 && (
                      <span className="text-[10px] font-extrabold text-slate-400">
                        {dayEvents.length}
                      </span>
                    )}
                  </div>

                  {/* Micro event indicators */}
                  <div className="mt-1 space-y-1 overflow-hidden">
                    {dayEvents.slice(0, 2).map((ev) => (
                      <div
                        key={ev.id}
                        className={`truncate rounded px-1 py-0.5 text-[9px] font-bold border ${getEventBadge(
                          ev.type
                        )}`}
                        title={ev.title}
                      >
                        {ev.type === 'exam' ? '🔴 ' : ''}
                        {ev.title}
                      </div>
                    ))}
                    {dayEvents.length > 2 && (
                      <div className="text-[9px] font-bold text-slate-400 pl-1">
                        +{dayEvents.length - 2} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Selected Day Agenda Drawer */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
              <div>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Schedule for {selectedDateStr}
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedDayEvents.length} {selectedDayEvents.length === 1 ? 'event' : 'events'} recorded
                </p>
              </div>
              {selectedDateStr === todayStr && (
                <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-extrabold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                  Today
                </span>
              )}
            </div>

            {selectedDayEvents.length === 0 ? (
              <div className="py-12 text-center">
                <CalendarIcon className="mx-auto h-8 w-8 text-slate-300 dark:text-slate-600" />
                <p className="mt-2 text-xs font-bold text-slate-600 dark:text-slate-400">
                  No events on this date
                </p>
                <p className="text-[11px] text-slate-400">
                  Use this time for free review or schedule a study block.
                </p>
              </div>
            ) : (
              <div className="mt-4 space-y-3">
                {selectedDayEvents.map((ev) => (
                  <div
                    key={ev.id}
                    className="rounded-xl border border-slate-100 p-3 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-850/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`rounded-md px-2 py-0.5 text-[10px] font-bold border uppercase tracking-wider ${getEventBadge(
                          ev.type
                        )}`}
                      >
                        {ev.type.replace('_', ' ')}
                      </span>
                      {ev.time && (
                        <div className="flex items-center gap-1 font-mono text-[11px] text-slate-400">
                          <Clock className="h-3 w-3" />
                          <span>{ev.time}</span>
                        </div>
                      )}
                    </div>

                    <h4 className="mt-2 text-xs font-bold text-slate-900 dark:text-white">
                      {ev.title}
                    </h4>

                    {ev.description && (
                      <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                        {ev.description}
                      </p>
                    )}

                    <div className="mt-2 flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-slate-600 dark:text-slate-300">
                        {ev.subjectName}
                      </span>
                      {ev.completed && (
                        <span className="flex items-center gap-1 text-emerald-600 font-bold">
                          <CheckCircle2 className="h-3 w-3" /> Completed
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-6 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={onOpenTaskModal}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-indigo-600 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-indigo-700 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>Add Task or Event for this Date</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
