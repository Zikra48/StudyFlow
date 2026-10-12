import React from 'react';
import {
  BarChart3,
  Clock,
  CheckCircle2,
  TrendingUp,
  Brain,
  Sparkles,
  Flame,
  Award,
  BookOpen,
  Calendar,
  Trash2,
} from 'lucide-react';
import { useStudy } from '../context/StudyContext';
import { getSubjectColorClass } from '../utils/helpers';

export const AnalyticsView: React.FC = () => {
  const {
    subjects,
    tasks,
    studySessions,
    totalPlannedHoursThisWeek,
    completedHoursThisWeek,
    completedTasksCount,
    totalTasksCount,
    progressPercentage,
    deleteStudySession,
  } = useStudy();

  // Task breakdown by category
  const categories = ['Assignment', 'Exam Prep', 'Project', 'Reading', 'Revision'] as const;
  const categoryStats = categories.map((cat) => {
    const total = tasks.filter((t) => t.category === cat).length;
    const completed = tasks.filter((t) => t.category === cat && t.status === 'Completed').length;
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { name: cat, total, completed, pct };
  });

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* Top Header */}
      <div>
        <h2 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Study Flow & Academic Analytics
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Monitor your study momentum, hours logged by subject, and task completion velocity.
        </p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* KPI 1 */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Total Logged Hours
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {completedHoursThisWeek} hrs
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Target: <strong className="text-slate-700 dark:text-slate-300">{totalPlannedHoursThisWeek} hrs</strong> for the week
          </p>
        </div>

        {/* KPI 2 */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Weekly Completion
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {progressPercentage}%
            </span>
          </div>
          <div className="mt-2 h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* KPI 3 */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Task Velocity
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950 dark:text-purple-400">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {completedTasksCount} / {totalTasksCount}
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            {totalTasksCount > 0 ? Math.round((completedTasksCount / totalTasksCount) * 100) : 0}% tasks cleared
          </p>
        </div>

        {/* KPI 4 */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Study Streak
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
              <Flame className="h-4 w-4 fill-amber-500" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-amber-600 dark:text-amber-400">
              5 Days Streak
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-500">
            Active daily focus logged without pause
          </p>
        </div>
      </div>

      {/* Main Charts: Subject Hours Breakdown & Planned vs Actual */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Subject Progress & Distribution */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Study Hours by Subject
              </h3>
              <p className="text-xs text-slate-500">
                Weekly logged hours vs weekly goal
              </p>
            </div>
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">
              {subjects.length} Courses
            </span>
          </div>

          {/* Proportional Stacked Bar */}
          <div>
            <div className="flex h-4 w-full overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800">
              {subjects.map((sub) => {
                const colorInfo = getSubjectColorClass(sub.color);
                const sharePercent =
                  completedHoursThisWeek > 0
                    ? Math.round((sub.completedHoursThisWeek / completedHoursThisWeek) * 100)
                    : 0;

                return (
                  <div
                    key={sub.id}
                    className={`${colorInfo.bg} transition-all duration-500`}
                    style={{ width: `${sharePercent}%` }}
                    title={`${sub.name}: ${sub.completedHoursThisWeek} hrs (${sharePercent}%)`}
                  />
                );
              })}
            </div>
          </div>

          {/* Individual Subject Rows */}
          <div className="space-y-3 pt-2">
            {subjects.map((sub) => {
              const colorInfo = getSubjectColorClass(sub.color);
              const pct = Math.min(
                100,
                Math.round((sub.completedHoursThisWeek / sub.weeklyTargetHours) * 100)
              );

              return (
                <div key={sub.id} className="rounded-xl border border-slate-100 p-3 dark:border-slate-800/80">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className={`h-2.5 w-2.5 rounded-full ${colorInfo.dot}`} />
                      <span className="font-bold text-slate-900 dark:text-white">{sub.name}</span>
                      <span className="text-[10px] text-slate-400">({sub.difficulty})</span>
                    </div>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {sub.completedHoursThisWeek} / {sub.weeklyTargetHours} hrs ({pct}%)
                    </span>
                  </div>

                  <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${colorInfo.bg}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Task Completion Breakdown by Category & AI Study Tips */}
        <div className="space-y-6">
          {/* Category Progress */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
            <div className="border-b border-slate-100 pb-3 dark:border-slate-800">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Task Completion by Category
              </h3>
              <p className="text-xs text-slate-500">
                Problem sets, exam prep, and reading milestones
              </p>
            </div>

            <div className="space-y-3">
              {categoryStats.map((item) => (
                <div key={item.name} className="flex items-center justify-between gap-3 text-xs">
                  <span className="font-semibold text-slate-700 dark:text-slate-300 w-28">
                    {item.name}
                  </span>
                  <div className="flex-1 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-indigo-600 transition-all duration-500"
                      style={{ width: `${item.pct}%` }}
                    />
                  </div>
                  <span className="font-bold text-slate-500 w-16 text-right">
                    {item.completed} / {item.total} ({item.pct}%)
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* AI Productivity Insights */}
          <div className="rounded-2xl border border-indigo-200/80 bg-gradient-to-br from-indigo-50/70 via-white to-violet-50/50 p-6 dark:border-indigo-900/40 dark:from-slate-900 dark:to-indigo-950/20">
            <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400">
              <Sparkles className="h-5 w-5" />
              <h3 className="text-sm font-bold uppercase tracking-wider">AI Productivity Diagnostic</h3>
            </div>
            <div className="mt-3 space-y-2.5 text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
              <p>
                • <strong>Pacing Warning:</strong> Cryptography is currently at 4.0 / 9.0 hrs with an exam in 7 days. Recommend allocating an extra 2.5 hours tomorrow morning.
              </p>
              <p>
                • <strong>Strong Consistency:</strong> Machine Learning and Stochastic Calculus are pacing at 65% of weekly targets ahead of schedule.
              </p>
              <p>
                • <strong>Recommended Action:</strong> Close out the 2 pending problem sets before starting new passive textbook reading.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Study Sessions Table */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Recent Logged Focus Sessions
            </h3>
            <p className="text-xs text-slate-500">
              Historical record of your Pomodoro and timed study blocks
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-500">
            {studySessions.length} sessions logged
          </span>
        </div>

        <div className="mt-4 divide-y divide-slate-100 dark:divide-slate-800">
          {studySessions.slice(0, 6).map((sess) => {
            const sub = subjects.find((s) => s.id === sess.subjectId);
            const colorInfo = getSubjectColorClass(sub?.color);

            return (
              <div key={sess.id} className="flex items-center justify-between py-3 text-xs gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    <Clock className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`rounded px-1.5 py-0.2 font-bold ${colorInfo.badge}`}>
                        {sess.subjectName}
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {sess.durationMinutes} minutes
                      </span>
                    </div>
                    {sess.notes && (
                      <p className="mt-0.5 text-slate-500 truncate">{sess.notes}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-mono text-slate-400">{sess.date}</span>
                  <button
                    onClick={() => deleteStudySession(sess.id)}
                    className="rounded-lg p-1.5 text-slate-300 hover:text-rose-600 dark:text-slate-600 dark:hover:text-rose-400 transition-colors"
                    title="Remove session log"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
