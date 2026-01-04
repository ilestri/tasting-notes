# 새 술 DB 추가 가이드

이 문서는 이 프로젝트의 현재 요구사항에 맞춰 **새 술 데이터**를 DB에 넣는 방법을 정리합니다.

## 기본 규칙

- **문체**: 메모는 “~합니다/됩니다” 체로 통일합니다.
- **시음일/장소 없음**: 시음실/장소 등 관련 필드는 사용하지 않습니다.
- **커스텀 필드 없음**: 커스텀 필드 기능은 제거되었습니다.
- **향/맛/피니시/색**: `note_terms`의 4개 카테고리만 사용합니다. `Other`는 사용하지 않습니다.
- **종류(kind)**: 한국어로만 입력합니다. (`위스키`, `사케`, `와인`, `막걸리`, `기타`)
- **평점**: 0~10점 범위의 숫자(소수 1자리 권장). 외부 평판을 참고해 적절히 설정합니다.

## 이미지 규칙

- **흰 배경 + 박스 없음** 이미지 사용.
- 이미지 저장은 하지 않고 **URL**만 저장합니다.
- `attachments`에 `kind = 'image'`로 1장만 넣습니다.
- `mime`은 필요 없으면 `NULL`로 둡니다.

## 제품 정보 규칙

- `abv`는 숫자만 저장합니다. (UI에서 `%`로 표시됨)
- `age`가 없으면 `NULL`로 저장합니다. (UI에서 `NAS`로 표시됨)
- `volume_ml`은 숫자만 저장합니다. (UI에서 `ml`로 표시됨)
- `region`/`country` 정보가 없으면 `NULL`로 둡니다.

## 태그 규칙

- 태그는 한글 중심으로 짧고 명확하게 사용합니다.
- 모든 술에 반드시 `나라이름 위스키` 태그를 추가합니다.(예: 일본 위스키)
- 카드에는 태그 상위 3개만 노출됩니다.

## 메모(노트) 작성 가이드

- 2~3문장 정도, “향 → 맛 → 피니시” 흐름으로 작성합니다.
- 과한 감탄사/과장 표현은 피합니다.
- 가능한 한 다른 노트들과 톤을 맞춥니다.

## 삽입 절차 (SQL 예시)

1) **ID 생성**

```bash
python3 - <<'PY'
import uuid
print(uuid.uuid4())  # product_id
print(uuid.uuid4())  # note_id
print(uuid.uuid4())  # attachment_id
print(uuid.uuid4())  # term_id (여러 개 필요)
PY
```

2) **products 삽입**

```sql
INSERT INTO products (
  id, kind, name, producer, country, region, abv, vintage, age, volume_ml, created_at, updated_at
) VALUES (
  :product_id,
  '위스키',
  :name,
  :producer,
  :country,
  :region,
  :abv,
  :vintage,
  :age,
  :volume_ml,
  datetime('now'),
  datetime('now')
);
```

3) **notes 삽입**

```sql
INSERT INTO notes (
  id, product_id, rating, comment, created_at, updated_at
) VALUES (
  :note_id,
  :product_id,
  :rating,
  :comment,
  datetime('now'),
  datetime('now')
);
```

4) **note_terms 삽입**

```sql
INSERT INTO note_terms (
  id, note_id, category, value, ord, created_at
) VALUES
  (:term_id_1, :note_id, 'nose', '사과', 0, datetime('now')),
  (:term_id_2, :note_id, 'nose', '꽃향', 1, datetime('now')),
  (:term_id_3, :note_id, 'palate', '부드러운 단맛', 0, datetime('now')),
  (:term_id_4, :note_id, 'finish', '깔끔한 여운', 0, datetime('now')),
  (:term_id_5, :note_id, 'color', '투명', 0, datetime('now'));
```

5) **tags / note_tags 삽입**

```sql
INSERT INTO tags (id, name)
VALUES (:tag_id_1, '일본 위스키')
ON CONFLICT(name) DO NOTHING;

INSERT INTO note_tags (note_id, tag_id)
SELECT :note_id, id FROM tags
WHERE name IN ('일본 위스키', '산토리', '재패니즈 싱글 몰트');
```

6) **attachments 삽입**

```sql
INSERT INTO attachments (
  id, note_id, kind, url_or_path, mime, created_at
) VALUES (
  :attachment_id,
  :note_id,
  'image',
  :image_url,
  NULL,
  datetime('now')
);
```

## 참고 경로

- DB 파일: `data/tasting-notes.sqlite`
- 스키마: `server/db/schema.ts`
