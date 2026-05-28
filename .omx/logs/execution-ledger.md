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

## 2026-05-28 Firebase-only copy cleanup

- Updated Data panel and README copy to remove stale local-storage wording.
- Renamed the reset action to account data reset and added a confirmation prompt.
- Verified with `npm run build`: passed.

## 2026-05-28 Custom recurrence validation

- Clarified the selected custom recurrence state in the task form.
- Clamped custom day intervals to positive integers and disabled weekday recurrence when no weekday is selected.
- Verified with `npm run build`: passed.

## 2026-05-28 Custom recurrence button color

- Changed the custom weekday recurrence apply button to the app's primary green instead of the dark-mode white variant.
- Verified with `npm run build`: passed.

## 2026-05-28 Custom recurrence selected states

- Added selected-state styling for the custom weekday and n-day recurrence apply buttons.
- Verified with `npm run build`: passed.

## 2026-05-28 Remove habits and priority

- Removed habit UI, navigation, store actions, types, summaries, and copy.
- Removed task priority selection, filtering, labels, sorting, and summary metrics.
- Verified with `npm run build`: passed.

## 2026-05-28 Personal schedule defaults

- Added the requested household recurring tasks as stable default tasks.
- Merged missing default tasks into existing Firebase schedule data on login without duplicating them.
- Added client-side access restriction for `ski00102@gmail.com` and documented matching Firestore rules.
- Verified with `npm run build`: passed.
