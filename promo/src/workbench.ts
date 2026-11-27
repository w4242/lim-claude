// 동작 작업대(workbench) 연결 목록 — references/workbench.md §2–3.
// 모든 표는 timeline.ts / Main.tsx / Soundtrack.tsx 에서 import (같은 원본, 두 번째 사본 없음).
// 열린 속성: 타이틀 카드 문구·색·크기, 자막 문구. 리듬 요소(시간값·easing·카메라 경로)는 상수로 고정.
import { Main, TITLE_CARDS } from './Main';
import { CAPTIONS, SHOTS, TOTAL, BGM_START_S, FPS } from './timeline';
import { SFX, BGM_VOLUME, MASTER } from './Soundtrack';
import { TitleCardUnit, TITLE_DEFAULTS } from './shots/TitleCard';
import { CraneRise } from './shots/CraneRise';
import { ThemeSweep } from './shots/ThemeSweep';
import { ContrastGauges } from './shots/ContrastGauges';
import { OutroLockup } from './shots/OutroLockup';
import { Caption } from './Caption';

const titleSchema = [
  { type: 'textarea', key: 'text', label: '문구 (*강조*, / 줄바꿈)', default: TITLE_DEFAULTS.text },
  { type: 'text', key: 'sub', label: '부제', default: TITLE_DEFAULTS.sub },
  { type: 'number', key: 'size', label: '글자 크기', default: TITLE_DEFAULTS.size, min: 48, max: 220, step: 2, unit: 'px' },
  { type: 'color', key: 'color', label: '글자 색', default: TITLE_DEFAULTS.color },
  { type: 'color', key: 'accentColor', label: '강조 색', default: TITLE_DEFAULTS.accentColor },
];

export const WORKBENCH = {
  name: 'Lim Claude · 소개 영상',
  fps: FPS,
  width: 1920,
  height: 1080,
  total: TOTAL,
  background: '#0f172a',
  shots: [
    { id: 'open', label: 'S1 브랜드 타이틀', ...SHOTS.open, component: TitleCardUnit, props: { ...TITLE_CARDS.open }, schema: titleSchema, durationProp: 'duration', cardId: 'title-card', cardName: '타이틀 카드' },
    { id: 'crane', label: 'S2 크레인 업', ...SHOTS.crane, component: CraneRise },
    { id: 'lead', label: 'S3 다크 모드 안내 카드', ...SHOTS.lead, component: TitleCardUnit, props: { ...TITLE_CARDS.lead }, schema: titleSchema, durationProp: 'duration', cardId: 'title-card', cardName: '타이틀 카드' },
    { id: 'sweep', label: 'S4 라이트→다크 스윕', ...SHOTS.sweep, component: ThemeSweep },
    { id: 'gauges', label: 'S5 대비 자동 검사', ...SHOTS.gauges, component: ContrastGauges },
    { id: 'outro', label: 'S6 엔딩 락업', ...SHOTS.outro, component: OutroLockup },
  ],
  transitions: [],
  captions: CAPTIONS.map((c, i) => ({
    id: `cap${i + 1}`, label: `자막 ${i + 1}`, from: c.from, duration: c.duration, component: Caption,
    props: { text: c.text }, schema: [{ type: 'textarea', key: 'text', label: '자막', default: '' }], durationProp: 'duration', cardId: 'caption', cardName: '자막',
  })),
  overlays: [],
  sfx: SFX.map((s) => ({ from: s.from, duration: s.durationInFrames ?? 90, src: `audio/sfx/${s.src}`, volume: Math.min(1, MASTER * s.volume), label: s.note })),
  bgm: [{ from: 0, duration: TOTAL, src: 'audio/house-vibez.mp3', volume: MASTER * BGM_VOLUME, trimBefore: Math.round(BGM_START_S * FPS) }],
  order: ['transitions', 'captions', 'overlays'],
  original: Main,
};
