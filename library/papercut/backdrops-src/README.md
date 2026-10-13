# Code-drawn backdrop sources

8 of the library's 24 backdrops are drawn in code (courtroom, bank-vault, warehouse, mission-control, airport-gate, subway-platform, diner,
bedroom-day). These are their sources, kept so they can be redrawn or tweaked.
To use: copy this folder into a synced papercut project as `src/backdrops/` (plus `render_backdrops.sh` to the project root; `Root.tsx`
lists the compositions), then `./render_backdrops.sh <name>` writes `out/backdrops/<name>.jpg`. Copy the JPG to `library/papercut/public/bg/backdrops/`.
The other 16 sets are plain images; their sources are not kept.
