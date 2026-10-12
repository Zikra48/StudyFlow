import React, { useState } from 'react';
import {
  Sparkles,
  RefreshCw,
  Clock,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  ChevronRight,
  BookOpen,
  ArrowRight,
  Flame,
  Check,
  Copy,
  PlusCircle,
} from 'lucide-react';
import { useStudy } from '../context/StudyContext';
import { getSubjectColorClass } from '../utils/helpers';

export const AiPlannerView: React.FC = () => {
  const {
    aiStudyPlan,
    generateAiStudyPlan,
    loadingPlan,
    planError,
    togglePlanSessionCompleted,
    applyPlanToCalendarAsTasks,
    subjects,
    tasks,
    userSettings,
  } = useStudy();

  const [activeDayIndex, setActiveDayIndex] = useState(0);
  const [showConfig, setShowConfig] = useState(false);
  const [dailyHours, setDailyHours] = useState(userSettings.dailyStudyHoursTarget || 5);
  const [sessionLength, setSessionLength] = useState(60);
  const [weekendIntense, setWeekendIntense] = useState(false);
  const [customGoal, setCustomGoal] = useState('');
  const [copied, setCopied] = useState(false);
  const [appliedSuccess, setAppliedSuccess] = useState(false);

  const handleGenerate = async () => {
    const success = await generateAiStudyPlan({
      dailyHours,
      sessionLength,
      weekendIntense,
      customGoal: customGoal.trim() || undefined,
    });
    if (success) {
      setActiveDayIndex(0);
      setAppliedSuccess(false);
    }
  };

  const handleApplyToTasks = () => {
    applyPlanToCalendarAsTasks();
    setAppliedSuccess(true);
    setTimeout(() => setAppliedSuccess(false), 4000);
  };

  const handleCopyTextPlan = () => {
    if (!aiStudyPlan) return;
    let text = `STUDYFLOW AI — 7-DAY STUDY PLAN\n`;
    text += `Generated: ${new Date(aiStudyPlan.generatedAt).toLocaleDateString()}\n`;
    text += `Overview: ${aiStudyPlan.weeklyOverview}\n\n`;

    aiStudyPlan.days.forEach((d) => {
      text += `=== ${d.dayName} (${d.totalHours} hrs) - ${d.theme} ===\n`;
      d.sessions.forEach((s) => {
        text += `• ${s.timeSlot} | ${s.subjectName} — ${s.taskTitle} (${s.durationMinutes}m)\n`;
      });
      text += `\n`;
    });

    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const currentDay = aiStudyPlan?.days[activeDayIndex] || aiStudyPlan?.days[0];

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* Top Banner & Generation Bar */}
      <div className="relative overflow-hidden rounded-3xl border border-indigo-100 bg-gradient-to-r from-violet-600 via-indigo-600 to-indigo-800 p-6 sm:p-8 text-white shadow-xl shadow-indigo-900/20">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="max-w-2xl space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5 text-indigo-200" />
              <span>Gemini 3.8 Academic Scheduler</span>
            </div>
            <h2 className="text-2xl font-extrabold sm:text-3xl tracking-tight">
              Personalized 7-Day Study Schedule
            </h2>
            <p className="text-xs sm:text-sm text-indigo-100/90 leading-relaxed">
              Analyzes your {subjects.length} subjects, difficulty ratings, pending assignments, and exam countdowns to generate a balanced, cognitive-optimal daily schedule.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowConfig(!showConfig)}
              className="flex items-center gap-1.5 rounded-2xl bg-white/10 px-3.5 py-2.5 text-xs font-bold text-white backdrop-blur-md hover:bg-white/20 transition-all"
            >
              <Sliders className="h-4 w-4" />
              <span>{showConfig ? 'Hide Parameters' : 'Adjust Target Hours'}</span>
            </button>

            <button
              onClick={handleGenerate}
              disabled={loadingPlan}
              className="flex items-center gap-2 rounded-2xl bg-white px-5 py-2.5 text-xs font-bold text-indigo-900 shadow-md hover:bg-indigo-50 active:scale-95 disabled:opacity-75 transition-all"
            >
              <RefreshCw className={`h-4 w-4 text-indigo-600 ${loadingPlan ? 'animate-spin' : ''}`} />
              <span>{loadingPlan ? 'Generating Plan...' : 'Generate My Study Plan'}</span>
            </button>
          </div>
        </div>

        {/* Ambient glow */}
        <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-violet-400/20 blur-3xl" />
      </div>

      {/* Optional Tuning Parameters Drawer */}
      {showConfig && (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Sliders className="h-4 w-4 text-indigo-600" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Customize AI Scheduling Constraints
              </h3>
            </div>
            <span className="text-xs text-slate-500">Gemini considers these during generation</span>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
                Daily Study Target ({dailyHours} hrs/day)
              </label>
              <input
                type="range"
                min="3"
                max="8"
                step="0.5"
                value={dailyHours}
                onChange={(e) => setDailyHours(parseFloat(e.target.value))}
                className="w-full accent-indigo-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>3 hrs (Light)</span>
                <span>5 hrs (Standard)</span>
                <span>8 hrs (Intensive)</span>
              </div>
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
                Preferred Session Block
              </label>
              <select
                value={sessionLength}
                onChange={(e) => setSessionLength(parseInt(e.target.value))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value={45}>45 mins (Pomodoro)</option>
                <option value={60}>60 mins (Standard 1h)</option>
                <option value={90}>90 mins (Deep Focus Block)</option>
              </select>
            </div>

            <div className="flex flex-col justify-center">
              <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={weekendIntense}
                  onChange={(e) => setWeekendIntense(e.target.checked)}
                  className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <span>Weekend Study Sprints (Higher workload on Sat & Sun)</span>
              </label>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
              Custom Prompt or Specific Goal
            </label>
            <input
              type="text"
              placeholder="e.g. Emphasize Cryptography past exam questions and give me Thursday afternoon off for track practice"
              value={customGoal}
              onChange={(e) => setCustomGoal(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      )}

      {/* Plan Error Alert */}
      {planError && (
        <div className="flex items-center gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-xs font-semibold text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/60 dark:text-rose-300">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <div className="flex-1">
            <p className="font-bold">Study Plan Generation Notice</p>
            <p className="mt-0.5">{planError}</p>
          </div>
        </div>
      )}

      {/* Generated Plan Presentation */}
      {aiStudyPlan && (
        <div className="space-y-6">
          {/* Executive Overview & Key Alert */}
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 lg:col-span-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                <Sparkles className="h-4 w-4 text-indigo-500" />
                <span>Weekly Strategy Overview</span>
              </div>
              <p className="mt-2 text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                {aiStudyPlan.weeklyOverview}
              </p>
              <div className="mt-3 flex items-center gap-4 text-xs font-semibold text-slate-500">
                <span>Total Scheduled: <strong className="text-slate-900 dark:text-white">{aiStudyPlan.totalScheduledHours} hours</strong></span>
                <span>•</span>
                <span>7 Days Spaced Repetition</span>
              </div>
            </div>

            <div className="rounded-2xl border border-rose-200/80 bg-gradient-to-br from-rose-50/80 via-white to-rose-50/20 p-5 dark:border-rose-900/40 dark:from-slate-900 dark:to-rose-950/20">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                <AlertTriangle className="h-4 w-4" />
                <span>Key Focus Alert</span>
              </div>
              <p className="mt-2 text-xs font-semibold text-rose-900 dark:text-rose-200 leading-relaxed">
                {aiStudyPlan.keyFocusAlert}
              </p>
              <div className="mt-4 flex items-center gap-2">
                <button
                  onClick={handleApplyToTasks}
                  className="flex items-center gap-1.5 rounded-xl bg-indigo-600 px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-indigo-700 transition-colors"
                >
                  <PlusCircle className="h-3.5 w-3.5" />
                  <span>{appliedSuccess ? 'Added to Tasks!' : 'Apply Plan to Tasks'}</span>
                </button>
                <button
                  onClick={handleCopyTextPlan}
                  className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
                >
                  {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Day Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            {aiStudyPlan.days.map((day, idx) => {
              const isActive = activeDayIndex === idx;
              const completedCount = day.sessions.filter((s) => s.completed).length;

              return (
                <button
                  key={day.dayName + idx}
                  onClick={() => setActiveDayIndex(idx)}
                  className={`flex flex-col items-start rounded-2xl border px-4 py-3 min-w-[130px] transition-all text-left ${
                    isActive
                      ? 'border-indigo-600 bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                      : 'border-slate-200/80 bg-white text-slate-700 hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="text-xs font-extrabold">{day.dayName}</span>
                    <span
                      className={`text-[10px] font-bold rounded px-1.5 py-0.2 ${
                        isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500 dark:bg-slate-800'
                      }`}
                    >
                      {day.totalHours}h
                    </span>
                  </div>
                  <span
                    className={`mt-1 text-[11px] font-medium truncate w-full ${
                      isActive ? 'text-indigo-100' : 'text-slate-400'
                    }`}
                  >
                    {completedCount}/{day.sessions.length} sessions
                  </span>
                </button>
              );
            })}
          </div>

          {/* Current Day Sessions List */}
          {currentDay && (
            <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4 dark:border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                      {currentDay.dayName} Schedule
                    </h3>
                    <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-xs font-extrabold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                      {currentDay.totalHours} Hours Total
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                    Theme: <strong className="text-slate-700 dark:text-slate-300">{currentDay.theme}</strong>
                  </p>
                </div>

                <div className="text-xs font-semibold text-slate-500">
                  {currentDay.sessions.filter((s) => s.completed).length} of {currentDay.sessions.length} sessions completed
                </div>
              </div>

              {/* Day Time Slots */}
              <div className="space-y-3.5 pt-2">
                {currentDay.sessions.map((sess) => {
                  const sub = subjects.find(
                    (s) => s.name.toLowerCase() === sess.subjectName.toLowerCase()
                  );
                  const colorInfo = getSubjectColorClass(sub?.color);

                  return (
                    <div
                      key={sess.id}
                      className={`relative flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-2xl border p-4.5 transition-all ${
                        sess.completed
                          ? 'border-slate-100 bg-slate-50/70 dark:border-slate-800/40 dark:bg-slate-850/40 opacity-70'
                          : 'border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 hover:border-indigo-300 dark:hover:border-indigo-800 shadow-xs'
                      }`}
                    >
                      <div className="flex items-start gap-4 min-w-0">
                        {/* Checkbox */}
                        <button
                          onClick={() => togglePlanSessionCompleted(sess.id)}
                          className={`mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-lg border transition-colors ${
                            sess.completed
                              ? 'border-indigo-600 bg-indigo-600 text-white'
                              : 'border-slate-300 hover:border-indigo-500 dark:border-slate-600'
                          }`}
                        >
                          {sess.completed && <CheckCircle2 className="h-4 w-4 stroke-[3]" />}
                        </button>

                        <div className="min-w-0">
                          {/* Time Slot & Badges */}
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-mono text-xs font-extrabold text-slate-900 dark:text-white">
                              {sess.timeSlot}
                            </span>
                            <span className="text-slate-300 dark:text-slate-600">•</span>
                            <span className={`rounded-md px-2 py-0.5 text-xs font-bold ${colorInfo.badge}`}>
                              {sess.subjectName}
                            </span>
                            <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                              {sess.sessionType}
                            </span>
                            <span
                              className={`rounded-full px-2 py-0.2 text-[10px] font-extrabold ${
                                sess.priority === 'High'
                                  ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                                  : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                              }`}
                            >
                              {sess.priority}
                            </span>
                          </div>

                          {/* Task Description */}
                          <h4
                            className={`mt-1.5 text-sm font-bold text-slate-900 dark:text-white ${
                              sess.completed ? 'line-through text-slate-400 dark:text-slate-500' : ''
                            }`}
                          >
                            {sess.taskTitle}
                          </h4>

                          {/* Rationale & Suggested Technique */}
                          <div className="mt-2 space-y-1 text-xs">
                            <p className="text-slate-500 dark:text-slate-400">
                              <span className="font-bold text-slate-600 dark:text-slate-300">Why now:</span>{' '}
                              {sess.rationale}
                            </p>
                            {sess.recommendedTechnique && (
                              <p className="text-indigo-600 dark:text-indigo-400 font-medium">
                                <span className="font-bold">Recommended Method:</span> {sess.recommendedTechnique}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right Duration pill */}
                      <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
                        <span className="font-mono text-xs font-semibold text-slate-500">
                          {sess.durationMinutes} mins
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Strategic Study Tips Box */}
          {aiStudyPlan.strategicTips && aiStudyPlan.strategicTips.length > 0 && (
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
              <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
                <Flame className="h-4 w-4 text-amber-500" />
                <span>Cognitive & Strategic Study Advice</span>
              </h3>
              <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                {aiStudyPlan.strategicTips.map((tip, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-2.5 rounded-xl bg-slate-50 p-3 text-xs text-slate-700 dark:bg-slate-800/60 dark:text-slate-300"
                  >
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-[11px] font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                      {i + 1}
                    </span>
                    <span className="leading-relaxed font-medium">{tip}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
