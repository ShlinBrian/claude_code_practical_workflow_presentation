# 用 GitHub Pages 發佈簡報,README 連過去

**Date:** 2026-07-09
**Repo:** ShlinBrian/claude_code_practical_workflow_presentation (fork of reveal.js)
**Talk:** `talks/claude-code-production/index.html`

## 目標

讓別人點 README 的連結、或直接進 GitHub Pages 網址,就能在瀏覽器裡
跑這份互動 reveal.js 投影片。GitHub 的 README 本身無法內嵌執行 reveal.js
(script 被擋),所以「秀報告」= 線上網址 + README 連結/封面圖。

## 現況(已查證)

- 這是使用者的 fork,有 GitHub remote (`origin`)。
- `dist/`(45 檔編譯產物)已被 git 追蹤、未被 gitignore。
- talk 用相對路徑 `../../dist/...` 載 CSS/JS → 在 Pages 上路徑自動正確,
  不需改任何資源連結。
- repo 根目錄已有一份 reveal.js demo `index.html`(`<title>reveal.js</title>`)。
- `gh` CLI 未安裝 → 開啟 Pages 的來源設定需使用者在 GitHub 網頁手動完成。

## 決策(已與使用者確認)

1. 展示方式:**GitHub Pages 線上簡報 + README 連結**。
2. 首頁行為:**根目錄自動轉到報告**。
3. 舊 demo:**備份到 `demo/` 再放轉址頁**。

## 設計

### 1. 根目錄轉址

- 把現有 `index.html` 移到 `demo/index.html`(git mv 保留歷史)。
  - 注意:`demo/` 的 reveal.js demo 若用相對路徑載 `dist/`,移一層後路徑會
    從 `dist/...` 變成需要 `../dist/...`。這份 demo 只是備份、非發佈重點,
    但仍在移動後檢查它的資源路徑;若壞掉,於 commit 訊息註明它是備份、
    不保證可跑(不花額外功夫修 demo)。
- 新根目錄 `index.html` = 極小的 meta-refresh 轉址頁,跳到
  `talks/claude-code-production/`,並附一個純文字 fallback 連結。

### 2. README

在 README **最前面**加一段(原 reveal.js README 內容保留在下方):

- 顯眼的「▶ 線上觀看簡報」連結 → Pages 網址
  `https://shlinbrian.github.io/claude_code_practical_workflow_presentation/`
- 一張封面截圖(標題頁),存 `talks/claude-code-production/assets/cover.png`,
  用無頭 Chrome 對 talk 首頁截圖產生;點圖也連到簡報。
- 一行本機執行說明:`npm start` → 開
  `localhost:8000/talks/claude-code-production/`。

### 3. 開啟 GitHub Pages(需使用者手動一步)

- 把 1、2 的檔案 commit 到 `main`。
- **push 到 origin 前先跟使用者確認**(對外動作)。
- push 後,給使用者指示:GitHub repo → Settings → Pages →
  Source: Deploy from a branch → Branch: `main` / `/ (root)` → Save。
- Pages 生效有數十秒到幾分鐘延遲。

## 驗證

- push 且 Pages 開好後,用無頭 Chrome 抓 Pages 網址:
  1. 根目錄會 meta-refresh 轉到 `talks/claude-code-production/`。
  2. 投影片載入 `dist/reveal.css` / `dist/reveal.js` 正常渲染(非純文字)。
- 若資源 404,檢查是否為 Pages 尚未部署完,或路徑大小寫問題。

## 不做(YAGNI)

- 不設自訂網域。
- 不建 `gh-pages` 獨立分支或 CI 部署流程——直接發佈 `main` 根目錄最簡單。
- 不花額外功夫修復搬到 `demo/` 後的舊 demo 可跑性(它只是備份)。
