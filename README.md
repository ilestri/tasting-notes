# Tasting Notes

술(위스키/와인/사케/막걸리 등) 테이스팅 노트를 조회하는 Nuxt 3 SSR 앱입니다.

## 로컬 실행

의존성 설치:

```bash
npm install
```

환경 변수(`.env`):

```bash
DB_PATH=$PWD/data/tasting-notes.sqlite
ADMIN_PASSWORD=changeme-strong
ADMIN_SESSION_SECRET=change-me-session
```

`DB_PATH`는 미설정 시 `${process.cwd()}/data/tasting-notes.sqlite`로 기본 설정됩니다.

마이그레이션 + 개발 서버:

```bash
npm run setup
```

직접 순서로 실행하려면:

```bash
npm run migrate
npm run dev
```

## 스크립트

- `npm run dev`: 개발 서버
- `npm run build`: 프로덕션 빌드
- `npm run start`: 마이그레이션 후 SSR 서버 실행
- `npm run start:prod`: 빌드 후 `start` 실행
- `npm run setup`: 마이그레이션 후 개발 서버 실행
- `npm run check`: 포맷 체크 + 린트 + 타입체크
- `npm run lint:fix`: 포맷 적용 + ESLint 자동 수정
- `npm run format`: Prettier 포맷 적용
- `npm run preview`: 빌드 미리보기
- `npm run generate`: 정적 생성

## 마이그레이션

- Drizzle 스키마: `server/db/schema.ts`
- 마이그레이션 폴더: `server/db/migrations`

```bash
npm run migrate
```

(옵션) 직접 실행:

```bash
node server/db/migrate.ts
```

## Render 배포

- Persistent Disk 마운트: `/var/data`
- 환경 변수:
  - `DB_PATH=/var/data/tasting-notes.sqlite`
  - `ADMIN_PASSWORD=강한값`
  - `ADMIN_SESSION_SECRET=강한값`
- Build Command:
  - `npm ci && npm run build`
- Start Command:
  - `npm run start`

`npm run start`는 마이그레이션 후 Nuxt 서버를 실행합니다.

## 백업/복원

SQLite 파일을 복사하면 됩니다.

- 백업: `/var/data/tasting-notes.sqlite` 파일 복사
- 복원: 동일 경로로 파일 교체

## 옵션 기능

- 통계: `/api/stats` (월별/종류별 건수 및 평균 평점)
- 첨부: 노트에 이미지/파일 URL 또는 경로 저장

## 관리자

- 로그인: `/adm/login`
- 관리 페이지: `/adm`
- `ADMIN_PASSWORD`는 필수, `ADMIN_SESSION_SECRET`는 세션 서명용(선택)
