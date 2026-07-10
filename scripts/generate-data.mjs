// Generates seed data for Bottle Atlas:
//  - src/data/machines.json / src/data/bottles.json with consistent cross-refs
//  - slimmed src/data/barcelona-districts.geojson (name + code props only)
//  - SVG placeholder artwork in public/images/{bottles,machines}
// Replace the JSON files (or the API layer in src/api.ts) with real data later.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dataDir = path.join(root, 'public', 'data')
const imgBottles = path.join(root, 'public', 'images', 'bottles')
const imgMachines = path.join(root, 'public', 'images', 'machines')

// ---------------------------------------------------------------- machines
const machines = [
  { id: 'm-placa-del-sol', name: 'Plaça del Sol', lat: 41.40281, lng: 2.15614, address: 'Plaça del Sol, 13, 08012 Barcelona', neighborhood: 'Vila de Gràcia', district: 'Gràcia', status: 'active', installDate: '2025-03-14' },
  { id: 'm-carrer-verdi', name: 'Verdi Cinema Corner', lat: 41.40492, lng: 2.15701, address: 'Carrer de Verdi, 32, 08012 Barcelona', neighborhood: 'Vila de Gràcia', district: 'Gràcia', status: 'active', installDate: '2025-04-02' },
  { id: 'm-passeig-gracia', name: 'Passeig de Gràcia', lat: 41.39172, lng: 2.16486, address: 'Passeig de Gràcia, 43, 08007 Barcelona', neighborhood: 'La Dreta de l’Eixample', district: 'Eixample', status: 'active', installDate: '2024-11-20' },
  { id: 'm-enric-granados', name: 'Enric Granados', lat: 41.38961, lng: 2.15903, address: 'Carrer d’Enric Granados, 56, 08008 Barcelona', neighborhood: 'L’Antiga Esquerra de l’Eixample', district: 'Eixample', status: 'active', installDate: '2025-01-09' },
  { id: 'm-sagrada-familia', name: 'Sagrada Família', lat: 41.40362, lng: 2.17435, address: 'Av. de Gaudí, 4, 08025 Barcelona', neighborhood: 'Sagrada Família', district: 'Eixample', status: 'active', installDate: '2024-10-05' },
  { id: 'm-sant-antoni', name: 'Mercat de Sant Antoni', lat: 41.37893, lng: 2.16312, address: 'Carrer del Comte d’Urgell, 1, 08011 Barcelona', neighborhood: 'Sant Antoni', district: 'Eixample', status: 'offline', installDate: '2025-02-17' },
  { id: 'm-passeig-born', name: 'Passeig del Born', lat: 41.38513, lng: 2.18304, address: 'Passeig del Born, 17, 08003 Barcelona', neighborhood: 'Sant Pere, Santa Caterina i la Ribera', district: 'Ciutat Vella', status: 'active', installDate: '2024-09-12' },
  { id: 'm-santa-caterina', name: 'Mercat de Santa Caterina', lat: 41.38620, lng: 2.17890, address: 'Av. de Francesc Cambó, 16, 08003 Barcelona', neighborhood: 'Sant Pere, Santa Caterina i la Ribera', district: 'Ciutat Vella', status: 'active', installDate: '2025-05-01' },
  { id: 'm-macba', name: 'MACBA Skate Plaza', lat: 41.38333, lng: 2.16672, address: 'Plaça dels Àngels, 1, 08001 Barcelona', neighborhood: 'El Raval', district: 'Ciutat Vella', status: 'active', installDate: '2025-03-28' },
  { id: 'm-joan-de-borbo', name: 'Passeig Joan de Borbó', lat: 41.37858, lng: 2.18933, address: 'Passeig de Joan de Borbó, 44, 08003 Barcelona', neighborhood: 'La Barceloneta', district: 'Ciutat Vella', status: 'active', installDate: '2024-08-30' },
  { id: 'm-barceloneta-beach', name: 'Barceloneta Beachfront', lat: 41.37662, lng: 2.19205, address: 'Passeig Marítim de la Barceloneta, 30, 08003 Barcelona', neighborhood: 'La Barceloneta', district: 'Ciutat Vella', status: 'active', installDate: '2025-06-15' },
  { id: 'm-rambla-poblenou', name: 'Rambla del Poblenou', lat: 41.40301, lng: 2.20447, address: 'Rambla del Poblenou, 78, 08005 Barcelona', neighborhood: 'El Poblenou', district: 'Sant Martí', status: 'active', installDate: '2025-01-24' },
  { id: 'm-palo-alto', name: 'Palo Alto Market', lat: 41.41043, lng: 2.22099, address: 'Carrer dels Pellaires, 30, 08019 Barcelona', neighborhood: 'Diagonal Mar i el Front Marítim del Poblenou', district: 'Sant Martí', status: 'offline', installDate: '2025-04-19' },
  { id: 'm-poble-sec', name: 'Carrer de Blai', lat: 41.37284, lng: 2.16370, address: 'Carrer de Blai, 28, 08004 Barcelona', neighborhood: 'El Poble-sec', district: 'Sants-Montjuïc', status: 'active', installDate: '2025-02-03' },
  { id: 'm-sants-estacio', name: 'Sants Estació', lat: 41.37904, lng: 2.13984, address: 'Plaça dels Països Catalans, 1, 08014 Barcelona', neighborhood: 'Sants', district: 'Sants-Montjuïc', status: 'active', installDate: '2024-12-11' },
]

// ---------------------------------------------------------------- bottles
// [id, name, series, rarity, releaseDate, description, hue]
const SERIES = {
  'Barri Icons': { hue: 18, desc: 'Landmarks of Barcelona, bottled.' },
  'Mediterrani': { hue: 198, desc: 'The sea in glass — salt, light and horizon.' },
  'Festa Major': { hue: 288, desc: 'Street-festival editions: correfocs, castellers and paper garlands.' },
  'Neon Nights': { hue: 155, desc: 'After-dark Barcelona in fluorescent glass.' },
  'City Tour': { hue: 258, desc: 'One bottle per stop on the Bottle Atlas tour.' },
}
const bottles = [
  ['b-sagrada-glow', 'Sagrada Glow', 'Barri Icons', 'legendary', '2024-09-01', 'Amber glass etched with the Nativity façade. Catches sunset light like the basilica itself.'],
  ['b-torre-glories', 'Torre Glòries', 'Barri Icons', 'epic', '2024-09-01', 'Iridescent bullet-shaped bottle mirroring the tower’s shifting skin.'],
  ['b-casa-batllo', 'Casa Batlló Scales', 'Barri Icons', 'epic', '2024-10-15', 'Trencadís-patterned glass in ocean blues and greens.'],
  ['b-bunkers-sunrise', 'Bunkers Sunrise', 'Barri Icons', 'rare', '2024-10-15', 'Gradient glass from night blue to dawn orange, like mornings at the Carmel bunkers.'],
  ['b-park-guell', 'Park Güell Mosaic', 'Barri Icons', 'rare', '2024-11-01', 'Salamander-mosaic wrap on frosted glass.'],
  ['b-arc-triomf', 'Arc de Triomf', 'Barri Icons', 'common', '2024-11-01', 'Brick-red matte bottle with Mudéjar arch relief.'],
  ['b-pedrera-wave', 'La Pedrera Wave', 'Barri Icons', 'rare', '2024-12-01', 'Undulating stone-grey glass, no straight lines anywhere.'],
  ['b-gothic-shadow', 'Gothic Shadow', 'Barri Icons', 'common', '2024-12-01', 'Charcoal bottle with the cathedral spires in relief.'],
  ['b-montjuic-magic', 'Montjuïc Magic Fountain', 'Barri Icons', 'common', '2025-01-10', 'Colour-shifting label inspired by the Font Màgica light shows.'],
  ['b-salt-line', 'Salt Line', 'Mediterrani', 'common', '2025-02-01', 'Clear glass with a single white salt-crust ring at the waterline.'],
  ['b-posidonia', 'Posidònia', 'Mediterrani', 'rare', '2025-02-01', 'Seagrass-green bottle; part of sales fund posidonia meadow restoration.'],
  ['b-tramuntana', 'Tramuntana', 'Mediterrani', 'epic', '2025-02-01', 'Wind-swept spiral ribbing you can feel. Loud when the north wind blows.'],
  ['b-mar-bella', 'Mar Bella', 'Mediterrani', 'common', '2025-03-01', 'Beach-glass turquoise, softly frosted like sea-tumbled shards.'],
  ['b-xiringuito', 'Xiringuito', 'Mediterrani', 'common', '2025-03-01', 'Striped awning print — vermut hour at the beach bar.'],
  ['b-medusa', 'Medusa Bloom', 'Mediterrani', 'rare', '2025-04-01', 'Translucent lilac with trailing tentacle streaks.'],
  ['b-far-del-port', 'Far del Port', 'Mediterrani', 'common', '2025-04-01', 'Lighthouse-striped neck, glows faintly in the dark.'],
  ['b-gavina', 'Gavina', 'Mediterrani', 'common', '2025-05-01', 'Seagull-white gloss with a thief’s eye printed near the cap.'],
  ['b-correfoc', 'Correfoc', 'Festa Major', 'legendary', '2024-09-20', 'Devil-black glass with sparking ember flecks. Limited to Mercè week.'],
  ['b-casteller', 'Casteller', 'Festa Major', 'epic', '2024-09-20', 'Nine stacked glass rings — an enxaneta silhouette on top.'],
  ['b-gegants', 'Gegants', 'Festa Major', 'rare', '2024-09-20', 'Twin giant figures dance around the label when you spin it.'],
  ['b-paper-garlands', 'Garlandes de Gràcia', 'Festa Major', 'common', '2025-08-01', 'Paper-garland print from the Festa Major de Gràcia street contests.'],
  ['b-sardana', 'Sardana', 'Festa Major', 'common', '2025-08-01', 'Circle-dance motif rings the base; cobla brass on the cap.'],
  ['b-diable-petit', 'Diable Petit', 'Festa Major', 'common', '2025-08-01', 'A small devil with a big firework. Pocket-size edition.'],
  ['b-trabucaire', 'Trabucaire', 'Festa Major', 'rare', '2025-09-01', 'Gunpowder-grey with a red faixa sash band.'],
  ['b-neon-rambla', 'Neon Rambla', 'Neon Nights', 'rare', '2025-05-15', 'Electric magenta tube-light lettering on smoked glass.'],
  ['b-razz-club', 'Razz Static', 'Neon Nights', 'epic', '2025-05-15', 'Glitch-pattern wrap that strobes under UV light.'],
  ['b-apolo-nit', 'Nit d’Apolo', 'Neon Nights', 'rare', '2025-06-01', 'Deep red velvet-touch coating, ticket-stub label.'],
  ['b-gat-de-botero', 'El Gat', 'Neon Nights', 'common', '2025-06-01', 'Botero’s fat cat glowing green on the Rambla del Raval.'],
  ['b-bicing-2am', 'Bicing 2AM', 'Neon Nights', 'common', '2025-07-01', 'Red-and-white frame print; the ride home you barely remember.'],
  ['b-super-nit', 'Súper de Nit', 'Neon Nights', 'common', '2025-07-01', 'Corner-store fluorescent glow in a bottle. Open 24h.'],
]

// bottle -> machines (3-7 machines for commons, fewer for higher tiers)
const availability = {
  'b-sagrada-glow': ['m-sagrada-familia', 'm-passeig-gracia'],
  'b-torre-glories': ['m-rambla-poblenou', 'm-palo-alto'],
  'b-casa-batllo': ['m-passeig-gracia', 'm-enric-granados'],
  'b-bunkers-sunrise': ['m-placa-del-sol', 'm-carrer-verdi', 'm-sagrada-familia'],
  'b-park-guell': ['m-placa-del-sol', 'm-carrer-verdi', 'm-sagrada-familia'],
  'b-arc-triomf': ['m-passeig-born', 'm-santa-caterina', 'm-sagrada-familia', 'm-macba', 'm-passeig-gracia'],
  'b-pedrera-wave': ['m-passeig-gracia', 'm-enric-granados', 'm-placa-del-sol'],
  'b-gothic-shadow': ['m-passeig-born', 'm-santa-caterina', 'm-macba', 'm-joan-de-borbo'],
  'b-montjuic-magic': ['m-poble-sec', 'm-sants-estacio', 'm-sant-antoni', 'm-macba'],
  'b-salt-line': ['m-joan-de-borbo', 'm-barceloneta-beach', 'm-passeig-born', 'm-rambla-poblenou', 'm-palo-alto'],
  'b-posidonia': ['m-barceloneta-beach', 'm-joan-de-borbo'],
  'b-tramuntana': ['m-barceloneta-beach', 'm-palo-alto'],
  'b-mar-bella': ['m-rambla-poblenou', 'm-palo-alto', 'm-barceloneta-beach', 'm-joan-de-borbo'],
  'b-xiringuito': ['m-barceloneta-beach', 'm-joan-de-borbo', 'm-rambla-poblenou', 'm-passeig-born', 'm-poble-sec'],
  'b-medusa': ['m-barceloneta-beach', 'm-rambla-poblenou', 'm-santa-caterina'],
  'b-far-del-port': ['m-joan-de-borbo', 'm-barceloneta-beach', 'm-passeig-born', 'm-sants-estacio'],
  'b-gavina': ['m-joan-de-borbo', 'm-barceloneta-beach', 'm-macba', 'm-rambla-poblenou', 'm-santa-caterina'],
  'b-correfoc': ['m-placa-del-sol'],
  'b-casteller': ['m-santa-caterina', 'm-sants-estacio'],
  'b-gegants': ['m-passeig-born', 'm-placa-del-sol', 'm-santa-caterina'],
  'b-paper-garlands': ['m-placa-del-sol', 'm-carrer-verdi', 'm-enric-granados', 'm-sant-antoni'],
  'b-sardana': ['m-santa-caterina', 'm-passeig-born', 'm-sants-estacio', 'm-poble-sec', 'm-carrer-verdi'],
  'b-diable-petit': ['m-poble-sec', 'm-sant-antoni', 'm-macba', 'm-placa-del-sol', 'm-carrer-verdi', 'm-sants-estacio'],
  'b-trabucaire': ['m-carrer-verdi', 'm-poble-sec'],
  'b-neon-rambla': ['m-macba', 'm-poble-sec', 'm-passeig-born'],
  'b-razz-club': ['m-rambla-poblenou', 'm-passeig-born'],
  'b-apolo-nit': ['m-poble-sec', 'm-sant-antoni', 'm-macba'],
  'b-gat-de-botero': ['m-macba', 'm-sant-antoni', 'm-poble-sec', 'm-enric-granados'],
  'b-bicing-2am': ['m-enric-granados', 'm-passeig-gracia', 'm-placa-del-sol', 'm-rambla-poblenou', 'm-sant-antoni'],
  'b-super-nit': ['m-macba', 'm-poble-sec', 'm-santa-caterina', 'm-joan-de-borbo', 'm-carrer-verdi', 'm-sants-estacio'],
}

// ---------------------------------------------------------------- validate + assemble
const machineIds = new Set(machines.map((m) => m.id))
const bottleIdSet = new Set(bottles.map((b) => b[0]))
for (const [bid, mids] of Object.entries(availability)) {
  if (!bottleIdSet.has(bid)) throw new Error(`availability references unknown bottle ${bid}`)
  for (const mid of mids) if (!machineIds.has(mid)) throw new Error(`bottle ${bid} references unknown machine ${mid}`)
}
for (const bid of bottleIdSet) if (!availability[bid]) throw new Error(`bottle ${bid} has no availability`)

const machineBottles = Object.fromEntries(machines.map((m) => [m.id, []]))
for (const [bid, mids] of Object.entries(availability)) for (const mid of mids) machineBottles[mid].push(bid)

const machinesOut = machines.map((m) => ({
  ...m,
  photoUrl: `/images/machines/${m.id}.svg`,
  bottleIds: machineBottles[m.id],
}))
const bottlesOut = bottles.map(([id, name, series, rarity, releaseDate, description]) => ({
  id, name, series, rarity, releaseDate, description,
  imageUrl: `/images/bottles/${id}.svg`,
  machineIds: availability[id],
}))

fs.writeFileSync(path.join(dataDir, 'machines.json'), JSON.stringify(machinesOut, null, 2))
fs.writeFileSync(path.join(dataDir, 'bottles.json'), JSON.stringify(bottlesOut, null, 2))

// ---------------------------------------------------------------- slim districts geojson
const districtsPath = path.join(dataDir, 'barcelona-districts.geojson')
const raw = JSON.parse(fs.readFileSync(districtsPath, 'utf8'))
const slim = {
  type: 'FeatureCollection',
  features: raw.features.map((f) => ({
    type: 'Feature',
    properties: { name: f.properties.NOM ?? f.properties.name, code: f.properties.DISTRICTE ?? f.properties.code },
    geometry: f.geometry,
  })),
}
fs.writeFileSync(districtsPath, JSON.stringify(slim))

// ---------------------------------------------------------------- SVG artwork
const RARITY_ACCENT = { common: '#9aa5b1', rare: '#4f9cf9', epic: '#b46bf2', legendary: '#f2a93b' }

function bottleSvg(id, name, series, rarity, i) {
  const { hue } = SERIES[series]
  const h = (hue + (i % 5) * 7) % 360 // small per-bottle drift, stays within the series palette
  const accent = RARITY_ACCENT[rarity]
  const capShape = i % 3 === 0 ? `<rect x="86" y="26" width="28" height="22" rx="5"/>` : i % 3 === 1 ? `<rect x="84" y="28" width="32" height="18" rx="9"/>` : `<circle cx="100" cy="38" r="13"/>`
  const bodyWidth = 56 + (i % 4) * 6
  const bx = 100 - bodyWidth / 2
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 260">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="hsl(${h} 42% 20%)"/><stop offset="1" stop-color="hsl(${(h + 40) % 360} 48% 12%)"/>
    </linearGradient>
    <linearGradient id="glass" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="hsl(${h} 75% 62%)"/><stop offset="0.5" stop-color="hsl(${h} 85% 72%)"/><stop offset="1" stop-color="hsl(${(h + 25) % 360} 70% 55%)"/>
    </linearGradient>
  </defs>
  <rect width="200" height="260" rx="16" fill="url(#bg)"/>
  <circle cx="100" cy="120" r="72" fill="hsl(${h} 60% 50% / 0.14)"/>
  <g fill="url(#glass)">
    ${capShape}
    <path d="M92 46 h16 v22 c14 10 20 22 20 40 v86 c0 12 -9 20 -20 20 h-16 c-11 0 -20 -8 -20 -20 v-86 c0 -18 6 -30 20 -40 z" transform="translate(${100 - 100} 0)"/>
  </g>
  <rect x="${bx}" y="128" width="${bodyWidth}" height="46" rx="8" fill="hsl(${h} 30% 14% / 0.55)"/>
  <rect x="72" y="46" width="8" height="120" rx="4" fill="#ffffff" opacity="0.28"/>
  <rect x="14" y="14" width="10" height="10" rx="5" fill="${accent}"/>
  <text x="100" y="152" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="11" font-weight="700" fill="#fff" opacity="0.92">${escapeXml(shorten(name, 16))}</text>
  <text x="100" y="166" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="8" fill="#fff" opacity="0.6">${escapeXml(series.toUpperCase())}</text>
  <text x="100" y="242" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="9" font-weight="700" letter-spacing="2" fill="${accent}">${rarity.toUpperCase()}</text>
</svg>`
}

function machineSvg(m, i) {
  const h = (200 + i * 24) % 360
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 240">
  <defs>
    <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="hsl(${h} 45% 26%)"/><stop offset="1" stop-color="hsl(${(h + 30) % 360} 40% 14%)"/>
    </linearGradient>
  </defs>
  <rect width="400" height="240" fill="url(#sky)"/>
  <rect x="0" y="196" width="400" height="44" fill="hsl(${h} 20% 10%)"/>
  <g>
    <rect x="150" y="40" width="100" height="164" rx="10" fill="hsl(${h} 18% 16%)" stroke="hsl(${h} 40% 45%)" stroke-width="2"/>
    <rect x="160" y="52" width="56" height="110" rx="6" fill="hsl(${h} 55% 30%)"/>
    ${[0, 1, 2].map((r) => [0, 1].map((c) => `<rect x="${166 + c * 26}" y="${58 + r * 36}" width="18" height="28" rx="4" fill="hsl(${(h + 60 + r * 40 + c * 20) % 360} 75% 62%)"/>`).join('')).join('')}
    <rect x="222" y="52" width="20" height="70" rx="4" fill="hsl(${h} 25% 22%)"/>
    <circle cx="232" cy="140" r="7" fill="${m.status === 'active' ? '#41d98d' : '#8b93a1'}"/>
    <rect x="160" y="170" width="80" height="24" rx="5" fill="hsl(${h} 25% 12%)"/>
  </g>
  <text x="200" y="226" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="14" font-weight="700" fill="#fff" opacity="0.92">${escapeXml(m.name)}</text>
  <text x="200" y="30" text-anchor="middle" font-family="Helvetica, Arial, sans-serif" font-size="10" letter-spacing="3" fill="#fff" opacity="0.55">${escapeXml(m.neighborhood.toUpperCase())}</text>
</svg>`
}

function shorten(s, n) { return s.length > n ? s.slice(0, n - 1) + '…' : s }
function escapeXml(s) { return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;') }

bottlesOut.forEach((b, i) => fs.writeFileSync(path.join(imgBottles, `${b.id}.svg`), bottleSvg(b.id, b.name, b.series, b.rarity, i)))
machinesOut.forEach((m, i) => fs.writeFileSync(path.join(imgMachines, `${m.id}.svg`), machineSvg(m, i)))

// ---------------------------------------------------------------- tour assets
// One bottle + one placeholder "photo" per tour stop. Replace the files in
// public/images/places/ with real photos (same filename, or update stops.ts).
const TOUR_STOPS = [
  { id: 'casa-batllo', name: 'Casa Batlló', bottle: ['Drac de Batlló', 'legendary'], hue: 210 },
  { id: 'tibidabo', name: 'Temple Tibidabo', bottle: ['Cim del Cel', 'epic'], hue: 32 },
  { id: 'boqueria', name: 'La Boqueria', bottle: ['Suc de Mercat', 'rare'], hue: 350 },
  { id: 'airport', name: 'Barcelona Airport', bottle: ['Runway 25R', 'common'], hue: 205 },
  { id: 'moco', name: 'Moco Museum', bottle: ['Neon Moco', 'epic'], hue: 300 },
]

function placeSvg(stop) {
  const h = stop.hue
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 520">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="hsl(${h} 55% 72%)"/><stop offset="1" stop-color="hsl(${(h + 30) % 360} 45% 48%)"/>
    </linearGradient>
  </defs>
  <rect width="800" height="520" fill="url(#g)"/>
  <circle cx="640" cy="110" r="52" fill="#fff" opacity="0.75"/>
  <g opacity="0.35" fill="hsl(${h} 40% 25%)">
    <rect x="90" y="300" width="120" height="160"/><rect x="230" y="250" width="90" height="210"/>
    <rect x="340" y="330" width="140" height="130"/><rect x="500" y="270" width="110" height="190"/>
    <rect x="630" y="340" width="90" height="120"/>
  </g>
  <rect x="0" y="460" width="800" height="60" fill="hsl(${h} 40% 22%)" opacity="0.5"/>
  <g font-family="Helvetica, Arial, sans-serif" text-anchor="middle">
    <rect x="230" y="180" width="340" height="76" rx="14" fill="rgba(255,255,255,0.88)"/>
    <text x="400" y="212" font-size="26" font-weight="700" fill="hsl(${h} 45% 25%)">${stop.name}</text>
    <text x="400" y="238" font-size="13" fill="hsl(${h} 30% 35%)">PLACEHOLDER PHOTO — drop the real one here</text>
    <text x="400" y="500" font-size="12" fill="#fff" opacity="0.85">public/images/places/${stop.id}.svg</text>
  </g>
</svg>`
}

const imgPlaces = path.join(root, 'public', 'images', 'places')
fs.mkdirSync(imgPlaces, { recursive: true })
TOUR_STOPS.forEach((s, i) => {
  fs.writeFileSync(path.join(imgPlaces, `${s.id}.svg`), placeSvg(s))
  fs.writeFileSync(
    path.join(imgBottles, `b-loc-${s.id}.svg`),
    bottleSvg(`b-loc-${s.id}`, s.bottle[0], 'City Tour', s.bottle[1], i),
  )
})

console.log(
  `Wrote ${machinesOut.length} machines, ${bottlesOut.length} bottles, ${slim.features.length} districts, ` +
    `${bottlesOut.length + machinesOut.length + TOUR_STOPS.length * 2} SVGs`,
)
