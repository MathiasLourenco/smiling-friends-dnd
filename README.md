# Smiling Friends D&D — Pim & Charlie

Character sheets and turn helpers for Pim Pimling and Charlie Dompler from *Smiling Friends*.
D&D 2024 rules, level 5. Pim's app (`/`) is made for a brand-new player; Charlie's app (`/charlie/`) is a full tracker for an experienced player.

| | Pim Pimling | Charlie Dompler |
|---|---|---|
| Build | Bard 5 (College of Eloquence) · Plasmoid · Entertainer | Sorcerer 5 (Wild Magic Sorcery) · Human · Merchant |
| Feats | Musician (origin), Ability Score Improvement (level 4) | Lucky (origin), Tough (Human), War Caster (level 4) |
| Stats | STR 8 · DEX 16 · CON 14 · INT 8 · WIS 12 · CHA 18 | STR 8 · DEX 14 · CON 16 · INT 8 · WIS 10 · CHA 18 |
| Key numbers | 38 HP · AC 14 · Spell DC 15 · Persuasion/Deception +10, never below 20 | 47 HP · AC 12 (15 Mage Armor) · Spell DC 15 · Spell attack +7 · 5 Sorcery Points |

## Pim's app

- **Fight**: shows at most 2 numbered steps per turn (action and bonus action), based on what's happening (Charlie down, lots of enemies, one tough enemy).
- **Talk**: big buttons for Persuasion, Deception, Insight and Performance, plus the talk spells. Silver Tongue is applied automatically.
- **Spells**: one row per spell, grouped by what it's for.
- **Trackers**: HP, temp HP, spell slots, Bardic Inspiration and concentration. Everything is saved.
- **Concentration**: when Pim takes damage, the app rolls the CON save.
- **Printable sheet** (🖨️ Print button), plus a ready-made PDF in [`sheets/`](sheets).
- **Works offline** after opening once. On a tablet you can add it to the home screen.

## Charlie's app

- **Status bar**: Tides of Chaos (tap to arm it for the next d20), spell DC and attack (Innate Sorcery included), SP, AC, situational advantage/disadvantage and Metamagic (Careful, Subtle).
- **Combat**: HP, death saves, round tracker with the one-slot-per-turn rule, quick casts with slot level, and every resource: slots (incl. slots made with Font of Magic), Sorcery Points, Innate Sorcery, Luck Points, Heroic Inspiration, Sorcerous Restoration, hit dice and rests.
- **Spells**: full spell list with casting time, range, components, duration and upcasting. Casting rolls everything: attacks with crits, Sorcerous Burst's exploding 8s, Chromatic Orb leaps, each Scorching Ray, damage and DCs.
- **Surge**: how Tides and surges work, a d100 roller, recent surges and the full searchable table. A slot spell cast while Tides is spent surges automatically; the optional d20 check can run automatically too. Special results (chain reaction, roll twice, shift with Sorcery Points) are handled.
- **Sheet**: abilities, saves and skills (tap to roll; Lucky and Heroic Inspiration after the roll), features and gear.
- The surge table is a house rule: effects summarised from [Wild Magic Table: True 100](https://homebrewery.naturalcrit.com/share/-XaXNuZPQc4F) by Azure Spire Archive. It replaces the Player's Handbook table, so check with your DM.
- Printable PDF: [`sheets/Charlie-sheet.pdf`](sheets/Charlie-sheet.pdf). Its surge table is loaded from [`site/charlie/surge.js`](site/charlie/surge.js).

## Technical

- Static site in [`site/`](site): HTML, CSS and JavaScript, no build step or dependencies.
- Container: `nginx-unprivileged` on port **8080** ([`Dockerfile`](Dockerfile)), published to GitHub Packages by [`.github/workflows/container.yml`](.github/workflows/container.yml).
- Website: deployed to GitHub Pages by [`.github/workflows/pages.yml`](.github/workflows/pages.yml).
- Game data (stats, spells, rules) lives in [`site/js/data.js`](site/js/data.js) (Pim) and [`site/charlie/data.js`](site/charlie/data.js) (Charlie).
- College of Eloquence (Mythic Odysseys of Theros) and Plasmoid (Spelljammer) come from older books. They work with the 2024 rules; check with your DM.
