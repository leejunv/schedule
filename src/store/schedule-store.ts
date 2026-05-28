"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { addMonths, parseISO } from "date-fns";
import type { Habit, Priority, RecurrenceRule, ScheduleState, Task, TaskFilters } from "@/types/schedule";
import { monthKey, todayKey } from "@/utils/date";
import { occursOnDate } from "@/utils/recurrence";

const defaultFilters: TaskFilters = {
  query: "",
  category: "all",
  completion: "all",
  priority: "all",
  recurrenceOnly: false
};

type DraftTask = {
  title: string;
  date: string;
  priority?: Priority;
  category?: string;
  notes?: string;
  recurrence?: RecurrenceRule;
  reminderMinutes?: number;
  asHabit?: boolean;
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
  addHabit: (name: string) => void;
  toggleHabit: (id: string, date: string) => void;
  removeHabit: (id: string) => void;
  toggleTheme: () => void;
  importData: (data: ScheduleState) => void;
  reset: () => void;
}

const initialState: ScheduleState = {
  selectedDate: todayKey(),
  visibleMonth: monthKey(new Date()),
  tasks: [],
  habits: [],
  notes: {},
  filters: defaultFilters,
  hideCompleted: false,
  theme: "light"
};

function createId(prefix: string) {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
}

function now() {
  return new Date().toISOString();
}

export const useScheduleStore = create<ScheduleState & ScheduleActions>()(
  persist(
    (set) => ({
      ...initialState,
      setSelectedDate: (date) => set({ selectedDate: date, visibleMonth: monthKey(parseISO(date)) }),
      shiftMonth: (amount) => set((state) => ({ visibleMonth: monthKey(addMonths(parseISO(`${state.visibleMonth}-01`), amount)) })),
      setVisibleMonth: (visibleMonth) => set({ visibleMonth }),
      addTask: (draft) =>
        set((state) => {
          const habitId = draft.asHabit ? createId("habit") : undefined;
          const task: Task = {
            id: createId("task"),
            title: draft.title.trim(),
            notes: draft.notes?.trim(),
            date: draft.date,
            completedDates: [],
            priority: draft.priority ?? "medium",
            category: draft.category?.trim() || "일반",
            order: state.tasks.filter((item) => occursOnDate(item.date, draft.date, item.recurrence)).length,
            recurrence: draft.recurrence,
            habitId,
            reminder: draft.reminderMinutes ? { enabled: true, minutesBefore: draft.reminderMinutes } : undefined,
            createdAt: now(),
            updatedAt: now()
          };
          const habit: Habit | undefined = habitId
            ? { id: habitId, name: task.title, color: "#2f8f7b", linkedTaskId: task.id, completedDates: [], createdAt: now() }
            : undefined;
          return {
            tasks: [...state.tasks, task],
            habits: habit ? [...state.habits, habit] : state.habits
          };
        }),
      updateTask: (id, patch) =>
        set((state) => ({
          tasks: state.tasks.map((task) => (task.id === id ? { ...task, ...patch, updatedAt: now() } : task))
        })),
      deleteTask: (id) =>
        set((state) => ({
          tasks: state.tasks.filter((task) => task.id !== id),
          habits: state.habits.filter((habit) => habit.linkedTaskId !== id)
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
          }),
          habits: state.habits.map((habit) => {
            const linked = state.tasks.find((task) => task.id === id && task.habitId === habit.id);
            if (!linked) return habit;
            const done = habit.completedDates.includes(date);
            return { ...habit, completedDates: done ? habit.completedDates.filter((item) => item !== date) : [...habit.completedDates, date] };
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
      addHabit: (name) =>
        set((state) => ({
          habits: [...state.habits, { id: createId("habit"), name: name.trim(), color: "#d76b4f", completedDates: [], createdAt: now() }]
        })),
      toggleHabit: (id, date) =>
        set((state) => ({
          habits: state.habits.map((habit) =>
            habit.id === id
              ? { ...habit, completedDates: habit.completedDates.includes(date) ? habit.completedDates.filter((item) => item !== date) : [...habit.completedDates, date] }
              : habit
          )
        })),
      removeHabit: (id) => set((state) => ({ habits: state.habits.filter((habit) => habit.id !== id) })),
      toggleTheme: () => set((state) => ({ theme: state.theme === "light" ? "dark" : "light" })),
      importData: (data) => set({ ...initialState, ...data }),
      reset: () => set(initialState)
    }),
    {
      name: "dailysync-store",
      version: 1
    }
  )
);

export function selectTasksForDate(state: ScheduleState, date: string) {
  return state.tasks
    .filter((task) => occursOnDate(task.date, date, task.recurrence))
    .filter((task) => {
      const done = task.completedDates.includes(date);
      const query = state.filters.query.trim().toLowerCase();
      if (state.hideCompleted && done) return false;
      if (state.filters.completion === "completed" && !done) return false;
      if (state.filters.completion === "active" && done) return false;
      if (state.filters.priority !== "all" && task.priority !== state.filters.priority) return false;
      if (state.filters.category !== "all" && task.category !== state.filters.category) return false;
      if (state.filters.recurrenceOnly && !task.recurrence) return false;
      if (query && !`${task.title} ${task.category} ${task.notes ?? ""}`.toLowerCase().includes(query)) return false;
      return true;
    })
    .sort((a, b) => Number(a.completedDates.includes(date)) - Number(b.completedDates.includes(date)) || priorityRank(a.priority) - priorityRank(b.priority) || a.order - b.order);
}

export function priorityRank(priority: Priority) {
  return { high: 0, medium: 1, low: 2 }[priority];
}
