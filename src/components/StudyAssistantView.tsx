import React, { useState, useRef, useEffect } from 'react';
import {
  BotMessageSquare,
  Send,
  Sparkles,
  Trash2,
  User,
  AlertTriangle,
  Lightbulb,
  Copy,
  Check,
} from 'lucide-react';
import { useStudy } from '../context/StudyContext';
import { formatDaysRemaining } from '../utils/helpers';

export const StudyAssistantView: React.FC = () => {
  const {
    chatMessages,
    sendAssistantMessage,
    assistantLoading,
    assistantError,
    clearAssistantHistory,
    subjects,
    tasks,
    upcomingExams,
  } = useStudy();

  const [inputMessage, setInputMessage] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, assistantLoading]);

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim() || assistantLoading) return;
    const msg = inputMessage;
    setInputMessage('');
    await sendAssistantMessage(msg);
  };

  const handleQuickPrompt = async (prompt: string) => {
    if (assistantLoading) return;
    setInputMessage('');
    await sendAssistantMessage(prompt);
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const quickPrompts = [
    'What should I study first today?',
    'I have three exams coming up. Help me prioritize.',
    'Create a high-yield revision strategy for Machine Learning.',
    'How should I divide 4 hours tonight between my hardest subjects?',
    'Break down my Cryptography problem set into actionable 25-minute steps.',
    "I'm feeling overwhelmed. Give me a 1-hour rescue plan.",
  ];

  const nextExam = upcomingExams[0];
  const nextExamInfo = nextExam ? formatDaysRemaining(nextExam.examDate) : null;
  const pendingTasksCount = tasks.filter((t) => t.status !== 'Completed').length;

  return (
    <div className="flex h-[calc(100vh-10rem)] min-h-[550px] flex-col rounded-3xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 animate-fadeIn overflow-hidden">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-500 to-indigo-600 text-white shadow-md shadow-emerald-500/20">
            <BotMessageSquare className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                Study Assistant
              </h2>
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                Powered by Gemini
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Aware of your {subjects.length} subjects, {pendingTasksCount} tasks, and upcoming{' '}
              {nextExam ? `${nextExam.name} exam (${nextExamInfo?.text})` : 'milestones'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {chatMessages.length > 0 && (
            <button
              onClick={clearAssistantHistory}
              className="flex items-center gap-1 rounded-xl border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {chatMessages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center p-6">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
              <Lightbulb className="h-7 w-7" />
            </div>
            <h3 className="mt-4 text-base font-bold text-slate-900 dark:text-white">
              How can StudyFlow assist your study session?
            </h3>
            <p className="mt-1 max-w-md text-xs text-slate-500 dark:text-slate-400">
              Ask about prioritizing exams, designing time-boxed schedules, or formulating cognitive revision strategies.
            </p>

            <div className="mt-6 flex flex-wrap justify-center gap-2 max-w-lg">
              {quickPrompts.slice(0, 4).map((p, i) => (
                <button
                  key={i}
                  onClick={() => handleQuickPrompt(p)}
                  className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 hover:border-indigo-300 hover:bg-indigo-50/50 hover:text-indigo-700 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-300 dark:hover:border-indigo-800 transition-all text-left"
                >
                  &ldquo;{p}&rdquo;
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            {chatMessages.map((msg) => {
              const isUser = msg.role === 'user';
              return (
                <div
                  key={msg.id}
                  className={`flex gap-3 max-w-3xl ${isUser ? 'ml-auto justify-end' : 'mr-auto justify-start'}`}
                >
                  {!isUser && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-500 to-indigo-600 text-white shadow-sm mt-0.5">
                      <Sparkles className="h-4 w-4" />
                    </div>
                  )}

                  <div
                    className={`relative group rounded-2xl px-4.5 py-3 text-xs sm:text-sm leading-relaxed ${
                      isUser
                        ? 'bg-indigo-600 text-white rounded-br-xs shadow-xs'
                        : 'bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100 rounded-bl-xs border border-slate-200/60 dark:border-slate-700/60'
                    }`}
                  >
                    <div className="whitespace-pre-wrap font-sans">
                      {msg.content.split('\n').map((line, idx) => {
                        // Simple styling for headings, bullet points, and pro-tips
                        if (line.startsWith('### ')) {
                          return (
                            <h4 key={idx} className="font-extrabold text-sm mt-2 mb-1">
                              {line.replace('### ', '')}
                            </h4>
                          );
                        }
                        if (line.startsWith('## ')) {
                          return (
                            <h3 key={idx} className="font-extrabold text-base mt-2 mb-1">
                              {line.replace('## ', '')}
                            </h3>
                          );
                        }
                        if (line.startsWith('> ')) {
                          return (
                            <blockquote
                              key={idx}
                              className="border-l-2 border-indigo-400 pl-2.5 py-0.5 my-1.5 italic opacity-90"
                            >
                              {line.replace('> ', '')}
                            </blockquote>
                          );
                        }
                        return (
                          <p key={idx} className={line === '' ? 'h-2' : ''}>
                            {line}
                          </p>
                        );
                      })}
                    </div>

                    {!isUser && (
                      <button
                        onClick={() => handleCopy(msg.id, msg.content)}
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 rounded-md bg-white/80 p-1 text-slate-600 shadow-xs hover:bg-white dark:bg-slate-700/80 dark:text-slate-300 transition-opacity"
                        title="Copy message"
                      >
                        {copiedId === msg.id ? (
                          <Check className="h-3 w-3 text-emerald-600" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </button>
                    )}
                  </div>

                  {isUser && (
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-white mt-0.5">
                      <User className="h-4 w-4" />
                    </div>
                  )}
                </div>
              );
            })}

            {assistantLoading && (
              <div className="flex gap-3 max-w-xl">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-500 to-indigo-600 text-white shadow-sm">
                  <Sparkles className="h-4 w-4 animate-spin" />
                </div>
                <div className="flex items-center gap-1.5 rounded-2xl bg-slate-100 px-4 py-3 text-xs text-slate-500 dark:bg-slate-800 dark:text-slate-400">
                  <span className="h-2 w-2 rounded-full bg-indigo-500 animate-bounce" />
                  <span className="h-2 w-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.2s]" />
                  <span className="h-2 w-2 rounded-full bg-indigo-500 animate-bounce [animation-delay:0.4s]" />
                  <span className="ml-2 font-medium">Analyzing your study load & formulating strategy...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Suggested Quick Prompt Chips (Carousel) */}
      <div className="flex items-center gap-1.5 overflow-x-auto border-t border-slate-100 bg-slate-50/50 px-4 py-2 dark:border-slate-800 dark:bg-slate-850/50 scrollbar-none">
        <span className="text-[11px] font-bold text-slate-400 shrink-0">Quick prompts:</span>
        {quickPrompts.map((p, i) => (
          <button
            key={i}
            onClick={() => handleQuickPrompt(p)}
            disabled={assistantLoading}
            className="shrink-0 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 hover:border-indigo-400 hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-indigo-600 disabled:opacity-50 transition-colors"
          >
            {p}
          </button>
        ))}
      </div>

      {/* Bottom Message Input Box */}
      <div className="border-t border-slate-100 p-4 dark:border-slate-800 bg-white dark:bg-slate-900">
        <form onSubmit={handleSend} className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Ask anything: 'What should I study first?', 'Review strategy for Machine Learning'..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            disabled={assistantLoading}
            className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs sm:text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <button
            type="submit"
            disabled={!inputMessage.trim() || assistantLoading}
            className="flex h-11 w-11 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-600/30 hover:bg-indigo-700 active:scale-95 disabled:opacity-50 transition-all"
            title="Send Message"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
