"use client";

import { useMemo, useState } from "react";
import { closestCenter, DndContext, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { CalendarClock, Check, GripVertical, Plus, Repeat, Trash2 } from "lucide-react";
import type { Priority, RecurrenceRule, Task, Weekday } from "@/types/schedule";
import { selectTasksForDate, useScheduleStore } from "@/store/schedule-store";
import { formatReadable } from "@/utils/date";
import { recurrenceToLabel, recurrenceToShortLabel } from "@/utils/recurrence";
import { cn } from "@/utils/ui";

const quickRecurrences: { label: string; rule?: RecurrenceRule }[] = [
  { label: "한 번" },
  { label: "매일", rule: { frequency: "DAILY", sourceRule: "DAILY" } },
  { label: "평일", rule: { frequency: "WEEKDAYS", sourceRule: "WEEKDAYS" } },
  { label: "매주", rule: { frequency: "WEEKLY", sourceRule: "WEEKLY" } },
  { label: "매월", rule: { frequency: "MONTHLY", sourceRule: "MONTHLY" } }
];

const weekdayOptions: Weekday[] = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
const weekdayLabels: Record<Weekday, string> = { MON: "월", TUE: "화", WED: "수", THU: "목", FRI: "금", SAT: "토", SUN: "일" };
const priorityLabels: Record<Priority, string> = { high: "높음", medium: "중간", low: "낮음" };
const filterLabels: Record<string, string> = {
  all: "전체",
  active: "미완료",
  completed: "완료",
  high: "높음",
  medium: "중간",
  low: "낮음"
};

export function DayPanel() {
  const state = useScheduleStore();
  const tasks = selectTasksForDate(state, state.selectedDate);
  const categories = useMemo(() => Array.from(new Set(state.tasks.map((task) => task.category))).filter(Boolean), [state.tasks]);
  const note = state.notes[state.selectedDate]?.body ?? "";

  function onDragEnd(event: DragEndEvent) {
    if (event.over && event.active.id !== event.over.id) {
      state.reorderTasks(state.selectedDate, String(event.active.id), String(event.over.id));
    }
  }

  return (
    <section className="rounded-lg border border-black/10 bg-white p-4 shadow-soft dark:border-white/10 dark:bg-[#191d23]">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold">{formatReadable(state.selectedDate)}</h2>
          <p className="text-sm text-[#68707c] dark:text-[#aeb6bd]">할 일, 메모, 반복, 알림 관리</p>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={state.hideCompleted} onChange={state.toggleHideCompleted} />
          완료 숨기기
        </label>
      </div>

      <QuickTaskForm />

      <div className="my-4 grid gap-2 sm:grid-cols-4">
        <FilterSelect label="카테고리" value={state.filters.category} onChange={(value) => state.setFilters({ category: value })} options={["all", ...categories]} />
        <FilterSelect label="상태" value={state.filters.completion} onChange={(value) => state.setFilters({ completion: value as typeof state.filters.completion })} options={["all", "active", "completed"]} />
        <FilterSelect label="우선순위" value={state.filters.priority} onChange={(value) => state.setFilters({ priority: value as Priority | "all" })} options={["all", "high", "medium", "low"]} />
        <label className="flex min-h-10 items-center gap-2 rounded-lg border border-black/10 px-3 text-sm dark:border-white/10">
          <input type="checkbox" checked={state.filters.recurrenceOnly} onChange={(event) => state.setFilters({ recurrenceOnly: event.target.checked })} />
          반복만 보기
        </label>
      </div>

      <DndContext collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={tasks.map((task) => task.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {tasks.map((task) => (
              <TaskRow key={task.id} task={task} date={state.selectedDate} />
            ))}
            {tasks.length === 0 && <div className="rounded-lg border border-dashed border-black/15 p-8 text-center text-sm text-[#68707c] dark:border-white/15 dark:text-[#aeb6bd]">이 날짜에 표시할 일정이 없습니다.</div>}
          </div>
        </SortableContext>
      </DndContext>

      <label className="mt-4 block">
        <span className="mb-2 block text-sm font-medium">날짜 메모</span>
        <textarea
          value={note}
          onChange={(event) => state.setDayNote(state.selectedDate, event.target.value)}
          className="min-h-24 w-full resize-y rounded-lg border border-black/10 bg-[#f7f5f0] p-3 outline-none focus:border-[#2f8f7b] dark:border-white/10 dark:bg-[#111418]"
          placeholder="이 날짜에 대한 메모"
        />
      </label>
    </section>
  );
}

function QuickTaskForm() {
  const selectedDate = useScheduleStore((state) => state.selectedDate);
  const addTask = useScheduleStore((state) => state.addTask);
  const [title, setTitle] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [category, setCategory] = useState("일반");
  const [recurrence, setRecurrence] = useState<RecurrenceRule | undefined>();
  const [customOpen, setCustomOpen] = useState(false);
  const [customInterval, setCustomInterval] = useState(2);
  const [customWeekdays, setCustomWeekdays] = useState<Weekday[]>(["MON", "WED", "FRI"]);
  const [asHabit, setAsHabit] = useState(false);
  const hasCustomWeekdays = customWeekdays.length > 0;
  const customWeekdayRule = `WEEKLY:${customWeekdays.join(",")}`;
  const customIntervalRule = `CUSTOM:${customInterval}`;

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!title.trim()) return;
    addTask({ title, date: selectedDate, priority, category, recurrence, asHabit });
    setTitle("");
  }

  function updateCustomInterval(value: string) {
    const parsed = Number(value);
    setCustomInterval(Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : 1);
  }

  return (
    <form onSubmit={submit} className="rounded-lg bg-[#f7f5f0] p-3 dark:bg-[#111418]">
      <div className="flex flex-col gap-2 sm:flex-row">
        <input value={title} onChange={(event) => setTitle(event.target.value)} className="min-h-11 flex-1 rounded-lg border border-black/10 bg-white px-3 outline-none focus:border-[#2f8f7b] dark:border-white/10 dark:bg-[#191d23]" placeholder="빠르게 할 일 추가" />
        <button type="submit" className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-[#2f8f7b] px-4 font-medium text-white">
          <Plus size={18} />
          추가
        </button>
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-[130px_1fr_120px]">
        <select value={priority} onChange={(event) => setPriority(event.target.value as Priority)} className="rounded-lg border border-black/10 bg-white px-3 py-2 dark:border-white/10 dark:bg-[#191d23]">
          <option value="high">높음</option>
          <option value="medium">중간</option>
          <option value="low">낮음</option>
        </select>
        <input value={category} onChange={(event) => setCategory(event.target.value)} className="rounded-lg border border-black/10 bg-white px-3 py-2 dark:border-white/10 dark:bg-[#191d23]" placeholder="카테고리" />
        <label className="flex items-center gap-2 rounded-lg border border-black/10 bg-white px-3 text-sm dark:border-white/10 dark:bg-[#191d23]">
          <input type="checkbox" checked={asHabit} onChange={(event) => setAsHabit(event.target.checked)} />
          습관
        </label>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {quickRecurrences.map((item) => (
          <button key={item.label} type="button" onClick={() => setRecurrence(item.rule)} className={cn("rounded-lg border px-3 py-2 text-sm", recurrence?.sourceRule === item.rule?.sourceRule || (!recurrence && !item.rule) ? "border-[#2f8f7b] bg-[#2f8f7b]/10" : "border-black/10 dark:border-white/10")}>
            {item.label}
          </button>
        ))}
        <button type="button" onClick={() => setCustomOpen(!customOpen)} className="rounded-lg border border-black/10 px-3 py-2 text-sm dark:border-white/10">
          사용자 지정
        </button>
      </div>
      {customOpen && (
        <div className="mt-3 rounded-lg border border-black/10 bg-white p-3 dark:border-white/10 dark:bg-[#191d23]">
          <div className="grid gap-2 sm:grid-cols-[150px_1fr]">
            <label className="text-sm">
              <span className="mb-1 block text-[#68707c] dark:text-[#aeb6bd]">n일마다</span>
              <input type="number" min={1} value={customInterval} onChange={(event) => updateCustomInterval(event.target.value)} className="w-full rounded-lg border border-black/10 bg-transparent px-3 py-2 dark:border-white/10" />
            </label>
            <div>
              <span className="mb-1 block text-sm text-[#68707c] dark:text-[#aeb6bd]">특정 요일</span>
              <div className="flex flex-wrap gap-1">
                {weekdayOptions.map((day) => (
                  <button key={day} type="button" onClick={() => setCustomWeekdays((current) => (current.includes(day) ? current.filter((item) => item !== day) : [...current, day]))} className={cn("rounded-md px-2 py-1 text-xs", customWeekdays.includes(day) ? "bg-[#2f8f7b] text-white" : "bg-black/5 dark:bg-white/10")}>
                    {weekdayLabels[day]}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setRecurrence({ frequency: "WEEKLY", interval: 1, weekdays: customWeekdays, sourceRule: customWeekdayRule })}
            disabled={!hasCustomWeekdays}
            className={cn(
              "mt-3 rounded-lg border px-3 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50",
              recurrence?.sourceRule === customWeekdayRule ? "border-[#2f8f7b] bg-[#2f8f7b] text-white" : "border-black/10 bg-white text-[#20242a] hover:bg-black/5 dark:border-white/10 dark:bg-[#191d23] dark:text-[#ece8df] dark:hover:bg-white/10"
            )}
          >
            요일 반복 적용
          </button>
          <button
            type="button"
            onClick={() => setRecurrence({ frequency: "CUSTOM", interval: customInterval, sourceRule: customIntervalRule })}
            className={cn(
              "ml-2 mt-3 rounded-lg border px-3 py-2 text-sm font-medium",
              recurrence?.sourceRule === customIntervalRule ? "border-[#2f8f7b] bg-[#2f8f7b] text-white" : "border-black/10 bg-white text-[#20242a] hover:bg-black/5 dark:border-white/10 dark:bg-[#191d23] dark:text-[#ece8df] dark:hover:bg-white/10"
            )}
          >
            n일 반복 적용
          </button>
          <p className="mt-2 text-xs text-[#68707c] dark:text-[#aeb6bd]">선택됨: {recurrenceToLabel(recurrence)}</p>
        </div>
      )}
    </form>
  );
}

function TaskRow({ task, date }: { task: Task; date: string }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: task.id });
  const toggleTask = useScheduleStore((state) => state.toggleTask);
  const deleteTask = useScheduleStore((state) => state.deleteTask);
  const updateTask = useScheduleStore((state) => state.updateTask);
  const completed = task.completedDates.includes(date);

  return (
    <div ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }} className="flex gap-2 rounded-lg border border-black/10 bg-white p-3 dark:border-white/10 dark:bg-[#111418]">
      <button type="button" className="touch-none text-[#68707c]" {...attributes} {...listeners} aria-label="일정 드래그">
        <GripVertical size={18} />
      </button>
      <button type="button" onClick={() => toggleTask(task.id, date)} className={cn("mt-0.5 grid h-6 w-6 place-items-center rounded-md border", completed ? "border-[#2f8f7b] bg-[#2f8f7b] text-white" : "border-black/20 dark:border-white/20")} aria-label="완료 상태 전환">
        {completed && <Check size={15} />}
      </button>
      <div className="min-w-0 flex-1">
        <input value={task.title} onChange={(event) => updateTask(task.id, { title: event.target.value })} className={cn("w-full bg-transparent font-medium outline-none", completed && "text-[#68707c] line-through dark:text-[#aeb6bd]")} />
        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-[#68707c] dark:text-[#aeb6bd]">
          <span className={cn("rounded-full px-2 py-1", task.priority === "high" ? "bg-[#d76b4f]/15 text-[#b94e33]" : task.priority === "medium" ? "bg-[#d9b45f]/20 text-[#8a641c]" : "bg-[#2f8f7b]/15 text-[#2f8f7b]")}>{priorityLabels[task.priority]}</span>
          <span>{task.category}</span>
          {task.recurrence && (
            <span className="inline-flex items-center gap-1">
              <Repeat size={12} />
              {recurrenceToShortLabel(task.recurrence)}
            </span>
          )}
          {task.reminder?.enabled && (
            <span className="inline-flex items-center gap-1">
              <CalendarClock size={12} />
              {task.reminder.minutesBefore}분 전
            </span>
          )}
        </div>
        {task.recurrence && <div className="mt-1 text-xs text-[#68707c] dark:text-[#aeb6bd]">{recurrenceToLabel(task.recurrence)}</div>}
      </div>
      <button type="button" onClick={() => deleteTask(task.id)} className="grid h-8 w-8 place-items-center rounded-lg text-[#68707c] hover:bg-[#d76b4f]/10 hover:text-[#b94e33]" aria-label="일정 삭제">
        <Trash2 size={16} />
      </button>
    </div>
  );
}

function FilterSelect({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return (
    <label className="block text-sm">
      <span className="sr-only">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} className="min-h-10 w-full rounded-lg border border-black/10 bg-white px-3 dark:border-white/10 dark:bg-[#111418]">
        {options.map((option) => (
          <option key={option} value={option}>
            {filterLabels[option] ?? option}
          </option>
        ))}
      </select>
    </label>
  );
}
