# AKOM Cockpit · live build

This repository hosts the **built artifact** of the AKOM Crisis Cockpit so
GitHub Pages can serve it publicly.

🟢 **Live demo:** https://ertugrul9134.github.io/akom-cockpit-live/

The source is in a private repository. This mirror only contains the
production bundle (`index.html`, hashed JS/CSS, GeoJSON data fixtures,
font assets). Do not edit files here by hand — they are auto-deployed.

## What you see

- React 19 + MapLibre v5 + deck.gl 9 crisis-management cockpit
- 8-tab HUD (Operasyon hydrated; Küre = MapLibre v5 globe over NASA
  Blue Marble; 6 placeholders for the next iteration)
- 30 live patrol units (ground / heli / fixed-wing / naval) on the
  İstanbul Operasyon map
- 36,376 extruded OSM buildings (lazy-loaded after first paint)
- 25 İBB live tourism camera markers with feed-inspector modal
- Apple-Big-Sur frosted glass UI overlay (90% gray on 60% white)

## License & attribution

- Map tiles: CARTO Dark · © OpenStreetMap contributors
- Globe basemap: NASA EOSDIS GIBS · Blue Marble (public domain)
- Globe terrain: Mapzen Terrain Tiles via AWS Open Data
- Buildings: OpenStreetMap contributors via Overpass API (ODbL)
- Camera streams: İBB · İstanbulu Seyret (courtesy of İBB)
