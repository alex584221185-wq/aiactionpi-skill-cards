'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const ASSETS = path.join(ROOT, 'assets');
const TEMPLATES = path.join(ROOT, 'templates');
const A_DIR = path.join(ROOT, 'A版');
const B_DIR = path.join(ROOT, 'B版');

const BRAND = {
  bg: '#101210',
  ink: '#F1F2EC',
  accent: '#BDFE32',
  panel: '#171B17',
  line: '#3A443A',
  muted: '#98A298',
  font: "'Microsoft YaHei','PingFang SC','Hiragino Sans GB',sans-serif",
  width: 1080,
  height: 1440,
  date: '2026.11.11',
  boundary: '我们帮助你把 AI 用起来，但不出售确定性幻觉。不承诺使用 AI 一定赚钱｜不包装尚未验证的效果｜不替参与者完成全部工作｜不承诺无限一对一支持',
};

// 注：原先写死的本机 CHROME / PLAYWRIGHT 绝对路径已移除。
// 自检截图改用 Playwright 自带的 chromium（见 自检截图.cjs），
// 在仓库目录执行 `npm install playwright && npx playwright install chromium` 即可，
// 无需本地安装特定路径的 Chrome。

function esc(v) {
  return String(v == null ? '' : v)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function cut(v, n) {
  const s = String(v == null ? '' : v);
  return s.length > n ? s.slice(0, n - 1) + '…' : s;
}
function mime(file) {
  return /\.jpe?g$/i.test(file) ? 'image/jpeg' : 'image/png';
}
function imgData(name) {
  const p = path.join(ASSETS, name);
  if (!fs.existsSync(p)) throw new Error('缺少素材：' + p);
  return 'data:' + mime(name) + ';base64,' + fs.readFileSync(p).toString('base64');
}
function readTemplate(name) {
  return fs.readFileSync(path.join(TEMPLATES, name), 'utf8');
}
function fill(tpl, map) {
  return tpl.replace(/\{\{([A-Z_0-9]+)\}\}/g, (m, k) => (map[k] !== undefined ? String(map[k]) : m));
}
function loadData() {
  return JSON.parse(fs.readFileSync(path.join(ROOT, 'skill-cards.json'), 'utf8'));
}

function flowSvg(c) {
  const W = 936, H = 270;
  const vwidth = (s) => {
    let w = 0;
    for (const ch of String(s)) w += /[\x00-\xff]/.test(ch) ? 0.55 : 1;
    return w;
  };
  const fitText = (x, y, text, avail, fill) => {
    const t = cut(text, 12);
    const size = Math.max(19, Math.min(25, Math.floor(avail / vwidth(t))));
    return `<text x="${x}" y="${y}" font-size="${size}" fill="${fill}">${esc(t)}</text>`;
  };
  const marker = 'arw-' + c.id;
  const cols = [
    { x: 0, title: '输入', items: c.inputs },
    { x: 328, title: '流程', items: c.steps, numbered: true },
    { x: 656, title: '输出', items: c.outputs },
  ];
  let s = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" font-family="${BRAND.font}">`;
  s += `<title>${esc(c.displayName)}：输入、流程与输出</title>`;
  s += '<desc>左列是要准备的输入，中列是制作流程步骤，右列是最终交付物。</desc>';
  s += `<defs><marker id="${marker}" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M2 1L8 5L2 9" fill="none" stroke="${BRAND.accent}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></marker></defs>`;
  for (const col of cols) {
    s += `<rect x="${col.x}" y="0" width="280" height="${H}" rx="16" fill="${BRAND.panel}" stroke="${BRAND.line}" stroke-width="1"/>`;
    s += `<text x="${col.x + 22}" y="42" font-size="28" font-weight="600" fill="${BRAND.accent}">${col.title}</text>`;
    s += `<rect x="${col.x + 22}" y="56" width="46" height="5" rx="2.5" fill="${BRAND.accent}"/>`;
    col.items.slice(0, 5).forEach((it, i) => {
      const y = 92 + i * 36;
      if (col.numbered) {
        s += `<text x="${col.x + 22}" y="${y}" font-size="24" font-weight="600" fill="${BRAND.accent}">0${i + 1}</text>`;
        s += fitText(col.x + 72, y, it, 194, BRAND.ink);
      } else {
        s += `<circle cx="${col.x + 30}" cy="${y - 8}" r="4.5" fill="${BRAND.accent}"/>`;
        s += fitText(col.x + 48, y, it, 218, BRAND.ink);
      }
    });
  }
  s += `<path d="M286 135 H320" fill="none" stroke="${BRAND.accent}" stroke-width="2.6" marker-end="url(#${marker})"/>`;
  s += `<path d="M614 135 H648" fill="none" stroke="${BRAND.accent}" stroke-width="2.6" marker-end="url(#${marker})"/>`;
  s += '</svg>';
  return s;
}

function sampleTiles(c) {
  const isPlaceholder = c.sampleStatus === 'placeholder';
  return c.samples.map((s) => {
    let thumb;
    if (s.image) {
      thumb = `<div class="thumb"><img src="${imgData(s.image)}" alt="${esc(s.label)}"></div>`;
    } else {
      const cls = isPlaceholder ? 'thumb thumb-empty' : 'thumb thumb-text';
      thumb = `<div class="${cls}"><span>${esc(s.text || s.spec)}</span>${isPlaceholder ? '<em>示意 · 非实际产出</em>' : ''}</div>`;
    }
    return `<div class="tile">${thumb}<div class="tile-label">${esc(s.label)}</div><div class="tile-spec">${esc(cut(s.spec, 28))}</div></div>`;
  }).join('');
}

function statusBadge(c) {
  const cls = c.status === '可用' || c.status === '部分验证' ? 'ok' : 'wait';
  return `<span class="badge ${cls}">${esc(c.status)}</span>`;
}

function cardHtml(c) {
  return fill(readTemplate('card.html'), {
    LOGO_DATA: imgData('logo.png'),
    FLOW_DATA: imgData('flow-bg.png'),
    NO: c.no,
    CATEGORY: esc(c.category),
    NAME: esc(c.name),
    DISPLAY_NAME: esc(c.displayName),
    TAGLINE: esc(c.tagline),
    FIT: esc(c.fit),
    LIMIT: esc(c.limit),
    FLOW_SVG: flowSvg(c),
    STATUS_BADGE: statusBadge(c),
    SAMPLE_TILES: sampleTiles(c),
    SAMPLE_NOTE: esc(c.sampleNote),
    INVOKE_SUMMARY: esc(c.invoke.summary),
    DEPS: esc(c.deps),
    META: esc(`V01 名片 · ${c.version} · 作者 ${c.author} · 来源 ${c.source}`),
    DATE: BRAND.date,
  });
}

module.exports = {
  ROOT, ASSETS, TEMPLATES, A_DIR, B_DIR, BRAND,
  esc, cut, imgData, readTemplate, fill, loadData, flowSvg, sampleTiles, statusBadge, cardHtml,
};
