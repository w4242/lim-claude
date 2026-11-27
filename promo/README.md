# Lim Claude 소개 영상 (Remotion)

[video-shotcraft](https://github.com/Vincentwei1021/video-shotcraft) 스킬로 만든 24초 소개 영상 프로젝트입니다.
설계와 결정 근거는 [DESIGN.md](DESIGN.md)에 있습니다.

- `out/promo.mp4` — 배경음악 포함
- `out/promo-nobgm.mp4` — 배경음악 없이 효과음만 (직접 음악을 넣을 때)

## 다시 만들기

```bash
npm install
# 1) 앱 화면 다시 캡처 (앱 dev 서버를 먼저 띄움: 저장소 루트에서 npx vite --port 5173)
npm run capture          # playwright 필요
# 2) 미리보기 / 렌더
npm run dev              # Remotion Studio
npm run render
npm run render:nobgm
```

Linux 헤드리스 환경에서는 `REMOTION_BROWSER` 에 chrome-headless-shell 경로를 넣으면 그 브라우저를 씁니다.
한글은 `Noto Sans CJK KR`(또는 Noto Sans KR) 폰트가 설치돼 있어야 화면과 같게 나옵니다.

## 구조

| 파일 | 역할 |
|---|---|
| `src/timeline.ts` | 컷 위치(박자 격자)·자막 — 유일한 기준 표 |
| `src/Soundtrack.tsx` | 배경음악 + 효과음 표 |
| `src/shots/*.tsx` | 장면 6개 (머리 주석에 원본 샷 카드와 바꾼 점) |
| `src/theme.ts` | 앱 `theme.css` 에서 가져온 디자인 토큰 |
| `src/workbench.ts` | video-shotcraft 동작 작업대 연결 목록 |
| `public/textures/` | 실제 앱 캡처 |
| `public/audio/` | BGM, Freesound CC0 효과음, 출처 `FREESOUND-CREDITS.md` |
