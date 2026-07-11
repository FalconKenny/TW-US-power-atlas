/* 台美電力資源藍圖 — 美國州級互動地圖
   資料：us-atlas states-albers-10m（預投影 975×610），本地 vendor 檔。
   著色模式：住宅電價 / 工業電價 / 綠電占比（可切換）。
   互動：游標移入 → 浮框顯示電價與綠電；點擊 → 側欄州電力檔案。 */
(function () {
  const mount = document.getElementById("usmapBox");
  if (!mount || typeof d3 === "undefined" || typeof topojson === "undefined") return;

  let mode = "rPrice"; // rPrice | iPrice | ren
  const MODES = {
    rPrice: { label: "住宅電價", unit: "¢/kWh", domain: [10, 34],
      scale: d3.interpolateRgbBasis(["#2C7A4B", "#E3B94F", "#C94F4F"]) },
    iPrice: { label: "工業電價", unit: "¢/kWh", domain: [6, 24],
      scale: d3.interpolateRgbBasis(["#2C7A4B", "#E3B94F", "#C94F4F"]) },
    ren:    { label: "綠電占比", unit: "%", domain: [0, 100],
      scale: d3.interpolateRgbBasis(["#0F3527", "#0E9E86", "#3FA66A"]) }
  };
  let paths = null, tip = null;

  function color(fips) {
    const s = US_STATES[fips];
    if (!s) return "#0F3527";
    const m = MODES[mode];
    const v = s[mode];
    const t = Math.max(0, Math.min(1, (v - m.domain[0]) / (m.domain[1] - m.domain[0])));
    return m.scale(t);
  }

  function repaint() {
    if (paths) paths.attr("fill", d => color(d.id));
    document.querySelectorAll("#usModeTabs .cat-tab").forEach(b =>
      b.classList.toggle("active", b.dataset.mode === mode));
    const m = MODES[mode];
    const lg = document.getElementById("usLegend");
    if (lg) {
      const stops = d3.range(0, 1.01, 0.1).map(t => m.scale(t)).join(",");
      lg.innerHTML = `
        <span class="legend-cap">${m.domain[0]} ${m.unit}</span>
        <span class="legend-bar" style="background:linear-gradient(90deg,${stops})"></span>
        <span class="legend-cap">${m.domain[1]}+ ${m.unit}</span>
        <span class="legend-cap" style="margin-left:10px">著色：${m.label}</span>`;
    }
  }

  window.PA_setUsMode = function (m) { mode = m; repaint(); };

  function buildSelector() {
    const sel = document.getElementById("usSelect");
    if (!sel) return;
    const opts = Object.entries(US_STATES)
      .sort((a, b) => a[1].en.localeCompare(b[1].en))
      .map(([f, s]) => `<option value="${f}">${s.name}（${s.en}）</option>`).join("");
    sel.innerHTML = `<option value="">— 選擇州別 —</option>` + opts;
    sel.addEventListener("change", () => { if (sel.value) showUsState(sel.value); });
  }

  window.showUsState = function (fips) {
    const panel = document.getElementById("usPanel");
    const s = US_STATES[fips];
    document.querySelectorAll("#usmap .region.selected").forEach(el => el.classList.remove("selected"));
    const pathEl = document.querySelector(`#usmap .region[data-fips="${fips}"]`);
    if (pathEl) pathEl.classList.add("selected");
    if (!s || !panel) return;
    panel.innerHTML = `
      <p class="coord">${s.abbr} · ${s.en.toUpperCase()} · STATE POWER PROFILE</p>
      <h3>${s.name}</h3>
      <p class="en-name">${s.grid}</p>
      <div class="kv">
        <div class="cell"><small>住宅電價（2025 約值）</small><b>${s.rPrice.toFixed(1)}¢</b><small>／kWh ≈ NT$ ${(s.rPrice * 0.32).toFixed(2)}／度</small></div>
        <div class="cell amber"><small>工業電價（2025 約值）</small><b>${s.iPrice.toFixed(1)}¢</b><small>／kWh ≈ NT$ ${(s.iPrice * 0.32).toFixed(2)}／度</small></div>
        <div class="cell green"><small>綠電占比（含水力）</small><b>${s.ren}%</b><small>發電量占比</small></div>
        <div class="cell"><small>主要電源</small><b style="font-size:13.5px;line-height:1.5">${s.main}</b></div>
      </div>
      <div class="chip-row"><span class="chip">台灣供應鏈連結重點</span></div>
      <p style="font-size:14px;color:#33463B;margin-top:10px">${s.tw}</p>
      <p class="notice" style="margin-top:12px">來源：EIA State Electricity Profiles、各州電力公司</p>`;
  };

  d3.json("assets/vendor/states-albers-10m.json").then(us => {
    const states = topojson.feature(us, us.objects.states);
    const svg = d3.select(mount).append("svg")
      .attr("id", "usmap").attr("viewBox", "0 0 975 610")
      .attr("role", "img").attr("aria-label", "美國各州互動電力地圖");

    tip = document.getElementById("usTip");
    const geoPath = d3.geoPath();

    paths = svg.append("g").selectAll("path")
      .data(states.features).join("path")
      .attr("d", geoPath)
      .attr("class", "region")
      .attr("data-fips", d => d.id)
      .on("mousemove", function (event, d) {
        const s = US_STATES[d.id];
        if (!s) { tip.style.opacity = 0; return; }
        tip.innerHTML = `
          <div class="t-name">${s.name} <span class="mono" style="font-size:11px;color:#5C6E62">${s.abbr}</span></div>
          <div class="t-en">${s.en}</div>
          ${PA_tipRow("住宅電價", s.rPrice.toFixed(1) + " ¢/kWh")}
          ${PA_tipRow("工業電價", s.iPrice.toFixed(1) + " ¢/kWh")}
          ${PA_tipRow("綠電占比", s.ren + "%", "t-green")}
          ${PA_tipRow("電網", s.grid.split("（")[0].split("／")[0])}
          <div class="t-hint">點擊查看州電力檔案 →</div>`;
        tip.style.opacity = 1;
      })
      .on("mouseleave", () => { tip.style.opacity = 0; })
      .on("click", (event, d) => {
        showUsState(d.id);
        document.getElementById("usPanel")?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      });

    /* 州縮寫標籤（面積足夠的州） */
    svg.append("g").selectAll("text")
      .data(states.features.filter(d => geoPath.area(d) > 900)).join("text")
      .attr("class", "region-label")
      .attr("transform", d => `translate(${geoPath.centroid(d)})`)
      .attr("font-size", 10)
      .text(d => (US_STATES[d.id] || {}).abbr || "");

    PA_bindTip(mount, tip);
    buildSelector();
    repaint();
    showUsState("48"); // 預設：德州（台商赴美最熱區）
  }).catch(() => {
    mount.innerHTML = `<p style="color:#C4D6C8;font-size:14px;padding:20px">美國地圖載入失敗，請改用右側選單選擇州別。</p>`;
    buildSelector();
  });
})();
