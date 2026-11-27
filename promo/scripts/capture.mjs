// capture.mjs — lim-claude 실제 화면 캡처 (video-shotcraft capture-template.mjs를 Playwright로 옮김)
//
// 산출물 (public/textures/):
//   light.png / dark.png        — 같은 레이아웃의 라이트·다크 전체 페이지 (DSF 3)
//   toggle-track.png / toggle-thumb.png — 라이트 테마 실제 토글의 트랙 층·손잡이 층(투명 배경), DSF 8
//   hi-sweep-{light,dark}.png / hi-crane-light.png — 특写 구간용 고해상도 패치 (DSF 8 / 6)
//   layout.json                 — 각 요소 bbox (페이지 CSS px 좌표)
//
// 데이터 정책: 화면의 담당자 이름 중 실명(임희섭)은 가상 이름으로 바꾼 뒤 캡처한다.
//   나머지(김민지/박준호, 숫자)는 앱에 하드코딩된 가상 데모 데이터.
//
// 실행: 앱 dev 서버를 먼저 띄운다 (cd .. && npx vite --port 5173), 그 다음 `npm run capture`.
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const BASE = process.env.BASE ?? 'http://localhost:5173';
const OUT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../public/textures');
const VIEW = { width: 1280, height: 720 };
const NAME_SWAP = { '임희섭': '이도윤' };

fs.mkdirSync(OUT, { recursive: true });

const browser = await chromium.launch();

async function open(theme, dsf) {
  const ctx = await browser.newContext({ viewport: VIEW, deviceScaleFactor: dsf, colorScheme: theme });
  await ctx.addInitScript((t) => localStorage.setItem('theme', t), theme);
  const page = await ctx.newPage();
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.evaluate((swap) => {
    const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    for (let n = walk.nextNode(); n; n = walk.nextNode()) {
      for (const [a, b] of Object.entries(swap)) n.nodeValue = n.nodeValue.replaceAll(a, b);
    }
    // 캡처 중 전환 애니메이션/포커스 링이 찍히지 않게
    const s = document.createElement('style');
    s.textContent = '*{transition:none!important} :focus-visible{outline:none!important}';
    document.head.appendChild(s);
  }, NAME_SWAP);
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(600);
  return { ctx, page };
}

const bbox = (page, sel, all = false) =>
  page.evaluate(
    ([sel, all]) => {
      const r = (el) => {
        const b = el.getBoundingClientRect();
        return { x: b.x + scrollX, y: b.y + scrollY, w: b.width, h: b.height };
      };
      const els = [...document.querySelectorAll(sel)];
      return all ? els.map(r) : els[0] ? r(els[0]) : null;
    },
    [sel, all],
  );

const layout = {};

// ── 라이트 / 다크 전체 페이지 (같은 레이아웃) ──
for (const theme of ['light', 'dark']) {
  const { ctx, page } = await open(theme, 3);
  await page.screenshot({ path: `${OUT}/${theme}.png`, fullPage: true });
  if (theme === 'light') {
    layout.pageW = VIEW.width;
    layout.pageH = await page.evaluate(() => document.documentElement.scrollHeight);
    layout.header = await bbox(page, '.header');
    layout.brand = await bbox(page, '.header__brand');
    layout.toggle = await bbox(page, '.theme-toggle__track');
    layout.intro = await bbox(page, '.intro');
    layout.stats = await bbox(page, '.stats .card', true);
    layout.taskCard = await bbox(page, 'main > section.card');
    layout.rows = await bbox(page, 'tbody tr', true);
    layout.statusCells = await bbox(page, 'tbody td:last-child', true);
    layout.formCard = await bbox(page, 'main > section.card:last-of-type');
    layout.primaryBtn = await bbox(page, '.button--primary');
  }
  await ctx.close();
}

// ── 실제 토글: 라이트 테마에서 손잡이 위치만 바꿔 연속 캡처 (DSF 4) ──
{
  const { ctx, page } = await open('light', 4);
  const t = layout.toggle;
  const pad = 6; // 손잡이 그림자 여유
  const clip = { x: t.x - pad, y: t.y - pad, width: t.w + pad * 2, height: t.h + pad * 2 };
  layout.toggleClip = { x: clip.x, y: clip.y, w: clip.width, h: clip.height };
  // 층 1: 트랙(손잡이만 숨김) — 해·달 아이콘이 둘 다 보이는 실제 트랙
  await page.evaluate(() => (document.querySelector('.theme-toggle__thumb').style.visibility = 'hidden'));
  await page.screenshot({ path: `${OUT}/toggle-track.png`, clip });
  // 층 2: 손잡이만 투명 배경으로 (그림자 포함) — 영상에서 연속 이동시킨다
  const th = await bbox(page, '.theme-toggle__thumb');
  layout.thumb = th;
  await page.evaluate(() => {
    document.querySelector('.theme-toggle__thumb').style.visibility = 'visible';
    const s = document.createElement('style');
    s.textContent = `html,body,.header{background:transparent!important}
      .theme-toggle__track{background:transparent!important;border-color:transparent!important}
      .theme-toggle__icon,.header__brand,.header__nav,main{visibility:hidden!important}
      .header{border-color:transparent!important}`;
    document.head.appendChild(s);
  });
  const tp = 5;
  layout.thumbClip = { x: th.x - tp, y: th.y - tp, w: th.w + tp * 2, h: th.h + tp * 2 };
  await page.screenshot({
    path: `${OUT}/toggle-thumb.png`,
    clip: { x: th.x - tp, y: th.y - tp, width: th.w + tp * 2, height: th.h + tp * 2 },
    omitBackground: true,
  });
  await ctx.close();
}

// ── 특写용 고해상도 패치 (Q2: 텍스처 ≥ 화면 2배) ──
//   S4 토글 특写(3.6×): 오른쪽 위 영역, 라이트·다크 둘 다 DSF 8 → 8/3.6 = 2.2×
//   S2 행 특写(2.6×): 작업 목록 영역, 라이트 DSF 6 → 6/2.6 = 2.3×
//   토글 층도 DSF 8 로 다시 캡처
const HI = {
  sweep: { x: 600, y: 0, w: 584, h: 300, dsf: 8 },
  crane: { x: 140, y: 250, w: 820, h: 460, dsf: 6 },
};
layout.hi = HI;
for (const theme of ['light', 'dark']) {
  const { ctx, page } = await open(theme, HI.sweep.dsf);
  const r = HI.sweep;
  await page.screenshot({ path: `${OUT}/hi-sweep-${theme}.png`, clip: { x: r.x, y: r.y, width: r.w, height: r.h } });
  if (theme === 'light') {
    const t = layout.toggle, pad = 6;
    await page.evaluate(() => (document.querySelector('.theme-toggle__thumb').style.visibility = 'hidden'));
    await page.screenshot({ path: `${OUT}/toggle-track.png`, clip: { x: t.x - pad, y: t.y - pad, width: t.w + pad * 2, height: t.h + pad * 2 } });
    const th = layout.thumb, tp = 5;
    await page.evaluate(() => {
      document.querySelector('.theme-toggle__thumb').style.visibility = 'visible';
      const s = document.createElement('style');
      s.textContent = `html,body,.header{background:transparent!important}
        .theme-toggle__track{background:transparent!important;border-color:transparent!important}
        .theme-toggle__icon,.header__brand,.header__nav,main{visibility:hidden!important}
        .header{border-color:transparent!important}`;
      document.head.appendChild(s);
    });
    await page.screenshot({ path: `${OUT}/toggle-thumb.png`, clip: { x: th.x - tp, y: th.y - tp, width: th.w + tp * 2, height: th.h + tp * 2 }, omitBackground: true });
  }
  await ctx.close();
}
{
  const { ctx, page } = await open('light', HI.crane.dsf);
  const r = HI.crane;
  await page.screenshot({ path: `${OUT}/hi-crane-light.png`, clip: { x: r.x, y: r.y, width: r.w, height: r.h } });
  await ctx.close();
}

fs.writeFileSync(path.resolve(OUT, '../../src/layout.json'), JSON.stringify(layout, null, 2));
await browser.close();
console.log('captured', Object.keys(layout).join(', '), 'pageH=', layout.pageH);
