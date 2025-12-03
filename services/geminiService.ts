import { GoogleGenAI, Type } from "@google/genai";
import { InputData, ScheduledTask, WeekDay, DAYS } from "../types";

// Support both standard process.env (Node) and import.meta.env (Vite/Vercel)
// The 'as any' cast is used to avoid TypeScript errors if types aren't fully set up for Vite
const apiKey = (import.meta as any).env?.VITE_API_KEY || process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

const MODEL_NAME = 'gemini-2.5-flash';

export const generateWeeklySchedule = async (data: InputData): Promise<ScheduledTask[]> => {
  if (!apiKey) {
    console.error("API Key is missing");
    throw new Error("API Key is missing");
  }

  const today = new Date();
  const prompt = `
    Role: You are an intelligent weekly planning assistant.
    Task: Generate a weekly schedule (Monday to Sunday) based on the user's inputs.
    Current Date: ${today.toDateString()}.
    
    Inputs:
    1. Fixed Events (Classes): Must happen at specified day and time. Period should be 'Fixed'.
    2. Daily Routines: Distribute these based on frequency per week.
    3. Homework: Schedule these before their deadline. Distribute 'sessionsNeeded' across available slots.
    4. Projects: Schedule these before their deadline. Distribute 'sessionsNeeded'.

    Data:
    ${JSON.stringify(data, null, 2)}

    Rules:
    - 'Fixed' events must preserve their exact time in the 'specificTime' field (e.g., "10:00-11:30").
    - Non-fixed tasks should be assigned a 'period': 'Morning', 'Afternoon', or 'Evening'.
    - Do not assign specific times to non-fixed tasks, just the period.
    - Ensure a reasonable workload per day.
    - Return a flat array of task objects.
    - Generate unique IDs for every task instance.
    - Keep the 'originalName' and 'note' in the SAME language as the input (if input is Chinese, output Chinese).
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              originalName: { type: Type.STRING },
              type: { type: Type.STRING, enum: ['fixed', 'routine', 'homework', 'project'] },
              day: { type: Type.STRING, enum: DAYS },
              period: { type: Type.STRING, enum: ['Morning', 'Afternoon', 'Evening', 'Fixed'] },
              specificTime: { type: Type.STRING },
              durationDisplay: { type: Type.STRING },
              note: { type: Type.STRING },
            },
            required: ['id', 'originalName', 'type', 'day', 'period'],
          },
        },
      },
    });

    const rawTasks = JSON.parse(response.text || '[]') as any[];
    
    // Sanitize and hydrate with default state fields
    return rawTasks.map(task => ({
      ...task,
      isCompleted: false,
      isPostponed: false,
      isReplaced: false,
    }));

  } catch (error) {
    console.error("Error generating schedule:", error);
    throw error;
  }
};

export const generateWeeklySummary = async (schedule: ScheduledTask[]): Promise<string> => {
  if (!apiKey) return "API Key missing. Cannot generate summary.";

  const completedCount = schedule.filter(t => t.isCompleted).length;
  const totalCount = schedule.length;
  const replacedCount = schedule.filter(t => t.isReplaced).length;
  const postponedCount = schedule.filter(t => t.isPostponed).length;
  const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const prompt = `
    Role: You are a sharp, empathetic, and data-driven productivity coach.
    Task: Write a comprehensive weekly performance review based on the user's schedule data.
    Language: **Chinese (Simplified)**.
    Tone: Natural, human-like, and personalized. Avoid robotic headers like "Introduction" or generic pleasantries. Be direct. 
    
    Guidelines:
    - If the completion rate is high (>80%), praise them enthusiastically and highlight what went well.
    - If the completion rate is low (<50%), be critical but constructive. Ask them to reflect on why.
    - If there are many "Replaced" tasks, ask if they are procrastinating or just adapting flexibly.
    - Use Markdown for formatting (bolding, lists, headers).

    Stats:
    - Total Tasks: ${totalCount}
    - Completed: ${completedCount} (Rate: ${completionRate}%)
    - Replaced (Alternative Activity): ${replacedCount}
    - Postponed: ${postponedCount}

    Detailed Task Log:
    ${JSON.stringify(schedule.map(t => ({ 
        name: t.originalName, 
        day: t.day, 
        status: t.isCompleted ? 'Completed' : (t.isReplaced ? `Replaced with ${t.replacedWith}` : (t.isPostponed ? 'Postponed' : 'Missed')) 
    })), null, 2)}

    Required Structure (Use Markdown Headers):
    1. **本周数据透视 (Data Insights)**: Interpret the numbers. Don't just list them. What does the ${completionRate}% tell us?
    2. **深度复盘 (Deep Dive)**: Analyze specific days or patterns. Did they fail specifically on weekends? Did they substitute too much?
    3. **下周行动指南 (Action Plan)**: Give 2-3 specific, actionable suggestions for next week based on *this* week's performance. Encourage them or give them a wake-up call.
  `;

  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: prompt,
    });
    return response.text || "Unable to generate summary.";
  } catch (error) {
    console.error("Error generating summary", error);
    return "Error generating summary.";
  }
};