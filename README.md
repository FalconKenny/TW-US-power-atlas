# 台美電力資源藍圖｜Taiwan–Americas Power Atlas

為赴美與赴台佈局的企業，以互動地圖呈現**台灣 22 縣市**與**美國 50 州＋DC、美洲 8 國**的電力資源現況（含綠電）、每週電力供需與兩年電價趨勢。

風格延續 Guide.Ferryman Strategic Advisory「航海圖」設計系統（墨海藍 × 海圖紙 × 航道青 × 舵燈琥珀）；互動地圖手法參考 power-atlas（hover 浮框＋著色模式切換），以純靜態 HTML/CSS/JS + D3 重新實作，無需任何後端。

## 網站結構

| 頁面 | 內容 |
|---|---|
| `index.html` | 首頁：台美供需快照、**台灣互動地圖**（hover 浮框顯示電價/電力資源、點擊展開縣市檔案）、**美國互動地圖**（住宅電價/工業電價/綠電占比三種著色模式）、八大電網速覽、兩年電價趨勢預覽、美洲國家預覽 |
| `taiwan.html` | 台灣深度頁：全國儀表板、電源結構與再生能源裝置容量、互動地圖、北中南東分區供需、代表週供需圖（含備轉容量率）、兩年電價趨勢與關鍵節點、22 縣市可排序總表 |
| `americas.html` | 美洲深度頁：全美儀表板、發電結構、台美工業電價對照、互動地圖、50 州＋DC 可排序電價總表、代表週供需、五地電價趨勢、八大電網、美洲八國電力檔案 |
| `about.html` | 方法論、名詞解釋（備轉容量率、ISO/RTO、中電北送、REC/T-REC、Demand Charge）、完整資料來源連結、免責聲明 |

## 技術說明

- **零建置流程**：純靜態網站，開啟 `index.html` 即可使用（建議經 HTTP 伺服器，因地圖以 `fetch` 載入 topojson）
- **地圖**：D3 v7 + topojson-client（皆已 vendor 在本地，離線可用）
  - 台灣：taiwan-atlas `counties-mercator`（預投影 480×600，以 `COUNTYCODE` 對應資料）
  - 美國：us-atlas `states-albers-10m`（Albers USA 975×610，以州 FIPS 對應資料）
- **圖表**：D3 手繪折線圖（含事件標線、hover 十字提示）、供需長條＋階梯線圖、電源結構橫條
- **資料**：`assets/js/data-taiwan.js`、`data-us.js`、`data-trends.js` 三個純 JS 檔，更新資料只需編輯這三個檔案

## 本地預覽

```bash
cd tw-am-power-atlas
python3 -m http.server 8000
# 開啟 http://localhost:8000
```

## 部署到 GitHub Pages

1. 建立新 repo（例如 `power-atlas`），將本資料夾內容推上去：
   ```bash
   git init && git add -A && git commit -m "Taiwan–Americas Power Atlas"
   git branch -M main
   git remote add origin https://github.com/<你的帳號>/power-atlas.git
   git push -u origin main
   ```
2. Repo → **Settings → Pages** → Source 選 `Deploy from a branch`，Branch 選 `main` / `(root)` → Save
3. 約一分鐘後網站上線於 `https://<你的帳號>.github.io/power-atlas/`

（也可直接拖進 Netlify / Vercel / Zeabur 靜態部署，無需任何設定。）

## 資料更新方式

| 要更新的內容 | 檔案 | 位置 |
|---|---|---|
| 台灣電價、電源結構、縣市檔案 | `assets/js/data-taiwan.js` | `TW_NATIONAL`、`TW_COUNTIES`、`TW_REGIONS` |
| 美國州級電價/綠電、美洲各國 | `assets/js/data-us.js` | `US_STATES`（FIPS key）、`AMERICAS_COUNTRIES` |
| 兩年電價趨勢、每週供需 | `assets/js/data-trends.js` | `TREND_MONTHS`、`*_PRICE_TREND`、`*_WEEKLY` |

主要原始來源：台電（電價表、今日電力資訊）、經濟部能源署、U.S. EIA（Electric Power Monthly Table 5.6.A、Hourly Electric Grid Monitor）、DOE、FERC、各國電力主管機關。完整清單見 `about.html`。

## 測試

```bash
npm install jsdom
node smoke-test.js   # 四頁 DOM 冒煙測試（地圖路徑、浮框、圖表、表格）
```

## 免責聲明

所有電價、供需與占比數據為公開資料整理之近似值，僅供趨勢判讀參考，不構成投資、選址或締約建議；以各機構官方公告為準。
