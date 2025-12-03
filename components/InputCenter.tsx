import React, { useState } from 'react';
import { Plus, Trash2, BookOpen, Repeat, GraduationCap, Briefcase } from 'lucide-react';
import { InputData, FixedEvent, DailyRoutine, Homework, Project, DAYS, DAY_LABELS, WeekDay } from '../types';

interface InputCenterProps {
  data: InputData;
  onChange: (newData: InputData) => void;
}

// Wrapper component to avoid TSX issues with complex returns inside map
const InputWrapper = ({ children, className }: { children?: React.ReactNode, className?: string }) => (
  <div className={className}>{children}</div>
);

const InputCenter: React.FC<InputCenterProps> = ({ data, onChange }) => {
  const [activeTab, setActiveTab] = useState<'fixed' | 'routine' | 'homework' | 'project'>('fixed');

  // --- Helpers for updating lists ---
  const updateList = <T extends { id: string }>(
    list: T[],
    key: keyof InputData,
    newItem?: T,
    removeId?: string
  ) => {
    let newList = [...list];
    if (removeId) {
      newList = newList.filter(item => item.id !== removeId);
    } else if (newItem) {
      newList.push(newItem);
    }
    onChange({ ...data, [key]: newList });
  };

  const generateId = () => Math.random().toString(36).substr(2, 9);

  // --- Renderers for each section ---

  const renderFixedEvents = () => (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Plus size={20} className="text-blue-500" /> Add Fixed Event / Class
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          <div className="md:col-span-3">
            <label className="block text-xs font-medium text-gray-500 mb-1">Event Name</label>
            <input type="text" id="fixed-name" className="w-full bg-gray-50 border-gray-200 border p-3 rounded-xl text-sm focus:ring-2 focus:ring-blue-100 outline-none transition" placeholder="e.g. Math Class" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-gray-500 mb-1">Day</label>
            <select id="fixed-day" className="w-full bg-gray-50 border-gray-200 border p-3 rounded-xl text-sm focus:ring-2 focus:ring-blue-100 outline-none transition">
              {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-gray-500 mb-1">Start</label>
            <input type="time" id="fixed-start" className="w-full bg-gray-50 border-gray-200 border p-3 rounded-xl text-sm focus:ring-2 focus:ring-blue-100 outline-none transition" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-gray-500 mb-1">End</label>
            <input type="time" id="fixed-end" className="w-full bg-gray-50 border-gray-200 border p-3 rounded-xl text-sm focus:ring-2 focus:ring-blue-100 outline-none transition" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-gray-500 mb-1">Note (Optional)</label>
            <input type="text" id="fixed-note" className="w-full bg-gray-50 border-gray-200 border p-3 rounded-xl text-sm focus:ring-2 focus:ring-blue-100 outline-none transition" placeholder="Room 101" />
          </div>
          <div className="md:col-span-1">
            <button
              onClick={() => {
                const name = (document.getElementById('fixed-name') as HTMLInputElement).value;
                const day = (document.getElementById('fixed-day') as HTMLSelectElement).value as WeekDay;
                const start = (document.getElementById('fixed-start') as HTMLInputElement).value;
                const end = (document.getElementById('fixed-end') as HTMLInputElement).value;
                const note = (document.getElementById('fixed-note') as HTMLInputElement).value;
                if (name && start && end) {
                  updateList<FixedEvent>(data.fixedEvents, 'fixedEvents', {
                    id: generateId(), name, day, startTime: start, endTime: end, note
                  });
                  (document.getElementById('fixed-name') as HTMLInputElement).value = '';
                  (document.getElementById('fixed-note') as HTMLInputElement).value = '';
                }
              }}
              className="w-full bg-blue-600 text-white p-3 rounded-xl hover:bg-blue-700 transition flex justify-center items-center shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              <Plus size={20} />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {data.fixedEvents.map(item => (
          <div key={item.id} className="group flex items-center justify-between bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-10 h-10 shrink-0 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                <BookOpen size={18} />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-gray-800 truncate">{item.name}</p>
                <p className="text-xs text-gray-500">{item.day} · {item.startTime} - {item.endTime} {item.note && `· ${item.note}`}</p>
              </div>
            </div>
            <button onClick={() => updateList(data.fixedEvents, 'fixedEvents', undefined, item.id)} className="text-gray-300 hover:text-red-500 transition p-2">
              <Trash2 size={18} />
            </button>
          </div>
        ))}
        {data.fixedEvents.length === 0 && (
          <div className="col-span-full py-8 text-center border-2 border-dashed border-gray-100 rounded-2xl">
            <p className="text-gray-400 text-sm">No fixed events added.</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderRoutines = () => (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Plus size={20} className="text-green-500" /> Add Daily Routine
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          <div className="md:col-span-3">
            <label className="block text-xs font-medium text-gray-500 mb-1">Task Name</label>
            <input type="text" id="routine-name" className="w-full bg-gray-50 border-gray-200 border p-3 rounded-xl text-sm focus:ring-2 focus:ring-green-100 outline-none transition" placeholder="e.g. Vocabulary" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-gray-500 mb-1">Freq (Weekly)</label>
            <input type="number" id="routine-freq" min="1" max="7" defaultValue="7" className="w-full bg-gray-50 border-gray-200 border p-3 rounded-xl text-sm focus:ring-2 focus:ring-green-100 outline-none transition" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-gray-500 mb-1">Duration (min)</label>
            <input type="number" id="routine-dur" min="15" step="15" defaultValue="30" className="w-full bg-gray-50 border-gray-200 border p-3 rounded-xl text-sm focus:ring-2 focus:ring-green-100 outline-none transition" />
          </div>
          <div className="md:col-span-4">
            <label className="block text-xs font-medium text-gray-500 mb-1">Note (Optional)</label>
            <input type="text" id="routine-note" className="w-full bg-gray-50 border-gray-200 border p-3 rounded-xl text-sm focus:ring-2 focus:ring-green-100 outline-none transition" placeholder="Details..." />
          </div>
          <div className="md:col-span-1">
             <button
              onClick={() => {
                const name = (document.getElementById('routine-name') as HTMLInputElement).value;
                const freq = parseInt((document.getElementById('routine-freq') as HTMLInputElement).value);
                const dur = parseInt((document.getElementById('routine-dur') as HTMLInputElement).value);
                const note = (document.getElementById('routine-note') as HTMLInputElement).value;
                if (name) {
                  updateList<DailyRoutine>(data.routines, 'routines', {
                    id: generateId(), name, frequencyPerWeek: freq, durationMinutes: dur, note
                  });
                  (document.getElementById('routine-name') as HTMLInputElement).value = '';
                  (document.getElementById('routine-note') as HTMLInputElement).value = '';
                }
              }}
              className="w-full bg-green-600 text-white p-3 rounded-xl hover:bg-green-700 transition flex justify-center items-center shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              <Plus size={20} />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {data.routines.map(item => (
          <div key={item.id} className="group flex items-center justify-between bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition">
             <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-10 h-10 shrink-0 rounded-full bg-green-50 flex items-center justify-center text-green-600">
                <Repeat size={18} />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-gray-800 truncate">{item.name}</p>
                <p className="text-xs text-gray-500">{item.frequencyPerWeek}x / week · {item.durationMinutes} min {item.note && `· ${item.note}`}</p>
              </div>
            </div>
            <button onClick={() => updateList(data.routines, 'routines', undefined, item.id)} className="text-gray-300 hover:text-red-500 transition p-2">
              <Trash2 size={18} />
            </button>
          </div>
        ))}
         {data.routines.length === 0 && (
          <div className="col-span-full py-8 text-center border-2 border-dashed border-gray-100 rounded-2xl">
            <p className="text-gray-400 text-sm">No routines added.</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderHomework = () => (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
         <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Plus size={20} className="text-purple-500" /> Add Homework
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          <div className="md:col-span-3">
            <label className="block text-xs font-medium text-gray-500 mb-1">Homework Name</label>
            <input type="text" id="hw-name" className="w-full bg-gray-50 border-gray-200 border p-3 rounded-xl text-sm focus:ring-2 focus:ring-purple-100 outline-none transition" placeholder="e.g. Physics Problem Set" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-gray-500 mb-1">Sessions Needed</label>
            <input type="number" id="hw-sessions" min="1" defaultValue="1" className="w-full bg-gray-50 border-gray-200 border p-3 rounded-xl text-sm focus:ring-2 focus:ring-purple-100 outline-none transition" />
          </div>
          <div className="md:col-span-3">
            <label className="block text-xs font-medium text-gray-500 mb-1">Deadline (DDL)</label>
            <input type="date" id="hw-ddl" className="w-full bg-gray-50 border-gray-200 border p-3 rounded-xl text-sm focus:ring-2 focus:ring-purple-100 outline-none transition" />
          </div>
          <div className="md:col-span-3">
            <label className="block text-xs font-medium text-gray-500 mb-1">Note (Optional)</label>
            <input type="text" id="hw-note" className="w-full bg-gray-50 border-gray-200 border p-3 rounded-xl text-sm focus:ring-2 focus:ring-purple-100 outline-none transition" placeholder="Chapters 1-3" />
          </div>
          <div className="md:col-span-1">
             <button
              onClick={() => {
                const name = (document.getElementById('hw-name') as HTMLInputElement).value;
                const sessions = parseInt((document.getElementById('hw-sessions') as HTMLInputElement).value);
                const ddl = (document.getElementById('hw-ddl') as HTMLInputElement).value;
                const note = (document.getElementById('hw-note') as HTMLInputElement).value;
                if (name && ddl) {
                  updateList<Homework>(data.homework, 'homework', {
                    id: generateId(), name, sessionsNeeded: sessions, deadline: ddl, note
                  });
                  (document.getElementById('hw-name') as HTMLInputElement).value = '';
                  (document.getElementById('hw-note') as HTMLInputElement).value = '';
                }
              }}
              className="w-full bg-purple-600 text-white p-3 rounded-xl hover:bg-purple-700 transition flex justify-center items-center shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              <Plus size={20} />
            </button>
          </div>
        </div>
      </div>
       <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {data.homework.map(item => (
          <div key={item.id} className="group flex items-center justify-between bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-10 h-10 shrink-0 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
                <GraduationCap size={18} />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-gray-800 truncate">{item.name}</p>
                <p className="text-xs text-gray-500">Need {item.sessionsNeeded} sessions · DDL: {item.deadline} {item.note && `· ${item.note}`}</p>
              </div>
            </div>
            <button onClick={() => updateList(data.homework, 'homework', undefined, item.id)} className="text-gray-300 hover:text-red-500 transition p-2">
              <Trash2 size={18} />
            </button>
          </div>
        ))}
         {data.homework.length === 0 && (
          <div className="col-span-full py-8 text-center border-2 border-dashed border-gray-100 rounded-2xl">
            <p className="text-gray-400 text-sm">No homework added.</p>
          </div>
        )}
      </div>
    </div>
  );

  const renderProjects = () => (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
         <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
          <Plus size={20} className="text-orange-500" /> Add Project / Exam
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          <div className="md:col-span-3">
            <label className="block text-xs font-medium text-gray-500 mb-1">Project Name</label>
            <input type="text" id="proj-name" className="w-full bg-gray-50 border-gray-200 border p-3 rounded-xl text-sm focus:ring-2 focus:ring-orange-100 outline-none transition" placeholder="e.g. Final Review" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-gray-500 mb-1">Sessions</label>
            <input type="number" id="proj-sessions" min="1" defaultValue="3" className="w-full bg-gray-50 border-gray-200 border p-3 rounded-xl text-sm focus:ring-2 focus:ring-orange-100 outline-none transition" />
          </div>
          <div className="md:col-span-3">
            <label className="block text-xs font-medium text-gray-500 mb-1">Deadline (DDL)</label>
            <input type="date" id="proj-ddl" className="w-full bg-gray-50 border-gray-200 border p-3 rounded-xl text-sm focus:ring-2 focus:ring-orange-100 outline-none transition" />
          </div>
          <div className="md:col-span-3">
            <label className="block text-xs font-medium text-gray-500 mb-1">Note (Optional)</label>
            <input type="text" id="proj-note" className="w-full bg-gray-50 border-gray-200 border p-3 rounded-xl text-sm focus:ring-2 focus:ring-orange-100 outline-none transition" placeholder="Important" />
          </div>
          <div className="md:col-span-1">
             <button
              onClick={() => {
                const name = (document.getElementById('proj-name') as HTMLInputElement).value;
                const sessions = parseInt((document.getElementById('proj-sessions') as HTMLInputElement).value);
                const ddl = (document.getElementById('proj-ddl') as HTMLInputElement).value;
                const note = (document.getElementById('proj-note') as HTMLInputElement).value;
                if (name && ddl) {
                  updateList<Project>(data.projects, 'projects', {
                    id: generateId(), name, sessionsNeeded: sessions, deadline: ddl, note
                  });
                  (document.getElementById('proj-name') as HTMLInputElement).value = '';
                  (document.getElementById('proj-note') as HTMLInputElement).value = '';
                }
              }}
              className="w-full bg-orange-600 text-white p-3 rounded-xl hover:bg-orange-700 transition flex justify-center items-center shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              <Plus size={20} />
            </button>
          </div>
        </div>
      </div>
       <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {data.projects.map(item => (
          <div key={item.id} className="group flex items-center justify-between bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-10 h-10 shrink-0 rounded-full bg-orange-50 flex items-center justify-center text-orange-600">
                <Briefcase size={18} />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-gray-800 truncate">{item.name}</p>
                <p className="text-xs text-gray-500">Plan {item.sessionsNeeded} sessions · DDL: {item.deadline} {item.note && `· ${item.note}`}</p>
              </div>
            </div>
            <button onClick={() => updateList(data.projects, 'projects', undefined, item.id)} className="text-gray-300 hover:text-red-500 transition p-2">
              <Trash2 size={18} />
            </button>
          </div>
        ))}
         {data.projects.length === 0 && (
          <div className="col-span-full py-8 text-center border-2 border-dashed border-gray-100 rounded-2xl">
            <p className="text-gray-400 text-sm">No projects added.</p>
          </div>
        )}
      </div>
    </div>
  );

  const tabs = [
    { id: 'fixed', label: 'Fixed / Class', icon: BookOpen, color: 'blue' },
    { id: 'routine', label: 'Daily Routine', icon: Repeat, color: 'green' },
    { id: 'homework', label: 'Homework', icon: GraduationCap, color: 'purple' },
    { id: 'project', label: 'Project / Exam', icon: Briefcase, color: 'orange' },
  ];

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-8 pb-32">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
           <h2 className="text-2xl font-bold text-gray-800">Input Center</h2>
           <p className="text-gray-500 text-sm mt-1">Enter your weekly tasks here, and AI will generate a plan for you.</p>
        </div>
      </div>
      
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden mb-6">
        <div className="flex overflow-x-auto no-scrollbar">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center gap-2 py-4 px-6 font-medium text-sm transition-all whitespace-nowrap border-b-2
                  ${isActive 
                    ? `border-${tab.color}-500 text-${tab.color}-600 bg-${tab.color}-50/30` 
                    : 'border-transparent text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                  }`}
              >
                <Icon size={18} />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <InputWrapper className="min-h-[400px]">
        {activeTab === 'fixed' && renderFixedEvents()}
        {activeTab === 'routine' && renderRoutines()}
        {activeTab === 'homework' && renderHomework()}
        {activeTab === 'project' && renderProjects()}
      </InputWrapper>
    </div>
  );
};

export default InputCenter;