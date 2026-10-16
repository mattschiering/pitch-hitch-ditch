# Pitch, Hitch, or Ditch

Online version of the buyer-journey pitching game. Teams join from their own devices and see only their own cards. The host projects `host.html` for the room.

| Page | Who | Purpose |
|---|---|---|
| `index.html` | Students | Join with a game code and team name; see your own cards, timer and results |
| `host.html` | Host / judges | Create the game, deal cards, run the 90-second timer, judge pitches |
| `local.html` | Anyone | Single-screen version with no backend (host enters team names, everyone shares one screen) |

## One-time setup

1. **Supabase project:** create one at supabase.com (free tier is fine).
2. **Enable anonymous sign-ins:** Authentication > Sign In / Providers > turn on **Anonymous Sign-Ins**. Students don't need accounts; this gives each device a private identity so their hand stays private.
3. **Create the tables:** open the SQL Editor, paste all of `supabase/schema.sql`, and run it.
4. **Add your keys:** Project Settings > API. Copy the **Project URL** and the **anon / public key** into `config.js`. (The anon key is meant to be public; the rules in `schema.sql` protect the data.)
5. **Publish on GitHub Pages:** push this folder to a GitHub repo, then Settings > Pages > deploy from the branch. Students use `https://<you>.github.io/<repo>/`; you use `.../host.html`.

## Running a game

1. Open `host.html`, click **Create Game**, and project it. A 5-letter code appears.
2. Students open the site, enter the code and a team name. Teams appear on the projector.
3. Click **Start Game**. Each team's cards appear on their own device when you click **Start Prep Timer** (90 seconds, all teams at once).
4. When time's up, teams pitch live one at a time. Click **Pass** or **Fail**.
5. Everyone draws new cards each round. A passed Journey stage is kept and never dealt again. A team finishes when it has all four.

**Keep the host tab open** for the whole game; it drives the timer and round flow. If it reloads, it resumes the same game, though the persona and product decks reshuffle.

## Customising

Edit `cards.js` to change personas, products, journey stages or `PREP_SECONDS`.

## How privacy works

Each team's cards live in the `hands` table. Row-level security lets only the owning device and the host read a hand, so other teams can't see it even from their browser tools.
