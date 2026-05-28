import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "DailySync",
  description: "캘린더, 반복 일정, 체크리스트, 습관 관리를 통합한 생산성 앱입니다.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    title: "DailySync",
    statusBarStyle: "default"
  }
};

export const viewport: Viewport = {
  themeColor: "#2f8f7b",
  width: "device-width",
  initialScale: 1
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
