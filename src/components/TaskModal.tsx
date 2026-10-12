import React, { useState, useEffect } from 'react';
import { X, CheckSquare, Calendar, Clock, AlertCircle } from 'lucide-react';
import { useStudy } from '../context/StudyContext';
import { Task, PriorityLevel, TaskStatus, TaskCategory } from '../types';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskToEdit?: Task | null;
}

export const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose, taskToEdit }) => {
  const { subjects, addTask, updateTask } = useStudy();

  const [title, setTitle] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [estimatedHours, setEstimatedHours] = useState(2);
  const [priority, setPriority] = useState<PriorityLevel>('Medium');
  const [category, setCategory] = useState<TaskCategory>('Assignment');
  const [status, setStatus] = useState<TaskStatus>('Not Started');
  const [error, setError] = useState('');

  useEffect(() => {
    if (taskToEdit) {
      setTitle(taskToEdit.title);
      setSubjectId(taskToEdit.subjectId);
      setDescription(taskToEdit.description || '');
      setDeadline(taskToEdit.deadline);
      setEstimatedHours(taskToEdit.estimatedHours || 2);
      setPriority(taskToEdit.priority);
      setCategory(taskToEdit.category);
      setStatus(taskToEdit.status);
    } else {
      setTitle('');
      setSubjectId(subjects[0]?.id || '');
      setDescription('');
      // Default deadline to tomorrow 23:59
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const pad = (n: number) => n.toString().padStart(2, '0');
      setDeadline(
        `${tomorrow.getFullYear()}-${pad(tomorrow.getMonth() + 1)}-${pad(tomorrow.getDate())}T23:59`
      );
      setEstimatedHours(2);
      setPriority('Medium');
      setCategory('Assignment');
      setStatus('Not Started');
    }
    setError('');
  }, [taskToEdit, isOpen, subjects]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a task title.');
      return;
    }
    if (!subjectId) {
      setError('Please select a subject.');
      return;
    }

    const selectedSubject = subjects.find((s) => s.id === subjectId);
    const subjectName = selectedSubject ? selectedSubject.name : 'General';

    if (taskToEdit) {
      updateTask(taskToEdit.id, {
        title: title.trim(),
        subjectId,
        subjectName,
        description: description.trim(),
        deadline,
        estimatedHours: Number(estimatedHours) || 1,
        priority,
        category,
        status,
      });
    } else {
      addTask({
        title: title.trim(),
        subjectId,
        subjectName,
        description: description.trim(),
        deadline,
        estimatedHours: Number(estimatedHours) || 1,
        priority,
        category,
        status,
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
              <CheckSquare className="h-4 w-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {taskToEdit ? 'Edit Task & Assignment' : 'Create New Task / Assignment'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && (
          <div className="mt-3 flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-2.5 text-xs font-semibold text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/60 dark:text-rose-300">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          <div>
            <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
              Task Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Problem Set 4: Elliptic Curve Logarithms"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
                Subject *
              </label>
              <select
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.difficulty})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as TaskCategory)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Assignment">Assignment / Problem Set</option>
                <option value="Exam Prep">Exam Preparation</option>
                <option value="Project">Project / Code Lab</option>
                <option value="Reading">Reading / Lecture Review</option>
                <option value="Revision">Revision & Spaced Repetition</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="mb-1 flex items-center gap-1 text-xs font-bold text-slate-700 dark:text-slate-300">
                <Calendar className="h-3.5 w-3.5 text-slate-400" />
                Deadline
              </label>
              <input
                type="datetime-local"
                required
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="mb-1 flex items-center gap-1 text-xs font-bold text-slate-700 dark:text-slate-300">
                <Clock className="h-3.5 w-3.5 text-slate-400" />
                Est. Hours
              </label>
              <input
                type="number"
                step="0.5"
                min="0.5"
                max="30"
                value={estimatedHours}
                onChange={(e) => setEstimatedHours(parseFloat(e.target.value))}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as PriorityLevel)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="High">🔴 High</option>
                <option value="Medium">🟡 Medium</option>
                <option value="Low">🟢 Low</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
              Description / Notes
            </label>
            <textarea
              rows={3}
              placeholder="Key requirements, problem numbers, lecture slide references..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {taskToEdit && (
            <div>
              <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
                Status
              </label>
              <div className="flex gap-2">
                {(['Not Started', 'In Progress', 'Completed'] as TaskStatus[]).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setStatus(st)}
                    className={`flex-1 rounded-xl py-1.5 text-xs font-bold border transition-all ${
                      status === st
                        ? 'border-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                        : 'border-slate-200 bg-white text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-indigo-600 px-5 py-2 text-xs font-bold text-white shadow-sm shadow-indigo-600/30 hover:bg-indigo-700 active:scale-95 transition-all"
            >
              {taskToEdit ? 'Save Changes' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
