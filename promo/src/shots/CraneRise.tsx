// S2 크레인 업 — crane-rise-reveal (demos/opening/crane-rise-reveal/CraneRiseReveal.tsx) 적응판.
// 유지한 조율값: 특写 hold 24f(+1.5% 호흡 推近) · 상승 24→126f, 대상점과 scale 이 같은 bezier(0.2,0,0.25,1)
//   · 빠른 구간(25–64f)만 CameraMotionBlur(shutter 150, samples 10) · 비추적 영역 38%→100% (HOLD-2 부터 28f)
//   · 시야 위쪽이 요소를 넘을 때 인디고 洗光(20f) · 창 그림자 6→34 · 배경 점 격자 0.35 시차
//   · 134f 여운 이벤트(spring damping 16 / stiffness 190) · 그 뒤 hold.
// 다시 입힌 것: 가짜 렌더 큐 → lim-claude 실제 캡처, 추적 행 = 'API 응답 속도 측정'.
//   여운: 데모의 상태 뒤집기 대신 추적 행 하이라이트가 한 번 맥동하며 또렷해진다.
//   (앱에는 상태를 바꾸는 기능이 없어서, 바뀌는 척하면 없는 기능을 암시하게 된다 — 독립 검수 P3)
//   특写 2.6× 구간은 DSF 6 고해상도 패치를 겹쳐 텍스처 ≥ 2× 유지 (Q2).
//   KPI 숫자 카운트는 실제 캡처 위에 글자를 덧그려야 해서 뺐다 (Q1: 기존 화면 복각 금지).
import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { CameraMotionBlur } from '@remotion/motion-blur';
import { EASE, bezier, mix, ramp } from '../fixtures/Polish';
import { springAt } from '../fixtures/Look';
import { LIGHT, rgba } from '../theme';
import { Cam, HI, LAYOUT, PageWindow, WIN, camStyle } from '../world';

export const CRANE_DURATION = 165;
const HOLD = 24;
const MOVE_END = 126;
const BLUR_END = 64;
const PULSE = 119; // 여운 이벤트: 정지 hold ≥30f 확보 (162f 컷 기준)
const crane = bezier(0.2, 0, 0.25, 1);

const ROW = LAYOUT.rows[1]; // 추적 행
const S0 = 2.6;
const F0 = { x: 500, y: ROW.y + ROW.h / 2 }; // 작업명·담당자·상태 배지가 한 화면에 들어오는 특写
export const FULL: Cam = { s: 1.15, cx: 640, cy: 436 };

export const craneCam = (frame: number): Cam & { visTop: number } => {
  const breath = ramp(frame, 0, HOLD, EASE.smooth);
  const e = crane(Math.min(1, Math.max(0, (frame - HOLD) / (MOVE_END - HOLD))));
  const s0 = S0 * (1 + 0.015 * breath);
  const s = mix(s0, FULL.s, e);
  const cx = mix(F0.x, FULL.cx, e);
  const cy = mix(F0.y, FULL.cy, e);
  return { s, cx, cy, visTop: cy - 540 / s };
};

// 시야 위쪽이 처음 넘는 프레임 (처음부터 보이던 요소는 -1)
const trigFor = (y: number) => {
  if (craneCam(HOLD).visTop <= y) return -1;
  for (let f = HOLD; f <= MOVE_END; f++) if (craneCam(f).visTop <= y + 2) return f;
  return MOVE_END;
};
const WASHES = LAYOUT.stats.map((r, i) => ({ r, t: trigFor(r.y) + i * 3 }));

// 배경: 앱 라이트 톤의 무대 + 점 격자(0.35 시차)
const DOTS = (() => {
  const out: { x: number; y: number }[] = [];
  for (let y = -600; y <= 1700; y += 48) for (let x = -900; x <= 2800; x += 48) out.push({ x, y });
  return out;
})();
const Backdrop: React.FC<{ cam: Cam }> = ({ cam }) => {
  const k = 0.35;
  const sp = 1 + (cam.s - 1) * k;
  const tx = 960 - cam.cx * cam.s;
  const ty = 540 - cam.cy * cam.s;
  const px = 960 + (tx + 960 * cam.s - 960) * k - 960 * sp;
  const py = 540 + (ty + 540 * cam.s - 540) * k - 540 * sp;
  return (
    <AbsoluteFill style={{ background: 'linear-gradient(180deg, #eef2f7 0%, #e7ecf3 55%, #dde4ed 100%)' }}>
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse 60% 55% at 50% 0%, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0) 70%)' }} />
      <svg width={1920} height={1080} style={{ position: 'absolute', inset: 0 }}>
        <g transform={`translate(${px.toFixed(2)} ${py.toFixed(2)}) scale(${sp.toFixed(4)})`}>
          {DOTS.map((d, i) => <circle key={i} cx={d.x} cy={d.y} r={1.6} fill={rgba(LIGHT.text, 0.1)} />)}
        </g>
      </svg>
    </AbsoluteFill>
  );
};

// 창 + 오버레이 (세계 좌표)
const World: React.FC<{ frame: number }> = ({ frame }) => {
  const elev = mix(6, 34, ramp(frame, HOLD + 30, MOVE_END - HOLD - 20, EASE.swift));
  const focus = mix(0.38, 1, ramp(frame, HOLD - 2, 28, EASE.out)); // 비추적 영역 불투명도
  const dim = 1 - focus;
  const pulse = frame >= PULSE ? springAt(frame, PULSE, { damping: 16, stiffness: 190 }) : 0; // 0→1 (한 번 오버슈트)
  const flare = frame >= PULSE ? Math.max(0, 1 - (frame - PULSE) / 18) : 0; // 맥동 순간의 빛, 18f 동안 사그라짐
  const ring = frame >= PULSE ? Math.min(1, (frame - PULSE) / 20) : 0;
  const beat = 0.5 + 0.5 * Math.sin(frame / 5.5);
  const dotY = ROW.y + ROW.h / 2;
  const hole = { x: ROW.x - 10, y: ROW.y + 2, w: ROW.w + 20, h: ROW.h - 4 };
  const veil = rgba(LIGHT.bg, dim);
  return (
    <PageWindow tex="light" elevation={elev} patch={{ src: 'hi-crane-light.png', ...HI.crane }}>
      {/* 초점: 추적 행만 또렷하게, 나머지는 베일 (구멍 낸 4장) */}
      {dim > 0.002 && (
        <>
          <div style={{ position: 'absolute', left: WIN.x, top: 0, width: WIN.w, height: hole.y, background: veil }} />
          <div style={{ position: 'absolute', left: WIN.x, top: hole.y + hole.h, width: WIN.w, height: 900 - hole.y - hole.h, background: veil }} />
          <div style={{ position: 'absolute', left: WIN.x, top: hole.y, width: hole.x - WIN.x, height: hole.h, background: veil }} />
          <div style={{ position: 'absolute', left: hole.x + hole.w, top: hole.y, width: WIN.x + WIN.w - hole.x - hole.w, height: hole.h, background: veil }} />
        </>
      )}
      {/* 추적 행 하이라이트 (앱 primary 인디고) */}
      <div style={{
        position: 'absolute', left: hole.x, top: hole.y, width: hole.w, height: hole.h, borderRadius: 8,
        background: `linear-gradient(90deg, ${rgba(LIGHT.primary, 0.09 + 0.04 * pulse)} 0%, ${rgba(LIGHT.primary, 0.04 + 0.02 * pulse)} 60%, ${rgba(LIGHT.primary, 0.025)} 100%)`,
        boxShadow: `inset 0 0 0 ${(1 + 0.5 * pulse).toFixed(2)}px ${rgba(LIGHT.primary, 0.24 + 0.2 * pulse)}, 0 0 ${(18 * flare).toFixed(1)}px ${rgba(LIGHT.primary, 0.35 * flare)}`,
      }} />
      {/* 맥동 링: 행 테두리에서 한 번 퍼져 나감 (모서리 반경 안에서) */}
      {ring > 0 && ring < 1 && (
        <div style={{
          position: 'absolute', left: hole.x - 10 * ring, top: hole.y - 6 * ring, width: hole.w + 20 * ring, height: hole.h + 12 * ring,
          borderRadius: 8 + 6 * ring, border: `1.5px solid ${rgba(LIGHT.primary, 0.45 * (1 - ring))}`, boxSizing: 'border-box',
        }} />
      )}
      {/* 추적 점 + 호흡 링 (카드 왼쪽 여백) */}
      <div style={{ position: 'absolute', left: 157, top: dotY - 5, width: 10, height: 10, borderRadius: 5, background: LIGHT.primary }} />
      <div style={{
        position: 'absolute', left: 157 - 6 * beat, top: dotY - 5 - 6 * beat, width: 10 + 12 * beat, height: 10 + 12 * beat,
        borderRadius: 20, border: `1.5px solid ${rgba(LIGHT.primary, 0.5 * (1 - beat))}`, boxSizing: 'border-box',
      }} />
    </PageWindow>
  );
};

// CameraMotionBlur 는 하위 트리의 useCurrentFrame 으로 다중 샘플링 → Page 가 직접 프레임을 읽는다
const Page: React.FC = () => {
  const frame = useCurrentFrame();
  const cam = craneCam(frame);
  return (
    <AbsoluteFill style={{ overflow: 'hidden' }}>
      <Backdrop cam={cam} />
      <div style={camStyle(cam)}>
        <World frame={frame} />
      </div>
    </AbsoluteFill>
  );
};

// 요소 洗光 (모션 블러 밖: 반투명 색면을 다중 샘플링하면 띠가 생긴다)
const Washes: React.FC<{ frame: number }> = ({ frame }) => (
  <AbsoluteFill style={{ pointerEvents: 'none', overflow: 'hidden' }}>
    <div style={camStyle(craneCam(frame))}>
      {WASHES.map(({ r, t }, i) => {
        if (t < 0) return null;
        const p = ramp(frame, t, 20, EASE.out);
        const op = Math.min(1, ramp(frame, t, 3, EASE.linear)) * (1 - ramp(frame, t + 6, 18, EASE.out));
        if (op <= 0.002) return null;
        const head = mix(-0.2, 1.1, p);
        return (
          <div key={i} style={{
            position: 'absolute', left: r.x, top: r.y, width: r.w, height: r.h, borderRadius: 12, opacity: op,
            background: `linear-gradient(90deg, ${rgba(LIGHT.primary, 0.02)} 0%, ${rgba(LIGHT.primary, 0.12)} ${(head * 100).toFixed(1)}%, ${rgba(LIGHT.primary, 0)} ${((head + 0.22) * 100).toFixed(1)}%)`,
            boxShadow: `inset 0 0 0 1px ${rgba(LIGHT.primary, 0.16)}`,
          }} />
        );
      })}
    </div>
  </AbsoluteFill>
);

export const CraneRise: React.FC = () => {
  const frame = useCurrentFrame();
  const fast = frame > HOLD + 1 && frame < BLUR_END;
  const vig = 1 - ramp(frame, HOLD, 60, EASE.swift);
  return (
    <AbsoluteFill style={{ background: '#e7ecf3', overflow: 'hidden' }}>
      {fast ? (
        <CameraMotionBlur shutterAngle={150} samples={10}>
          <Page />
        </CameraMotionBlur>
      ) : (
        <Page />
      )}
      <Washes frame={frame} />
      <AbsoluteFill style={{
        pointerEvents: 'none', opacity: vig,
        background: `radial-gradient(ellipse 75% 70% at 45% 55%, ${rgba(LIGHT.text, 0)} 55%, ${rgba(LIGHT.text, 0.14)} 100%)`,
      }} />
    </AbsoluteFill>
  );
};
