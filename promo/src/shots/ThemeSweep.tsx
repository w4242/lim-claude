// S4 라이트 → 다크 스윕 — theme-switch-moves A「theme-sweep-toggle」
//   (demos/interaction/theme-switch-moves/ThemeSweepToggle.tsx) 적응판.
// 유지한 조율값 (시간표 30fps, 140f):
//   0–8 포인터가 토글로 · 8 클릭(손잡이 spring damping 16 / stiffness 210, 1회 오버슈트)
//   14–78 15° 사선 경계가 토글 쪽(오른쪽)에서 왼쪽으로 스윕, bezier(.3,0,.35,1), 세계 밖 400px 초과 스윕
//   10–40 카메라 토글 특写 → 전경 (EASE.smooth), 40f 전경 도착이 경계의 화면 중앙 통과(~43f)보다 먼저 = 낮밤 공존 포스터 프레임
//   76–96 여운 '불 켜짐' (밤에만 있는 빛이 차례로) · 96–140 hold, 1.0→1.02 아주 느린 推近
// 다시 입힌 것:
//   - 낮/밤 세계 = lim-claude 실제 라이트·다크 캡처 (두 장의 레이아웃은 픽셀 단위로 같다 — 카드 命门)
//   - 토글 = 실제 토글의 트랙 층 + 손잡이 층 캡처 (손잡이만 연속 이동). 해→달 아이콘은 실제 트랙에 이미 있다
//   - 경계의 노을 주황 → 앱 인디고 계열(primary-soft / primary), 여운 빛 = 토글 · 「추가」 버튼 · 창 테두리
import React from 'react';
import { AbsoluteFill, Img, staticFile, useCurrentFrame } from 'remotion';
import { EASE, Grain, bezier, mix, ramp, velocity } from '../fixtures/Polish';
import { springAt } from '../fixtures/Look';
import { DARK, rgba } from '../theme';
import { Cam, LAYOUT, PageWindow, camStyle, toScreen } from '../world';
import { FULL } from './CraneRise';

export const SWEEP_DURATION = 140;
export const CLICK = 8;
export const SWEEP0 = 14;
const SWEEP1 = 78;
const CAM0 = 10;
const CAM1 = 40;
const LIGHTS = 76;

const T15 = Math.tan((15 * Math.PI) / 180);
const TG = LAYOUT.toggle;
const TOG_C = { x: TG.x + TG.w / 2, y: TG.y + TG.h / 2 };
const TC = LAYOUT.toggleClip;
const TH = LAYOUT.thumbClip;
const BTN = LAYOUT.primaryBtn;
const Z0 = 3.6; // 토글이 화면에서 ~200px 가 되는 특写 (데모 2.0 × 132px 토글과 같은 체감 크기)

const P0 = 1190; // 특写 화면 오른쪽 끝 바로 밖
const P1 = -560; // 전경 왼쪽 아래 모서리를 넘어서까지
const SWEEP_EASE = bezier(0.3, 0, 0.35, 1);
const pAt = (f: number) => mix(P0, P1, ramp(f, SWEEP0, SWEEP1 - SWEEP0, SWEEP_EASE));

export const sweepCam = (frame: number): Cam => {
  const camT = ramp(frame, CAM0, CAM1 - CAM0, EASE.smooth);
  const pre = ramp(frame, 0, CAM0, EASE.linear);
  const hold = ramp(frame, CAM1, SWEEP_DURATION - CAM1, EASE.swift);
  const s = mix(Z0 * (1 + 0.02 * pre), FULL.s, camT) * (1 + 0.02 * hold);
  return { s, cx: mix(TOG_C.x - 600 / Z0, FULL.cx, camT), cy: mix(TOG_C.y + 300 / Z0, FULL.cy, camT) };
};

const hash = (n: number) => {
  const x = Math.sin(n * 91.345 + 47.853) * 43758.5453;
  return x - Math.floor(x);
};

// 무대 (창 밖) — 낮: 라이트 슬레이트 + 좌상단 창문 빛 / 밤: 다크 슬레이트 + 우상단 인디고 빛 + 별
const StageBg: React.FC<{ night: boolean; frame: number }> = ({ night, frame }) => (
  <div style={{ position: 'absolute', left: -900, top: -700, width: 3100, height: 2300 }}>
    <div style={{ position: 'absolute', inset: 0, background: night ? 'linear-gradient(180deg, #111a2e 0%, #0b1222 55%, #050a17 100%)' : 'linear-gradient(180deg, #eef2f7 0%, #e5eaf1 55%, #d9e0ea 100%)' }} />
    <div style={{
      position: 'absolute', inset: 0,
      background: night
        ? 'radial-gradient(ellipse 34% 30% at 62% 30%, rgba(99,102,241,0.30) 0%, rgba(99,102,241,0) 72%)'
        : 'radial-gradient(ellipse 34% 30% at 34% 28%, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0) 72%)',
      mixBlendMode: night ? 'screen' : 'normal',
    }} />
    {!night && [0, 1, 2].map((i) => (
      <div key={i} style={{
        position: 'absolute', left: 500 + i * 280, top: 300, width: 140, height: 2200, transform: 'rotate(-32deg)', transformOrigin: '0 0',
        background: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.5) 50%, rgba(255,255,255,0) 100%)', opacity: 0.5 - i * 0.12,
      }} />
    ))}
    {night && Array.from({ length: 60 }, (_, i) => {
      const x = hash(i * 3.1) * 3100;
      const y = hash(i * 7.7 + 2) * 2300;
      const z = hash(i * 1.9 + 5);
      const tw = 0.55 + 0.45 * Math.sin(frame / (9 + z * 14) + i * 1.7);
      const sz = 1.2 + z * 1.8;
      return <div key={i} style={{ position: 'absolute', left: x, top: y, width: sz, height: sz, borderRadius: '50%', background: '#e0e7ff', opacity: (0.2 + 0.5 * z) * tw }} />;
    })}
  </div>
);

const Pointer: React.FC<{ x: number; y: number; s: number; o: number }> = ({ x, y, s, o }) => (
  <svg width={30} height={30} viewBox="0 0 28 28" style={{
    position: 'absolute', left: x - 2, top: y - 1, opacity: o, overflow: 'visible', transformOrigin: '2px 1px', transform: `scale(${s.toFixed(3)})`,
    filter: 'drop-shadow(0 1px 1px rgba(15,23,42,0.35)) drop-shadow(0 4px 6px rgba(15,23,42,0.25))',
  }}>
    <path d="M2 1 L2 23 L8 17.5 L11.5 25 L15.5 23.2 L12 15.8 L20 15 Z" fill="#0f172a" stroke="#ffffff" strokeWidth={1.6} strokeLinejoin="round" />
  </svg>
);

const DayWorld: React.FC<{ frame: number; knob: number }> = ({ frame, knob }) => (
  <>
    <StageBg night={false} frame={frame} />
    <PageWindow tex="light" elevation={30}>
      {/* 실제 토글: 트랙 층 + 손잡이 층(연속 이동, 앱과 같은 26px 이동량) */}
      <Img src={staticFile('textures/toggle-track.png')} style={{ position: 'absolute', left: TC.x, top: TC.y, width: TC.w, height: TC.h }} />
      <Img src={staticFile('textures/toggle-thumb.png')} style={{
        position: 'absolute', left: TH.x, top: TH.y, width: TH.w, height: TH.h, transform: `translateX(${(26 * knob).toFixed(3)}px)`,
      }} />
    </PageWindow>
  </>
);

const NightWorld: React.FC<{ frame: number; lights: number }> = ({ frame, lights }) => {
  const tog = EASE.out(Math.min(1, Math.max(0, lights * 2.2)));
  const btn = EASE.out(Math.min(1, Math.max(0, lights * 2.2 - 0.5)));
  const rim = EASE.out(Math.min(1, Math.max(0, lights * 2.2 - 1)));
  return (
    <>
      <StageBg night frame={frame} />
      <PageWindow tex="dark" elevation={30} rim={rim}>
        {/* 여운: 다크 모드에서만 켜지는 빛 — 토글 → 「추가」 버튼 → 창 테두리 */}
        <div style={{
          position: 'absolute', left: TG.x, top: TG.y, width: TG.w, height: TG.h, borderRadius: 999,
          boxShadow: `0 0 ${(14 * tog).toFixed(1)}px ${rgba(DARK.primary, 0.75 * tog)}, 0 0 ${(36 * tog).toFixed(1)}px ${rgba(DARK.primary, 0.35 * tog)}`,
        }} />
        <div style={{
          position: 'absolute', left: BTN.x, top: BTN.y, width: BTN.w, height: BTN.h, borderRadius: 8,
          boxShadow: `0 0 ${(16 * btn).toFixed(1)}px ${rgba(DARK.primary, 0.6 * btn)}, 0 0 ${(44 * btn).toFixed(1)}px ${rgba(DARK.primary, 0.28 * btn)}`,
        }} />
      </PageWindow>
    </>
  );
};

export const ThemeSweep: React.FC = () => {
  const frame = useCurrentFrame();
  const cam = sweepCam(frame);

  const knob = frame < CLICK ? 0 : Math.min(30 / 26, springAt(frame, CLICK, { damping: 16, stiffness: 210 }));

  // 포인터: 토글로 미끄러져 와서 → 누르고 → 비켜남 (세계 좌표, 특写에서 화면 ~60px)
  const ptrT = ramp(frame, 0, CLICK, EASE.out);
  const away = ramp(frame, CLICK + 6, 16, EASE.swift);
  const ptrX = mix(TOG_C.x + 42, TOG_C.x + 6, ptrT) + 17 * away;
  const ptrY = mix(TOG_C.y + 33, TOG_C.y + 2, ptrT) + Math.sin(ptrT * Math.PI) * 3 + 20 * away;
  const press = frame < CLICK - 1 ? 1 : mix(0.86, 1, ramp(frame, CLICK + 1, 6, EASE.out));
  const ptrO = 1 - ramp(frame, 22, 10, EASE.exit);

  const p = pAt(frame);
  const streak = Math.min(1, Math.abs(velocity(pAt, frame)) / 80); // 데모: 최고속에서 ~0.62 가 되도록 세계 크기 비례 환산
  const sweeping = frame >= SWEEP0 && frame < SWEEP1;
  const night = frame >= SWEEP0;
  const dayGone = frame >= SWEEP1;
  const nightClip = `polygon(${p - 700 * T15}px -700px, 2600px -700px, 2600px 1700px, ${p + 1700 * T15}px 1700px)`;
  const edgeO = ramp(frame, SWEEP0, 3, EASE.linear) * (1 - ramp(frame, SWEEP1 - 8, 8, EASE.linear));
  const lights = ramp(frame, LIGHTS, 20, EASE.linear);

  const a = toScreen(cam, p - 700 * T15, -700);
  const b = toScreen(cam, p + 1700 * T15, 1700);
  const screenNightClip = `polygon(${a.x}px ${a.y}px, 5000px ${a.y}px, 5000px ${b.y}px, ${b.x}px ${b.y}px)`;
  const screenDayClip = `polygon(-3000px ${a.y}px, ${a.x}px ${a.y}px, ${b.x}px ${b.y}px, -3000px ${b.y}px)`;

  const YC = 400; // 경계 띠의 회전 중심 높이 (세계)
  const xc = p + YC * T15;
  const duskW = 60 + 150 * streak;
  const coolW = 52 + 120 * streak;

  return (
    <AbsoluteFill style={{ background: '#050a17', overflow: 'hidden' }}>
      <div style={camStyle(cam)}>
        {!dayGone && <DayWorld frame={frame} knob={knob} />}
        {night && (
          <div style={{ position: 'absolute', left: 0, top: 0, width: 1280, height: 833, clipPath: dayGone ? undefined : nightClip }}>
            <NightWorld frame={frame} lights={lights} />
          </div>
        )}
        {sweeping && (
          <div style={{ position: 'absolute', left: 0, top: 0, width: 1280, height: 833, pointerEvents: 'none', opacity: edgeO }}>
            {/* 밝은 쪽: 다가오는 막의 부드러운 그늘 + 연인디고 띠 (속도에 따라 넓어짐) */}
            <div style={{
              position: 'absolute', left: xc - duskW, top: YC - 1300, width: duskW, height: 2600, transformOrigin: '100% 50%', transform: 'rotate(-15deg)',
              background: `linear-gradient(90deg, rgba(199,210,254,0) 0%, rgba(199,210,254,${(0.08 + 0.1 * streak).toFixed(3)}) 60%, rgba(165,180,252,${(0.3 + 0.14 * streak).toFixed(3)}) 94%, rgba(30,27,75,0.25) 100%)`,
            }} />
            {/* 밤 쪽: 차가운 인디고 빛 */}
            <div style={{
              position: 'absolute', left: xc, top: YC - 1300, width: coolW, height: 2600, transformOrigin: '0% 50%', transform: 'rotate(-15deg)',
              background: `linear-gradient(90deg, rgba(129,140,248,${(0.3 + 0.1 * streak).toFixed(3)}) 0%, rgba(99,102,241,0.1) 30%, rgba(99,102,241,0) 100%)`,
            }} />
            {/* 백열 코어 선 */}
            <div style={{
              position: 'absolute', left: xc - 1, top: YC - 1300, width: 2, height: 2600, transformOrigin: '50% 50%', transform: 'rotate(-15deg)', background: '#f8fafc',
              boxShadow: '0 0 5px 1px rgba(224,231,255,0.9), 0 0 16px 3px rgba(129,140,248,0.55)',
            }} />
          </div>
        )}
        {ptrO > 0.01 && <Pointer x={ptrX} y={ptrY} s={0.55 * press} o={ptrO} />}
      </div>

      {/* 화면 공간 비네트 (낮/밤 두 층, 경계로 나눔) + 그레인 */}
      {!dayGone && (
        <AbsoluteFill style={{ clipPath: night ? screenDayClip : undefined, background: 'radial-gradient(ellipse 75% 75% at 50% 46%, rgba(15,23,42,0) 55%, rgba(15,23,42,0.12) 100%)' }} />
      )}
      {night && (
        <AbsoluteFill style={{ clipPath: dayGone ? undefined : screenNightClip, background: 'radial-gradient(ellipse 72% 72% at 50% 46%, rgba(2,6,23,0) 45%, rgba(2,6,23,0.55) 100%)' }} />
      )}
      <Grain opacity={0.05} blend="overlay" />
    </AbsoluteFill>
  );
};
