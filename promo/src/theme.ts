// 디자인 토큰 — 전부 lim-claude 의 src/styles/theme.css · app.css 에서 그대로 가져온 값.
// 영상 안의 모든 글자·색·모서리·그림자는 이 표만 쓴다 (SKILL 핵심 원칙 2: 시각 언어는 제품에서 자란다).

export const LIGHT = {
  bg: '#f8fafc',
  surface: '#ffffff',
  surfaceMuted: '#f1f5f9',
  border: '#e2e8f0',
  text: '#0f172a',
  textMuted: '#475569',
  primary: '#4f46e5',
  primaryHover: '#4338ca',
  onPrimary: '#ffffff',
  primarySoft: '#eef2ff',
  onPrimarySoft: '#3730a3',
  success: '#15803d',
  successSoft: '#dcfce7',
  danger: '#b91c1c',
  dangerSoft: '#fee2e2',
} as const;

export const DARK = {
  bg: '#0f172a',
  surface: '#1e293b',
  surfaceMuted: '#273449',
  border: '#334155',
  text: '#f1f5f9',
  textMuted: '#94a3b8',
  primary: '#818cf8',
  primaryHover: '#a5b4fc',
  onPrimary: '#0f172a',
  primarySoft: '#312e81',
  onPrimarySoft: '#e0e7ff',
  success: '#4ade80',
  successSoft: '#14532d',
  danger: '#f87171',
  dangerSoft: '#450a0a',
} as const;

// 앱 폰트 스택: system-ui, …, 'Noto Sans KR'. 렌더 환경(Linux)에서는 Noto Sans CJK KR 로 해석된다.
export const FONT_KR = '"Noto Sans CJK KR", "Noto Sans KR", system-ui, sans-serif';
export const FONT_MONO = '"DejaVu Sans Mono", ui-monospace, monospace';

// 앱의 반경: 카드 12px · 버튼/입력 8px · 배지/토글 999px
export const RADIUS = { card: 12, control: 8, pill: 999 } as const;

// 모션 성격 토큰 (pipeline.md 「브랜드→모션 파라미터」): 작은 팀용 업무 대시보드
//   에너지 축: 낮음~중간 (차분한 업무 도구) · 톤 축: 진지~친근 사이 (둥근 모서리 + 인디고)
//   → 「전문·신뢰」 프리셋에서 출발해 「친근」 쪽으로 조금 이동.
export const MOTION = {
  baseDur: 24, // 주 입장 시간 @30fps
  enter: [0.25, 0.46, 0.45, 0.94] as const, // 입장 easing (친근 프리셋)
  overshoot: 1.04, // 착지가 있는 동작만
  squash: 0,
};

export const rgba = (hex: string, a: number) => {
  const h = hex.replace('#', '');
  const n = parseInt(h, 16);
  return `rgba(${(n >> 16) & 255},${(n >> 8) & 255},${n & 255},${a})`;
};
