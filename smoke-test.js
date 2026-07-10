/* 冒煙測試：以 jsdom 載入四頁，執行所有腳本，回報 console 錯誤與關鍵 DOM 結果 */
const { JSDOM } = require("jsdom");
const fs = require("fs");
const path = require("path");

const ROOT = __dirname;
const pages = ["index.html", "taiwan.html", "americas.html", "about.html"];

(async () => {
  let failures = 0;
  for (const page of pages) {
    const html = fs.readFileSync(path.join(ROOT, page), "utf8");
    const errors = [];
    const vc = new (require("jsdom").VirtualConsole)();
    vc.on("jsdomError", (e) => errors.push("jsdomError: " + e.message));
    vc.on("error", (...a) => errors.push("console.error: " + a.join(" ")));

    const dom = new JSDOM(html, {
      url: "file://" + ROOT + "/" + page,
      runScripts: "dangerously",
      resources: "usable",
      pretendToBeVisual: true,
      virtualConsole: vc,
      beforeParse(window) {
        // 模擬 fetch：讀取本地檔案（d3.json 依賴 fetch）
        window.fetch = (url) => {
          const p = decodeURIComponent(String(url).replace("file://", ""));
          const abs = p.startsWith("/") ? p : path.join(ROOT, p);
          const file = fs.existsSync(abs) ? abs : path.join(ROOT, String(url));
          return Promise.resolve({
            ok: true, status: 200,
            json: () => Promise.resolve(JSON.parse(fs.readFileSync(file, "utf8"))),
            text: () => Promise.resolve(fs.readFileSync(file, "utf8"))
          });
        };
      }
    });
    dom.window.addEventListener("error", (e) => errors.push("window.onerror: " + e.message));

    // 等待資源與 d3.json fetch
    await new Promise((r) => setTimeout(r, 2500));

    const doc = dom.window.document;
    const checks = [];
    const q = (sel) => doc.querySelectorAll(sel).length;

    if (page === "index.html") {
      checks.push(["台灣地圖縣市路徑", q("#twmap .region") >= 22]);
      checks.push(["美國地圖州路徑", q("#usmap .region") >= 50]);
      checks.push(["台灣浮框元素", q("#twTip") === 1]);
      checks.push(["美國浮框元素", q("#usTip") === 1]);
      checks.push(["快照表列", q("#snapBody tr") === 5]);
      checks.push(["首頁趨勢圖 SVG", q("#twTrendHome svg") === 1 && q("#usTrendHome svg") === 1]);
      checks.push(["美洲國家卡", q("#ctryGrid .ctry-card") === 4]);
      checks.push(["美國圖例", doc.getElementById("usLegend").innerHTML.length > 10]);
      checks.push(["台灣預設面板（桃園）", doc.getElementById("twPanel").textContent.includes("桃園")]);
      checks.push(["美國預設面板（德州）", doc.getElementById("usPanel").textContent.includes("德克薩斯")]);
    }
    if (page === "taiwan.html") {
      checks.push(["台灣地圖縣市路徑", q("#twmap .region") >= 22]);
      checks.push(["電源結構 mixbar", q("#twMix .mixbar i") >= 5]);
      checks.push(["再生能源 mixbar", q("#twRen .mixbar i") === 5]);
      checks.push(["分區卡片", q("#regionGrid .ctry-card") === 5]);
      checks.push(["每週供需圖", q("#twWeekly svg") === 1]);
      checks.push(["趨勢圖", q("#twTrendFull svg") === 1]);
      checks.push(["縣市總表 22 列", q("#twTblBody tr") === 22]);
      checks.push(["縣市選單", q("#twSelect option") === 23]);
    }
    if (page === "americas.html") {
      checks.push(["美國地圖州路徑", q("#usmap .region") >= 50]);
      checks.push(["美國電源結構 mixbar", q("#usMix .mixbar i") === 7]);
      checks.push(["州總表 51 列", q("#usTblBody tr") === 51]);
      checks.push(["加拿大總表 13 列", q("#caTblBody tr") === 13]);
      checks.push(["中美洲總表 14 列", q("#ctTblBody tr") === 14]);
      checks.push(["南美洲總表 12 列", q("#saTblBody tr") === 12]);
      checks.push(["區域切換按鈕 4 個", q("#amRegionTabs .cat-tab") === 4]);
      checks.push(["每週供需圖", q("#usWeekly svg") === 1]);
      checks.push(["趨勢圖", q("#usTrendFull svg") === 1]);
      checks.push(["電網速覽 8 項", q("#gridList li") === 8]);
      checks.push(["美洲八國卡", q("#ctryGridAll .ctry-card") === 8]);
      checks.push(["州選單", q("#usSelect option") === 52]);

      /* 切換各區域，驗證 lazy init 的地圖 */
      dom.window.PA_setAmRegion("canada");
      dom.window.PA_setAmRegion("central");
      dom.window.PA_setAmRegion("south");
      await new Promise((r) => setTimeout(r, 2500));
      checks.push(["加拿大地圖 13 省路徑", q("#rgmap-canada .region") === 13]);
      checks.push(["加拿大圖例", doc.getElementById("rgLegend-canada").innerHTML.length > 10]);
      checks.push(["加拿大預設面板（魁北克）", doc.getElementById("rgPanel-canada").textContent.includes("魁北克")]);
      checks.push(["加拿大選單 14 項", q("#rgSelect-canada option") === 14]);
      checks.push(["中美洲地圖 14 國路徑", q("#rgmap-central .region") === 14]);
      checks.push(["中美洲預設面板（墨西哥）", doc.getElementById("rgPanel-central").textContent.includes("墨西哥")]);
      checks.push(["南美洲地圖 12 國路徑", q("#rgmap-south .region") === 12]);
      checks.push(["南美洲預設面板（巴西）", doc.getElementById("rgPanel-south").textContent.includes("巴西")]);
      checks.push(["南美洲圖例", doc.getElementById("rgLegend-south").innerHTML.length > 10]);
    }
    if (page === "about.html") {
      checks.push(["方法卡", q(".about-grid .chart-card") === 4]);
      checks.push(["名詞 pill", q(".pill") === 5]);
      checks.push(["來源盒", q(".src-box") === 4]);
    }
    checks.push(["導覽列", q("#nav .nav-links a") >= 4]);
    checks.push(["頁尾", doc.getElementById("foot").innerHTML.length > 100]);

    const failed = checks.filter(([, ok]) => !ok);
    const errMeaningful = errors.filter((e) => !/Could not load link|css/i.test(e));
    console.log(`\n=== ${page} ===`);
    checks.forEach(([n, ok]) => console.log((ok ? "  ✓ " : "  ✗ ") + n));
    if (errMeaningful.length) console.log("  JS errors:\n    " + errMeaningful.join("\n    "));
    if (failed.length || errMeaningful.length) failures++;
    dom.window.close();
  }
  console.log(failures ? `\nFAIL (${failures} page(s))` : "\nALL PAGES PASS");
  process.exit(failures ? 1 : 0);
})();
