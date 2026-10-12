/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { StudyProvider } from './context/StudyContext';
import { Sidebar, NavTab } from './components/Sidebar';
import { Header } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { SubjectsView } from './components/SubjectsView';
import { TasksView } from './components/TasksView';
import { AiPlannerView } from './components/AiPlannerView';
import { CalendarView } from './components/CalendarView';
import { AnalyticsView } from './components/AnalyticsView';
import { StudyAssistantView } from './components/StudyAssistantView';
import { SettingsView } from './components/SettingsView';
import { TaskModal } from './components/TaskModal';
import { SubjectModal } from './components/SubjectModal';
import { FocusTimerModal } from './components/FocusTimerModal';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Task, Subject } from './types';

function MainApp() {
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [mobileOpen, setMobileOpen] = useState(false);

  // Modals state
  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [taskToEdit, setTaskToEdit] = useState<Task | null>(null);

  const [subjectModalOpen, setSubjectModalOpen] = useState(false);
  const [subjectToEdit, setSubjectToEdit] = useState<Subject | null>(null);

  const [timerModalOpen, setTimerModalOpen] = useState(false);

  const handleOpenTaskModal = (task?: Task) => {
    setTaskToEdit(task || null);
    setTaskModalOpen(true);
  };

  const handleOpenSubjectModal = (subject?: Subject) => {
    setSubjectToEdit(subject || null);
    setSubjectModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 flex font-sans antialiased transition-colors duration-200">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-72">
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          setMobileOpen={setMobileOpen}
          onOpenTaskModal={() => handleOpenTaskModal()}
          onOpenSubjectModal={() => handleOpenSubjectModal()}
          onOpenTimerModal={() => setTimerModalOpen(true)}
        />

        <main className="flex-1 p-4 sm:p-8 max-w-7xl w-full mx-auto">
          {activeTab === 'dashboard' && (
            <DashboardView
              setActiveTab={setActiveTab}
              onOpenTaskModal={() => handleOpenTaskModal()}
              onOpenSubjectModal={() => handleOpenSubjectModal()}
              onOpenTimerModal={() => setTimerModalOpen(true)}
            />
          )}

          {activeTab === 'subjects' && (
            <SubjectsView
              onOpenSubjectModal={handleOpenSubjectModal}
              onOpenTimerModal={() => setTimerModalOpen(true)}
            />
          )}

          {activeTab === 'tasks' && (
            <TasksView
              onOpenTaskModal={handleOpenTaskModal}
              onOpenTimerModal={() => setTimerModalOpen(true)}
            />
          )}

          {activeTab === 'planner' && <AiPlannerView />}

          {activeTab === 'calendar' && (
            <CalendarView onOpenTaskModal={() => handleOpenTaskModal()} />
          )}

          {activeTab === 'analytics' && <AnalyticsView />}

          {activeTab === 'assistant' && <StudyAssistantView />}

          {activeTab === 'settings' && <SettingsView />}
        </main>
      </div>

      {/* Global Modals */}
      <TaskModal
        isOpen={taskModalOpen}
        onClose={() => {
          setTaskModalOpen(false);
          setTaskToEdit(null);
        }}
        taskToEdit={taskToEdit}
      />

      <SubjectModal
        isOpen={subjectModalOpen}
        onClose={() => {
          setSubjectModalOpen(false);
          setSubjectToEdit(null);
        }}
        subjectToEdit={subjectToEdit}
      />

      <FocusTimerModal
        isOpen={timerModalOpen}
        onClose={() => setTimerModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <StudyProvider>
        <MainApp />
      </StudyProvider>
    </ErrorBoundary>
  );
}
