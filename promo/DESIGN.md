# Lim Claude 소개 영상 — 설계 spec

video-shotcraft 스킬, **자율 자유 창작 모드**(pipeline.md 0–7단계).
모드 선택 근거: 사용자가 "설계는 네가 정해", "끝까지 해"라고 상시 지시 → 중간 확인 없이 진행.

## 0. 제품 브리프

| 항목 | 내용 (근거) |
|---|---|
| 제품 | lim-claude: React + Vite 팀 대시보드 단일 페이지 (`src/App.jsx`) |
| 핵심 기능 | ① 요약 수치 3장(진행 중 프로젝트·이번 주 완료·팀원) ② 작업 목록 + 상태 배지(완료/진행 중/막힘) ③ 새 작업 추가 폼 ④ **라이트/다크 전환 토글** — 선택은 localStorage 저장, 미선택 시 OS `prefers-color-scheme` 추종 (`src/theme/useTheme.js`) ⑤ 두 테마 색 조합의 **WCAG AA 대비 자동 테스트** (`tests/contrast.test.js`, 29개 통과 확인) |
| 주인공 기능 | ④ 테마 전환 — README·커밋 이력(`Add React app with light/dark mode toggle in header`)상 이 저장소의 존재 이유 |
| 용도/관객 | 저장소 소개(README·PR·SNS용 짧은 소개), 개발자/팀원 |
| 길이·화면 | 24.4s (732f @30fps), 1920×1080, 한국어 |
| 데이터 | 앱에 하드코딩된 가상 데모 데이터. 단, 담당자 '임희섭'은 저장소 소유자 실명 → 캡처 시 가상 이름 '이도윤'으로 교체 (Q1) |
| 오디오 | 사용자 지정 BGM 없음 → 6단계에서 선택, BGM 있음/없음 두 버전 |

## 요구 → 실행 결정 표

| 요구/제약 | 결정 |
|---|---|
| 실제 화면 (Q1) | Playwright 로 실제 dev 서버 캡처: 라이트/다크 전체 페이지(DSF 3), 상태 칸 컷아웃, 토글 트랙/손잡이 층(DSF 4), layout.json |
| 테마 전환 카드 命门: 두 버전 레이아웃 픽셀 일치 | 라이트/다크 캡처가 같은 뷰포트·같은 DOM → 일치. 필터 반전 금지 → 실제 다크 캡처 사용 |
| 렌더 환경 Linux | Noto Sans CJK KR 설치 + fontconfig 별칭(`Noto Sans KR`/`system-ui` → Noto Sans CJK KR). 앱 폰트 스택에 'Noto Sans KR'이 이미 있음 |
| 기능 완결성 (P4) | ①②③ → S2 크레인(한 화면 전경 + 상태 뒤집기), ④ → S3 안내 카드 + S4 스윕, ⑤ → S5 계기판, 브랜드 → S1/S6 |

## 1. 시각 방향

후보 3개:
1. **제품 토큰 그대로 (선택)** — 슬레이트 중성색 + 인디고, Noto Sans 700, 12px 카드 반경. 라이트에서 시작해 다크로 끝나는 '낮→밤' 흐름 자체가 기능 서사.
2. 잉크·종이 프레스(Ink Press) — 제품에 종이 질감 요소가 없어 기각.
3. 네온 다크 테크 — 차분한 업무 도구 톤과 맞지 않아 기각.

**토큰** (`src/theme.ts`, 값은 앱 `theme.css` 그대로): LIGHT/DARK bg·surface·border·text·muted·primary(#4f46e5 / #818cf8)·success·danger. 폰트 Noto Sans CJK KR 400/700. 반경 12/8/999.
**모션 성격 토큰**: 에너지 낮음~중간, 톤 진지~친근 → 「전문·신뢰」 프리셋에서 「친근」 쪽(24f, bezier(.25,.46,.45,.94), 착지 동작만 1.04 오버슈트). 세 단어: 차분함·또렷함·부드러운 전환.
**확장**: 스윕 경계의 노을 주황 → 인디고 계열(primary-soft·primary)로 치환. 엔딩 마크 = 앱 다크 상태 토글 모양(앱에 로고가 없음).
**styleframe 생략 근거**: 엄격한 기존 디자인 시스템(앱 토큰)과 실제 캡처가 있어 HTML styleframe 대신 Remotion 정지 프레임(out/qa/)으로 바로 검증 (pipeline.md 1단계 4항 허용 조건).

## 2. 기능 → 샷 매핑

| 기능 | 카드 · 변체 | demo 소스 |
|---|---|---|
| 브랜드 오프닝 | paper-title-card | demos/typography/paper-title-card/PaperTitleCard.tsx |
| ①②③ 대시보드 전경 | crane-rise-reveal | demos/opening/crane-rise-reveal/CraneRiseReveal.tsx |
| ④ 안내 카드 | paper-title-card (호흡 카드) | 동일 |
| ④ 테마 전환 | theme-switch-moves · **A theme-sweep-toggle** | demos/interaction/theme-switch-moves/ThemeSweepToggle.tsx |
| ⑤ 대비 테스트 | gauge-readout-moves · **A needle-sweep-selftest** | demos/data/gauge-readout-moves/NeedleSweepSelftest.tsx |
| 엔딩 | logo-shrink-wordmark-lockup | demos/outro/logo-shrink-wordmark-lockup/LogoShrinkWordmarkLockup.tsx |

각 카드의 유지한 조율값/다시 입힌 것은 해당 `src/shots/*.tsx` 머리 주석에 기록.

## 3. 스토리보드 (sequences/promo-energy-arc 골격)

| # | 시간(f) | 샷 | 핵심 동작 |
|---|---|---|---|
| S1 | 0–80 | 브랜드 타이틀 "Lim **Claude**" / 우리 팀 작업 대시보드 | 단어 압인 → 밑줄 → hold 38f+ → 글자층 페이드 (R1) |
| S2 | 80–242 (11박) | 크레인 업 | '진행 중' 행 특写(2.6×, 주변 38%) → 24f 후 상승(모션 블러) → 전경 → 134f 상태 '완료'로 뒤집힘. 자막 "요약 · 작업 목록 · 새 작업 추가를 한 화면에" |
| S3 | 242–301 (4박) | 안내 카드 "클릭 한 번으로 / **다크 모드**" | 호흡 위치 |
| S4 | 301–449 (10박) | 라이트→다크 스윕 (**BGM 드롭**) | 토글 특写 3.6× 클릭 → 15° 사선 스윕 + 카메라 풀백 → 다크 여운(토글·추가 버튼·창 테두리 빛). 자막 "고른 모드는 저장되고, 처음엔 OS 설정을 따릅니다" |
| S5 | 449–582 (9박) | 대비 자동 검사 | 바늘 3개 엇박 풀스윕 → 17.1 / 6.0 / 4.6 : 1 안착(AA 선 4.5) → "29개 검사 모두 통과" |
| S6 | 582–732 | 엔딩 락업 | 링 수축 → 토글 마크 → "Lim Claude" → "밝을 때도, 어두울 때도 편안하게", hold 40f |

전환: 하드 컷(타이틀 카드는 글자층 페이드 후 같은 라이트 배경으로 컷). 박자: 모든 컷이 BGM 박 위 (`src/timeline.ts`).

## 4. 사운드

- BGM: House Vibez (Lily J, Mixkit 무료 라이선스) 122.00 BPM, 52.98s 부터 사용 → 곡의 드롭(63.02s)이 S4 컷에 옴. 볼륨 0.3, 앞 12f 페이드인, 끝 36f 페이드아웃.
- SFX (Freesound CC0, `public/audio/sfx/`): 표는 `src/Soundtrack.tsx` 의 `SFX`. 정렬 = 목표 정점 − 음원 정점 지연 − 출력 지연.
- 미청취 고지: 소리 선택은 메타데이터·파형 분석 근거이며, 제작 환경에서 사람이 직접 들어 보지 못했다.

## 5. 의도적 규칙 위반 (aesthetic-rules)

| 규칙 | 위반 내용 · 이유 |
|---|---|
| Q8 발표회 단체사진 엔딩 | 기능이 적은 단일 페이지 앱이라 로고 락업 엔딩 사용. 대신 마크를 '토글'로 만들어 주인공 기능을 상징 |
| S1 강한 비트 tech-house | 122 BPM 하우스(차분한 쪽)를 선택 — 업무 도구 톤 |
| crane-rise-reveal KPI 카운트 | 실제 캡처 위에 숫자를 덧그리는 복각이 되므로 생략 (Q1 우선) |
| music-beat-sync 전체 절차 | 사용자 지정 BGM이 아니라 §0 에 따라 강제 卡点 대상 아님. 그래도 컷은 박 위에 두었고, kick/snare 분류·렌더 후 회측은 생략 |
