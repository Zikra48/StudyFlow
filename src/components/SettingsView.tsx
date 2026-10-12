import React, { useState } from 'react';
import {
  Settings,
  Moon,
  Sun,
  User,
  GraduationCap,
  Clock,
  RotateCcw,
  Download,
  Upload,
  Check,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';
import { useStudy } from '../context/StudyContext';

export const SettingsView: React.FC = () => {
  const {
    userSettings,
    updateSettings,
    toggleTheme,
    resetAllDataToSample,
    subjects,
    tasks,
    studySessions,
  } = useStudy();

  const [studentName, setStudentName] = useState(userSettings.studentName);
  const [university, setUniversity] = useState(userSettings.university);
  const [major, setMajor] = useState(userSettings.major);
  const [semester, setSemester] = useState(userSettings.semester);
  const [targetWeeklyHours, setTargetWeeklyHours] = useState(userSettings.targetWeeklyHours);
  const [dailyStudyHoursTarget, setDailyStudyHoursTarget] = useState(userSettings.dailyStudyHoursTarget);
  const [pomodoroFocusMinutes, setPomodoroFocusMinutes] = useState(userSettings.pomodoroFocusMinutes);
  const [pomodoroBreakMinutes, setPomodoroBreakMinutes] = useState(userSettings.pomodoroBreakMinutes);

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      studentName,
      university,
      major,
      semester,
      targetWeeklyHours: Number(targetWeeklyHours),
      dailyStudyHoursTarget: Number(dailyStudyHoursTarget),
      pomodoroFocusMinutes: Number(pomodoroFocusMinutes),
      pomodoroBreakMinutes: Number(pomodoroBreakMinutes),
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleExportData = () => {
    const backup = {
      exportDate: new Date().toISOString(),
      userSettings,
      subjects,
      tasks,
      studySessions,
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `studyflow-ai-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl space-y-6 pb-12 animate-fadeIn">
      <div>
        <h2 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Settings & Academic Preferences
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Personalize your profile, study velocity constraints, focus timers, and theme.
        </p>
      </div>

      {savedSuccess && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs font-bold text-emerald-800 dark:border-emerald-900/60 dark:bg-emerald-950/60 dark:text-emerald-300">
          <Check className="h-4 w-4" />
          <span>Preferences updated and saved successfully!</span>
        </div>
      )}

      {/* Profile Form */}
      <form onSubmit={handleSaveProfile} className="space-y-6">
        {/* Academic Profile */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
            <GraduationCap className="h-4 w-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Student Identity & University
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
                Full Name
              </label>
              <input
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
                University / Institution
              </label>
              <input
                type="text"
                value={university}
                onChange={(e) => setUniversity(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
                Degree / Major
              </label>
              <input
                type="text"
                value={major}
                onChange={(e) => setMajor(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
                Semester / Standing
              </label>
              <input
                type="text"
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
        </div>

        {/* Study Targets & Focus Timer */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3 dark:border-slate-800">
            <Clock className="h-4 w-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              Study Targets & Timer Presets
            </h3>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
                Weekly Target (Hours)
              </label>
              <input
                type="number"
                min="5"
                max="80"
                value={targetWeeklyHours}
                onChange={(e) => setTargetWeeklyHours(parseInt(e.target.value) || 20)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
                Daily Target (Hours)
              </label>
              <input
                type="number"
                min="1"
                max="16"
                value={dailyStudyHoursTarget}
                onChange={(e) => setDailyStudyHoursTarget(parseInt(e.target.value) || 4)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
                Focus Duration (Mins)
              </label>
              <input
                type="number"
                min="10"
                max="120"
                value={pomodoroFocusMinutes}
                onChange={(e) => setPomodoroFocusMinutes(parseInt(e.target.value) || 45)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-bold text-slate-700 dark:text-slate-300">
                Break Duration (Mins)
              </label>
              <input
                type="number"
                min="3"
                max="30"
                value={pomodoroBreakMinutes}
                onChange={(e) => setPomodoroBreakMinutes(parseInt(e.target.value) || 10)}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className="rounded-xl bg-indigo-600 px-5 py-2 text-xs font-bold text-white shadow-sm hover:bg-indigo-700 transition-colors"
            >
              Save Academic Settings
            </button>
          </div>
        </div>
      </form>

      {/* Appearance & Theme */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Interface Theme & Appearance
          </h3>
          <p className="text-xs text-slate-500">
            Currently using <span className="font-bold">{userSettings.theme === 'dark' ? 'Dark Mode' : 'Light Mode'}</span>
          </p>
        </div>

        <button
          onClick={toggleTheme}
          className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-bold text-slate-800 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition-colors"
        >
          {userSettings.theme === 'dark' ? (
            <>
              <Sun className="h-4 w-4 text-amber-400" />
              <span>Switch to Light Mode</span>
            </>
          ) : (
            <>
              <Moon className="h-4 w-4 text-indigo-500" />
              <span>Switch to Dark Mode</span>
            </>
          )}
        </button>
      </div>

      {/* Data Management & Sample Reset */}
      <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900 space-y-4">
        <div className="border-b border-slate-100 pb-3 dark:border-slate-800">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            Local Storage & Data Management
          </h3>
          <p className="text-xs text-slate-500">
            All subjects, tasks, logged study hours, and plans are securely retained in your browser.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleExportData}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Export Study Data (.JSON)</span>
          </button>

          <button
            onClick={() => setShowResetConfirm(true)}
            className="flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-2 text-xs font-bold text-rose-700 hover:bg-rose-100 dark:border-rose-900/60 dark:bg-rose-950/60 dark:text-rose-300 transition-colors"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Reset to Preloaded Sample Data</span>
          </button>
        </div>

        {/* Confirmation Modal */}
        {showResetConfirm && (
          <div className="rounded-xl border border-rose-300 bg-rose-50/80 p-4 dark:border-rose-900 dark:bg-rose-950/60 animate-fadeIn">
            <div className="flex items-center gap-2 text-rose-700 dark:text-rose-300 font-bold text-xs">
              <AlertCircle className="h-4 w-4" />
              <span>Confirm Reset to Sample Data?</span>
            </div>
            <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
              This will restore the original university demo dataset with Machine Learning, Cryptography, Stochastic Calculus, Portfolio Theory, and sample tasks.
            </p>
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  resetAllDataToSample();
                  setShowResetConfirm(false);
                  setStudentName(userSettings.studentName);
                }}
                className="rounded-lg bg-rose-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-rose-700"
              >
                Yes, Restore Sample Data
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
