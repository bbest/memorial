(function () {
  const M  = window.MEMORIAL;
  const $  = (id) => document.getElementById(id);

  // header and links ----
  $("names").textContent    = M.names;
  $("dates").textContent    = M.dates;
  $("epigraph").textContent = M.epigraph;
  $("hero-img").src = M.hero.src;
  $("hero-img").alt = M.hero.alt;

  const set_link = (id, url) => {
    if (url) $(id).href = url; else $(id).hidden = true; };
  set_link("link-historical", M.links.historical_photos);
  set_link("link-memorial",   M.links.memorial_photos);
  set_link("link-video",      M.links.video);

  // photo viewer ----
  let photos = [], idx = 0, timer = null;
  const SLIDE_MS = 5000;
  const lb = $("lightbox"), lb_img = $("lb-img");

  fetch(M.photos_json).then((r) => r.json()).then((list) => {
    photos = list;
    const grid = $("grid");
    photos.forEach((p, i) => {
      const li = document.createElement("li");
      const b  = document.createElement("button");
      b.type = "button";
      b.setAttribute("aria-label", p.caption ? `Open photo: ${p.caption}` : `Open photo ${i + 1}`);
      const img = document.createElement("img");
      img.src = p.thumb; img.alt = p.caption || ""; img.loading = "lazy";
      b.appendChild(img);
      b.addEventListener("click", () => open_at(i));
      li.appendChild(b); grid.appendChild(li);
    });
  });

  function show(i) {
    idx = (i + photos.length) % photos.length;
    const p = photos[idx];
    lb_img.classList.add("loading");
    lb_img.onload = () => lb_img.classList.remove("loading");
    lb_img.src = p.src;
    lb_img.alt = p.caption || `Photo ${idx + 1}`;
    $("lb-cap").textContent   = p.caption || "";
    $("lb-count").textContent = `${idx + 1} / ${photos.length}`;
    // preload neighbors so next/prev feel instant
    [idx + 1, idx - 1].forEach((j) => { new Image().src = photos[(j + photos.length) % photos.length].src; });
  }
  function open_at(i) { show(i); if (!lb.open) lb.showModal(); }
  function play(on) {
    clearInterval(timer); timer = null;
    if (on) timer = setInterval(() => show(idx + 1), SLIDE_MS);
    $("lb-play").textContent = on ? "❚❚" : "▶";
    $("lb-play").setAttribute("aria-label", on ? "Pause slideshow" : "Play slideshow");
  }
  const step = (d) => { show(idx + d); if (timer) play(true); };  // restart the timer after a manual step

  $("play-all").addEventListener("click", () => { if (photos.length) { open_at(0); play(true); } });
  $("lb-play").addEventListener("click",  () => play(!timer));
  $("lb-prev").addEventListener("click",  () => step(-1));
  $("lb-next").addEventListener("click",  () => step(+1));
  $("lb-close").addEventListener("click", () => lb.close());
  lb.addEventListener("close", () => play(false));
  lb.addEventListener("click", (e) => { if (e.target === lb || e.target.classList.contains("lb-stage")) lb.close(); });
  lb.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") step(+1);
    if (e.key === "ArrowLeft")  step(-1);
    if (e.key === " ") { e.preventDefault(); play(!timer); } });

  // swipe on touch screens
  let x0 = null;
  lb.addEventListener("touchstart", (e) => { x0 = e.touches[0].clientX; }, { passive: true });
  lb.addEventListener("touchend",   (e) => {
    if (x0 === null) return;
    const dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 40) step(dx < 0 ? +1 : -1);
    x0 = null; });

  // guestbook ----
  const G = M.guestbook, form = $("gb-form"), status = $("gb-status");

  // minimal csv parser that handles quoted fields with commas and newlines
  function parse_csv(text) {
    const rows = []; let row = [], f = "", q = false;
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      if (q) {
        if (c === '"' && text[i + 1] === '"') { f += '"'; i++; }
        else if (c === '"') q = false;
        else f += c;
      } else if (c === '"') q = true;
      else if (c === ",") { row.push(f); f = ""; }
      else if (c === "\n" || c === "\r") {
        if (c === "\r" && text[i + 1] === "\n") i++;
        row.push(f); rows.push(row); row = []; f = ""; }
      else f += c;
    }
    if (f || row.length) { row.push(f); rows.push(row); }
    return rows;
  }

  function load_entries() {
    if (!G.sheet_csv) return;
    // cache-bust so new entries show up quickly
    fetch(G.sheet_csv + (G.sheet_csv.includes("?") ? "&" : "?") + "t=" + Date.now())
      .then((r) => r.text())
      .then((text) => {
        // columns: Timestamp, Name, Message (Google Form response order)
        const rows = parse_csv(text).slice(1).filter((r) => r[1] && r[2]).reverse();
        const ol = $("gb-entries"); ol.innerHTML = "";
        rows.forEach(([ts, name, msg]) => {
          const li = document.createElement("li");
          const bq = document.createElement("blockquote"); bq.textContent = msg;
          const meta = document.createElement("div"); meta.className = "gb-meta";
          const who = document.createElement("strong"); who.textContent = name;
          meta.append("— ", who);
          const d = new Date(ts);
          if (!isNaN(d)) meta.append(", " + d.toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" }));
          li.append(bq, meta); ol.appendChild(li);
        });
      })
      .catch(() => {});
  }

  if (!G.form_action) {
    form.querySelector("button").disabled = true;
    status.textContent = "The guestbook will open soon.";
  }
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!G.form_action) return;
    const fd   = new FormData(form);
    const body = new URLSearchParams();
    body.append(G.entry_name,    fd.get("name").trim());
    body.append(G.entry_message, fd.get("message").trim());
    const btn = form.querySelector("button"); btn.disabled = true;
    status.textContent = "Sending…";
    // google forms does not send cors headers, so the response is opaque; a network error still rejects
    fetch(G.form_action, { method: "POST", mode: "no-cors", body })
      .then(() => {
        form.reset();
        status.textContent = "Thank you. Your message has been added and will appear below in a few minutes.";
        setTimeout(load_entries, 4000); })
      .catch(() => { status.textContent = "Sorry, that didn't go through. Please try again."; })
      .finally(() => { btn.disabled = false; });
  });
  load_entries();
})();
