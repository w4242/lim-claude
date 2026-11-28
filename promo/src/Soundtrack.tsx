// 사운드트랙 — 화면 타임라인 잠금 후 작성 (sound-design.md).
// SFX 는 중앙 표 하나로 관리하고, from 은 SHOTS/BEATS 에서 파생한다 (맨 프레임 번호 금지).
// 정렬 공식 (§4.6): Sequence.from = 목표 정점 프레임 − 음원 정점 지연 − 출력 음트랙 지연
//   음원 정점 지연 = audio-manifest.json 의 analysis.energy_peak_seconds × 30
//   출력 지연 = 이 렌더 파이프라인(Remotion 4.0.484 + AAC 48kHz mp4)에서 실측해 OUTPUT_AUDIO_OFFSET_F 에 기록.
import React from 'react';
import { Audio, Sequence, interpolate, staticFile } from 'remotion';
import { BEATS, BGM_START_S, FPS, SHOTS, TOTAL } from './timeline';

// 실측 2026-11-27: Remotion 4.0.484 + h264/AAC 48kHz mp4, 탐침 4개(스위치·저음 hit·swoosh·impact) 정규화 교차상관
//   → 2032–2062 samples (1.27–1.29f), 탐침 간 잔차 ≤0.02f. 이 네 요소가 바뀌면 다시 잴 것.
export const OUTPUT_AUDIO_OFFSET_F = 1.28;

// 마스터 게인: 두 버전(BGM 유/무)에 같은 비율 — 통합 라우드니스 −20.3 → 약 −17.8 LUFS, 피크 −1 dBFS 이하 유지
export const MASTER = 1.33;

// energy_peak_seconds (manifest analysis) → 프레임
const PEAK_S: Record<string, number> = {
  'fs-728515.mp3': 0.115, // soft impact — 렌더 실측: 실제 덩어리 정점이 energy_peak(0.025s)보다 2.7f 늦음 → 보정
  'fs-423798-gain.mp3': 0.875, // little whoosh (+20dB)
  'fs-348225-norm.mp3': 0.015, // light switch (−1 dBFS 정규화)
  'fs-449996-gain.mp3': 0.215, // whoosh short mid (+14dB)
  'fs-585257.mp3': 0.175, // swoosh
  'fs-859482.mp3': 2.285, // riser
  'fs-339437.mp3': 0.035, // low bass hit
  'fs-878614-gain.mp3': 0.135, // gem sparkle (+6dB)
};
const sfxFrom = (targetPeakF: number, src: string) =>
  Math.max(0, Math.round(targetPeakF - (PEAK_S[src] ?? 0) * FPS - OUTPUT_AUDIO_OFFSET_F));

export type SfxCue = { from: number; src: string; volume: number; durationInFrames?: number; note: string };

export const SFX: SfxCue[] = [
  // S1 오프닝: 'Claude' 압인 착지(단어 2: 8f 시작 + 9f) — 아주 약한 무게감
  { from: sfxFrom(SHOTS.open.from + 15, 'fs-728515.mp3'), src: 'fs-728515.mp3', volume: 0.3, note: 'S1 워드마크 착지' },
  // S2 크레인: 카메라 최고 속도(상승 24f + 102f×~19%) 에 whoosh 정점
  { from: sfxFrom(SHOTS.crane.from + 43, 'fs-423798-gain.mp3'), src: 'fs-423798-gain.mp3', volume: 0.7, note: 'S2 크레인 상승 운镜' },
  // S3 안내 카드: 단어 압인 시작(4f)에 짧은 swoosh (paper-title-card 카드의 字卡 swoosh-quick)
  { from: sfxFrom(SHOTS.lead.from + 8, 'fs-585257.mp3'), src: 'fs-585257.mp3', volume: 0.3, note: 'S3 안내 카드 swoosh' },
  // S4 토글 클릭 (실제 스위치 拟音, S4 拟音 우선)
  { from: sfxFrom(BEATS.sweepClick, 'fs-348225-norm.mp3'), src: 'fs-348225-norm.mp3', volume: 0.9, note: 'S4 토글 클릭' },
  // S4 스윕: 경계가 토글을 지나 가속하는 구간에 긴 whoosh 한 번 (카드: 扫场一声长 whoosh)
  { from: sfxFrom(BEATS.sweepStart + 10, 'fs-449996-gain.mp3'), src: 'fs-449996-gain.mp3', volume: 0.8, note: 'S4 라이트→다크 스윕' },
  // S5 계기판: 세 바늘이 끝까지 휙 도는 순간(점화 12–20f + 12f) — 한 번만 (연발 금지)
  { from: sfxFrom(SHOTS.gauges.from + 20, 'fs-585257.mp3'), src: 'fs-585257.mp3', volume: 0.55, note: 'S5 바늘 자체점검 스윕' },
  // S6 riser → impact → sparkle: 링 브레이크(t=0.28 ≈ 37f)에 riser 정점 + 저음 hit, 태그라인(t=0.72 ≈ 94f)에 sparkle
  { from: sfxFrom(SHOTS.outro.from + 37, 'fs-859482.mp3'), src: 'fs-859482.mp3', volume: 0.45, note: 'S6 링 수축 riser' },
  { from: sfxFrom(SHOTS.outro.from + 37, 'fs-339437.mp3'), src: 'fs-339437.mp3', volume: 0.42, note: 'S6 마크 착지 impact' },
  { from: sfxFrom(SHOTS.outro.from + 96, 'fs-878614-gain.mp3'), src: 'fs-878614-gain.mp3', volume: 0.5, note: 'S6 태그라인 sparkle' },
];

export const BGM_VOLUME = 0.3;

export const Soundtrack: React.FC<{ bgm: boolean }> = ({ bgm }) => (
  <>
    {bgm && (
      <Audio
        src={staticFile('audio/house-vibez.mp3')}
        trimBefore={Math.round(BGM_START_S * FPS)}
        volume={(f) => MASTER * BGM_VOLUME * interpolate(f, [0, 12, TOTAL - 36, TOTAL - 2], [0, 1, 1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' })}
      />
    )}
    {SFX.map((c, i) => (
      <Sequence key={i} from={c.from} durationInFrames={c.durationInFrames} name={c.note}>
        <Audio src={staticFile(`audio/sfx/${c.src}`)} volume={Math.min(1, MASTER * c.volume)} />
      </Sequence>
    ))}
  </>
);
