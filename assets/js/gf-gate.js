/* ============================================================
   台美電力資源藍圖 — 黃金會員通行碼閘門（gf-gate.js, v1.0）
   ------------------------------------------------------------
   ・置於每頁 <head> 中「同步」載入（不可加 defer/async），
     於內容繪製前先行鎖定，避免資料閃現。
   ・驗證來源：Guide.Ferryman 主站同一個 Supabase 專案之
     RPC gf_check_pass（回傳等級）與 gf_open_until（全站限時開放）。
   ・解鎖條件：通行碼等級 ≥ 4（🥇 黃金會員），或全站開放期間。
   ・通過後：通行碼記錄於 localStorage（gf_atlas_code），
     之後每個新工作階段會自動重新驗證一次 —— 若通行碼
     於後台被停用，下次造訪即重新上鎖。
   ・驗證失敗（網路錯誤）採「預設上鎖」（fail-closed）。
   ============================================================ */
(function () {
  "use strict";

  /* ---------- ① 設定（與主站 sb.js 相同的公開金鑰） ---------- */
  var SB_URL = "https://wkwdjtayjzgedvvqdztr.supabase.co";
  var SB_KEY = "sb_publishable_8ch2sUzLB4nINtulu18nsw_n_9INE2D";
  var MAIN   = "https://falconkenny.github.io/gf-website/";
  var K_CODE = "gf_atlas_code";   /* localStorage：記住通行碼（本瀏覽器） */
  var K_OK   = "gf_atlas_ok";     /* sessionStorage：本工作階段已驗證 */

  /* ---------- ② 同步鎖定：先隱藏頁面內容 ---------- */
  var style = document.createElement("style");
  style.textContent =
    "html.gf-locked body>*:not(#gfAtlasGate){display:none!important}" +
    "#gfAtlasGate{position:fixed;inset:0;z-index:99999;display:flex;align-items:center;justify-content:center;padding:24px;" +
      "background:radial-gradient(1200px 700px at 70% -10%,#132F52 0%,#0A1C30 55%,#081525 100%);color:#F4F6F7;" +
      "font-family:'Noto Sans TC',sans-serif}" +
    "#gfAtlasGate .g-card{width:min(94vw,460px);background:rgba(13,36,64,.72);border:1px solid rgba(15,163,168,.35);" +
      "border-radius:18px;padding:38px 34px;text-align:center;backdrop-filter:blur(6px);box-shadow:0 24px 60px rgba(0,0,0,.45)}" +
    "#gfAtlasGate img{width:52px;height:52px;margin-bottom:14px}" +
    "#gfAtlasGate .g-kicker{font-family:'IBM Plex Mono',monospace;font-size:11px;letter-spacing:.28em;color:#0FA3A8;margin-bottom:10px}" +
    "#gfAtlasGate h1{font-family:'Noto Serif TC',serif;font-size:24px;margin:0 0 8px;color:#fff}" +
    "#gfAtlasGate .g-sub{font-size:13.5px;line-height:1.8;color:#B9C4CE;margin:0 0 22px}" +
    "#gfAtlasGate .g-sub b{color:#E8A23D}" +
    "#gfAtlasGate .g-inp{width:100%;box-sizing:border-box;padding:12px 14px;border-radius:10px;border:1.5px solid rgba(244,246,247,.25);" +
      "background:rgba(8,21,37,.7);color:#fff;font-family:'IBM Plex Mono',monospace;font-size:15px;letter-spacing:.12em;" +
      "text-align:center;outline:none;margin-bottom:12px}" +
    "#gfAtlasGate .g-inp:focus{border-color:#0FA3A8}" +
    "#gfAtlasGate .g-btn{width:100%;padding:12px;border:none;border-radius:10px;background:#E8A23D;color:#0A1C30;" +
      "font-weight:700;font-size:15px;cursor:pointer;font-family:inherit}" +
    "#gfAtlasGate .g-btn:hover{background:#F2B558}" +
    "#gfAtlasGate .g-btn[disabled]{opacity:.55;cursor:wait}" +
    "#gfAtlasGate .g-msg{min-height:20px;font-size:13px;margin:10px 0 4px;color:#F0A9A9}" +
    "#gfAtlasGate .g-msg.ok{color:#7FD6A8}" +
    "#gfAtlasGate .g-links{margin-top:18px;padding-top:16px;border-top:1px dashed rgba(244,246,247,.18);font-size:13px;line-height:2}" +
    "#gfAtlasGate .g-links a{color:#0FA3A8;text-decoration:none}" +
    "#gfAtlasGate .g-links a:hover{color:#E8A23D}" +
    "#gfAtlasGate .g-spin{font-size:13px;color:#B9C4CE;letter-spacing:.1em}";
  document.head.appendChild(style);
  document.documentElement.classList.add("gf-locked");

  /* ---------- ③ Supabase RPC 呼叫 ---------- */
  function rpc(fn, body) {
    return fetch(SB_URL + "/rest/v1/rpc/" + fn, {
      method: "POST",
      headers: { "apikey": SB_KEY, "Authorization": "Bearer " + SB_KEY, "Content-Type": "application/json" },
      body: JSON.stringify(body || {})
    }).then(function (r) {
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.json();
    });
  }
  function checkPass(code) {
    return rpc("gf_check_pass", { p_code: code }).then(function (lv) { return parseInt(lv, 10) || 0; });
  }

  /* ---------- ④ 解鎖／上鎖畫面 ---------- */
  function unlock() {
    try { sessionStorage.setItem(K_OK, "1"); } catch (e) {}
    document.documentElement.classList.remove("gf-locked");
    var g = document.getElementById("gfAtlasGate");
    if (g) g.remove();
  }

  function gateBox(inner) {
    var g = document.getElementById("gfAtlasGate");
    if (!g) {
      g = document.createElement("div");
      g.id = "gfAtlasGate";
      document.body.appendChild(g);
    }
    g.innerHTML =
      '<div class="g-card">' +
        '<img src="assets/img/logo.svg" alt="">' +
        '<p class="g-kicker">POWER ATLAS · MEMBERS ONLY</p>' +
        '<h1>台美電力資源藍圖</h1>' + inner +
      "</div>";
    return g;
  }

  function showSplash() {
    gateBox('<p class="g-spin">會員資格確認中…</p>');
  }

  function showLock(msg, isOk) {
    gateBox(
      '<p class="g-sub">本站為 Guide.Ferryman <b>🥇 黃金會員</b>限定研究工具。<br>請輸入您的會員通行碼解鎖。</p>' +
      '<input class="g-inp" id="gfGateCode" type="password" placeholder="會員通行碼" autocomplete="off">' +
      '<button class="g-btn" id="gfGateBtn">解鎖進入</button>' +
      '<p class="g-msg' + (isOk ? " ok" : "") + '" id="gfGateMsg">' + (msg || "") + "</p>" +
      '<div class="g-links">' +
        '<a href="' + MAIN + 'invest-map.html#power-atlas-section">⭐ 尚無通行碼？查看會員方案與升級</a><br>' +
        '<a href="' + MAIN + 'contact.html">💬 預約諮詢，由顧問為您導讀</a><br>' +
        '<a href="' + MAIN + '">← 回 Guide.Ferryman 主站</a>' +
      "</div>"
    );
    var inp = document.getElementById("gfGateCode");
    var btn = document.getElementById("gfGateBtn");
    var out = document.getElementById("gfGateMsg");
    function submit() {
      var code = (inp.value || "").trim();
      if (!code) { out.className = "g-msg"; out.textContent = "請輸入通行碼。"; return; }
      btn.disabled = true; out.className = "g-msg ok"; out.textContent = "驗證中…";
      checkPass(code).then(function (lv) {
        if (lv >= 4) {
          try { localStorage.setItem(K_CODE, code); } catch (e) {}
          out.textContent = "驗證成功，歡迎回來！";
          setTimeout(unlock, 350);
        } else if (lv >= 1) {
          btn.disabled = false; out.className = "g-msg";
          out.textContent = "此通行碼等級不足 — 本站需 🥇 黃金會員（L4）。請至主站升級方案。";
        } else {
          btn.disabled = false; out.className = "g-msg";
          out.textContent = "通行碼無效或已停用，請確認後再試。";
        }
      }).catch(function () {
        btn.disabled = false; out.className = "g-msg";
        out.textContent = "連線失敗，請檢查網路後再試一次。";
      });
    }
    btn.addEventListener("click", submit);
    inp.addEventListener("keydown", function (e) { if (e.key === "Enter") submit(); });
    setTimeout(function () { try { inp.focus(); } catch (e) {} }, 60);
  }

  /* ---------- ⑤ 主流程 ---------- */
  function boot() {
    /* 本工作階段已驗證過 → 直接放行 */
    try { if (sessionStorage.getItem(K_OK) === "1") { unlock(); return; } } catch (e) {}
    showSplash();

    /* 全站限時開放期間 → 視同黃金放行 */
    rpc("gf_open_until", {}).catch(function () { return null; }).then(function (until) {
      if (until) { unlock(); return; }

      /* 本瀏覽器記住的通行碼 → 重新驗證（後台停用即失效） */
      var saved = "";
      try { saved = localStorage.getItem(K_CODE) || ""; } catch (e) {}
      if (!saved) { showLock(); return; }

      checkPass(saved).then(function (lv) {
        if (lv >= 4) { unlock(); }
        else {
          try { localStorage.removeItem(K_CODE); } catch (e) {}
          showLock("您先前的通行碼已失效，請重新輸入。");
        }
      }).catch(function () {
        showLock("自動驗證失敗（連線問題），請手動輸入通行碼。");
      });
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else { boot(); }
})();
