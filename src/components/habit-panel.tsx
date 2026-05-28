"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { useScheduleStore } from "@/store/schedule-store";
import { todayKey } from "@/utils/date";
import { getCompletionRate, getStreak } from "@/utils/habits";

export function HabitPanel() {
  const habits = useScheduleStore((state) => state.habits);
  const addHabit = useScheduleStore((state) => state.addHabit);
  const toggleHabit = useScheduleStore((state) => state.toggleHabit);
  const removeHabit = useScheduleStore((state) => state.removeHabit);
  const [name, setName] = useState("");
  const today = todayKey();

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!name.trim()) return;
    addHabit(name);
    setName("");
  }

  return (
    <section className="rounded-lg border border-black/10 bg-white p-4 shadow-soft dark:border-white/10 dark:bg-[#191d23]">
      <div className="mb-4">
        <h2 className="text-base font-semibold">습관</h2>
        <p className="text-sm text-[#68707c] dark:text-[#aeb6bd]">연속 달성과 주간/월간 달성률</p>
      </div>
      <form onSubmit={submit} className="mb-3 flex gap-2">
        <input value={name} onChange={(event) => setName(event.target.value)} className="min-h-10 min-w-0 flex-1 rounded-lg border border-black/10 bg-[#f7f5f0] px-3 outline-none focus:border-[#2f8f7b] dark:border-white/10 dark:bg-[#111418]" placeholder="새 습관" />
        <button type="submit" className="grid h-10 w-10 place-items-center rounded-lg bg-[#2f8f7b] text-white" aria-label="습관 추가">
          <Plus size={18} />
        </button>
      </form>
      <div className="space-y-2">
        {habits.map((habit) => {
          const done = habit.completedDates.includes(today);
          return (
            <div key={habit.id} className="rounded-lg border border-black/10 p-3 dark:border-white/10">
              <div className="flex items-start gap-2">
                <button type="button" onClick={() => toggleHabit(habit.id, today)} className="mt-1 h-5 w-5 rounded-md border border-[#2f8f7b]" style={{ background: done ? habit.color : "transparent" }} aria-label="습관 완료 전환" />
                <div className="min-w-0 flex-1">
                  <div className="truncate font-medium">{habit.name}</div>
                  <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
                    <Stat label="연속" value={`${getStreak(habit.completedDates)}일`} />
                    <Stat label="7일" value={`${getCompletionRate(habit.completedDates, 7)}%`} />
                    <Stat label="30일" value={`${getCompletionRate(habit.completedDates, 30)}%`} />
                  </div>
                </div>
                <button type="button" onClick={() => removeHabit(habit.id)} className="grid h-8 w-8 place-items-center rounded-lg text-[#68707c] hover:bg-[#d76b4f]/10 hover:text-[#b94e33]" aria-label="습관 삭제">
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          );
        })}
        {habits.length === 0 && <div className="rounded-lg border border-dashed border-black/15 p-5 text-center text-sm text-[#68707c] dark:border-white/15 dark:text-[#aeb6bd]">아직 습관이 없습니다.</div>}
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-[#f7f5f0] p-2 dark:bg-[#111418]">
      <div className="font-semibold">{value}</div>
      <div className="text-[#68707c] dark:text-[#aeb6bd]">{label}</div>
    </div>
  );
}
