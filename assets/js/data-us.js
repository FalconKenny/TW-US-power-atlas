/* ============================================================
   台美電力資源藍圖 — 美國各州＋美洲國家電力資料
   來源：U.S. EIA（Electric Power Monthly、State Electricity
   Profiles）、DOE、FERC、各州電力公司公開資料；美洲國家為
   各國能源部/電力公司與 IEA 公開統計整理。
   價格為 2025 年約值（美分/度 ¢/kWh），供趨勢比較參考，
   實際以 EIA 與各電力公司公告為準。最後整理：2026-07
   key = 州 FIPS（states-albers-10m.json feature id）
   ============================================================ */

const US_NATIONAL = {
  avgResidential: 17.5, avgCommercial: 13.8, avgIndustrial: 8.9, // ¢/kWh 2025 約值
  peakLoad: "夏季尖峰約 740+ GW（Lower 48）",
  mix2025: { gas: 42, coal: 15, nuclear: 18, wind: 11, solar: 7, hydro: 5.5, others: 1.5 },
  source: "EIA Electric Power Monthly（2025 年約值）"
};

/* rPrice=住宅電價 iPrice=工業電價（¢/kWh, 2025 約值）
   ren=再生能源發電占比%（含水力, 約值） grid=電網/調度機構
   main=主要電源 tw=台商佈局重點備註 */
const US_STATES = {
  "01": { name: "阿拉巴馬州", en: "Alabama", abbr: "AL", rPrice: 15.6, iPrice: 7.4, ren: 12, grid: "Southern Co.（垂直整合）", main: "核能、燃氣、水力", tw: "電價低且供電穩定，汽車與鋼鐵供應鏈聚落；適合高用電製造。" },
  "02": { name: "阿拉斯加州", en: "Alaska", abbr: "AK", rPrice: 25.2, iPrice: 17.8, ren: 33, grid: "獨立系統（Railbelt）", main: "燃氣、水力", tw: "電網孤立、電價高，不利大型製造佈局。" },
  "04": { name: "亞利桑那州", en: "Arizona", abbr: "AZ", rPrice: 15.8, iPrice: 7.9, ren: 17, grid: "WECC／APS、SRP、TEP", main: "核能（Palo Verde 全美最大）、燃氣、太陽能", tw: "台積電鳳凰城廠所在州；Palo Verde 核電＋快速成長的光儲，惟高溫尖峰與水資源是議題。半導體聚落用電需求爆發成長。" },
  "05": { name: "阿肯色州", en: "Arkansas", abbr: "AR", rPrice: 12.6, iPrice: 6.9, ren: 11, grid: "MISO／Entergy", main: "燃氣、核能、燃煤", tw: "電價全美最低群，鋼鐵（大河鋼廠）與資料中心開始進駐。" },
  "06": { name: "加利福尼亞州", en: "California", abbr: "CA", rPrice: 32.5, iPrice: 22.4, ren: 54, grid: "CAISO", main: "太陽能、燃氣、水力、核能（Diablo Canyon）", tw: "綠電占比與電價皆全美最高群；光電＋儲能全美第一，NEM 3.0 後屋頂光電轉向搭配儲能。電價高昂使製造外移，但綠電採購與 RE100 履約容易。" },
  "08": { name: "科羅拉多州", en: "Colorado", abbr: "CO", rPrice: 15.4, iPrice: 8.2, ren: 42, grid: "WECC／Xcel Energy", main: "風電、燃氣、燃煤（退場中）", tw: "風電成長快、量子與航太聚落；Xcel 2050 淨零路徑明確。" },
  "09": { name: "康乃狄克州", en: "Connecticut", abbr: "CT", rPrice: 33.1, iPrice: 17.5, ren: 8, grid: "ISO-NE", main: "核能（Millstone）、燃氣", tw: "電價全美前三高，不利高用電製造；潛艦與航太供應鏈為主。" },
  "10": { name: "德拉瓦州", en: "Delaware", abbr: "DE", rPrice: 16.3, iPrice: 9.5, ren: 6, grid: "PJM", main: "燃氣", tw: "小州、負載輕，企業註冊地功能大於製造。" },
  "11": { name: "華盛頓特區", en: "District of Columbia", abbr: "DC", rPrice: 17.8, iPrice: 12.1, ren: 12, grid: "PJM", main: "外部輸入為主", tw: "政策與遊說中樞；DOE、FERC 所在地。" },
  "12": { name: "佛羅里達州", en: "Florida", abbr: "FL", rPrice: 15.1, iPrice: 9.2, ren: 9, grid: "FRCC／FPL、Duke", main: "燃氣（占比全美最高群）、核能、太陽能", tw: "FPL 大規模光電建設中；人口成長帶動負載，惟颶風韌性是供電風險。" },
  "13": { name: "喬治亞州", en: "Georgia", abbr: "GA", rPrice: 14.3, iPrice: 7.6, ren: 12, grid: "Southern Co.／Georgia Power", main: "核能（Vogtle 3、4 新機組）、燃氣、太陽能", tw: "Vogtle 新核電機組全數商轉，供電結構全美最年輕；SK、現代帶動電動車電池聚落，資料中心負載暴增，Georgia Power 已上修長期負載預測數倍。" },
  "15": { name: "夏威夷州", en: "Hawaii", abbr: "HI", rPrice: 41.0, iPrice: 35.5, ren: 32, grid: "HECO（獨立島嶼系統）", main: "燃油、太陽能", tw: "全美最高電價；島嶼獨立系統，僅適合輕負載據點。" },
  "16": { name: "愛達荷州", en: "Idaho", abbr: "ID", rPrice: 11.6, iPrice: 7.2, ren: 75, grid: "WECC／Idaho Power", main: "水力為主", tw: "水電低價州，美光（Micron）總部擴廠；綠電比例高、電價低，半導體材料鏈可關注。" },
  "17": { name: "伊利諾州", en: "Illinois", abbr: "IL", rPrice: 16.8, iPrice: 9.8, ren: 13, grid: "PJM／MISO", main: "核能（全美最大核電州）、風電", tw: "核電占比逾五成、碳排低；芝加哥物流樞紐，CME 資料中心聚落。" },
  "18": { name: "印第安納州", en: "Indiana", abbr: "IN", rPrice: 15.5, iPrice: 9.0, ren: 12, grid: "MISO", main: "燃煤（轉型中）、燃氣、風電", tw: "製造業大州，SK 海力士先進封裝廠進駐普渡園區；電價中等。" },
  "19": { name: "愛荷華州", en: "Iowa", abbr: "IA", rPrice: 13.4, iPrice: 7.8, ren: 66, grid: "MISO／MidAmerican", main: "風電（占比全美第一）", tw: "風電占比近三分之二，Google、Meta、微軟資料中心因綠電群聚；適合綠電敏感型佈局。" },
  "20": { name: "堪薩斯州", en: "Kansas", abbr: "KS", rPrice: 13.9, iPrice: 8.0, ren: 51, grid: "SPP", main: "風電、核能、燃煤", tw: "風電過半；松下電池廠（De Soto）進駐帶動供應鏈。" },
  "21": { name: "肯塔基州", en: "Kentucky", abbr: "KY", rPrice: 13.0, iPrice: 7.3, ren: 7, grid: "MISO/PJM／LG&E-KU", main: "燃煤為主（轉型中）", tw: "低電價傳統煤電州；福特 BlueOval SK 電池園區為最大投資案。" },
  "22": { name: "路易斯安那州", en: "Louisiana", abbr: "LA", rPrice: 12.1, iPrice: 6.8, ren: 4, grid: "MISO／Entergy", main: "燃氣（LNG 出口重鎮）", tw: "全美最低工業電價群；LNG 與石化聚落，Meta 超大 AI 資料中心落地。" },
  "23": { name: "緬因州", en: "Maine", abbr: "ME", rPrice: 27.0, iPrice: 13.5, ren: 72, grid: "ISO-NE", main: "水力、風電、生質能", tw: "綠電比例高但電價高、腹地小。" },
  "24": { name: "馬里蘭州", en: "Maryland", abbr: "MD", rPrice: 18.4, iPrice: 10.2, ren: 12, grid: "PJM", main: "核能、燃氣", tw: "鄰近華府；生技與網安聚落，電力淨輸入州。" },
  "25": { name: "麻薩諸塞州", en: "Massachusetts", abbr: "MA", rPrice: 31.5, iPrice: 17.0, ren: 16, grid: "ISO-NE", main: "燃氣、太陽能、離岸風電（Vineyard Wind）", tw: "美國離岸風電先行州；電價高，適合研發而非量產基地。" },
  "26": { name: "密西根州", en: "Michigan", abbr: "MI", rPrice: 19.2, iPrice: 9.4, ren: 14, grid: "MISO", main: "燃氣、核能（Palisades 重啟）、風電", tw: "Palisades 成為全美首座重啟核電廠；汽車供應鏈核心州。" },
  "27": { name: "明尼蘇達州", en: "Minnesota", abbr: "MN", rPrice: 14.8, iPrice: 9.0, ren: 34, grid: "MISO／Xcel", main: "風電、核能、燃煤退場", tw: "醫材聚落（美敦力）；風電成長穩定。" },
  "28": { name: "密西西比州", en: "Mississippi", abbr: "MS", rPrice: 13.5, iPrice: 7.2, ren: 4, grid: "MISO／Entergy", main: "燃氣、核能", tw: "低電價；AWS 大型資料中心投資落地。" },
  "29": { name: "密蘇里州", en: "Missouri", abbr: "MO", rPrice: 12.4, iPrice: 8.1, ren: 13, grid: "MISO/SPP／Ameren", main: "燃煤、核能、風電", tw: "低電價中西部樞紐；波音防務製造基地。" },
  "30": { name: "蒙大拿州", en: "Montana", abbr: "MT", rPrice: 12.3, iPrice: 6.9, ren: 52, grid: "WECC", main: "水力、燃煤、風電", tw: "水電資源豐富、負載輕。" },
  "31": { name: "內布拉斯加州", en: "Nebraska", abbr: "NE", rPrice: 11.8, iPrice: 7.6, ren: 34, grid: "SPP（全州公有電力）", main: "風電、燃煤、核能", tw: "全美唯一全公有電力州，價格穩定；Google/Meta 資料中心進駐。" },
  "32": { name: "內華達州", en: "Nevada", abbr: "NV", rPrice: 16.5, iPrice: 8.4, ren: 40, grid: "WECC／NV Energy", main: "太陽能、地熱（全美第二）、燃氣", tw: "Tesla Gigafactory 與鋰礦鏈；光電＋地熱＋儲能成長快，Switch 等資料中心聚落。" },
  "33": { name: "新罕布夏州", en: "New Hampshire", abbr: "NH", rPrice: 29.4, iPrice: 15.8, ren: 18, grid: "ISO-NE", main: "核能（Seabrook）、燃氣", tw: "電價高、市場小。" },
  "34": { name: "紐澤西州", en: "New Jersey", abbr: "NJ", rPrice: 19.5, iPrice: 12.0, ren: 10, grid: "PJM", main: "核能、燃氣、太陽能", tw: "港口物流與製藥；離岸風電計畫波折多。" },
  "35": { name: "新墨西哥州", en: "New Mexico", abbr: "NM", rPrice: 14.9, iPrice: 7.0, ren: 45, grid: "WECC／PNM", main: "風電、太陽能、燃氣", tw: "英特爾 Rio Rancho 封裝擴廠；風光資源優、工業電價低。" },
  "36": { name: "紐約州", en: "New York", abbr: "NY", rPrice: 25.6, iPrice: 10.5, ren: 30, grid: "NYISO", main: "水力（尼加拉）、核能、燃氣", tw: "GlobalFoundries 與美光（Clay 新廠）帶動上州半導體走廊；上州水電便宜、下州電價高，區位選擇差異大。" },
  "37": { name: "北卡羅來納州", en: "North Carolina", abbr: "NC", rPrice: 14.6, iPrice: 7.7, ren: 16, grid: "Duke Energy（垂直整合）", main: "核能、燃氣、太陽能（東岸光電大州）", tw: "Wolfspeed SiC、豐田電池廠；研究三角園區資料中心與生技聚落，Duke 供電品質佳。" },
  "38": { name: "北達科他州", en: "North Dakota", abbr: "ND", rPrice: 11.2, iPrice: 8.2, ren: 40, grid: "MISO/SPP", main: "燃煤、風電", tw: "全美最低住宅電價群；地廣人稀。" },
  "39": { name: "俄亥俄州", en: "Ohio", abbr: "OH", rPrice: 16.4, iPrice: 8.3, ren: 5, grid: "PJM", main: "燃氣、核能、燃煤", tw: "英特爾 New Albany 晶圓廠（延後至 2030 年代初）與 Honda-LG 電池廠；PJM 容量價格飆漲反映資料中心負載壓力，長約鎖價是佈局關鍵。" },
  "40": { name: "奧克拉荷馬州", en: "Oklahoma", abbr: "OK", rPrice: 12.2, iPrice: 6.6, ren: 46, grid: "SPP", main: "風電、燃氣", tw: "風電近半、工業電價全美最低群；Google 資料中心與航太 MRO 聚落。" },
  "41": { name: "俄勒岡州", en: "Oregon", abbr: "OR", rPrice: 13.2, iPrice: 7.9, ren: 62, grid: "WECC／PGE、PacifiCorp", main: "水力為主、風電", tw: "英特爾最大研發基地（Hillsboro）；水電綠電豐富，惟新增負載排隊併網變長。" },
  "42": { name: "賓夕法尼亞州", en: "Pennsylvania", abbr: "PA", rPrice: 18.1, iPrice: 8.8, ren: 5, grid: "PJM", main: "燃氣（Marcellus 頁岩氣）、核能", tw: "三哩島核電廠更名重啟供微軟資料中心；燃氣資源豐、AI 資料中心投資湧入。" },
  "44": { name: "羅德島州", en: "Rhode Island", abbr: "RI", rPrice: 32.2, iPrice: 18.5, ren: 12, grid: "ISO-NE", main: "燃氣、離岸風電", tw: "電價高、市場小。" },
  "45": { name: "南卡羅來納州", en: "South Carolina", abbr: "SC", rPrice: 15.0, iPrice: 7.3, ren: 8, grid: "Santee Cooper/Dominion", main: "核能（占比逾五成）、燃氣", tw: "BMW、博世聚落；Scout Motors 電動車廠、核電基載充足。" },
  "46": { name: "南達科他州", en: "South Dakota", abbr: "SD", rPrice: 12.8, iPrice: 8.5, ren: 84, grid: "SPP/MISO", main: "水力、風電（合計逾八成）", tw: "綠電占比全美第一群；負載小。" },
  "47": { name: "田納西州", en: "Tennessee", abbr: "TN", rPrice: 12.9, iPrice: 7.0, ren: 13, grid: "TVA（聯邦電力局）", main: "核能、水力、燃氣", tw: "TVA 供電價格低且穩定；福特 BlueOval City 電動車城、台灣PCB 與電子組裝聚落快速成形，Xai 孟菲斯資料中心用電議題受矚目。" },
  "48": { name: "德克薩斯州", en: "Texas", abbr: "TX", rPrice: 15.2, iPrice: 6.9, ren: 32, grid: "ERCOT（獨立電網）", main: "燃氣、風電（總量全美第一）、太陽能（成長全美最快）", tw: "台商赴美最大熱區之一：三星泰勒廠、特斯拉、鴻海休士頓 AI 伺服器廠。ERCOT 獨立電網＋電力自由市場，電價低但價格波動大（2021 冬storm 教訓），大負載需搭配儲能與長約避險；光儲併網速度全美最快。" },
  "49": { name: "猶他州", en: "Utah", abbr: "UT", rPrice: 11.9, iPrice: 7.1, ren: 16, grid: "WECC／Rocky Mountain Power", main: "燃煤（轉型）、燃氣、太陽能、地熱", tw: "德州儀器 Lehi 廠；Fervo 先進地熱示範全美矚目，低電價州。" },
  "50": { name: "佛蒙特州", en: "Vermont", abbr: "VT", rPrice: 22.3, iPrice: 12.4, ren: 99, grid: "ISO-NE", main: "水力（含加拿大進口）、太陽能", tw: "州內發電近全綠，GlobalFoundries Fab 9 所在地，惟量體小。" },
  "51": { name: "維吉尼亞州", en: "Virginia", abbr: "VA", rPrice: 15.3, iPrice: 8.6, ren: 12, grid: "PJM／Dominion", main: "燃氣、核能、離岸風電（CVOW 建置中）", tw: "全球資料中心之都（北維州 Data Center Alley）；Dominion 負載預測倍增，離岸風電與 SMR 計畫並進。電力取得排程已成資料中心落地最大瓶頸。" },
  "53": { name: "華盛頓州", en: "Washington", abbr: "WA", rPrice: 11.9, iPrice: 6.7, ren: 76, grid: "WECC／BPA", main: "水力（全美最大）、核能、風電", tw: "全美最便宜綠電：哥倫比亞河水電系統；波音、微軟、亞馬遜總部，鋁業回流與氫能示範受青睞。" },
  "54": { name: "西維吉尼亞州", en: "West Virginia", abbr: "WV", rPrice: 14.7, iPrice: 7.8, ren: 6, grid: "PJM", main: "燃煤為主", tw: "煤電州轉型中，Form Energy 長時儲能工廠象徵轉型。" },
  "55": { name: "威斯康辛州", en: "Wisconsin", abbr: "WI", rPrice: 17.5, iPrice: 9.3, ren: 12, grid: "MISO", main: "燃氣、燃煤、核能", tw: "微軟於 Mount Pleasant（原鴻海園區）建置巨型 AI 資料中心；製造業基底厚。" },
  "56": { name: "懷俄明州", en: "Wyoming", abbr: "WY", rPrice: 11.7, iPrice: 7.5, ren: 24, grid: "WECC", main: "燃煤、風電", tw: "TerraPower Natrium 新型核電示範廠（比爾蓋茲投資）所在州。" }
};

/* 美洲其他重點國家（國家層級） */
const AMERICAS_COUNTRIES = [
  { id: "124", iso: "CAN", name: "加拿大", en: "Canada", price: "住宅約 10–18 ¢CAD/度（各省差異大）", ren: 68,
    main: "水力（魁北克、卑詩近 90–95%）、核能（安大略）",
    note: "魁北克水電是北美最便宜綠電之一，吸引鋁業、電池（Northvolt 案暫緩）與 AI 資料中心；安大略以核能為基載並推動 SMR。台商可關注水電富餘省份的綠電長約。",
    source: "Hydro-Québec、加拿大統計局" },
  { id: "484", iso: "MEX", name: "墨西哥", en: "Mexico", price: "工業約 10–15 ¢USD/度（CFE，時段差異大）", ren: 22,
    main: "燃氣（依賴美國進口）、水力、風光",
    note: "近岸外包（Nearshoring）最大熱區：Monterrey 周邊台商電子聚落成形，但北部電網供電吃緊、CFE 併網排程長，自建光儲與備援是佈局必修課。",
    source: "CFE、SENER" },
  { id: "076", iso: "BRA", name: "巴西", en: "Brazil", price: "工業約 12–16 ¢USD/度", ren: 89,
    main: "水力（過半）、風電、太陽能（成長快）",
    note: "全球最綠的大型電網之一；東北部風光資源帶動綠氫走廊規劃。電子製造集中瑪瑙斯自由區，電價與稅制是評估重點。",
    source: "ONS、ANEEL" },
  { id: "152", iso: "CHL", name: "智利", en: "Chile", price: "工業約 12–15 ¢USD/度", ren: 68,
    main: "太陽能（阿塔卡馬沙漠）、水力、風電",
    note: "全球太陽能資源最佳區之一，鋰礦與綠氫戰略地；北部礦業用電龐大，HVDC 南北大動脈 Kimal–Lo Aguirre 建設中。",
    source: "CNE、Coordinador Eléctrico" },
  { id: "032", iso: "ARG", name: "阿根廷", en: "Argentina", price: "工業約 8–12 ¢USD/度（補貼調整中）", ren: 42,
    main: "燃氣（Vaca Muerta 頁岩氣）、水力、核能、風電",
    note: "Vaca Muerta 頁岩氣開發加速能源出口；巴塔哥尼亞風場資源優異，鋰三角資源鏈可關注。",
    source: "CAMMESA、能源秘書處" },
  { id: "170", iso: "COL", name: "哥倫比亞", en: "Colombia", price: "工業約 10–14 ¢USD/度", ren: 70,
    main: "水力為主、燃氣",
    note: "水力近七成，聖嬰年枯水是供電風險；加勒比海離岸風電招標啟動。",
    source: "XM、UPME" },
  { id: "604", iso: "PER", name: "秘魯", en: "Peru", price: "工業約 8–11 ¢USD/度", ren: 60,
    main: "水力、燃氣",
    note: "銅礦供應鏈核心國；水力＋Camisea 燃氣支撐礦業負載，電價具競爭力。",
    source: "COES、MINEM" },
  { id: "188", iso: "CRI", name: "哥斯大黎加", en: "Costa Rica", price: "工業約 12–17 ¢USD/度", ren: 98,
    main: "水力、地熱、風電",
    note: "連年近 100% 再生能源發電；英特爾封測廠所在地，中美洲醫材與半導體後段聚落。",
    source: "ICE、Grupo ICE" }
];

const US_GRID_NOTES = [
  { grid: "ERCOT", area: "德州", trait: "獨立電網、能量市場（無容量市場）、價格波動大、併網最快" },
  { grid: "PJM", area: "中大西洋＋中西部 13 州", trait: "全美最大電力市場；資料中心負載暴增使容量拍賣價格飆升" },
  { grid: "CAISO", area: "加州", trait: "光儲滲透率最高；鴨子曲線與傍晚淨負載尖峰為調度核心" },
  { grid: "MISO", area: "中西部 15 州", trait: "風電大區；跨區輸電投資（Tranche 計畫）進行中" },
  { grid: "SPP", area: "中南部", trait: "風電占比屢創全球紀錄（瞬時逾 90%）" },
  { grid: "NYISO / ISO-NE", area: "紐約／新英格蘭", trait: "電價高、離岸風電與加拿大水電進口是脫碳主軸" },
  { grid: "Southeast（垂直整合）", area: "喬治亞、阿拉巴馬、卡羅來納等", trait: "無批發市場，與公用事業直接議約；供電穩定、新核電上線" },
  { grid: "WECC（非 ISO 西部）", area: "西北、山區州", trait: "水電富餘；EDAM/Markets+ 市場整合進行中" }
];
