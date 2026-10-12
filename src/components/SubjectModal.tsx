import React, { useState, useEffect } from 'react';
import { X, BookOpen, AlertCircle } from 'lucide-react';
import { useStudy } from '../context/StudyContext';
import { Subject, DifficultyLevel } from '../types';

interface SubjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  subjectToEdit?: Subject | null;
}

export const SubjectModal: React.FC<SubjectModalProps> = ({
  isOpen,
  onClose,
  subjectToEdit,
}) => {
  const { addSubject, updateSubject } = useStudy();

  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [instructor, setInstructor] = useState('');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('Medium');
  const [weeklyTargetHours, setWeeklyTargetHours] = useState(8);
  const [examDate, setExamDate] = useState('');
  const [notes, setNotes] = useState('');
  const [color, setColor] = useState('indigo');
  const [error, setError] = useState('');

  const colors = [
    { id: 'indigo', label: 'Indigo', bg: 'bg-indigo-500' },
    { id: 'purple', label: 'Purple', bg: 'bg-purple-500' },
    { id: 'rose', label: 'Rose', bg: 'bg-rose-500' },
    { id: 'amber', label: 'Amber', bg: 'bg-amber-500' },
    { id: 'emerald', label: 'Emerald', bg: 'bg-emerald-500' },
    { id: 'cyan', label: 'Cyan', bg: 'bg-cyan-500' },
  ];

  useEffect(() => {
    if (subjectToEdit) {
      setName(subjectToEdit.name);
      setCode(subjectToEdit.code || '');
      setInstructor(subjectToEdit.instructor);
      setDifficulty(subjectToEdit.difficulty);
      setWeeklyTargetHours(subjectToEdit.weeklyTargetHours || 8);
      setExamDate(subjectToEdit.examDate);
      setNotes(subjectToEdit.notes || '');
      setColor(subjectToEdit.color || 'indigo');
    } else {
      setName('');
      setCode('');
      setInstructor('');
      setDifficulty('Medium');
      setWeeklyTargetHours(8);
      // Default exam date in 2 weeks
      const d = new Date();
      d.setDate(d.getDate() + 14);
      setExamDate(d.toISOString().split('T')[0]);
      setNotes('');
      setColor('indigo');
    }
    setError('');
  }, [subjectToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please provide a subject name.');
      return;
    }
    if (!instructor.trim()) {
      setError('Please provide instructor name.');
      return;
    }
    if (!examDate) {
      setError('Please select an exam date.');
      return;
    }

    if (subjectToEdit) {
      updateSubject(subjectToEdit.id, {
        name: name.trim(),
        code: code.trim() || undefined,
        instructor: instructor.trim(),
        difficulty,
        weeklyTargetHours: Number(weeklyTargetHours) || 6,
        examDate,
        notes: notes.trim(),
        color,
      });
    } else {
      addSubject({
        name: name.trim(),
        code: code.trim() || undefined,
        instructor: instructor.trim(),
        difficulty,
        weeklyTargetHours: Number(weeklyTargetHours) || 6,
        examDate,
        notes: notes.trim(),
        color,
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
              <BookOpen className="h-4 w-4" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {subjectToEdit ? 'Edit Subject' : 'Add New Subject'}
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
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
                Subject Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Stochastic Calculus"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
                Code (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. MATH 5120"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
                Instructor / Professor *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Dr. David Chen"
                value={instructor}
                onChange={(e) => setInstructor(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
                Difficulty Level
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as DifficultyLevel)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Easy">🟢 Easy</option>
                <option value="Medium">🟡 Medium</option>
                <option value="Hard">🔴 Hard (High Focus)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
                Weekly Target (Hours)
              </label>
              <input
                type="number"
                step="1"
                min="1"
                max="40"
                value={weeklyTargetHours}
                onChange={(e) => setWeeklyTargetHours(parseInt(e.target.value) || 1)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
                Final Exam Date *
              </label>
              <input
                type="date"
                required
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Color theme selection */}
          <div>
            <label className="mb-1.5 block text-xs font-bold text-slate-700 dark:text-slate-300">
              Badge & Accent Color
            </label>
            <div className="flex gap-2">
              {colors.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setColor(c.id)}
                  className={`flex h-7 w-7 items-center justify-center rounded-lg ${c.bg} transition-all ${
                    color === c.id ? 'ring-2 ring-slate-900 dark:ring-white scale-110' : 'opacity-70 hover:opacity-100'
                  }`}
                  title={c.label}
                />
              ))}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
              Custom Notes & Syllabus Highlights
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Focus on Itô's Lemma derivations, Martingales, and Black-Scholes PDE..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

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
              {subjectToEdit ? 'Save Changes' : 'Add Subject'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
