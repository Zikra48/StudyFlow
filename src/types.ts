export type DifficultyLevel = 'Easy' | 'Medium' | 'Hard';
export type PriorityLevel = 'Low' | 'Medium' | 'High';
export type TaskStatus = 'Not Started' | 'In Progress' | 'Completed';
export type TaskCategory = 'Assignment' | 'Exam Prep' | 'Reading' | 'Project' | 'Revision';

export interface Subject {
  id: string;
  name: string;
  code?: string;
  instructor: string;
  difficulty: DifficultyLevel;
  weeklyTargetHours: number;
  completedHoursThisWeek: number;
  examDate: string; // YYYY-MM-DD
  notes: string;
  color: string; // e.g. 'indigo', 'emerald', 'rose', 'amber', 'purple', 'cyan'
  icon?: string;
}

export interface Task {
  id: string;
  title: string;
  subjectId: string;
  subjectName: string;
  description: string;
  deadline: string; // YYYY-MM-DDTHH:mm or YYYY-MM-DD
  estimatedHours: number;
  actualHours?: number;
  priority: PriorityLevel;
  status: TaskStatus;
  category: TaskCategory;
  completedAt?: string;
  createdAt: string;
}

export interface StudySession {
  id: string;
  subjectId: string;
  subjectName: string;
  taskId?: string;
  taskTitle?: string;
  durationMinutes: number;
  date: string; // YYYY-MM-DD
  timestamp: number;
  notes?: string;
}

export interface AiPlanSession {
  id: string;
  timeSlot: string;
  subjectName: string;
  taskTitle: string;
  durationMinutes: number;
  sessionType: string;
  priority: 'High' | 'Medium' | 'Low' | string;
  rationale: string;
  recommendedTechnique?: string;
  completed?: boolean;
}

export interface AiPlanDay {
  dayName: string;
  dayOffset: number;
  theme: string;
  totalHours: number;
  sessions: AiPlanSession[];
}

export interface AiStudyPlan {
  id: string;
  generatedAt: string;
  weeklyOverview: string;
  keyFocusAlert: string;
  totalScheduledHours: number;
  days: AiPlanDay[];
  strategicTips: string[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time?: string;
  type: 'exam' | 'assignment' | 'study_session' | 'deadline';
  subjectName: string;
  subjectColor: string;
  priority?: PriorityLevel;
  description?: string;
  completed?: boolean;
}

export interface UserSettings {
  studentName: string;
  university: string;
  major: string;
  semester: string;
  targetWeeklyHours: number;
  dailyStudyHoursTarget: number;
  pomodoroFocusMinutes: number;
  pomodoroBreakMinutes: number;
  theme: 'light' | 'dark';
}
