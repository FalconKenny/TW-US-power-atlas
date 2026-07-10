/* ============================================================
   台美電力資源藍圖 — 台灣縣市電力資源資料
   來源：台電公司公開資訊（電源開發、系統運轉）、經濟部能源署
   統計年報、各縣市再生能源備案容量。數據為公開資料整理之
   近似值，供趨勢判讀參考；實際數據以台電與能源署公告為準。
   最後整理：2026-07
   key = 縣市 COUNTYCODE（taiwan-atlas topojson properties.COUNTYCODE）
   ============================================================ */

/* 全國層級摘要（tooltip 與面板共用） */
const TW_NATIONAL = {
  avgTariff: 3.70,        // 平均電價 NT$/度（2024/10 調整後，2025–2026 民生凍漲）
  residentialTariff: 2.77, // 住宅平均約值 NT$/度
  industrialTariff: 4.27,  // 產業（高壓以上）平均約值 NT$/度
  peakLoad2025: 41.7,      // 歷史尖峰負載 GW（2025 夏季約值）
  mix2025: { gas: 47.2, coal: 31.1, renewable: 14.9, hydro: 1.3, oilOther: 5.5, nuclear: 0 },
  renewableInstalled: { solar: 14.2, offshoreWind: 3.0, onshoreWind: 0.9, hydro: 2.1, others: 0.8 }, // GW 約值
  source: "台電系統運轉資料、經濟部能源署能源統計（2025 年約值）"
};

/* 縣市資料
   grid: north(北東) / central(中) / south(南) / islands(離島)
   role: supply(電源重鎮) / balanced(供需平衡) / load(負載中心) / green(綠能重鎮)
   greenPct: 縣市內再生能源裝置容量相對規模（標示用星級 1–5）
*/
const TW_COUNTIES = {
  "63000": { name: "臺北市", en: "Taipei City", grid: "north", role: "load",
    plants: ["無大型電廠（純負載中心）"],
    green: "屋頂光電為主，量體小",
    demand: "商業與住宅負載密集，用電高度依賴外部輸入",
    note: "北部電網最大負載核心之一；資料中心與商辦聚集，尖峰時段依賴中電北送與北部燃氣機組支援。" },
  "65000": { name: "新北市", en: "New Taipei City", grid: "north", role: "balanced",
    plants: ["林口電廠（燃煤 2.4GW）", "核一、核二（除役中）", "翡翠水力（台北水源特定區）"],
    green: "屋頂光電、小水力",
    demand: "人口最多縣市，住宅負載大",
    note: "核一、核二除役後北部供電缺口擴大；林口超超臨界燃煤機組為北部主力，深澳計畫停止後更依賴區域外送電。" },
  "68000": { name: "桃園市", en: "Taoyuan City", grid: "north", role: "supply",
    plants: ["大潭電廠（燃氣，擴建後逾 7GW，全球最大燃氣電廠之一）"],
    green: "沿海陸域風電、埤塘光電",
    demand: "工業用電大戶密集（電子、物流、資料中心）",
    note: "大潭 7、8、9 號機陸續商轉後成為北部供電支柱；三接（觀塘）天然氣接收站供氣。桃園同時是資料中心投資熱區，供需兩端都在成長。" },
  "10018": { name: "新竹市", en: "Hsinchu City", grid: "north", role: "load",
    plants: ["無大型電廠"],
    green: "屋頂光電",
    demand: "竹科核心，半導體用電密度全台最高",
    note: "台積電等半導體大廠負載持續攀升；竹科用電仰賴系統調度，是「中電北送」與北部燃氣機組的主要服務對象。" },
  "10004": { name: "新竹縣", en: "Hsinchu County", grid: "north", role: "load",
    plants: ["無大型電廠"],
    green: "山區小水力、屋頂光電",
    demand: "竹科寶山、竹北 AI 園區帶動負載成長",
    note: "先進製程廠與 AI 資料中心進駐，是未來十年北部負載成長最快的區域之一。" },
  "10005": { name: "苗栗縣", en: "Miaoli County", grid: "north", role: "green",
    plants: ["通霄電廠（燃氣 ~2.7GW）", "海洋風電 Formosa 1（台灣首座離岸風場）"],
    green: "離岸風電（竹南外海）、陸域風電",
    demand: "負載中等",
    note: "台灣離岸風電發源地；通霄燃氣更新擴建後支援北部電網，苗栗外海風場持續擴建中。" },
  "66000": { name: "臺中市", en: "Taichung City", grid: "central", role: "supply",
    plants: ["台中電廠（燃煤 5.5GW，全台最大）", "台中港燃氣新機組（建置中）", "大甲溪水力群"],
    green: "海線陸域風電、光電",
    demand: "中科與精密機械用電大",
    note: "台中電廠為全台最大火力電廠，正推動增氣減煤；大甲溪流域水力（德基、青山等）具調度價值。中電北送的起點。" },
  "10008": { name: "南投縣", en: "Nantou County", grid: "central", role: "supply",
    plants: ["大觀、明潭抽蓄水力（合計 ~2.6GW，系統最大儲能）", "日月潭水力群"],
    green: "水力為主、山坡光電有限",
    demand: "負載輕",
    note: "明潭抽蓄是台灣電網最重要的「大電池」，光電滲透率提高後，抽蓄日間儲能、夜尖峰放電的角色愈發關鍵。" },
  "10007": { name: "彰化縣", en: "Changhua County", grid: "central", role: "green",
    plants: ["彰工/王功陸域風電", "大彰化離岸風場群（沃旭等，離岸風電最大聚落）"],
    green: "離岸風電重鎮：彰化外海風場群裝置容量全台第一",
    demand: "沿海工業區負載中等",
    note: "彰化外海是台灣離岸風電的核心戰場，大彰化東南/西南等風場陸續併網；綠電 CPPA 供給的主要來源地。" },
  "10009": { name: "雲林縣", en: "Yunlin County", grid: "central", role: "supply",
    plants: ["麥寮電廠（民營燃煤 1.8GW，除役時程討論中）", "允能離岸風場"],
    green: "離岸風電、地面光電",
    demand: "六輕石化園區自備電廠與大負載並存",
    note: "六輕園區用電自給比例高；允能風場與沿海光電使雲林成為中部綠電供給要角。" },
  "10002": { name: "宜蘭縣", en: "Yilan County", grid: "north", role: "green",
    plants: ["清水地熱（台灣首座商轉地熱）", "蘭陽水力"],
    green: "地熱示範重鎮、小水力",
    demand: "負載輕",
    note: "清水地熱重啟商轉是台灣地熱指標案；宜蘭利澤與仁澤等地熱案場持續開發，是基載型綠電的試金石。" },
  "10017": { name: "基隆市", en: "Keelung City", grid: "north", role: "supply",
    plants: ["協和電廠（燃油除役中，規劃改建燃氣＋四接）"],
    green: "量體小",
    demand: "港區負載",
    note: "協和轉型燃氣與第四天然氣接收站（四接）是北東電網供電穩定的關鍵工程，環評與在地溝通持續進行。" },
  "67000": { name: "臺南市", en: "Tainan City", grid: "south", role: "green",
    plants: ["曾文水力", "鹽田與滯洪池大型地面光電群"],
    green: "地面光電裝置容量全台前二；漁電共生示範區",
    demand: "南科用電快速成長（台積電先進封裝與晶圓廠）",
    note: "北門、七股鹽田光電群是台灣光電最大聚落之一；南科擴廠使台南同時是綠電供給與科技負載成長的交會點。" },
  "64000": { name: "高雄市", en: "Kaohsiung City", grid: "south", role: "supply",
    plants: ["興達電廠（燃煤退場、新燃氣機組上線）", "大林電廠（超超臨界燃煤＋燃氣）", "南部電廠（燃氣）"],
    green: "屋頂光電推動積極、高雄港區風電",
    demand: "石化、鋼鐵（中鋼）重工業負載大",
    note: "興達新燃氣機組與大林更新是南部電源轉型主軸；楠梓台積電廠區進駐後，高雄負載結構正從傳產轉向高科技。" },
  "10013": { name: "屏東縣", en: "Pingtung County", grid: "south", role: "green",
    plants: ["核三廠（2025/5 除役，機組延役議題討論中）", "大型地面光電（林邊、佳冬等）"],
    green: "光電裝置容量名列前茅；恆春陸域風電",
    demand: "負載輕，電力淨輸出",
    note: "核三除役後南部基載結構改變；屏東光電與農漁電共生持續擴大，是南電北送的綠電來源之一。" },
  "10020": { name: "嘉義市", en: "Chiayi City", grid: "south", role: "load",
    plants: ["無大型電廠"],
    green: "屋頂光電",
    demand: "都會型負載，量體小",
    note: "用電依賴嘉義縣與雲林周邊電源；市區屋頂光電滲透率逐年提高。" },
  "10010": { name: "嘉義縣", en: "Chiayi County", grid: "south", role: "green",
    plants: ["布袋鹽田光電群", "民雄/中庄光電"],
    green: "鹽田光電重鎮，地面型光電大縣",
    demand: "農業縣負載輕",
    note: "布袋鹽灘地光電是台灣最早的大型地面光電聚落之一；嘉義科學園區進駐後負載將逐步成長。" },
  "10014": { name: "臺東縣", en: "Taitung County", grid: "east", role: "green",
    plants: ["知本光電（原規劃）、卑南小水力"],
    green: "地熱潛能區（知本、金崙）、光電",
    demand: "負載輕，電網末端",
    note: "台東位處電網末端，強化電網韌性計畫重點區；金崙地熱等案場開發中，具基載綠電潛力。" },
  "10015": { name: "花蓮縣", en: "Hualien County", grid: "east", role: "supply",
    plants: ["和平電廠（民營燃煤 1.3GW）", "東部水力群（立霧、碧海等）"],
    green: "水力資源豐富、光電起步",
    demand: "水泥產業負載（台泥、亞泥）",
    note: "和平電廠供應東部與北送；花蓮水力與規劃中的抽蓄計畫是東部電網韌性的核心。0403 地震後電網強化投資加速。" },
  "10016": { name: "澎湖縣", en: "Penghu County", grid: "islands", role: "islands",
    plants: ["尖山電廠（柴油）"],
    green: "中屯/湖西風電、光電；低碳島計畫",
    demand: "夏季觀光尖峰明顯",
    note: "澎湖以柴油機組為主力、風光為輔；台澎海纜計畫若完成，將改變離島供電結構並可回送綠電。" },
  "09020": { name: "金門縣", en: "Kinmen County", grid: "islands", role: "islands",
    plants: ["塔山電廠（柴油）"],
    green: "光電、儲能示範（金門智慧電網）",
    demand: "獨立電網",
    note: "金門是台灣智慧電網與儲能示範島，柴油＋光電＋大型電池的獨立系統運轉經驗，是離島與微電網輸出的參考案例。" },
  "09007": { name: "連江縣", en: "Lienchiang County", grid: "islands", role: "islands",
    plants: ["珠山電廠（柴油）"],
    green: "光電小量",
    demand: "獨立電網，量體最小",
    note: "馬祖各島以柴油機組獨立供電，離島再生能源與儲能佈建持續推動中。" }
};

/* 分區供需概況（台電供電區域） */
const TW_REGIONS = {
  north:   { name: "北部電網", share: "負載約 40%", balance: "供不應求", flow: "依賴中電北送（經峽谷輸電走廊）",
             detail: "核一二除役、協和轉型中，大潭燃氣為主力；科技業與資料中心負載持續成長，區域供需最緊。" },
  central: { name: "中部電網", share: "負載約 30%", balance: "供過於求", flow: "中電北送主要輸出區",
             detail: "台中電廠與麥寮支撐基載，彰化離岸風電群併網後綠電占比快速上升，抽蓄水力提供調度彈性。" },
  south:   { name: "南部電網", share: "負載約 30%", balance: "供過於求 → 趨於平衡", flow: "南電中送/北送",
             detail: "核三除役後餘裕縮小；興達與大林燃氣更新、光電大量併網，台積電高雄與台南擴廠使負載快速成長。" },
  east:    { name: "東部電網", share: "負載約 2%", balance: "自給有餘",  flow: "和平電廠北送",
             detail: "水力與和平燃煤為主，電網韌性（雙迴路、儲能）是投資重點。" },
  islands: { name: "離島電網", share: "獨立系統", balance: "獨立供電", flow: "柴油為主＋風光儲",
             detail: "澎湖、金門、馬祖各自獨立運轉；低碳島與海纜計畫推動中。" }
};

const TW_ROLE_LABEL = {
  supply: "電源重鎮", balanced: "供需並重", load: "負載中心",
  green: "綠能重鎮", islands: "獨立電網"
};
