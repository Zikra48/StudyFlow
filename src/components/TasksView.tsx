import React, { useState, useMemo } from 'react';
import {
  CheckSquare,
  Plus,
  Search,
  Filter,
  Calendar,
  Clock,
  ArrowUpDown,
  CheckCircle2,
  Circle,
  Clock3,
  Edit2,
  Trash2,
  Play,
  AlertTriangle,
} from 'lucide-react';
import { useStudy } from '../context/StudyContext';
import { Task, PriorityLevel, TaskStatus, TaskCategory } from '../types';
import { formatDaysRemaining, getSubjectColorClass } from '../utils/helpers';

interface TasksViewProps {
  onOpenTaskModal: (taskToEdit?: Task) => void;
  onOpenTimerModal: () => void;
}

export const TasksView: React.FC<TasksViewProps> = ({ onOpenTaskModal, onOpenTimerModal }) => {
  const { tasks, subjects, toggleTaskStatus, deleteTask, startTimer } = useStudy();

  const [searchQuery, setSearchQuery] = useState('');
  const [subjectFilter, setSubjectFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState<'All' | TaskStatus>('All');
  const [priorityFilter, setPriorityFilter] = useState<'All' | PriorityLevel>('All');
  const [deadlineFilter, setDeadlineFilter] = useState<'All' | 'Today' | 'ThisWeek' | 'Overdue'>('All');
  const [sortBy, setSortBy] = useState<'deadline' | 'priority' | 'hours'>('deadline');

  const filteredTasks = useMemo(() => {
    return tasks
      .filter((task) => {
        // Search
        const matchesSearch =
          task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          task.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          task.subjectName.toLowerCase().includes(searchQuery.toLowerCase());

        // Subject
        const matchesSubject = subjectFilter === 'All' || task.subjectId === subjectFilter;

        // Status
        const matchesStatus = statusFilter === 'All' || task.status === statusFilter;

        // Priority
        const matchesPriority = priorityFilter === 'All' || task.priority === priorityFilter;

        // Deadline
        const remaining = formatDaysRemaining(task.deadline);
        let matchesDeadline = true;
        if (deadlineFilter === 'Today') {
          matchesDeadline = remaining.isToday;
        } else if (deadlineFilter === 'Overdue') {
          matchesDeadline = remaining.isPast && task.status !== 'Completed';
        } else if (deadlineFilter === 'ThisWeek') {
          const targetTime = task.deadline ? new Date(task.deadline).getTime() : 0;
          const diffDays = Math.ceil(
            (targetTime - new Date().setHours(0, 0, 0, 0)) / (1000 * 3600 * 24)
          );
          matchesDeadline = diffDays >= 0 && diffDays <= 7;
        }

        return matchesSearch && matchesSubject && matchesStatus && matchesPriority && matchesDeadline;
      })
      .sort((a, b) => {
        if (sortBy === 'deadline') {
          const timeA = a.deadline ? new Date(a.deadline).getTime() : 0;
          const timeB = b.deadline ? new Date(b.deadline).getTime() : 0;
          return timeA - timeB;
        }
        if (sortBy === 'priority') {
          const pScore: Record<PriorityLevel, number> = { High: 3, Medium: 2, Low: 1 };
          return pScore[b.priority] - pScore[a.priority];
        }
        if (sortBy === 'hours') {
          return (b.estimatedHours || 0) - (a.estimatedHours || 0);
        }
        return 0;
      });
  }, [tasks, searchQuery, subjectFilter, statusFilter, priorityFilter, deadlineFilter, sortBy]);

  const activeCount = tasks.filter((t) => t.status !== 'Completed').length;
  const completedCount = tasks.filter((t) => t.status === 'Completed').length;

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* Header and Quick Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Tasks & Assignments Manager
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {activeCount} active tasks remaining • {completedCount} tasks marked complete
          </p>
        </div>

        <button
          onClick={() => onOpenTaskModal()}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-600/30 hover:bg-indigo-700 active:scale-95 transition-all w-fit"
        >
          <Plus className="h-4 w-4" />
          <span>Create New Task</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-3">
        {/* Top line: Search and Sort */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by title, description, or subject..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border-none bg-slate-50 py-2 pl-9 pr-3 text-xs text-slate-900 dark:bg-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <ArrowUpDown className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span className="text-xs font-semibold text-slate-500">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-semibold text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="deadline">Deadline (Earliest)</option>
              <option value="priority">Priority (High to Low)</option>
              <option value="hours">Estimated Time</option>
            </select>
          </div>
        </div>

        {/* Filter Dropdowns & Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          {/* Status Tabs */}
          <div className="flex items-center rounded-xl bg-slate-100 p-0.5 dark:bg-slate-800">
            {(['All', 'Not Started', 'In Progress', 'Completed'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
                  statusFilter === st
                    ? 'bg-white text-indigo-600 shadow-xs dark:bg-slate-700 dark:text-white'
                    : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Subject Filter */}
          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="All">All Subjects</option>
            {subjects.map((sub) => (
              <option key={sub.id} value={sub.id}>
                {sub.name}
              </option>
            ))}
          </select>

          {/* Priority Filter */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as any)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="All">All Priorities</option>
            <option value="High">🔴 High Priority</option>
            <option value="Medium">🟡 Medium Priority</option>
            <option value="Low">🟢 Low Priority</option>
          </select>

          {/* Deadline Filter */}
          <select
            value={deadlineFilter}
            onChange={(e) => setDeadlineFilter(e.target.value as any)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-semibold text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="All">All Deadlines</option>
            <option value="Today">Due Today</option>
            <option value="ThisWeek">Due This Week</option>
            <option value="Overdue">Overdue</option>
          </select>

          {(subjectFilter !== 'All' ||
            statusFilter !== 'All' ||
            priorityFilter !== 'All' ||
            deadlineFilter !== 'All' ||
            searchQuery) && (
            <button
              onClick={() => {
                setSubjectFilter('All');
                setStatusFilter('All');
                setPriorityFilter('All');
                setDeadlineFilter('All');
                setSearchQuery('');
              }}
              className="text-xs font-bold text-rose-600 hover:underline dark:text-rose-400 ml-auto"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* Task List */}
      {filteredTasks.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center dark:border-slate-800">
          <CheckSquare className="mx-auto h-10 w-10 text-slate-400" />
          <h3 className="mt-3 text-sm font-bold text-slate-900 dark:text-white">
            No tasks match your filters
          </h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Create a task or clear filters to see your assignments.
          </p>
          <button
            onClick={() => onOpenTaskModal()}
            className="mt-4 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white shadow-sm hover:bg-indigo-700"
          >
            Add New Task
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTasks.map((task) => {
            const isCompleted = task.status === 'Completed';
            const subject = subjects.find((s) => s.id === task.subjectId);
            const colorInfo = getSubjectColorClass(subject?.color);
            const remaining = formatDaysRemaining(task.deadline);

            return (
              <div
                key={task.id}
                className={`group flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border p-4 transition-all ${
                  isCompleted
                    ? 'border-slate-100 bg-slate-50/60 dark:border-slate-800/40 dark:bg-slate-850/40 opacity-70'
                    : 'border-slate-200/80 bg-white hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700 shadow-xs'
                }`}
              >
                {/* Left checkmark and info */}
                <div className="flex items-start gap-3.5 min-w-0">
                  <button
                    onClick={() => toggleTaskStatus(task.id)}
                    className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-lg border transition-colors ${
                      isCompleted
                        ? 'border-indigo-600 bg-indigo-600 text-white'
                        : 'border-slate-300 hover:border-indigo-500 dark:border-slate-600'
                    }`}
                  >
                    {isCompleted && <CheckCircle2 className="h-4 w-4 stroke-[3]" />}
                  </button>

                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`text-sm font-bold tracking-tight text-slate-900 dark:text-white ${
                          isCompleted ? 'line-through text-slate-400 dark:text-slate-500' : ''
                        }`}
                      >
                        {task.title}
                      </span>

                      {/* Priority Tag */}
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                          task.priority === 'High'
                            ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                            : task.priority === 'Medium'
                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                        }`}
                      >
                        {task.priority} Priority
                      </span>

                      {/* Status Tag */}
                      <span
                        className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${
                          task.status === 'Completed'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                            : task.status === 'In Progress'
                            ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                        }`}
                      >
                        {task.status}
                      </span>
                    </div>

                    {task.description && (
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
                        {task.description}
                      </p>
                    )}

                    {/* Metadata line */}
                    <div className="mt-2 flex flex-wrap items-center gap-3 text-xs">
                      <span className={`rounded-md px-2 py-0.5 font-bold ${colorInfo.badge}`}>
                        {task.subjectName}
                      </span>

                      <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 font-medium">
                        <Clock className="h-3 w-3" />
                        <span>{task.estimatedHours}h est</span>
                        {task.actualHours ? <span>({task.actualHours}h logged)</span> : null}
                      </div>

                      <div className="flex items-center gap-1 font-semibold">
                        <Calendar className="h-3 w-3 text-slate-400" />
                        <span
                          className={
                            remaining.isUrgent && !isCompleted
                              ? 'text-rose-600 dark:text-rose-400'
                              : 'text-slate-500'
                          }
                        >
                          Due: {task.deadline && typeof task.deadline === 'string' ? task.deadline.replace('T', ' ') : 'No date'} ({remaining.text})
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Action buttons */}
                <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                  {!isCompleted && (
                    <button
                      onClick={() => {
                        startTimer(task.subjectId, 45, task.id);
                        onOpenTimerModal();
                      }}
                      className="flex items-center gap-1 rounded-xl bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-700 hover:bg-indigo-100 dark:bg-indigo-950 dark:text-indigo-300 transition-colors"
                      title="Start deep study timer on this task"
                    >
                      <Play className="h-3 w-3 fill-current" />
                      <span>Focus</span>
                    </button>
                  )}

                  <button
                    onClick={() => onOpenTaskModal(task)}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
                    title="Edit Task"
                  >
                    <Edit2 className="h-4 w-4" />
                  </button>

                  <button
                    onClick={() => deleteTask(task.id)}
                    className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 transition-colors"
                    title="Delete Task"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
