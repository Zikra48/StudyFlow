import React, { useState } from 'react';
import {
  BookOpen,
  Plus,
  Search,
  Calendar,
  Clock,
  User,
  Edit2,
  Trash2,
  Play,
  FileText,
  AlertCircle,
} from 'lucide-react';
import { useStudy } from '../context/StudyContext';
import { Subject, DifficultyLevel } from '../types';
import { formatDaysRemaining, getSubjectColorClass } from '../utils/helpers';

interface SubjectsViewProps {
  onOpenSubjectModal: (subjectToEdit?: Subject) => void;
  onOpenTimerModal: () => void;
}

export const SubjectsView: React.FC<SubjectsViewProps> = ({
  onOpenSubjectModal,
  onOpenTimerModal,
}) => {
  const { subjects, tasks, deleteSubject, startTimer } = useStudy();

  const [searchQuery, setSearchQuery] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<'All' | DifficultyLevel>('All');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const filteredSubjects = subjects.filter((s) => {
    const matchesSearch =
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.instructor.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (s.code && s.code.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesDifficulty =
      difficultyFilter === 'All' || s.difficulty === difficultyFilter;
    return matchesSearch && matchesDifficulty;
  });

  const handleDelete = (id: string) => {
    deleteSubject(id);
    setDeleteConfirmId(null);
  };

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      {/* Top Controls Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Academic Courses & Subjects
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Manage your university course load, instructors, difficulty tiers, and target hours.
          </p>
        </div>

        <button
          onClick={() => onOpenSubjectModal()}
          className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-indigo-600/30 hover:bg-indigo-700 active:scale-95 transition-all w-fit"
        >
          <Plus className="h-4 w-4" />
          <span>Add New Subject</span>
        </button>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-slate-200/80 bg-white p-3 shadow-xs dark:border-slate-800 dark:bg-slate-900">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search subjects, instructors, or course codes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border-none bg-slate-50 py-2 pl-9 pr-3 text-xs text-slate-900 dark:bg-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Difficulty Filter Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto">
          {(['All', 'Easy', 'Medium', 'Hard'] as const).map((diff) => (
            <button
              key={diff}
              onClick={() => setDifficultyFilter(diff)}
              className={`rounded-xl px-3 py-1.5 text-xs font-bold transition-all whitespace-nowrap ${
                difficultyFilter === diff
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
              }`}
            >
              {diff}
            </button>
          ))}
        </div>
      </div>

      {/* Subjects Grid */}
      {filteredSubjects.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center dark:border-slate-800">
          <BookOpen className="mx-auto h-10 w-10 text-slate-400" />
          <h3 className="mt-3 text-sm font-bold text-slate-900 dark:text-white">
            No subjects match your criteria
          </h3>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Try adjusting your search terms or add a new subject to track.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filteredSubjects.map((subject) => {
            const colorInfo = getSubjectColorClass(subject.color);
            const remaining = formatDaysRemaining(subject.examDate);
            const activeTasks = tasks.filter(
              (t) => t.subjectId === subject.id && t.status !== 'Completed'
            );
            const completedTasks = tasks.filter(
              (t) => t.subjectId === subject.id && t.status === 'Completed'
            );
            const progress = Math.min(
              100,
              Math.round((subject.completedHoursThisWeek / subject.weeklyTargetHours) * 100)
            );

            return (
              <div
                key={subject.id}
                className="group relative flex flex-col justify-between rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs transition-all hover:border-slate-300 hover:shadow-md dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700"
              >
                <div>
                  {/* Top Bar: Subject Badge & Actions */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        {subject.code && (
                          <span className="rounded bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                            {subject.code}
                          </span>
                        )}
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-extrabold ${
                            subject.difficulty === 'Hard'
                              ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                              : subject.difficulty === 'Medium'
                              ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                              : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                          }`}
                        >
                          {subject.difficulty}
                        </span>
                      </div>
                      <h3 className="mt-2 text-base font-extrabold text-slate-900 dark:text-white">
                        {subject.name}
                      </h3>
                    </div>

                    <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => onOpenSubjectModal(subject)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-slate-800 dark:hover:text-slate-200 transition-colors"
                        title="Edit Subject"
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(subject.id)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 transition-colors"
                        title="Delete Subject"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Instructor */}
                  <div className="mt-2 flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <User className="h-3.5 w-3.5 text-slate-400" />
                    <span>{subject.instructor}</span>
                  </div>

                  {/* Exam Date Tag */}
                  <div className="mt-3.5 flex items-center justify-between rounded-xl bg-slate-50 p-2.5 dark:bg-slate-800/60">
                    <div className="flex items-center gap-1.5 text-xs">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      <span className="text-slate-600 dark:text-slate-300 font-medium">Final Exam</span>
                    </div>
                    <span
                      className={`text-xs font-bold ${
                        remaining.isUrgent
                          ? 'text-rose-600 dark:text-rose-400'
                          : 'text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      {remaining.text} ({subject.examDate})
                    </span>
                  </div>

                  {/* Target Study Hours Progress */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs font-semibold">
                      <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300">
                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                        <span>Weekly Hours</span>
                      </div>
                      <span className="text-slate-900 dark:text-white font-bold">
                        {subject.completedHoursThisWeek} / {subject.weeklyTargetHours} hrs ({progress}%)
                      </span>
                    </div>
                    <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${colorInfo.bg}`}
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Notes / Syllabus Focus */}
                  {subject.notes && (
                    <div className="mt-3.5 rounded-xl border border-slate-100 bg-slate-50/50 p-2.5 dark:border-slate-800 dark:bg-slate-850/50">
                      <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500 dark:text-slate-400">
                        <FileText className="h-3 w-3" />
                        <span>Syllabus Highlights</span>
                      </div>
                      <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                        {subject.notes}
                      </p>
                    </div>
                  )}
                </div>

                {/* Bottom Card Actions: Active Tasks & Start Focus */}
                <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-800">
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {activeTasks.length}
                    </span>{' '}
                    pending • {completedTasks.length} done
                  </span>

                  <button
                    onClick={() => {
                      startTimer(subject.id, 45);
                      onOpenTimerModal();
                    }}
                    className="flex items-center gap-1.5 rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-indigo-600 hover:text-white dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-indigo-600 dark:hover:text-white transition-all active:scale-95"
                  >
                    <Play className="h-3 w-3 fill-current" />
                    <span>Study Now</span>
                  </button>
                </div>

                {/* Delete Confirmation Overlay */}
                {deleteConfirmId === subject.id && (
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center rounded-2xl bg-white/95 p-4 text-center dark:bg-slate-900/95 backdrop-blur-xs">
                    <AlertCircle className="h-8 w-8 text-rose-500" />
                    <h4 className="mt-2 text-sm font-bold text-slate-900 dark:text-white">
                      Delete &ldquo;{subject.name}&rdquo;?
                    </h4>
                    <p className="mt-1 text-xs text-slate-500">
                      This will remove the course and its tracking history.
                    </p>
                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={() => setDeleteConfirmId(null)}
                        className="rounded-lg border border-slate-200 px-3 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleDelete(subject.id)}
                        className="rounded-lg bg-rose-600 px-3 py-1 text-xs font-bold text-white hover:bg-rose-700"
                      >
                        Confirm Delete
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
