// S6 엔딩 락업 — logo-shrink-wordmark-lockup (demos/outro/logo-shrink-wordmark-lockup/LogoShrinkWordmarkLockup.tsx) 적응판.
// 유지한 조율값 (132f 시간축 t=frame/131, 설계 좌표 480×270, CSS zoom 래스터):
//   큰 링 5.4→1 수축 seg(.02,.28,inOutCubic) + 끝 1.06 브레이크 · 수축 중 감속 회전 -150° · 잔상 2장
//   · 링 → 흰 O 치유 seg(.10,.28) · 브레이크 순간(.24–.32) 마크로 교차 · 충격파 1회 seg(.28,.46)
//   · 아이콘 왼쪽 비킴 seg(.34,.47) · 글자 스태거 .46 + i·(0.24/n), 각 .10 동안 8px→0 + blur 2.5→0
//   · 태그라인 .72–.84 페이드 + 3px 상승.
// 다시 입힌 것: 보라 네온 → 앱 다크 primary 인디고, 배경 → 앱 다크 bg(#0f172a) 계열.
//   마크 = 앱 다크 상태 토글(트랙 primary-soft · 테두리/손잡이 primary · 해 아이콘 on-primary-soft).
//   흰 O 가 그대로 '손잡이'가 되고 트랙이 왼쪽으로 펼쳐진다 → 「이 앱의 상징은 그 토글」.
//   lim-claude 에는 로고가 없어 토글 모양을 마크로 삼았다 (설계 spec 에 기록).
// 길이: 132f 동작 + 18f 추가 hold = 150f (t 는 1 에서 고정).
import React from 'react';
import { AbsoluteFill, useCurrentFrame } from 'remotion';
import { Grain, Vignette } from '../fixtures/Polish';
import { DARK, FONT_KR } from '../theme';

export const OUTRO_DURATION = 150;
const BASE = 132;
const DT = 1 / (BASE - 1);

const E = {
  inOutCubic: (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  outCubic: (t: number) => 1 - Math.pow(1 - t, 3),
  inOutQuad: (t: number) => (t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t),
  outQuad: (t: number) => t * (2 - t),
};
const lerp = (t: number, a: number, b: number) => a + (b - a) * t;
const seg = (t: number, t0: number, t1: number, ease: (x: number) => number = (x) => x) => ease(Math.min(1, Math.max(0, (t - t0) / (t1 - t0))));

const WORDMARK = 'Lim Claude';
const ICON = 30;
const WORD_W = 127; // 24px / 700 / -0.02em 실측 (Noto Sans CJK KR)
const GAP = 10;
// 마크(토글) 기하: 손잡이 지름 22, 트랙 50×28. 손잡이 중심 = 아이콘 중심.
const TRACK_W = 50;
const TRACK_H = 28;
const THUMB = 22;
const TRACK_LEFT_OF_C = TRACK_W - (THUMB / 2 + 3); // 36: 손잡이 중심에서 트랙 왼쪽 끝까지
const TRACK_RIGHT_OF_C = THUMB / 2 + 3; // 14
const GROUP_W = TRACK_W + GAP + WORD_W;
const SHIFT = TRACK_LEFT_OF_C - GROUP_W / 2; // 그룹 전체가 화면 중앙에 오도록
const ROW_LEFT = SHIFT + TRACK_RIGHT_OF_C + GAP;
const STAGGER = (0.7 - 0.46) / WORDMARK.length;

const arcPath = (cx: number, cy: number, r: number, a0: number, a1: number) => {
  const p = (a: number) => [cx + r * Math.cos((a * Math.PI) / 180), cy + r * Math.sin((a * Math.PI) / 180)];
  const [x0, y0] = p(a0);
  const [x1, y1] = p(a1);
  return `M${x0.toFixed(2)},${y0.toFixed(2)} A${r},${r} 0 ${Math.abs(a1 - a0) > 180 ? 1 : 0} 1 ${x1.toFixed(2)},${y1.toFixed(2)}`;
};
const Arcs: React.FC<{ col: string; w: number; blur: number; opacity: number }> = ({ col, w, blur, opacity }) => (
  <g opacity={opacity}>
    {[[-32, 122], [148, 302]].map(([b0, b1], i) => (
      <path key={i} d={arcPath(15, 15, 10.5, b0, b1)} fill="none" stroke={col} strokeWidth={w} strokeLinecap="round" style={blur ? { filter: `blur(${blur}px)` } : undefined} />
    ))}
  </g>
);

const scaleAt = (t: number) => {
  const k = seg(t, 0.02, 0.28, E.inOutCubic);
  const brake = Math.sin(seg(t, 0.26, 0.37) * Math.PI) * 0.06;
  return lerp(k, 5.4, 1) * (1 + brake);
};
const spinAt = (t: number) => -150 * seg(t, 0.0, 0.3, E.outCubic);

// 앱 다크 상태 토글 (마크). grow = 트랙이 손잡이에서 왼쪽으로 펼쳐지는 정도
const ToggleMark: React.FC<{ grow: number; opacity: number }> = ({ grow, opacity }) => (
  <div style={{ position: 'absolute', left: ICON / 2 - TRACK_LEFT_OF_C, top: ICON / 2 - TRACK_H / 2, width: TRACK_W, height: TRACK_H, opacity }}>
    <div style={{
      position: 'absolute', inset: 0, borderRadius: TRACK_H / 2, background: DARK.primarySoft, border: `1.5px solid ${DARK.primary}`, boxSizing: 'border-box',
      transform: `scaleX(${(0.44 + 0.56 * grow).toFixed(4)})`, transformOrigin: '100% 50%', opacity: grow,
    }} />
    {/* 해 아이콘 (다크 상태에서 왼쪽에 보이는 실제 토글 아이콘과 같은 모양) */}
    <svg viewBox="0 0 24 24" width={13} height={13} fill="none" stroke={DARK.onPrimarySoft} strokeWidth={2} strokeLinecap="round"
      style={{ position: 'absolute', left: 7, top: (TRACK_H - 13) / 2, opacity: seg(grow, 0.6, 1) }}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
    <div style={{ position: 'absolute', right: 3, top: 3, width: THUMB, height: THUMB, borderRadius: '50%', background: DARK.primary, boxShadow: '0 1px 3px rgba(0,0,0,0.3)' }} />
  </div>
);

export const OutroLockup: React.FC = () => {
  const frame = useCurrentFrame();
  const t = Math.min(1, frame / (BASE - 1));
  const s = scaleAt(t);
  const spin = spinAt(t);
  const shift = seg(t, 0.34, 0.47, E.inOutCubic) * SHIFT;
  const heal = seg(t, 0.1, 0.28, E.inOutQuad);
  const markIn = seg(t, 0.24, 0.32, E.inOutQuad);
  const grow = seg(t, 0.3, 0.42, E.outCubic); // 트랙 펼침: 브레이크 직후 ~ 비킴 시작 전후
  const ds = Math.abs(scaleAt(t) - scaleAt(t - DT));
  const trail = Math.min(1, ds / 0.35);
  const wave = seg(t, 0.28, 0.46, E.outCubic);
  const haloR = lerp(seg(t, 0.02, 0.3, E.inOutCubic), 150, 34);
  const haloA = 0.5 - 0.32 * seg(t, 0.3, 0.5, E.outCubic);

  const icon = (sc: number, rot: number, opacity: number, ghost = false) => (
    <div style={{
      position: 'absolute', left: '50%', top: '50%', width: ICON, height: ICON, margin: `${-ICON / 2}px 0 0 ${-ICON / 2}px`,
      transform: `translateX(${shift}px) scale(${sc})`, opacity,
    }}>
      <svg viewBox="0 0 30 30" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', overflow: 'visible', transform: `rotate(${rot}deg)` }}>
        <Arcs col="rgba(99,102,241,.62)" w={6.5} blur={2.5} opacity={1 - heal} />
        {!ghost && <Arcs col={heal > 0.5 ? '#fff' : '#e0e7ff'} w={3.4} blur={0} opacity={(1 - heal * 0.75) * (1 - markIn)} />}
        {!ghost && <circle cx={15} cy={15} r={10.5} fill="none" stroke="#fff" strokeWidth={5.5} opacity={heal * (1 - markIn)} />}
      </svg>
      {!ghost && markIn > 0 && <ToggleMark grow={grow} opacity={markIn} />}
    </div>
  );

  return (
    <AbsoluteFill>
      <AbsoluteFill style={{ background: DARK.bg, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', left: 0, top: 0, width: 480, height: 270, overflow: 'hidden', zoom: 4 }}>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, #131c31 0%, #0f172a 60%, #0a1120 100%)' }} />
          <div style={{
            position: 'absolute', left: `calc(50% + ${shift}px - ${haloR}px)`, top: `calc(50% - ${haloR}px)`, width: haloR * 2, height: haloR * 2, borderRadius: '50%', opacity: haloA,
            background: 'radial-gradient(circle, rgba(99,102,241,0.42) 0%, rgba(99,102,241,0.12) 38%, rgba(99,102,241,0) 70%)',
          }} />
          {wave > 0 && wave < 1 && (
            <div style={{
              position: 'absolute', left: `calc(50% - ${lerp(wave, 16, 70)}px)`, top: `calc(50% - ${lerp(wave, 16, 70)}px)`,
              width: lerp(wave, 32, 140), height: lerp(wave, 32, 140), borderRadius: '50%', boxSizing: 'border-box',
              border: `${lerp(wave, 0.9, 0.25)}px solid rgba(224,231,255,${(0.55 * (1 - wave)).toFixed(3)})`,
              boxShadow: `0 0 ${lerp(wave, 4, 10)}px rgba(129,140,248,${(0.45 * (1 - wave)).toFixed(3)})`,
            }} />
          )}
          {trail > 0.02 && icon(scaleAt(t - 2 * DT), spinAt(t - 2 * DT), 0.16 * trail, true)}
          {trail > 0.02 && icon(scaleAt(t - DT), spinAt(t - DT), 0.3 * trail, true)}
          {icon(s, spin, 1)}
          <div style={{ position: 'absolute', left: `calc(50% + ${ROW_LEFT}px)`, top: '50%', height: ICON, marginTop: -ICON / 2, display: 'flex', alignItems: 'center' }}>
            {[...WORDMARK].map((ch, i) => {
              const lk = seg(t, 0.46 + i * STAGGER, 0.46 + i * STAGGER + 0.1, E.outCubic);
              return (
                <span key={i} style={{
                  color: DARK.text, font: `700 24px/1 ${FONT_KR}`, letterSpacing: '-0.02em', whiteSpace: 'pre', opacity: lk,
                  transform: `translateX(${lerp(lk, 8, 0)}px)`, filter: lk < 0.999 ? `blur(${lerp(lk, 2.5, 0).toFixed(2)}px)` : undefined,
                }}>{ch}</span>
              );
            })}
          </div>
          <div style={{
            position: 'absolute', left: 0, right: 0, top: 'calc(50% + 32px)', textAlign: 'center', color: DARK.primaryHover,
            font: `700 13px/1 ${FONT_KR}`, letterSpacing: 0.5,
            opacity: seg(t, 0.72, 0.84, E.outQuad), transform: `translateY(${lerp(seg(t, 0.72, 0.86, E.outCubic), 3, 0)}px)`,
          }}>밝을 때도, 어두울 때도 편안하게</div>
        </div>
      </AbsoluteFill>
      <Vignette strength={0.5} inner={0.4} color="#000000" />
      <Grain opacity={0.06} blend="soft-light" />
    </AbsoluteFill>
  );
};
