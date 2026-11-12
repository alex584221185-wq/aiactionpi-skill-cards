'use strict';
const fs = require('fs');
const path = require('path');
const B = require('./brand.cjs');

const data = B.loadData();
const all = data.cards;
const e = B.esc;

function writeSafe(p, s) {
  if (fs.existsSync(p)) {
    const dir = path.join(B.ROOT, '_备份');
    fs.mkdirSync(dir, { recursive: true });
    const bak = path.join(dir, path.basename(p) + '.bak');
    if (!fs.existsSync(bak)) fs.copyFileSync(p, bak);
  }
  fs.writeFileSync(p, s);
}
function table(rows) {
  return '<table>' + rows.map((r) => `<tr><th>${r[0]}</th><td>${r[1]}</td></tr>`).join('') + '</table>';
}
function ul(items) {
  return '<ul>' + items.map((i) => '<li>' + e(i) + '</li>').join('') + '</ul>';
}
function svgSrc(c) {
  return 'data:image/svg+xml;base64,' + Buffer.from(B.flowSvg(c)).toString('base64');
}
function badgeCls(c) {
  return c.status === '可用' || c.status === '部分验证' ? '' : 'wait';
}

function htmlBody(c) {
  let h = '';
  h += `<h1>Skill 名片｜${e(c.displayName)} <span class="badge ${badgeCls(c)}">${e(c.status)}</span></h1>`;
  h += `<p class="sub">${e(c.name)} · ${e(c.category)} · V01 · ${B.BRAND.date} · 来源 ${e(c.source)}</p>`;
  h += '<h2>一、能做什么</h2>';
  h += table([
    ['一句话能力', e(c.tagline)],
    ['适用', e(c.fit)],
    ['不适用 / 替代', e(c.limit)],
    ['当前状态', e(c.status) + ' — ' + e(c.statusNote)],
  ]);
  h += '<h2>二、输入 → 流程 → 输出</h2>';
  h += `<div class="figure flow"><img src="${svgSrc(c)}" alt="${e(c.displayName)} 的输入、流程与输出流程图"><div class="cap">品牌色流程图</div></div>`;
  h += table([
    ['输入', ul(c.inputs)],
    ['流程步骤', ul(c.steps.map((s, i) => `0${i + 1} ${s}`))],
    ['输出', ul(c.outputs)],
  ]);
  h += '<h2>三、真实成品示例</h2>';
  const imgs = c.samples.filter((s) => s.image);
  if (imgs.length) {
    h += imgs.map((s) => {
      const cap = s.video
        ? `${e(s.label)} · ${e(s.spec)}　—　成片文件：${e(s.video)}（贴进飞书后，把该 mp4 作为视频插入本节）`
        : `${e(s.label)} · ${e(s.spec)}`;
      return `<div class="figure${s.video ? ' video' : ''}"><img src="${B.imgData(s.image)}" alt="${e(s.label)}"><div class="cap">${cap}</div></div>`;
    }).join('');
  } else {
    h += `<div class="note">${e(c.samples[0].text)}（取自 SKILL.md「输出选择」表）—— 示意 · 非实际产出</div>`;
  }
  h += table(c.samples.map((s) => [e(s.label), e(s.spec) + (s.note ? '　' + e(s.note) : '')]));
  h += `<div class="note">${e(c.sampleNote)}</div>`;
  h += '<h2>四、怎么调用</h2>';
  h += table([['安装位置', e(c.invoke.install)]]);
  h += `<pre>${e(c.invoke.prompt)}</pre>`;
  h += table([['环境依赖', e(c.deps)]]);
  h += '<h2>五、作者与版本</h2>';
  h += table([
    ['版本', e(c.version)],
    ['作者', e(c.author)],
    ['来源', e(c.source)],
    ['交付链接', '待补（贴进飞书后回填）'],
    ['任务表互链', '待补（贴进飞书后回填）'],
  ]);
  h += `<footer>${e(B.BRAND.boundary)}<br>AI行动π · 内部 Skill 名片 V01 · ${B.BRAND.date} · 本轮未写入飞书</footer>`;
  return h;
}

function markdown(c) {
  let m = '';
  m += `# Skill 名片｜${c.displayName}\n\n`;
  m += `> ${c.name} · ${c.category} · 状态：${c.status} · V01 · ${B.BRAND.date}\n> 来源：${c.source}\n\n`;
  m += `## 一、能做什么\n\n| | |\n| --- | --- |\n`;
  m += `| 一句话能力 | ${c.tagline} |\n| 适用 | ${c.fit} |\n| 不适用 / 替代 | ${c.limit} |\n| 当前状态 | ${c.status} — ${c.statusNote} |\n\n`;
  m += `## 二、输入 → 流程 → 输出\n\n![输入、流程与输出](../assets/flow-${c.id}.svg)\n\n`;
  m += `| | |\n| --- | --- |\n| 输入 | ${c.inputs.join('；')} |\n| 流程步骤 | ${c.steps.map((s, i) => `0${i + 1} ${s}`).join(' → ')} |\n| 输出 | ${c.outputs.join('；')} |\n\n`;
  m += `## 三、真实成品示例\n\n`;
  for (const s of c.samples) {
    if (s.image) m += `![${s.label}](../assets/${s.image})\n\n`;
    m += `- **${s.label}**：${s.spec}${s.note ? '。' + s.note : ''}\n`;
    if (s.video) m += `  - 成片文件：\`${s.video}\`（贴进飞书后，把该文件作为视频插入本节）\n`;
  }
  if (!c.samples.some((s) => s.image)) m += `\n示意文字块：${c.samples[0].text}（取自 SKILL.md「输出选择」表）—— 示意 · 非实际产出\n`;
  m += `\n> ${c.sampleNote}\n\n`;
  m += `## 四、怎么调用\n\n安装位置：\`${c.invoke.install}\`\n\n\`\`\`text\n${c.invoke.prompt}\n\`\`\`\n\n环境依赖：${c.deps}\n\n`;
  m += `## 五、作者与版本\n\n| | |\n| --- | --- |\n| 版本 | ${c.version} |\n| 作者 | ${c.author} |\n| 来源 | ${c.source} |\n| 交付链接 | 待补（贴进飞书后回填） |\n| 任务表互链 | 待补（贴进飞书后回填） |\n\n`;
  m += `---\n\n${B.BRAND.boundary}\n\nAI行动π · 内部 Skill 名片 V01 · ${B.BRAND.date} · 本轮未写入飞书\n`;
  return m;
}

const PASTE_GUIDE = `# 飞书粘贴说明 · B 版

本说明由 render-doc.cjs 自动生成，配合 B版/*.html 使用

## 复制步骤

1. 双击打开 \`B版/<name>_可复制稿.html\`（用 Chrome 或 Edge 打开）。
2. 在页面里按 Cmd+A 全选，Cmd+C 复制。
3. 在飞书知识库新建文档，按 Cmd+V 粘贴。
4. 目视确认：表格边框、代码块、内嵌流程图与示例图是否带过来了。若图片缺失，把 \`assets/\` 里对应的图手动拖进文档（流程图在 \`assets/flow-<name>.svg\`，示例图见各文档说明）。
5. 若你的 Skill 有真实成片视频，粘贴完成后把该文件作为视频插入「真实成品示例」一节。
6. 补上文档里的「交付链接」与「任务表互链」两处「待补」。

## 目录建议

\`\`\`
AI行动π 内部资料库
└── Agent Skills/
    ├── 00_总览/                  ← 逐条列出所有 Skill，链到各详情页
    ├── 视频 / 物料/
    │   └── event-recap-video
    ├── 内容 / 交付/
    │   └── aiactionpi-courseware
    └── 内容 / 整理/
        └── media-transcriber
\`\`\`

文档命名建议：\`AI行动π_Skill名片_<name>_YYYYMMDD_V01_<作者>\`。

## 注意

- 可复制稿里的图片是 base64 内嵌的，复制时不依赖本地文件路径；但不同客户端对富文本粘贴的支持有差异，粘贴后一定要目视确认。
- \`B版/*.md\` 是纯文本源，适合放进支持 Markdown 的地方，或留作版本记录。
- 粘贴不等于发布。写入飞书知识库、调整权限、发消息都属于外部动作，需要负责人单独确认后再做。
- 内容改在 \`skill-cards.json\`，重跑 \`render-doc.cjs\` 即可，不要手工改可复制稿。
`;

const COMPARE = null; // A 版（卡片 + 画廊）已停用，对比页不再生成

fs.mkdirSync(B.B_DIR, { recursive: true });
for (const c of all) {
  writeSafe(path.join(B.B_DIR, c.id + '.md'), markdown(c));
  writeSafe(path.join(B.B_DIR, c.id + '_可复制稿.html'), B.fill(B.readTemplate('doc.html'), {
    DOC_TITLE: 'Skill 名片｜' + e(c.displayName),
    DOC_BODY: htmlBody(c),
  }));
}
writeSafe(path.join(B.B_DIR, '飞书粘贴说明.md'), PASTE_GUIDE);
console.log(JSON.stringify({ docs: all.map((c) => c.id) }, null, 2));
