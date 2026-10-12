import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  Subject,
  Task,
  StudySession,
  AiStudyPlan,
  ChatMessage,
  UserSettings,
  CalendarEvent,
  TaskStatus,
} from '../types';
import {
  initialSubjects,
  initialTasks,
  initialStudySessions,
  initialAiStudyPlan,
  initialChatMessages,
  initialUserSettings,
} from '../data/initialData';

interface GeneratePlanParams {
  dailyHours?: number;
  maxDailyHours?: number;
  sessionLength?: number;
  weekendIntense?: boolean;
  customGoal?: string;
}

interface ActiveTimerState {
  isRunning: boolean;
  mode: 'focus' | 'break';
  timeLeft: number; // in seconds
  initialDuration: number;
  subjectId: string;
  taskId?: string;
}

interface StudyContextType {
  // State
  subjects: Subject[];
  tasks: Task[];
  studySessions: StudySession[];
  aiStudyPlan: AiStudyPlan | null;
  chatMessages: ChatMessage[];
  userSettings: UserSettings;
  activeTimer: ActiveTimerState;
  loadingPlan: boolean;
  planError: string | null;
  assistantLoading: boolean;
  assistantError: string | null;

  // Subjects actions
  addSubject: (subject: Omit<Subject, 'id' | 'completedHoursThisWeek'>) => void;
  updateSubject: (id: string, updates: Partial<Subject>) => void;
  deleteSubject: (id: string) => void;

  // Tasks actions
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTaskStatus: (id: string) => void;

  // Study Session actions
  logStudySession: (session: Omit<StudySession, 'id' | 'timestamp'>) => void;
  deleteStudySession: (id: string) => void;

  // Timer actions
  startTimer: (subjectId: string, durationMinutes?: number, taskId?: string) => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  resetTimer: () => void;
  stopAndLogTimer: (notes?: string) => void;
  setTimerMode: (mode: 'focus' | 'break', minutes?: number) => void;

  // AI Planner actions
  generateAiStudyPlan: (params?: GeneratePlanParams) => Promise<boolean>;
  togglePlanSessionCompleted: (sessionId: string) => void;
  applyPlanToCalendarAsTasks: () => void;

  // Assistant actions
  sendAssistantMessage: (text: string) => Promise<void>;
  clearAssistantHistory: () => void;

  // Settings & Theme
  updateSettings: (newSettings: Partial<UserSettings>) => void;
  toggleTheme: () => void;
  resetAllDataToSample: () => void;

  // Computed metrics
  todayTasks: Task[];
  upcomingAssignments: Task[];
  upcomingExams: Subject[];
  totalPlannedHoursThisWeek: number;
  completedHoursThisWeek: number;
  completedTasksCount: number;
  totalTasksCount: number;
  progressPercentage: number;
  prioritySubjects: Subject[];
  calendarEvents: CalendarEvent[];
}

const STORAGE_KEYS = {
  SUBJECTS: 'studyflow_subjects_v1',
  TASKS: 'studyflow_tasks_v1',
  SESSIONS: 'studyflow_sessions_v1',
  PLAN: 'studyflow_ai_plan_v1',
  CHAT: 'studyflow_chat_v1',
  SETTINGS: 'studyflow_settings_v1',
};

const StudyContext = createContext<StudyContextType | undefined>(undefined);

export const StudyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Load from localStorage or defaults
  const [subjects, setSubjects] = useState<Subject[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SUBJECTS);
      return saved ? JSON.parse(saved) : initialSubjects;
    } catch {
      return initialSubjects;
    }
  });

  const [tasks, setTasks] = useState<Task[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.TASKS);
      return saved ? JSON.parse(saved) : initialTasks;
    } catch {
      return initialTasks;
    }
  });

  const [studySessions, setStudySessions] = useState<StudySession[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SESSIONS);
      return saved ? JSON.parse(saved) : initialStudySessions;
    } catch {
      return initialStudySessions;
    }
  });

  const [aiStudyPlan, setAiStudyPlan] = useState<AiStudyPlan | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.PLAN);
      return saved ? JSON.parse(saved) : initialAiStudyPlan;
    } catch {
      return initialAiStudyPlan;
    }
  });

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CHAT);
      return saved ? JSON.parse(saved) : initialChatMessages;
    } catch {
      return initialChatMessages;
    }
  });

  const [userSettings, setUserSettings] = useState<UserSettings>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      return saved ? JSON.parse(saved) : initialUserSettings;
    } catch {
      return initialUserSettings;
    }
  });

  // Timer state
  const [activeTimer, setActiveTimer] = useState<ActiveTimerState>({
    isRunning: false,
    mode: 'focus',
    timeLeft: (userSettings.pomodoroFocusMinutes || 45) * 60,
    initialDuration: (userSettings.pomodoroFocusMinutes || 45) * 60,
    subjectId: subjects[0]?.id || '',
  });

  const [loadingPlan, setLoadingPlan] = useState(false);
  const [planError, setPlanError] = useState<string | null>(null);
  const [assistantLoading, setAssistantLoading] = useState(false);
  const [assistantError, setAssistantError] = useState<string | null>(null);

  // Sync state to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SUBJECTS, JSON.stringify(subjects));
  }, [subjects]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TASKS, JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(studySessions));
  }, [studySessions]);

  useEffect(() => {
    if (aiStudyPlan) {
      localStorage.setItem(STORAGE_KEYS.PLAN, JSON.stringify(aiStudyPlan));
    }
  }, [aiStudyPlan]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CHAT, JSON.stringify(chatMessages));
  }, [chatMessages]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(userSettings));
    // Apply dark mode class to html document
    if (userSettings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [userSettings]);

  // Pomodoro countdown effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (activeTimer.isRunning && activeTimer.timeLeft > 0) {
      interval = setInterval(() => {
        setActiveTimer((prev) => {
          if (prev.timeLeft <= 1) {
            // Timer finished
            return { ...prev, timeLeft: 0, isRunning: false };
          }
          return { ...prev, timeLeft: prev.timeLeft - 1 };
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeTimer.isRunning, activeTimer.timeLeft]);

  // --- Subject Actions ---
  const addSubject = useCallback((data: Omit<Subject, 'id' | 'completedHoursThisWeek'>) => {
    const newSubject: Subject = {
      ...data,
      id: `sub-${Date.now()}`,
      completedHoursThisWeek: 0,
    };
    setSubjects((prev) => [...prev, newSubject]);
  }, []);

  const updateSubject = useCallback((id: string, updates: Partial<Subject>) => {
    setSubjects((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
    // Also update subjectName in tasks if subject name changed
    if (updates.name) {
      setTasks((prev) =>
        prev.map((t) => (t.subjectId === id ? { ...t, subjectName: updates.name! } : t))
      );
    }
  }, []);

  const deleteSubject = useCallback((id: string) => {
    setSubjects((prev) => prev.filter((s) => s.id !== id));
  }, []);

  // --- Task Actions ---
  const addTask = useCallback((data: Omit<Task, 'id' | 'createdAt'>) => {
    const newTask: Task = {
      ...data,
      id: `task-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setTasks((prev) => [newTask, ...prev]);
  }, []);

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const updated = { ...t, ...updates };
          if (updates.status === 'Completed' && t.status !== 'Completed') {
            updated.completedAt = new Date().toISOString();
          }
          return updated;
        }
        return t;
      })
    );
  }, []);

  const deleteTask = useCallback((id: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toggleTaskStatus = useCallback((id: string) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const nextStatus: TaskStatus = t.status === 'Completed' ? 'In Progress' : 'Completed';
          return {
            ...t,
            status: nextStatus,
            completedAt: nextStatus === 'Completed' ? new Date().toISOString() : undefined,
          };
        }
        return t;
      })
    );
  }, []);

  // --- Study Sessions & Timer Actions ---
  const logStudySession = useCallback(
    (sessionData: Omit<StudySession, 'id' | 'timestamp'>) => {
      const newSession: StudySession = {
        ...sessionData,
        id: `sess-${Date.now()}`,
        timestamp: Date.now(),
      };
      setStudySessions((prev) => [newSession, ...prev]);

      // Increment subject completed hours
      const hoursAdded = Math.round((sessionData.durationMinutes / 60) * 10) / 10;
      setSubjects((prev) =>
        prev.map((s) =>
          s.id === sessionData.subjectId
            ? { ...s, completedHoursThisWeek: (s.completedHoursThisWeek || 0) + hoursAdded }
            : s
        )
      );

      // If tied to a task, update task actual hours
      if (sessionData.taskId) {
        setTasks((prev) =>
          prev.map((t) =>
            t.id === sessionData.taskId
              ? { ...t, actualHours: (t.actualHours || 0) + hoursAdded }
              : t
          )
        );
      }
    },
    []
  );

  const deleteStudySession = useCallback((id: string) => {
    setStudySessions((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const startTimer = useCallback(
    (subjectId: string, durationMinutes = userSettings.pomodoroFocusMinutes || 45, taskId?: string) => {
      const durationSeconds = durationMinutes * 60;
      setActiveTimer({
        isRunning: true,
        mode: 'focus',
        timeLeft: durationSeconds,
        initialDuration: durationSeconds,
        subjectId,
        taskId,
      });
    },
    [userSettings.pomodoroFocusMinutes]
  );

  const pauseTimer = useCallback(() => {
    setActiveTimer((prev) => ({ ...prev, isRunning: false }));
  }, []);

  const resumeTimer = useCallback(() => {
    setActiveTimer((prev) => ({ ...prev, isRunning: true }));
  }, []);

  const resetTimer = useCallback(() => {
    setActiveTimer((prev) => ({
      ...prev,
      isRunning: false,
      timeLeft: prev.initialDuration,
    }));
  }, []);

  const stopAndLogTimer = useCallback(
    (notes?: string) => {
      const timeSpentSeconds = activeTimer.initialDuration - activeTimer.timeLeft;
      const minutesSpent = Math.max(1, Math.round(timeSpentSeconds / 60));
      const subject = subjects.find((s) => s.id === activeTimer.subjectId);

      if (subject && minutesSpent >= 1) {
        const task = tasks.find((t) => t.id === activeTimer.taskId);
        logStudySession({
          subjectId: subject.id,
          subjectName: subject.name,
          taskId: activeTimer.taskId,
          taskTitle: task?.title,
          durationMinutes: minutesSpent,
          date: new Date().toISOString().split('T')[0],
          notes: notes || `Focus session (${activeTimer.mode}) completed via StudyFlow timer.`,
        });
      }

      setActiveTimer((prev) => ({
        ...prev,
        isRunning: false,
        timeLeft: prev.initialDuration,
      }));
    },
    [activeTimer, subjects, tasks, logStudySession]
  );

  const setTimerMode = useCallback((mode: 'focus' | 'break', minutes?: number) => {
    const mins =
      minutes || (mode === 'focus' ? userSettings.pomodoroFocusMinutes || 45 : userSettings.pomodoroBreakMinutes || 10);
    const secs = mins * 60;
    setActiveTimer((prev) => ({
      ...prev,
      mode,
      timeLeft: secs,
      initialDuration: secs,
      isRunning: false,
    }));
  }, [userSettings]);

  // --- AI Study Plan Actions ---
  const generateAiStudyPlan = useCallback(
    async (params?: GeneratePlanParams): Promise<boolean> => {
      setLoadingPlan(true);
      setPlanError(null);

      try {
        const payload = {
          subjects: subjects.map((s) => ({
            name: s.name,
            instructor: s.instructor,
            difficulty: s.difficulty,
            weeklyTargetHours: s.weeklyTargetHours,
            completedHoursThisWeek: s.completedHoursThisWeek,
            examDate: s.examDate,
            notes: s.notes,
          })),
          tasks: tasks
            .filter((t) => t.status !== 'Completed')
            .map((t) => ({
              title: t.title,
              subject: t.subjectName,
              deadline: t.deadline,
              estimatedHours: t.estimatedHours,
              priority: t.priority,
              category: t.category,
              description: t.description,
            })),
          preferences: {
            dailyHours: params?.dailyHours || userSettings.dailyStudyHoursTarget || 5,
            maxDailyHours: (params?.dailyHours || userSettings.dailyStudyHoursTarget || 5) + 1.5,
            sessionLength: params?.sessionLength || 60,
            weekendIntense: params?.weekendIntense ?? false,
            customGoal: params?.customGoal || 'Balanced preparation prioritizing difficult subjects and closest deadlines',
          },
        };

        const res = await fetch('/api/generate-plan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || `HTTP error ${res.status}`);
        }

        const data = await res.json();
        if (data.plan) {
          const fullPlan: AiStudyPlan = {
            id: `plan-${Date.now()}`,
            generatedAt: new Date().toISOString(),
            ...data.plan,
          };
          setAiStudyPlan(fullPlan);
          return true;
        } else {
          throw new Error('Received invalid plan structure from server.');
        }
      } catch (err: any) {
        console.error('Failed to generate study plan:', err);
        setPlanError(err.message || 'Could not connect to Gemini API. Please check your setup.');
        return false;
      } finally {
        setLoadingPlan(false);
      }
    },
    [subjects, tasks, userSettings]
  );

  const togglePlanSessionCompleted = useCallback((sessionId: string) => {
    setAiStudyPlan((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        days: prev.days.map((day) => ({
          ...day,
          sessions: day.sessions.map((sess) =>
            sess.id === sessionId ? { ...sess, completed: !sess.completed } : sess
          ),
        })),
      };
    });
  }, []);

  const applyPlanToCalendarAsTasks = useCallback(() => {
    if (!aiStudyPlan) return;
    const today = new Date();
    const newTasks: Task[] = [];

    aiStudyPlan.days.forEach((day) => {
      const targetDate = new Date();
      targetDate.setDate(today.getDate() + day.dayOffset);
      const dateStr = targetDate.toISOString().split('T')[0];

      day.sessions.forEach((sess) => {
        // Find matching subject
        const matchSub = subjects.find(
          (s) => s.name.toLowerCase() === sess.subjectName.toLowerCase()
        );
        newTasks.push({
          id: `task-plan-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          title: `[Plan] ${sess.taskTitle}`,
          subjectId: matchSub ? matchSub.id : subjects[0]?.id || 'sub-1',
          subjectName: sess.subjectName,
          description: `${sess.timeSlot} (${sess.durationMinutes} mins) • ${sess.rationale}${
            sess.recommendedTechnique ? ` • Technique: ${sess.recommendedTechnique}` : ''
          }`,
          deadline: `${dateStr}T21:00`,
          estimatedHours: Math.round((sess.durationMinutes / 60) * 10) / 10,
          priority: sess.priority === 'High' ? 'High' : sess.priority === 'Medium' ? 'Medium' : 'Low',
          status: 'Not Started',
          category: (sess.sessionType as any) || 'Assignment',
          createdAt: new Date().toISOString(),
        });
      });
    });

    setTasks((prev) => [...newTasks, ...prev]);
  }, [aiStudyPlan, subjects]);

  // --- Assistant Actions ---
  const sendAssistantMessage = useCallback(
    async (text: string) => {
      if (!text.trim()) return;

      const userMsg: ChatMessage = {
        id: `msg-${Date.now()}`,
        role: 'user',
        content: text.trim(),
        timestamp: Date.now(),
      };

      setChatMessages((prev) => [...prev, userMsg]);
      setAssistantLoading(true);
      setAssistantError(null);

      try {
        const studyContext = {
          studentName: userSettings.studentName,
          major: userSettings.major,
          subjects: subjects.map((s) => ({
            name: s.name,
            difficulty: s.difficulty,
            examDate: s.examDate,
            targetHours: s.weeklyTargetHours,
            completedHoursThisWeek: s.completedHoursThisWeek,
          })),
          activeTasks: tasks
            .filter((t) => t.status !== 'Completed')
            .map((t) => ({
              title: t.title,
              subject: t.subjectName,
              deadline: t.deadline,
              priority: t.priority,
              estimatedHours: t.estimatedHours,
            })),
          completedTasksCount: tasks.filter((t) => t.status === 'Completed').length,
          totalCompletedHoursThisWeek: subjects.reduce(
            (acc, s) => acc + (s.completedHoursThisWeek || 0),
            0
          ),
        };

        const res = await fetch('/api/study-assistant', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: text,
            history: chatMessages.slice(-6).map((m) => ({ role: m.role, content: m.content })),
            studyContext,
          }),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || `HTTP ${res.status}`);
        }

        const data = await res.json();
        const assistantMsg: ChatMessage = {
          id: `msg-${Date.now() + 1}`,
          role: 'assistant',
          content: data.reply || 'Here is what I recommend for your study schedule.',
          timestamp: Date.now(),
        };

        setChatMessages((prev) => [...prev, assistantMsg]);
      } catch (err: any) {
        console.error('Study assistant error:', err);
        setAssistantError(err.message || 'Unable to receive response from StudyFlow AI.');
        const fallbackMsg: ChatMessage = {
          id: `msg-${Date.now() + 1}`,
          role: 'assistant',
          content: `I encountered an issue connecting to the AI model (${err.message || 'Server error'}). In the meantime, based on your backlog, prioritizing your highest difficulty subject (**${
            subjects.find((s) => s.difficulty === 'Hard')?.name || 'Cryptography'
          }**) and nearest deadline is recommended!`,
          timestamp: Date.now(),
        };
        setChatMessages((prev) => [...prev, fallbackMsg]);
      } finally {
        setAssistantLoading(false);
      }
    },
    [chatMessages, subjects, tasks, userSettings]
  );

  const clearAssistantHistory = useCallback(() => {
    setChatMessages([]);
  }, []);

  // --- Settings & Themes ---
  const updateSettings = useCallback((newSettings: Partial<UserSettings>) => {
    setUserSettings((prev) => ({ ...prev, ...newSettings }));
  }, []);

  const toggleTheme = useCallback(() => {
    setUserSettings((prev) => ({
      ...prev,
      theme: prev.theme === 'dark' ? 'light' : 'dark',
    }));
  }, []);

  const resetAllDataToSample = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.SUBJECTS);
    localStorage.removeItem(STORAGE_KEYS.TASKS);
    localStorage.removeItem(STORAGE_KEYS.SESSIONS);
    localStorage.removeItem(STORAGE_KEYS.PLAN);
    localStorage.removeItem(STORAGE_KEYS.CHAT);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);

    setSubjects(initialSubjects);
    setTasks(initialTasks);
    setStudySessions(initialStudySessions);
    setAiStudyPlan(initialAiStudyPlan);
    setChatMessages(initialChatMessages);
    setUserSettings(initialUserSettings);
  }, []);

  // --- Computed Metrics ---
  const todayTasks = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    return tasks.filter((t) => t.deadline.startsWith(todayStr));
  }, [tasks]);

  const upcomingAssignments = useMemo(() => {
    return tasks
      .filter((t) => t.category === 'Assignment' && t.status !== 'Completed')
      .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
  }, [tasks]);

  const upcomingExams = useMemo(() => {
    return [...subjects].sort(
      (a, b) => new Date(a.examDate).getTime() - new Date(b.examDate).getTime()
    );
  }, [subjects]);

  const totalPlannedHoursThisWeek = useMemo(() => {
    return subjects.reduce((sum, s) => sum + (s.weeklyTargetHours || 0), 0);
  }, [subjects]);

  const completedHoursThisWeek = useMemo(() => {
    return Math.round(
      subjects.reduce((sum, s) => sum + (s.completedHoursThisWeek || 0), 0) * 10
    ) / 10;
  }, [subjects]);

  const completedTasksCount = useMemo(() => {
    return tasks.filter((t) => t.status === 'Completed').length;
  }, [tasks]);

  const totalTasksCount = useMemo(() => tasks.length, [tasks]);

  const progressPercentage = useMemo(() => {
    if (totalPlannedHoursThisWeek === 0) return 0;
    const pct = Math.round((completedHoursThisWeek / totalPlannedHoursThisWeek) * 100);
    return Math.min(100, Math.max(0, pct));
  }, [completedHoursThisWeek, totalPlannedHoursThisWeek]);

  const prioritySubjects = useMemo(() => {
    // Sort by difficulty (Hard first) and nearest exam date
    const diffScore = { Hard: 3, Medium: 2, Easy: 1 };
    return [...subjects].sort((a, b) => {
      const scoreDiff = diffScore[b.difficulty] - diffScore[a.difficulty];
      if (scoreDiff !== 0) return scoreDiff;
      return new Date(a.examDate).getTime() - new Date(b.examDate).getTime();
    });
  }, [subjects]);

  // Aggregate Calendar Events
  const calendarEvents = useMemo(() => {
    const events: CalendarEvent[] = [];

    // Add Exams
    subjects.forEach((sub) => {
      events.push({
        id: `event-exam-${sub.id}`,
        title: `${sub.name} Final Exam`,
        date: sub.examDate,
        time: '09:00 AM',
        type: 'exam',
        subjectName: sub.name,
        subjectColor: sub.color,
        priority: 'High',
        description: `Final exam with ${sub.instructor}. Target: ${sub.weeklyTargetHours} hrs review.`,
      });
    });

    // Add Tasks & Assignments
    tasks.forEach((t) => {
      const datePart = t.deadline.split('T')[0];
      const timePart = t.deadline.includes('T') ? t.deadline.split('T')[1] : undefined;
      events.push({
        id: `event-task-${t.id}`,
        title: t.title,
        date: datePart,
        time: timePart,
        type: t.category === 'Assignment' ? 'assignment' : 'deadline',
        subjectName: t.subjectName,
        subjectColor: subjects.find((s) => s.id === t.subjectId)?.color || 'indigo',
        priority: t.priority,
        description: t.description,
        completed: t.status === 'Completed',
      });
    });

    // Add logged study sessions
    studySessions.forEach((sess) => {
      events.push({
        id: `event-sess-${sess.id}`,
        title: `Study: ${sess.subjectName} (${sess.durationMinutes}m)`,
        date: sess.date,
        type: 'study_session',
        subjectName: sess.subjectName,
        subjectColor: subjects.find((s) => s.id === sess.subjectId)?.color || 'emerald',
        description: sess.notes || sess.taskTitle || 'Logged study session',
        completed: true,
      });
    });

    return events;
  }, [subjects, tasks, studySessions]);

  const value = {
    subjects,
    tasks,
    studySessions,
    aiStudyPlan,
    chatMessages,
    userSettings,
    activeTimer,
    loadingPlan,
    planError,
    assistantLoading,
    assistantError,
    addSubject,
    updateSubject,
    deleteSubject,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskStatus,
    logStudySession,
    deleteStudySession,
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
    stopAndLogTimer,
    setTimerMode,
    generateAiStudyPlan,
    togglePlanSessionCompleted,
    applyPlanToCalendarAsTasks,
    sendAssistantMessage,
    clearAssistantHistory,
    updateSettings,
    toggleTheme,
    resetAllDataToSample,
    todayTasks,
    upcomingAssignments,
    upcomingExams,
    totalPlannedHoursThisWeek,
    completedHoursThisWeek,
    completedTasksCount,
    totalTasksCount,
    progressPercentage,
    prioritySubjects,
    calendarEvents,
  };

  return <StudyContext.Provider value={value}>{children}</StudyContext.Provider>;
};

export const useStudy = () => {
  const context = useContext(StudyContext);
  if (!context) {
    throw new Error('useStudy must be used within a StudyProvider');
  }
  return context;
};
