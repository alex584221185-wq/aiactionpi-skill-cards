'use strict';
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const B = require('./brand.cjs');

const OUT = path.join(B.ROOT, '_自检');
fs.mkdirSync(OUT, { recursive: true });

const shots = [
  { name: 'B版_活动回顾视频.png', file: path.join(B.B_DIR, 'event-recap-video_可复制稿.html'), w: 900, h: 1300 },
  { name: 'B版_音视频转录.png', file: path.join(B.B_DIR, 'media-transcriber_可复制稿.html'), w: 900, h: 1300 },
  { name: 'B版_全页.png', file: path.join(B.B_DIR, 'event-recap-video_可复制稿.html'), w: 900, h: 900, full: true },
];

// 用 Playwright 自带的 chromium，无需指定本机 Chrome 路径。
// 运行前请先：`npm install playwright && npx playwright install chromium`
(async () => {
  const browser = await chromium.launch({ headless: true });
  for (const s of shots) {
    const ctx = await browser.newContext({ viewport: { width: s.w, height: s.h }, deviceScaleFactor: 1 });
    const p = await ctx.newPage();
    await p.goto('file://' + s.file, { waitUntil: 'load' });
    await p.evaluate(() => document.fonts.ready);
    await p.locator('img').evaluateAll((imgs) => Promise.all(imgs.map((i) => i.decode().catch(() => {}))));
    await p.screenshot({ path: path.join(OUT, s.name), fullPage: !!s.full });
    await ctx.close();
  }
  await browser.close();
  console.log('自检截图已生成：' + shots.map((s) => s.name).join('、'));
})().catch((e) => { console.error(e); process.exit(1); });
