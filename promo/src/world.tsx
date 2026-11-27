// 페이지 세계 좌표 — 실제 캡처(public/textures)를 페이지 CSS px 좌표 그대로 놓는다.
// layout.json 의 bbox 와 같은 좌표계이므로, 오버레이는 bbox 를 그대로 쓰면 된다.
import React from 'react';
import { Img, staticFile } from 'remotion';
import L from './layout.json';
import { DARK, LIGHT, rgba } from './theme';

export const LAYOUT = L;
export const PAGE = { w: L.pageW, h: L.pageH };
export const HI = L.hi; // 특写용 고해상도 패치 영역 (capture.mjs)
// 화면에 보여 줄 '창' 영역: 콘텐츠(176–1104) 좌우 80px 여백 + 폼 카드 아래 여백까지
export const WIN = { x: 96, y: 0, w: 1088, h: 812, r: 16 };

export type Cam = { s: number; cx: number; cy: number };
// 세계 → 화면 변환 (화면 중심 960,540 에 세계 점 cx,cy 가 오도록)
export const camStyle = ({ s, cx, cy }: Cam): React.CSSProperties => ({
  position: 'absolute', left: 0, top: 0, width: PAGE.w, height: PAGE.h, transformOrigin: '0 0',
  transform: `translate(${(960 - cx * s).toFixed(2)}px, ${(540 - cy * s).toFixed(2)}px) scale(${s.toFixed(4)})`,
});
export const toScreen = ({ s, cx, cy }: Cam, wx: number, wy: number) => ({ x: (wx - cx) * s + 960, y: (wy - cy) * s + 540 });

// 실제 페이지 캡처를 담은 창. elevation = 그림자 높이(px), rim = 다크에서 창 테두리 인디고 빛(0–1)
export const PageWindow: React.FC<{
  tex: 'light' | 'dark';
  elevation?: number;
  rim?: number;
  // 특写 구간용 고해상도 패치 (같은 페이지를 더 높은 DSF 로 잘라 캡처한 것, 같은 좌표에 겹침)
  patch?: { src: string; x: number; y: number; w: number; h: number };
  children?: React.ReactNode;
}> = ({ tex, elevation = 28, rim = 0, patch, children }) => {
  const dark = tex === 'dark';
  const e = elevation;
  const shadow = dark
    ? `0 0 0 1px ${rgba('#94a3ff', 0.1 + 0.2 * rim)}, 0 0 ${(70 * rim).toFixed(1)}px ${rgba(DARK.primary, 0.25 * rim)}, 0 ${e * 1.4}px ${e * 3}px -${e * 0.6}px rgba(0,2,10,0.85), 0 ${e * 0.4}px ${e}px rgba(0,2,10,0.5)`
    : `0 0 0 1px ${rgba(LIGHT.text, 0.06)}, 0 ${e * 1.4}px ${e * 3}px -${e * 0.7}px ${rgba(LIGHT.text, 0.22)}, 0 ${e * 0.3}px ${e * 0.8}px ${rgba(LIGHT.text, 0.08)}`;
  return (
    <div style={{ position: 'absolute', left: WIN.x, top: WIN.y, width: WIN.w, height: WIN.h, borderRadius: WIN.r, overflow: 'hidden', boxShadow: shadow, background: dark ? DARK.bg : LIGHT.bg }}>
      <Img src={staticFile(`textures/${tex}.png`)} style={{ position: 'absolute', left: -WIN.x, top: -WIN.y, width: PAGE.w, height: PAGE.h }} />
      {patch && (
        <Img src={staticFile(`textures/${patch.src}`)} style={{ position: 'absolute', left: patch.x - WIN.x, top: patch.y - WIN.y, width: patch.w, height: patch.h }} />
      )}
      <div style={{ position: 'absolute', left: -WIN.x, top: -WIN.y, width: PAGE.w, height: PAGE.h }}>{children}</div>
    </div>
  );
};
