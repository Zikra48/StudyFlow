import React from 'react';
import {
  Clock,
  CheckCircle2,
  Calendar,
  Sparkles,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Brain,
  ShieldCheck,
  LineChart,
  BookOpen,
  Plus,
  Play,
} from 'lucide-react';
import { useStudy } from '../context/StudyContext';
import { formatDaysRemaining, getSubjectColorClass } from '../utils/helpers';
import { NavTab } from './Sidebar';

interface DashboardViewProps {
  setActiveTab: (tab: NavTab) => void;
  onOpenTaskModal: () => void;
  onOpenSubjectModal: () => void;
  onOpenTimerModal: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  setActiveTab,
  onOpenTaskModal,
  onOpenSubjectModal,
  onOpenTimerModal,
}) => {
  const {
    subjects,
    tasks,
    todayTasks,
    upcomingAssignments,
    upcomingExams,
    totalPlannedHoursThisWeek,
    completedHoursThisWeek,
    completedTasksCount,
    totalTasksCount,
    progressPercentage,
    prioritySubjects,
    toggleTaskStatus,
    startTimer,
    aiStudyPlan,
  } = useStudy();

  const nextExam = upcomingExams[0];
  const nextExamRemaining = nextExam ? formatDaysRemaining(nextExam.examDate) : null;

  // Mock weekly day distribution for the progress chart
  const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const dailyPlannedHours = [5, 4.5, 5, 4.5, 4, 4.5, 3];
  // Calculate completed hours distributed
  const dailyCompletedHours = [4.5, 3.5, 4.0, 3.0, 2.5, 2.0, 1.0];

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 p-6 text-white shadow-xl shadow-indigo-950/20 sm:p-8">
        <div className="relative z-10 flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div className="max-w-xl space-y-2">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5 text-indigo-300" />
              <span>Smart University Academic Planner</span>
            </div>
            <h2 className="text-2xl font-extrabold tracking-tight sm:text-3xl">
              Focus on what matters today.
            </h2>
            <p className="text-sm text-indigo-100/90 leading-relaxed">
              {nextExam ? (
                <>
                  Your nearest milestone is{' '}
                  <span className="font-bold text-white underline decoration-rose-400 decoration-2">
                    {nextExam.name} Exam
                  </span>{' '}
                  ({nextExamRemaining?.text}). You have completed{' '}
                  <span className="font-bold text-white">{completedHoursThisWeek} hrs</span> of your{' '}
                  {totalPlannedHoursThisWeek} hr weekly target.
                </>
              ) : (
                'Stay ahead of assignments, schedule deep focus blocks, and prepare with Gemini AI.'
              )}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setActiveTab('planner')}
              className="flex items-center gap-2 rounded-2xl bg-white px-4 py-2.5 text-xs font-bold text-indigo-900 shadow-md hover:bg-indigo-50 active:scale-95 transition-all"
            >
              <Sparkles className="h-4 w-4 text-indigo-600" />
              <span>View AI 7-Day Plan</span>
            </button>
            <button
              onClick={onOpenTimerModal}
              className="flex items-center gap-2 rounded-2xl bg-indigo-700/60 border border-indigo-500/40 px-4 py-2.5 text-xs font-bold text-white hover:bg-indigo-700 active:scale-95 transition-all"
            >
              <Play className="h-3.5 w-3.5 fill-white" />
              <span>Start Focus Timer</span>
            </button>
          </div>
        </div>

        {/* Ambient background glow */}
        <div className="pointer-events-none absolute -right-12 -top-12 h-64 w-64 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-12 left-1/3 h-64 w-64 rounded-full bg-purple-500/20 blur-3xl" />
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Weekly Study Hours */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Weekly Study Target
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {completedHoursThisWeek}
            </span>
            <span className="text-xs font-semibold text-slate-500">
              / {totalPlannedHoursThisWeek} hrs planned
            </span>
          </div>
          <div className="mt-3">
            <div className="flex justify-between text-[11px] font-semibold text-slate-500 mb-1">
              <span>Weekly Completion</span>
              <span className="text-indigo-600 dark:text-indigo-400 font-bold">
                {progressPercentage}%
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div
                className="h-full rounded-full bg-indigo-600 transition-all duration-700"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>

        {/* Card 2: Completed Tasks */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Completed Tasks
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {completedTasksCount}
            </span>
            <span className="text-xs font-semibold text-slate-500">
              / {totalTasksCount} tasks
            </span>
          </div>
          <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
            {totalTasksCount - completedTasksCount > 0 ? (
              <span className="font-semibold text-amber-600 dark:text-amber-400">
                {totalTasksCount - completedTasksCount} tasks remaining
              </span>
            ) : (
              <span className="font-semibold text-emerald-600">All tasks completed!</span>
            )}
          </p>
        </div>

        {/* Card 3: Upcoming Assignments */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Upcoming Assignments
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-600 dark:bg-purple-950/60 dark:text-purple-400">
              <Calendar className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
              {upcomingAssignments.length}
            </span>
            <span className="text-xs font-semibold text-slate-500">active deadlines</span>
          </div>
          <p className="mt-3 text-xs text-slate-500 dark:text-slate-400 truncate">
            {upcomingAssignments[0] ? (
              <>
                Next: <span className="font-semibold">{upcomingAssignments[0].title}</span>
              </>
            ) : (
              'No pending assignments'
            )}
          </p>
        </div>

        {/* Card 4: Upcoming Exam Alert */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900 transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Upcoming Exam
            </span>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/60 dark:text-rose-400">
              <AlertTriangle className="h-4 w-4" />
            </div>
          </div>
          {nextExam ? (
            <>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-xl font-extrabold text-rose-600 dark:text-rose-400 truncate">
                  {nextExam.name}
                </span>
              </div>
              <div className="mt-3 flex items-center justify-between text-xs">
                <span className="rounded-md bg-rose-100 px-2 py-0.5 font-extrabold text-rose-700 dark:bg-rose-950 dark:text-rose-300">
                  {nextExamRemaining?.text}
                </span>
                <span className="text-slate-500 font-medium">{nextExam.difficulty} level</span>
              </div>
            </>
          ) : (
            <div className="mt-3 text-xs text-slate-500">No exams scheduled</div>
          )}
        </div>
      </div>

      {/* Weekly Progress Chart & Quick AI Plan Overview */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Weekly Progress Chart */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 lg:col-span-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4 dark:border-slate-800">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Weekly Study Progress
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Planned study hours vs actual logged hours this week
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <div className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-sm bg-slate-200 dark:bg-slate-700" />
                <span className="text-slate-600 dark:text-slate-400">Target</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded-sm bg-indigo-600" />
                <span className="text-indigo-600 dark:text-indigo-400">Completed</span>
              </div>
            </div>
          </div>

          {/* Bar Chart Visualizer */}
          <div className="mt-6 flex h-48 items-end justify-between gap-2 sm:gap-4 px-2">
            {daysOfWeek.map((day, idx) => {
              const target = dailyPlannedHours[idx];
              const completed = dailyCompletedHours[idx];
              const maxHeight = 6; // 6 hours scale
              const targetHeightPercent = Math.min(100, (target / maxHeight) * 100);
              const completedHeightPercent = Math.min(100, (completed / maxHeight) * 100);

              return (
                <div key={day} className="flex flex-1 flex-col items-center gap-2 group">
                  <div className="relative flex w-full max-w-[38px] h-38 items-end justify-center rounded-xl bg-slate-50 p-1 dark:bg-slate-800/50">
                    {/* Target Bar Ghost */}
                    <div
                      className="absolute bottom-1 w-full max-w-[28px] rounded-lg bg-slate-200/90 dark:bg-slate-700/60 transition-all"
                      style={{ height: `${targetHeightPercent}%` }}
                      title={`Target: ${target}h`}
                    />
                    {/* Completed Bar */}
                    <div
                      className="relative z-10 w-full max-w-[28px] rounded-lg bg-indigo-600 shadow-xs group-hover:bg-indigo-500 transition-all duration-300"
                      style={{ height: `${completedHeightPercent}%` }}
                      title={`Completed: ${completed}h / Target: ${target}h`}
                    />
                  </div>
                  <div className="text-center">
                    <span className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                      {day}
                    </span>
                    <span className="block text-[10px] text-slate-400">{completed}h</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Priority Subjects Widget */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Priority Subjects
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Ranked by difficulty & exam proximity
              </p>
            </div>
            <button
              onClick={() => setActiveTab('subjects')}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
            >
              All Courses
            </button>
          </div>

          <div className="mt-4 space-y-3.5">
            {prioritySubjects.slice(0, 4).map((sub) => {
              const colorInfo = getSubjectColorClass(sub.color);
              const remaining = formatDaysRemaining(sub.examDate);
              const subProgress = Math.min(
                100,
                Math.round((sub.completedHoursThisWeek / sub.weeklyTargetHours) * 100)
              );

              return (
                <div
                  key={sub.id}
                  className="rounded-xl border border-slate-100 p-3 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`h-2.5 w-2.5 rounded-full ${colorInfo.dot}`} />
                      <span className="text-xs font-bold text-slate-900 dark:text-white">
                        {sub.name}
                      </span>
                    </div>
                    <span
                      className={`rounded-md px-1.5 py-0.5 text-[10px] font-extrabold ${
                        sub.difficulty === 'Hard'
                          ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                          : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                      }`}
                    >
                      {sub.difficulty}
                    </span>
                  </div>

                  <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
                    <span>
                      {sub.completedHoursThisWeek} / {sub.weeklyTargetHours} hrs target
                    </span>
                    <span className="font-semibold text-rose-600 dark:text-rose-400">
                      Exam in {remaining.text}
                    </span>
                  </div>

                  <div className="mt-1.5 h-1.5 w-full rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className={`h-full rounded-full ${colorInfo.bg}`}
                      style={{ width: `${subProgress}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main 2-Column Section: Today's Tasks vs Upcoming Exams & Deadlines */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left 2 Cols: Today's Study Tasks & Urgent Assignments */}
        <div className="space-y-6 lg:col-span-2">
          {/* Today's Tasks */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">
                    Today&apos;s Study Tasks
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Tasks scheduled or due today
                  </p>
                </div>
              </div>
              <button
                onClick={onOpenTaskModal}
                className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>Add Task</span>
              </button>
            </div>

            <div className="mt-4 space-y-2.5">
              {tasks.slice(0, 4).map((task) => {
                const isDone = task.status === 'Completed';
                const subject = subjects.find((s) => s.id === task.subjectId);
                const colorInfo = getSubjectColorClass(subject?.color);
                const remaining = formatDaysRemaining(task.deadline);

                return (
                  <div
                    key={task.id}
                    className={`flex items-center justify-between gap-3 rounded-xl border p-3 transition-all ${
                      isDone
                        ? 'border-slate-100 bg-slate-50/60 dark:border-slate-800/40 dark:bg-slate-850/40 opacity-75'
                        : 'border-slate-200/80 bg-white dark:border-slate-800 dark:bg-slate-900 hover:border-indigo-300 dark:hover:border-indigo-800'
                    }`}
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <button
                        onClick={() => toggleTaskStatus(task.id)}
                        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors ${
                          isDone
                            ? 'border-indigo-600 bg-indigo-600 text-white'
                            : 'border-slate-300 hover:border-indigo-500 dark:border-slate-600'
                        }`}
                      >
                        {isDone && <CheckCircle2 className="h-4 w-4 stroke-[3]" />}
                      </button>

                      <div className="min-w-0">
                        <div
                          className={`text-xs font-bold text-slate-900 dark:text-white truncate ${
                            isDone ? 'line-through text-slate-400 dark:text-slate-500' : ''
                          }`}
                        >
                          {task.title}
                        </div>
                        <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px]">
                          <span
                            className={`rounded px-1.5 py-0.2 font-semibold ${colorInfo.badge}`}
                          >
                            {task.subjectName}
                          </span>
                          <span className="text-slate-400">•</span>
                          <span className="text-slate-500 font-medium">
                            {task.estimatedHours}h est
                          </span>
                          <span className="text-slate-400">•</span>
                          <span
                            className={`font-semibold ${
                              remaining.isUrgent
                                ? 'text-rose-600 dark:text-rose-400'
                                : 'text-slate-500'
                            }`}
                          >
                            Due {remaining.text}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {!isDone && (
                        <button
                          onClick={() => {
                            startTimer(task.subjectId, 45, task.id);
                            onOpenTimerModal();
                          }}
                          className="flex items-center gap-1 rounded-lg border border-indigo-200 bg-indigo-50 px-2 py-1 text-[11px] font-bold text-indigo-700 hover:bg-indigo-100 dark:border-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 transition-colors"
                          title="Start focus timer on this task"
                        >
                          <Play className="h-3 w-3 fill-current" />
                          <span className="hidden sm:inline">Focus</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}

              <div className="pt-2 text-center">
                <button
                  onClick={() => setActiveTab('tasks')}
                  className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
                >
                  <span>View All Tasks & Filter Deadlines</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Upcoming Exams & Quick AI Strategy Tip */}
        <div className="space-y-6">
          {/* Upcoming Exams Card */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-400">
                  <AlertTriangle className="h-4 w-4" />
                </div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Upcoming Exams
                </h3>
              </div>
              <button
                onClick={() => setActiveTab('calendar')}
                className="text-xs font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
              >
                Calendar
              </button>
            </div>

            <div className="mt-4 space-y-3">
              {upcomingExams.slice(0, 3).map((exam) => {
                const remaining = formatDaysRemaining(exam.examDate);
                const colorInfo = getSubjectColorClass(exam.color);

                return (
                  <div
                    key={exam.id}
                    className="rounded-xl border border-slate-100 p-3.5 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-bold text-xs text-slate-900 dark:text-white">
                        <span className={`h-2.5 w-2.5 rounded-full ${colorInfo.dot}`} />
                        <span>{exam.name}</span>
                      </div>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                          remaining.isUrgent
                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}
                      >
                        {remaining.text}
                      </span>
                    </div>

                    <div className="mt-1.5 text-[11px] text-slate-500">
                      Instructor: <span className="font-medium text-slate-700 dark:text-slate-300">{exam.instructor}</span>
                    </div>

                    {exam.notes && (
                      <p className="mt-2 text-[11px] text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 p-2 rounded-lg line-clamp-2 italic">
                        &ldquo;{exam.notes}&rdquo;
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* AI Advisor Quick Box */}
          <div className="rounded-2xl border border-indigo-200/80 bg-gradient-to-br from-indigo-50/80 via-white to-violet-50/50 p-5 dark:border-indigo-900/40 dark:from-slate-900 dark:to-indigo-950/30">
            <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400">
              <Sparkles className="h-4 w-4" />
              <span className="text-xs font-bold uppercase tracking-wider">AI Study Recommendation</span>
            </div>
            <p className="mt-2 text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
              &ldquo;{aiStudyPlan?.keyFocusAlert || 'Prioritize Cryptography proofs during morning hours, and save code implementation for afternoon focus blocks.'}&rdquo;
            </p>
            <button
              onClick={() => setActiveTab('assistant')}
              className="mt-3 flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
            >
              <span>Ask Study Assistant</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
