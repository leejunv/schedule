# DailySync

날짜별 일정, 반복 체크리스트, 습관 추적을 통합한 Next.js 생산성 웹앱입니다.

## 실행

```powershell
npm install
npm run dev
```

로컬 주소는 `http://localhost:3000`입니다.

## Firebase 설정

DailySync는 로그인한 Google 계정의 Firestore 데이터를 기준으로 동작합니다. PC와 모바일을 같은 데이터로 사용하려면 Firebase Auth와 Firestore를 설정하세요.

1. Firebase Console에서 Web App을 만들고 설정값을 확인합니다.
2. Authentication에서 Google provider를 활성화합니다.
3. Authentication > Settings > Authorized domains에 `leejunv.github.io`를 추가합니다.
4. Firestore Database를 생성합니다.
5. GitHub 저장소 `Settings > Secrets and variables > Actions > Variables`에 아래 값을 추가합니다.

```text
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
```

로컬 테스트는 `.env.local`에 같은 값을 넣으면 됩니다. 형식은 `.env.example`을 참고하세요.

## Firestore Rules

```text
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/schedules/{scheduleId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## 배포

`main` 브랜치에 push하면 GitHub Actions가 GitHub Pages로 배포합니다.

```text
https://leejunv.github.io/schedule/
```
