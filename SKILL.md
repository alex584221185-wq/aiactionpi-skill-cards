---
name: aiactionpi-skill-cards
description: 为 AI行动π 团队内部的 Agent Skill 做「一看就懂」的飞书图文说明文档（B 版 Skill 名片）。当要把团队 Skill 整理进飞书知识库、新增或重渲 Skill 名片文档时使用。
version: 1.1.0
display_name: "AI行动π Skill 名片"
agent_created: true
---

# AI行动π Skill 名片（B 版 · 飞书图文文档）

不要从空白画。已经有一整套可跑的参考实现，复制目录改数据即可。

## 参考实现

`/Users/584221185qq.com/Documents/AI社群/outputs/AI行动π_Skill名片_两版打样_20261111_V01_思无邪/`

- `字段规范.md`：字段表、三条硬口径、版式规范
- `接手说明.md`：重渲染命令、依赖路径、放进飞书的步骤
- `skill-cards.json`：唯一数据源
- `templates/doc.html`、`brand.cjs`、`render-doc.cjs`、`自检截图.cjs`：模板与渲染器
- `先看这里.md`、`自检清单.md`：交付入口与验收记录
- `A版/`、`render.cjs`、`对比页.html`：**已停用存档**（2026-11-11 决定采用 B 版），不要引用、不要重渲

## 何时用

- 团队新做了一个 Skill，要放到飞书共享知识库让别人看懂
- 要重渲、改名、补状态、补真实成片、加一篇新名片

不适用：写 Skill 本身的实现逻辑（那是各 Skill 的 SKILL.md）；做对外宣传海报。

## 采用形态：B 版

每个 Skill 一篇结构化文档，五章节：① 能做什么（一句话能力＋适用/不适用＋状态）② 输入→流程→输出（品牌色流程图＋表格）③ 真实成品示例 ④ 怎么调用（安装位置＋完整提示词）⑤ 作者与版本。交付 `*.md` 与「可复制稿 HTML」（图片 base64 内嵌，浏览器打开全选复制粘贴进飞书）。

曾经的 A 版（1080×1440 卡片＋画廊）已停用；同一段数据随时可以重渲回来，决策记录在 `两版对比说明.md`。

## 硬规则

1. 只改 `skill-cards.json`，全部文档由 `render-doc.cjs` 重渲。禁止手改成品文件。
2. 品牌：`#101210` 底、`#F1F2EC` 字、`#BDFE32` 重点；Logo 只用品牌工具包的 E 版原图；品牌名写 π。
3. 五章节四类信息不能少：一句话能力＋适用／不适用、输入→流程→输出图示、真实成品示例、调用方式／依赖／作者版本。
4. **示例降级**：有实物放实物并写规格；没有就取 SKILL.md 的输出表或模板片段做示意，压「示意 · 非实际产出」角标并写明出处；再缺就画虚线占位框。绝不用生成图冒充成品，不写「效果图」。
5. **状态照实写**：`可用`／`部分验证`／`示例待补`／`未验证`。不把预期写成效果，不把自动检查说成完整验收；原仓库标了「人工听审未完成」就照抄。
6. **边界写替代**：「不用于 X；要 Y 改用 Z」。原文给了替代 Skill 就写出来；原文没写就标「待补」，不臆造。
7. 服务边界原文放每篇 B 版文档页脚。
8. **视频类示例**：成片文件拷进 `assets/`（微信沙盒路径不保险）；用 ffmpeg 抽 3–4 帧实际看图挑缩略图（不能凭文件名猜）；json 里 sample 加 `"video"` 字段指向成片，渲染时绿框标注并在图注写明「贴进飞书后把 mp4 作为视频插入本节」。

## 技术

node 用 `/Users/584221185qq.com/.workbuddy/binaries/node/versions/22.22.2/bin/node`；playwright 在 `/Users/584221185qq.com/.workbuddy/binaries/node/workspace/node_modules/playwright`；浏览器 `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`；抽帧用系统 ffmpeg。零安装。

截图 `deviceScaleFactor: 2`，等 `document.fonts.ready` 和图片 `decode()` 完再截。字体栈 `Microsoft YaHei, PingFang SC, Hiragino Sans GB`。可复制稿的图片必须 base64 内嵌，保证单独打开不裂。

```bash
cd "<参考实现目录>" && "<node>" render-doc.cjs && "<node>" 自检截图.cjs
```

## 验收

重渲后**逐张打开可复制稿目视**（含局部放大截图：示例区、作者区）并填 `自检清单.md`。脚本能查渲染错误，查不出文字观感、示例图会不会被误读成真实业务成果、粘贴进飞书后长什么样。「0 error」不等于没问题，要写明没验证到的部分。

## 直接建飞书文档（2026-11-11 实测可跑）

用户确认后可跳过「可复制稿」，直接建飞书在线文档：

1. SVG 流程图先转 PNG（飞书导入不收 SVG）：playwright 打开 svg 文件、`locator("svg").screenshot()`，`deviceScaleFactor: 2`。
2. 组装导入 md：图片 `![alt](@./assets/x.png)`、视频附件 `<source path="@./assets/x.mp4"/>`（mp4 上去就是可预览播放的视频块）。**路径必须在 cwd 内**，cwd 放参考实现根目录，用完删临时 md。
3. `lark-cli drive +create-folder --name "Skill" --as user` 建 Skill 子目录 → `lark-cli docs +create --doc-format markdown --title "<标题>" --content "@./_feishu_import.md" --parent-token <folder_token> --as user`。
4. 回查：`docs +fetch --doc-format markdown` 确认图片、表格、视频附件都在。
5. 改表格单元格文本：`str_replace` 匹配不到 cell，用 `fetch --scope keyword --keyword "待补" --detail with-ids` 拿 cell 内段落的 block id，再 `block_replace --content '<p>...</p>'`（默认 xml）。

**权限坑**：团队云盘文件夹若 CLI 用户（当前是「佳文」，openId ou_640037c481b066a708bfe0a038c8f297）不是协作者，读/建子目录都会报 1061004；`+apply-permission` 不支持 folder 类型，原生 apply 接口对 folder 也报 1063001——申请卡发不出去，只能让 owner 在网页里把文件夹共享给该账号（可编辑），共享后 `drive +move` 或重推即可。

## 边界

写入飞书（建文档/建文件夹/发权限申请）都是外部动作，先确认再动。没确认前只给「可复制稿」和「待补」占位。

9. **用户已手动放入企业盘时（重要，2026-11-12 踩坑）**：若用户明确说过「我已经手动加进去了 / 我自己放了」，则**只做内容核对**（只读 `docs +fetch` 验证用户那份的图片/视频/表格是否齐全），**绝不重复建文档、绝不复制、绝不另建子目录**。需要补内容时，用 `docs +update` 往用户那一份上改，不新建。企业盘里已有同名文档就认定以它为准。
