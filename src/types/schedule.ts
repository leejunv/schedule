export type CompletionFilter = "all" | "active" | "completed";

export type RecurrenceFrequency =
  | "NONE"
  | "DAILY"
  | "WEEKDAYS"
  | "WEEKLY"
  | "MONTHLY"
  | "YEARLY"
  | "CUSTOM";

export type Weekday = "SUN" | "MON" | "TUE" | "WED" | "THU" | "FRI" | "SAT";

export interface RecurrenceRule {
  frequency: RecurrenceFrequency;
  interval?: number;
  weekdays?: Weekday[];
  monthlyDate?: number;
  endsOn?: string;
  count?: number;
  carryOver?: boolean;
  sourceRule?: string;
}

export interface Reminder {
  enabled: boolean;
  minutesBefore: number;
}

export interface Task {
  id: string;
  title: string;
  notes?: string;
  date: string;
  completedDates: string[];
  category: string;
  order: number;
  recurrence?: RecurrenceRule;
  reminder?: Reminder;
  createdAt: string;
  updatedAt: string;
}

export interface DayNote {
  date: string;
  body: string;
}

export interface TaskFilters {
  query: string;
  category: string;
  completion: CompletionFilter;
  recurrenceOnly: boolean;
}

export interface ScheduleState {
  selectedDate: string;
  visibleMonth: string;
  tasks: Task[];
  notes: Record<string, DayNote>;
  filters: TaskFilters;
  hideCompleted: boolean;
  theme: "light" | "dark";
}
