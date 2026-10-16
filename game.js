const $ = (id) => document.getElementById(id);
const SCREENS = ["screenSetup", "screenPrep", "screenPitch", "screenSummary", "screenOver"];
const MAX_TEAMS = 8;

const game = {
  teams: [],          // { name, collected: [stageName], hand, finishedRound, finishOrder, lastResult }
  round: 0,
  finishCounter: 0,
  pitchQueue: [],
  pitchIndex: 0,
  personaDeck: [],
  productDeck: [],
  timerId: null,
  secondsLeft: PREP_SECONDS
};

/* ---------- helpers ---------- */

function showScreen(id) {
  SCREENS.forEach((s) => $(s).classList.toggle("active", s === id));
  $("tracker").classList.toggle("hidden", id === "screenSetup");
}

function shuffle(list) {
  const a = list.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function esc(s) {
  return String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
}

// Draw without repeats until the deck runs out, then reshuffle
function drawFrom(deckKey, source) {
  if (!game[deckKey].length) game[deckKey] = shuffle(source);
  return game[deckKey].pop();
}

function isDone(team) {
  return team.collected.length >= STAGES.length;
}

function activeTeams() {
  return game.teams.filter((t) => !isDone(t));
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

function handHtml(hand, compact) {
  return cardHtml("persona", hand.persona, compact) + cardHtml("product", hand.product, compact) + cardHtml("stage", hand.stage, compact);
}

function badgesHtml(team) {
  return STAGES.map((s) => {
    const got = team.collected.includes(s.name);
    return `<span class="badge${got ? " got" : ""}" title="${esc(s.name)}">${s.icon}</span>`;
  }).join("");
}

function renderTracker() {
  $("tracker").innerHTML = game.teams.map((t) => `
    <div class="tracker-team${isDone(t) ? " done" : ""}">
      <b>${esc(t.name)}</b>
      <div>${badgesHtml(t)}</div>
      <small>${t.collected.length}/${STAGES.length}</small>
    </div>`).join("");
}

/* ---------- setup ---------- */

function renderTeamInputs(names) {
  $("teamInputs").innerHTML = names.map((n, i) => `
    <div class="team-input">
      <input type="text" maxlength="24" value="${esc(n)}" placeholder="Team ${i + 1}">
      ${names.length > 1 ? `<button class="x" data-i="${i}" title="Remove team">✕</button>` : ""}
    </div>`).join("");
  $("btnAddTeam").classList.toggle("hidden", names.length >= MAX_TEAMS);
}

function currentNames() {
  return Array.from($("teamInputs").querySelectorAll("input")).map((i) => i.value);
}

/* ---------- round flow ---------- */

function startGame() {
  const names = currentNames().map((n, i) => n.trim() || `Team ${i + 1}`);
  game.teams = names.map((name) => ({ name, collected: [], hand: null, finishedRound: null, finishOrder: null, lastResult: null }));
  game.round = 0;
  game.finishCounter = 0;
  game.personaDeck = [];
  game.productDeck = [];
  dealRound();
}

function dealRound() {
  game.round++;
  activeTeams().forEach((team) => {
    const remaining = STAGES.filter((s) => !team.collected.includes(s.name));
    team.hand = {
      persona: drawFrom("personaDeck", PERSONAS),
      product: drawFrom("productDeck", PRODUCTS),
      stage: remaining[Math.floor(Math.random() * remaining.length)]
    };
    team.lastResult = null;
  });
  stopTimer();
  game.secondsLeft = PREP_SECONDS;
  $("prepRoundTitle").textContent = `Round ${game.round}: everyone prepares at once`;
  $("teamGrid").innerHTML = activeTeams().map((t) => `
    <div class="team-panel">
      <h4>${esc(t.name)}</h4>
      <div class="mini-cards">${handHtml(t.hand, true)}</div>
    </div>`).join("");
  $("btnStartPrep").classList.remove("hidden");
  $("btnEndPrep").classList.add("hidden");
  $("teamGrid").classList.add("blurred");
  updateTimer();
  renderTracker();
  showScreen("screenPrep");
}

function updateTimer() {
  $("timer").textContent = game.secondsLeft;
  $("timer").classList.toggle("low", game.secondsLeft <= 10 && game.timerId !== null);
  $("timerBar").style.width = (game.secondsLeft / PREP_SECONDS) * 100 + "%";
}

function stopTimer() {
  clearInterval(game.timerId);
  game.timerId = null;
}

function startPrepTimer() {
  $("btnStartPrep").classList.add("hidden");
  $("btnEndPrep").classList.remove("hidden");
  $("teamGrid").classList.remove("blurred");
  beep(660, 0.2);
  game.timerId = setInterval(() => {
    game.secondsLeft--;
    updateTimer();
    if (game.secondsLeft <= 10 && game.secondsLeft > 0) beep(520, 0.08);
    if (game.secondsLeft <= 0) {
      beep(880, 0.6);
      startPitches();
    }
  }, 1000);
}

function startPitches() {
  stopTimer();
  game.pitchQueue = shuffle(activeTeams());
  game.pitchIndex = 0;
  showPitch();
}

function showPitch() {
  game.locked = false;
  const team = game.pitchQueue[game.pitchIndex];
  $("pitchRoundTitle").textContent = `Round ${game.round}: live pitches (${game.pitchIndex + 1} of ${game.pitchQueue.length})`;
  $("upNext").innerHTML = `🎤 On stage: <b>${esc(team.name)}</b>`;
  $("pitchCards").innerHTML = handHtml(team.hand, false);
  showScreen("screenPitch");
}

function judge(passed) {
  if (game.locked) return;
  game.locked = true;
  const team = game.pitchQueue[game.pitchIndex];
  team.lastResult = passed ? "pass" : "fail";
  if (passed) {
    team.collected.push(team.hand.stage.name);
    if (isDone(team)) {
      team.finishedRound = game.round;
      team.finishOrder = ++game.finishCounter;
    }
    beep(988, 0.15);
    setTimeout(() => beep(1318, 0.25), 150);
    confetti();
  } else {
    beep(200, 0.4);
  }
  renderTracker();
  game.pitchIndex++;
  if (game.pitchIndex < game.pitchQueue.length) {
    setTimeout(showPitch, passed ? 900 : 300);
  } else {
    setTimeout(showSummary, passed ? 1200 : 400);
  }
}

function showSummary() {
  $("summaryTitle").textContent = `Round ${game.round} results`;
  $("summaryList").innerHTML = game.pitchQueue.map((t) => {
    const pass = t.lastResult === "pass";
    const note = pass
      ? (isDone(t) ? "Collected all four cards! 🏁" : `Earned ${t.hand.stage.icon} ${t.hand.stage.name}`)
      : `Missed ${t.hand.stage.icon} ${t.hand.stage.name} (it will come back)`;
    return `<div class="result-row ${pass ? "ok" : "no"}">
      <div><b>${esc(t.name)}</b><br><small>${note}</small></div>
      <div class="badges">${badgesHtml(t)}</div>
      <div class="verdict">${pass ? "✓ PASS" : "✗ FAIL"}</div>
    </div>`;
  }).join("");
  const over = activeTeams().length === 0;
  $("btnNextRound").textContent = over ? "See Final Results" : "Deal Next Round";
  showScreen("screenSummary");
}

function showFinal() {
  const ranked = game.teams.slice().sort((a, b) => a.finishedRound - b.finishedRound || a.finishOrder - b.finishOrder);
  const medals = ["🥇", "🥈", "🥉"];
  $("finalList").innerHTML = ranked.map((t, i) => `
    <div class="result-row ok">
      <div><b>${medals[i] || i + 1 + "."} ${esc(t.name)}</b><br><small>Finished in round ${t.finishedRound}</small></div>
      <div class="badges">${badgesHtml(t)}</div>
    </div>`).join("");
  confetti();
  showScreen("screenOver");
}

/* ---------- events ---------- */

$("prepSecondsText").textContent = PREP_SECONDS;

let setupNames = ["Team 1", "Team 2", "Team 3"];
renderTeamInputs(setupNames);

$("btnAddTeam").addEventListener("click", () => {
  setupNames = currentNames();
  if (setupNames.length < MAX_TEAMS) setupNames.push(`Team ${setupNames.length + 1}`);
  renderTeamInputs(setupNames);
});

$("teamInputs").addEventListener("click", (e) => {
  const i = e.target.dataset && e.target.dataset.i;
  if (i === undefined) return;
  setupNames = currentNames();
  setupNames.splice(Number(i), 1);
  renderTeamInputs(setupNames);
});

$("btnStart").addEventListener("click", startGame);
$("btnStartPrep").addEventListener("click", startPrepTimer);
$("btnEndPrep").addEventListener("click", startPitches);
$("btnPass").addEventListener("click", () => judge(true));
$("btnFail").addEventListener("click", () => judge(false));
$("btnNextRound").addEventListener("click", () => (activeTeams().length === 0 ? showFinal() : dealRound()));
$("btnPlayAgain").addEventListener("click", () => {
  setupNames = game.teams.map((t) => t.name);
  renderTeamInputs(setupNames);
  showScreen("screenSetup");
});
