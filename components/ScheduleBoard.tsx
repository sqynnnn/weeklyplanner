import React, { useState, useRef, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { ScheduledTask, DAYS, DAY_LABELS, PERIOD_LABELS, WeekDay } from '../types';
import html2canvas from 'html2canvas';
import { Check, X, RotateCw, Clock, Download, ChevronLeft, ChevronRight, Edit2, Wand2, Calendar as CalendarIcon, Save, Loader2 } from 'lucide-react';

interface ScheduleBoardProps {
  tasks: ScheduledTask[];
  onTasksUpdate: (tasks: ScheduledTask[]) => void;
  onGenerate?: () => void;
}

// Helper to get Monday-Sunday array based on a reference date
const getWeekDays = (refDate: Date) => {
  const startOfWeek = new Date(refDate);
  const day = startOfWeek.getDay();
  const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  startOfWeek.setDate(diff);

  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    days.push(d);
  }
  return days;
};

const ScheduleBoard: React.FC<ScheduleBoardProps> = ({ tasks, onTasksUpdate, onGenerate }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [editingTask, setEditingTask] = useState<ScheduledTask | null>(null);
  const [substitutingTask, setSubstitutingTask] = useState<ScheduledTask | null>(null);
  const [isExporting, setIsExporting] = useState(false);
  
  // Ref specifically for the content we want to capture
  const captureRef = useRef<HTMLDivElement>(null);

  const weekDays = getWeekDays(selectedDate);

  const selectedDayName = DAYS[selectedDate.getDay() === 0 ? 6 : selectedDate.getDay() - 1];
  
  const dayTasks = tasks.filter(t => t.day === selectedDayName);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    
    const items = Array.from(dayTasks);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Merge back
    const otherTasks = tasks.filter(t => t.day !== selectedDayName);
    onTasksUpdate([...otherTasks, ...items]);
  };

  const toggleComplete = (taskId: string) => {
    const newTasks = tasks.map(t => 
      t.id === taskId ? { ...t, isCompleted: !t.isCompleted } : t
    );
    onTasksUpdate(newTasks);
  };

  const handleSubstituteSave = (reason: string) => {
    if (substitutingTask) {
        if(reason.trim()) {
            const newTasks = tasks.map(t => 
                t.id === substitutingTask.id ? { 
                  ...t, 
                  isReplaced: true, 
                  replacedWith: reason,
                } : t
              );
              onTasksUpdate(newTasks);
        } else {
             const newTasks = tasks.map(t => 
                t.id === substitutingTask.id ? { ...t, isReplaced: false, replacedWith: undefined } : t
              );
              onTasksUpdate(newTasks);
        }
      setSubstitutingTask(null);
    }
  };

  const handlePostpone = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    if (window.confirm("Postpone to later today? (Click Cancel to postpone to tomorrow)")) {
       const otherDayTasks = tasks.filter(t => t.day !== selectedDayName);
       const currentDayTasks = tasks.filter(t => t.day === selectedDayName && t.id !== taskId);
       // Append to end of today
       onTasksUpdate([...otherDayTasks, ...currentDayTasks, { ...task, isPostponed: true, note: (task.note || '') + ' [Postponed]' }]);
    } else {
        const nextDayIndex = (DAYS.indexOf(selectedDayName) + 1) % 7;
        const nextDay = DAYS[nextDayIndex];
        
        const newTasks = tasks.map(t => 
            t.id === taskId ? { ...t, day: nextDay, isPostponed: true, note: (t.note || '') + ` [Postponed from ${selectedDayName}]` } : t
        );
        onTasksUpdate(newTasks);
    }
  };

  const handleEditSave = (name: string, note: string) => {
    if (editingTask) {
      onTasksUpdate(tasks.map(t => t.id === editingTask.id ? {...t, originalName: name, note: note} : t));
      setEditingTask(null);
    }
  };

  const handleDelete = (taskId: string) => {
      if(window.confirm("Are you sure you want to delete this task?")) {
        onTasksUpdate(tasks.filter(t => t.id !== taskId));
      }
  };

  const exportAsImage = async () => {
    if (captureRef.current && !isExporting) {
      setIsExporting(true);
      try {
        // Wait a moment for any re-renders or styles to settle
        await new Promise(resolve => setTimeout(resolve, 100));

        const canvas = await html2canvas(captureRef.current, {
          scale: 2, // Higher resolution (Retina-like)
          useCORS: true, // Handle external images/fonts
          backgroundColor: '#ffffff', // Force white background
          logging: false, 
          // allowTaint MUST be false (default) to allow toDataURL to work securely
          allowTaint: false, 
          ignoreElements: (element) => {
             // Ignore any elements with explicit ignore class if needed
             return element.classList.contains('export-ignore');
          }
        });
        
        const link = document.createElement('a');
        link.download = `SmartPlan-${selectedDayName}-${selectedDate.toISOString().split('T')[0]}.png`;
        link.href = canvas.toDataURL('image/png');
        
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
      } catch (error: any) {
        console.error("Export failed:", error);
        alert(`Export failed: ${error.message || 'Unknown error'}. Please try again.`);
      } finally {
        setIsExporting(false);
      }
    }
  };

  const getTypeStyle = (type: ScheduledTask['type']) => {
    switch (type) {
      case 'fixed': return 'border-blue-500 bg-blue-50 text-blue-700';
      case 'routine': return 'border-green-500 bg-green-50 text-green-700';
      case 'homework': return 'border-purple-500 bg-purple-50 text-purple-700';
      case 'project': return 'border-orange-500 bg-orange-50 text-orange-700';
      default: return 'border-gray-500 bg-gray-50 text-gray-700';
    }
  };

  const changeDate = (days: number) => {
      const newDate = new Date(selectedDate);
      newDate.setDate(selectedDate.getDate() + days);
      setSelectedDate(newDate);
  }

  return (
    <div className="flex flex-col h-full bg-gray-50/50 relative">
      {/* Top Header */}
      <div className="p-6 pb-2 shrink-0">
        <div className="flex justify-between items-center mb-6">
           <div>
             <h2 className="text-2xl font-bold text-gray-900">Daily Board</h2>
             <p className="text-gray-500 text-sm">Organize your day, effectively.</p>
           </div>
           
           <div className="flex items-center gap-4 bg-white p-1.5 rounded-xl shadow-sm border border-gray-100">
              <button onClick={() => changeDate(-1)} className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-lg text-gray-500">
                  <ChevronLeft size={18} />
              </button>
              <div className="text-center w-32 cursor-pointer group relative">
                  <div className="text-sm font-bold text-gray-800">{selectedDayName}</div>
                  <div className="text-xs text-gray-400">{selectedDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric'})}</div>
                  
                  <input 
                    type="date" 
                    className="absolute inset-0 opacity-0 cursor-pointer" 
                    onChange={(e) => {
                        if(e.target.valueAsDate) setSelectedDate(e.target.valueAsDate)
                    }} 
                  />
              </div>
              <button onClick={() => changeDate(1)} className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-lg text-gray-500">
                  <ChevronRight size={18} />
              </button>
              <div className="w-px h-6 bg-gray-200 mx-1"></div>
               {onGenerate && (
                 <button onClick={onGenerate} className="flex items-center gap-2 px-3 py-1.5 bg-gray-900 text-white rounded-lg text-xs font-medium hover:bg-gray-800 transition">
                    <RotateCw size={12} /> Re-Generate
                 </button>
               )}
           </div>
        </div>

        {/* Weekly Navigator Tabs */}
        <div className="flex justify-between gap-2 overflow-x-auto pb-4 no-scrollbar">
          {weekDays.map((d, index) => {
             const isSelected = d.toDateString() === selectedDate.toDateString();
             const isToday = d.toDateString() === new Date().toDateString();
             
             return (
               <button
                 key={index}
                 onClick={() => setSelectedDate(d)}
                 className={`flex-1 min-w-[80px] flex flex-col items-center justify-center py-3 rounded-2xl transition-all border
                   ${isSelected 
                     ? 'bg-gray-900 text-white border-gray-900 shadow-lg scale-105' 
                     : 'bg-white text-gray-400 border-transparent hover:bg-white hover:shadow-sm'
                   }`}
               >
                 <span className={`text-xs mb-1 ${isSelected ? 'opacity-80' : 'text-gray-400'} ${isToday && !isSelected ? 'text-blue-600 font-bold' : ''}`}>
                    {DAYS[d.getDay() === 0 ? 6 : d.getDay() - 1]}
                 </span>
                 <span className={`text-xl font-bold font-mono ${isSelected ? 'text-white' : 'text-gray-300'} ${isToday && !isSelected ? 'text-blue-600' : ''}`}>
                    {d.getDate()}
                 </span>
               </button>
             )
          })}
        </div>
      </div>

      {/* Main Board Area - Scrollable */}
      <div className="flex-1 overflow-y-auto px-6 pb-20">
        
        {/* The Capture Target - Only this part will be in the image */}
        <div 
            ref={captureRef} 
            className="bg-white rounded-[2rem] shadow-sm border border-gray-100 min-h-[500px] p-6 relative"
        >
            {/* Header inside the capture to show context in image */}
            <div className="absolute top-6 right-6 opacity-0 export-visible">
                <span className="text-gray-300 font-bold text-xl">{selectedDayName}</span>
            </div>

            {dayTasks.length === 0 ? (
                <div className="absolute inset-0 flex flex-col items-center justify-center py-20 animate-fadeIn">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                        <Wand2 className="text-gray-300" size={32} />
                    </div>
                    <p className="text-gray-500 font-medium mb-2">No tasks for this day.</p>
                    {onGenerate ? (
                      <button onClick={onGenerate} data-html2canvas-ignore className="text-blue-600 font-bold hover:underline text-sm">
                        Generate Now
                      </button>
                    ) : (
                       <p className="text-xs text-gray-400">Go to Input Center to add tasks.</p>
                    )}
                </div>
            ) : (
                <DragDropContext onDragEnd={handleDragEnd}>
                    <Droppable droppableId="day-column">
                        {(provided) => (
                            <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4 pb-12">
                                {dayTasks.map((task, index) => (
                                    <Draggable key={task.id} draggableId={task.id} index={index}>
                                        {(provided, snapshot) => (
                                            <div
                                                ref={provided.innerRef}
                                                {...provided.draggableProps}
                                                {...provided.dragHandleProps}
                                                style={{...provided.draggableProps.style}}
                                                className={`group relative p-5 rounded-2xl border transition-all hover:shadow-md
                                                    ${snapshot.isDragging ? 'shadow-xl rotate-1 scale-105 z-50 bg-white' : 'bg-white'}
                                                    ${task.isCompleted ? 'opacity-60 bg-gray-50/50 border-gray-100' : 'border-gray-100'}
                                                `}
                                            >
                                                <div className="flex justify-between items-start mb-3">
                                                    <div className="flex flex-col">
                                                        <div className="flex items-center gap-2 mb-2">
                                                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${getTypeStyle(task.type)}`}>
                                                                {task.period} {task.specificTime ? `• ${task.specificTime}` : ''}
                                                            </span>
                                                            {task.isPostponed && <span className="text-[10px] font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full">Postponed</span>}
                                                        </div>
                                                        <h3 className={`font-bold text-lg text-gray-800 transition-all ${task.isCompleted ? 'line-through text-gray-400' : ''}`}>
                                                            {task.isReplaced ? (
                                                                <span>{task.replacedWith} <span className="text-sm text-gray-400 font-normal line-through ml-2">{task.originalName}</span></span>
                                                            ) : (
                                                                task.originalName
                                                            )}
                                                        </h3>
                                                    </div>
                                                    
                                                    {/* Hover Actions (Ignored in export to keep it clean) */}
                                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" data-html2canvas-ignore>
                                                        <button onClick={() => setEditingTask(task)} className="p-2 text-gray-400 hover:text-blue-600 rounded-full hover:bg-blue-50 transition">
                                                            <Edit2 size={16} />
                                                        </button>
                                                        <button onClick={() => handleDelete(task.id)} className="p-2 text-gray-400 hover:text-red-600 rounded-full hover:bg-red-50 transition">
                                                            <X size={16} />
                                                        </button>
                                                    </div>
                                                </div>

                                                {(task.note || task.isPostponed) && (
                                                    <p className="text-sm text-gray-500 mb-4 bg-gray-50/80 p-3 rounded-lg border border-gray-100/50">
                                                        {task.note}
                                                    </p>
                                                )}

                                                <div className="flex items-center gap-3 mt-4" data-html2canvas-ignore>
                                                    <button 
                                                        onClick={() => toggleComplete(task.id)}
                                                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold transition-all transform active:scale-95 ${
                                                            task.isCompleted 
                                                            ? 'bg-green-100 text-green-700 shadow-none border border-green-200' 
                                                            : 'bg-white border-2 border-gray-100 text-gray-600 hover:border-green-500 hover:text-green-600 shadow-sm'
                                                        }`}
                                                    >
                                                        {task.isCompleted ? <Check size={18} strokeWidth={3} /> : <div className="w-4 h-4 rounded-full border-2 border-gray-300"></div>}
                                                        {task.isCompleted ? 'Completed' : 'Mark Complete'}
                                                    </button>
                                                    
                                                    {!task.isCompleted && (
                                                        <>
                                                            <button 
                                                                onClick={() => setSubstitutingTask(task)}
                                                                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors border ${
                                                                    task.isReplaced 
                                                                    ? 'bg-yellow-100 text-yellow-700 border-yellow-200' 
                                                                    : 'bg-white border-gray-100 text-gray-500 hover:bg-yellow-50 hover:text-yellow-600 hover:border-yellow-200'
                                                                }`}
                                                                title="Substitute"
                                                            >
                                                                <RotateCw size={18} />
                                                            </button>
                                                            <button 
                                                                onClick={() => handlePostpone(task.id)}
                                                                className="px-4 py-2 rounded-xl text-sm font-medium bg-white border border-gray-100 text-gray-500 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
                                                                title="Postpone"
                                                            >
                                                                <Clock size={18} />
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </Draggable>
                                ))}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                </DragDropContext>
            )}
        </div>
        
        {/* Export Button - Outside the capture area */}
        {dayTasks.length > 0 && (
           <div className="mt-6 flex justify-center pb-6">
             <button 
                onClick={exportAsImage} 
                disabled={isExporting}
                className="flex items-center gap-2 text-gray-500 hover:text-gray-900 text-sm transition bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100 hover:shadow-md disabled:opacity-50"
             >
               {isExporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />} 
               {isExporting ? 'Exporting...' : 'Export Plan as Image'}
             </button>
           </div>
        )}
      </div>

      {/* --- Modals --- */}
      
      {/* Edit Modal */}
      {editingTask && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-fadeIn">
            <h3 className="text-lg font-bold mb-4">Edit Task</h3>
            <div className="space-y-4">
               <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">Task Name</label>
                  <input id="edit-name" defaultValue={editingTask.originalName} className="w-full mt-1 p-3 border rounded-xl bg-gray-50" />
               </div>
               <div>
                  <label className="text-xs font-bold text-gray-500 uppercase">Note</label>
                  <input id="edit-note" defaultValue={editingTask.note} className="w-full mt-1 p-3 border rounded-xl bg-gray-50" />
               </div>
               <div className="flex gap-3 mt-6">
                 <button onClick={() => setEditingTask(null)} className="flex-1 py-3 text-gray-500 font-medium hover:bg-gray-100 rounded-xl">Cancel</button>
                 <button onClick={() => {
                    const name = (document.getElementById('edit-name') as HTMLInputElement).value;
                    const note = (document.getElementById('edit-note') as HTMLInputElement).value;
                    handleEditSave(name, note);
                 }} className="flex-1 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-black">Save</button>
               </div>
            </div>
          </div>
        </div>
      )}

      {/* Substitute Modal */}
      {substitutingTask && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6 shadow-2xl animate-fadeIn">
            <h3 className="text-lg font-bold mb-4">Substitute Task</h3>
            <p className="text-sm text-gray-500 mb-4">What did you do instead of "{substitutingTask.originalName}"?</p>
            <div className="space-y-4">
               <input id="sub-reason" placeholder="e.g. Rested, Played Games..." defaultValue={substitutingTask.replacedWith || ''} className="w-full p-3 border rounded-xl bg-gray-50" />
               <div className="flex gap-3 mt-6">
                 <button onClick={() => setSubstitutingTask(null)} className="flex-1 py-3 text-gray-500 font-medium hover:bg-gray-100 rounded-xl">Cancel</button>
                 <button onClick={() => {
                    const reason = (document.getElementById('sub-reason') as HTMLInputElement).value;
                    handleSubstituteSave(reason);
                 }} className="flex-1 py-3 bg-yellow-500 text-white font-bold rounded-xl hover:bg-yellow-600">Confirm</button>
               </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ScheduleBoard;