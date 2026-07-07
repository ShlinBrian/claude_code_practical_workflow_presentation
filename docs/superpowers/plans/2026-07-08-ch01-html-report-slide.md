# Ch01「HTML 報告 review」投影片 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 在 claude-code-production 簡報 Everyday Hygiene 章插入一張「叫 agent 產出一頁 HTML 報告來 review 大量產出」的投影片(5/2,含講稿),並在 Ch04 results 講稿加現場展示真報告的 callback。

**Architecture:** 單檔簡報 `talks/claude-code-production/index.html`,每個 `<section>` 是一張投影片,巢狀 `<section>` 是垂直子投影片;講稿內嵌於各投影片的 `<aside class="notes" data-slide="h/v">`。新投影片沿用 5/0 的 `.ba` before/after 版型。驗證方式是 Vite dev server + Puppeteer 截圖(無單元測試)。

**Tech Stack:** reveal.js 6、Vite(`npm start`,本計畫用 port 8043)、Puppeteer(repo devDependency)。

**Spec:** `docs/superpowers/specs/2026-07-07-ch01-html-report-slide-design.md`

## Global Constraints

- 反劇透:新內容禁用案例/實驗詞彙——`48`、`326`、`390k`、`C1`、`C2`、`golden`、`MSSQL`、`A/B`(通用示意數字如 2,400 行可以)。
- 命名規則:「Autopilot」= 願景層,絕不叫 loop;「loop」只保留給 /goal 的 build→test→fix 機制。本計畫內容不涉及兩詞,新文案也不得引入誤用。
- 投影片文字用直式撇號(`'`),不用 `&rsquo;`(會有渲染間隙)。
- 16:9 舞台固定,不加響應式 reflow;多子句長文必須拆成逐行 line block,不留自動換行段落。
- 內容改動與該張講稿同一輪同步;純版面修正不必動講稿。
- Commit message 結尾加 `Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>`。

---

### Task 1: 修正 spec 的 AGENTS.md 條目(計畫階段發現的錯誤)

**Files:**
- Modify: `docs/superpowers/specs/2026-07-07-ch01-html-report-slide-design.md`

**Interfaces:**
- Consumes: 無
- Produces: 修正後的 spec,Task 2 據此不修改 AGENTS.md

背景:spec §1 要求把 `talks/claude-code-production/AGENTS.md` 章節表 Ch01 由 `~4` 改 `~5`,但該表「Slides」欄是**橫向位置**(Ch02 = 5–8),不是張數;垂直插入不位移橫向編號,故不需改 AGENTS.md。

- [ ] **Step 1: 修改 spec §1 的 AGENTS.md 條目**

用 Edit 將:

```
- `talks/claude-code-production/AGENTS.md` 章節表 Ch01 由 `~4` 改 `~5`。
```

改為:

```
- `talks/claude-code-production/AGENTS.md` 章節表不需修改:該表「Slides」欄是橫向投影片位置(Ch02 = 5–8),垂直插入不位移橫向編號。
```

- [ ] **Step 2: 修改 spec 驗收第 4 條**

用 Edit 將:

```
4. AGENTS.md 章節表已更新。
```

改為:

```
4. `talks/claude-code-production/AGENTS.md` 未被修改(章節表為橫向位置,無需更新)。
```

- [ ] **Step 3: Commit**

```bash
git add docs/superpowers/specs/2026-07-07-ch01-html-report-slide-design.md
git commit -m "docs(talk): spec fix — AGENTS.md chapter table lists positions, needs no update

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 2: 插入新投影片 5/2 並修正 persist 的 data-slide 標籤

**Files:**
- Modify: `talks/claude-code-production/index.html`(Ch01 垂直堆疊,約 line 857 與 line 926 附近)

**Interfaces:**
- Consumes: 既有 CSS 類 `.ba`、`.before`/`.after`、`.frame-q`、`.lbl`、`.vs`、`.mid`、`.mono`、`.c-goal`、`.c-warn`、`.c-ok`、`.c-muted`(皆已存在,5/0 在用)
- Produces: 新投影片位於垂直索引 2(hash `#/5/2`),`data-slide="5/2"`;persist 投影片標籤改為 `data-slide="5/4"`

- [ ] **Step 1: 先修 persist 標籤(先改後插,避免 5/2 標籤暫時重複)**

用 Edit(old_string 帶下一行以確保唯一):

old_string:
```
						<aside class="notes" data-slide="5/2">
							再來是 session 收尾的時候，把值得留的東西存下來。
```

new_string:
```
						<aside class="notes" data-slide="5/4">
							再來是 session 收尾的時候，把值得留的東西存下來。
```

- [ ] **Step 2: 插入新投影片**

用 Edit,old_string 錨在 handover 投影片的註解(檔內唯一):

old_string:
```
					<!-- context-full handover: /clear + handoff.md beats /compact -->
```

new_string:
```
					<!-- after the run: ask for a one-page HTML report instead of a markdown wall -->
					<section>
						<h3 style="margin-bottom:0.5em;">Ask for a report, not a wall of markdown</h3>
						<div class="ba">
							<div class="before frame-q">
								<div class="lbl">The pain</div>
								<span class="mono">results.md</span> — 2,400 lines<br>
								- every line looks the same<br>
								- the failures hide in the middle<br>
								<span style="display:block;font-size:1.25em;margin-top:0.35em;line-height:1.4;">⇒ you <strong class="c-warn">scroll until you give up</strong></span>
							</div>
							<div class="vs">→</div>
							<div class="after frame-q">
								<div class="lbl">The fix</div>
								<span class="mono">report.html</span> — one page<br>
								- summary first · failures on top, in red<br>
								- tables, not prose<br>
								<span style="display:block;font-size:1.25em;margin-top:0.35em;line-height:1.4;">⇒ <strong class="c-ok">review in minutes</strong></span>
							</div>
						</div>
						<p class="mid c-muted" style="margin-top:0.7em;"><span class="mono c-goal">"turn the results into a one-page HTML report — summary first, failures on top"</span></p>
						<aside class="notes" data-slide="5/2">
							跑完一輪，它常常丟給你一份幾千行的 markdown——測試結果、改了哪些檔案、哪些沒過。
							<br>markdown 對機器很友善，對人不是：東西一多，你會捲到放棄，重點淹沒在中間。
							<br>解法一句話：「幫我整理成一頁 HTML 報告——摘要放最上面、失敗的排最前面標紅、用表格不要用長文」。
							<br>這句其實是個公式：一頁 HTML、重要的排前面、紅綠標色、用表格。名詞換掉就能用在別的地方——review 一批檔案變更、分析一堆 log，同一句型都通。
							<br>對 agent 來說是順手的事，幾乎零成本；對你來說，review 從半小時變幾分鐘。
							<br>這招先記著，後面還會再看到它派上用場。
						</aside>
					</section>

					<!-- context-full handover: /clear + handoff.md beats /compact -->
```

- [ ] **Step 3: 驗證標籤順序與反劇透**

Run:
```bash
grep -n 'data-slide="5/' talks/claude-code-production/index.html
```
Expected: 依序 `5/0`、`5/1`、`5/2`(新投影片)、`5/3`(handover)、`5/4`(persist),各恰一次。

Run:
```bash
sed -n '/after the run: ask for a one-page/,/<\/section>/p' talks/claude-code-production/index.html | grep -nE '48|326|390k|C1|C2|golden|MSSQL'
```
Expected: 無輸出(exit code 1)。

- [ ] **Step 4: Commit**

```bash
git add talks/claude-code-production/index.html
git commit -m "feat(talk): add Ch01 slide — ask for a one-page HTML report to review agent output

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 3: Ch04 results 講稿加現場展示 callback

**Files:**
- Modify: `talks/claude-code-production/index.html`(`data-slide="13/3"` 的 aside,約 line 1486)

**Interfaces:**
- Consumes: Task 2 的新投影片已存在(callback 指涉「第一章那招」)
- Produces: 13/3 講稿含 `*切視窗*` 舞台指示,指向 `exp/experiment-report-2.html`

Callback 插在第三點之後、結尾論點句(「所以方法的價值…」)**之前**,不能沖淡結尾的力道。

- [ ] **Step 1: 插入 callback 段落**

用 Edit:

old_string:
```
							所以方法的價值不在讓它「做得到」，在讓品質不靠運氣——不用靠一個月的線上流量幫你抓 bug。而品質不靠運氣，正是之後敢讓它自動駕駛的前提。
```

new_string:
```
							補一句：大家剛看到的這些數字，就是用第一章那招整理的——我請 agent 把整個實驗結果做成一頁 HTML 報告。*切視窗* 這就是那份報告，摘要在最上面、每個 arm 的結果都在同一頁。*切回投影片*
							所以方法的價值不在讓它「做得到」，在讓品質不靠運氣——不用靠一個月的線上流量幫你抓 bug。而品質不靠運氣，正是之後敢讓它自動駕駛的前提。
```

- [ ] **Step 2: 驗證**

Run:
```bash
grep -n '切視窗' talks/claude-code-production/index.html
```
Expected: 恰一筆,位於 data-slide="13/3" 的 aside 內(行號約 1490 附近)。

- [ ] **Step 3: Commit**

```bash
git add talks/claude-code-production/index.html
git commit -m "polish(talk): Ch04 results note shows the experiment's HTML report live (Ch01 callback)

Co-Authored-By: Claude Fable 5 <noreply@anthropic.com>"
```

---

### Task 4: 渲染驗證(spec 驗收 1、2)

**Files:**
- 無修改(僅驗證;若截圖發現爆版,依「Layout repair style」做最小修正後重截、amend 進 Task 2 的 commit 或另開 fix commit)

**Interfaces:**
- Consumes: Task 2、3 完成後的 index.html
- Produces: 截圖證據 `$CLAUDE_JOB_DIR/tmp/slide5-2.png`、`slide5-3.png`、`slide5-4.png`

- [ ] **Step 1: 起 dev server 並截圖三張**

```bash
(npm start -- --port 8043 >"$CLAUDE_JOB_DIR/tmp/vite.log" 2>&1 &) && sleep 4 && node -e "
const puppeteer = require('puppeteer');
(async () => {
  const b = await puppeteer.launch({headless: 'new'});
  const p = await b.newPage();
  await p.setViewport({width: 1600, height: 900});
  for (const v of ['5/2','5/3','5/4']) {
    await p.goto('http://localhost:8043/talks/claude-code-production/index.html#/' + v, {waitUntil: 'networkidle0'});
    await new Promise(r => setTimeout(r, 1200));
    await p.screenshot({path: process.env.CLAUDE_JOB_DIR + '/tmp/slide' + v.replace('/','-') + '.png'});
  }
  await b.close();
})();
"; lsof -ti :8043 | xargs kill 2>/dev/null
```

- [ ] **Step 2: 逐張人工檢視截圖**

用 Read 開三張 png,確認:
- `slide5-2.png`:新投影片,左右兩欄並排不爆版,底部 prompt 一行不折行。
- `slide5-3.png`:是 handover(handoff.md + /clear)那張——順序沒被打亂。
- `slide5-4.png`:是 persist(CLAUDE.md)那張。

Expected: 三張皆符合;若 5/2 爆版,優先縮 `.ba` 欄內字級或欄寬,不縮整張。

- [ ] **Step 3: 確認工作區乾淨、回報**

```bash
git status --short talks/ docs/
```
Expected: 無未預期的變更(user 既有的未 commit 修改除外)。
