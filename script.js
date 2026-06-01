/* =====================================================================
   THE ZENITH DISPATCH — small print
   ===================================================================== */

(() => {
  "use strict";

  /* --- 1. Nepal time, in the utility bar ---------------------------- */
  const clockEl = document.getElementById("nepalClock");
  if (clockEl) {
    const tick = () => {
      // Nepal is UTC+5:45. We compute from UTC to avoid the local-timezone trap.
      const now = new Date();
      const utc = now.getTime() + now.getTimezoneOffset() * 60_000;
      const nepal = new Date(utc + (5 * 60 + 45) * 60_000);
      const hh = String(nepal.getHours()).padStart(2, "0");
      const mm = String(nepal.getMinutes()).padStart(2, "0");
      const ss = String(nepal.getSeconds()).padStart(2, "0");
      clockEl.textContent = `KTM ${hh}:${mm}:${ss} NPT`;
    };
    tick();
    setInterval(tick, 1000);
  }

  /* --- 2. Reading time --------------------------------------------- */
  const rtEl = document.getElementById("readingTime");
  if (rtEl) {
    const text = document.querySelector("main")?.innerText || "";
    // ~225 wpm average
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    const minutes = Math.max(1, Math.round(words / 225));
    rtEl.textContent = minutes === 1 ? "a minute" : `${minutes} minutes`;
  }

  /* --- 3. Smooth scroll, with offset for the utility bar ----------- */
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener("click", (e) => {
      const id = a.getAttribute("href");
      if (!id || id === "#" || id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const top =
        target.getBoundingClientRect().top + window.scrollY - 20;
      window.scrollTo({ top, behavior: "smooth" });
    });
  });

  /* --- 4. Section reveal, gently ----------------------------------- */
  const sections = document.querySelectorAll(
    ".section-head, .project, .ledger__row, .contact-card, .ledger-card"
  );
  if ("IntersectionObserver" in window && sections.length) {
    sections.forEach((s) => {
      s.style.opacity = "0";
      s.style.transform = "translateY(12px)";
      s.style.transition =
        "opacity 700ms ease, transform 700ms cubic-bezier(.2,.7,.2,1)";
    });
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, i) => {
          if (entry.isIntersecting) {
            const el = entry.target;
            setTimeout(() => {
              el.style.opacity = "1";
              el.style.transform = "translateY(0)";
            }, i * 60);
            io.unobserve(el);
          }
        });
      },
      { threshold: 0.08, rootMargin: "0px 0px -8% 0px" }
    );
    sections.forEach((s) => io.observe(s));
  }

  /* --- 5. The "press the E" easter egg ----------------------------- */
  // A small, quiet thing: type "zenith" anywhere and a stamp appears.
  const buffer = [];
  const SECRET = "zenith";
  const stamp = document.createElement("div");
  stamp.setAttribute("aria-hidden", "true");
  stamp.style.cssText = `
    position: fixed; left: 50%; top: 50%;
    transform: translate(-50%, -50%) rotate(-9deg) scale(1);
    z-index: 999; pointer-events: none;
    font-family: "Special Elite", "Courier New", monospace;
    font-size: 4rem; letter-spacing: 0.18em;
    color: #a8321e; border: 6px double #a8321e;
    padding: 0.6em 1.2em; background: rgba(241, 232, 211, 0.92);
    opacity: 0; transition: opacity 220ms ease, transform 220ms ease;
    text-align: center;
  `;
  stamp.innerHTML = `END OF EDITION<br><span style="font-size:0.5em;letter-spacing:0.3em;">— KEEP FILING —</span>`;
  document.body.appendChild(stamp);

  let stampTimer = null;
  const showStamp = () => {
    stamp.style.opacity = "1";
    stamp.style.transform =
      "translate(-50%, -50%) rotate(-9deg) scale(1.04)";
    clearTimeout(stampTimer);
    stampTimer = setTimeout(() => {
      stamp.style.opacity = "0";
      stamp.style.transform =
        "translate(-50%, -50%) rotate(-9deg) scale(1)";
    }, 2200);
  };

  window.addEventListener("keydown", (e) => {
    // ignore if user is typing into a field
    const t = e.target;
    if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA")) return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    buffer.push(e.key.toLowerCase());
    if (buffer.length > SECRET.length) buffer.shift();
    if (buffer.join("") === SECRET) {
      showStamp();
      buffer.length = 0;
    }
  });

  /* --- 6. A small "year" auto-update in masthead ------------------- */
  // (kept as a single source of truth in HTML; this is a no-op placeholder
  //  if the user ever wants the date to roll automatically.)
  // const mastheadDate = document.querySelector(".masthead__top");
  // if (mastheadDate) {
  //   const d = new Date();
  //   const opts = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
  //   // ...
  // }

  /* --- 7. Light keyboard nav: j / k to step through sections ------- */
  const sectionIds = ["lead", "works", "disclosures", "ledger", "correspondence"];
  let cursor = 0;
  window.addEventListener("keydown", (e) => {
    const t = e.target;
    if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA")) return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key === "j") {
      cursor = Math.min(sectionIds.length - 1, cursor + 1);
      const el = document.getElementById(sectionIds[cursor]);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    } else if (e.key === "k") {
      cursor = Math.max(0, cursor - 1);
      const el = document.getElementById(sectionIds[cursor]);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
})();
