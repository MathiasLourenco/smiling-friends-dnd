# Smiling Friends D&D — Pim & Charlie

Character sheets en een beurt-hulp voor een D&D-duo, gebaseerd op Pim en Charlie uit *Smiling Friends*.
D&D 2024-regels, level 4.

| | Pim Pimling | Charlie Dompler |
|---|---|---|
| Speler | Nieuwe speler | Ervaren speler |
| Build | Twilight Cleric 4 · Human · Farmer | Berserker Barbarian 4 · Human · Soldier |
| Feats | Lucky, Tough, War Caster | Tough, Savage Attacker, Great Weapon Master |

## Wat zit erin?

- **Wat doe ik nu?**: stap-voor-stap hulp per beurt, afhankelijk van wat er gebeurt (iemand bijna neer, baas, ondoden…).
- **Trackers**: HP, tijdelijke HP, spell slots, Channel Divinity, Rage, Lucky, Hit Dice. Alles wordt onthouden.
- **Dobbelstenen met één klik**: aanvallen, spells, skills en saves met alle bonussen erbij (Rage, Frenzy, Bless, Savage Attacker…).
- **Concentratie-hulp**: word je geraakt, dan gooit de app meteen je concentratie-save.
- **Spellkaarten** in simpel Nederlands, met een Smiling Friends-naam per spell.
- **Spiekbriefje** met de basisregels, en een **team-pagina** met combo's en rollenspel-tips.
- **Printbaar sheet** (knop 🖨️ Print), en kant-en-klare PDF's in [`sheets/`](sheets).
- **Werkt offline**: na één keer openen werkt de app ook zonder wifi. Op een tablet kan je hem op het beginscherm zetten.

## Gebruiken

Open de website op de tablet en kies bovenaan **Pim** of **Charlie**.
Tip: via *Deel → Zet op beginscherm* (iPad) of *⋮ → App installeren* (Android) wordt het een losse app.

## Technisch

- Statische site in [`site/`](site): HTML, CSS en JavaScript, zonder build-stap of dependencies.
- Container: `nginx-unprivileged` op poort **8080** ([`Dockerfile`](Dockerfile)), automatisch gepubliceerd naar GitHub Packages via [`.github/workflows/container.yml`](.github/workflows/container.yml).
- Website: automatisch online gezet via GitHub Pages ([`.github/workflows/pages.yml`](.github/workflows/pages.yml)).
- Lokaal draaien: `docker build -t smiling-friends-dnd . && docker run -p 8080:8080 smiling-friends-dnd`, en open daarna http://localhost:8080.
- Spelgegevens (stats, spells, regels) staan in [`site/js/data.js`](site/js/data.js).
- Twilight Domain (Tasha's) en Toll the Dead (Xanathar's) zijn oudere boeken. Die zijn officieel bruikbaar met de 2024-regels; vraag wel even de DM.
