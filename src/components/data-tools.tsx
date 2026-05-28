"use client";

import { Download, RotateCcw, Upload } from "lucide-react";
import type { ScheduleState } from "@/types/schedule";
import { getPersistableSchedule, useScheduleStore } from "@/store/schedule-store";

export function DataTools() {
  const state = useScheduleStore();

  function exportJson() {
    const data = getPersistableSchedule(state);
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `dailysync-${state.selectedDate}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  async function importJson(file: File | null) {
    if (!file) return;
    const text = await file.text();
    state.importData(JSON.parse(text) as ScheduleState);
  }

  return (
    <section className="rounded-lg border border-black/10 bg-white p-4 shadow-soft dark:border-white/10 dark:bg-[#191d23]">
      <div className="mb-4">
        <h2 className="text-base font-semibold">데이터</h2>
        <p className="text-sm text-[#68707c] dark:text-[#aeb6bd]">로컬 저장과 Firebase 계정 동기화 지원</p>
      </div>
      <div className="grid gap-2">
        <button type="button" onClick={exportJson} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-black/10 px-3 font-medium hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/10">
          <Download size={17} />
          JSON 내보내기
        </button>
        <label className="inline-flex min-h-11 cursor-pointer items-center justify-center gap-2 rounded-lg border border-black/10 px-3 font-medium hover:bg-black/5 dark:border-white/10 dark:hover:bg-white/10">
          <Upload size={17} />
          JSON 가져오기
          <input type="file" accept="application/json" className="sr-only" onChange={(event) => importJson(event.target.files?.[0] ?? null)} />
        </label>
        <button type="button" onClick={state.reset} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-[#d76b4f]/30 px-3 font-medium text-[#b94e33] hover:bg-[#d76b4f]/10">
          <RotateCcw size={17} />
          로컬 데이터 초기화
        </button>
      </div>
      <div className="mt-4 rounded-lg bg-[#f7f5f0] p-3 text-sm text-[#68707c] dark:bg-[#111418] dark:text-[#aeb6bd]">
        Google 로그인 후에는 같은 계정의 PC와 모바일에서 일정이 Firestore로 자동 동기화됩니다. JSON 내보내기/가져오기는 백업용으로 계속 사용할 수 있습니다.
      </div>
    </section>
  );
}
