docs/superpowers/specs/2026-06-16-mssql-to-postgres-migration-**design**.md


# 設計:MSSQL → PostgreSQL 遷移(downloader)

- 日期:2026-06-16(更新:2026-06-22 — 收斂遷移範圍至指定表)
- 分支:`exp_base`
- 狀態:設計已通過,待寫實作計畫
- 約束:**不查看 git history、不參考其他 git branch**;全自動執行,無人為介入。

## 1. 目標與成功標準

把 `downloader` 應用程式與其 4 個資料庫(`Downloader`、`Cyberlink`、`PC`、`PMS`)中**指定的表**從 SQL Server 遷到 PostgreSQL。

**完成定義(Definition of Done):**
1. WAR 在本地 Tomcat 上執行,連線目標為 PostgreSQL(非 MSSQL)。
2. `postman/api.json` 內**每一個 endpoint** 都成功回應(2xx / 合理 payload,無 500 或 DB 錯誤)。
3. 產出一份 HTML 報告(見 Phase 7),涵蓋每個 API 的修改內容,以及整個執行歷程的 harness/agents/token/成本/時間遙測。

資料來源(source of truth)= 還原進 MSSQL 的 4 個 `.bak` 檔。

## 1.5 遷移範圍 —— 僅遷移下列 23 張表 【新增】

本次**只遷移以下指定的表**(共 23 張,跨 4 個 DB)。未列入者**不轉 schema、不搬資料**。

`.bak` 仍為 source of truth:Phase 0 還原**完整** DB 進 MSSQL,但 Phase 1 / Phase 2 **只針對下列表**建立 schema 與搬移資料。

### Downloader(主資料庫)— 18 表
- `Digital_Copy_Content_Pack`
- `Digital_Copy_SR`
- `Download`
- `Download_Item`
- `Download_Patch_Item`
- `Download_Trial_Lang`
- `Downloader_CountryCode`
- `Downloader_OEM`
- `Downloader_U_Region_Report`
- `Downloader_U_Report`
- `Downloader_v2`
- `Generic_Trial`
- `MSR_Log`
- `Page_WebFunction`
- `Subscription_Patch_SR`
- `Subscription_SR`
- `Web_Combo`
- `Web_ComboLang`

### Cyberlink — 3 表
- `Cyberlink_Product`
- `Cyberlink_ProductVersion`
- `Cyberlink_ProductVersionType`

### PC — 1 表
- `CSE_Configuration`

### PMS — 1 表
- `ProductVersionType`

> **子集遷移的外鍵(FK)規則**:MSSQL 的外鍵不能跨 DB,故 FK 問題只發生在「同一個 DB 內部」。
> - 若上列任一表對「同 DB 內、未列入範圍」的表有 FK,該 FK 約束在子集 schema 中應**捨棄 / 略過**(被參照表不存在),並於報告中記錄被丟棄的 FK 清單。
> - 範圍內表彼此之間的 FK 則**保留**,並依相依順序載入(Phase 2)。
>
> **識別字注意**:`Downloader_v2`、`MSR_Log` 等含底線 / 數字的名稱,套用「一律小寫、不加引號」策略後即為 `downloader_v2`、`msr_log`,在 PG 端仍可正常比對。

## 2. 既有狀態(exp_base 工作樹)

- 應用為 Java WAR:Spring MVC + Proxool 連線池 + 純 JDBC DAO。
- Proxool alias:`main`、`main_write`、`downloader`、`pc`、`cyberlink`、`pms`。
- `ProxoolConfig.init()`(`src/com/cyberlink/seo/config/ProxoolConfig.java`)在啟動時讀 `proxool.xml`,從 Spring `Environment`(環境變數)解析 `${mssql_host}`、`${postgres_host}`、`${postgres_port}`、`${postgres_user}`、`${postgres_password}` 等佔位符,並對以 `/${env}` 開頭的值走 AWS Parameter Store。
- 設定**部分**已遷移:PG 連線池已加入,但 proxool `main`/`main_write` 與 `db.properties` 的舊 MSSQL 條目仍指向 SQL Server。
- DAO / action / JSP 內嵌大量 MSSQL 方言:`TOP`、`ISNULL`、`dbo.`、`[中括號]`、`GETDATE()`、`CHAR(10)` 等。
- repo 內 `sql/*_mssql.sql` 文字匯出不可靠(`Cyberlink_mssql.sql` 與 `Downloader_mssql.sql` byte 完全相同),**不採用**,改以 `.bak` 為準。

## 3. 設定支援包(由使用者提供)

位於 `/home/brian/projects_java/test_downloader_settings`:
- `downloader-mssql-postgres/docker-compose.yml`:MSSQL(`:1466`,SA 密碼於 compose 內)、PostgreSQL(`:5466`,DB `Downloader`,user `user`/`password`)、`tools`(mssql-tools,`profiles: ["tools"]`,共用 mssql 網路命名空間)。
- `downloader-mssql-postgres/bak/`:`Cyberlink.bak`、`Downloader.bak`、`PC.bak`、`PMS.bak`。
- `downloader-mssql-postgres/restore_db.md`:`RESTORE FILELISTONLY` + `RESTORE ... WITH MOVE` 還原步驟(logical name 每個 bak 不同,務必先跑 FILELISTONLY)。
- `run-tomcat-script/`:`deploy-tomcat.sh`、`tomcat-start.sh`、`tomcat-stop.sh`(設計上要放在 app 專案的 `scripts/` 目錄;以 `$PROJECT_DIR/scripts/...` 互相參照)。
- `postman/api.json`:Postman collection「downloader api」,分四組:`api/`(`/api/download/*` JSON POST + `/api/health`)、`cache/`(JSP reload)、`prog/`(下載工具 JSP)、`backend-no-auth/`(`.do` 建立端點)。
- `env.local`:本地機密,**DO NOT COMMIT**。PG = `localhost:5466 user/password`;MSSQL = `localhost:1466 sa/abcdefgh#1`。注意:`env.local` 匯出 `database_*`,但程式要 `postgres_*`(名稱不一致,Phase 4 處理)。

## 4. 架構(應用本身不變)

Spring MVC WAR → Proxool 連線池 → 純 JDBC DAO。本次只改「連線池指向哪裡」與「DAO 內 SQL 方言」,不動應用架構。

## 5. 採用的技術決策

- **Schema 轉換**:AWS SCT(Schema Conversion Tool)**CLI / batch 無頭模式**,由 agent 自行安裝與執行。SCT 預設將識別字轉小寫 → 與「一律小寫」程式策略一致。**SCT scenario 須以表為單位限定範圍至 §1.5 的 23 張表**(透過物件過濾 / include list),不轉整庫。
- **識別字大小寫策略**:PG 表一律小寫;程式中 `[Mixed]` / `dbo.` / `"Mixed"` 一律去括號 → 不加引號 → PG 折成小寫即可比對。
- **大小寫不敏感比對**:MSSQL 預設大小寫不敏感;在應用依賴之處改用 `citext` 或 `lower()`。
- **資料搬移**:`bcp` 匯出 CSV → PostgreSQL `\copy` 匯入(輕量、本地可控、無需額外服務),**僅針對 §1.5 列出的表**。
- **驗證**:`newman`(Postman CLI)無頭跑 collection。

## 6. 各階段(Phases)

### Phase 0 — 起環境並還原
`docker compose up -d`(MSSQL `:1466` + PG `:5466`)。用 `sqlcmd`(`tools` profile)依 `restore_db.md`:先 `RESTORE FILELISTONLY` 取得正確 logical name,再 `RESTORE DATABASE ... WITH MOVE ... REPLACE` 還原 `Cyberlink`、`Downloader`、`PC`、`PMS`。
> 還原為**完整** DB(`.bak` 不支援單表還原);後續 Phase 1/2 只取 §1.5 的表。

### Phase 1 — Schema 轉換(AWS SCT CLI)【硬性關卡里程碑】
安裝 AWS SCT + SQL Server / PostgreSQL JDBC 驅動;撰寫 SCT batch scenario 腳本,**將轉換範圍限定在 §1.5 的 23 張表**,逐一轉換並套用到 PG。檢視 assessment report,手動修正:
- 型別對應(`datetime`→`timestamp`、`bit`→`boolean`/`smallint`、`money`→`numeric`、`uniqueidentifier`→`uuid`)。
- 對需要大小寫不敏感比對的欄位用 `citext`。
- 索引 / 預設值 / identity → `GENERATED` / sequence。
- **外鍵範圍裁剪**:對「指向同 DB 內未列入範圍之表」的 FK 一律捨棄,並記錄清單(供 Phase 7 報告);範圍內互相參照的 FK 保留。

**關卡**:若真的試過仍無法在 WSL 無頭跑起 SCT CLI,停下並回報,不默默換工具。

### Phase 2 — 資料搬移(bcp → COPY)
**僅針對 §1.5 的 23 張表**:用 `bcp` 把每張表從 MSSQL 匯出 CSV;用 `\copy` 載入 SCT 建好的 PG schema。處理:
- bit→boolean、datetime 格式、NULL 與編碼。
- 外鍵載入順序:**只考慮範圍內表彼此的相依**(依相依順序或延遲約束);指向範圍外的 FK 已於 Phase 1 移除。
- 把 sequence 重設為 `max(id)+1`(僅限有 identity / sequence 的範圍內表)。

### Phase 3 — 程式 SQL 方言轉換
以 grep 建立 MSSQL 方言清單,逐檔轉換(DAO / action / JSP):
- `TOP n` → `LIMIT n`
- `ISNULL(a,b)` → `COALESCE(a,b)`
- `GETDATE()` → `NOW()`
- 移除 `[中括號]` 與 `dbo.`(→ 不加引號的小寫識別字)
- `DATEDIFF` / `DATEADD` → interval 運算
- `CHARINDEX` → `POSITION` / `STRPOS`
- `+` 字串串接 → `||`
- `CONVERT(...)` 日期格式 → `TO_CHAR(...)`
- `isShow = 1` 等布林比對對齊新型別
- `NEWID()` → `gen_random_uuid()`
- `CHAR(10)`、`replace()` 等內建函式逐一核對

> **範圍提醒**:若某 DAO / JSP 查詢的是 §1.5 **未列入**的表,而該查詢被某 endpoint 觸發,將在 Phase 6 暴露(該表在 PG 不存在 → 報錯)。屆時需回頭判斷:該表是否實際被任何受測 endpoint 依賴 → 若是,須補進遷移範圍;若否,確認該 endpoint 不在驗證集合內或回報。

由逐 endpoint 驗證驅動修正(Phase 6 回饋)。

### Phase 4 — 設定切換
- proxool `main` / `main_write` → PG `Downloader`。
- `house-keeping-test-sql` 的 `select getdate()` → `select 1`。
- 環境變數不一致:`env.local` 給 `database_*`,程式要 `postgres_*`,擇一對齊(於 `env.local` / 部署腳本補 `postgres_*`,不改 commit 檔內機密)。
- 確認 `pms` alias 目標(目前指向 `Cyberlink` DB)是否正確 —— 對照 PMS DAO 實際查詢的庫。注意 PMS 範圍內只有 `ProductVersionType` 一表,而 Cyberlink 範圍內有 `Cyberlink_ProductVersionType`,名稱相近,需確認 DAO 實際打的是哪個庫 / 哪張表,避免指錯。
- 移除 `db.properties` 內舊 MSSQL 條目(或標示停用)。

### Phase 5 — 建置與部署
把三支 tomcat 腳本放進專案 `scripts/`;匯出所需環境變數(`postgres_host/port/user/password`、`mssql_host/password`、`env=dev`);`mvn clean package -P dev -DskipTests`;部署 `ROOT.war` 到 `CATALINA_BASE`;啟動 Tomcat。日誌:`$CATALINA_BASE/logs/catalina.out`。

### Phase 6 — 驗證(Postman / newman)
用 `newman` 無頭跑 `postman/api.json` 對著執行中的應用;設定 `host`(對應 `RELOAD_DOMAIN`,如 `http://localhost:8099`)。反覆修正 Phase 3/4 直到**所有** endpoint 通過(2xx / 合理結果,無 500 或 DB 錯誤)。記錄每個 API 的請求、回應、判定。
> 若出現「relation does not exist」類錯誤,先比對該表是否在 §1.5 範圍內(見 Phase 3 範圍提醒)。

### Phase 7 — HTML 報告
產出一份單檔 HTML 報告(放於 repo 根目錄,例如 `migration-report.html`),內容:
1. **每個 API 的修改內容**:endpoint、對應的 DAO/檔案、做了哪些 SQL 方言/設定變更、Phase 6 驗證結果(通過/回應摘要)。
2. **遷移範圍對照**:§1.5 的 23 張表清單、各表是否成功建 schema / 搬資料、被丟棄的跨範圍 FK 清單。
3. **執行歷程遙測**:
   - 從計畫到完成所使用的 harness 設計(各階段如何編排:主迴圈 / 子 agent / workflow / pipeline 等)。
   - 使用的 **agents 數量**。
   - **token 用量與成本**,成本公式為:`cost = input×1 + cache_read×0.1 + cache_write×1.25 + output×5`。
   - **執行時間**(各階段與總計)。

**前置要求**:全程須記錄 agent 數、各類 token(input / cache_read / cache_write / output)、各階段起訖時間,以便彙整此報告。報告本身不得含 `env.local` 機密值。

## 7. 主要風險

1. **SCT 在 WSL 無頭安裝**(Phase 1 硬性關卡 — 無法做到就停下回報)。
2. **子集遷移的外鍵完整性**【新增】— 範圍內表若參照範圍外表,需丟棄該 FK;務必確認丟棄不會破壞受測 endpoint 的查詢邏輯(MSSQL FK 不跨 DB,問題侷限在各 DB 內)。
3. **範圍判定失誤**【新增】— 某 endpoint 實際依賴的表未列入 §1.5,會在 Phase 6 才暴露(PG 無此表 → 報錯);需回補範圍或確認該 endpoint 不在驗證集。
4. **識別字大小寫** — `[Mixed]`/`"Mixed"` 未去括號會 `column does not exist`。
5. **大小寫不敏感比對** — 需 `citext` 或 `lower()`。
6. **bcp 資料保真** — bit/datetime/NULL/編碼邊界情況。
7. **遙測完整性** — 報告所需的 token/agent/時間數據須從一開始就記錄,事後難補。
8. **機密外洩** — `env.local` 屬 DO-NOT-COMMIT;報告與任何 commit 檔皆不得含其值。

## 8. 不在範圍內

- production / demo 設定、CI/CD、Dockerfile 變更 — 只做 `dev` profile + 本地 Tomcat。
- §1.5 未列出的所有表 — 不轉 schema、不搬資料(除非 Phase 6 驗證證實某受測 endpoint 確實依賴,經回報後再補)。