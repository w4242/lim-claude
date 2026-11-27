// 타임라인 — SHOTS 가 유일한 기준. 자막·SFX·전환점은 전부 여기서 파생한다 (workbench.md §2).
//
// 박자 격자: BGM "House Vibez" (assets/audio/bgm/house-vibez.mp3)
//   librosa beat_track + 최소제곱 등간격 피팅 → 122.00 BPM, T=0.49180s(=14.754f), t0=7.9378s, 잔차 ±13.8ms.
//   곡 63.02s(박 #112)에서 브레이크다운 → 드롭 (RMS -15dB → -10/-12dB).
// 컷은 박 위에: crane 시작 = 박 0, lead = 박 11, sweep = 박 15(= 곡의 드롭), gauges = 박 25, outro = 박 34.
//   → 앞부분은 잔잔한 브레이크다운, 주인공 장면(다크 스윕)에서 드롭.
// 박자 시각은 부동소수로 두고 프레임 반올림은 마지막에만 한다 (music-beat-sync 철칙).
import { SWEEP_DURATION, CLICK, SWEEP0 } from './shots/ThemeSweep';
import { OUTRO_DURATION } from './shots/OutroLockup';

export const FPS = 30;
export const BEAT_S = 0.4917963230091378;
export const BEAT_F = BEAT_S * FPS;
const BEAT0_F = 80; // crane 시작 = 박 0 (오프닝 타이틀 80f 뒤)
export const beatF = (n: number) => BEAT0_F + n * BEAT_F;

// BGM 소스 정렬: 영상의 박 15(sweep 컷) = 곡의 박 #112 (드롭)
const SOURCE_T0 = 7.9378;
const DROP_SRC_S = SOURCE_T0 + 112 * BEAT_S;
export const BGM_START_S = DROP_SRC_S - beatF(15) / FPS; // ≈ 52.98s

const cuts = {
  open: 0,
  crane: Math.round(beatF(0)),
  lead: Math.round(beatF(11)),
  sweep: Math.round(beatF(15)),
  gauges: Math.round(beatF(25)),
  outro: Math.round(beatF(34)),
};
export const TOTAL = cuts.outro + OUTRO_DURATION;

export type ShotId = keyof typeof cuts;
export const SHOT_ORDER: ShotId[] = ['open', 'crane', 'lead', 'sweep', 'gauges', 'outro'];
export const SHOTS = Object.fromEntries(
  SHOT_ORDER.map((id, i) => {
    const next = i + 1 < SHOT_ORDER.length ? cuts[SHOT_ORDER[i + 1]] : TOTAL;
    return [id, { from: cuts[id], duration: next - cuts[id] }];
  }),
) as Record<ShotId, { from: number; duration: number }>;

// 자막 (화면 공간). 문구는 화면이 확정된 뒤 다시 씀 (C1)
export const CAPTIONS = [
  { from: SHOTS.crane.from + 40, duration: 118, text: '요약 · 작업 목록 · 새 작업 추가를 한 화면에' },
  { from: SHOTS.sweep.from + 50, duration: SHOTS.sweep.duration - 52, text: '고른 모드는 저장되고, 처음엔 OS 설정을 따릅니다' },
];

// 장면 내부 기준점 (SFX 钉帧용)
export const BEATS = {
  sweepClick: SHOTS.sweep.from + CLICK,
  sweepStart: SHOTS.sweep.from + SWEEP0,
  sweepEnd: SHOTS.sweep.from + SWEEP_DURATION,
};
