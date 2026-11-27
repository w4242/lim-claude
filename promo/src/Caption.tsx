// 서술 자막 — 화면 하단 중앙, 다크 스크림 알약 + 56px 글자 (Q11: 자막 유효 글자 높이 ≥56px).
// 8f 동안 페이드+8px 상승으로 들어오고 마지막 8f 에 사라진다 (template Caption 의 시간값 유지).
import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';
import { FONT_KR } from './theme';

export const Caption: React.FC<{ text: string; duration: number; bottom?: number }> = ({ text, duration, bottom = 44 }) => {
  const frame = useCurrentFrame();
  const c = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
  const inT = interpolate(frame, [0, 8], [0, 1], c);
  const outT = interpolate(frame, [duration - 8, duration], [1, 0], c);
  return (
    <div style={{ position: 'absolute', left: 0, right: 0, bottom, display: 'flex', justifyContent: 'center', pointerEvents: 'none', opacity: inT * outT, transform: `translateY(${(1 - inT) * 8}px)` }}>
      <div style={{
        padding: '14px 34px 16px', borderRadius: 999, background: 'rgba(15,23,42,0.82)', border: '1px solid rgba(148,163,184,0.25)',
        boxShadow: '0 10px 30px -8px rgba(2,6,23,0.5)', fontFamily: FONT_KR, fontSize: 56, fontWeight: 700, lineHeight: 1.15,
        color: '#f1f5f9', letterSpacing: '-0.02em', whiteSpace: 'nowrap',
      }}>{text}</div>
    </div>
  );
};
