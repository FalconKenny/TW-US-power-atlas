/* ============================================================
   台美電力資源藍圖 — 加拿大各省電力資料
   來源：各省電力公司（Hydro-Québec、BC Hydro、Manitoba Hydro、
   OEB/IESO、AESO、SaskPower、NB Power、NS Power、NL Hydro 等）
   費率表與加拿大統計局/CER 公開統計。
   電價為 2025 年約值（加分/度 ¢CAD/kWh，1 CAD ≈ 0.73 USD ≈ 23 TWD），
   住宅為典型帳單均價、工業為大用戶約值；供趨勢比較參考，
   以各省電力公司費率公告為準。最後整理：2026-07
   key = 省代碼（canada-provinces topojson feature id，如 CA.QC）
   ============================================================ */

const CA_NATIONAL = {
  avgResidential: 14.1, avgIndustrial: 9.5, // ¢CAD/kWh 約值
  ren: 68,           // 水力約六成＋風光；加計核能，低碳電力約 82%
  peakNote: "全國裝置容量約 155GW；水電大省（魁北克、卑詩、曼尼托巴）長期外銷美國",
  source: "加拿大能源監管局（CER）、加拿大統計局、各省電力公司（2025 約值）"
};

/* rPrice=住宅 iPrice=工業/大用戶（¢CAD/kWh, 2025 約值）
   ren=再生能源發電占比%（含水力，約值） utility=電力公司/調度
   main=主要電源 tw=台灣供應鏈連結重點 */
const CA_PROVINCES = {
  "CA.BC": { name: "卑詩省", en: "British Columbia", abbr: "BC", rPrice: 11.6, iPrice: 8.1, ren: 92,
    utility: "BC Hydro（省營，垂直整合）", main: "水力為主（約九成）",
    tw: "溫哥華港是台加物流門戶；潔淨水電＋LNG Canada 出口鏈；Site C 大壩投運後供給增加，惟新增大負載需排隊申請。" },
  "CA.AB": { name: "亞伯達省", en: "Alberta", abbr: "AB", rPrice: 19.0, iPrice: 11.0, ren: 18,
    utility: "AESO（能量市場，加拿大唯一全自由化）", main: "燃氣為主，風光成長全加最快",
    tw: "電價隨市場波動大（類似 ERCOT）；油氣資本充沛，正大力招商 AI 資料中心（如 Wonder Valley 園區計畫），自建燃氣＋碳捕捉為主流方案。" },
  "CA.SK": { name: "薩克其萬省", en: "Saskatchewan", abbr: "SK", rPrice: 16.7, iPrice: 9.8, ren: 26,
    utility: "SaskPower（省營）", main: "燃氣、燃煤（退場中）、水力風電",
    tw: "全球鈾礦供應核心（Cameco）；規劃 2030 年代部署 SMR 小型核電；鉀肥與農糧供應鏈重鎮。" },
  "CA.MB": { name: "曼尼托巴省", en: "Manitoba", abbr: "MB", rPrice: 10.4, iPrice: 5.9, ren: 97,
    utility: "Manitoba Hydro（省營）", main: "水力（近全部）",
    tw: "北美最便宜電力之一，水電長期外銷美國中西部（MISO）；適合能源密集型製造與綠色資料中心評估。" },
  "CA.ON": { name: "安大略省", en: "Ontario", abbr: "ON", rPrice: 14.2, iPrice: 11.0, ren: 34,
    utility: "IESO 調度＋OEB 定價", main: "核能（過半）＋水力，低碳電力約九成",
    tw: "加拿大工業心臟：汽車與電池供應鏈（VW、Stellantis 電池廠）聚集；Darlington SMR 為西方首批小型核電；大用戶可透過 ICI 尖峰管理制度降電費。" },
  "CA.QC": { name: "魁北克省", en: "Québec", abbr: "QC", rPrice: 7.8, iPrice: 5.7, ren: 99,
    utility: "Hydro-Québec（省營，北美最大水電公司）", main: "水力（約 99%）",
    tw: "北美最便宜綠電：工業費率（L 費率）約 5.7¢CAD；鋁業、電池材料與 AI 資料中心聚集，惟新增大負載（>5MW）須政府核配，排隊中案件多，宜及早卡位。" },
  "CA.NB": { name: "新布藍茲維省", en: "New Brunswick", abbr: "NB", rPrice: 14.9, iPrice: 10.2, ren: 33,
    utility: "NB Power（省營）", main: "核能（Point Lepreau）＋水力燃氣",
    tw: "SMR 示範省（ARC、Moltex 進駐）；大西洋門戶港口 Saint John 的 LNG 與能源樞紐角色值得關注。" },
  "CA.NS": { name: "新斯科細亞省", en: "Nova Scotia", abbr: "NS", rPrice: 18.5, iPrice: 12.5, ren: 32,
    utility: "Nova Scotia Power（Emera 旗下）", main: "燃煤退場中＋風電快速成長",
    tw: "2030 燃煤全退、綠電目標 80%；大西洋離岸風電招標啟動，海事工程與風機供應鏈有切入機會。" },
  "CA.PE": { name: "愛德華王子島", en: "Prince Edward Island", abbr: "PE", rPrice: 17.9, iPrice: 12.0, ren: 99,
    utility: "Maritime Electric", main: "島內風電，多數電力經海纜自 NB 輸入",
    tw: "島內發電近全為風電，但七成以上用電仰賴新布藍茲維海纜輸入；規模小，適合觀察而非重載佈局。" },
  "CA.NF": { name: "紐芬蘭與拉布拉多省", en: "Newfoundland and Labrador", abbr: "NL", rPrice: 13.9, iPrice: 9.0, ren: 96,
    utility: "NL Hydro（省營）", main: "水力（Churchill Falls、Muskrat Falls）",
    tw: "與魁北克重談 Churchill Falls 供電合約後水電價值重估；風電製綠氫（出口歐洲）計畫是新亮點。" },
  "CA.YT": { name: "育空", en: "Yukon", abbr: "YT", rPrice: 18.7, iPrice: 14.0, ren: 90,
    utility: "Yukon Energy（準省營）", main: "水力為主＋冬季柴油補充",
    tw: "礦業（金、銅）為主要負載；系統小、冬季尖峰吃緊，大型佈局需自備電源方案。" },
  "CA.NT": { name: "西北地方", en: "Northwest Territories", abbr: "NT", rPrice: 38.0, iPrice: 30.0, ren: 40,
    utility: "NT Power Corp", main: "水力＋柴油（社區獨立系統）",
    tw: "鑽石與關鍵礦物產區；電價高、系統分散，僅適合特定資源型投資。" },
  "CA.NU": { name: "努納武特", en: "Nunavut", abbr: "NU", rPrice: 60.0, iPrice: 50.0, ren: 2,
    utility: "Qulliq Energy", main: "全柴油獨立系統（25 個社區各自供電）",
    tw: "全加電價最高（高額補貼後住宅仍逾 60¢）；除礦業外不具一般製造佈局條件。" }
};
