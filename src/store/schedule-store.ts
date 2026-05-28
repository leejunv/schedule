"use client";

import { create } from "zustand";
import { addMonths, parseISO } from "date-fns";
import type { RecurrenceRule, ScheduleState, Task, TaskFilters } from "@/types/schedule";
import { mergeDefaultTasks } from "@/lib/default-schedule";
import { monthKey, todayKey } from "@/utils/date";
import { occursOnDate } from "@/utils/recurrence";

const defaultFilters: TaskFilters = {
  query: "",
  category: "all",
  completion: "all",
  recurrenceOnly: false
};

type DraftTask = {
  title: string;
  date: string;
  category?: string;
  notes?: string;
  recurrence?: RecurrenceRule;
  reminderMinutes?: number;
};

interface ScheduleActions {
  setSelectedDate: (date: string) => void;
  shiftMonth: (amount: number) => void;
  setVisibleMonth: (month: string) => void;
  addTask: (task: DraftTask) => void;
  updateTask: (id: string, patch: Partial<Task>, scope?: "single" | "series") => void;
  deleteTask: (id: string) => void;
  toggleTask: (id: string, date: string) => void;
  reorderTasks: (date: string, activeId: string, overId: string) => void;
  setFilters: (patch: Partial<TaskFilters>) => void;
  toggleHideCompleted: () => void;
  setDayNote: (date: string, body: string) => void;
  toggleTheme: () => void;
  importData: (data: ScheduleState) => void;
  reset: () => void;
}

const initialState: ScheduleState = {
  selectedDate: todayKey(),
  visibleMonth: monthKey(new Date()),
  tasks: [],
  notes: {},
  filters: defaultFilters,
  hideCompleted: false,
  theme: "light"
};

function normalizeSchedule(data: Partial<ScheduleState> | undefined): ScheduleState {
  return {
    ...initialState,
    selectedDate: data?.selectedDate ?? initialState.selectedDate,
    visibleMonth: data?.visibleMonth ?? initialState.visibleMonth,
    tasks: Array.isArray(data?.tasks) ? data.tasks : [],
    notes: data?.notes ?? {},
    filters: { ...defaultFilters, ...data?.filters },
    hideCompleted: data?.hideCompleted ?? false,
    theme: data?.theme ?? "light"
  };
}

function createId(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function now() {
  return new Date().toISOString();
}

export const useScheduleStore = create<ScheduleState & ScheduleActions>()((set) => ({
  ...initialState,
  setSelectedDate: (date) => set({ selectedDate: date, visibleMonth: monthKey(parseISO(date)) }),
  shiftMonth: (amount) => set((state) => ({ visibleMonth: monthKey(addMonths(parseISO(`${state.visibleMonth}-01`), amount)) })),
  setVisibleMonth: (visibleMonth) => set({ visibleMonth }),
  addTask: (draft) =>
    set((state) => {
      const task: Task = {
        id: createId("task"),
        title: draft.title.trim(),
        notes: draft.notes?.trim(),
        date: draft.date,
        completedDates: [],
        category: draft.category?.trim() || "일반",
        order: state.tasks.filter((item) => occursOnDate(item.date, draft.date, item.recurrence)).length,
        recurrence: draft.recurrence,
        reminder: draft.reminderMinutes ? { enabled: true, minutesBefore: draft.reminderMinutes } : undefined,
        createdAt: now(),
        updatedAt: now()
      };
      return {
        tasks: [...state.tasks, task]
      };
    }),
  updateTask: (id, patch) =>
    set((state) => ({
      tasks: state.tasks.map((task) => (task.id === id ? { ...task, ...patch, updatedAt: now() } : task))
    })),
  deleteTask: (id) =>
    set((state) => ({
      tasks: state.tasks.filter((task) => task.id !== id)
    })),
  toggleTask: (id, date) =>
    set((state) => ({
      tasks: state.tasks.map((task) => {
        if (task.id !== id) return task;
        const done = task.completedDates.includes(date);
        return {
          ...task,
          completedDates: done ? task.completedDates.filter((item) => item !== date) : [...task.completedDates, date],
          updatedAt: now()
        };
      })
    })),
  reorderTasks: (date, activeId, overId) =>
    set((state) => {
      const dayTasks = state.tasks.filter((task) => occursOnDate(task.date, date, task.recurrence)).sort((a, b) => a.order - b.order);
      const from = dayTasks.findIndex((task) => task.id === activeId);
      const to = dayTasks.findIndex((task) => task.id === overId);
      if (from < 0 || to < 0) return state;
      const [moved] = dayTasks.splice(from, 1);
      dayTasks.splice(to, 0, moved);
      const orderMap = new Map(dayTasks.map((task, index) => [task.id, index]));
      return { tasks: state.tasks.map((task) => (orderMap.has(task.id) ? { ...task, order: orderMap.get(task.id) ?? task.order } : task)) };
    }),
  setFilters: (patch) => set((state) => ({ filters: { ...state.filters, ...patch } })),
  toggleHideCompleted: () => set((state) => ({ hideCompleted: !state.hideCompleted })),
  setDayNote: (date, body) =>
    set((state) => ({
      notes: { ...state.notes, [date]: { date, body } }
    })),
  toggleTheme: () => set((state) => ({ theme: state.theme === "light" ? "dark" : "light" })),
  importData: (data) => set(mergeDefaultTasks(normalizeSchedule(data))),
  reset: () => set(initialState)
}));

export function selectTasksForDate(state: ScheduleState, date: string) {
  return state.tasks
    .filter((task) => occursOnDate(task.date, date, task.recurrence))
    .filter((task) => {
      const done = task.completedDates.includes(date);
      const query = state.filters.query.trim().toLowerCase();
      if (state.hideCompleted && done) return false;
      if (state.filters.completion === "completed" && !done) return false;
      if (state.filters.completion === "active" && done) return false;
      if (state.filters.category !== "all" && task.category !== state.filters.category) return false;
      if (state.filters.recurrenceOnly && !task.recurrence) return false;
      if (query && !`${task.title} ${task.category} ${task.notes ?? ""}`.toLowerCase().includes(query)) return false;
      return true;
    })
    .sort((a, b) => Number(a.completedDates.includes(date)) - Number(b.completedDates.includes(date)) || a.order - b.order);
}

export function getPersistableSchedule(state: ScheduleState): ScheduleState {
  return mergeDefaultTasks({
    selectedDate: state.selectedDate,
    visibleMonth: state.visibleMonth,
    tasks: state.tasks,
    notes: state.notes,
    filters: state.filters,
    hideCompleted: state.hideCompleted,
    theme: state.theme
  });
}
