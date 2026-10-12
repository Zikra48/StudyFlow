// Color theme mapping for subject badges and accents
export const getSubjectColorClass = (colorName: string = 'indigo') => {
  const map: Record<string, { bg: string; text: string; border: string; ring: string; badge: string; dot: string; lightBg: string }> = {
    indigo: {
      bg: 'bg-indigo-600',
      lightBg: 'bg-indigo-50 dark:bg-indigo-950/40',
      text: 'text-indigo-600 dark:text-indigo-400',
      border: 'border-indigo-200 dark:border-indigo-800/60',
      ring: 'ring-indigo-500/30',
      badge: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
      dot: 'bg-indigo-500',
    },
    purple: {
      bg: 'bg-purple-600',
      lightBg: 'bg-purple-50 dark:bg-purple-950/40',
      text: 'text-purple-600 dark:text-purple-400',
      border: 'border-purple-200 dark:border-purple-800/60',
      ring: 'ring-purple-500/30',
      badge: 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-800',
      dot: 'bg-purple-500',
    },
    rose: {
      bg: 'bg-rose-600',
      lightBg: 'bg-rose-50 dark:bg-rose-950/40',
      text: 'text-rose-600 dark:text-rose-400',
      border: 'border-rose-200 dark:border-rose-800/60',
      ring: 'ring-rose-500/30',
      badge: 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800',
      dot: 'bg-rose-500',
    },
    amber: {
      bg: 'bg-amber-600',
      lightBg: 'bg-amber-50 dark:bg-amber-950/40',
      text: 'text-amber-600 dark:text-amber-400',
      border: 'border-amber-200 dark:border-amber-800/60',
      ring: 'ring-amber-500/30',
      badge: 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800',
      dot: 'bg-amber-500',
    },
    emerald: {
      bg: 'bg-emerald-600',
      lightBg: 'bg-emerald-50 dark:bg-emerald-950/40',
      text: 'text-emerald-600 dark:text-emerald-400',
      border: 'border-emerald-200 dark:border-emerald-800/60',
      ring: 'ring-emerald-500/30',
      badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
      dot: 'bg-emerald-500',
    },
    cyan: {
      bg: 'bg-cyan-600',
      lightBg: 'bg-cyan-50 dark:bg-cyan-950/40',
      text: 'text-cyan-600 dark:text-cyan-400',
      border: 'border-cyan-200 dark:border-cyan-800/60',
      ring: 'ring-cyan-500/30',
      badge: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-950/60 dark:text-cyan-300 border-cyan-200 dark:border-cyan-800',
      dot: 'bg-cyan-500',
    },
    blue: {
      bg: 'bg-blue-600',
      lightBg: 'bg-blue-50 dark:bg-blue-950/40',
      text: 'text-blue-600 dark:text-blue-400',
      border: 'border-blue-200 dark:border-blue-800/60',
      ring: 'ring-blue-500/30',
      badge: 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800',
      dot: 'bg-blue-500',
    },
  };

  return map[colorName] || map.indigo;
};

export const formatDaysRemaining = (targetDateStr?: string): { text: string; isUrgent: boolean; isToday: boolean; isPast: boolean } => {
  if (!targetDateStr) return { text: 'No date', isUrgent: false, isToday: false, isPast: false };
  const target = new Date(targetDateStr);
  if (isNaN(target.getTime())) return { text: 'No date', isUrgent: false, isToday: false, isPast: false };
  const now = new Date();
  // Strip time for exact date calculation
  target.setHours(0, 0, 0, 0);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  const diffTime = target.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return { text: 'Today', isUrgent: true, isToday: true, isPast: false };
  if (diffDays === 1) return { text: 'Tomorrow', isUrgent: true, isToday: false, isPast: false };
  if (diffDays < 0) return { text: `${Math.abs(diffDays)}d overdue`, isUrgent: true, isToday: false, isPast: true };
  if (diffDays <= 7) return { text: `${diffDays} days left`, isUrgent: true, isToday: false, isPast: false };
  return { text: `${diffDays} days left`, isUrgent: false, isToday: false, isPast: false };
};

export const formatTimeSlot = (minutes: number): string => {
  const hrs = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hrs > 0 && mins > 0) return `${hrs}h ${mins}m`;
  if (hrs > 0) return `${hrs} hr${hrs > 1 ? 's' : ''}`;
  return `${mins} mins`;
};

// Web Audio synthesizer chime for Pomodoro completion
export const playCompletionChime = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.12);
      gain.gain.setValueAtTime(0.15, ctx.currentTime + i * 0.12);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.12 + 0.3);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime + i * 0.12);
      osc.stop(ctx.currentTime + i * 0.12 + 0.3);
    });
  } catch (e) {
    // Audio might be blocked by browser policy until user gesture
  }
};
