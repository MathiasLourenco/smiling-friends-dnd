# Smiling Friends D&D — Pim Pimling

Character sheet and turn helper for Pim Pimling from *Smiling Friends*, made for a brand-new player.
D&D 2024 rules, level 5. Charlie will be added later.

| | Pim Pimling |
|---|---|
| Build | Bard 5 (College of Eloquence) · Plasmoid · Entertainer |
| Feat | Musician (origin), Ability Score Improvement (level 4) |
| Stats | STR 8 · DEX 16 · CON 14 · INT 8 · WIS 12 · CHA 18 |
| Key numbers | 38 HP · AC 14 · Spell DC 15 · Persuasion/Deception +10, never below 20 |

## Features

- **Fight**: shows at most 2 numbered steps per turn (action and bonus action), based on what's happening (Charlie down, lots of enemies, one tough enemy).
- **Talk**: big buttons for Persuasion, Deception, Insight and Performance, plus the talk spells. Silver Tongue is applied automatically.
- **Spells**: one row per spell, grouped by what it's for.
- **Trackers**: HP, temp HP, spell slots, Bardic Inspiration and concentration. Everything is saved.
- **Concentration**: when Pim takes damage, the app rolls the CON save.
- **Printable sheet** (🖨️ Print button), plus a ready-made PDF in [`sheets/`](sheets).
- **Works offline** after opening once. On a tablet you can add it to the home screen.

## Technical

- Static site in [`site/`](site): HTML, CSS and JavaScript, no build step or dependencies.
- Container: `nginx-unprivileged` on port **8080** ([`Dockerfile`](Dockerfile)), published to GitHub Packages by [`.github/workflows/container.yml`](.github/workflows/container.yml).
- Website: deployed to GitHub Pages by [`.github/workflows/pages.yml`](.github/workflows/pages.yml).
- Game data (stats, spells, rules) lives in [`site/js/data.js`](site/js/data.js).
- College of Eloquence (Mythic Odysseys of Theros) and Plasmoid (Spelljammer) come from older books. They work with the 2024 rules; check with your DM.
