/* 台美電力資源藍圖 — 圖表（D3 手繪，無外部圖表庫） */

/* 折線圖：兩年電價趨勢
   cfg = { el, months, series:[{name,color,values,dash?}], unit, events?, yFmt? } */
function PA_lineChart(cfg) {
  const box = document.getElementById(cfg.el);
  if (!box) return;
  box.innerHTML = "";
  const W = 640, H = 320, M = { t: 18, r: 16, b: 42, l: 46 };
  const svg = d3.select(box).append("svg").attr("viewBox", `0 0 ${W} ${H}`);
  const x = d3.scalePoint().domain(cfg.months).range([M.l, W - M.r]);
  const all = cfg.series.flatMap(s => s.values);
  const y = d3.scaleLinear()
    .domain([d3.min(all) * 0.94, d3.max(all) * 1.06]).nice()
    .range([H - M.b, M.t]);

  /* 格線與軸 */
  svg.append("g").selectAll("line").data(y.ticks(5)).join("line")
    .attr("class", "grid-line").attr("x1", M.l).attr("x2", W - M.r)
    .attr("y1", d => y(d)).attr("y2", d => y(d));
  const tickMonths = cfg.months.filter((m, i) => i % 3 === 0);
  const gx = svg.append("g").attr("class", "axis").attr("transform", `translate(0,${H - M.b})`)
    .call(d3.axisBottom(x).tickValues(tickMonths).tickFormat(m => m.replace("-", "/").slice(2)));
  gx.selectAll("text").attr("transform", "rotate(-32)").style("text-anchor", "end");
  svg.append("g").attr("class", "axis").attr("transform", `translate(${M.l},0)`)
    .call(d3.axisLeft(y).ticks(5).tickFormat(cfg.yFmt || (d => d)));

  const line = d3.line().x((d, i) => x(cfg.months[i])).y(d => y(d)).curve(d3.curveMonotoneX);
  cfg.series.forEach(s => {
    svg.append("path").attr("d", line(s.values))
      .attr("fill", "none").attr("stroke", s.color).attr("stroke-width", 2.4)
      .attr("stroke-dasharray", s.dash ? "5 5" : null);
  });

  /* 事件標記 */
  (cfg.events || []).forEach(ev => {
    const xi = x(ev.m); if (xi == null) return;
    svg.append("line").attr("x1", xi).attr("x2", xi).attr("y1", M.t).attr("y2", H - M.b)
      .attr("stroke", "#F0B429").attr("stroke-width", 1.2).attr("stroke-dasharray", "3 4");
    svg.append("text").attr("x", xi + 4).attr("y", M.t + 10)
      .attr("font-size", 9).attr("fill", "#9C7500").attr("font-family", "var(--font-mono)")
      .text(ev.label);
  });

  /* hover 十字與提示 */
  const tipId = cfg.el + "Tip";
  let tip = document.getElementById(tipId);
  if (!tip) {
    tip = document.createElement("div");
    tip.className = "chart-tip"; tip.id = tipId;
    box.style.position = "relative"; box.appendChild(tip);
  }
  const hoverLine = svg.append("line").attr("stroke", "#98A79D").attr("y1", M.t).attr("y2", H - M.b).attr("opacity", 0);
  svg.append("rect").attr("x", M.l).attr("y", M.t).attr("width", W - M.l - M.r).attr("height", H - M.t - M.b)
    .attr("fill", "transparent")
    .on("mousemove", function (event) {
      const [mx] = d3.pointer(event);
      const i = Math.round((mx - M.l) / ((W - M.l - M.r) / (cfg.months.length - 1)));
      const idx = Math.max(0, Math.min(cfg.months.length - 1, i));
      const xi = x(cfg.months[idx]);
      hoverLine.attr("x1", xi).attr("x2", xi).attr("opacity", 1);
      const rows = cfg.series.map(s => `${s.name}: ${s.values[idx]}${cfg.unit}`).join("<br>");
      tip.innerHTML = `<b>${cfg.months[idx]}</b><br>${rows}`;
      const r = box.getBoundingClientRect();
      tip.style.left = Math.max(110, Math.min((xi / W) * r.width, r.width - 110)) + "px";
      tip.style.top = "56px";
      tip.style.opacity = 1;
    })
    .on("mouseleave", () => { hoverLine.attr("opacity", 0); tip.style.opacity = 0; });
}

/* 每週供需圖：長條（尖峰負載）＋線（供電能力）＋標籤（備轉率） */
function PA_weeklyChart(cfg) {
  const box = document.getElementById(cfg.el);
  if (!box) return;
  box.innerHTML = "";
  const d = cfg.data;
  const W = 640, H = 300, M = { t: 26, r: 16, b: 34, l: 46 };
  const svg = d3.select(box).append("svg").attr("viewBox", `0 0 ${W} ${H}`);
  const x = d3.scaleBand().domain(d.days).range([M.l, W - M.r]).padding(0.32);
  const y = d3.scaleLinear()
    .domain([d3.min(d.peakLoad) * 0.82, d3.max(d.capacity) * 1.05]).nice()
    .range([H - M.b, M.t]);

  svg.append("g").selectAll("line").data(y.ticks(5)).join("line")
    .attr("class", "grid-line").attr("x1", M.l).attr("x2", W - M.r)
    .attr("y1", v => y(v)).attr("y2", v => y(v));
  svg.append("g").attr("class", "axis").attr("transform", `translate(0,${H - M.b})`).call(d3.axisBottom(x));
  svg.append("g").attr("class", "axis").attr("transform", `translate(${M.l},0)`).call(d3.axisLeft(y).ticks(5));

  /* 尖峰負載長條 */
  svg.append("g").selectAll("rect").data(d.peakLoad).join("rect")
    .attr("x", (v, i) => x(d.days[i])).attr("width", x.bandwidth())
    .attr("y", v => y(v)).attr("height", v => H - M.b - y(v))
    .attr("rx", 4).attr("fill", "#3F86C8");

  /* 供電能力階梯線 */
  const capLine = d3.line()
    .x((v, i) => x(d.days[i]) + x.bandwidth() / 2).y(v => y(v)).curve(d3.curveStepAfter);
  svg.append("path").attr("d", capLine(d.capacity))
    .attr("fill", "none").attr("stroke", "#F0B429").attr("stroke-width", 2.4).attr("stroke-dasharray", "6 4");

  /* 備轉率標籤（若有） */
  if (d.reservePct) {
    svg.append("g").selectAll("text").data(d.reservePct).join("text")
      .attr("x", (v, i) => x(d.days[i]) + x.bandwidth() / 2)
      .attr("y", (v, i) => y(d.peakLoad[i]) - 7)
      .attr("text-anchor", "middle").attr("font-size", 9.5)
      .attr("font-family", "var(--font-mono)")
      .attr("fill", v => v < 10 ? "#C94F4F" : "#2C7A4B")
      .text(v => v.toFixed(1) + "%");
  }
}

/* 電源結構橫條 */
function PA_mixBar(el, mix, labels) {
  const box = document.getElementById(el);
  if (!box) return;
  const entries = Object.entries(mix).filter(([, v]) => v > 0);
  box.querySelector(".mixbar").innerHTML = entries
    .map(([k, v]) => `<i class="c-${labels[k].cls}" style="width:${v}%" title="${labels[k].name} ${v}%"></i>`).join("");
  box.querySelector(".mix-legend").innerHTML = entries
    .map(([k, v]) => `<span class="lg"><span class="sw c-${labels[k].cls}"></span>${labels[k].name} ${v}%</span>`).join("");
}
