import React from 'react';
import { AbsoluteFill, Sequence } from 'remotion';
import { CAPTIONS, SHOTS } from './timeline';
import { Caption } from './Caption';
import { TitleCardUnit } from './shots/TitleCard';
import { CraneRise } from './shots/CraneRise';
import { ThemeSweep } from './shots/ThemeSweep';
import { ContrastGauges } from './shots/ContrastGauges';
import { OutroLockup } from './shots/OutroLockup';
import { Soundtrack } from './Soundtrack';
export { SFX } from './Soundtrack';

export type MainProps = { bgm: boolean };

// 타이틀 카드 문구 (작업대와 같은 데이터 원본)
export const TITLE_CARDS = {
  open: { text: 'Lim *Claude*', sub: '우리 팀 작업 대시보드', size: 150 },
  lead: { text: '클릭 한 번으로 / *다크* *모드*', sub: '', size: 112 },
};

export const Main: React.FC<MainProps> = ({ bgm }) => (
  <AbsoluteFill style={{ background: '#0f172a' }}>
    <Sequence from={SHOTS.open.from} durationInFrames={SHOTS.open.duration} name="S1 open">
      <TitleCardUnit {...TITLE_CARDS.open} duration={SHOTS.open.duration} />
    </Sequence>
    <Sequence from={SHOTS.crane.from} durationInFrames={SHOTS.crane.duration} name="S2 crane">
      <CraneRise />
    </Sequence>
    <Sequence from={SHOTS.lead.from} durationInFrames={SHOTS.lead.duration} name="S3 lead">
      <TitleCardUnit {...TITLE_CARDS.lead} duration={SHOTS.lead.duration} />
    </Sequence>
    <Sequence from={SHOTS.sweep.from} durationInFrames={SHOTS.sweep.duration} name="S4 sweep">
      <ThemeSweep />
    </Sequence>
    <Sequence from={SHOTS.gauges.from} durationInFrames={SHOTS.gauges.duration} name="S5 gauges">
      <ContrastGauges />
    </Sequence>
    <Sequence from={SHOTS.outro.from} durationInFrames={SHOTS.outro.duration} name="S6 outro">
      <OutroLockup />
    </Sequence>
    {CAPTIONS.map((c, i) => (
      <Sequence key={i} from={c.from} durationInFrames={c.duration} name={`caption ${i + 1}`}>
        <Caption text={c.text} duration={c.duration} />
      </Sequence>
    ))}
    <Soundtrack bgm={bgm} />
  </AbsoluteFill>
);
