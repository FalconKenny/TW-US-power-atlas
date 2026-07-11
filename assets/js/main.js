/* 台美電力資源藍圖 — 共用：導覽列、頁尾、工具函式 */
(function () {
  const page = location.pathname.split("/").pop() || "index.html";
  const LOGO = `<svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <circle cx="24" cy="24" r="22" fill="#0A2A21"/>
    <circle cx="24" cy="24" r="17" fill="none" stroke="#0E9E86" stroke-width="1.4" stroke-dasharray="3 4"/>
    <path d="M27 9 L18 27 h6 l-3 12 12-19 h-7 z" fill="#F0B429"/>
  </svg>`;

  const nav = document.getElementById("nav");
  if (nav) {
    nav.innerHTML = `
    <div class="nav-in">
      <a class="brand" href="index.html">${LOGO}
        <span><span class="brand-name">台美電力資源藍圖</span><br>
        <span class="brand-sub">TW–Americas Power Atlas</span></span>
      </a>
      <button class="nav-toggle" id="navToggle" aria-label="開啟選單">☰</button>
      <div class="nav-links" id="navLinks">
        <a href="index.html" ${page === "index.html" ? 'class="active"' : ""}>電力地圖</a>
        <a href="taiwan.html" ${page === "taiwan.html" ? 'class="active"' : ""}>台灣電力</a>
        <a href="americas.html" ${page === "americas.html" ? 'class="active"' : ""}>美洲電力</a>
        <a href="about.html" ${page === "about.html" ? 'class="active"' : ""}>方法與資料來源</a>
        <a href="https://falconkenny.github.io/gf-website/" title="回 Guide.Ferryman 主站">⌂ 主站</a>
        <a class="nav-cta" href="https://falconkenny.github.io/gf-website/contact.html" target="_blank" rel="noopener">預約佈局諮詢</a>
      </div>
    </div>`;
    const tg = document.getElementById("navToggle");
    tg.addEventListener("click", () => document.getElementById("navLinks").classList.toggle("open"));
  }

  const foot = document.getElementById("foot");
  if (foot) {
    foot.innerHTML = `
    <div class="foot-in">
      <div>
        <div class="foot-brand">${LOGO}
          <span><b style="color:#fff;font-family:var(--font-display)">台美電力資源藍圖</b><br>
          <span class="mono" style="font-size:10px;letter-spacing:.18em">TAIWAN–AMERICAS POWER ATLAS</span></span>
        </div>
        <p style="font-size:13.5px;max-width:34em">為赴美與赴台佈局的企業，整理台灣與美洲各地的電力資源現況（含綠電）、每週供需與兩年電價趨勢。資料整理自台電、美國 EIA／DOE／FERC 與各電力公司公開資訊，供決策參考。</p>
      </div>
      <div>
        <h4>網站地圖</h4>
        <ul>
          <li><a href="index.html">互動電力地圖</a></li>
          <li><a href="taiwan.html">台灣電力深度頁</a></li>
          <li><a href="americas.html">美洲電力深度頁</a></li>
          <li><a href="about.html">方法與資料來源</a></li>
          <li style="margin-top:8px;padding-top:8px;border-top:1px dashed rgba(242,246,243,.18)"><a href="https://falconkenny.github.io/gf-website/">⌂ 回 Guide.Ferryman 主站</a></li>
          <li><a href="https://falconkenny.github.io/gf-website/invest-map.html">產業投資地圖</a></li>
        </ul>
      </div>
      <div>
        <h4>主要資料來源</h4>
        <ul>
          <li><a href="https://www.taipower.com.tw" target="_blank" rel="noopener">台灣電力公司</a></li>
          <li><a href="https://www.eia.gov" target="_blank" rel="noopener">U.S. EIA 能源資訊署</a></li>
          <li><a href="https://www.energy.gov" target="_blank" rel="noopener">U.S. DOE 能源部</a></li>
          <li><a href="https://www.ferc.gov" target="_blank" rel="noopener">FERC 聯邦能源管制委員會</a></li>
        </ul>
      </div>
    </div>
    <div class="foot-bottom">© ${new Date().getFullYear()} TAIWAN–AMERICAS POWER ATLAS · DATA FOR REFERENCE ONLY · 電價與供需以各機構公告為準</div>`;
  }
})();

/* ---------- 工具：懸浮框定位 ---------- */
function PA_bindTip(container, tipEl) {
  container.addEventListener("mousemove", (e) => {
    const r = container.getBoundingClientRect();
    let x = e.clientX - r.left, y = e.clientY - r.top;
    x = Math.max(120, Math.min(x, r.width - 120));
    tipEl.style.left = x + "px";
    tipEl.style.top = Math.max(84, y) + "px";
  });
}
function PA_tipRow(label, value, cls) {
  return `<div class="t-row ${cls || ""}"><span>${label}</span><b>${value}</b></div>`;
}

/* ---------- 工具：可排序表格 ---------- */
function PA_sortableTable(tableId) {
  const tbl = document.getElementById(tableId);
  if (!tbl) return;
  tbl.querySelectorAll("th[data-k]").forEach((th) => {
    th.addEventListener("click", () => {
      const k = +th.dataset.k;
      const num = th.dataset.num === "1";
      const asc = th.dataset.asc !== "1";
      tbl.querySelectorAll("th").forEach(h => { h.dataset.asc = ""; });
      th.dataset.asc = asc ? "1" : "0";
      const rows = [...tbl.tBodies[0].rows];
      rows.sort((a, b) => {
        const av = a.cells[k].dataset.v ?? a.cells[k].textContent;
        const bv = b.cells[k].dataset.v ?? b.cells[k].textContent;
        const cmp = num ? (+av) - (+bv) : String(av).localeCompare(String(bv), "zh-Hant");
        return asc ? cmp : -cmp;
      });
      rows.forEach(r => tbl.tBodies[0].appendChild(r));
    });
  });
}
