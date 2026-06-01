/* =====================================================================
   THE ZENITH DISPATCH — minimal edition
   ===================================================================== */

(() => {
  "use strict";

  /* Nepal time (UTC+5:45) */
  const clockEl = document.getElementById("clock");
  if (clockEl) {
    const tick = () => {
      const now = new Date();
      const utc = now.getTime() + now.getTimezoneOffset() * 60_000;
      const nepal = new Date(utc + (5 * 60 + 45) * 60_000);
      const pad = (n) => String(n).padStart(2, "0");
      clockEl.textContent =
        `${pad(nepal.getHours())}:${pad(nepal.getMinutes())}:${pad(nepal.getSeconds())}`;
    };
    tick();
    setInterval(tick, 1000);
  }

  /* Reading time */
  const rtEl = document.getElementById("reading");
  if (rtEl) {
    const text = document.body.innerText || "";
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    const minutes = Math.max(1, Math.round(words / 225));
    rtEl.textContent = minutes === 1 ? "a minute" : `${minutes} minutes`;
  }
})();
