import { eachDayOfInterval, parseISO, subDays } from "date-fns";
import { toDateKey, todayKey } from "@/utils/date";

export function getStreak(completedDates: string[]) {
  const completed = new Set(completedDates);
  let streak = 0;
  let cursor = parseISO(todayKey());

  while (completed.has(toDateKey(cursor))) {
    streak += 1;
    cursor = subDays(cursor, 1);
  }

  return streak;
}

export function getCompletionRate(completedDates: string[], days: number) {
  const completed = new Set(completedDates);
  const end = parseISO(todayKey());
  const start = subDays(end, days - 1);
  const range = eachDayOfInterval({ start, end }).map(toDateKey);
  const done = range.filter((date) => completed.has(date)).length;
  return Math.round((done / range.length) * 100);
}
