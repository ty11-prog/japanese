# 字典交叉查核紀錄

查核日期：2026-10-25（UTC）。這份紀錄記錄助理實際執行的外部字典比對，不等同日語教師或母語者審訂。

## 實際使用的資料

- 資料：Electronic Dictionary Research and Development Group（EDRDG）的 **JMdict**，透過 [scriptin/jmdict-simplified](https://github.com/scriptin/jmdict-simplified) 提供的完整英語 JSON 版本查核，未使用 `common-only` 子集。
- 固定版本：[3.6.2+20261019180022](https://github.com/scriptin/jmdict-simplified/releases/tag/3.6.2%2B20261019180022)。JSON `dictDate` 為 `2026-10-19`，格式版本 `3.6.2`，語言 `eng`。
- [下載檔案](https://github.com/scriptin/jmdict-simplified/releases/download/3.6.2%2B20261019180022/jmdict-eng-3.6.2%2B20261019180022.json.zip)：`jmdict-eng-3.6.2+20261019180022.json.zip`。
- ZIP SHA-256：`ef3ea475127ce2a85c60baa3ca5a8f7e33b836e02c4fad6633b3dd72d2b362c9`。
- 解壓後 JSON SHA-256：`12c39ce51f2e257d04968e5557f4e30249998bb13a7ae07420066a309e6b3a9a`。
- 來源署名與授權：JMdict 由 EDRDG 維護，計畫由 Jim Breen 發起；上游專案說明原始 XML 及其衍生資料依 [EDRDG 授權條款](https://www.edrdg.org/edrdg/licence.html) 使用。這次只下載至開發環境供查核，**沒有將第三方詞庫、字典釋義或例句匯入網站或儲存庫**。未將上游資料誤標成專案原創內容，也未把轉檔程式的授權誤當成詞庫授權。

## 查核方式與結果

使用 [scripts/audit-dictionary.mjs](../../scripts/audit-dictionary.mjs) 讀取網站實際打包的詞庫，逐一比對完整字形與讀音。讀音必須獲同一字典詞條的 `appliesToKanji` 允許；不是把一個詞條中的任意漢字與任意假名交叉配對。詞性證據另限縮至適用於該字形與讀音的義項。

- 原有 100 詞：**100 組字形／讀音均有對應**。
- 擴充後完整 300 詞：**300 組字形／讀音均有對應，0 組未匹配**。完成例句與詞性修正後已重跑同一比對，結果維持 300／300。
- 逐詞列出 JMdict 詞條識別碼與詞性標籤供人工複核；網站只選取本次教學義項所需的詞性，不必列出字典全部古義、罕用義或延伸義。
- 另外檢查每一個例句 ruby 標註。整詞能在字典中匹配的讀音可取得補充證據；`[食|た]べる` 等活用語幹、`ご[飯|はん]` 等複合詞片段，不適合直接當作獨立詞條判定正誤。這些標記需回到完整例句檢查，不會因自動比對未命中就改成錯誤讀音。

本次辨識的詞性分類差異包括「割引」「意地悪」的名詞＋する用法，以及「乗り越える」的自他分類。最終已逐項處理：「割引」採名詞並提示動詞「割り引く」；「意地悪」採名詞・な形容詞，保留「意地悪をする」搭配；「乗り越える」採自動詞並補充越過界限的「を」；「振り返る」兼列自他動詞與相應義項。字典標籤差異本身不代表實際例句錯誤。例如帶「を」的成分也可能表示經過的場所或跨越的界線，不能只看到「を」就自動判定他動詞。

## 重現步驟

1. 從上方固定版本下載並解壓完整英語 JSON（不需放入專案）。
2. 在專案執行：

   ```sh
   node scripts/audit-dictionary.mjs /path/to/jmdict-eng-3.6.2.json /tmp/kotoba-dictionary-audit.json
   ```

3. 確認資料 SHA-256 與 `summary`，再逐項檢查 `headwords` 的詞性證據，以及 `ruby.needsContextReview` 的完整語境。程式對未匹配字形／讀音會回傳非零結束碼；ruby 的詞幹候選只供複核，不直接當作錯誤。

## 能證明的範圍

字典對應可支持單字字形、基本讀音與詞性查核，**無法自動證明繁中釋義、搭配自然度、每一句的語法與語用、所有漢字在特定語境下的讀法，或每詞的 JLPT 級別**。這些項目另由內容交叉複核處理，紀錄見同目錄各主題報告。網站例句與翻譯仍由本專案原創編寫；未宣稱已完成真人專家全面校訂，也沒有提供經專家校訂的東京式音調資料。
