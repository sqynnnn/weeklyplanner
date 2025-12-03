import React, { useState } from 'react';
import { LayoutDashboard, Calendar, ClipboardList, Zap, Database, AlertCircle } from 'lucide-react';
import InputCenter from './components/InputCenter';
import ScheduleBoard from './components/ScheduleBoard';
import SummarySection from './components/SummarySection';
import { InputData, ScheduledTask } from './types';
import { generateWeeklySchedule } from './services/geminiService';

const App: React.FC = () => {
  const [view, setView] = useState<'input' | 'board' | 'summary'>('input');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [inputData, setInputData] = useState<InputData>({
    fixedEvents: [],
    routines: [],
    homework: [],
    projects: [],
  });

  const [scheduledTasks, setScheduledTasks] = useState<ScheduledTask[]>([]);

  const handleGenerateSchedule = async () => {
    // Validate inputs
    const totalItems = inputData.fixedEvents.length + inputData.routines.length + inputData.homework.length + inputData.projects.length;
    if (totalItems === 0) {
      alert("Please add some tasks in the Input Center first!");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const result = await generateWeeklySchedule(inputData);
      setScheduledTasks(result);
      setView('board');
    } catch (err: any) {
      console.error(err);
      if (err.message && err.message.includes("API Key")) {
        setError("API Key is missing. Please add REACT_APP_API_KEY or VITE_API_KEY to your Vercel Environment Variables.");
      } else {
        setError("Failed to generate schedule. Check your connection or API limit.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-white font-sans text-gray-900 overflow-hidden">
      {/* Sidebar Navigation */}
      <aside className="w-20 lg:w-64 bg-white border-r border-gray-100 flex flex-col justify-between shrink-0 z-20">
        <div>
          <div className="h-24 flex flex-col justify-center px-6 mb-2">
             <div className="flex items-center gap-2 mb-1">
                <div className="bg-gradient-to-tr from-blue-600 to-purple-600 p-1.5 rounded-lg text-white">
                  <Zap size={20} fill="currentColor" />
                </div>
                <span className="hidden lg:block font-bold text-xl text-blue-900 tracking-tight">SmartPlan</span>
             </div>
             <span className="hidden lg:block text-[10px] text-gray-400 font-medium pl-1">AI Schedule Manager</span>
          </div>
          
          <nav className="flex flex-col gap-2 px-3">
            <button
              onClick={() => setView('input')}
              className={`flex items-center p-3.5 rounded-xl transition-all group ${
                view === 'input' ? 'text-gray-900 font-bold bg-gray-50' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
              }`}
            >
              <Database size={20} className={view === 'input' ? 'text-gray-900' : 'text-gray-400 group-hover:text-gray-600'} />
              <span className="hidden lg:block ml-3">Input Center</span>
            </button>
            <button
              onClick={() => setView('board')}
              className={`flex items-center p-3.5 rounded-xl transition-all group ${
                view === 'board' ? 'bg-gray-900 text-white shadow-lg shadow-gray-200' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
              }`}
            >
              <Calendar size={20} className={view === 'board' ? 'text-white' : 'text-gray-400 group-hover:text-gray-600'} />
              <span className="hidden lg:block ml-3 font-medium">Schedule Board</span>
            </button>
            <button
              onClick={() => setView('summary')}
              className={`flex items-center p-3.5 rounded-xl transition-all group ${
                view === 'summary' ? 'text-gray-900 font-bold bg-gray-50' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
              }`}
            >
              <LayoutDashboard size={20} className={view === 'summary' ? 'text-gray-900' : 'text-gray-400 group-hover:text-gray-600'} />
              <span className="hidden lg:block ml-3">Summary</span>
            </button>
          </nav>
        </div>
        
        <div className="p-6 border-t border-gray-50">
           <div className="bg-gray-50 rounded-xl p-4 hidden lg:block">
              <div className="flex items-center gap-2 text-green-600 font-bold text-xs mb-1">
                 <Database size={12} /> LOCAL STORAGE
              </div>
              <p className="text-[10px] text-gray-400 leading-relaxed">Data is stored locally in your browser.</p>
           </div>
           <div className="lg:hidden text-center text-[10px] text-gray-300">v1.0</div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden relative bg-white">
        {loading && (
            <div className="absolute inset-0 bg-white/90 backdrop-blur-md z-50 flex flex-col items-center justify-center">
                <div className="relative mb-6">
                    <div className="w-16 h-16 border-4 border-gray-100 rounded-full"></div>
                    <div className="w-16 h-16 border-4 border-blue-600 rounded-full border-t-transparent animate-spin absolute top-0 left-0"></div>
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-2">AI is Planning</h3>
                <p className="text-gray-500">Creating your personalized weekly schedule...</p>
            </div>
        )}
        
        {error && (
            <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-[60] animate-fadeIn">
               <div className="bg-red-50 text-red-600 border border-red-200 px-6 py-4 rounded-xl shadow-xl flex items-center gap-3 max-w-md">
                  <AlertCircle size={24} className="shrink-0" />
                  <div>
                    <h4 className="font-bold text-sm">Error</h4>
                    <p className="text-xs opacity-90">{error}</p>
                  </div>
                  <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-700">
                     <ClipboardList size={18} />
                  </button>
               </div>
            </div>
        )}

        {view === 'input' && (
          <div className="flex-1 overflow-y-auto">
             <div className="sticky top-0 bg-white/80 backdrop-blur-sm z-10 px-8 py-4 flex justify-end items-center border-b border-gray-50">
                 <button 
                    onClick={handleGenerateSchedule}
                    className="bg-gray-900 text-white px-6 py-2.5 rounded-xl font-medium shadow-lg shadow-gray-200 hover:bg-gray-800 transition transform hover:-translate-y-0.5 active:translate-y-0 text-sm flex items-center gap-2"
                 >
                    <Zap size={16} fill="currentColor" className="text-yellow-400" /> Generate Plan
                 </button>
             </div>
             <InputCenter data={inputData} onChange={setInputData} />
          </div>
        )}

        {view === 'board' && (
           <div className="flex-1 overflow-hidden h-full">
               <ScheduleBoard tasks={scheduledTasks} onTasksUpdate={setScheduledTasks} onGenerate={scheduledTasks.length === 0 ? handleGenerateSchedule : undefined} />
           </div>
        )}

        {view === 'summary' && (
            <div className="flex-1 overflow-y-auto bg-gray-50/50">
                <SummarySection tasks={scheduledTasks} />
            </div>
        )}
      </main>
    </div>
  );
};

export default App;