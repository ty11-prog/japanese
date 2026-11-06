# 網站安全防護與已知限制

本專案是 GitHub Pages 上的靜態 React PWA。學習進度保存在瀏覽器 IndexedDB；沒有帳號、金流、教材上傳或進度同步後端。這降低部分攻擊面，但不代表前端程式、建置工具、發布權限及裝置儲存沒有風險。

## 已實作的防護

- 正式建置在其他資源之前加入 meta CSP：限制腳本、樣式與連線為同源，不允許 inline script、eval、外掛物件、子 iframe、表單送出及 base URL 改寫。同源 Service Worker 仍可註冊；React 經 CSSOM 設定的進度條樣式仍可運作，不需開放 `unsafe-inline`。
- `no-referrer` 限制從網頁送出的 referrer 資訊。正式 CSP 僅套用於 build，不影響開發時 React Refresh 與 HMR。
- 網站在 iframe 中只顯示獨立開啟的入口，不掛載可操作學習、進度與備份的 App。入口使用 `noopener noreferrer`。
- 備份匯入保留既有大小上限、欄位與 ID 驗證、危險鍵阻擋及確認覆蓋流程。JSON 與教材文字不當作 HTML 執行。
- Workbox 使用的 glob 覆寫為 `14.0.2`，該子樹的 minimatch 覆寫為 `11.0.1`，處理 [glob 公告](https://github.com/advisories/GHSA-3g3m-2fjr-6pw4)及 [minimatch 公告](https://github.com/advisories/GHSA-g3hv-75wg-m249)。覆寫限定這一條依賴鏈，沒有升級其他未受該公告影響的舊 major。
- 發布前執行 `npm run audit:security`，除了下述精確列出的既有例外，任何新通報（包含 low）、不同版本或鏈路，以及掃描失敗都會中止發布。
- Workflow 的直接 Actions 固定為官方 repository 的完整 commit SHA；checkout 不保留寫入憑證。自行產生 Pages 的 `artifact.tar` 並直接呼叫固定 SHA 的 `upload-artifact`，避免 `upload-pages-artifact` 內部仍使用可移動 tag。build 與 deploy 分開，僅 deploy 具有 Pages/OIDC 寫入權限。
- Dependabot 每週檢查 npm 與 GitHub Actions 更新，提出 PR；不自動合併或部署。

實際 CSP 見 [vite.config.ts](../vite.config.ts)。安全掃描邏輯見 [check-dependencies.mjs](../scripts/check-dependencies.mjs)，發布工作流程見 [pages.yml](../.github/workflows/pages.yml)。

## 唯一允許的套件通報

[GHSA-gcqx-w48m-w2h4](https://github.com/advisories/GHSA-gcqx-w48m-w2h4) 是 deepmerge 的 low severity 原型污染通報，查核時尚無上游修補版。本專案保留明確例外：

`vite-plugin-pwa 2.0.0 → workbox-build 7.4.1 → @rollup/plugin-node-resolve 16.0.3 → deepmerge 4.3.1`

已讀取目前安裝的 node-resolve CJS／ES 原始碼：deepMerge 唯一呼叫為 `deepMerge({}, defaults)`，輸入是套件內建的靜態 defaults。Workbox 呼叫 `nodeResolve()` 未傳入外部選項；網站使用者的 JSON 備份、搜尋與教材內容不會進入這個合併點。本輪未找到攻擊者輸入到達該點的路徑，因此在不改用未驗證替代套件的前提下，保留該固定依賴鏈。

**此通報仍存在，不能稱為已修補或零漏洞。** 完整 npm audit 會將同一公告列為四個 low 套件項目（含上層傳遞影響）。掃描工具仍輸出這些項目，只有確認符合上述版本、開發依賴節點及單一公告鏈時才允許通過。未來版本或依賴用途改變時需重新判斷；上游修復後應移除此例外。

## GitHub Pages 的防護界線

此儲存庫無法為 GitHub Pages 設定任意 HTTP 回應標頭。meta CSP **不支援 `frame-ancestors`**，`X-Frame-Options` 放在 meta 也無效。因此目前的 iframe 防護是 App 不掛載互動介面的措施，沒有宣稱已設定瀏覽器層級的防嵌入標頭。`frame-src 'none'` 只限制本頁載入子 iframe。

若將來要求所有框架載入都由瀏覽器拒絕，需在實際供應網站的託管平台或反向代理設定 `Content-Security-Policy: frame-ancestors 'none'`，可搭配 `X-Frame-Options: DENY`。該變更涉及託管方式，不由本輪程式修訂自動完成。

CSP 約束頁面資源，不等於替 Service Worker 回應加上 CSP；也不能防止已取得儲存庫發布權限的人更換網站程式。

## 資料與使用限制

- IndexedDB 與 JSON 備份沒有應用程式層加密，不應放入密碼、權杖或其他敏感資料；備份應自行妥善保存，避免公開提交。
- 同一瀏覽器、同一網站來源的腳本能存取相應的本機資料。不同 GitHub Pages 專案路徑不是獨立來源，因此同帳號的其他 Pages 專案也需要維護安全。
- 發音由裝置／瀏覽器提供；遠端語音可能將教材文字送到語音供應商。CSP 不保證系統語音服務完全離線，重視此點時應選擇本機語音。
- GitHub 帳號建議使用 passkey 或雙因素驗證，限制儲存庫寫入權限；個人帳號驗證設定不由這份程式碼管理。
- 防護與測試不等於完整滲透測試或安全認證。上游通報、瀏覽器及託管設定變動後仍需重新檢查。

## 驗證方式

```sh
npm ci
npm run audit:security
npm test
npm run build
npm run test:e2e
```

`tests/e2e/security.spec.ts` 驗證腳本被 CSP 實際阻擋及 iframe 入口限制；既有瀏覽器測試涵蓋備份、動態排版、語音介面、進度與 PWA 離線流程。`npm audit --omit=dev` 可補查正式依賴，但不能用它取代完整掃描，因為開發套件也可能產生或包含會送到瀏覽器的程式。

本輪完成乾淨 `npm ci`、正式建置、安全掃描與 106 個單元測試；完整瀏覽器測試 73 項通過，1 項依既有設定只在手機執行而跳過桌面案例。其中 8 個新增安全案例均通過。完整 audit 為 0 moderate／high／critical，保留上述單一公告衍生的 4 個 low 項目。

參考：[MDN CSP](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/CSP)、[style-src-attr 與直接設定樣式](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/style-src-attr)、[frame-ancestors](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/frame-ancestors)、[X-Frame-Options](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/X-Frame-Options)、[GitHub Actions 安全建議](https://docs.github.com/en/actions/reference/security/secure-use)。
