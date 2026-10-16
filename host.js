// Host screen: create a game, deal cards, run the timer, judge pitches. Project this page for the room.
// Keep this tab open for the whole game: it drives the timer and the round flow.

const HOST_KEY = "phd-host-game";
const H = { game: null, teams: [], hands: {}, personaDeck: [], productDeck: [], sig: "", busy: false, subscribed: false };

const CODE_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ";

function makeCode() {
  return Array.from({ length: 5 }, () => CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]).join("");
}

function drawFrom(key, source) {
  if (!H[key].length) H[key] = shuffle(source);
  return H[key].pop();
}

function activeTeams() { return H.teams.filter((t) => !isDone(t)); }
function teamById(id) { return H.teams.find((t) => t.id === id); }

async function start() {
  if (!configOk()) return showFatal("Add your Supabase URL and anon key to <code>config.js</code>. See README.md.");
  try { await initBackend(); } catch (e) { return showFatal(esc(e.message)); }
  setInterval(tick, 250);
  let id = null;
  try { id = localStorage.getItem(HOST_KEY); } catch (e) {}
  if (id) {
    const { data } = await sb.from("games").select("*").eq("id", id).maybeSingle();
    if (data && data.host_uid === me) return resume(data.id);
  }
  renderNoGame();
}

function renderNoGame() {
  $("tracker").classList.add("hidden");
  $("app").innerHTML = `<div class="panel center"><h2>Host a game</h2>
    <p class="muted">Students will join from their own devices with a game code.</p>
    <button class="btn primary big wide" id="btnCreate">Create Game</button></div>`;
  $("btnCreate").addEventListener("click", createGame);
}

async function createGame() {
  $("btnCreate").disabled = true;
  for (let i = 0; i < 5; i++) {
    const { data, error } = await sb.from("games").insert({ code: makeCode() }).select().single();
    if (!error) {
      try { localStorage.setItem(HOST_KEY, data.id); } catch (e) {}
      return resume(data.id);
    }
    if (error.code !== "23505") return showFatal("Could not create the game: " + esc(error.message));
  }
  showFatal("Could not generate a unique game code. Try again.");
}

function resume(gameId) {
  if (!H.subscribed) {
    H.subscribed = true;
    subscribeGame(gameId, () => refresh(gameId));
  }
  refresh(gameId);
}

async function refresh(gameId) {
  const [g, t] = await Promise.all([
    sb.from("games").select("*").eq("id", gameId).maybeSingle(),
    sb.from("teams").select("*").eq("game_id", gameId).order("created_at")
  ]);
  if (!g.data) return renderNoGame();
  H.game = g.data;
  H.teams = t.data || [];
  const { data: hands } = await sb.from("hands").select("*").eq("game_id", gameId).eq("round", H.game.round);
  H.hands = {};
  (hands || []).forEach((h) => { H.hands[h.team_id] = h; });
  render();
}

/* ---------- actions ---------- */

async function guarded(fn) {
  if (H.busy) return;
  H.busy = true;
  try {
    await fn();
    await refresh(H.game.id);
  } finally {
    H.busy = false;
  }
}

function dealRound() {
  return guarded(async () => {
    const round = H.game.round + 1;
    const active = activeTeams();
    const rows = active.map((team) => {
      const remaining = STAGES.filter((s) => !team.collected.includes(s.name));
      return {
        game_id: H.game.id, team_id: team.id, round,
        persona: drawFrom("personaDeck", PERSONAS),
        product: drawFrom("productDeck", PRODUCTS),
        stage: remaining[Math.floor(Math.random() * remaining.length)].name
      };
    });
    await sb.from("teams").update({ last_result: null }).eq("game_id", H.game.id);
    await sb.from("hands").insert(rows);
    await sb.from("games").update({ status: "prep", round, prep_ends_at: null, pitch_order: [], pitch_index: 0 }).eq("id", H.game.id);
  });
}

function startPrepTimer() {
  return guarded(async () => {
    beep(660, 0.2);
    const end = new Date(serverNow() + PREP_SECONDS * 1000).toISOString();
    await sb.from("games").update({ prep_ends_at: end }).eq("id", H.game.id);
  });
}

function startPitches() {
  return guarded(async () => {
    if (H.game.status !== "prep") return;
    const order = shuffle(activeTeams()).map((t) => t.id);
    await sb.from("games").update({ status: "pitch", pitch_order: order, pitch_index: 0, prep_ends_at: null }).eq("id", H.game.id);
  });
}

function judge(passed) {
  return guarded(async () => {
    const g = H.game;
    const team = teamById(g.pitch_order[g.pitch_index]);
    const hand = H.hands[team.id];
    const update = { last_result: passed ? "pass" : "fail" };
    if (passed) {
      update.collected = team.collected.concat(hand.stage);
      if (update.collected.length >= STAGES.length) {
        update.finished_round = g.round;
        update.finish_order = H.teams.filter((t) => t.finish_order).length + 1;
      }
      beep(988, 0.15);
      setTimeout(() => beep(1318, 0.25), 150);
      confetti();
    } else {
      beep(200, 0.4);
    }
    await sb.from("teams").update(update).eq("id", team.id);
    const next = g.pitch_index + 1;
    await sb.from("games").update(next < g.pitch_order.length ? { pitch_index: next } : { status: "summary" }).eq("id", g.id);
  });
}

function nextAfterSummary() {
  if (activeTeams().length === 0) {
    return guarded(async () => { await sb.from("games").update({ status: "over" }).eq("id", H.game.id); });
  }
  return dealRound();
}

async function newGame() {
  try { localStorage.removeItem(HOST_KEY); } catch (e) {}
  location.reload();
}

async function startGame() {
  if (H.teams.length < 1) return;
  dealRound();
}

/* ---------- rendering ---------- */

function joinUrl() {
  return location.href.replace(/host\.html.*$/, "index.html");
}

function render() {
  const { game, teams } = H;
  const sig = JSON.stringify([game.status, game.round, game.prep_ends_at, game.pitch_index, teams.map((t) => [t.id, t.collected.length, t.last_result]), Object.keys(H.hands).length]);
  if (sig === H.sig) return;
  H.sig = sig;

  $("tracker").classList.toggle("hidden", game.status === "lobby");
  $("tracker").innerHTML = teams.map((t) => `<div class="tracker-team${isDone(t) ? " done" : ""}"><b>${esc(t.name)}</b><div>${badgesHtml(t)}</div></div>`).join("");

  const app = $("app");

  if (game.status === "lobby") {
    app.innerHTML = `<div class="panel wide-panel center">
      <p class="muted">Students go to</p><p class="join-url">${esc(joinUrl())}</p>
      <p class="muted">and enter the code</p><div class="code-box">${esc(game.code)}</div>
      <h3>${teams.length} team${teams.length === 1 ? "" : "s"} joined</h3>
      <div class="chips">${teams.map((t) => `<span class="chip">${esc(t.name)}</span>`).join("") || '<span class="muted">Waiting for teams…</span>'}</div>
      <button class="btn primary big wide" id="btnStartGame" ${teams.length ? "" : "disabled"}>Start Game</button></div>`;
    $("btnStartGame").addEventListener("click", startGame);
    return;
  }

  if (game.status === "prep") {
    const waiting = !game.prep_ends_at;
    app.innerHTML = `<div class="round-title">Round ${game.round}: everyone prepares at once</div>
      <div class="timer-wrap"><div class="timer" id="timer">${waiting ? PREP_SECONDS : "--"}</div><div class="bar"><div id="timerBar"></div></div>
      <p class="muted">${activeTeams().length} team${activeTeams().length === 1 ? "" : "s"} have their cards on their own devices.</p>
      <div class="btn-row">${waiting
        ? '<button class="btn primary big" id="btnTimer">Start Prep Timer</button>'
        : '<button class="btn secondary" id="btnEnd">End prep early</button>'}</div></div>
      <div class="chips">${activeTeams().map((t) => `<span class="chip">${esc(t.name)}</span>`).join("")}</div>`;
    if (waiting) $("btnTimer").addEventListener("click", startPrepTimer);
    else { $("btnEnd").addEventListener("click", startPitches); tick(); }
    return;
  }

  if (game.status === "pitch") {
    const team = teamById(game.pitch_order[game.pitch_index]);
    const hand = team && H.hands[team.id];
    app.innerHTML = `<div class="round-title">Round ${game.round}: live pitches (${game.pitch_index + 1} of ${game.pitch_order.length})</div>
      <div class="spotlight"><div class="up-next">🎤 On stage: <b>${esc(team ? team.name : "")}</b></div>
      <div class="cards">${hand ? handHtml(hand) : ""}</div>
      <p class="judge-q">Judges: did the pitch fit this customer at this stage?</p>
      <div class="btn-row"><button class="btn pass big" id="btnPass">✓ Pass</button><button class="btn fail big" id="btnFail">✗ Fail</button></div></div>`;
    $("btnPass").addEventListener("click", () => judge(true));
    $("btnFail").addEventListener("click", () => judge(false));
    return;
  }

  if (game.status === "summary") {
    const rows = game.pitch_order.map((id) => {
      const t = teamById(id);
      const h = H.hands[id];
      if (!t || !h) return "";
      const s = stageByName(h.stage);
      const pass = t.last_result === "pass";
      const note = pass ? (isDone(t) ? "Collected all four cards! 🏁" : `Earned ${s.icon} ${s.name}`) : `Missed ${s.icon} ${s.name} (it will come back)`;
      return `<div class="result-row ${pass ? "ok" : "no"}"><div><b>${esc(t.name)}</b><br><small>${note}</small></div>
        <div class="badges">${badgesHtml(t)}</div><div class="verdict">${pass ? "✓ PASS" : "✗ FAIL"}</div></div>`;
    }).join("");
    const over = activeTeams().length === 0;
    app.innerHTML = `<div class="panel wide-panel"><h2>Round ${game.round} results</h2>${rows}
      <button class="btn primary big wide" id="btnNext">${over ? "See Final Results" : "Deal Next Round"}</button></div>`;
    $("btnNext").addEventListener("click", nextAfterSummary);
    return;
  }

  if (game.status === "over") {
    const medals = ["🥇", "🥈", "🥉"];
    const rows = rankTeams(teams).map((t, i) => `<div class="result-row ok"><div><b>${medals[i] || i + 1 + "."} ${esc(t.name)}</b><br>
      <small>Finished in round ${t.finished_round}</small></div><div class="badges">${badgesHtml(t)}</div></div>`).join("");
    app.innerHTML = `<div class="panel wide-panel"><h2>🏆 Game over!</h2><p class="muted">Ranked by fewest rounds:</p>${rows}
      <button class="btn primary big wide" id="btnNew">New Game</button></div>`;
    $("btnNew").addEventListener("click", newGame);
    confetti();
  }
}

// Runs 4x a second: updates the countdown and ends prep when it hits zero.
function tick() {
  const g = H.game;
  if (!g || g.status !== "prep" || !g.prep_ends_at) return;
  const left = Math.max(0, Math.ceil((new Date(g.prep_ends_at).getTime() - serverNow()) / 1000));
  const el = $("timer");
  if (el) {
    if (el.textContent !== String(left)) {
      if (left <= 10 && left > 0) beep(520, 0.08);
      el.textContent = left;
    }
    el.classList.toggle("low", left <= 10 && left > 0);
    $("timerBar").style.width = (left / PREP_SECONDS) * 100 + "%";
  }
  if (left <= 0) { beep(880, 0.6); startPitches(); }
}

start();
