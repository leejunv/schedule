"use client";

import { Cloud, CloudOff, LogIn, LogOut } from "lucide-react";
import { useFirebaseSync } from "@/hooks/use-firebase-sync";
import { cn } from "@/utils/ui";

const statusLabels = {
  disabled: "Firebase 미설정",
  "signed-out": "동기화 꺼짐",
  loading: "동기화 준비 중",
  synced: "동기화 완료",
  saving: "저장 중",
  error: "동기화 오류"
};

export function SyncStatus() {
  const sync = useFirebaseSync();
  const online = sync.configured && sync.user && sync.status !== "error";

  return (
    <div className="flex items-center gap-2">
      <div
        className={cn(
          "hidden items-center gap-2 rounded-lg border px-3 py-2 text-sm dark:border-white/10 sm:flex",
          online ? "border-[#2f8f7b]/30 bg-[#2f8f7b]/10 text-[#2f8f7b]" : "border-black/10 bg-white text-[#68707c] dark:bg-[#191d23] dark:text-[#aeb6bd]"
        )}
        title={sync.error ?? statusLabels[sync.status]}
      >
        {online ? <Cloud size={16} /> : <CloudOff size={16} />}
        <span>{sync.user?.displayName ?? statusLabels[sync.status]}</span>
      </div>
      {sync.user ? (
        <button
          type="button"
          onClick={sync.logout}
          className="grid h-10 w-10 place-items-center rounded-lg border border-black/10 bg-white transition hover:bg-black/5 dark:border-white/10 dark:bg-[#191d23] dark:hover:bg-white/10"
          aria-label="로그아웃"
          title="로그아웃"
        >
          <LogOut size={18} />
        </button>
      ) : (
        <button
          type="button"
          onClick={sync.signIn}
          disabled={!sync.configured}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-black/10 bg-white px-3 text-sm font-medium transition hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-50 dark:border-white/10 dark:bg-[#191d23] dark:hover:bg-white/10"
          aria-label="Google로 로그인"
          title={sync.configured ? "Google로 로그인" : "Firebase 설정 필요"}
        >
          <LogIn size={17} />
          <span className="hidden sm:inline">로그인</span>
        </button>
      )}
    </div>
  );
}
