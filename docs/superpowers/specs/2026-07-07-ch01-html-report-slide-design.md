# Ch01 新投影片:「叫 agent 產出 HTML 報告來 review」— 設計文件

日期:2026-07-07
對象:`talks/claude-code-production/index.html`(+ 同目錄 AGENTS.md 章節表)

## 目的

在 Everyday Hygiene 章新增一張投影片:agent 跑完一輪後的大量產出,叫它整理成一頁 HTML 報告來看,取代難以閱讀的 markdown 牆。同時在 Ch04 講稿收割這個梗(現場展示真實的實驗報告)。

訊息切角:**不是「HTML 比 markdown 好」**,而是「東西一多,就叫它做一頁報告給你看」——輸出的形式要選人類 review 成本最低的那種。這呼應 Ch04 的「human review is the new bottleneck」。

## 1. 位置與編號

- 新投影片插在 5/1「Keep the run on track」之後,成為 **5/2**。
- 章內節奏變成:痛點開場 → 執行中三招 → **跑完怎麼看懂產出** → context 滿交接(5/3)→ 收尾存決策(5/4)。
- 連帶修正:「Persist decisions」那張的 `data-slide` 標籤由 `5/2` 改為 `5/4`(原本就與實際位置不符;handoff 那張的 `5/3` 插入後恰好正確,不動)。
- `talks/claude-code-production/AGENTS.md` 章節表 Ch01 由 `~4` 改 `~5`。
- 僅垂直插入,所有橫向 hash(其他章)不變。

## 2. 投影片內容(英文,沿用 5/0 的 `.ba` before/after 版型)

- 標題:**Ask for a report, not a wall of markdown**
- 左欄(`.before frame-q`)label「The pain」:
  - `results.md — 2,400 lines`
  - every line looks the same
  - ⇒ you scroll until you give up
- 右欄(`.after frame-q`)label「The fix」:
  - `report.html — one page`
  - summary first · failures on top, in red · tables, not prose
  - ⇒ review in minutes
- 下方一行可抄的 prompt(mono):`"turn the results into a one-page HTML report — summary first, failures on top"`
- 不加 fragment 互動,兩欄同時顯示。
- 反劇透約束:示意數字用通用值(2,400 行、一頁),**禁用** 48/326/390k、A/B/C1/C2、golden MSSQL 等案例與實驗詞彙。

## 3. 講稿(新投影片的 `<aside class="notes" data-slide="5/2">`)

> 跑完一輪,它常常丟給你一份幾千行的 markdown——測試結果、改了哪些檔案、哪些沒過。
> markdown 對機器很友善,對人不是:東西一多,你會捲到放棄,重點淹沒在中間。
> 解法一句話:「幫我整理成一頁 HTML 報告——摘要放最上面、失敗的排最前面標紅、用表格不要用長文」。
> 對 agent 來說是順手的事,幾乎零成本;對你來說,review 從半小時變幾分鐘。
> 這招先記著,後面還會再看到它派上用場。

最後一句是對 Ch04 的暗梗,不明講實驗。

## 4. Ch04 收割(只改講稿,投影片不動)

Results 投影片(`data-slide="13/3"`)講稿末尾追加:

> 補一句:大家剛看到的這些數字,就是用第一章那招整理的——我請 agent 把整個實驗結果做成一頁 HTML 報告。*切視窗* 這就是那份報告,摘要在最上面、每個 arm 的結果都在同一頁。*切回投影片*

- `*切視窗*` 舞台指示沿用既有 `*換頁*` 慣例。
- 展示檔案:`exp/experiment-report-2.html`,演講前先開好分頁。

## 驗收

1. `npm start` 後 `#/5/2` 顯示新投影片,左右兩欄不爆版、prompt 一行不折行(以 Puppeteer 截圖驗證)。
2. `#/5/3`、`#/5/4` 內容順序正確,speaker view(`s`)各張 notes 對位。
3. 全文 grep 確認新投影片未引入案例/實驗詞彙(48、326、390k、C1、C2、golden、MSSQL)。
4. AGENTS.md 章節表已更新。
