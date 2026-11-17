# Smiling Friends D&D — Pim & Charlie

Character sheets and a turn helper for a D&D duo based on Pim and Charlie from *Smiling Friends*.
D&D 2024 rules, level 4.

| | Pim Pimling | Charlie Dompler |
|---|---|---|
| Player | New player | Experienced player |
| Build | Twilight Cleric 4 · Human · Farmer | Berserker Barbarian 4 · Human · Soldier |
| Feats | Lucky, Tough, War Caster | Tough, Savage Attacker, Great Weapon Master |

## Features

- **Turn helper**: shows only your action and bonus action, based on the situation (ally down, humanoid boss, undead).
- **Trackers**: HP, temp HP, spell slots, Channel Divinity and Rage. Lucky, Hit Dice and the rest are under "More". Everything is saved.
- **One-tap rolls**: attacks, spells, skills and saves with all bonuses included (Rage, Frenzy, Bless, Savage Attacker…).
- **Concentration**: when you take damage, the app rolls your concentration save.
- **Spell cards** with official names and a one-line summary.
- **Rules cheat sheet** with the basics.
- **Printable sheet** (🖨️ Print button), plus ready-made PDFs in [`sheets/`](sheets).
- **Works offline**: after opening once, the app works without Wi-Fi. On a tablet you can add it to the home screen.

## Usage

Open the website on the tablet and pick **Pim** or **Charlie** at the top.
Tip: *Share → Add to Home Screen* (iPad) or *⋮ → Install app* (Android) turns it into a standalone app.

## Technical

- Static site in [`site/`](site): HTML, CSS and JavaScript, no build step or dependencies.
- Container: `nginx-unprivileged` on port **8080** ([`Dockerfile`](Dockerfile)), published to GitHub Packages by [`.github/workflows/container.yml`](.github/workflows/container.yml).
- Website: deployed to GitHub Pages by [`.github/workflows/pages.yml`](.github/workflows/pages.yml).
- Run locally: `docker build -t smiling-friends-dnd . && docker run -p 8080:8080 smiling-friends-dnd`, then open http://localhost:8080.
- Game data (stats, spells, rules) lives in [`site/js/data.js`](site/js/data.js).
- Twilight Domain (Tasha's) and Toll the Dead (Xanathar's) come from older books. They are officially usable with the 2024 rules; check with your DM.
