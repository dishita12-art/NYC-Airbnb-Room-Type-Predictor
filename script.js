/* =========================================================
   Room Type Predictor — front-end logic
   Talks to the FastAPI backend: GET / and POST /predict
   ========================================================= */
(() => {
  "use strict";

  /* ---------- data ---------- */

  // Every neighbourhood the model was trained on, grouped by borough.
  const HOODS = {
  "Bronx": [
    "Allerton",
    "Baychester",
    "Belmont",
    "Bronxdale",
    "Castle Hill",
    "City Island",
    "Claremont Village",
    "Clason Point",
    "Co-op City",
    "Concourse",
    "Concourse Village",
    "East Morrisania",
    "Eastchester",
    "Edenwald",
    "Fieldston",
    "Fordham",
    "Highbridge",
    "Hunts Point",
    "Kingsbridge",
    "Longwood",
    "Melrose",
    "Morris Heights",
    "Morris Park",
    "Morrisania",
    "Mott Haven",
    "Mount Eden",
    "Mount Hope",
    "North Riverdale",
    "Norwood",
    "Olinville",
    "Parkchester",
    "Pelham Bay",
    "Pelham Gardens",
    "Port Morris",
    "Riverdale",
    "Schuylerville",
    "Soundview",
    "Spuyten Duyvil",
    "Throgs Neck",
    "Tremont",
    "Unionport",
    "University Heights",
    "Van Nest",
    "Wakefield",
    "West Farms",
    "Westchester Square",
    "Williamsbridge",
    "Woodlawn"
  ],
  "Brooklyn": [
    "Bath Beach",
    "Bay Ridge",
    "Bedford-Stuyvesant",
    "Bensonhurst",
    "Bergen Beach",
    "Boerum Hill",
    "Borough Park",
    "Brighton Beach",
    "Brooklyn Heights",
    "Brownsville",
    "Bushwick",
    "Canarsie",
    "Carroll Gardens",
    "Clinton Hill",
    "Cobble Hill",
    "Columbia St",
    "Coney Island",
    "Crown Heights",
    "Cypress Hills",
    "DUMBO",
    "Downtown Brooklyn",
    "Dyker Heights",
    "East Flatbush",
    "East New York",
    "Flatbush",
    "Flatlands",
    "Fort Greene",
    "Fort Hamilton",
    "Gowanus",
    "Gravesend",
    "Greenpoint",
    "Kensington",
    "Manhattan Beach",
    "Midwood",
    "Mill Basin",
    "Navy Yard",
    "Park Slope",
    "Prospect Heights",
    "Prospect-Lefferts Gardens",
    "Red Hook",
    "Sea Gate",
    "Sheepshead Bay",
    "South Slope",
    "Sunset Park",
    "Vinegar Hill",
    "Williamsburg",
    "Windsor Terrace"
  ],
  "Manhattan": [
    "Battery Park City",
    "Chelsea",
    "Chinatown",
    "Civic Center",
    "East Harlem",
    "East Village",
    "Financial District",
    "Flatiron District",
    "Gramercy",
    "Greenwich Village",
    "Harlem",
    "Hell's Kitchen",
    "Inwood",
    "Kips Bay",
    "Little Italy",
    "Lower East Side",
    "Marble Hill",
    "Midtown",
    "Morningside Heights",
    "Murray Hill",
    "NoHo",
    "Nolita",
    "Roosevelt Island",
    "SoHo",
    "Stuyvesant Town",
    "Theater District",
    "Tribeca",
    "Two Bridges",
    "Upper East Side",
    "Upper West Side",
    "Washington Heights",
    "West Village"
  ],
  "Queens": [
    "Arverne",
    "Astoria",
    "Bay Terrace",
    "Bayside",
    "Bayswater",
    "Belle Harbor",
    "Bellerose",
    "Breezy Point",
    "Briarwood",
    "Cambria Heights",
    "College Point",
    "Corona",
    "Ditmars Steinway",
    "Douglaston",
    "East Elmhurst",
    "Edgemere",
    "Elmhurst",
    "Far Rockaway",
    "Flushing",
    "Forest Hills",
    "Fresh Meadows",
    "Glendale",
    "Hollis",
    "Holliswood",
    "Howard Beach",
    "Jackson Heights",
    "Jamaica",
    "Jamaica Estates",
    "Jamaica Hills",
    "Kew Gardens",
    "Kew Gardens Hills",
    "Laurelton",
    "Little Neck",
    "Long Island City",
    "Maspeth",
    "Middle Village",
    "Neponsit",
    "Ozone Park",
    "Queens Village",
    "Rego Park",
    "Richmond Hill",
    "Ridgewood",
    "Rockaway Beach",
    "Rosedale",
    "South Ozone Park",
    "Springfield Gardens",
    "St. Albans",
    "Sunnyside",
    "Whitestone",
    "Woodhaven",
    "Woodside"
  ],
  "Staten Island": [
    "Arden Heights",
    "Arrochar",
    "Bay Terrace, Staten Island",
    "Bull's Head",
    "Castleton Corners",
    "Clifton",
    "Concord",
    "Dongan Hills",
    "Eltingville",
    "Emerson Hill",
    "Graniteville",
    "Grant City",
    "Great Kills",
    "Grymes Hill",
    "Howland Hook",
    "Huguenot",
    "Lighthouse Hill",
    "Mariners Harbor",
    "Midland Beach",
    "New Brighton",
    "New Dorp",
    "New Dorp Beach",
    "New Springville",
    "Oakwood",
    "Port Richmond",
    "Prince's Bay",
    "Randall Manor",
    "Rosebank",
    "Rossville",
    "Shore Acres",
    "Silver Lake",
    "South Beach",
    "St. George",
    "Stapleton",
    "Todt Hill",
    "Tompkinsville",
    "Tottenville",
    "West Brighton",
    "Westerleigh",
    "Willowbrook"
  ]
};

  const BOROUGHS = {
    "Manhattan":     { lat: 40.7831, lng: -73.9712, r: 0.060 },
    "Brooklyn":      { lat: 40.6500, lng: -73.9496, r: 0.085 },
    "Queens":        { lat: 40.7282, lng: -73.7949, r: 0.095 },
    "Bronx":         { lat: 40.8448, lng: -73.8648, r: 0.060 },
    "Staten Island": { lat: 40.5795, lng: -74.1502, r: 0.065 },
  };

  // Order matches model.classes_ (alphabetical), which is the order of the
  // probability list returned by /predict.
  const ROOMS = [
    { name: "Entire home/apt", short: "Entire home", letter: "E", color: "var(--line-e)",
      blurb: "Guests get the whole place to themselves." },
    { name: "Private room", short: "Private room", letter: "P", color: "var(--line-p)",
      blurb: "A private bedroom inside a shared home." },
    { name: "Shared room", short: "Shared room", letter: "S", color: "var(--line-s)",
      blurb: "A bed or space shared with other people." },
  ];

  const FIELDS = {
    latitude:  { label: "Latitude",  min: -90,  max: 90,  int: false },
    longitude: { label: "Longitude", min: -180, max: 180, int: false },
    price:     { label: "Price",     gt: 0,                int: false },
    minimum_nights:    { label: "Minimum nights", min: 1, max: 365, int: true },
    number_of_reviews: { label: "Total reviews",  min: 0, int: true },
    reviews_per_month: { label: "Reviews per month", min: 0, int: false },
    calculated_host_listings_count: { label: "Host's listings", min: 0, int: true },
    availability_365:  { label: "Availability", min: 0, max: 365, int: true },
  };

  const PRESETS = {
    midtown:  { neighbourhood_group: "Manhattan", neighbourhood: "Midtown", latitude: 40.7549, longitude: -73.9840,
                price: 240, minimum_nights: 3, number_of_reviews: 85, reviews_per_month: 2.1,
                calculated_host_listings_count: 1, availability_365: 180 },
    bushwick: { neighbourhood_group: "Brooklyn", neighbourhood: "Bushwick", latitude: 40.6944, longitude: -73.9213,
                price: 70, minimum_nights: 2, number_of_reviews: 40, reviews_per_month: 1.2,
                calculated_host_listings_count: 2, availability_365: 250 },
    shared:   { neighbourhood_group: "Queens", neighbourhood: "Jamaica", latitude: 40.7027, longitude: -73.7890,
                price: 35, minimum_nights: 1, number_of_reviews: 12, reviews_per_month: 0.6,
                calculated_host_listings_count: 5, availability_365: 330 },
  };

  /* ---------- elements ---------- */

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  const form = $("#form");
  const boroughSel = $("#neighbourhood_group");
  const hoodSel = $("#neighbourhood");
  const priceNum = $("#price");
  const priceRange = $("#priceRange");
  const availNum = $("#availability_365");
  const availRange = $("#availRange");
  const latInput = $("#latitude");
  const lngInput = $("#longitude");
  const predictBtn = $("#predictBtn");
  const resultCard = $("#resultCard");
  const liveToggle = $("#liveToggle");
  const historyCard = $("#historyCard");
  const historyList = $("#history");
  const statusBtn = $("#statusBtn");
  const dialog = $("#apiDialog");
  const apiUrlInput = $("#apiUrl");

  /* ---------- settings (API url, history) ---------- */

  const store = {
    get(k, fallback) { try { const v = localStorage.getItem(k); return v === null ? fallback : JSON.parse(v); } catch { return fallback; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* storage unavailable */ } },
  };

  let API = store.get("rtp.api", "http://127.0.0.1:8000");
  let history = store.get("rtp.history", []);
  let lastPayload = null;

  /* ---------- helpers ---------- */

  const clamp = (n, a, b) => Math.min(b, Math.max(a, n));
  const rand = (a, b) => a + Math.random() * (b - a);
  const randInt = (a, b) => Math.round(rand(a, b));
  const debounce = (fn, ms) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };

  function toast(msg, kind = "") {
    const el = document.createElement("div");
    el.className = `toast ${kind ? "toast--" + kind : ""}`;
    el.textContent = msg;
    $("#toasts").appendChild(el);
    setTimeout(() => { el.classList.add("out"); setTimeout(() => el.remove(), 300); }, 3800);
  }

  function setRangeFill(range) {
    const pct = ((range.value - range.min) / (range.max - range.min)) * 100;
    range.style.setProperty("--fill", clamp(pct, 0, 100) + "%");
  }

  /* ---------- selects ---------- */

  function fillBoroughs() {
    boroughSel.innerHTML = Object.keys(BOROUGHS).map(b => `<option>${b}</option>`).join("");
  }

  function fillHoods(borough, selected) {
    const list = HOODS[borough] || [];
    hoodSel.innerHTML = list.map(h => `<option>${h.replace(/&/g, "&amp;")}</option>`).join("");
    hoodSel.value = selected && list.includes(selected) ? selected : list[0];
  }

  boroughSel.addEventListener("change", () => {
    fillHoods(boroughSel.value);
    const c = BOROUGHS[boroughSel.value];
    setCoords(c.lat, c.lng);
    onChange();
  });
  hoodSel.addEventListener("change", onChange);

  /* ---------- linked slider + number inputs ---------- */

  function link(num, range) {
    num.addEventListener("input", () => {
      const v = parseFloat(num.value);
      if (!Number.isNaN(v)) { range.value = clamp(v, +range.min, +range.max); setRangeFill(range); }
    });
    range.addEventListener("input", () => { num.value = range.value; setRangeFill(range); onChange(); });
  }
  link(priceNum, priceRange);
  link(availNum, availRange);

  $$(".stepper button").forEach(btn => {
    btn.addEventListener("click", () => {
      const input = $("#" + btn.dataset.target);
      const next = (parseInt(input.value, 10) || 1) + Number(btn.dataset.step);
      input.value = clamp(next, +input.min, +input.max);
      onChange();
    });
  });

  /* ---------- location pad ---------- */

  const canvas = $("#pad");
  const ctx = canvas.getContext("2d");
  const BOUNDS = { latMin: 40.48, latMax: 40.93, lngMin: -74.28, lngMax: -73.68 };
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let W = 0, H = 0, dragging = false;

  const toXY = (lat, lng) => ({
    x: ((lng - BOUNDS.lngMin) / (BOUNDS.lngMax - BOUNDS.lngMin)) * W,
    y: ((BOUNDS.latMax - lat) / (BOUNDS.latMax - BOUNDS.latMin)) * H,
  });
  const toLatLng = (x, y) => ({
    lat: BOUNDS.latMax - (y / H) * (BOUNDS.latMax - BOUNDS.latMin),
    lng: BOUNDS.lngMin + (x / W) * (BOUNDS.lngMax - BOUNDS.lngMin),
  });

  function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    W = rect.width; H = rect.height;
    canvas.width = W * dpr; canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  function drawPad(t = 0) {
    if (!W) return;
    ctx.clearRect(0, 0, W, H);

    // faint coordinate grid
    ctx.lineWidth = 1;
    ctx.strokeStyle = "rgba(255,255,255,0.045)";
    for (let lat = 40.5; lat <= 40.9; lat += 0.1) {
      const { y } = toXY(lat, 0);
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }
    for (let lng = -74.2; lng <= -73.7; lng += 0.1) {
      const { x } = toXY(0, lng);
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }

    // borough glows + labels
    const active = boroughSel.value;
    ctx.font = "500 12px Figtree, system-ui, sans-serif";
    ctx.textAlign = "center";
    const tints = {
      "Manhattan": "79,141,255", "Brooklyn": "255,122,47", "Queens": "85,194,67",
      "Bronx": "252,184,39", "Staten Island": "170,140,255",
    };
    for (const [name, b] of Object.entries(BOROUGHS)) {
      const { x, y } = toXY(b.lat, b.lng);
      const rad = (b.r / (BOUNDS.lngMax - BOUNDS.lngMin)) * W * 1.5;
      const g = ctx.createRadialGradient(x, y, 0, x, y, rad);
      const a = name === active ? 0.34 : 0.14;
      g.addColorStop(0, `rgba(${tints[name]},${a})`);
      g.addColorStop(1, `rgba(${tints[name]},0)`);
      ctx.fillStyle = g;
      ctx.beginPath(); ctx.arc(x, y, rad, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = name === active ? "rgba(236,235,245,0.95)" : "rgba(155,159,182,0.7)";
      ctx.fillText(name, x, y + 4);
    }

    // marker
    const lat = parseFloat(latInput.value), lng = parseFloat(lngInput.value);
    if (Number.isFinite(lat) && Number.isFinite(lng)) {
      const { x, y } = toXY(lat, lng);
      ctx.strokeStyle = "rgba(252,184,39,0.25)";
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();

      const pulse = reduceMotion ? 0.5 : (Math.sin(t / 420) + 1) / 2;
      ctx.strokeStyle = `rgba(252,184,39,${0.55 - pulse * 0.4})`;
      ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(x, y, 9 + pulse * 9, 0, Math.PI * 2); ctx.stroke();

      ctx.shadowColor = "rgba(0,0,0,0.6)"; ctx.shadowBlur = 8; ctx.shadowOffsetY = 2;
      ctx.fillStyle = "#fcb827";
      ctx.beginPath(); ctx.arc(x, y, 7, 0, Math.PI * 2); ctx.fill();
      ctx.shadowColor = "transparent";
      ctx.fillStyle = "#1b1404";
      ctx.beginPath(); ctx.arc(x, y, 2.5, 0, Math.PI * 2); ctx.fill();
    }
  }

  function loop(t) { drawPad(t); requestAnimationFrame(loop); }

  function setCoords(lat, lng) {
    latInput.value = (+lat).toFixed(4);
    lngInput.value = (+lng).toFixed(4);
  }

  function pickFromPointer(e) {
    const rect = canvas.getBoundingClientRect();
    const x = clamp(e.clientX - rect.left, 0, rect.width);
    const y = clamp(e.clientY - rect.top, 0, rect.height);
    const { lat, lng } = toLatLng(x, y);
    setCoords(lat, lng);
    onChange();
  }

  canvas.addEventListener("pointerdown", e => { dragging = true; canvas.setPointerCapture(e.pointerId); pickFromPointer(e); });
  canvas.addEventListener("pointermove", e => { if (dragging) pickFromPointer(e); });
  canvas.addEventListener("pointerup", () => { dragging = false; });
  canvas.addEventListener("keydown", e => {
    const step = e.shiftKey ? 0.01 : 0.002;
    const d = { ArrowUp: [step, 0], ArrowDown: [-step, 0], ArrowLeft: [0, -step], ArrowRight: [0, step] }[e.key];
    if (!d) return;
    e.preventDefault();
    setCoords((parseFloat(latInput.value) || 40.73) + d[0], (parseFloat(lngInput.value) || -73.95) + d[1]);
    onChange();
  });
  new ResizeObserver(resizeCanvas).observe(canvas);

  /* ---------- validation (mirrors the pydantic model) ---------- */

  function readValues() {
    return {
      latitude: latInput.value, longitude: lngInput.value, price: priceNum.value,
      minimum_nights: $("#minimum_nights").value, number_of_reviews: $("#number_of_reviews").value,
      reviews_per_month: $("#reviews_per_month").value,
      calculated_host_listings_count: $("#calculated_host_listings_count").value,
      availability_365: availNum.value,
    };
  }

  function validate(showErrors = true) {
    const raw = readValues();
    const errors = {};
    const payload = {};

    for (const [key, rule] of Object.entries(FIELDS)) {
      const text = String(raw[key]).trim();
      const n = Number(text);
      let msg = "";
      if (text === "" || Number.isNaN(n)) msg = `Enter a value for ${rule.label.toLowerCase()}.`;
      else if (rule.int && !Number.isInteger(n)) msg = `${rule.label} must be a whole number.`;
      else if (rule.gt !== undefined && n <= rule.gt) msg = `${rule.label} must be more than ${rule.gt}.`;
      else if (rule.min !== undefined && n < rule.min) msg = `${rule.label} must be at least ${rule.min}.`;
      else if (rule.max !== undefined && n > rule.max) msg = `${rule.label} must be ${rule.max} or less.`;
      if (msg) errors[key] = msg; else payload[key] = n;
    }

    payload.neighbourhood_group = boroughSel.value;
    payload.neighbourhood = hoodSel.value;

    if (showErrors) {
      $$("[data-error-for]").forEach(el => {
        const key = el.dataset.errorFor;
        el.textContent = errors[key] || "";
        el.closest(".field").classList.toggle("invalid", !!errors[key]);
      });
    }
    return { ok: Object.keys(errors).length === 0, errors, payload };
  }

  /* ---------- prediction ---------- */

  let inflight = 0;

  async function predict(payload) {
    const id = ++inflight;
    lastPayload = payload;
    setState("loading");
    predictBtn.classList.add("is-loading");
    predictBtn.disabled = true;
    const started = performance.now();

    try {
      const res = await fetch(`${API.replace(/\/$/, "")}/predict`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        let detail = `Server returned ${res.status}.`;
        try {
          const j = await res.json();
          if (Array.isArray(j.detail)) {
            detail = j.detail.map(d => `${(d.loc || []).slice(1).join(".")}: ${d.msg}`).join(" · ");
          } else if (j.detail) detail = String(j.detail);
        } catch { /* body wasn't JSON */ }
        throw new Error(detail);
      }
      const data = await res.json();
      if (id !== inflight) return; // a newer request superseded this one

      // keep the spinner visible for a beat so the transition feels intentional
      const wait = 450 - (performance.now() - started);
      if (wait > 0) await new Promise(r => setTimeout(r, wait));

      showResult(data);
      pushHistory(payload, data);
      setStatus("ok", "API online");
    } catch (err) {
      if (id !== inflight) return;
      const offline = err instanceof TypeError;
      $("#errorText").textContent = offline
        ? `Can't reach the API at ${API}. Start the server with "uvicorn main:app --reload" or update the address.`
        : err.message;
      setState("error");
      if (offline) setStatus("bad", "API offline");
    } finally {
      if (id === inflight) {
        predictBtn.classList.remove("is-loading");
        predictBtn.disabled = false;
      }
    }
  }

  function setState(s) { resultCard.dataset.state = s; }

  function showResult(data) {
    const probs = data.Probability || [];
    let idx = ROOMS.findIndex(r => r.name === data.Predicted_room_type);
    if (idx < 0) idx = probs.indexOf(Math.max(...probs));
    const room = ROOMS[idx] || ROOMS[0];
    const conf = (probs[idx] ?? Math.max(...probs, 0)) * 100;

    $("#resLabel").textContent = data.Predicted_room_type;
    $("#resBlurb").textContent = room.blurb;
    const bullet = $("#resBullet");
    bullet.textContent = room.letter;
    bullet.style.setProperty("--c", room.color);

    const ring = $("#ringValue");
    ring.style.setProperty("--c", room.color);
    ring.style.strokeDashoffset = 326.73;

    // build bars (sorted high → low)
    const bars = $("#bars");
    bars.innerHTML = "";
    ROOMS.map((r, i) => ({ r, p: (probs[i] || 0) * 100, top: i === idx }))
      .sort((a, b) => b.p - a.p)
      .forEach(({ r, top }) => {
        const li = document.createElement("li");
        li.className = "bar" + (top ? " is-top" : "");
        li.style.setProperty("--c", r.color);
        li.innerHTML = `
          <div class="bar__top">
            <span class="bar__name"><span class="bullet" style="--c:${r.color}">${r.letter}</span>${r.name}</span>
            <span class="bar__pct">0%</span>
          </div>
          <div class="bar__track"><div class="bar__fill"></div></div>`;
        li.dataset.p = probs[ROOMS.indexOf(r)] * 100 || 0;
        bars.appendChild(li);
      });

    setState("result");

    // animate after the state is painted
    requestAnimationFrame(() => requestAnimationFrame(() => {
      ring.style.strokeDashoffset = 326.73 * (1 - conf / 100);
      countUp($("#resConf"), conf);
      $$(".bar", bars).forEach(li => {
        const p = parseFloat(li.dataset.p);
        $(".bar__fill", li).style.width = p + "%";
        countUp($(".bar__pct", li), p);
      });
    }));
  }

  function countUp(el, to, ms = 900) {
    if (reduceMotion) { el.textContent = Math.round(to) + "%"; return; }
    const t0 = performance.now();
    const tick = now => {
      const k = clamp((now - t0) / ms, 0, 1);
      const eased = 1 - Math.pow(1 - k, 3);
      el.textContent = Math.round(to * eased) + "%";
      if (k < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  /* ---------- history ---------- */

  function pushHistory(payload, data) {
    const probs = data.Probability || [];
    history.unshift({ payload, label: data.Predicted_room_type, conf: Math.max(...probs) });
    history = history.slice(0, 5);
    store.set("rtp.history", history);
    renderHistory();
  }

  function renderHistory() {
    historyCard.hidden = history.length === 0;
    historyList.innerHTML = "";
    history.forEach((h, i) => {
      const room = ROOMS.find(r => r.name === h.label) || ROOMS[0];
      const li = document.createElement("li");
      li.innerHTML = `
        <button type="button" data-i="${i}">
          <span class="bullet" style="--c:${room.color}">${room.letter}</span>
          <span class="history__main">
            <span class="history__title">${room.short} · ${Math.round(h.conf * 100)}%</span>
            <span class="history__sub">${escapeHtml(h.payload.neighbourhood)}, $${h.payload.price}/night</span>
          </span>
        </button>`;
      historyList.appendChild(li);
    });
  }
  const escapeHtml = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  historyList.addEventListener("click", e => {
    const btn = e.target.closest("button[data-i]");
    if (!btn) return;
    applyValues(history[+btn.dataset.i].payload);
    toast("Restored that listing.");
  });
  $("#clearHistory").addEventListener("click", () => { history = []; store.set("rtp.history", history); renderHistory(); });

  /* ---------- form wiring ---------- */

  function applyValues(v) {
    boroughSel.value = v.neighbourhood_group;
    fillHoods(v.neighbourhood_group, v.neighbourhood);
    setCoords(v.latitude, v.longitude);
    priceNum.value = v.price; priceRange.value = clamp(v.price, +priceRange.min, +priceRange.max);
    availNum.value = v.availability_365; availRange.value = v.availability_365;
    $("#minimum_nights").value = v.minimum_nights;
    $("#number_of_reviews").value = v.number_of_reviews;
    $("#reviews_per_month").value = v.reviews_per_month;
    $("#calculated_host_listings_count").value = v.calculated_host_listings_count;
    setRangeFill(priceRange); setRangeFill(availRange);
    validate();
    if (liveToggle.checked) submit(); 
  }

  function randomListing() {
    const b = Object.keys(BOROUGHS)[randInt(0, 4)];
    const c = BOROUGHS[b];
    const list = HOODS[b];
    const price = b === "Manhattan" ? randInt(60, 450) : randInt(30, 250);
    return {
      neighbourhood_group: b, neighbourhood: list[randInt(0, list.length - 1)],
      latitude: c.lat + rand(-c.r, c.r) * 0.6, longitude: c.lng + rand(-c.r, c.r) * 0.6,
      price, minimum_nights: [1, 1, 2, 3, 7, 30][randInt(0, 5)],
      number_of_reviews: randInt(0, 220), reviews_per_month: +rand(0, 4).toFixed(2),
      calculated_host_listings_count: [1, 1, 1, 2, 3, 6, 20][randInt(0, 6)],
      availability_365: randInt(0, 365),
    };
  }

  $$("[data-preset]").forEach(btn => btn.addEventListener("click", () => applyValues(PRESETS[btn.dataset.preset])));
  $("#randomBtn").addEventListener("click", () => applyValues(randomListing()));

  const liveSubmit = debounce(() => { if (liveToggle.checked) submit(); }, 450);

  function onChange() {
    // clear stale errors as the user types
    const v = validate(true);
    if (v.ok) liveSubmit();
  }
  $$("input[type=number]").forEach(i => i.addEventListener("input", onChange));

  function submit() {
    const v = validate(true);
    if (!v.ok) {
      const first = Object.keys(v.errors)[0];
      $("#" + first).focus();
      toast("Fix the highlighted fields first.", "bad");
      return;
    }
    predict(v.payload);
  }

  form.addEventListener("submit", e => { e.preventDefault(); submit(); });
  $("#retryBtn").addEventListener("click", () => lastPayload ? predict(lastPayload) : submit());

  liveToggle.addEventListener("change", () => {
    store.set("rtp.live", liveToggle.checked);
    if (liveToggle.checked) { toast("Live mode on. Predictions update as you edit.", "ok"); submit(); }
  });

  /* ---------- API status ---------- */

  function setStatus(state, text) {
    statusBtn.dataset.state = state;
    $("#statusText").textContent = text;
  }

  async function checkApi() {
    setStatus("wait", "Checking API…");
    const ctl = new AbortController();
    const timer = setTimeout(() => ctl.abort(), 4000);
    try {
      const res = await fetch(API.replace(/\/$/, "") + "/", { signal: ctl.signal });
      setStatus(res.ok ? "ok" : "bad", res.ok ? "API online" : `API error ${res.status}`);
    } catch {
      setStatus("bad", "API offline");
    } finally { clearTimeout(timer); }
  }

  statusBtn.addEventListener("click", () => { apiUrlInput.value = API; dialog.showModal(); });
  dialog.addEventListener("close", () => {
    if (dialog.returnValue === "save" && apiUrlInput.value.trim()) {
      API = apiUrlInput.value.trim();
      store.set("rtp.api", API);
      checkApi();
    }
  });

  /* ---------- init ---------- */

  fillBoroughs();
  fillHoods("Manhattan", "Midtown");
  boroughSel.value = "Manhattan";
  applyValues(PRESETS.midtown);   // sensible defaults so the form is never empty
  liveToggle.checked = store.get("rtp.live", false);
  renderHistory();
  resizeCanvas();
  requestAnimationFrame(loop);
  checkApi();
})();
