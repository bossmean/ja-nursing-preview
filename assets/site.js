/* JA Smith Consulting & Nursing Services - preview build by Aning Media Group */
(function () {
  "use strict";

  /* --------------------------------------------------------------
     FORM ENDPOINT
     The contact form posts to FormSubmit, which emails every enquiry to
     janursingservices@gmail.com with the visitor's address as reply to.
     The very first submission makes FormSubmit send a one time
     activation email to that inbox; nothing is delivered until Michelle
     clicks Activate in it. Blank this to put the forms back in demo mode.
     -------------------------------------------------------------- */
  var FORM_ENDPOINT = "https://formsubmit.co/ajax/janursingservices@gmail.com";

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
      var qs = data.first_name ? "?name=" + encodeURIComponent(data.first_name) : "";

      /* FormSubmit settings: subject names the enquiry type, replies go to the visitor */
      delete data.company;
      data._subject = "Website enquiry: " + (data.topic || "General");
      if (data.email) data._replyto = data.email;
      data._template = "table";

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
        return r.json();
      }).then(function (j) {
        if (j && String(j.success) === "false") throw new Error(j.message || "rejected");
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
})();
