# Handover — Claude Code in Production 簡報 UI 需求

> 給下一個接手的 agent。這份記錄了使用者在這次對話中定下的**所有 UI / 排版規範與已完成的工作**。
> 檔案：`talks/claude-code-production/index.html`（單一檔，內含所有 CSS + slides）+ `notes.md`（講者稿）。
> 分支：`talk-revision-discussion`（3 個 commit，**尚未 merge 回 master**，也尚未開 PR）。

---

## 0. 這是什麼

reveal.js 簡報，主題「Claude Code in Production: A Practical RD Workflow」。
- 用 `npm start`（port 8000）起 dev server，網址 `http://localhost:8000/talks/claude-code-production/`
- 投影片邏輯尺寸 1280×720，`center: true`（整頁垂直置中）
- 章節結構：Title → Agenda → Framing → 6 章（每章前有 divider 分隔頁）：
  1. Everyday hygiene　2. The naive way　3. The method　4. The case　5. The experiment　6. Pre-flight checklist

---

## 1. 內容/敘事需求（這次已完成）

| 主題 | 使用者要的 | 狀態 |
|------|-----------|------|
| Agenda → Framing 銜接 | Framing 頁加橋句「這六章背後，有一個觀念貫穿全部」 | ✅ done |
| Framing → Hygiene 落差 | 把 hygiene 定位成 thesis 的「最小第一步」（在 Ch01 divider 加過渡句） | ✅ done |
| Hygiene 開場標題 | 換掉「A tax most of us pay twice」→「You shouldn't have to repeat yourself」 | ✅ done |
| **`/btw` 語意修正** | `/btw` 是**唯讀的旁路查詢**：答案出現在可關閉的覆蓋層、永不進對話歷史、**不增加 context**。**不是**「注入事實」。（之前寫錯，已改正） | ✅ done |
| subagent 例子 | 在 hygiene「during the run」加 subagent 範例：把會污染主 context 的任務丟給 subagent，只回傳結果 | ✅ done |
| `/clear` > `/compact` | Handover 頁核心論點：context 滿了要用 `/clear` + `handoff.md`，**不要** `/compact`（模型自動壓縮你不能控制留什麼） | ✅ done |
| Hygiene 組織方式 | 按**時機**分段：during the run / end of run / context full | ✅ done |
| The Method = 三個 peer | SuperPowers / `/goal` / `/workflow` 三個平行工具，先一頁總覽再分別展開 | ✅ done |
| SuperPowers UI | 水平生命週期條 **Define → Plan → Build → Verify**，每段掛該階段 skills，brainstorming 為 ★ 入口 | ✅ done |
| brainstorming 流程頁 | 內容不變，只是「更美」（已加編號、skill-purple accent、gate 用金色漸層） | ✅ done |
| 「Plan → debug」頁 | 拿掉方向性箭頭，改成並列「Two process skills you'll reuse」（writing-plans / systematic-debugging 是不同工作，非先後） | ✅ done |
| The Case 結構 | 拆成 **Phase A（結構+程式轉換）** / **Phase B（資料搬遷）**；資料正確性由 **API A/B verifier（裁判）** 端到端證明，不做獨立 row-by-row 稽核 | ✅ done |

---

## 2. 排版/對齊規範（這次已套用，未來改動務必遵守）

使用者非常重視視覺對齊與斷行，明確要求：**截圖後在腦中拉垂直/水平格線，檢查每個元素邊緣有沒有對到同一條線；任何「各自飄、沒對齊、重疊」都要修。**

### 2.1 卡片對齊
- **並排卡片一律等高、頂邊對齊、等寬。** 不要用 `align-items: center`（會讓不等高的卡片上下錯位）——用 `align-items: stretch`。
  - `.ba`（before/after 兩欄）已從 center 改 stretch；中間的 `.vs` 箭頭用 flex 自行垂直置中。
- **左邊緣對齊**：同一區塊內上下堆疊的元素，左邊緣要對齊同一條線（不要一個置中、一個靠左各自飄）。
  - 範例：handover 頁的步驟列 `.hsteps` 與下方 `handoff.md` 程式碼區塊，包在共用固定寬度容器 `.handover-box`（`width:900px; max-width:96%; margin:auto`），兩者 `width:100%` → 左邊緣保證一致。
- **等高技巧**：grid/flex + `align-items: stretch`。若某張卡標題會換兩行（撐高它），stretch 會把其他卡一起拉高對齊（見 `.hsteps`）。

### 2.2 水平並排（不要斜向錯開/重疊）
- 嚴格水平並排用 grid `grid-template-columns: 1fr auto 1fr`（左卡 / 箭頭 / 右卡），不要用會 `flex-wrap` 的容器（會換行造成錯位）。
  - 範例：`.persist`（memory.md → CLAUDE.md）就是這樣做的。
- 多步驟橫列不換行：`grid-template-columns: 1fr auto 1fr auto 1fr` + `align-items: stretch`（見 `.hsteps`）。

### 2.3 長句斷行（使用者明確要求）
- **策略：語意斷行 + 適度縮句。** 不要讓長句子從頭連到尾、在卡片裡硬斷在不視覺友善的地方。
- 在**子句邊界**（破折號、句號、分號後）用 `<br>` 手動換行，讓每行是完整的意思單位；太長的句子順手精簡。
- 經驗門檻：卡片內單一視覺行 **>95 字**就考慮斷行。但若是在卡片內自然換一行的單一片語（~100 字、乾淨兩行），可接受。
- 加 `<br>` 時記得把該段 `line-height` 調到 ~1.65–1.7，行距才好看。

### 2.4 檢查方法（請照做）
用 Playwright（MCP `mcp__playwright__browser_*`）：
1. `browser_navigate` 到 `http://localhost:8000/talks/claude-code-production/#/<h>/<v>`
2. 用 `browser_evaluate` 跑 `Reveal.getCurrentSlide()` + `getBoundingClientRect()` 抓**實際座標**比對（left/top/height/width），不要只靠肉眼截圖。
3. 截圖 (`browser_take_screenshot`) 再用 Read 看圖二次確認。
4. reveal 投影片索引是 `(h, v)`：用 `Reveal.slide(h, v)` 跳頁；垂直子頁要用 v。本檔的 (h,v) 對照可跑：
   ```js
   document.querySelectorAll('.slides > section').forEach((h,hi)=>{
     const s=h.querySelectorAll(':scope > section');
     s.length? s.forEach((_,vi)=>console.log(hi,vi)) : console.log(hi,0);
   });
   ```
- 上次的全簡報審查腳本（量測每頁長行 + 卡片對齊）在對話記錄裡，可重用：對每頁抓 `.ba/.two-col/.tools3/.persist/.hsteps...` 子元素的 top/height spread，spread>2px(top) 或 >4px(height) 就是沒對齊。

---

## 3. 已知可接受 / 不要動的

- `.flow.vert`、`.pf`（problem→fix 直列）等**刻意垂直堆疊**的元素，audit 會報很大的 topSpread——那是正常的，不是 bug。
- 8/4、11/3 兩處 ~97–103 字的片語在卡片內自然換成漂亮的兩行，已確認可接受。
- 投影片無任何元素溢出 1280 邊界（已驗證）。

---

## 4. 尚未做、可能的下一步

- [ ] **尚未 merge 回 master，也尚未開 PR**（使用者還沒指示）。
- [ ] The experiment 的結果表格仍是 `TBD`（實驗設計好但還沒跑）——這是刻意的，等實驗跑完才填。
- [ ] 11/3 有一個 `.shot` 截圖佔位（A/B comparison report），等真實截圖。
- [ ] `notes.md` 講者稿已同步本次所有改動。

---

## 5. 設計語彙速查（CSS 都在 index.html `<head>` 的 `<style>` 內）

- 顏色 CSS 變數：`--goal`(金 #e3b341)、`--flow`(青 #4ec9c0)、`--skill`(紫 #b48ead)、`--ok`(綠)、`--warn`(紅)、`--muted`/`--faint`(灰階文字)
- 字級 class：`.small .mid .xs`；`.mono`（JetBrains Mono）
- 卡片元件：`.card`(+`.accent-goal/flow/warn/skill`)、`.two-col>.col`、`.ba`(before/after)、`.flow>.step`(+`on-goal/flow/warn/skill`)、`.tools3>.tool`、`.lifecycle>.lc-stage`、`.persist`、`.hsteps`、`.inv`、`.pf`、`.term`(終端機區塊)
- 每頁頂部小標：`.takeaway`（金色 mono eyebrow）
