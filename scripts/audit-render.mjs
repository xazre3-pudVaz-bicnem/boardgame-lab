/**
 * 実際にブラウザで開いて、崩れと見づらさを機械的に確認する。
 *   node scripts/audit-render.mjs            （検査のみ）
 *   node scripts/audit-render.mjs --shot     （スクリーンショットも保存）
 *
 * 事前に `npx next start -p 4321` を別プロセスで動かしておく。
 *
 * 注意点
 *   - 色は oklch で書いているので、getComputedStyle の値をそのままパースしない。
 *     コントラストは目視に任せ、ここでは横スクロール・タップ領域・重なりだけを見る。
 *   - lazy な画像は下までスクロールしてから naturalWidth を見る。
 */
import fs from 'node:fs';
import { chromium } from 'file:///C:/Users/odaha/AppData/Roaming/npm/node_modules/playwright/index.mjs';

const BASE = process.env.BASE ?? 'http://localhost:4321';
const SHOT = process.argv.includes('--shot');
const SHOT_DIR = 'data/shots';

const PAGES = [
  '/',
  '/games',
  '/games/die-siedler-von-catan',
  '/games/for-beginners',
  '/games/genre/trick',
  '/games/list',
  '/system',
  '/access',
  '/schedule',
  '/news',
  '/news/' + encodeURIComponent('定休日のお知らせ'),
  '/contact',
  '/faq',
  '/part-timejob',
  '/scene',
  '/scene/rainy-day',
  '/area/umeda',
  '/blog',
  '/blog/2026-09-18-two-player-board-games',
  '/this-page-does-not-exist',
];

const WIDTHS = [
  { w: 390, h: 844, name: 'sp' },
  { w: 768, h: 1024, name: 'tab' },
  { w: 1440, h: 900, name: 'pc' },
];

const errors = [];
const warnings = [];

const browser = await chromium.launch();
if (SHOT) fs.mkdirSync(SHOT_DIR, { recursive: true });

for (const { w, h, name } of WIDTHS) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, locale: 'ja-JP' });
  const page = await ctx.newPage();

  for (const route of PAGES) {
    const label = `${name} ${route}`;
    const res = await page.goto(BASE + route, { waitUntil: 'load' });
    const expect404 = route === '/this-page-does-not-exist';
    if (!res) {
      errors.push(`${label}: 応答なし`);
      continue;
    }
    if (expect404 ? res.status() !== 404 : res.status() !== 200) {
      errors.push(`${label}: status ${res.status()}`);
      continue;
    }

    // アニメーションを止めてから測る
    await page.addStyleTag({
      content: '*,*::before,*::after{animation:none!important;transition:none!important}',
    });
    // 遅延読み込みを起こすため一度下まで送る
    await page.evaluate(async () => {
      await new Promise((resolve) => {
        let y = 0;
        const step = () => {
          y += window.innerHeight;
          window.scrollTo(0, y);
          if (y < document.body.scrollHeight) requestAnimationFrame(step);
          else {
            window.scrollTo(0, 0);
            resolve();
          }
        };
        step();
      });
    });
    await page.waitForTimeout(350);

    const report = await page.evaluate(() => {
      const out = { overflow: 0, smallTaps: [], brokenImgs: [], emptyLinks: 0, h1: 0 };

      out.overflow = document.documentElement.scrollWidth - document.documentElement.clientWidth;
      out.h1 = document.querySelectorAll('h1').length;

      for (const el of document.querySelectorAll('a,button,select,input,summary')) {
        const r = el.getBoundingClientRect();
        if (r.width === 0 && r.height === 0) continue;
        const cs = getComputedStyle(el);
        if (cs.display === 'none' || cs.visibility === 'hidden') continue;
        if (r.height < 30 || r.width < 24) {
          const t = (el.textContent ?? '').trim().slice(0, 18);
          out.smallTaps.push(`${el.tagName.toLowerCase()}「${t}」${Math.round(r.width)}x${Math.round(r.height)}`);
        }
      }
      for (const img of document.querySelectorAll('img')) {
        if (img.complete && img.naturalWidth === 0) out.brokenImgs.push(img.currentSrc || img.src);
      }
      for (const a of document.querySelectorAll('a')) {
        if (!(a.textContent ?? '').trim() && !a.querySelector('img,svg') && !a.getAttribute('aria-label'))
          out.emptyLinks++;
      }
      return out;
    });

    if (report.overflow > 1) errors.push(`${label}: 横スクロールが出ている（${report.overflow}px）`);
    if (report.h1 !== 1) errors.push(`${label}: h1 が ${report.h1} 個`);
    for (const s of report.brokenImgs) errors.push(`${label}: 画像が表示されていない ${s}`);
    if (report.emptyLinks) errors.push(`${label}: 中身が空のリンクが ${report.emptyLinks} 個`);
    for (const t of [...new Set(report.smallTaps)].slice(0, 3))
      warnings.push(`${label}: タップ領域が小さい ${t}`);

    if (SHOT) {
      const f = `${SHOT_DIR}/${name}${route.replace(/[^a-zA-Z0-9]/g, '_') || '_top'}.png`;
      await page.screenshot({ path: f, fullPage: route === '/' });
    }
  }
  await ctx.close();
}
await browser.close();

console.log(`検査: ${PAGES.length}ページ × ${WIDTHS.length}幅`);
if (warnings.length) {
  console.log(`\n警告 ${warnings.length}件`);
  for (const w of [...new Set(warnings)].slice(0, 25)) console.log(`  - ${w}`);
}
if (errors.length) {
  console.error(`\nエラー ${errors.length}件`);
  for (const e of [...new Set(errors)].slice(0, 40)) console.error(`  x ${e}`);
  process.exit(1);
}
console.log('\nOK: 表示の確認を通過しました。');
