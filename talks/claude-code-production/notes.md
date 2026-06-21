# Claude Code in Production: A Practical RD Workflow

## Notes

### 主旨

為「越來越強的 agent」而設計。核心問題：agent 只會越來越強 → 機器側與人側都要到位 → 逼近終局。

終局 pipeline：PM request → AI agent (`/goal` · `/workflow`) → PR (完成 + 自帶證據) → Human review (看證據，不是 diff)

---

### 01 前提與終局

- 承接 Isaac & Sherlock；核心假設：agent 持續變強、甚至能自建 harness
- 轉變：實習生 → 資深夥伴（多數人還用實習生模式：猛加 example/reasoning，但任務沒定義清楚）
- 推論：為「成長曲線」優化，不是為今天的快照
- 邊界：不是萬用擋箭牌——會複利的是「讓 code 好懂、驗收自動」這種通用投資，不是綁某代 agent 的 hack

---

### 02 方法論（兩側都要到位）

**機器側（給對工具）**
- `/goal`（loop until goal）、`/workflow`（multi-agent 扇出）
- hybrid（主控 loop + workflow 扇出）= 最實際
- 習慣：`/clear` `/rewind` subagent skills

**人側（把任務定義清楚）**
- 提示詞是地板，定義任務決定高度
- 完成定義（DoD）← `loop until goal` 的前提：沒有可驗收的 DoD = 沒有達標可言
- 邊界（Boundaries）、階段判斷（想/比/決/做）

**以終為始**
- 預設直接丟 goal/workflow；結果不好 → 問「為什麼 agent 自己到不了」
- 四根因：看不懂 code / 缺 domain knowledge / 無法 mapping 需求到邏輯 / prompt 沒講到重點（缺 DoD）
- 兩軌處方：
  - code 側（會複利）：加註解 → 加 mapping index → 重構段落
  - brief 側（不可外包）：寫成可測的 goal → 補背景與邊界 → 整理成 brief

**鏡子**
- AI 挑戰內容、不質疑意圖；餵模糊反射模糊；能幫你問，不能替你想

**Superpowers（把流程編碼成 skill）**
- Jesse Vincent 2025/10 洞察：問題不在能力，在缺專業開發流程；把 brainstorm→plan→TDD→review 編碼成 skills
- 判斷軸 = 任務大小/風險（做錯重來貴不貴），不是人資不資深
  - 簡單（typo/小函式）：goal 直接做，流程囉嗦
  - 中大型/多檔/越改越歪：流程才划算
- 兩道圍欄：幫你問 ≠ 替你想（結構漂亮的錯任務更難抓）/ DoD 品質仍靠 domain knowledge
- 正面：brief 側並非完全不複利——流程可編碼、教會團隊

---

### 03 證據與實踐

**案例：MSSQL → PostgreSQL migration**
- 前情提要（為什麼難）：換引擎但對外行為要一致；難不在需求模糊，在三件事疊加 — SQL 方言散落整個 stack（`SELECT TOP`/`[dbo].`/`(NOLOCK)`/`GETUTCDATE()`/`ISNULL`）、結構性差異（跨庫引用 + 49 proc/4 view，SCT 只有 GUI）、型別+大小寫靜默出錯；最難是「答案對不對」不是「跑不跑得起來」
- 完成定義（oracle）：逐 endpoint、逐 row 跟 golden MSSQL 做 A/B
- 硬證據：47/47 endpoints 200、44/47 body 相同（+3 資料狀態差→47/47 忠實）、18/18 表 row 對齊（376,653 rows）
- 真正架構 = hybrid（Opus 主控 + workflow 扇出 52-agent 轉 proc）
- 副產品 bug：`incrementalReleaseRatio` 被硬寫 NULL，人工難發現，A/B 逼出來

**成本帳（四種跑法，同任務、交付物相同 → 可比）**
- 公式：`cost = input×1 + cache_read×0.1 + cache_write×1.25 + output×5`（input-token 當量）
- 排序：workflow_skill ≈2.16M < goal ≈2.73M < workflow ≈2.88M < goal_skill ≈4.31M
- 警語：n=1，看方向、非定論
- 觀察 1：掛上 skill ≠ 用到 skill（workflow_skill subagent 有用 → 最便宜；goal_skill 掛了沒叫用 → cache_read 24.3M 最高、純浪費）
- 觀察 2：錢主要花在 cache_read（部分是長 loop 固有成本；hygiene 只能邊際壓低）

**何時「不要」直接自動化**
- 沒 oracle / 不可逆副作用 / domain knowledge 不在 repo

**Human review 是新瓶頸**
- PR 動 DAO、config、49 proc→function、39 修正 → 對策：拆小 PR、自帶 A/B 證據

**日常 hygiene**
- context 管理（`/rewind`、`/btw`、`/clear` 前寫 `handoff.md`）
- 記憶落地（`memory.md` flush 進 `claude.md`）

---

### Checklist — 下 `/goal` 或 `/workflow` 前的五句自問

1. 完成定義（有沒有自動可檢查的「做完」）
2. 目標（成品與決策，不是動作）
3. 邊界（哪些不要碰）
4. 可讀性（agent 看得懂嗎，缺 mapping 先補）
5. 階段（我要它想、比、決，還是做）

---

### 一句話總結

- 機器側越來越強，人側不會自動補上
- 不要問「agent 現在能不能做」，要問「我能不能把目標與環境整理到讓 agent 自己能做」
- 把人從執行者 → 挪到「把任務定義清楚的人」+「把 code 變好懂的人」

---

## Resources

<!-- 在此放相關連結、參考資料、延伸閱讀 -->

-
