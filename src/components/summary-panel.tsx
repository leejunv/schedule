"use client";

import { AlertCircle, CheckCircle2, Flame } from "lucide-react";
import { selectTasksForDate, useScheduleStore } from "@/store/schedule-store";
import { todayKey } from "@/utils/date";
import { getStreak } from "@/utils/habits";

export function SummaryPanel() {
  const state = useScheduleStore();
  const today = todayKey();
  const tasks = selectTasksForDate(state, today);
  const done = tasks.filter((task) => task.completedDates.includes(today)).length;
  const high = tasks.filter((task) => task.priority === "high" && !task.completedDates.includes(today)).length;
  const rate = tasks.length ? Math.round((done / tasks.length) * 100) : 0;
  const bestStreak = Math.max(0, ...state.habits.map((habit) => getStreak(habit.completedDates)));

  return (
    <section className="rounded-lg border border-black/10 bg-white p-4 shadow-soft dark:border-white/10 dark:bg-[#191d23]">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-base font-semibold">오늘</h2>
        <span className="text-sm text-[#68707c] dark:text-[#aeb6bd]">{rate}% 완료</span>
      </div>
      <div className="h-2 rounded-full bg-black/10 dark:bg-white/10">
        <div className="h-2 rounded-full bg-[#2f8f7b]" style={{ width: `${rate}%` }} />
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
        <Metric icon={<CheckCircle2 size={16} />} label="완료" value={`${done}/${tasks.length}`} />
        <Metric icon={<AlertCircle size={16} />} label="높음" value={String(high)} />
        <Metric icon={<Flame size={16} />} label="연속" value={`${bestStreak}일`} />
      </div>
    </section>
  );
}

function Metric({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-lg bg-[#f7f5f0] p-3 dark:bg-[#111418]">
      <div className="mb-2 text-[#2f8f7b]">{icon}</div>
      <div className="text-lg font-semibold">{value}</div>
      <div className="text-xs text-[#68707c] dark:text-[#aeb6bd]">{label}</div>
    </div>
  );
}
