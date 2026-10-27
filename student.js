// Student device: join with a code and team name, then see only your own cards.

const SAVE_KEY = "phd-team";
const S = { game: null, team: null, teams: [], hand: null, sig: "" };

function saved() {
  try { return JSON.parse(localStorage.getItem(SAVE_KEY)); } catch (e) { return null; }
}
function save(v) {
  try { v ? localStorage.setItem(SAVE_KEY, JSON.stringify(v)) : localStorage.removeItem(SAVE_KEY); } catch (e) {}
}

async function start() {
  if (!configOk()) return showFatal("Add your Supabase URL and anon key to <code>config.js</code>. See README.md.");
  try { await initBackend(); } catch (e) { return showFatal(esc(e.message)); }

  const s = saved();
  if (s) {
    const { data: team } = await sb.from("teams").select("*").eq("id", s.teamId).maybeSingle();
    if (team && team.owner_uid === me) return enterGame(team.game_id, team);
    save(null);
  }
  $("btnJoin").addEventListener("click", join);
}

async function join() {
  const code = $("joinCode").value.trim().toUpperCase();
  const name = $("joinName").value.trim();
  const err = (m) => { $("joinError").textContent = m; };
  if (!code || !name) return err("Enter the game code and a team name.");
  err("");
  $("btnJoin").disabled = true;
  const { data: game } = await sb.from("games").select("*").eq("code", code).maybeSingle();
  if (!game) { $("btnJoin").disabled = false; return err("No game found with that code."); }
  if (game.status !== "lobby") {
    // Game already running: this is a team getting back in. Match by exact team name.
    const { data: teamId } = await sb.rpc("rejoin_team", { p_code: code, p_name: name });
    $("btnJoin").disabled = false;
    if (!teamId) return err("That game has already started. To get back in, enter your exact team name.");
    const { data: back } = await sb.from("teams").select("*").eq("id", teamId).single();
    save({ teamId });
    return enterGame(game.id, back);
  }
  const { data: team, error } = await sb.from("teams").insert({ game_id: game.id, name }).select().single();
  $("btnJoin").disabled = false;
  if (error) return err(error.code === "23505" ? "That team name is taken. Pick another." : "Could not join: " + error.message);
  save({ teamId: team.id });
  enterGame(game.id, team);
}

function enterGame(gameId, team) {
  S.team = team;
  $("viewJoin").classList.add("hidden");
  $("viewGame").classList.remove("hidden");
  $("teamHeader").classList.remove("hidden");
  const refresh = () => refreshState(gameId);
  subscribeGame(gameId, refresh);
  setInterval(tickTimer, 250);
  refresh();
}

async function refreshState(gameId) {
  const [g, t, ts] = await Promise.all([
    sb.from("games").select("*").eq("id", gameId).maybeSingle(),
    sb.from("teams").select("*").eq("id", S.team.id).maybeSingle(),
    sb.from("teams").select("*").eq("game_id", gameId)
  ]);
  if (!g.data || !t.data) { save(null); return showFatal("This game has ended. Reload the page to join a new one."); }
  S.game = g.data; S.team = t.data; S.teams = ts.data || [];
  const { data: hand } = await sb.from("hands").select("*").eq("team_id", S.team.id).eq("round", S.game.round).maybeSingle();
  S.hand = hand;
  render();
}

function render() {
  const { game, team, hand } = S;
  const sig = JSON.stringify([game.status, game.round, game.prep_ends_at, game.pitch_index, team.collected, team.last_result, hand && hand.id, S.teams.length]);
  if (sig === S.sig) return;
  S.sig = sig;

  $("teamHeader").innerHTML = `<b>${esc(team.name)}</b> <span class="badges">${badgesHtml(team)}</span> <span class="code-chip" title="Game code">${esc(game.code)}</span>`;
  const body = $("viewGame");

  if (game.status === "lobby") {
    body.innerHTML = `<div class="panel center"><h2>You're in! 🎉</h2>
      <p>Waiting for the host to start the game.</p><p class="muted">${S.teams.length} team${S.teams.length === 1 ? "" : "s"} joined so far.</p></div>`;
    return;
  }

  if (game.status === "prep") {
    if (!hand) { body.innerHTML = `<div class="panel center"><h2>Dealing your cards…</h2></div>`; return; }
    if (!game.prep_ends_at) {
      body.innerHTML = `<div class="panel center"><h2>Round ${game.round}</h2>
        <p>Your cards are dealt. They'll appear the moment the host starts the clock. Get ready!</p></div>`;
      return;
    }
    body.innerHTML = `<div class="round-title">Round ${game.round}: build your pitch!</div>
      <div class="timer-wrap"><div class="timer" id="timer">--</div><div class="bar"><div id="timerBar"></div></div></div>
      <div class="cards">${handHtml(hand)}</div>`;
    tickTimer();
    return;
  }

  if (game.status === "pitch") {
    const onStage = game.pitch_order[game.pitch_index] === team.id;
    const myPos = game.pitch_order.indexOf(team.id);
    const cards = hand ? `<div class="cards">${handHtml(hand)}</div>` : "";
    if (onStage) {
      body.innerHTML = `<div class="up-next">🎤 <b>You're up!</b></div><p class="center muted">Pitch live to the judges. Don't forget who your customer is.</p>${cards}`;
    } else if (myPos >= 0 && myPos < game.pitch_index) {
      const pass = team.last_result === "pass";
      body.innerHTML = `<div class="panel center"><h2 class="${pass ? "pass-text" : "fail-text"}">${pass ? "✓ You passed!" : "✗ Not this time"}</h2>
        <p class="muted">Watch the other teams pitch.</p></div>`;
    } else {
      const who = S.teams.find((t) => t.id === game.pitch_order[game.pitch_index]);
      const wait = myPos - game.pitch_index;
      body.innerHTML = `<div class="panel center"><h2>Now pitching: ${esc(who ? who.name : "…")}</h2>
        <p>You pitch in <b>${wait}</b> team${wait === 1 ? "" : "s"}. Keep refining.</p></div>${cards}`;
    }
    return;
  }

  if (game.status === "summary") {
    const pass = team.last_result === "pass";
    const done = isDone(team);
    body.innerHTML = `<div class="panel center">
      <h2 class="${pass ? "pass-text" : "fail-text"}">${done ? "🏁 You collected all four!" : pass ? "✓ You passed!" : team.last_result === "fail" ? "✗ Not this time" : "Round complete"}</h2>
      <p class="muted">${done ? "Waiting for the other teams to finish." : "Waiting for the host to deal the next round."}</p></div>`;
    if (pass) confetti();
    return;
  }

  if (game.status === "over") {
    const ranked = rankTeams(S.teams);
    const rank = ranked.findIndex((t) => t.id === team.id) + 1;
    const medals = ["🥇", "🥈", "🥉"];
    body.innerHTML = `<div class="panel center"><h2>🏆 Game over!</h2>
      <p class="big-rank">${medals[rank - 1] || "#" + rank}</p><p>You finished in round ${team.finished_round}. Thanks for playing!</p></div>`;
    confetti();
  }
}

function tickTimer() {
  const { game } = S;
  const el = $("timer");
  if (!el || !game || !game.prep_ends_at) return;
  const left = Math.max(0, Math.ceil((new Date(game.prep_ends_at).getTime() - serverNow()) / 1000));
  el.textContent = left > 0 ? left : "Time's up!";
  el.classList.toggle("low", left <= 10 && left > 0);
  $("timerBar").style.width = (left / PREP_SECONDS) * 100 + "%";
}

start();
