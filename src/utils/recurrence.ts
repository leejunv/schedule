import { differenceInCalendarDays, differenceInCalendarMonths, differenceInCalendarWeeks, differenceInCalendarYears, getDate, getDay, isAfter, parseISO } from "date-fns";
import type { RecurrenceRule, Weekday } from "@/types/schedule";

const weekdayNames: Weekday[] = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];
const weekdayLabels: Record<Weekday, string> = { SUN: "일", MON: "월", TUE: "화", WED: "수", THU: "목", FRI: "금", SAT: "토" };
const formatWeekdays = (weekdays: Weekday[]) => weekdays.map((day) => weekdayLabels[day]).join(", ");

export function recurrenceToLabel(rule?: RecurrenceRule) {
  if (!rule || rule.frequency === "NONE") return "반복 없음";
  if (rule.frequency === "DAILY") return "매일";
  if (rule.frequency === "WEEKDAYS") return "평일마다";
  if (rule.frequency === "WEEKLY") return `매주${rule.weekdays?.length ? `: ${formatWeekdays(rule.weekdays)}` : ""}`;
  if (rule.frequency === "MONTHLY") return `매월${rule.monthlyDate ? ` ${rule.monthlyDate}일` : ""}`;
  if (rule.frequency === "YEARLY") return "매년";
  return `${rule.interval ?? 1}일마다`;
}

export function recurrenceToShortLabel(rule?: RecurrenceRule) {
  if (!rule || rule.frequency === "NONE") return "없음";
  if (rule.frequency === "DAILY") return "매일";
  if (rule.frequency === "WEEKDAYS") return "평일";
  if (rule.frequency === "WEEKLY") return rule.weekdays?.length ? `매주 ${formatWeekdays(rule.weekdays)}` : "매주";
  if (rule.frequency === "MONTHLY") return rule.monthlyDate ? `매월 ${rule.monthlyDate}일` : "매월";
  if (rule.frequency === "YEARLY") return "매년";
  return `${rule.interval ?? 1}일마다`;
}

export function serializeRecurrence(rule?: RecurrenceRule) {
  if (!rule || rule.frequency === "NONE") return "NONE";
  if (rule.frequency === "WEEKLY" && rule.weekdays?.length) return `WEEKLY:${rule.weekdays.join(",")}`;
  if (rule.frequency === "MONTHLY" && rule.monthlyDate) return `MONTHLY:${rule.monthlyDate}`;
  if (rule.frequency === "CUSTOM") return `CUSTOM:${rule.interval ?? 1}`;
  return rule.frequency;
}

export function occursOnDate(startDate: string, targetDate: string, rule?: RecurrenceRule) {
  if (!rule || rule.frequency === "NONE") return startDate === targetDate;
  const start = parseISO(startDate);
  const target = parseISO(targetDate);
  if (isAfter(start, target)) return false;
  if (rule.endsOn && isAfter(target, parseISO(rule.endsOn))) return false;

  const weekday = weekdayNames[getDay(target)];
  const days = differenceInCalendarDays(target, start);

  if (rule.count && days >= 0) {
    const approxCount = Math.floor(days / Math.max(rule.interval ?? 1, 1)) + 1;
    if (approxCount > rule.count && ["DAILY", "CUSTOM"].includes(rule.frequency)) return false;
  }

  switch (rule.frequency) {
    case "DAILY":
      return days % Math.max(rule.interval ?? 1, 1) === 0;
    case "WEEKDAYS":
      return !["SUN", "SAT"].includes(weekday);
    case "WEEKLY":
      return (
        differenceInCalendarWeeks(target, start) % Math.max(rule.interval ?? 1, 1) === 0 &&
        (rule.weekdays?.length ? rule.weekdays.includes(weekday) : getDay(target) === getDay(start))
      );
    case "MONTHLY":
      return (
        differenceInCalendarMonths(target, start) % Math.max(rule.interval ?? 1, 1) === 0 &&
        getDate(target) === (rule.monthlyDate ?? getDate(start))
      );
    case "YEARLY":
      return differenceInCalendarYears(target, start) % Math.max(rule.interval ?? 1, 1) === 0 && target.getMonth() === start.getMonth() && getDate(target) === getDate(start);
    case "CUSTOM":
      return days % Math.max(rule.interval ?? 1, 1) === 0;
    default:
      return startDate === targetDate;
  }
}
