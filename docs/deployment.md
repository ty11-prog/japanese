# GitHub Pages 手動部署

本專案可建置為純靜態檔案，不需要應用程式伺服器、登入服務、GitHub 個人存取權杖（PAT）或雲端資料庫。GitHub Pages 會提供 HTTPS，適合 Android Chrome 安裝與離線快取。

**正式網站：[拾語手帖](https://ty11-prog.github.io/japanese/)**。儲存庫已設為公開，Pages 已啟用並使用 GitHub Actions 部署。

日後更新網站時，將變更提交並推送至 `main`，再手動執行下方工作流程。初次設定步驟保留供重新建立環境時參考。

## 設定及執行

1. 將這次變更提交並推送至 GitHub 儲存庫。要讓手動工作流程出現在 Actions 清單，`.github/workflows/pages.yml` 必須存在於儲存庫的預設分支。
2. 進入儲存庫的 **Settings → Pages**。
3. 在 **Build and deployment → Source** 選擇 **GitHub Actions**。若沒有 Pages 選項，先確認自己有管理權限，以及目前帳號方案是否支援該儲存庫的 Pages 功能。
4. 進入 **Actions → Deploy to GitHub Pages → Run workflow**，選擇要部署的分支並手動執行。
5. 等待 `build` 與 `deploy` 兩個工作完成。若安裝、單元測試或建置失敗，修正後重新執行；不要將未成功的工作流程視為網站已更新。
6. 在 `deploy` 的 `github-pages` 環境或 **Settings → Pages** 取得 GitHub 實際提供的網站位址。
7. 用手機 Chrome 開啟該 HTTPS 位址，完成首次載入，再檢查離線與安裝行為。

工作流程只有 `workflow_dispatch` 觸發，不會因一般 push 或 pull request 自動發布。部署使用 GitHub Actions 的短效授權與 OIDC，不需建立或貼上 PAT；也不需要新增 repository secrets。

## 工作流程內容

- `build`：取出原始碼、依 `.nvmrc` 安裝 Node.js 24、`npm ci`、`npm test`、`npm run build`，上傳 `dist` 成品。
- `deploy`：在建置成功後，將成品部署到 GitHub Pages。
- 建置工作僅具有 `contents: read`；部署工作具有 `pages: write` 與 `id-token: write`。若儲存庫為 `github-pages` 環境設定了審批規則，仍須遵循該規則。
- 此部署流程未包含瀏覽器端對端測試。發布前可另在支援 Chromium 的開發環境執行 `npm run test:e2e`。

Vite 使用相對資產路徑 `base: './'`，manifest 的啟動路徑及 scope 也是相對目前目錄，支援一般的 GitHub Pages 專案子路徑。若變更自訂網域、網站路徑或其他部署平台，請重新檢查資產、Service Worker 範圍與離線重新載入。

## 手機驗收

1. 首次連線開啟首頁，確認 300 詞單字本可搜尋、查看例句；「文法練習」有 30 項文法與 90 題。
2. 分別完成一題單字及文法，重新整理，確認兩類進度各自保存；文法錯題最多加練一次。
3. 等待「可以離線學習」提示後，開啟手機飛航模式，重新開啟同一網站，確認頁面、單字、文法說明／題目及本機進度可用。
4. 在有日文語音的裝置測試發音；若使用遠端語音，斷網時可能無法播放。網站的離線快取不會安裝作業系統語音套件。
5. 在 Chrome 選單尋找「加入主畫面」或「安裝應用程式」。沒有出現時，確認正式 HTTPS、manifest 與 Service Worker 已成功載入，再重新開啟網站。
6. 到「學習設定」匯出備份，確認下載檔案存在；測試匯入時注意它會取代現有進度，請先保存目前備份。

應用程式版本更新時，依頁面提示選擇重新載入。一般靜態檔更新不會清除同來源的 IndexedDB，但仍建議先備份重要進度。

## 網站可見性與進度隱私

**私人 GitHub 儲存庫不等於私人 Pages 網站。** GitHub Pages 的可用性及存取控制取決於帳號方案、組織政策與 Pages 設定；不能僅以儲存庫為 private 就假設只有自己能看網站。若需要網站本身限制登入或成員存取，必須另行確認支援的託管方案及存取控制。

本產品免登入，沒有進度上傳或雲端同步 API。每位訪客的進度保存在各自瀏覽器的 IndexedDB，因此其他人開啟同一網站，也不會讀取你手機中的進度。請勿把匯出的個人進度 JSON、token 或其他密鑰加入網站原始碼、`public` 或 `dist`；靜態網站的檔案可以被下載。

備份可由自己手動存到手機、個人雲端硬碟或私人 GitHub 儲存庫。這與「網站由 GitHub Pages 託管」是兩件事；目前應用程式不會直接寫入任何 GitHub 儲存庫。

如果日後更換網域、HTTP／HTTPS、瀏覽器或埠號，原本的 IndexedDB 不會自動搬過去，請先在舊來源匯出，再於新來源匯入。
