# Execution ledger

## 2026-05-28 DailySync build

- Created a Next.js App Router, React, TypeScript, Tailwind, Zustand app.
- Implemented localStorage persistence, calendar day metrics, task CRUD, drag sorting, filters, recurrence rules, habits, notes, JSON import/export, dark mode, and PWA assets.
- Verified with `npm run build`: passed.

## 2026-05-28 Korean UI localization

- Localized visible UI labels, placeholders, aria labels, date formatting, recurrence labels, priority/status labels, manifest description, and data panel copy into Korean.
- Verified with `npm run build`: passed.

## 2026-05-28 Firebase-only persistence

- Removed Zustand localStorage persistence so Firestore is the source of truth after login.
- Clear the legacy `dailysync-store` localStorage key on app startup and reset in-memory schedule state when signed out.
- Verified with `npm run build`: passed.
