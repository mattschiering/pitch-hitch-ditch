// Shared code for the student page (index.html) and the host page (host.html).

const $ = (id) => document.getElementById(id);
let sb = null;
let me = null;          // this device's anonymous user id
let serverOffset = 0;   // server clock minus local clock, in ms

function configOk() {
  return !SUPABASE_URL.startsWith("YOUR_") && !SUPABASE_ANON_KEY.startsWith("YOUR_");
}

async function initBackend() {
  sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  const { data: { session } } = await sb.auth.getSession();
  if (!session) {
    const { error } = await sb.auth.signInAnonymously();
    if (error) throw new Error("Sign-in failed. Is Anonymous Sign-Ins enabled in Supabase? (" + error.message + ")");
  }
  me = (await sb.auth.getUser()).data.user.id;
  const t0 = Date.now();
  const { data: now } = await sb.rpc("server_now");
  if (now) serverOffset = new Date(now).getTime() - (t0 + Date.now()) / 2;
}

function serverNow() { return Date.now() + serverOffset; }

// Live updates: calls onChange whenever the game, its teams or its hands change.
// A slow poll backs it up in case the realtime connection drops.
function subscribeGame(gameId, onChange) {
  const ch = sb.channel("game-" + gameId);
  [["games", `id=eq.${gameId}`], ["teams", `game_id=eq.${gameId}`], ["hands", `game_id=eq.${gameId}`]].forEach(([table, filter]) => {
    ch.on("postgres_changes", { event: "*", schema: "public", table, filter }, () => onChange());
  });
  ch.subscribe();
  setInterval(onChange, 5000);
}

function esc(s) {
  return String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
}

function shuffle(list) {
  const a = list.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function stageByName(name) { return STAGES.find((s) => s.name === name); }
function isDone(team) { return team.collected.length >= STAGES.length; }

function rankTeams(teams) {
  return teams.filter(isDone).sort((a, b) => a.finished_round - b.finished_round || a.finish_order - b.finish_order);
}

/* ---------- rendering ---------- */

function cardHtml(type, data, compact) {
  const cls = `card ${type}${compact ? " compact" : ""}`;
  if (type === "persona") {
    return `<article class="${cls}"><div class="label">Buyer Persona</div><h3>${esc(data.name)}</h3>
      <dl><dt>Age</dt><dd>${data.age}</dd><dt>Income</dt><dd>${esc(data.income)}</dd>
      <dt>Location</dt><dd>${esc(data.location)}</dd><dt>Traits</dt><dd>${esc(data.traits)}</dd></dl></article>`;
  }
  if (type === "product") {
    return `<article class="${cls}"><div class="label">Product</div><h3>${esc(data.name)}</h3>
      <dl><dt>What it is</dt><dd>${esc(data.description)}</dd><dt>Price</dt><dd>${esc(data.price)}</dd></dl></article>`;
  }
  return `<article class="${cls}"><div class="label">Buyer Journey</div><div class="big-icon">${data.icon}</div>
    <h3>${esc(data.name)}</h3><dl><dt>Your goal</dt><dd>${esc(data.goal)}</dd></dl>
    <ul>${data.tips.map((t) => `<li>${esc(t)}</li>`).join("")}</ul></article>`;
}

// hand is a row from the hands table: { persona, product, stage }
function handHtml(hand, compact) {
  return cardHtml("persona", hand.persona, compact) + cardHtml("product", hand.product, compact) + cardHtml("stage", stageByName(hand.stage), compact);
}

function badgesHtml(team) {
  return STAGES.map((s) => `<span class="badge${team.collected.includes(s.name) ? " got" : ""}" title="${esc(s.name)}">${s.icon}</span>`).join("");
}

/* ---------- audio & confetti ---------- */

function beep(freq = 880, dur = 0.25) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    osc.frequency.value = freq;
    osc.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + dur);
  } catch (e) { /* audio not available */ }
}

function confetti() {
  const box = $("confetti");
  const bits = ["🎉", "⭐", "✨", "🎊"];
  for (let i = 0; i < 30; i++) {
    const el = document.createElement("span");
    el.textContent = bits[i % bits.length];
    el.style.left = Math.random() * 100 + "vw";
    el.style.animationDelay = Math.random() * 0.5 + "s";
    el.style.fontSize = 18 + Math.random() * 22 + "px";
    box.appendChild(el);
    setTimeout(() => el.remove(), 3000);
  }
}

function showFatal(msg) {
  document.querySelector("main").innerHTML = `<div class="panel"><h2>Setup needed</h2><p>${msg}</p></div>`;
}
