// S5 대비 자체 점검 — gauge-readout-moves A「needle-sweep-selftest」
//   (demos/data/gauge-readout-moves/NeedleSweepSelftest.tsx) 적응판.
// 유지한 조율값: 점화 12/16/20f (4f 엇박) · 왕로 12f ease-out(cubic)으로 270° 끝까지 · 귀로 spring(stiffness 120,
//   '8° 지나쳤다 돌아옴'으로 역산한 감쇠) · s+46f 이후 상수 고정 · 안착 s+32f 값 overshoot 9f 팝 · 이름 s+35f
//   · 왕로에서 지나간 눈금 점등 후 24f 동안 진정 · |dv|>4° 일 때 각방향 잔상 4장 · 60f 상태 칩 전환.
// 다시 입힌 것: CPU/GPU/Network 퍼센트 → WCAG 대비율(1–21 : 1) 실제 값, 빨간 영역 = AA 4.5 미만,
//   호박색 바늘 → 앱 다크 primary 인디고, 카드/글자 = 앱 다크 토큰.
// 값 출처: src/styles/theme.css 토큰으로 계산한 대비율 (repo tests/contrast.test.js 29개 통과 확인).
import React from 'react';
import { AbsoluteFill, spring, useCurrentFrame } from 'remotion';
import { EASE, Grain, mix, ramp } from '../fixtures/Polish';
import { DARK, FONT_KR, rgba } from '../theme';

export const GAUGES_DURATION = 130;

const CARD_W = 1560;
const CARD_H = 700;
const CARD_X = (1920 - CARD_W) / 2;
const CARD_Y = (1080 - CARD_H) / 2 - 30;
const GA_W = CARD_W / 3;
const R = 150;
const CX = GA_W / 2;
const CY = 220;

const MAXR = 21;
const dOf = (ratio: number) => ((ratio - 1) / (MAXR - 1)) * 270;
const AA = dOf(4.5);

const polar = (a: number, r: number): [number, number] => [CX + r * Math.cos((a * Math.PI) / 180), CY + r * Math.sin((a * Math.PI) / 180)];
const arcPath = (d0: number, d1: number, r: number) => {
  const [x0, y0] = polar(135 + d0, r);
  const [x1, y1] = polar(135 + Math.max(d0 + 0.01, d1), r);
  return `M ${x0.toFixed(2)} ${y0.toFixed(2)} A ${r} ${r} 0 ${d1 - d0 > 180 ? 1 : 0} 1 ${x1.toFixed(2)} ${y1.toFixed(2)}`;
};

// 실제 대비율: 본문 #0f172a/#f8fafc · 다크 버튼 #0f172a/#818cf8 · 라이트 완료 배지 #15803d/#dcfce7
const GAUGES = [
  { start: 12, ratio: 17.06, name: '본문 글자 · 라이트' },
  { start: 16, ratio: 5.98, name: '버튼 글자 · 다크' },
  { start: 20, ratio: 4.57, name: '완료 배지 · 라이트' },
];

const STIFF = 120;
const dampingFor = (target: number) => {
  const p = Math.min(0.5, 8 / (270 - target));
  const lp = Math.log(p);
  return 2 * (-lp / Math.sqrt(Math.PI * Math.PI + lp * lp)) * Math.sqrt(STIFF);
};
const needleAngle = (frame: number, s: number, target: number) => {
  if (frame <= s) return 0;
  if (frame <= s + 12) return 270 * ramp(frame, s, 12, (x) => 1 - Math.pow(1 - x, 3));
  if (frame >= s + 46) return target;
  const k = spring({ frame: frame - (s + 12), fps: 30, config: { stiffness: STIFF, damping: dampingFor(target), mass: 1 } });
  return mix(270, target, k);
};

const Gauge: React.FC<{ start: number; ratio: number; name: string; idx: number }> = ({ start, ratio, name, idx }) => {
  const frame = useCurrentFrame();
  const target = dOf(ratio);
  const d = needleAngle(frame, start, target);
  const dPrev = needleAngle(frame - 1, start, target);
  const settle = start + 32;
  const pop = ramp(frame, settle, 9, EASE.overshoot);
  const popOp = ramp(frame, settle, 4, EASE.out);
  const nameOp = ramp(frame, settle + 3, 10, EASE.out);
  const on = ramp(frame, start - 4, 10, EASE.out);
  const swept = frame <= start + 12 ? d : 270;
  const calm = ramp(frame, start + 12, 24, EASE.smooth);
  const gid = `g${idx}`;

  const ticks: React.ReactNode[] = [];
  for (let k = 0; k <= 20; k++) {
    const dd = k * 13.5;
    const major = k % 4 === 0;
    const a = 135 + dd;
    const [x0, y0] = polar(a, R - 10);
    const [x1, y1] = polar(a, major ? R - 30 : R - 20);
    const lit = swept >= dd - 0.5 ? 1 - calm : 0;
    const red = dd < AA;
    ticks.push(
      <line key={k} x1={x0} y1={y0} x2={x1} y2={y1} stroke={red ? DARK.danger : '#ffffff'}
        strokeOpacity={((red ? 0.55 : 0.22) + (red ? 0.4 : 0.6) * lit) * on} strokeWidth={major ? 3 : 1.6} strokeLinecap="round" />,
    );
    if (major) {
      const [lx, ly] = polar(a, R - 52);
      ticks.push(
        <text key={`l${k}`} x={lx} y={ly} textAnchor="middle" dominantBaseline="central" fontFamily={FONT_KR} fontSize={18} fontWeight={400}
          fill="#ffffff" fillOpacity={(0.38 + 0.4 * lit) * on}>{1 + k}</text>,
      );
    }
  }
  // AA 기준선 (4.5 : 1)
  const [ax0, ay0] = polar(135 + AA, R - 4);
  const [ax1, ay1] = polar(135 + AA, R - 40);
  const [alx, aly] = polar(135 + AA, R + 30);

  const needle = (deg: number, opacity: number, key?: string) => {
    const [tx, ty] = polar(135, R - 13);
    const len = Math.hypot(tx - CX, ty - CY);
    return (
      <g key={key} transform={`rotate(${(135 + deg).toFixed(3)} ${CX} ${CY})`} opacity={opacity}>
        <path d={`M ${CX - 34} ${CY - 5} L ${CX + len} ${CY - 1.6} Q ${CX + len + 3.5} ${CY} ${CX + len} ${CY + 1.6} L ${CX - 34} ${CY + 5} Z`} fill={`url(#${gid}n)`} />
      </g>
    );
  };
  const dv = d - dPrev;
  const ghosts = Math.abs(dv) > 4 ? [1, 2, 3, 4].map((g) => needle(d - (dv * g) / 4, 0.16 * (1 - g / 5), `gh${g}`)) : null;
  const pass = ratio >= 4.5;

  return (
    <div style={{ width: GA_W, height: 540, position: 'relative' }}>
      <svg width={GA_W} height={420} style={{ overflow: 'visible' }}>
        <defs>
          <linearGradient id={`${gid}n`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#4338ca" />
            <stop offset="0.55" stopColor={DARK.primary} />
            <stop offset="1" stopColor="#c7d2fe" />
          </linearGradient>
          <radialGradient id={`${gid}h`} cx="0.38" cy="0.32" r="0.7">
            <stop offset="0" stopColor="#64748b" />
            <stop offset="1" stopColor="#0f172a" />
          </radialGradient>
          <filter id={`${gid}g`} x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="6" /></filter>
        </defs>
        <circle cx={CX} cy={CY} r={R + 20} fill="rgba(255,255,255,0.025)" stroke="#ffffff" strokeOpacity={0.07 * on} strokeWidth={1} opacity={on} />
        <path d={arcPath(0, 270, R)} fill="none" stroke="#ffffff" strokeOpacity={0.07} strokeWidth={8} strokeLinecap="round" />
        <path d={arcPath(0, AA, R)} fill="none" stroke={DARK.danger} strokeOpacity={0.45 * on} strokeWidth={8} strokeLinecap="round" />
        {d > 0.5 && (
          <>
            <path d={arcPath(0, d, R)} fill="none" stroke={DARK.primary} strokeOpacity={0.45} strokeWidth={10} strokeLinecap="round" filter={`url(#${gid}g)`} />
            <path d={arcPath(0, d, R)} fill="none" stroke={DARK.primary} strokeWidth={8} strokeLinecap="round" />
          </>
        )}
        {ticks}
        <line x1={ax0} y1={ay0} x2={ax1} y2={ay1} stroke={DARK.success} strokeOpacity={0.9 * on} strokeWidth={3} strokeLinecap="round" />
        <text x={alx} y={aly} textAnchor="middle" dominantBaseline="central" fontFamily={FONT_KR} fontSize={20} fontWeight={700} fill={DARK.success} fillOpacity={0.9 * on}>AA</text>
        {ghosts}
        <g filter={`url(#${gid}g)`} opacity={0.55}>{needle(d, 1)}</g>
        {needle(d, 1)}
        <circle cx={CX} cy={CY} r={19} fill={`url(#${gid}h)`} stroke="#ffffff" strokeOpacity={0.12} strokeWidth={1} />
        <circle cx={CX} cy={CY} r={6} fill={DARK.primary} />
      </svg>
      <div style={{
        position: 'absolute', left: 0, right: 0, top: 336, textAlign: 'center', opacity: popOp, transform: `scale(${mix(0.4, 1, pop).toFixed(4)})`,
        fontFamily: FONT_KR, whiteSpace: 'nowrap',
      }}>
        <span style={{ fontWeight: 700, fontSize: 76, color: DARK.text, letterSpacing: '-0.03em', fontVariantNumeric: 'tabular-nums' }}>{ratio.toFixed(1)}</span>
        <span style={{ fontWeight: 700, fontSize: 40, color: DARK.textMuted, marginLeft: 10 }}>: 1</span>
        {pass && <span style={{ fontWeight: 700, fontSize: 40, color: DARK.success, marginLeft: 14 }}>✓</span>}
      </div>
      <div style={{
        position: 'absolute', left: 0, right: 0, top: 440, textAlign: 'center', opacity: nameOp, transform: `translateY(${mix(6, 0, nameOp)}px)`,
        fontFamily: FONT_KR, fontSize: 34, fontWeight: 400, color: DARK.textMuted,
      }}>{name}</div>
    </div>
  );
};

export const ContrastGauges: React.FC = () => {
  const frame = useCurrentFrame();
  const inP = ramp(frame, 0, 12, EASE.snappy);
  const done = ramp(frame, 60, 8, EASE.out);
  const pulse = 0.5 + 0.5 * Math.cos((frame / 14) * Math.PI);
  const ok = done > 0.5;
  return (
    <AbsoluteFill style={{ background: '#0b1222', overflow: 'hidden', fontFamily: FONT_KR }}>
      <AbsoluteFill style={{ background: 'linear-gradient(180deg, #111a2e 0%, #0b1222 55%, #050a17 100%)' }} />
      <AbsoluteFill style={{ background: 'radial-gradient(ellipse 50% 45% at 50% 20%, rgba(99,102,241,0.22) 0%, rgba(99,102,241,0) 70%)' }} />
      <div style={{
        position: 'absolute', left: CARD_X, top: CARD_Y, width: CARD_W, height: CARD_H, borderRadius: 24, boxSizing: 'border-box',
        background: `linear-gradient(180deg, ${DARK.surface} 0%, #172033 100%)`, border: `1px solid ${DARK.border}`,
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05), 0 40px 90px -20px rgba(0,2,10,0.85), 0 12px 30px rgba(0,2,10,0.5)',
        opacity: inP, transform: `translateY(${mix(18, 0, inP).toFixed(2)}px)`,
      }}>
        <div style={{ position: 'absolute', left: 48, top: 34 }}>
          <div style={{ fontSize: 44, fontWeight: 700, color: DARK.text, letterSpacing: '-0.02em' }}>색 대비 자동 검사</div>
          <div style={{ marginTop: 6, fontSize: 32, fontWeight: 400, color: DARK.textMuted }}>두 테마 색 조합 · WCAG AA (글자 4.5 : 1 · UI 3 : 1)</div>
        </div>
        <div style={{
          position: 'absolute', right: 48, top: 50, height: 56, padding: '0 22px 0 18px', display: 'flex', alignItems: 'center', gap: 12, borderRadius: 28,
          background: ok ? rgba(DARK.success, 0.1) : rgba(DARK.primary, 0.12),
          border: `1px solid ${ok ? rgba(DARK.success, 0.3) : rgba(DARK.primary, 0.3)}`,
          fontSize: 32, fontWeight: 700, color: ok ? DARK.success : DARK.primaryHover, whiteSpace: 'nowrap',
        }}>
          <span style={{ width: 12, height: 12, borderRadius: 6, background: ok ? DARK.success : DARK.primary, opacity: ok ? 1 : 0.45 + 0.55 * pulse }} />
          {ok ? '대비 테스트 29개 통과' : '대비 테스트 실행 중…'}
        </div>
        <div style={{ position: 'absolute', left: 48, right: 48, top: 152, height: 1, background: rgba('#ffffff', 0.06) }} />
        <div style={{ position: 'absolute', left: 0, top: 166, display: 'flex' }}>
          {GAUGES.map((g, i) => <Gauge key={i} idx={i} {...g} />)}
        </div>
      </div>
      <Grain opacity={0.06} blend="soft-light" />
    </AbsoluteFill>
  );
};
