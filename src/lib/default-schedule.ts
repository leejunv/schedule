import type { ScheduleState, Task, Weekday } from "@/types/schedule";

const seedDate = "2026-05-28";
const seedTimestamp = "2026-05-28T00:00:00.000Z";

function dailyTask(id: string, title: string, category: string, order: number): Task {
  return {
    id,
    title,
    date: seedDate,
    completedDates: [],
    category,
    order,
    recurrence: { frequency: "DAILY", sourceRule: "DAILY" },
    createdAt: seedTimestamp,
    updatedAt: seedTimestamp
  };
}

function weeklyTask(id: string, title: string, category: string, weekdays: Weekday[], order: number): Task {
  return {
    id,
    title,
    date: seedDate,
    completedDates: [],
    category,
    order,
    recurrence: { frequency: "WEEKLY", interval: 1, weekdays, sourceRule: `WEEKLY:${weekdays.join(",")}` },
    createdAt: seedTimestamp,
    updatedAt: seedTimestamp
  };
}

export const defaultTasks: Task[] = [
  dailyTask("seed_evening_baby_dishes", "아기꺼 설거지", "매일 저녁", 0),
  dailyTask("seed_evening_shower_handle", "샤워핸들 세척", "매일 저녁", 1),
  dailyTask("seed_evening_dehumidifier", "제습기 물비우기", "매일 저녁", 2),
  dailyTask("seed_evening_formula_water", "분유포트 물 끓이기", "매일 저녁", 3),
  dailyTask("seed_evening_food_waste", "음쓰정리", "매일 저녁", 4),
  dailyTask("seed_evening_mat_wipe", "매트 닦기", "매일 저녁", 5),
  dailyTask("seed_evening_diaper_trolley", "기저귀 트롤리에 채우기", "매일 저녁", 6),
  dailyTask("seed_evening_toys", "장난감 정리 및 소독", "매일 저녁", 7),
  dailyTask("seed_morning_baby_bed_roller", "아기침대 돌돌이", "매일 아침", 8),
  dailyTask("seed_morning_dehumidifier", "제습기 물비우기", "매일 아침", 9),
  weeklyTask("seed_weekdays_daycare_prep", "얼집 준비물 건조까지 해놓기", "일요일~목요일", ["SUN", "MON", "TUE", "WED", "THU"], 10),
  weeklyTask("seed_saturday_sink", "싱크대청소", "토요일", ["SAT"], 11),
  weeklyTask("seed_saturday_adult_laundry", "어른빨래 돌리기 및 개기", "토요일", ["SAT"], 12),
  weeklyTask("seed_saturday_towel_laundry", "수건빨래 돌리기 및 개기", "토요일", ["SAT"], 13),
  weeklyTask("seed_sunday_formula_pot_clean", "분유포트 세척", "일요일", ["SUN"], 14)
];

export function mergeDefaultTasks(schedule: ScheduleState): ScheduleState {
  const existingIds = new Set(schedule.tasks.map((task) => task.id));
  const missingTasks = defaultTasks.filter((task) => !existingIds.has(task.id));
  if (missingTasks.length === 0) return schedule;
  return { ...schedule, tasks: [...schedule.tasks, ...missingTasks] };
}
