export type WeekDay = 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday' | 'Sunday';

export const DAYS: WeekDay[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const DAY_LABELS: Record<WeekDay, string> = {
  'Monday': '周一',
  'Tuesday': '周二',
  'Wednesday': '周三',
  'Thursday': '周四',
  'Friday': '周五',
  'Saturday': '周六',
  'Sunday': '周日'
};

export interface FixedEvent {
  id: string;
  name: string;
  day: WeekDay;
  startTime: string; // HH:MM
  endTime: string;   // HH:MM
  note?: string;
}

export interface DailyRoutine {
  id: string;
  name: string;
  frequencyPerWeek: number;
  durationMinutes: number;
  note?: string;
}

export interface Homework {
  id: string;
  name: string;
  sessionsNeeded: number;
  deadline: string; // YYYY-MM-DD
  note?: string;
}

export interface Project {
  id: string;
  name: string;
  sessionsNeeded: number;
  deadline: string; // YYYY-MM-DD
  note?: string;
}

export interface InputData {
  fixedEvents: FixedEvent[];
  routines: DailyRoutine[];
  homework: Homework[];
  projects: Project[];
}

export type TaskPeriod = 'Morning' | 'Afternoon' | 'Evening' | 'Fixed';

export const PERIOD_LABELS: Record<TaskPeriod, string> = {
  'Morning': '上午',
  'Afternoon': '下午',
  'Evening': '晚上',
  'Fixed': '固定'
};

export interface ScheduledTask {
  id: string;
  originalName: string;
  type: 'fixed' | 'routine' | 'homework' | 'project' | 'substitute';
  day: WeekDay;
  period: TaskPeriod;
  specificTime?: string; // For fixed events
  durationDisplay?: string;
  note?: string;
  isCompleted: boolean;
  isPostponed: boolean;
  isReplaced: boolean;
  replacedWith?: string;
}

export interface WeeklySchedule {
  [key: string]: ScheduledTask[]; // Key is WeekDay
}