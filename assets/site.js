/* JA Smith Consulting & Nursing Services - preview build by Aning Media Group */
(function () {
  "use strict";

  /* --------------------------------------------------------------
     FORM ENDPOINT
     Leave blank and every form runs in demo mode: it validates, then
     sends the visitor straight to the delivery page so the preview is
     fully clickable. Paste a real endpoint here before launch
     (Formspree, Kit, Mailchimp, or a Vercel serverless route) and the
     same forms will POST the lead to it.
     -------------------------------------------------------------- */
  var FORM_ENDPOINT = "";

  /* ---------- mobile drawer ---------- */
  var burger = document.querySelector(".burger");
  var drawer = document.getElementById("drawer");
  if (burger && drawer) {
    burger.addEventListener("click", function () {
      var open = burger.getAttribute("aria-expanded") === "true";
      burger.setAttribute("aria-expanded", String(!open));
      drawer.classList.toggle("open", !open);
      document.body.classList.toggle("locked", !open);
    });
    drawer.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        burger.setAttribute("aria-expanded", "false");
        drawer.classList.remove("open");
        document.body.classList.remove("locked");
      }
    });
    window.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && drawer.classList.contains("open")) burger.click();
    });
  }

  /* ---------- reveal on scroll ---------- */
  var reveals = document.querySelectorAll(".reveal");
  if (reveals.length && "IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.06 });
    reveals.forEach(function (el, i) { el.style.transitionDelay = (i % 4) * 60 + "ms"; io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- year ---------- */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  /* ---------- lead forms ---------- */
  document.querySelectorAll("form[data-lead]").forEach(function (form) {
    var msg = form.querySelector(".form-msg");
    var btn = form.querySelector('button[type="submit"]');
    var label = btn ? btn.textContent : "";

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (msg) { msg.className = "form-msg"; msg.textContent = ""; }

      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
      if (form.querySelector('input[name="company"]') && form.querySelector('input[name="company"]').value) {
        return; /* honeypot */
      }

      var data = Object.fromEntries(new FormData(form).entries());
      data.source_page = location.pathname;
      data.submitted_at = new Date().toISOString();

      if (btn) { btn.disabled = true; btn.textContent = "Sending..."; }

      var next = form.getAttribute("data-next") || "thank-you.html";
      var qs = "?magnet=" + encodeURIComponent(form.getAttribute("data-lead") || "guide");
      if (data.first_name) qs += "&name=" + encodeURIComponent(data.first_name);

      function go() { location.href = next + qs; }

      if (!FORM_ENDPOINT) {
        try { localStorage.setItem("ja_lead_" + Date.now(), JSON.stringify(data)); } catch (err) {}
        setTimeout(go, 450);
        return;
      }

      fetch(FORM_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(data)
      }).then(function (r) {
        if (!r.ok) throw new Error("bad status");
        go();
      }).catch(function () {
        if (btn) { btn.disabled = false; btn.textContent = label; }
        if (msg) {
          msg.className = "form-msg err";
          msg.textContent = "Something went wrong sending that. Please email janursingservices@gmail.com and we will get it to you right away.";
        }
      });
    });
  });

  /* ---------- readiness quiz ---------- */
  var quiz = document.getElementById("quiz");
  if (quiz) {
    var qs = Array.prototype.slice.call(quiz.querySelectorAll(".q[data-q]"));
    var result = quiz.querySelector("#quiz-result");
    var bar = quiz.querySelector(".progress i");
    var back = quiz.querySelector("#quiz-back");
    var step = 0;
    var answers = [];

    function show(i) {
      qs.forEach(function (q, n) { q.classList.toggle("on", n === i && !result.classList.contains("on")); });
      if (bar) bar.style.width = (i / qs.length) * 100 + "%";
      if (back) back.style.visibility = i === 0 ? "hidden" : "visible";
      var head = quiz.querySelector(".quiz-head");
      if (head && i > 0) head.scrollIntoView({ block: "nearest", behavior: "smooth" });
    }

    qs.forEach(function (q, n) {
      q.querySelectorAll(".opt").forEach(function (b) {
        b.addEventListener("click", function () {
          answers[n] = parseInt(b.getAttribute("data-v"), 10) || 0;
          if (n + 1 < qs.length) { step = n + 1; show(step); }
          else finish();
        });
      });
    });

    if (back) back.addEventListener("click", function () { if (step > 0) { step--; show(step); } });

    function finish() {
      var raw = answers.reduce(function (a, b) { return a + (b || 0); }, 0);
      var max = qs.length * 2;
      var pct = Math.round((raw / max) * 100);

      qs.forEach(function (q) { q.classList.remove("on"); });
      if (bar) bar.style.width = "100%";
      if (back) back.style.visibility = "hidden";
      result.classList.add("on");
      result.style.display = "block";

      var band, title, blurb;
      if (pct < 40) {
        band = ["low", "Unshielded"];
        title = "You are walking into appointments without a plan.";
        blurb = "That is the most common place to start, and it is also the most expensive. When you have no record of what was said, no list of questions and no one tracking the follow ups, decisions get made about your health without you in the room. The good news is that this is fixable in an afternoon.";
      } else if (pct < 75) {
        band = ["mid", "Partly shielded"];
        title = "You are organized in places, exposed in others.";
        blurb = "You are already doing some of the right things. The gaps usually show up in the moments that matter most: a new diagnosis, a hospital discharge, or a disability form with a deadline. Closing those gaps before the next appointment is the highest value thing you can do this month.";
      } else {
        band = ["high", "Well shielded"];
        title = "You are prepared, and you can go further.";
        blurb = "You track your health information and you ask questions. The next level is systems that hold up under pressure and that someone else in your family can pick up if you cannot. That is exactly what the workbook is built for.";
      }

      result.querySelector("[data-band]").className = "band " + band[0];
      result.querySelector("[data-band]").textContent = band[1];
      result.querySelector("[data-title]").textContent = title;
      result.querySelector("[data-blurb]").textContent = blurb;
      result.querySelector("[data-pct]").textContent = pct;

      var ring = result.querySelector("[data-ring]");
      if (ring) {
        var c = 2 * Math.PI * 66;
        ring.style.strokeDasharray = c;
        ring.style.strokeDashoffset = c;
        setTimeout(function () {
          ring.style.transition = "stroke-dashoffset 1.1s cubic-bezier(.22,.61,.36,1)";
          ring.style.strokeDashoffset = c - (c * pct) / 100;
        }, 90);
      }

      var hidden = result.querySelector('input[name="readiness_score"]');
      if (hidden) hidden.value = pct + "% (" + band[1] + ")";

      result.scrollIntoView({ behavior: "smooth", block: "start" });
    }

    show(0);
  }
})();
