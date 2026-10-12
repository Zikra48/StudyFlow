import React, { useState } from 'react';
import {
  X,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Sparkles,
  Volume2,
  VolumeX,
  BookOpen,
  CheckSquare,
} from 'lucide-react';
import { useStudy } from '../context/StudyContext';
import { playCompletionChime } from '../utils/helpers';

interface FocusTimerModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FocusTimerModal: React.FC<FocusTimerModalProps> = ({ isOpen, onClose }) => {
  const {
    subjects,
    tasks,
    activeTimer,
    resumeTimer,
    pauseTimer,
    resetTimer,
    stopAndLogTimer,
    startTimer,
    setTimerMode,
  } = useStudy();

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [selectedSubjectId, setSelectedSubjectId] = useState(
    activeTimer.subjectId || subjects[0]?.id || ''
  );
  const [selectedTaskId, setSelectedTaskId] = useState(activeTimer.taskId || '');
  const [sessionNotes, setSessionNotes] = useState('');

  if (!isOpen) return null;

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress =
    activeTimer.initialDuration > 0
      ? ((activeTimer.initialDuration - activeTimer.timeLeft) / activeTimer.initialDuration) * 100
      : 0;

  const handleStartFocusPreset = (minutes: number) => {
    setTimerMode('focus', minutes);
    startTimer(selectedSubjectId, minutes, selectedTaskId || undefined);
  };

  const handleStartBreakPreset = (minutes: number) => {
    setTimerMode('break', minutes);
  };

  const handleCompleteAndLog = () => {
    if (soundEnabled) playCompletionChime();
    stopAndLogTimer(sessionNotes);
    onClose();
  };

  const activeSubject = subjects.find((s) => s.id === (selectedSubjectId || activeTimer.subjectId));
  const activeTasksForSubject = tasks.filter(
    (t) => t.status !== 'Completed' && (!selectedSubjectId || t.subjectId === selectedSubjectId)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-800 dark:bg-slate-900">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-white">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                StudyFlow Deep Focus
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Cognitive flow state timer for university problem sets & exams
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? 'Mute Chime' : 'Enable Chime'}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            </button>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Mode Selector */}
        <div className="mt-4 flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
          <button
            onClick={() => setTimerMode('focus', 45)}
            className={`flex-1 rounded-lg py-1.5 text-xs font-bold transition-all ${
              activeTimer.mode === 'focus'
                ? 'bg-white text-indigo-600 shadow-sm dark:bg-slate-700 dark:text-white'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
            }`}
          >
            Deep Focus Mode
          </button>
          <button
            onClick={() => setTimerMode('break', 10)}
            className={`flex-1 rounded-lg py-1.5 text-xs font-bold transition-all ${
              activeTimer.mode === 'break'
                ? 'bg-white text-emerald-600 shadow-sm dark:bg-slate-700 dark:text-white'
                : 'text-slate-500 hover:text-slate-800 dark:text-slate-400'
            }`}
          >
            Cognitive Break
          </button>
        </div>

        {/* Presets */}
        <div className="mt-3 flex justify-center gap-2">
          {activeTimer.mode === 'focus' ? (
            <>
              {[25, 45, 60, 90].map((mins) => (
                <button
                  key={mins}
                  onClick={() => handleStartFocusPreset(mins)}
                  className={`rounded-lg px-3 py-1 text-xs font-semibold border transition-all ${
                    activeTimer.initialDuration === mins * 60
                      ? 'border-indigo-600 bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  {mins} min
                </button>
              ))}
            </>
          ) : (
            <>
              {[5, 10, 15, 20].map((mins) => (
                <button
                  key={mins}
                  onClick={() => handleStartBreakPreset(mins)}
                  className={`rounded-lg px-3 py-1 text-xs font-semibold border transition-all ${
                    activeTimer.initialDuration === mins * 60
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300'
                  }`}
                >
                  {mins} min
                </button>
              ))}
            </>
          )}
        </div>

        {/* Circular / Digital Display */}
        <div className="my-6 flex flex-col items-center justify-center">
          <div className="relative flex h-52 w-52 items-center justify-center rounded-full border-8 border-slate-100 dark:border-slate-800 shadow-inner">
            <svg className="absolute inset-0 h-full w-full -rotate-90">
              <circle
                cx="96"
                cy="96"
                r="88"
                className="stroke-current text-transparent"
                strokeWidth="8"
                fill="none"
              />
              <circle
                cx="96"
                cy="96"
                r="88"
                className={`stroke-current ${
                  activeTimer.mode === 'focus' ? 'text-indigo-600' : 'text-emerald-500'
                } transition-all duration-500`}
                strokeWidth="8"
                strokeDasharray="552"
                strokeDashoffset={552 - (552 * progress) / 100}
                strokeLinecap="round"
                fill="none"
              />
            </svg>

            <div className="text-center z-10">
              <div className="font-mono text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                {formatTimer(activeTimer.timeLeft)}
              </div>
              <div className="mt-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
                {activeTimer.mode === 'focus' ? 'Focus Session' : 'Rest & Recharge'}
              </div>
              {activeSubject && (
                <div className="mt-2 inline-flex items-center gap-1 rounded-md bg-indigo-50 px-2 py-0.5 text-[11px] font-bold text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                  {activeSubject.name}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={resetTimer}
            className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 shadow-xs transition-colors"
            title="Reset Timer"
          >
            <RotateCcw className="h-4 w-4" />
          </button>

          <button
            onClick={() => (activeTimer.isRunning ? pauseTimer() : resumeTimer())}
            className={`flex h-13 w-28 items-center justify-center gap-2 rounded-2xl font-bold text-white shadow-md transition-all active:scale-95 ${
              activeTimer.mode === 'focus'
                ? 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-600/30'
                : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/30'
            }`}
          >
            {activeTimer.isRunning ? (
              <>
                <Pause className="h-5 w-5" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="h-5 w-5 fill-current" />
                <span>Start</span>
              </>
            )}
          </button>

          <button
            onClick={handleCompleteAndLog}
            className="flex h-11 items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 px-3.5 text-xs font-bold text-emerald-700 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 transition-colors"
            title="Log session to subject study hours"
          >
            <CheckCircle2 className="h-4 w-4" />
            <span>Finish & Log</span>
          </button>
        </div>

        {/* Subject & Task Link */}
        <div className="mt-5 space-y-2 border-t border-slate-100 pt-4 dark:border-slate-800">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="mb-1 flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <BookOpen className="h-3 w-3" />
                Subject
              </label>
              <select
                value={selectedSubjectId}
                onChange={(e) => {
                  setSelectedSubjectId(e.target.value);
                  startTimer(e.target.value, Math.round(activeTimer.timeLeft / 60));
                }}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {subjects.map((sub) => (
                  <option key={sub.id} value={sub.id}>
                    {sub.name} ({sub.difficulty})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 flex items-center gap-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <CheckSquare className="h-3 w-3" />
                Linked Task (Optional)
              </label>
              <select
                value={selectedTaskId}
                onChange={(e) => setSelectedTaskId(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-semibold text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">None / General Study</option>
                {activeTasksForSubject.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <input
              type="text"
              placeholder="Session note: e.g. Finished problem set questions 1 to 3..."
              value={sessionNotes}
              onChange={(e) => setSessionNotes(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-800 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
