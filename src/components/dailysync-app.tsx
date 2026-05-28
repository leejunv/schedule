"use client";

import { useEffect, useMemo, useState } from "react";
import { CalendarDays, CheckCircle2, Database, Moon, Search, Sun, TrendingUp } from "lucide-react";
import { CalendarView } from "@/components/calendar-view";
import { DataTools } from "@/components/data-tools";
import { DayPanel } from "@/components/day-panel";
import { HabitPanel } from "@/components/habit-panel";
import { SummaryPanel } from "@/components/summary-panel";
import { useScheduleStore } from "@/store/schedule-store";
import { cn } from "@/utils/ui";

type MobileTab = "calendar" | "tasks" | "habits" | "data";

export function DailySyncApp() {
  const theme = useScheduleStore((state) => state.theme);
  const toggleTheme = useScheduleStore((state) => state.toggleTheme);
  const filters = useScheduleStore((state) => state.filters);
  const setFilters = useScheduleStore((state) => state.setFilters);
  const [tab, setTab] = useState<MobileTab>("calendar");

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
  }, [theme]);

  useEffect(() => {
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    }
  }, []);

  const mobileTabs = useMemo(
    () => [
      { id: "calendar" as const, label: "캘린더", icon: CalendarDays },
      { id: "tasks" as const, label: "할 일", icon: CheckCircle2 },
      { id: "habits" as const, label: "습관", icon: TrendingUp },
      { id: "data" as const, label: "데이터", icon: Database }
    ],
    []
  );

  return (
    <main className="min-h-screen bg-[#f7f5f0] text-[#20242a] transition-colors duration-300 dark:bg-[#111418] dark:text-[#ece8df]">
      <header className="sticky top-0 z-30 border-b border-black/10 bg-[#f7f5f0]/90 backdrop-blur dark:border-white/10 dark:bg-[#111418]/90">
        <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3 sm:px-6">
          <div className="grid h-10 w-10 place-items-center rounded-lg bg-[#2f8f7b] text-lg font-bold text-white">D</div>
          <div className="min-w-0 flex-1">
            <h1 className="text-lg font-semibold leading-tight">DailySync</h1>
            <p className="hidden text-sm text-[#68707c] dark:text-[#aeb6bd] sm:block">캘린더, 반복 일정, 체크리스트, 습관을 한 곳에서 관리하세요.</p>
          </div>
          <label className="hidden min-w-[220px] items-center gap-2 rounded-lg border border-black/10 bg-white px-3 py-2 dark:border-white/10 dark:bg-[#191d23] md:flex">
            <Search size={16} aria-hidden />
            <input
              aria-label="할 일 검색"
              value={filters.query}
              onChange={(event) => setFilters({ query: event.target.value })}
              className="w-full bg-transparent text-sm outline-none"
              placeholder="검색"
            />
          </label>
          <button
            type="button"
            onClick={toggleTheme}
            className="grid h-10 w-10 place-items-center rounded-lg border border-black/10 bg-white transition hover:bg-black/5 dark:border-white/10 dark:bg-[#191d23] dark:hover:bg-white/10"
            aria-label="테마 전환"
            title="테마 전환"
          >
            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </header>

      <div className="mx-auto grid max-w-7xl gap-4 px-4 py-4 pb-24 sm:px-6 lg:grid-cols-[360px_minmax(0,1fr)_330px] lg:pb-6">
        <section className={cn("space-y-4", tab !== "calendar" && "hidden lg:block")}>
          <CalendarView />
          <SummaryPanel />
        </section>
        <section className={cn(tab !== "tasks" && "hidden lg:block")}>
          <DayPanel />
        </section>
        <section className={cn("space-y-4", tab !== "habits" && tab !== "data" && "hidden lg:block")}>
          <div className={cn(tab === "data" && "hidden lg:block")}>
            <HabitPanel />
          </div>
          <div className={cn(tab === "habits" && "hidden lg:block")}>
            <DataTools />
          </div>
        </section>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-black/10 bg-white/95 px-2 py-2 shadow-soft backdrop-blur dark:border-white/10 dark:bg-[#191d23]/95 lg:hidden" aria-label="모바일 내비게이션">
        <div className="grid grid-cols-4 gap-1">
          {mobileTabs.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={cn(
                  "flex min-h-12 flex-col items-center justify-center gap-1 rounded-lg text-xs text-[#68707c] transition",
                  tab === item.id && "bg-[#2f8f7b] text-white"
                )}
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </main>
  );
}
