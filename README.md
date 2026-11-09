# lim-claude
임희섭

## 실행

```bash
npm install
npm run dev
```

## 라이트/다크 모드

- 헤더 오른쪽 스위치로 전환합니다. 고른 모드는 `localStorage`에 저장됩니다.
- 한 번도 고르지 않았다면 OS 설정(`prefers-color-scheme`)을 따릅니다.
- 모든 색상은 `src/styles/theme.css`의 CSS 변수에서 나옵니다. 새 컴포넌트도 이 변수만 쓰면 두 모드에서 모두 동작합니다.
- `npm test`는 두 테마의 글자/배경 조합이 WCAG AA 대비 기준(본문 4.5:1)을 넘는지 검사합니다.
