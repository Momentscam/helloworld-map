# Bottle Atlas 🍾

A 3D guided tour of our collectible-bottle locations in Barcelona, in the spirit of the
[levels.fyi Atlas](https://www.levels.fyi/atlas): a living low-poly board of the city that
visitors fly through stop by stop.

## Stack

- **React + Vite + TypeScript**
- **Three.js** via @react-three/fiber + drei — fully procedural low-poly Barcelona
  (no map tiles, no 3D asset files)
- **Zustand** for tour state, custom CSS for the Atlas-style overlay

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # production build (typechecks first)
```

## The tour

Five stops, visited by clicking a numbered pin on the board, an entry in the left index,
or PREV / NEXT (arrow keys work too). Each stop opens a card with a photo, a short
description and the bottle sold at that stop:

01 Casa Batlló · 02 Temple Tibidabo · 03 La Boqueria · 04 BCN Airport · 05 Moco Museum

The URL tracks the current stop (`?stop=boqueria`), so views are shareable.

### Replacing the placeholder photos

Stop photos live in `public/images/places/<stop-id>.svg` and bottle art in
`public/images/bottles/b-loc-<stop-id>.svg`. Drop real photos next to them and update the
`photo` / `bottle.img` paths in [src/tour/stops.ts](src/tour/stops.ts) — that file also
holds each stop's name, description and camera pose, so copy edits happen in one place.

## The living board

- ~600 procedurally placed buildings (chamfered Eixample blocks, irregular old town),
  district roads, parks, Collserola ridge, Montjuïc, the beach and the port
- ~80 cars looping the Gran Via, Diagonal, rondes and airport link
- A green tram shuttling the Diagonal (press **#06 RIDE THE TRAM** for the chase cam)
  and the blue Tramvia Blau climbing toward Tibidabo
- A plane on a continuous take-off / bay-loop / landing circuit at El Prat
- Spinning ferris wheel at Tibidabo, sailboats, drifting clouds
- Flavor landmarks: Sagrada Família (crane included), Torre Glòries, W Barcelona,
  Montjuïc castle, Columbus column, beach umbrellas

**View modes** — TOUR (camera flies between stops) / EXPLORE (free orbit) / RIDE.
Labels can be toggled off. Works down to mobile, where panels become bottom sheets.

**Getting around** — WASD to move (Shift to sprint), drag to look, scroll to zoom,
←/→ to change stops, ESC for the overview. The on-screen key pad mirrors the
keyboard and is pressable with mouse or touch; using WASD mid-flight cancels the
camera animation and hands control back to you.

## Structure

```
src/
  App.tsx              overlay UI: tour index, HUD, stop card
  tour/
    stops.ts           stop data: copy, photos, bottles, camera poses
    store.ts           zustand tour state + URL sync
    geo.ts             seeded rng, road network, path followers, palette
    Scene.tsx          canvas, lights, fog
    City.tsx           terrain, buildings, roads, trees, clouds
    Landmarks.tsx      the five stops + flavor landmarks
    Movers.tsx         cars, trams, plane, boats
    CameraRig.tsx      stop flights, orbit limits, tram chase cam
    Labels.tsx         clickable 3D pills
scripts/
  generate-data.mjs    regenerates placeholder art (npm run generate-data)
```

The previous 2D MapLibre explorer (machines/bottles browser) still lives unused in
`src/components/` + `src/store.ts` + `src/api.ts` if you ever want it back as a second view.
