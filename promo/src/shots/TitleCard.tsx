// 타이틀 카드 — paper-title-card (demos/typography/paper-title-card/PaperTitleCard.tsx) 적응판.
// 유지한 조율값: 단어 간격 4f · 단어당 9f 압인(scale 1.28→1, blur 7→0, bezier(.2,.75,.3,1))
//               · 밑줄 16–34f scaleX bezier(.3,0,.2,1) · 부제 10–22f · 마지막 8f 페이드아웃(글자층만).
// 다시 입힌 것: 종이색·세리프 → 앱 라이트 배경(#f8fafc)·Noto Sans KR 700, 강조색 → 앱 primary 인디고.
//   한글 이탤릭은 획이 깨져 보여 강조 단어는 색만 바꾼다. 부제는 DigitRoll 대신 일반 글자.
import React from 'react';
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from 'remotion';
import { FONT_KR, LIGHT } from '../theme';

export type TitleWord = { text: string; accent?: boolean; br?: boolean };

export type TitleCardProps = {
  words: TitleWord[];
  sub?: string;
  duration: number;
  size?: number;
  color?: string;
  accentColor?: string;
};

export const TitleCard: React.FC<TitleCardProps> = ({ words, sub, duration, size = 112, color = LIGHT.text, accentColor = LIGHT.primary }) => {
  const frame = useCurrentFrame();
  const clamp = { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' } as const;
  const fadeOut = interpolate(frame, [duration - 8, duration], [1, 0], clamp);
  const underline = interpolate(frame, [16, 34], [0, 1], { ...clamp, easing: Easing.bezier(0.3, 0, 0.2, 1) });
  const subT = interpolate(frame, [10, 22], [0, 1], clamp);

  return (
    <AbsoluteFill
      style={{
        backgroundColor: LIGHT.bg,
        backgroundImage: `radial-gradient(1100px 750px at 50% 42%, rgba(255,255,255,0.95), transparent 65%)`,
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      {/* 배경은 다음 장면(라이트 화면)과 같은 색이라 불투명하게 두고, 글자만 페이드아웃 */}
      <div style={{ textAlign: 'center', maxWidth: 1600, opacity: fadeOut }}>
        <div
          style={{
            fontFamily: FONT_KR,
            fontSize: size,
            fontWeight: 700,
            lineHeight: 1.2,
            color,
            letterSpacing: '-0.025em',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'center',
            columnGap: '0.28em',
          }}
        >
          {words.map((w, i) => {
            const delay = 4 + i * 4;
            const t = interpolate(frame, [delay, delay + 9], [0, 1], { ...clamp, easing: Easing.bezier(0.2, 0.75, 0.3, 1) });
            return (
              <React.Fragment key={i}>
                <span
                  style={{
                    opacity: t,
                    transform: `scale(${1.28 - 0.28 * t})`,
                    filter: `blur(${(1 - t) * 7}px)`,
                    display: 'inline-block',
                    color: w.accent ? accentColor : undefined,
                  }}
                >
                  {w.text}
                </span>
                {w.br && <span style={{ flexBasis: '100%', height: 0 }} />}
              </React.Fragment>
            );
          })}
        </div>
        <div style={{ height: 6, width: 220, margin: '40px auto 0', borderRadius: 3, background: accentColor, transform: `scaleX(${underline})` }} />
        {sub && (
          <div style={{ fontFamily: FONT_KR, fontSize: 40, fontWeight: 400, color: LIGHT.textMuted, marginTop: 34, opacity: subT, letterSpacing: '-0.01em' }}>
            {sub}
          </div>
        )}
      </div>
    </AbsoluteFill>
  );
};

// 작업대(workbench)용 단위: 문구를 한 줄 문자열로 받는다.
//   *단어* = 강조색, ' / ' = 줄바꿈.  예: '클릭 한 번으로 / *다크* *모드*'
export const parseWords = (text: string): TitleWord[] => {
  const out: TitleWord[] = [];
  for (const tok of text.split(/\s+/).filter(Boolean)) {
    if (tok === '/') {
      if (out.length) out[out.length - 1].br = true;
      continue;
    }
    const m = tok.match(/^\*(.+)\*$/);
    out.push(m ? { text: m[1], accent: true } : { text: tok });
  }
  return out;
};

export const TITLE_DEFAULTS = { text: '', sub: '', size: 112, color: LIGHT.text, accentColor: LIGHT.primary, duration: 55 };
export const TitleCardUnit: React.FC<Partial<typeof TITLE_DEFAULTS>> = (p) => {
  const q = { ...TITLE_DEFAULTS, ...p };
  return <TitleCard words={parseWords(q.text)} sub={q.sub || undefined} duration={q.duration} size={q.size} color={q.color} accentColor={q.accentColor} />;
};
