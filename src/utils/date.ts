import {
  addDays,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  parseISO,
  startOfMonth,
  startOfWeek
} from "date-fns";
import { ko } from "date-fns/locale";

export const DATE_KEY = "yyyy-MM-dd";

export function todayKey() {
  return format(new Date(), DATE_KEY);
}

export function monthKey(date: Date) {
  return format(date, "yyyy-MM");
}

export function toDateKey(date: Date) {
  return format(date, DATE_KEY);
}

export function formatReadable(dateKey: string) {
  return format(parseISO(dateKey), "yyyy년 M월 d일", { locale: ko });
}

export function getCalendarDays(month: string) {
  const base = parseISO(`${month}-01`);
  const start = startOfWeek(startOfMonth(base), { weekStartsOn: 0 });
  const end = endOfWeek(endOfMonth(base), { weekStartsOn: 0 });
  const days: Date[] = [];
  let cursor = start;

  while (cursor <= end) {
    days.push(cursor);
    cursor = addDays(cursor, 1);
  }

  return days;
}

export function isToday(date: Date) {
  return isSameDay(date, new Date());
}

export function isInMonth(date: Date, month: string) {
  return isSameMonth(date, parseISO(`${month}-01`));
}
