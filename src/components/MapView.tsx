import { useEffect, useMemo, useRef, useState } from 'react'
import maplibregl, { Map as MLMap, Popup, type LngLatBoundsLike } from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { useAtlas, machineMatchesFilters } from '../store'
import type { Bottle, Machine, Theme } from '../types'

const STYLE_URLS: Record<Theme, string> = {
  dark: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json',
  light: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json',
}

const BCN_CENTER: [number, number] = [2.1686, 41.3874]
const BCN_BOUNDS: LngLatBoundsLike = [
  [1.995, 41.28], // SW
  [2.35, 41.5], // NE
]

const ACCENT = '#ff6b4a'
const CARRIER = '#18c7d8'
const OFFLINE = '#8f99a8'

function drawPin(fill: string, scale = 1, dot = '#ffffff'): ImageData {
  const s = 2 * scale // render at 2x for crispness
  const w = Math.ceil(44 * s)
  const h = Math.ceil(56 * s)
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')!
  ctx.scale(s, s)
  ctx.beginPath()
  ctx.moveTo(22, 54)
  ctx.bezierCurveTo(22, 54, 6, 33, 6, 20)
  ctx.arc(22, 20, 16, Math.PI, 0, false)
  ctx.bezierCurveTo(38, 33, 22, 54, 22, 54)
  ctx.closePath()
  ctx.fillStyle = fill
  ctx.shadowColor = 'rgba(0,0,0,0.35)'
  ctx.shadowBlur = 6
  ctx.shadowOffsetY = 2
  ctx.fill()
  ctx.shadowColor = 'transparent'
  ctx.lineWidth = 2.5
  ctx.strokeStyle = 'rgba(255,255,255,0.92)'
  ctx.stroke()
  ctx.beginPath()
  ctx.arc(22, 20, 6.5, 0, Math.PI * 2)
  ctx.fillStyle = dot
  ctx.fill()
  return ctx.getImageData(0, 0, w, h)
}

function machinesToGeoJSON(
  machines: Machine[],
  selectedId: string | null,
  carrierIds: Set<string>,
): GeoJSON.FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: machines.map((m) => ({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [m.lng, m.lat] },
      properties: {
        id: m.id,
        name: m.name,
        status: m.status,
        bottleCount: m.bottleIds.length,
        selected: m.id === selectedId,
        carrier: carrierIds.has(m.id),
      },
    })),
  }
}

function addLayers(map: MLMap, t: Theme) {
  const pins: Array<[string, ImageData]> = [
    ['pin-active', drawPin(ACCENT)],
    ['pin-offline', drawPin(OFFLINE)],
    ['pin-carrier', drawPin(CARRIER)],
    ['pin-selected', drawPin(ACCENT, 1.3, '#1c1c28')],
  ]
  for (const [name, img] of pins) {
    if (!map.hasImage(name)) map.addImage(name, img, { pixelRatio: 2 })
  }

  const dark = t === 'dark'

  if (!map.getSource('districts')) {
    map.addSource('districts', { type: 'geojson', data: '/data/barcelona-districts.geojson' })
  }
  if (!map.getSource('machines')) {
    map.addSource('machines', {
      type: 'geojson',
      data: { type: 'FeatureCollection', features: [] },
      cluster: true,
      clusterMaxZoom: 14,
      clusterRadius: 46,
    })
  }
  if (!map.getSource('carriers')) {
    // machines carrying the selected bottle — never clustered, always on top
    map.addSource('carriers', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } })
  }
  if (map.getLayer('machine-pins')) return

  map.addLayer({
    id: 'district-fill',
    type: 'fill',
    source: 'districts',
    paint: { 'fill-color': dark ? '#94a3ff' : '#3b4985', 'fill-opacity': dark ? 0.05 : 0.045 },
  })
  map.addLayer({
    id: 'district-hover',
    type: 'fill',
    source: 'districts',
    filter: ['==', ['get', 'name'], '__none__'],
    paint: { 'fill-color': ACCENT, 'fill-opacity': 0.13 },
  })
  map.addLayer({
    id: 'district-line',
    type: 'line',
    source: 'districts',
    paint: {
      'line-color': dark ? 'rgba(255,255,255,0.28)' : 'rgba(30,41,59,0.35)',
      'line-width': 1,
      'line-dasharray': [3, 2],
    },
  })
  map.addLayer({
    id: 'clusters',
    type: 'circle',
    source: 'machines',
    filter: ['has', 'point_count'],
    paint: {
      'circle-color': ACCENT,
      'circle-radius': ['step', ['get', 'point_count'], 16, 5, 21, 10, 27],
      'circle-stroke-width': 3,
      'circle-stroke-color': dark ? 'rgba(255,255,255,0.85)' : '#ffffff',
    },
  })
  map.addLayer({
    id: 'cluster-count',
    type: 'symbol',
    source: 'machines',
    filter: ['has', 'point_count'],
    layout: {
      'text-field': ['get', 'point_count_abbreviated'],
      'text-font': ['Montserrat Medium', 'Open Sans Regular'],
      'text-size': 13,
      'text-allow-overlap': true,
    },
    paint: { 'text-color': '#ffffff' },
  })
  map.addLayer({
    id: 'machine-pins',
    type: 'symbol',
    source: 'machines',
    filter: ['!', ['has', 'point_count']],
    layout: {
      'icon-image': [
        'case',
        ['==', ['get', 'selected'], true], 'pin-selected',
        ['==', ['get', 'carrier'], true], 'pin-carrier',
        ['==', ['get', 'status'], 'offline'], 'pin-offline',
        'pin-active',
      ],
      'icon-anchor': 'bottom',
      'icon-allow-overlap': true,
      'icon-size': ['interpolate', ['linear'], ['zoom'], 11, 0.85, 15, 1],
    },
  })
  map.addLayer({
    id: 'carrier-glow',
    type: 'circle',
    source: 'carriers',
    paint: { 'circle-color': CARRIER, 'circle-radius': 20, 'circle-opacity': 0.3, 'circle-blur': 0.7 },
  })
  map.addLayer({
    id: 'carrier-pins',
    type: 'symbol',
    source: 'carriers',
    layout: {
      'icon-image': 'pin-carrier',
      'icon-anchor': 'bottom',
      'icon-allow-overlap': true,
      'icon-size': ['interpolate', ['linear'], ['zoom'], 11, 0.9, 15, 1.05],
    },
  })
}

export default function MapView() {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<MLMap | null>(null)
  const popupRef = useRef<Popup | null>(null)
  const [styleReady, setStyleReady] = useState(0)

  const machines = useAtlas((s) => s.machines)
  const bottles = useAtlas((s) => s.bottles)
  const districts = useAtlas((s) => s.districts)
  const filters = useAtlas((s) => s.filters)
  const theme = useAtlas((s) => s.theme)
  const selectedMachineId = useAtlas((s) => s.selectedMachineId)
  const selectedBottleId = useAtlas((s) => s.selectedBottleId)
  const hoveredDistrict = useAtlas((s) => s.hoveredDistrict)

  const bottleById = useMemo(() => new Map<string, Bottle>(bottles.map((b) => [b.id, b])), [bottles])
  const filteredMachines = useMemo(
    () => machines.filter((m) => machineMatchesFilters(m, filters, bottleById)),
    [machines, filters, bottleById],
  )
  const carrierIds = useMemo(() => {
    const b = selectedBottleId ? bottleById.get(selectedBottleId) : null
    return new Set(b ? b.machineIds : [])
  }, [selectedBottleId, bottleById])

  const filteredRef = useRef(filteredMachines)
  filteredRef.current = filteredMachines
  const prevThemeRef = useRef(theme)

  const isDesktop = () => window.matchMedia('(min-width: 861px)').matches
  // account for the sidebar (left) and the slide-in detail panel (right),
  // scaled down when the window is too narrow to honor full padding
  const panelPadding = () => {
    if (!isDesktop()) return { top: 70, bottom: 280, left: 40, right: 40 }
    let left = 410
    let right = 430
    const maxTotal = window.innerWidth - 220 // keep at least 220px of usable map
    if (left + right > maxTotal) {
      const k = Math.max(0, maxTotal) / (left + right)
      left = Math.round(left * k)
      right = Math.round(right * k)
    }
    return { top: 90, bottom: 60, left, right }
  }

  // ---- init map (once) --------------------------------------------------
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return
    const map = new maplibregl.Map({
      container: containerRef.current,
      style: STYLE_URLS[useAtlas.getState().theme],
      center: BCN_CENTER,
      zoom: 12,
      minZoom: 10.5,
      maxZoom: 18,
      maxBounds: BCN_BOUNDS,
      attributionControl: { compact: true },
    })
    mapRef.current = map
    if (import.meta.env.DEV) {
      ;(window as unknown as Record<string, unknown>).__map = map
    }
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'bottom-right')

    popupRef.current = new Popup({
      closeButton: false,
      closeOnClick: false,
      offset: [0, -46],
      className: 'atlas-tooltip',
      maxWidth: '260px',
    })

    const syncVisible = () => {
      const bounds = map.getBounds()
      const ids = filteredRef.current.filter((m) => bounds.contains([m.lng, m.lat])).map((m) => m.id)
      useAtlas.getState().setVisibleMachineIds(ids)
    }

    map.on('load', () => {
      addLayers(map, useAtlas.getState().theme)
      wireEvents(map)
      syncVisible()
      setStyleReady((n) => n + 1)
    })
    map.on('moveend', syncVisible)

    return () => {
      map.remove()
      mapRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function wireEvents(map: MLMap) {
    map.on('click', 'clusters', async (e) => {
      const feature = map.queryRenderedFeatures(e.point, { layers: ['clusters'] })[0]
      if (!feature) return
      const src = map.getSource('machines') as maplibregl.GeoJSONSource
      const zoom = await src.getClusterExpansionZoom(feature.properties?.cluster_id)
      map.easeTo({
        center: (feature.geometry as GeoJSON.Point).coordinates as [number, number],
        zoom: zoom + 0.3,
      })
    })

    const onPinClick = (e: maplibregl.MapLayerMouseEvent) => {
      const f = e.features?.[0]
      if (!f) return
      popupRef.current?.remove()
      useAtlas.getState().selectMachine(f.properties?.id as string)
      useAtlas.getState().setSheetOpen(false)
    }
    map.on('click', 'machine-pins', onPinClick)
    map.on('click', 'carrier-pins', onPinClick)

    map.on('mouseenter', 'machine-pins', (e) => {
      map.getCanvas().style.cursor = 'pointer'
      const f = e.features?.[0]
      if (!f || !popupRef.current) return
      const { name, bottleCount, status } = f.properties as {
        name: string
        bottleCount: number
        status: string
      }
      popupRef.current
        .setLngLat((f.geometry as GeoJSON.Point).coordinates as [number, number])
        .setHTML(
          `<div class="tt-name">${escapeHtml(name)}</div>
           <div class="tt-sub">${bottleCount} bottle${bottleCount === 1 ? '' : 's'} stocked${
             status === 'offline' ? ' · <span class="tt-offline">offline</span>' : ''
           }</div>`,
        )
        .addTo(map)
    })
    map.on('mouseleave', 'machine-pins', () => {
      map.getCanvas().style.cursor = ''
      popupRef.current?.remove()
    })
    map.on('mouseenter', 'clusters', () => (map.getCanvas().style.cursor = 'pointer'))
    map.on('mouseleave', 'clusters', () => (map.getCanvas().style.cursor = ''))
    map.on('movestart', () => popupRef.current?.remove())

    // clicking bare map clears the selection
    map.on('click', (e) => {
      let hits: unknown[] = []
      try {
        hits = map.queryRenderedFeatures(e.point, { layers: ['machine-pins', 'carrier-pins', 'clusters'] })
      } catch {
        return
      }
      if (hits.length === 0) useAtlas.getState().clearSelection()
    })
  }

  // ---- theme swap: replace basemap, re-add our layers --------------------
  useEffect(() => {
    const map = mapRef.current
    if (!map || prevThemeRef.current === theme) return
    prevThemeRef.current = theme
    map.once('style.load', () => {
      addLayers(map, theme)
      setStyleReady((n) => n + 1)
    })
    // diff:false forces a full style reload so 'style.load' fires and our
    // custom sources/layers are re-added cleanly (diffing would drop them)
    map.setStyle(STYLE_URLS[theme], { diff: false })
  }, [theme])

  // ---- data updates -------------------------------------------------------
  useEffect(() => {
    const map = mapRef.current
    if (!map || styleReady === 0) return
    const src = map.getSource('machines') as maplibregl.GeoJSONSource | undefined
    if (!src) return
    src.setData(machinesToGeoJSON(filteredMachines, selectedMachineId, carrierIds))
    const carrierSrc = map.getSource('carriers') as maplibregl.GeoJSONSource | undefined
    carrierSrc?.setData(
      machinesToGeoJSON(machines.filter((m) => carrierIds.has(m.id)), selectedMachineId, carrierIds),
    )
    const bounds = map.getBounds()
    useAtlas
      .getState()
      .setVisibleMachineIds(filteredMachines.filter((m) => bounds.contains([m.lng, m.lat])).map((m) => m.id))
  }, [filteredMachines, selectedMachineId, carrierIds, styleReady])

  // ---- district hover / active filter highlight ---------------------------
  useEffect(() => {
    const map = mapRef.current
    if (!map || styleReady === 0 || !map.getLayer('district-hover')) return
    const target = hoveredDistrict ?? filters.district ?? '__none__'
    map.setFilter('district-hover', ['==', ['get', 'name'], target])
  }, [hoveredDistrict, filters.district, styleReady])

  // ---- camera: selected machine -------------------------------------------
  useEffect(() => {
    const map = mapRef.current
    if (!map || !selectedMachineId) return
    const m = machines.find((x) => x.id === selectedMachineId)
    if (!m) return
    map.flyTo({
      center: [m.lng, m.lat],
      zoom: Math.max(map.getZoom(), 15),
      padding: panelPadding(),
      speed: 1.6,
      essential: true,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedMachineId, machines])

  // ---- camera: selected bottle → fit its carrier machines -------------------
  useEffect(() => {
    const map = mapRef.current
    if (!map || !selectedBottleId) return
    const carriers = machines.filter((m) => carrierIds.has(m.id))
    if (carriers.length === 0) return
    if (carriers.length === 1) {
      map.flyTo({ center: [carriers[0].lng, carriers[0].lat], zoom: 15, padding: panelPadding(), speed: 1.6 })
      return
    }
    const b = new maplibregl.LngLatBounds()
    carriers.forEach((m) => b.extend([m.lng, m.lat]))
    map.fitBounds(b, { padding: panelPadding(), maxZoom: 15 })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedBottleId, carrierIds, machines])

  // ---- camera: district filter ---------------------------------------------
  useEffect(() => {
    const map = mapRef.current
    if (!map || !filters.district || !districts) return
    const feature = districts.features.find((f) => f.properties.name === filters.district)
    if (!feature) return
    const b = new maplibregl.LngLatBounds()
    const polys =
      feature.geometry.type === 'Polygon' ? [feature.geometry.coordinates] : feature.geometry.coordinates
    polys.forEach((poly) => poly[0].forEach((c) => b.extend(c as [number, number])))
    map.fitBounds(b, { padding: panelPadding(), maxZoom: 14 })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.district, districts])

  return <div ref={containerRef} className="map-root" aria-label="Map of bottle machines in Barcelona" />
}

function escapeHtml(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}
