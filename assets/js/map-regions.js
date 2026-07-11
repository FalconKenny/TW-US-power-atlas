/* 台美電力資源藍圖 — 美洲區域互動地圖（加拿大省級／中美洲／南美洲國家級）
   與美國州地圖同一套互動：hover 浮框、著色模式切換、點擊展開側欄檔案。
   各區域使用獨立容器（id 後綴 -canada / -central / -south），
   由 americas.html 的區域選項切換顯示，首次開啟時才載入（lazy init）。 */
(function () {
  if (typeof d3 === "undefined" || typeof topojson === "undefined") return;

  const RAMP_PRICE = d3.interpolateRgbBasis(["#2C7A4B", "#E3B94F", "#C94F4F"]);
  const RAMP_REN   = d3.interpolateRgbBasis(["#0F3527", "#0E9E86", "#3FA66A"]);

  const REGIONS = {
    canada: {
      topo: "assets/vendor/canada-provinces.json", object: "can",
      data: () => CA_PROVINCES,
      viewBox: [0, 0, 760, 620],
      projection: (fc, w, h) => d3.geoConicEqualArea().parallels([49, 77]).rotate([96, 0]).fitExtent([[10, 10], [w - 10, h - 10]], fc),
      defaultKey: "CA.QC",
      modes: {
        rPrice: { label: "住宅電價", unit: "¢CAD/kWh", domain: [7, 25], ramp: RAMP_PRICE, val: d => d.rPrice },
        iPrice: { label: "工業電價", unit: "¢CAD/kWh", domain: [5, 16], ramp: RAMP_PRICE, val: d => d.iPrice },
        ren:    { label: "綠電占比", unit: "%",        domain: [0, 100], ramp: RAMP_REN,  val: d => d.ren }
      },
      defaultMode: "rPrice",
      labelMin: 500,
      label: d => d.abbr,
      tip: (d) => `
        <div class="t-name">${d.name}</div>
        <div class="t-en">${d.en.toUpperCase()}</div>
        ${PA_tipRow("住宅電價", d.rPrice.toFixed(1) + " ¢CAD/kWh")}
        ${PA_tipRow("工業電價", d.iPrice.toFixed(1) + " ¢CAD/kWh")}
        ${PA_tipRow("綠電占比", d.ren + "%", "t-green")}
        ${PA_tipRow("電力公司", d.utility.split("（")[0])}
        <div class="t-hint">點擊展開省級電力檔案</div>`,
      panel: (d) => `
        <p class="coord">${d.abbr} · ${d.en.toUpperCase()} · PROVINCE POWER PROFILE</p>
        <h3>${d.name}</h3>
        <p class="en-name">${d.utility}</p>
        <div class="kv">
          <div class="cell"><small>住宅電價（2025 約值）</small><b>${d.rPrice.toFixed(1)}¢</b><small>CAD/kWh ≈ NT$ ${(d.rPrice * 0.23).toFixed(2)}／度</small></div>
          <div class="cell amber"><small>工業/大用戶（2025 約值）</small><b>${d.iPrice.toFixed(1)}¢</b><small>CAD/kWh ≈ NT$ ${(d.iPrice * 0.23).toFixed(2)}／度</small></div>
          <div class="cell green"><small>綠電占比（含水力）</small><b>${d.ren}%</b><small>發電量占比</small></div>
          <div class="cell"><small>主要電源</small><b style="font-size:13.5px;line-height:1.5">${d.main}</b></div>
        </div>
        <div class="chip-row"><span class="chip">台灣供應鏈連結重點</span></div>
        <p style="font-size:14px;color:#33463B;margin-top:10px">${d.tw}</p>
        <p class="notice" style="margin-top:12px">來源：${d.utility.split("（")[0]}、CER 公開資料整理（¢CAD；概算 1 CAD ≈ 23 TWD）</p>`
    },

    central: {
      topo: "assets/vendor/latam-countries.json", object: "countries",
      data: () => CENTRAL_AM,
      viewBox: [0, 0, 760, 560],
      projection: (fc, w, h) => d3.geoMercator().fitExtent([[10, 10], [w - 10, h - 10]], fc),
      defaultKey: "484",
      modes: {
        iUsd: { label: "工業電價", unit: "¢USD/kWh", domain: [4, 28], ramp: RAMP_PRICE, val: d => d.iUsd },
        ren:  { label: "綠電占比", unit: "%",        domain: [0, 100], ramp: RAMP_REN,  val: d => d.ren }
      },
      defaultMode: "iUsd",
      labelMin: 120,
      label: d => d.name,
      tip: (d) => `
        <div class="t-name">${d.name}</div>
        <div class="t-en">${d.en.toUpperCase()}</div>
        ${PA_tipRow("工業電價", d.iUsd != null ? d.iUsd.toFixed(1) + " ¢USD/kWh" : "資料有限")}
        ${PA_tipRow("綠電占比", d.ren + "%", "t-green")}
        ${PA_tipRow("主要電源", d.main.length > 14 ? d.main.slice(0, 13) + "…" : d.main)}
        <div class="t-hint">點擊展開國家電力檔案</div>`,
      panel: countryPanel("中美洲與加勒比"),
    },

    south: {
      topo: "assets/vendor/latam-countries.json", object: "countries",
      data: () => SOUTH_AM,
      viewBox: [0, 0, 640, 700],
      projection: (fc, w, h) => d3.geoMercator().fitExtent([[10, 10], [w - 10, h - 10]], fc),
      defaultKey: "076",
      modes: {
        iUsd: { label: "工業電價", unit: "¢USD/kWh", domain: [4, 26], ramp: RAMP_PRICE, val: d => d.iUsd },
        ren:  { label: "綠電占比", unit: "%",        domain: [0, 100], ramp: RAMP_REN,  val: d => d.ren }
      },
      defaultMode: "iUsd",
      labelMin: 250,
      label: d => d.name,
      tip: (d) => `
        <div class="t-name">${d.name}</div>
        <div class="t-en">${d.en.toUpperCase()}</div>
        ${PA_tipRow("工業電價", d.iUsd != null ? d.iUsd.toFixed(1) + " ¢USD/kWh" : "資料有限")}
        ${PA_tipRow("綠電占比", d.ren + "%", "t-green")}
        ${PA_tipRow("主要電源", d.main.length > 14 ? d.main.slice(0, 13) + "…" : d.main)}
        <div class="t-hint">點擊展開國家電力檔案</div>`,
      panel: countryPanel("南美洲"),
    }
  };

  function countryPanel(regionName) {
    return (d) => `
      <p class="coord">${d.en.toUpperCase()} · ${regionName} · COUNTRY POWER PROFILE</p>
      <h3>${d.name}</h3>
      <p class="en-name">${d.grid}</p>
      <div class="kv">
        <div class="cell amber"><small>工業電價（2025 約值）</small><b>${d.iUsd != null ? d.iUsd.toFixed(1) + "¢" : "—"}</b><small>${d.iUsd != null ? "USD/kWh ≈ NT$ " + (d.iUsd * 0.32).toFixed(2) + "／度" : d.price}</small></div>
        <div class="cell green"><small>綠電占比（含水力）</small><b>${d.ren}%</b><small>發電量占比</small></div>
      </div>
      <ul>
        <li><b>電價區間：</b>${d.price}</li>
        <li><b>主要電源：</b>${d.main}</li>
      </ul>
      <div class="chip-row"><span class="chip">台灣供應鏈連結重點</span></div>
      <p style="font-size:14px;color:#33463B;margin-top:10px">${d.tw}</p>
      <p class="notice" style="margin-top:12px">來源：${d.source}（¢USD；概算 1 USD ≈ 32 TWD）</p>`;
  }

  const state = {}; // key -> { mode, paths, inited }

  function color(regionKey, id) {
    const R = REGIONS[regionKey], st = state[regionKey];
    const d = R.data()[id];
    if (!d) return "#0F3527";
    const m = R.modes[st.mode];
    const v = m.val(d);
    if (v == null) return "#4F6B5C"; // 資料有限：岸線灰
    const t = Math.max(0, Math.min(1, (v - m.domain[0]) / (m.domain[1] - m.domain[0])));
    return m.ramp(t);
  }

  function repaint(regionKey) {
    const R = REGIONS[regionKey], st = state[regionKey];
    if (st.paths) st.paths.attr("fill", d => color(regionKey, String(d.id)));
    document.querySelectorAll(`#rgModeTabs-${regionKey} .cat-tab`).forEach(b =>
      b.classList.toggle("active", b.dataset.mode === st.mode));
    const m = R.modes[st.mode];
    const lg = document.getElementById(`rgLegend-${regionKey}`);
    if (lg) {
      const stops = d3.range(0, 1.01, 0.1).map(t => m.ramp(t)).join(",");
      lg.innerHTML = `
        <span class="legend-cap">${m.domain[0]} ${m.unit}</span>
        <span class="legend-bar" style="background:linear-gradient(90deg,${stops})"></span>
        <span class="legend-cap">${m.domain[1]}+ ${m.unit}</span>
        <span class="legend-cap" style="margin-left:10px">著色：${m.label}</span>`;
    }
  }

  window.PA_setRegionMode = function (regionKey, mode) {
    if (!state[regionKey]) return;
    state[regionKey].mode = mode;
    repaint(regionKey);
  };

  window.showRegionItem = function (regionKey, id) {
    const R = REGIONS[regionKey];
    const d = R.data()[id];
    const panel = document.getElementById(`rgPanel-${regionKey}`);
    document.querySelectorAll(`#rgmap-${regionKey} .region.selected`).forEach(el => el.classList.remove("selected"));
    const pathEl = document.querySelector(`#rgmap-${regionKey} .region[data-code="${id}"]`);
    if (pathEl) pathEl.classList.add("selected");
    if (!d || !panel) return;
    panel.innerHTML = R.panel(d);
  };

  function buildSelector(regionKey) {
    const R = REGIONS[regionKey];
    const sel = document.getElementById(`rgSelect-${regionKey}`);
    if (!sel) return;
    const opts = Object.entries(R.data())
      .sort((a, b) => a[1].en.localeCompare(b[1].en))
      .map(([id, d]) => `<option value="${id}">${d.name}（${d.en}）</option>`).join("");
    sel.innerHTML = `<option value="">— 選擇${regionKey === "canada" ? "省份" : "國家"} —</option>` + opts;
    sel.addEventListener("change", () => { if (sel.value) showRegionItem(regionKey, sel.value); });
  }

  window.PA_initRegionMap = function (regionKey) {
    const R = REGIONS[regionKey];
    if (!R || (state[regionKey] && state[regionKey].inited)) return;
    const mount = document.getElementById(`rgmapBox-${regionKey}`);
    if (!mount) return;
    state[regionKey] = { mode: R.defaultMode, paths: null, inited: true };

    d3.json(R.topo).then(topo => {
      const dataset = R.data();
      let fc = topojson.feature(topo, topo.objects[R.object]);
      fc = { type: "FeatureCollection",
             features: fc.features.filter(f => dataset[String(f.id)]) };

      const [x0, y0, W, H] = R.viewBox;
      const proj = R.projection(fc, W, H);
      const geoPath = d3.geoPath(proj);

      const svg = d3.select(mount).append("svg")
        .attr("id", `rgmap-${regionKey}`).attr("viewBox", `${x0} ${y0} ${W} ${H}`)
        .attr("role", "img").attr("aria-label", "互動電力地圖");

      const tip = document.getElementById(`rgTip-${regionKey}`);

      state[regionKey].paths = svg.append("g").selectAll("path")
        .data(fc.features).join("path")
        .attr("class", "region")
        .attr("data-code", d => String(d.id))
        .attr("d", geoPath)
        .on("mousemove", (event, f) => {
          const d = dataset[String(f.id)];
          if (!d || !tip) return;
          tip.innerHTML = R.tip(d);
          tip.style.opacity = 1;
        })
        .on("mouseleave", () => { if (tip) tip.style.opacity = 0; })
        .on("click", (event, f) => {
          showRegionItem(regionKey, String(f.id));
          document.getElementById(`rgPanel-${regionKey}`)?.scrollIntoView({ behavior: "smooth", block: "nearest" });
        });

      /* 標籤（面積足夠者） */
      svg.append("g").selectAll("text")
        .data(fc.features.filter(f => geoPath.area(f) > R.labelMin)).join("text")
        .attr("class", "region-label")
        .attr("transform", f => `translate(${geoPath.centroid(f)})`)
        .attr("font-size", regionKey === "canada" ? 11 : 10)
        .text(f => R.label(dataset[String(f.id)]));

      if (tip) PA_bindTip(mount, tip);
      buildSelector(regionKey);
      repaint(regionKey);
      showRegionItem(regionKey, R.defaultKey);
    }).catch(() => {
      mount.innerHTML = `<p style="color:#C4D6C8;font-size:14px;padding:20px">地圖載入失敗，請改用右側選單選擇。</p>`;
    });
  };

  /* 區域切換：顯示對應區塊並 lazy init 地圖 */
  window.PA_setAmRegion = function (regionKey) {
    document.querySelectorAll(".am-region").forEach(el =>
      el.style.display = el.dataset.region === regionKey ? "" : "none");
    document.querySelectorAll("#amRegionTabs .cat-tab").forEach(b =>
      b.classList.toggle("active", b.dataset.region === regionKey));
    if (regionKey !== "us") PA_initRegionMap(regionKey);
    const target = document.querySelector(`.am-region[data-region="${regionKey}"]`);
    if (target && window.__amRegionScrolled && typeof target.scrollIntoView === "function")
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    window.__amRegionScrolled = true;
  };
})();
