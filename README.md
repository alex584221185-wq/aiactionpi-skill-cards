# AI行动π · Skill 名片模板（B 版 · 飞书图文文档）

> 给团队内部的 Agent Skill 做「一看就懂」的飞书图文说明文档的可复用模板。
> 新增一个 Skill，只需往 `skill-cards.json` 加一条数据，跑一条命令，就产出可直接粘进飞书的可复制稿。

---

## 这是什么

团队把所有内部 Skill 放进飞书知识库，让没参与制作的人 30 秒内判断四件事：这个 Skill 能做什么、我该不该用、我要准备什么、最后拿到什么。

本仓库把这件事标准化成**模板 + 脚本**：

- **一篇 Skill 一篇结构化图文文档**，五个章节：
  1. 能做什么（一句话能力 + 适用/不适用 + 状态）
  2. 输入 → 流程 → 输出（品牌色流程图 + 表格）
  3. 真实成品示例
  4. 怎么调用（安装位置 + 完整提示词）
  5. 作者与版本
- **单一数据源**：`skill-cards.json` 改这一份，所有文档重渲生成，绝不手工改成品。
- **可复制稿 HTML**：图片 base64 内嵌，浏览器打开全选复制即可粘进飞书，不裂图。
- 已附带三篇完整样板（event-recap-video / aiactionpi-courseware / media-transcriber），替换数据即可。

## 谁用

- **团队小伙伴**：照 `字段规范.md` 填数据，跑命令，产出文档。
- **AI 助手（如 WorkBuddy）**：`SKILL.md` 已写好技能定义，说「给 XX Skill 做一篇飞书名片」即可触发（详见文末）。

---

## 目录结构

```
aiactionpi-skill-cards/
├── README.md            本说明
├── SKILL.md             给 AI 助手的技能定义
├── 字段规范.md          字段表 + 三条硬口径 + 版式规范（填数据必读）
├── 接手说明.md          重渲染命令 / 依赖 / 放进飞书步骤
├── 先看这里.md          产出说明与三篇样板口径
├── 自检清单.md          目视自检模板
├── skill-cards.json     唯一数据源（改这里）
├── brand.cjs            品牌色 / 字体 / 素材路径常量
├── render-doc.cjs       B 版渲染：md + 可复制稿 html
├── 自检截图.cjs         Playwright 生成目视截图
├── templates/doc.html   B 版文档模板
├── assets/              flow-*.svg + 示例缩略图（不含真实成片视频）
└── B版/                 渲染产物（本地生成，不进仓库）
```

> `A版/（卡片 + 画廊）` 已停用，本仓库不收录；如需回溯见原项目。

---

## 前置依赖

| 用途 | 要求 |
| --- | --- |
| Node.js | 18+（推荐 22） |
| Playwright | `npm install playwright && npx playwright install chromium`（**仅跑 `自检截图.cjs` 时需要**；渲染 md/可复制稿不依赖） |
| 浏览器 | Playwright 自带 chromium，无需本机 Chrome |
| ffmpeg（可选） | 给新 Skill 抽视频帧做缩略图；示例卡已自带，新卡需要时再装 |

---

## 快速开始

```bash
# 1. 拿到仓库
git clone <本仓库地址>
cd aiactionpi-skill-cards

# 2. 安装自检截图依赖（只跑渲染可跳过）
npm install playwright && npx playwright install chromium

# 3. 加一个 Skill：编辑 skill-cards.json，在 cards 数组追加一条
#    字段含义与必填项见 字段规范.md

# 4. 示例图放进 assets/，文件名对应 samples[].image

# 5. 渲染
node render-doc.cjs
#   → 生成 B版/<id>.md 与 B版/<id>_可复制稿.html

# 6. 自检（可选但推荐）
node 自检截图.cjs
#   → 生成 _自检/*.png，打开逐张看

# 7. 发布到飞书
#   浏览器打开 B版/<id>_可复制稿.html → Cmd+A 全选 → Cmd+C
#   在飞书知识库新建文档 → Cmd+V 粘贴 → 目视确认表格与图片
```

---

## skill-cards.json 字段速查

必填字段（完整定义见 `字段规范.md`）：

| 字段 | 必填 | 说明 |
| --- | --- | --- |
| `id` / `name` | 是 | SKILL.md 的 `name` |
| `tagline` | 是 | 一句话能力（≤30 字） |
| `fit` | 是 | 适用场景（≤40 字） |
| `limit` | 是 | 不适用 / 替代（≤40 字），用「不用于 X；要 Y 改用 Z」 |
| `inputs` | 是 | 输入 3–5 项 |
| `steps` | 是 | 流程 3–5 节点 |
| `outputs` | 是 | 输出 2–4 项 |
| `samples` | 是 | 成品示例 1–3 项（带 `image` 实物，或纯 `text` 示意） |
| `sampleStatus` | 是 | `verified` / `placeholder` / `missing` |
| `status` | 是 | `可用` / `部分验证` / `示例待补` / `未验证` |
| `invoke` | 是 | 对象：`install` / `summary` / `prompt` |
| `deps` | 是 | 环境依赖（≤40 字） |
| `category` | 是 | 类别，供筛选 |
| `author` / `version` / `source` | 否 | 缺写「未标注」/ 本地路径或 URL |

### 三条硬口径（务必遵守）

1. **示例降级**：有实物放实物截图 + 规格；没有就取 SKILL.md 输出表做示意并压「示意 · 非实际产出」角标；再缺画虚线占位框。绝不用生成图冒充成品，不写「效果图」。
2. **状态照实写**：只写实际验证到的程度，不把预期写成效、不把自动检查说成完整验收。
3. **边界写替代**：用「不用于 X；要 Y 改用 Z」；原文没写就标「原文未声明不适用边界（待补）」，不臆造。

---

## 放进飞书（可选）

两种办法：

- **手动复制粘贴**（默认）：如上「快速开始第 7 步」。
- **用 lark-cli 直接建在线文档**：参考 `接手说明.md`，用 `lark-cli docs +create --doc-format markdown` 把 `B版/<id>.md` 推成飞书文档。注意飞书 API **不支持文件夹权限申请**，需先在网页把目标文件夹共享给 CLI 账号（可编辑）。

> ⚠️ 写入飞书（建文档 / 建文件夹 / 发权限申请）是外部动作，先确认再动。没确认前只给「可复制稿」和「待补」占位。

---

## 自定义品牌色

改 `brand.cjs` 的 `BRAND` 对象（色值、日期、服务边界文案）即可换皮。非 AI行动π 团队使用本模板时，把配色和页脚服务边界换成自己的品牌规范即可。

---

## 给 AI 助手的触发方式

`SKILL.md` 已定义技能。给助手一句话即可复用，例如：

> 给 [Skill 名] 做一篇飞书名片，并附上仓库链接或本地路径。

助手会：读 SKILL.md / README → 读目标 Skill 的 README + SKILL.md + examples → 在 `skill-cards.json` 加一条 → 跑 `render-doc.cjs` → 交付可复制稿。企业盘是否由助手写入，按你的约定（默认只给稿子，不碰企业盘）。

---

## 许可

团队内部使用模板。示例卡中的真实成片缩略图与活动信息归原作者所有；本仓库不含真实成片视频文件。
