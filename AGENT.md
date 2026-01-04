# AGENT.md

이 문서는 저장소에서 작업하는 에이전트를 위한 최소한의 안내입니다.

## 프로젝트 요약

- Nuxt 3 (SSR) + Vue 3 + TypeScript
- DB: SQLite (better-sqlite3) + Drizzle ORM
- 서버 API: Nuxt Nitro `server/api`
- 목적: 술(위스키/와인/사케/막걸리 등) 테이스팅 노트 CRUD

## 주요 경로

- DB 스키마: `server/db/schema.ts`
- 마이그레이션 실행: `server/db/migrate.ts`
- API: `server/api/**`
- UI: `pages/**`, `components/**`
- 유틸/타입: `utils/**`, `types/**`

## 환경 변수

- `DB_PATH`: 기본값 `${process.cwd()}/data/tasting-notes.sqlite`
- `ADMIN_TOKEN`: 쓰기 작업 인증용
- `.env`는 gitignore됨 (예시 값만 기록)

## 인증

- `POST/PUT/DELETE` 요청은 `Authorization: Bearer <ADMIN_TOKEN>` 필요
- UI는 `/notes/new`에서 토큰 입력 → 로컬스토리지 저장 후 수정/삭제에도 재사용

## 데이터 모델 핵심

- `products` / `notes` 분리
- `note_terms`로 향/맛/피니시/색 정규화
- `tags` + `note_tags`
- `attachments` (옵션)

## 새 술 데이터 추가

- 새 술을 DB에 넣을 때는 `docs/new-drink-insert-guide.md`를 먼저 참고

## 스크립트

- `npm run dev`: 개발 서버
- `npm run setup`: 마이그레이션 후 개발 서버
- `npm run migrate`: Drizzle 마이그레이션
- `npm run build`: 프로덕션 빌드
- `npm run start`: 마이그레이션 후 SSR 서버 실행
- `npm run start:prod`: 빌드 후 `start`
- `npm run check`: 포맷 체크 + 린트 + 타입체크
- `npm run lint:fix`: 포맷 적용 + ESLint 자동 수정
- `npm run format`: Prettier 적용

## Render 배포

- Persistent Disk: `/var/data`
- 환경 변수:
  - `DB_PATH=/var/data/tasting-notes.sqlite`
  - `ADMIN_TOKEN=강한값`
- Build Command: `npm ci && npm run build`
- Start Command: `npm run start`

## 개발 시 주의

- `DB_PATH` 기본 경로에 `data/` 디렉터리 필요

## 커밋 메시지 규칙

- 일반적인 Conventional Commits 형식으로 한글 작성
