"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { getCalendarDays, isInMonth, isToday, toDateKey } from "@/utils/date";
import { selectTasksForDate, useScheduleStore } from "@/store/schedule-store";
import { cn } from "@/utils/ui";

const weekdays = ["일", "월", "화", "수", "목", "금", "토"];

export function CalendarView() {
  const state = useScheduleStore();
  const days = getCalendarDays(state.visibleMonth);

  return (
    <section className="rounded-lg border border-black/10 bg-white p-4 shadow-soft dark:border-white/10 dark:bg-[#191d23]">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold">{format(new Date(`${state.visibleMonth}-01T00:00:00`), "yyyy년 M월", { locale: ko })}</h2>
          <p className="text-sm text-[#68707c] dark:text-[#aeb6bd]">월간 일정과 완료율</p>
        </div>
        <div className="flex gap-1">
          <button className="grid h-9 w-9 place-items-center rounded-lg hover:bg-black/5 dark:hover:bg-white/10" type="button" onClick={() => state.shiftMonth(-1)} aria-label="이전 달">
            <ChevronLeft size={18} />
          </button>
          <button className="grid h-9 w-9 place-items-center rounded-lg hover:bg-black/5 dark:hover:bg-white/10" type="button" onClick={() => state.shiftMonth(1)} aria-label="다음 달">
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-[#68707c] dark:text-[#aeb6bd]">
        {weekdays.map((day) => (
          <div key={day} className="py-1">
            {day}
          </div>
        ))}
      </div>

      <div className="mt-1 grid grid-cols-7 gap-1">
        {days.map((date) => {
          const dateKey = toDateKey(date);
          const tasks = selectTasksForDate(state, dateKey);
          const done = tasks.filter((task) => task.completedDates.includes(dateKey)).length;
          const rate = tasks.length ? Math.round((done / tasks.length) * 100) : 0;
          const selected = state.selectedDate === dateKey;

          return (
            <button
              key={dateKey}
              type="button"
              onClick={() => state.setSelectedDate(dateKey)}
              className={cn(
                "aspect-square rounded-lg border p-1 text-left transition hover:border-[#2f8f7b] hover:bg-[#2f8f7b]/10",
                selected ? "border-[#2f8f7b] bg-[#2f8f7b]/15" : "border-transparent",
                !isInMonth(date, state.visibleMonth) && "opacity-40"
              )}
              aria-label={`${dateKey}, 일정 ${tasks.length}개`}
            >
              <div className="flex items-center justify-between gap-1">
                <span className={cn("grid h-6 w-6 place-items-center rounded-md text-sm", isToday(date) && "bg-[#d76b4f] text-white")}>{format(date, "d")}</span>
                {tasks.length > 0 && <span className="rounded-full bg-[#20242a]/10 px-1.5 text-[11px] dark:bg-white/10">{tasks.length}</span>}
              </div>
              <div className="mt-2 h-1 rounded-full bg-black/10 dark:bg-white/10">
                <div className="h-1 rounded-full bg-[#2f8f7b]" style={{ width: `${rate}%` }} />
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
