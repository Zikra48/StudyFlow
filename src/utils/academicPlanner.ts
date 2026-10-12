import { Subject, Task, AiStudyPlan } from '../types';

export interface LocalPlanPreferences {
  dailyHours?: number;
  maxDailyHours?: number;
  sessionLength?: number;
  weekendIntense?: boolean;
  customGoal?: string;
}

export function generateLocalStudyPlan(
  subjects: Subject[],
  tasks: Task[],
  preferences?: LocalPlanPreferences
): AiStudyPlan {
  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const targetDailyHours = preferences?.dailyHours || 5;

  // Sort subjects by difficulty (Hard -> Medium -> Easy) and nearest exam date
  const sortedSubs = [...subjects].sort((a, b) => {
    const diffScore = { Hard: 3, Medium: 2, Easy: 1 };
    const scoreDiff = (diffScore[b.difficulty] || 1) - (diffScore[a.difficulty] || 1);
    if (scoreDiff !== 0) return scoreDiff;
    return new Date(a.examDate).getTime() - new Date(b.examDate).getTime();
  });

  const hardSubject = sortedSubs[0]?.name || 'Machine Learning';
  const nearestExam = [...subjects].sort(
    (a, b) => new Date(a.examDate).getTime() - new Date(b.examDate).getTime()
  )[0];

  const pendingAssignments = tasks.filter((t) => t.status !== 'Completed');

  const days = daysOfWeek.map((dayName, idx) => {
    const sub1 = sortedSubs[idx % sortedSubs.length] || sortedSubs[0];
    const sub2 = sortedSubs[(idx + 1) % sortedSubs.length] || sortedSubs[1] || sortedSubs[0];
    const relatedTask = pendingAssignments[idx % (pendingAssignments.length || 1)];

    return {
      dayName,
      dayOffset: idx,
      theme:
        idx < 5
          ? `${sub1.name} Focus & Problem Solving`
          : idx === 5
          ? 'Timed Mock Exam & Comprehensive Review'
          : 'Exam Consolidation & Forward Planning',
      totalHours: targetDailyHours,
      sessions: [
        {
          id: `plan-local-${idx}-1`,
          timeSlot: '9:00 AM – 10:30 AM',
          subjectName: sub1.name,
          taskTitle: `Core Theory & Derivations: ${sub1.notes ? sub1.notes.slice(0, 45) : 'Lecture Notes Review'}`,
          durationMinutes: 90,
          sessionType: 'Deep Work',
          priority: 'High',
          rationale: 'High mental alertness morning slot allocated to difficult conceptual foundations.',
          recommendedTechnique: 'Active Recall & Paper Derivations',
          completed: false,
        },
        {
          id: `plan-local-${idx}-2`,
          timeSlot: '11:00 AM – 12:30 PM',
          subjectName: sub2.name,
          taskTitle: relatedTask ? relatedTask.title : `${sub2.name} Practice Problem Set Exercises`,
          durationMinutes: 90,
          sessionType: relatedTask ? 'Assignment' : 'Problem Solving',
          priority: 'High',
          rationale: 'Active problem solving reinforces theory and tackles pending deadlines.',
          recommendedTechnique: 'Feynman Technique & Stepwise proof verification',
          completed: false,
        },
        {
          id: `plan-local-${idx}-3`,
          timeSlot: '4:00 PM – 5:30 PM',
          subjectName: sub1.name,
          taskTitle: `${sub1.name} Project Code Lab & Review Exercises`,
          durationMinutes: Math.max(60, Math.round((targetDailyHours - 3) * 60)),
          sessionType: 'Revision',
          priority: 'Medium',
          rationale: 'Practical application cements theoretical understanding before evening rest.',
          recommendedTechnique: 'Timed Pomodoro Focus Block',
          completed: false,
        },
      ],
    };
  });

  return {
    id: `plan-${Date.now()}`,
    generatedAt: new Date().toISOString(),
    weeklyOverview: `Optimized study roadmap prioritizing ${hardSubject} and your upcoming ${
      nearestExam ? `${nearestExam.name} exam (${nearestExam.examDate})` : 'academic milestones'
    }. High-focus morning slots are preserved for mathematical rigor, followed by structured afternoon problem solving.`,
    keyFocusAlert: nearestExam
      ? `${nearestExam.name} exam is on ${nearestExam.examDate}. Prioritize past papers and core derivations!`
      : `Maintain consistent ${targetDailyHours}-hour daily rhythm with active recall.`,
    totalScheduledHours: Math.round(targetDailyHours * 7 * 10) / 10,
    days,
    strategicTips: [
      'Tackle your most cognitively demanding subjects in morning hours when focus is highest.',
      'Take mandatory 10-minute screen-free breaks between 90-minute study blocks.',
      'Test your retention with closed-book problem sets before consulting lecture slides.',
      'Dedicate Saturday to simulating full-length timed exam conditions.',
    ],
  };
}

export function generateLocalAssistantResponse(
  message: string,
  context: {
    subjects?: Subject[];
    activeTasks?: Task[];
    nearestExam?: Subject;
    studentName?: string;
  }
): string {
  const hardSubject =
    context.subjects?.find((s) => s.difficulty === 'Hard')?.name || 'Machine Learning';
  const nearestExam = context.nearestExam?.name || context.subjects?.[0]?.name || 'Cryptography';
  const examDate = context.nearestExam?.examDate || 'next week';
  const taskCount = context.activeTasks?.length || 3;
  const lower = message.toLowerCase();

  if (lower.includes('4 hours') || lower.includes('divide') || lower.includes('schedule')) {
    return `Here is how to optimize your **4 hours tonight**:

### 🎯 4-Hour Time-Boxed Allocation
- **Block 1 (90 mins) — 9:00 AM / Prime Focus:**
  - **Subject:** **${hardSubject}**
  - **Task:** Difficult problem set questions and core derivations.
- **Break (15 mins):** Step away from all screens, hydrate, and stretch.
- **Block 2 (75 mins) — Core Review:**
  - **Subject:** **${nearestExam}** (Exam on ${examDate})
  - **Task:** 2 past exam questions under closed-book conditions.
- **Break (10 mins):** Rest your eyes and reset working memory.
- **Block 3 (50 mins) — Code / Assignment Sprint:**
  - **Subject:** Active assignment implementation.
  - **Task:** Check off remaining items on your submission checklist.
- **Wrap-up (10 mins):** Log study time in StudyFlow and set tomorrow's top 1 task.`;
  }

  if (lower.includes('first') || lower.includes('start') || lower.includes('priority')) {
    return `### 🚀 Immediate Priority Recommendation

1. **Top Priority Right Now:**
   - **${nearestExam}** (Upcoming Exam on ${examDate}).
   - You currently have **${taskCount} active tasks** in your backlog.

2. **Action Plan for the Next 45 Minutes:**
   - Launch the StudyFlow **45-minute focus timer**.
   - Focus exclusively on **Question 1** or **Problem 1** of your highest-priority assignment.
   - Once you overcome the initial friction, momentum and flow state will carry you through!

> **Pro Tip:** Put your phone in another room on Do Not Disturb and close all extraneous browser tabs.`;
  }

  if (lower.includes('machine learning') || lower.includes('revision strategy')) {
    return `### 🧠 High-Yield Revision Strategy: Machine Learning

1. **Active Derivation Practice:**
   - Don't just re-read lecture slides. Pick a blank sheet of paper and derive key equations from scratch (e.g., Backpropagation gradients, SVM dual Lagrangian, Transformer Attention matrices).

2. **Concept Mapping & Distinctions:**
   - Explain why specific architectures work: why scaled dot-product attention divides by $\\sqrt{d_k}$, or how noise schedules operate in Diffusion models.

3. **Past Exam Error Analysis:**
   - Work through 2 past midterm questions. Log every mistake in an "Error Log" and re-test 48 hours later.`;
  }

  return `Here is your **StudyFlow Academic Strategy**:

1. **Focus on Highest Leverage Courses:**
   - Direct your freshest cognitive energy toward **${hardSubject}** and preparation for your upcoming **${nearestExam}** exam.
   - With **${taskCount} active assignments**, prioritize due dates over passive reading.

2. **Spaced Repetition & Retrieval:**
   - Use the **Feynman Technique**: explain complex formulas to yourself out loud without looking at answers.
   - Solve 3 practice problems per study session.

3. **Log & Protect Focus:**
   - Use the built-in StudyFlow Pomodoro timer to track your weekly target hours!`;
}
