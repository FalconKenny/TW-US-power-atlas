/* 台美電力資源藍圖 — 台灣縣市互動地圖
   資料：taiwan-atlas counties-mercator（預投影 480×600），本地 vendor 檔，無需外部連線。
   互動：游標移入縣市 → 浮框顯示電價與電力資源；點擊 → 側欄完整檔案。 */
(function () {
  const mount = document.getElementById("twmapBox");
  if (!mount || typeof d3 === "undefined" || typeof topojson === "undefined") return;

  const ROLE_COLOR = {
    supply:  "#3F86C8",  // 電源重鎮：亮藍
    green:   "#3FA66A",  // 綠能重鎮：綠
    load:    "#8E6FC0",  // 負載中心：紫
    balanced:"#2C6EA8",
    islands: "#4F6B5C"
  };

  function buildSelector() {
    const sel = document.getElementById("twSelect");
    if (!sel) return;
    const opts = Object.entries(TW_COUNTIES)
      .sort((a, b) => a[1].name.localeCompare(b[1].name, "zh-Hant"))
      .map(([code, c]) => `<option value="${code}">${c.name}（${c.en}）</option>`).join("");
    sel.innerHTML = `<option value="">— 選擇縣市 —</option>` + opts;
    sel.addEventListener("change", () => { if (sel.value) showCounty(sel.value); });
  }

  window.showCounty = function (code) {
    const panel = document.getElementById("twPanel");
    const c = TW_COUNTIES[code];
    document.querySelectorAll("#twmap .region.selected").forEach(el => el.classList.remove("selected"));
    const pathEl = document.querySelector(`#twmap .region[data-code="${code}"]`);
    if (pathEl) pathEl.classList.add("selected");
    if (!c || !panel) return;
    const region = TW_REGIONS[c.grid] || TW_REGIONS.islands;
    panel.innerHTML = `
      <p class="coord">${c.en.toUpperCase()} · COUNTY POWER PROFILE</p>
      <h3>${c.name}</h3>
      <p class="en-name">${TW_ROLE_LABEL[c.role] || ""} · ${region.name}</p>
      <div class="kv">
        <div class="cell"><small>全國平均電價</small><b>NT$ ${TW_NATIONAL.avgTariff.toFixed(2)}</b><small>／度（台電統一費率）</small></div>
        <div class="cell amber"><small>產業用電平均</small><b>NT$ ${TW_NATIONAL.industrialTariff.toFixed(2)}</b><small>／度</small></div>
      </div>
      <ul>
        ${c.plants.map(p => `<li>${p}</li>`).join("")}
        <li><b>綠電資源：</b>${c.green}</li>
        <li><b>用電特性：</b>${c.demand}</li>
      </ul>
      <div class="chip-row">
        <span class="chip">${region.name}</span>
        <span class="chip ${region.balance.includes("不") ? "red" : "green"}">${region.balance}</span>
        <span class="chip amber">${region.flow}</span>
      </div>
      <p style="font-size:14px;color:#33463B;margin-top:12px">${c.note}</p>
      <p class="notice" style="margin-top:12px">來源：台電、經濟部能源署公開資料整理</p>`;
  };

  d3.json("assets/vendor/taiwan-counties.json").then(tw => {
    const counties = topojson.feature(tw, tw.objects.counties);
    const svg = d3.select(mount).append("svg")
      .attr("id", "twmap").attr("viewBox", "0 0 480 600")
      .attr("role", "img").attr("aria-label", "台灣縣市互動電力地圖");

    const tip = document.getElementById("twTip");
    const geoPath = d3.geoPath(); // 已預投影

    svg.append("g").selectAll("path")
      .data(counties.features).join("path")
      .attr("d", geoPath)
      .attr("class", "region")
      .attr("data-code", d => d.properties.COUNTYCODE)
      .attr("fill", d => {
        const c = TW_COUNTIES[d.properties.COUNTYCODE];
        return c ? ROLE_COLOR[c.role] || "#1E6047" : "#0F3527";
      })
      .on("mousemove", function (event, d) {
        const code = d.properties.COUNTYCODE;
        const c = TW_COUNTIES[code];
        if (!c) { tip.style.opacity = 0; return; }
        const region = TW_REGIONS[c.grid] || TW_REGIONS.islands;
        tip.innerHTML = `
          <div class="t-name">${c.name}</div>
          <div class="t-en">${c.en}</div>
          ${PA_tipRow("平均電價（全國）", "NT$ " + TW_NATIONAL.avgTariff.toFixed(2) + "／度")}
          ${PA_tipRow("產業電價（全國）", "NT$ " + TW_NATIONAL.industrialTariff.toFixed(2) + "／度")}
          ${PA_tipRow("電力角色", TW_ROLE_LABEL[c.role] || "—")}
          ${PA_tipRow("區域供需", region.balance, region.balance.includes("不") ? "" : "t-green")}
          ${PA_tipRow("綠電資源", c.green.length > 13 ? c.green.slice(0, 12) + "…" : c.green, "t-green")}
          <div class="t-hint">點擊查看完整電力檔案 →</div>`;
        tip.style.opacity = 1;
      })
      .on("mouseleave", () => { tip.style.opacity = 0; })
      .on("click", (event, d) => {
        showCounty(d.properties.COUNTYCODE);
        document.getElementById("twPanel")?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      });

    /* 主要縣市標籤 */
    const LABELS = ["63000","65000","68000","66000","67000","64000","10007","10013","10015"];
    svg.append("g").selectAll("text")
      .data(counties.features.filter(d => LABELS.includes(d.properties.COUNTYCODE))).join("text")
      .attr("class", "region-label")
      .attr("transform", d => `translate(${geoPath.centroid(d)})`)
      .attr("font-size", 9)
      .text(d => (TW_COUNTIES[d.properties.COUNTYCODE] || {}).name || "");

    PA_bindTip(mount, tip);
    buildSelector();
    showCounty("68000"); // 預設：桃園（北部供電支柱）
  }).catch(() => {
    mount.innerHTML = `<p style="color:#C4D6C8;font-size:14px;padding:20px">台灣地圖載入失敗，請改用右側選單選擇縣市。</p>`;
    buildSelector();
  });
})();
