(function () {
  "use strict";

  var LANGS = ["en", "es", "fr", "it", "pt", "de", "ko", "zh", "ja"];
  var CJK_FONTS = { ko: "Noto+Sans+KR", zh: "Noto+Sans+SC", ja: "Noto+Sans+JP" };
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var dict = window.I18N || {};
  var current = "en";

  function store(key, value) {
    try { localStorage.setItem(key, value); } catch (e) {}
  }
  function stored(key) {
    try { return localStorage.getItem(key); } catch (e) { return null; }
  }

  /* ---------- i18n ---------- */
  // English unless the visitor picked a language (link with ?lang= or the switcher).
  function detectLang() {
    var q = new URLSearchParams(location.search).get("lang");
    if (q && LANGS.indexOf(q) > -1) return q;
    var s = stored("leetapp.lang");
    if (s && LANGS.indexOf(s) > -1) return s;
    return "en";
  }

  function loadCjkFont(lang) {
    var family = CJK_FONTS[lang];
    if (!family || document.getElementById("font-" + lang)) return;
    var link = document.createElement("link");
    link.id = "font-" + lang;
    link.rel = "stylesheet";
    link.href = "https://fonts.googleapis.com/css2?family=" + family + ":wght@400;500;700&display=swap";
    document.head.appendChild(link);
  }

  function setLang(lang, persist) {
    var t = dict[lang] || dict.en;
    current = lang;
    document.documentElement.lang = lang;
    loadCjkFont(lang);
    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var v = t[el.getAttribute("data-i18n")];
      if (v) el.textContent = v;
    });
    document.title = t["meta.title"];
    var desc = document.querySelector('meta[name="description"]');
    if (desc) desc.setAttribute("content", t["meta.desc"]);
    document.querySelector(".lang-code").textContent = lang.toUpperCase();
    document.querySelectorAll(".lang-menu [data-lang]").forEach(function (b) {
      b.setAttribute("aria-selected", b.getAttribute("data-lang") === lang ? "true" : "false");
    });
    if (persist) {
      store("leetapp.lang", lang);
      var url = new URL(location.href);
      url.searchParams.set("lang", lang);
      history.replaceState(null, "", url);
    }
  }

  var langBox = document.getElementById("lang");
  var langBtn = langBox.querySelector(".lang-btn");
  function toggleLang(open) {
    langBox.classList.toggle("open", open);
    langBtn.setAttribute("aria-expanded", open ? "true" : "false");
  }
  langBtn.addEventListener("click", function (e) {
    e.stopPropagation();
    toggleLang(!langBox.classList.contains("open"));
  });
  langBox.querySelectorAll("[data-lang]").forEach(function (b) {
    b.addEventListener("click", function () {
      setLang(b.getAttribute("data-lang"), true);
      toggleLang(false);
    });
  });
  document.addEventListener("click", function () { toggleLang(false); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") { toggleLang(false); setMenu(false); } });

  setLang(detectLang(), false);

  /* ---------- Nav ---------- */
  var nav = document.querySelector(".nav");
  var burger = document.querySelector(".burger");
  function setMenu(open) {
    nav.classList.toggle("menu-open", open);
    burger.setAttribute("aria-expanded", open ? "true" : "false");
  }
  burger.addEventListener("click", function (e) { e.stopPropagation(); setMenu(!nav.classList.contains("menu-open")); });
  document.querySelectorAll(".nav-links a").forEach(function (a) { a.addEventListener("click", function () { setMenu(false); }); });
  function onScroll() { nav.classList.toggle("scrolled", window.scrollY > 10); }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Reveal on scroll ---------- */
  if ("IntersectionObserver" in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    document.querySelectorAll(".reveal").forEach(function (el, i) {
      el.style.transitionDelay = (el.closest(".hero") ? i * 80 : 0) + "ms";
      io.observe(el);
    });
  } else {
    document.documentElement.classList.add("js-off");
  }

  /* ---------- Card spotlight + device tilt ---------- */
  document.querySelectorAll("[data-glow]").forEach(function (card) {
    card.addEventListener("pointermove", function (e) {
      var r = card.getBoundingClientRect();
      card.style.setProperty("--mx", e.clientX - r.left + "px");
      card.style.setProperty("--my", e.clientY - r.top + "px");
    });
  });
  var device = document.querySelector(".device");
  var visual = document.querySelector(".hero-visual");
  if (device && !reduceMotion && window.matchMedia("(pointer: fine)").matches) {
    visual.addEventListener("pointermove", function (e) {
      var r = visual.getBoundingClientRect();
      var x = (e.clientX - r.left) / r.width - 0.5;
      var y = (e.clientY - r.top) / r.height - 0.5;
      device.style.transform = "translate(-50%, -50%) rotateY(" + (-14 + x * 16) + "deg) rotateX(" + (6 - y * 12) + "deg)";
    });
    visual.addEventListener("pointerleave", function () { device.style.transform = ""; });
  }

  /* ---------- Work: seamless parallax loops ---------- */
  // Each layer scrolls exactly one tile width, which depends on its rendered height.
  function sizeParallax() {
    document.querySelectorAll(".px").forEach(function (el) {
      var url = getComputedStyle(el).backgroundImage.slice(5, -2);
      var img = new Image();
      img.onload = function () {
        el.style.setProperty("--dist", -Math.round(img.naturalWidth * el.clientHeight / img.naturalHeight) + "px");
      };
      img.src = url;
    });
  }
  sizeParallax();
  window.addEventListener("resize", sizeParallax);

  /* ---------- Work: gameplay slideshows ---------- */
  document.querySelectorAll(".slides").forEach(function (box, k) {
    var imgs = box.querySelectorAll("img"), i = 0;
    if (!imgs.length) return;
    imgs[0].classList.add("on");
    if (reduceMotion || imgs.length < 2) return;
    setTimeout(function () {
      setInterval(function () {
        imgs.forEach(function (im) { im.classList.remove("was"); });
        imgs[i].classList.replace("on", "was");
        i = (i + 1) % imgs.length;
        imgs[i].classList.add("on");
      }, 4800);
    }, k * 1300);
  });

  /* ---------- Work: 3D model, loaded only when its card is near the viewport ---------- */
  var mv = document.getElementById("maranito3d");
  if (mv) {
    var loadModel = function () {
      var s = document.createElement("script");
      s.type = "module";
      s.src = "https://ajax.googleapis.com/ajax/libs/model-viewer/3.5.0/model-viewer.min.js";
      document.head.appendChild(s);
      mv.setAttribute("src", mv.getAttribute("data-src"));
      if (reduceMotion) mv.removeAttribute("auto-rotate");
    };
    if ("IntersectionObserver" in window) {
      var mio = new IntersectionObserver(function (en) {
        if (en[0].isIntersecting) { mio.disconnect(); loadModel(); }
      }, { rootMargin: "300px" });
      mio.observe(mv);
    } else {
      loadModel();
    }
  }

  /* ---------- Contact form (mailto) ---------- */
  var form = document.getElementById("contact-form");
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var ok = true;
    form.querySelectorAll("input, textarea").forEach(function (f) {
      var valid = f.value.trim() !== "" && (f.type !== "email" || /.+@.+\..+/.test(f.value));
      f.classList.toggle("invalid", !valid);
      if (!valid) ok = false;
    });
    if (!ok) return;
    var t = dict[current] || dict.en;
    var body = form.message.value + "\n\n— " + form.name.value + " <" + form.email.value + ">";
    location.href = "mailto:airmig@gmail.com?subject=" + encodeURIComponent(t["cta.subject"]) + "&body=" + encodeURIComponent(body);
  });

  document.getElementById("year").textContent = new Date().getFullYear();

  /* ---------- Background: aurora + particle constellation ---------- */
  var bg = document.getElementById("bg");
  var ctx = bg.getContext("2d");
  var W, H, DPR, pts = [];
  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = bg.width = innerWidth * DPR;
    H = bg.height = innerHeight * DPR;
    var n = Math.round(Math.min(90, (innerWidth * innerHeight) / 16000));
    pts = [];
    for (var i = 0; i < n; i++) {
      pts.push({ x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - 0.5) * 0.25 * DPR, vy: (Math.random() - 0.5) * 0.25 * DPR, r: (Math.random() * 1.4 + 0.4) * DPR });
    }
  }
  var mouse = { x: -9999, y: -9999 };
  window.addEventListener("pointermove", function (e) { mouse.x = e.clientX * DPR; mouse.y = e.clientY * DPR; }, { passive: true });

  function blob(x, y, r, c) {
    var g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, c); g.addColorStop(1, "rgba(7,7,13,0)");
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  }
  function frame(t) {
    var s = t * 0.00012;
    ctx.fillStyle = "#07070d"; ctx.fillRect(0, 0, W, H);
    ctx.globalCompositeOperation = "lighter";
    blob(W * (0.75 + Math.sin(s) * 0.08), H * (0.22 + Math.cos(s * 1.3) * 0.08), Math.max(W, H) * 0.42, "rgba(139,92,255,0.22)");
    blob(W * (0.2 + Math.cos(s * 0.8) * 0.1), H * (0.75 + Math.sin(s * 1.1) * 0.08), Math.max(W, H) * 0.38, "rgba(34,211,238,0.12)");
    blob(W * (0.5 + Math.sin(s * 0.6) * 0.2), H * 0.05, Math.max(W, H) * 0.25, "rgba(59,130,246,0.12)");
    ctx.globalCompositeOperation = "source-over";

    var maxD = 130 * DPR;
    for (var i = 0; i < pts.length; i++) {
      var p = pts[i];
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > W) p.vx *= -1;
      if (p.y < 0 || p.y > H) p.vy *= -1;
      var dm = Math.hypot(p.x - mouse.x, p.y - mouse.y);
      if (dm < 160 * DPR) { p.x += (p.x - mouse.x) / dm; p.y += (p.y - mouse.y) / dm; }
      for (var j = i + 1; j < pts.length; j++) {
        var q = pts[j], d = Math.hypot(p.x - q.x, p.y - q.y);
        if (d < maxD) {
          ctx.strokeStyle = "rgba(167,139,250," + (1 - d / maxD) * 0.18 + ")";
          ctx.lineWidth = DPR * 0.6;
          ctx.beginPath(); ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y); ctx.stroke();
        }
      }
      ctx.fillStyle = "rgba(220,225,255,0.55)";
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.283); ctx.fill();
    }
    if (!reduceMotion) requestAnimationFrame(frame);
  }
  resize();
  window.addEventListener("resize", resize);
  requestAnimationFrame(frame);

  /* ---------- Mini pixel game in the hero device ---------- */
  var gc = document.getElementById("game");
  if (gc) {
    var g = gc.getContext("2d");
    g.imageSmoothingEnabled = false;
    var GW = 80, GH = 42, PX = 4; // logical pixel grid, scaled x4
    var score = 13370, scoreEl = document.getElementById("score");
    var hero = { x: 10, y: 0, vy: 0 };
    var ground = [];
    for (var k = 0; k < GW + 20; k++) ground.push(k % 22 > 15 ? 0 : 30 + (k % 44 > 22 ? -4 : 0));
    var off = 0;

    function rect(x, y, w, h, c) { g.fillStyle = c; g.fillRect(Math.round(x) * PX, Math.round(y) * PX, w * PX, h * PX); }

    function step(t) {
      off += 0.35;
      var sky = g.createLinearGradient(0, 0, 0, gc.height);
      sky.addColorStop(0, "#1b0b33"); sky.addColorStop(1, "#4a1031");
      g.fillStyle = sky; g.fillRect(0, 0, gc.width, gc.height);
      // stars
      for (var s = 0; s < 14; s++) rect((s * 23 - off * 0.2) % GW < 0 ? 0 : (s * 23 - off * 0.2 + GW * 4) % GW, (s * 7) % 18 + 4, 1, 1, "rgba(255,255,255,.6)");
      // waterfall + secret door
      var wx = ((60 - off * 0.6) % (GW + 30) + GW + 30) % (GW + 30) - 15;
      rect(wx, 6, 6, 24, "rgba(34,211,238,.55)");
      rect(wx + 1, 22, 4, 8, "#b6ff3c");
      // terrain + lava
      for (var x = 0; x < GW; x++) {
        var gi = Math.floor(x + off) % ground.length;
        var h = ground[gi];
        if (h === 0) {
          var flick = Math.sin(t * 0.008 + x) > 0 ? "#ff7a1a" : "#ff4f1a";
          rect(x, 36, 1, 6, flick);
          rect(x, 35, 1, 1, "#ffd23f");
        } else {
          rect(x, h, 1, GH - h, "#5b21b6");
          rect(x, h, 1, 1, "#a78bfa");
        }
      }
      // hero: auto-jumps over lava
      var under = ground[Math.floor(hero.x + off) % ground.length];
      var ahead = ground[Math.floor(hero.x + 6 + off) % ground.length];
      var floor = under === 0 ? 50 : under;
      hero.vy += 0.18; hero.y += hero.vy;
      if (hero.y + 5 >= floor && under !== 0) { hero.y = floor - 5; hero.vy = 0; if (ahead === 0 || ahead < under) hero.vy = -2.6; }
      if (hero.y > GH) { hero.y = 0; hero.vy = 0; }
      rect(hero.x, hero.y, 4, 5, "#22d3ee");
      rect(hero.x + 2, hero.y + 1, 1, 1, "#0b0b16");
      rect(hero.x - 1, hero.y + 2, 1, 2, "#b6ff3c");

      score += 3;
      if (scoreEl && (t | 0) % 6 === 0) scoreEl.textContent = String(score).padStart(6, "0").replace(/(\d{3})(\d{3})/, "$1 $2");
      if (!reduceMotion) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
})();
