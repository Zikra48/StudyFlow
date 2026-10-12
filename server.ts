import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isProduction = process.env.NODE_ENV === 'production';
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '10mb' }));

  const apiKey = process.env.GEMINI_API_KEY;
  let ai: GoogleGenAI | null = null;

  if (apiKey) {
    ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } else {
    console.warn('GEMINI_API_KEY is not set. Mock/fallback AI generator will be used if needed.');
  }

  // --- API Endpoint: Generate 7-Day Study Plan ---
  app.post('/api/generate-plan', async (req, res) => {
    const { subjects = [], tasks = [], preferences = {} } = req.body || {};
    try {
      if (!subjects || !Array.isArray(subjects) || subjects.length === 0) {
        return res.status(400).json({ error: 'Please provide at least one subject to generate a study plan.' });
      }

      if (!ai) {
        throw new Error('Gemini API is not configured.');
      }

      const promptContext = `
You are the master academic scheduling engine for StudyFlow AI, designed for top university students.
Generate an optimal, realistic 7-day study plan (Day 1 through Day 7).

STUDENT SUBJECTS:
${JSON.stringify(subjects, null, 2)}

STUDENT PENDING TASKS & ASSIGNMENTS:
${JSON.stringify(tasks, null, 2)}

STUDENT PREFERENCES & CONSTRAINTS:
- Daily Study Target: ${preferences?.dailyHours || 4} to ${preferences?.maxDailyHours || 6} hours per day
- Preferred Session Length: ${preferences?.sessionLength || 60} minutes
- Intensity on Weekends: ${preferences?.weekendIntense ? 'High' : 'Moderate/Lighter'}
- Custom Focus / Notes: ${preferences?.customGoal || 'Balanced preparation prioritizing difficult subjects and closest deadlines'}

SCHEDULING RULES:
1. Prioritize upcoming exam dates and urgent assignment deadlines first.
2. Hard difficulty subjects (e.g. Stochastic Calculus, Cryptography, Machine Learning) should be allocated during prime focus blocks (e.g. 9:00 AM - 12:00 PM or early afternoon).
3. Do NOT overload the student with unrealistic 12-hour continuous marathons. Keep daily hours within ${preferences?.dailyHours || 4}-${preferences?.maxDailyHours || 6} hours, with built-in breaks.
4. Distribute revision and practice across multiple days (spaced repetition).
5. For each session, specify concrete action: e.g. "Work on Assignment 2 Problem Set 3-5", "Review Lecture 6 Proofs", "Practice past midterm questions".
6. Provide a concise rationale for why this session is scheduled.
`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: promptContext,
        config: {
          systemInstruction:
            'You are StudyFlow AI, an elite university academic advisor and quantitative scheduler. Return strictly valid JSON conforming to the requested schema. Provide motivating, high-impact study plans with specific time slots.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              weeklyOverview: {
                type: Type.STRING,
                description: 'Executive summary of the weekly strategy and key milestones.',
              },
              keyFocusAlert: {
                type: Type.STRING,
                description: 'Highest risk or most urgent deadline warning.',
              },
              totalScheduledHours: {
                type: Type.NUMBER,
                description: 'Total number of study hours scheduled for the 7 days.',
              },
              days: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    dayName: {
                      type: Type.STRING,
                      description: 'E.g. Monday, Tuesday, Wednesday, etc.',
                    },
                    dayOffset: {
                      type: Type.INTEGER,
                      description: '0 for Day 1 (Today/Tomorrow), 1 for Day 2, up to 6 for Day 7.',
                    },
                    theme: {
                      type: Type.STRING,
                      description: 'Theme of the day, e.g. "Deep Theory & Midterm Prep" or "Assignment Sprint".',
                    },
                    totalHours: {
                      type: Type.NUMBER,
                      description: 'Planned hours for this day.',
                    },
                    sessions: {
                      type: Type.ARRAY,
                      items: {
                        type: Type.OBJECT,
                        properties: {
                          id: { type: Type.STRING },
                          timeSlot: {
                            type: Type.STRING,
                            description: 'E.g. "9:00 AM – 10:30 AM" or "4:00 PM – 5:30 PM"',
                          },
                          subjectName: { type: Type.STRING },
                          taskTitle: {
                            type: Type.STRING,
                            description: 'Actionable study objective or topic',
                          },
                          durationMinutes: { type: Type.NUMBER },
                          sessionType: {
                            type: Type.STRING,
                            description: 'One of: Exam Prep, Assignment, Deep Work, Revision, Problem Solving, Reading',
                          },
                          priority: {
                            type: Type.STRING,
                            description: 'High, Medium, or Low',
                          },
                          rationale: {
                            type: Type.STRING,
                            description: 'Short explanation of why this was scheduled now',
                          },
                          recommendedTechnique: {
                            type: Type.STRING,
                            description: 'E.g. "Active Recall & Flashcards", "Feynman Technique", "Timed Practice"',
                          },
                        },
                        required: [
                          'id',
                          'timeSlot',
                          'subjectName',
                          'taskTitle',
                          'durationMinutes',
                          'sessionType',
                          'priority',
                          'rationale',
                        ],
                      },
                    },
                  },
                  required: ['dayName', 'dayOffset', 'theme', 'totalHours', 'sessions'],
                },
              },
              strategicTips: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: '3-4 actionable tips for sticking to this plan.',
              },
            },
            required: ['weeklyOverview', 'keyFocusAlert', 'totalScheduledHours', 'days', 'strategicTips'],
          },
        },
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error('Gemini API returned an empty response.');
      }

      const parsedPlan = JSON.parse(responseText);
      return res.json({ success: true, plan: parsedPlan });
    } catch (error: any) {
      console.warn('Gemini API call encountered an issue, generating tailored academic fallback plan:', error.message);
      
      // Construct realistic algorithmic plan matching the student's subjects and tasks
      const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
      const targetDailyHours = preferences?.dailyHours || 5;
      const sortedSubs = [...subjects].sort((a: any, b: any) => {
        const diffScore: Record<string, number> = { Hard: 3, Medium: 2, Easy: 1 };
        return (diffScore[b.difficulty] || 1) - (diffScore[a.difficulty] || 1);
      });
      const hardSubject = sortedSubs[0]?.name || 'Machine Learning';
      const nearestExam = [...subjects].sort((a: any, b: any) => new Date(a.examDate).getTime() - new Date(b.examDate).getTime())[0];

      const fallbackDays = daysOfWeek.map((dayName, idx) => {
        const daySub1 = sortedSubs[idx % sortedSubs.length] || sortedSubs[0];
        const daySub2 = sortedSubs[(idx + 1) % sortedSubs.length] || sortedSubs[1] || sortedSubs[0];
        
        return {
          dayName,
          dayOffset: idx,
          theme: idx < 5 ? `${daySub1.name} Focus & Problem Solving` : 'Consolidation & Mock Exam Practice',
          totalHours: targetDailyHours,
          sessions: [
            {
              id: `fb-${idx}-1`,
              timeSlot: '9:00 AM – 10:30 AM',
              subjectName: daySub1.name,
              taskTitle: `Core Theory & Derivations: ${daySub1.notes ? daySub1.notes.slice(0, 45) : 'Lecture Notes Review'}`,
              durationMinutes: 90,
              sessionType: 'Deep Work',
              priority: 'High',
              rationale: 'High mental alertness slot allocated to challenging mathematical concepts.',
              recommendedTechnique: 'Active Recall & Paper Derivations',
            },
            {
              id: `fb-${idx}-2`,
              timeSlot: '11:00 AM – 12:30 PM',
              subjectName: daySub2.name,
              taskTitle: `Problem Set Solutions & Exercises`,
              durationMinutes: 90,
              sessionType: 'Problem Solving',
              priority: 'High',
              rationale: 'Active question solving prevents theoretical fatigue.',
              recommendedTechnique: 'Feynman Technique & Stepwise proof check',
            },
            {
              id: `fb-${idx}-3`,
              timeSlot: '4:00 PM – 5:30 PM',
              subjectName: daySub1.name,
              taskTitle: `Code Implementation or Past Paper Questions`,
              durationMinutes: (targetDailyHours - 3) * 60 > 30 ? 90 : 60,
              sessionType: 'Assignment',
              priority: 'Medium',
              rationale: 'Practical application cements morning theoretical models.',
              recommendedTechnique: 'Timed Pomodoro Block',
            },
          ],
        };
      });

      const fallbackPlan = {
        weeklyOverview: `Strategically structured around your upcoming ${nearestExam ? `${nearestExam.name} exam` : 'deadlines'}. Morning high-focus slots are prioritized for ${hardSubject} and rigorous theoretical derivations, with afternoons dedicated to assignments and labs.`,
        keyFocusAlert: nearestExam ? `${nearestExam.name} exam is approaching on ${nearestExam.examDate}. Prioritize core problem sets!` : 'Maintain steady 5-hour daily pacing.',
        totalScheduledHours: Math.round(targetDailyHours * 7),
        days: fallbackDays,
        strategicTips: [
          'Work on your most challenging mathematical proofs in morning hours.',
          'Take mandatory 10-minute breaks every 90 minutes to prevent cognitive fatigue.',
          'Review error logs and problem sets from previous days using spaced repetition.',
          'Simulate timed exam conditions on Saturday.',
        ],
      };

      return res.json({ success: true, plan: fallbackPlan, fallback: true });
    }
  });

  // --- API Endpoint: AI Study Assistant Chat ---
  app.post('/api/study-assistant', async (req, res) => {
    const { message = '', history = [], studyContext = {} } = req.body || {};
    try {
      if (!message || typeof message !== 'string') {
        return res.status(400).json({ error: 'Message is required.' });
      }

      if (!ai) {
        throw new Error('Gemini API is not configured.');
      }

      const systemInstruction = `
You are the StudyFlow AI Assistant, a world-class academic strategist, cognitive coach, and personal tutor for university students.
The student is currently enrolled in rigorous university courses (like Machine Learning, Cryptography, Stochastic Calculus, Portfolio Theory, Generative AI).

Current Student Data & Context:
${JSON.stringify(studyContext || {}, null, 2)}

Your Persona & Guidelines:
1. Be encouraging, clear, razor-sharp, and highly actionable.
2. Structure your replies with markdown: concise headings, bullet points, time breakdowns, and bold highlights.
3. When asked to prioritize, calculate trade-offs between exam dates, subject difficulty, and assignment deadlines.
4. When asked how to divide hours (e.g. "I have 4 hours tonight"), formulate an exact minute-by-minute schedule with Pomodoro breaks and specific topics.
5. If the student feels overwhelmed or anxious, provide a compassionate 15-minute reset followed by a bite-sized first step.
6. Keep answers concise (under 250-350 words) so they can study immediately rather than spend 20 minutes reading walls of text.
`;

      const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [];

      // Add recent history if provided
      if (Array.isArray(history) && history.length > 0) {
        for (const item of history.slice(-6)) {
          contents.push({
            role: item.role === 'user' ? 'user' : 'model',
            parts: [{ text: item.content || '' }],
          });
        }
      }

      // Add current message
      contents.push({
        role: 'user',
        parts: [{ text: message }],
      });

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents,
        config: {
          systemInstruction,
          temperature: 0.7,
        },
      });

      const reply = response.text || 'I could not generate an answer right now. Please try again.';
      return res.json({ success: true, reply });
    } catch (error: any) {
      console.warn('Gemini chat encountered an issue, providing tailored academic advisor response:', error.message);
      
      const hardSubject = studyContext?.subjects?.find((s: any) => s.difficulty === 'Hard')?.name || 'Machine Learning';
      const nearestExam = studyContext?.subjects?.[0]?.name || 'Cryptography';
      const pendingCount = studyContext?.activeTasks?.length || 3;

      let tailoredAdvice = `Here is your **StudyFlow Academic Strategy**:

1. **Top Priority Focus:**
   - Concentrate your highest cognitive energy on **${hardSubject}** and preparation for your upcoming **${nearestExam}** exam.
   - You currently have **${pendingCount} pending assignments**. Knock out the closest deadline before starting passive reading.

2. **Time Boxing Technique:**
   - Run a **45-minute focus session** using the built-in StudyFlow timer.
   - Eliminate distractions: phone on Do Not Disturb, closed browser tabs.

3. **Active Recall:**
   - Solve problem set questions with closed notes first, then verify derivations.`;

      if (message.toLowerCase().includes('4 hours') || message.toLowerCase().includes('divide')) {
        tailoredAdvice = `Here is how to allocate your **4 hours tonight**:

- **Block 1 (90 mins):** Deep focus on **${hardSubject}** proofs or core problem set questions.
- **Break (15 mins):** Step away from all screens, hydrate, and stretch.
- **Block 2 (75 mins):** **${nearestExam}** exam preparation — solve 2 past paper questions.
- **Break (10 mins):** Rest your eyes.
- **Block 3 (50 mins):** Code implementation or assignment submission checklist.
- **Wrap-up (10 mins):** Log your study hours in StudyFlow and plan tomorrow's first task.`;
      } else if (message.toLowerCase().includes('first') || message.toLowerCase().includes('start')) {
        tailoredAdvice = `**What to study first right now:**

1. **Start with:** Your nearest deadline in **${nearestExam}**.
2. **Goal for the next 45 minutes:** Complete just Question 1 or Step 1 of your assignment. Once you cross the starting threshold, flow state takes over!`;
      }

      return res.json({ success: true, reply: tailoredAdvice, fallback: true });
    }
  });

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', hasGeminiKey: Boolean(apiKey) });
  });

  // Client routing: Vite middlewares in dev, static files in production
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`StudyFlow AI server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
