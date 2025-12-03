import React, { useEffect, useState } from 'react';
import { generateWeeklySummary } from '../services/geminiService';
import { ScheduledTask } from '../types';
import { Loader2, Sparkles, BarChart3 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface SummarySectionProps {
  tasks: ScheduledTask[];
}

const SummarySection: React.FC<SummarySectionProps> = ({ tasks }) => {
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Only generate if we have tasks and haven't generated yet (to save API calls)
  }, []);

  const handleGenerate = async () => {
    if (tasks.length === 0) {
      setSummary("No task data available. Cannot generate summary.");
      return;
    }
    setLoading(true);
    try {
      const result = await generateWeeklySummary(tasks);
      setSummary(result);
    } catch (e) {
      setSummary("Failed to generate summary. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-gray-900 p-8 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 p-10 opacity-10 transform translate-x-1/3 -translate-y-1/3">
              <Sparkles size={200} />
          </div>
          <h2 className="text-3xl font-bold flex items-center gap-3 relative z-10">
            <BarChart3 className="text-blue-400" />
            Weekly Insights
          </h2>
          <p className="opacity-70 mt-2 relative z-10">AI-powered analysis of your schedule and productivity.</p>
        </div>
        
        <div className="p-8 min-h-[400px]">
          {!summary && !loading && (
            <div className="text-center py-20">
              <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Sparkles size={32} />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">Ready for your report?</h3>
              <p className="text-gray-500 mb-8 max-w-md mx-auto">Click below to let AI analyze your completion rates and provide suggestions for next week.</p>
              <button 
                onClick={handleGenerate}
                className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition shadow-lg shadow-blue-200 transform hover:-translate-y-0.5"
              >
                Generate Summary (生成总结)
              </button>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center py-32 text-blue-600">
              <Loader2 className="animate-spin mb-4" size={48} />
              <p className="font-medium text-gray-500">Analyzing your schedule data...</p>
            </div>
          )}

          {summary && !loading && (
            <div className="animate-fadeIn">
                <div className="prose prose-lg max-w-none text-gray-700">
                    <ReactMarkdown>{summary}</ReactMarkdown>
                </div>
                
                <div className="mt-12 pt-8 border-t border-gray-100 flex justify-center">
                    <button onClick={handleGenerate} className="text-sm text-gray-400 hover:text-blue-600 underline transition">
                        Regenerate Report
                    </button>
                </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SummarySection;