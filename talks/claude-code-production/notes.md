# Claude Code in Production: A Practical RD Workflow

## Speaker Notes

### 開場

Agent 只會越來越強。這場分享講的是：我們怎麼調整工作方式來跟上。

**終局 Pipeline：** PM request → AI agent (`/goal` · `/workflow`) → PR（完成 + 自帶證據） → Human review（看證據，不是 diff）。後面三幕都是在回答：怎麼穩定地往這條 pipeline 收斂。

---

### 01 前提與終局

**這場分享只有一個假設：** Agent 會持續變強，甚至能自己做 harness。我們不把它當今天的工具快照，而是一條還在往上走的成長曲線。

**大多數人還在用錯的模式：**
- 實習生模式 — 拚命加 example、reasoning，但任務本身沒定義清楚
- 資深夥伴模式 — 給方向、講清楚要什麼，它自己判斷、甚至反過來挑戰你

**由此推出一條原則：** 為成長曲線優化，不是為今天的快照優化。
- 通用投資（讓 code 好懂、驗收自動）= 會複利
- 綁死某代 agent 怪癖的 hack = 不算

---

### 02 方法論：機器側 × 人側

**整套方法論的全貌 — 兩側都要到位：**

| 機器側 · 給對工具 | 人側 · 把任務定義清楚 |
|---|---|
| `/goal` — loop until goal | 完成定義（DoD）— 做完要能被自動檢查 |
| `/workflow` — multi-agent 扇出 | 邊界 — 哪些不要碰 |
| hybrid（最實際）— 主控 loop + workflow 扇出 | 階段判斷 — 想 / 比 / 決 / 做 |

**整場最重要的一頁 — 沒有完成定義，loop until goal 沒有意義：**
- 能不能用 `/goal` 或 `/workflow`，第一個要問的不是工具，而是「你能不能把驗收自動化？」
- 沒有可驗收的 DoD，agent 只會繞圈或自我感覺良好地停下

**以終為始：**
- 預設直接把 `/goal` 或 `/workflow` 丟向問題，不要一開始就手把手
- 結果不好時，問「為什麼 agent 自己到不了？」

**四個常見根因（分屬兩側）：**
1. [code] 看不懂我們寫的程式
2. [code] 缺 domain knowledge
3. [code] 無法 mapping 需求到應該修改的邏輯
4. [brief] prompt 沒講到重點 / 沒有完成定義

**兩軌處方：**
- Code 側（會複利）：加註解 → 加 mapping index → 重構段落
- Brief 側（你不可外包）：寫成可測的 goal → 補背景與邊界 → 整理成可交辦的 brief

**兩軌的關係 = 整份報告的閉環：**
- Code 側把 codebase 改造得更 agent-legible，會隨 agent 變強而複利
- Brief 側不會被 agent 自動補上，是人永遠要扛的部分

**AI 是一面鏡子：**
- 它會挑戰你的內容，但不會質疑你的意圖
- 你餵它模糊，它就把沒想清楚的指令原封反射回來
- 它能幫你問，沒辦法替你想

**Superpowers：流程 → Skill（Jesse Vincent 2025/10）：**
- 問題不在 Claude 的能力，在缺專業開發流程
- 把 brainstorm → plan → TDD → review 編碼成 skills
- 判斷軸 = 做錯重來貴不貴，不是人資不資深
  - 簡單任務（typo、小函式）→ goal 直接做，跳過流程
  - 中大型（多檔、越改越歪）→ 流程紀律才拉開差距

**兩道圍欄：**
1. 餵模糊進去，會產出結構漂亮的錯任務 — 比明顯的爛 prompt 更難抓
2. DoD 品質仍靠 domain knowledge — skill 幫你把 DoD 寫下來，不能替你判斷 DoD 對不對
- 正面：思考外包不了，但流程可以編碼、教會整個團隊

---

### 03 證據與實踐

**案例：MSSQL → PostgreSQL Migration**
- 壓力測試：在系統底層換掉引擎，但每一個對外行為都得一模一樣

**為什麼這是硬骨頭（三件事疊加）：**
1. SQL 方言散落整個 stack — `SELECT TOP` · `[dbo].` · `(NOLOCK)` · `ISNULL`
2. 結構性差異 — 49 proc / 4 view，SCT 只有 GUI 沒自動化
3. 型別 + 大小寫靜默出錯 — 一個沒對齊就不報錯但答案錯
- 最難的不是「跑不跑得起來」，而是「答案對不對」

**完成定義（Oracle）：** 逐 endpoint、逐 row，跟 golden MSSQL 做 A/B 比對。這就是讓 loop until goal 有意義的那個 oracle。

**硬證據：**
- 47/47 endpoints HTTP 200
- 44/47 A/B body 相同（+3 資料狀態差 → 47/47 忠實）
- 18/18 表 row 對齊（376,653 rows）
- 架構 = hybrid（Opus 主控 + workflow 52-agent）

**真正的架構 = Hybrid：**
- Opus 主控 — worktree、Docker、.bak 還原、build/deploy 迴圈
- /workflow 扇出 — 52-agent 轉 procs、逐 endpoint 診斷
- goal vs workflow 其實是假對立

**副產品 Bug：** A/B 比對抓出 `incrementalReleaseRatio` 被硬寫 NULL。人工 review 很難發現，有了自動驗收才被逼出來。

**成本帳（四種跑法，同任務、交付物相同 → 可比）：**
- 公式：`cost = input×1 + cache_read×0.1 + cache_write×1.25 + output×5`
- workflow_skill ≈ 2.16M（最便宜，skill 有用到）
- goal ≈ 2.73M
- workflow ≈ 2.88M
- goal_skill ≈ 4.31M（最貴，skill 掛了沒用到）
- 警語：n=1，看方向、非定論

**成本觀察：**
1. 掛上 skill ≠ 用到 skill — workflow_skill subagent 有用 → 最便宜；goal_skill 掛了沒用 → 最貴（cache_read 24.3M，純浪費）
2. 錢主要花在 cache_read — 長 autonomous loop 的固有成本，hygiene 只能邊際壓低

**什麼時候不要直接自動化：**
- 沒有可自動驗收的 oracle
- 需要不可逆的副作用（刪資料、打外部 API、動錢）
- domain knowledge 不在 repo 裡

**Human review 是新瓶頸：**
- PR 動了 DAO、config、49 procs→functions、39 處修正
- 對策：逼 agent 拆小 PR + 自帶 A/B 證據

**日常 Hygiene：**
- Context 管理：`/rewind` 回到岔路前、`/btw` 即時補充、`/clear` 前先寫 `handoff.md`
- 記憶落地：`memory.md` → flush 進 `claude.md`

---

### Checklist — 下 `/goal` 或 `/workflow` 前的五句自問

1. **完成定義** — 有沒有能自動檢查的「做完」？沒有 oracle 就先別跑。
2. **目標** — 要的是成品與決策，還是只寫了一個動作？
3. **邊界** — 哪些不要碰？不可逆副作用先圈起來。
4. **可讀性** — agent 看得懂嗎？缺 mapping 就先補（會複利）。
5. **階段** — 現在要它想、比、決，還是做？

---

### 一句話總結

- 機器側會越來越強，人側不會自動補上
- 不要問「agent 現在能不能做」，要問「我能不能把目標與環境整理到讓 agent 自己能做」
- 把人從執行者，挪到「把任務定義清楚的人」與「把 code 變好懂的人」——這兩件事 agent 替不了，每一次投資都會隨它變強而複利

---

## Resources

<!-- 在此放相關連結、參考資料、延伸閱讀 -->

-
