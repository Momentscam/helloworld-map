export interface StopBottle {
  name: string
  /** one or more product/lifestyle shots — the carousel rotates through them */
  imgs: string[]
}

export interface TourStop {
  id: string
  /** short label used in the left index + 3D pill */
  label: string
  name: string
  description: string
  photo: string
  /** Hello World bottles available at this stop */
  bottles: StopBottle[]
  /** optional call-to-action link shown under the description */
  contact?: { label: string; href: string }
  cam: { pos: [number, number, number]; target: [number, number, number] }
  /** 3D anchor for the clickable label pill */
  world: [number, number, number]
}

// real lifestyle photo sets (optimized JPEGs; PNG masters kept alongside)
const B = '/images_map/bottles'
const BARCELONA = [`${B}/Barcelona_01.jpg`, `${B}/Barcelona_02.jpg`]
const CASA_BATLLO = [`${B}/CasaBatllo_01.jpg`, `${B}/CasaBatllo_02.jpg`]
const IN_ART_WE_TRUST = [`${B}/Moco_01.jpg`, `${B}/Moco_02.jpg`]

/** index 0 is the overview — numbered stops start at 1 */
export const STOPS: TourStop[] = [
  {
    id: 'overview',
    label: 'THE WHOLE BOARD',
    name: 'Barcelona',
    description: '',
    photo: '',
    bottles: [],
    cam: { pos: [290, 440, 760], target: [-140, 0, -70] },
    world: [0, 0, 0],
  },
  {
    id: 'casa-batllo',
    label: 'CASA BATLLÓ',
    name: 'Casa Batlló',
    description:
      'Gaudí’s dragon-backed masterpiece on Passeig de Gràcia, all bone-white balconies and shimmering trencadís scales. Our machine hides beneath the chimneys.',
    photo: '/images_map/casa_batllo.jpg',
    bottles: [
      { name: 'Casa Batlló', imgs: CASA_BATLLO },
      { name: 'Barcelona', imgs: BARCELONA },
    ],
    cam: { pos: [36, 46, 32], target: [-11, 10, -33] },
    world: [-11, 22, -33],
  },
  {
    id: 'boqueria',
    label: 'LA BOQUERIA',
    name: 'Mercat de la Boqueria',
    description:
      'Barcelona’s loudest larder since 1217, under a stained-glass arch off La Rambla. Pyramid-stacked fruit, curtains of jamón, and fresh juice in every colour.',
    photo: '/images_map/la_boqueria.jpeg',
    bottles: [
      { name: 'Casa Batlló', imgs: CASA_BATLLO },
      { name: 'Barcelona', imgs: BARCELONA },
    ],
    cam: { pos: [90, 28, 136], target: [55, 5, 80] },
    world: [55, 14, 80],
  },
  {
    id: 'moco',
    label: 'MOCO MUSEUM',
    name: 'Moco Museum',
    description:
      'Banksy, KAWS and digital art inside a 16th-century palace on Carrer Montcada. Old stone outside, new neon inside.',
    photo: '/images_map/moco_museum.jpg',
    bottles: [{ name: 'In Art We Trust', imgs: IN_ART_WE_TRUST }],
    cam: { pos: [148, 26, 120], target: [110, 6, 72] },
    world: [110, 12, 72],
  },
  {
    id: 'tibidabo',
    label: 'TEMPLE TIBIDABO',
    name: 'Temple de Tibidabo',
    description:
      'The Sagrat Cor temple crowns the city’s highest peak, sharing its summit with a century-old funfair. On a clear day the whole board unrolls below.',
    photo: '/images_map/temple_tibidabo.jpeg',
    bottles: [{ name: 'Barcelona', imgs: BARCELONA }],
    cam: { pos: [-18, 172, -148], target: [-95, 122, -260] },
    world: [-95, 148, -260],
  },
  {
    id: 'airport',
    label: 'BCN AIRPORT',
    name: 'Barcelona–El Prat Airport',
    description:
      'Josep Tarradellas BCN–El Prat, the gateway to the board. Watch arrivals skim the sea, then grab a farewell bottle at T1.',
    photo: '/images_map/bcn_ariport.jpg',
    bottles: [
      { name: 'Casa Batlló', imgs: CASA_BATLLO },
      { name: 'Barcelona', imgs: BARCELONA },
    ],
    cam: { pos: [-318, 85, 348], target: [-408, 4, 172] },
    world: [-400, 22, 185],
  },
  {
    id: 'hello-world-hq',
    label: 'HELLO WORLD OFFICES',
    name: 'Hello World Offices',
    description:
      'Home base on the Diagonal, next to L’Illa — a small team bottling Barcelona one landmark at a time. Want to partner with us? We’d love to hear from you.',
    photo: '/images_map/hello_world_offices.svg',
    bottles: [],
    contact: { label: 'hello@drinkhelloworld.com', href: 'mailto:hello@drinkhelloworld.com' },
    cam: { pos: [-82, 44, -44], target: [-138, 12, -104] },
    world: [-122, 30, -97],
  },
]

export const stopIndexById = (id: string | null) => {
  const i = STOPS.findIndex((s) => s.id === id)
  return i === -1 ? 0 : i
}
