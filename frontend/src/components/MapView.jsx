import { useEffect, useRef } from 'react'
import L from 'leaflet'
import { STATUS_MARKER_COLOR } from '../utils/helpers'

// Fix Leaflet default marker issue with webpack/vite
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

function createCustomIcon(status) {
  const color = STATUS_MARKER_COLOR[status] || '#94a3b8'
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="40" viewBox="0 0 32 40">
      <path d="M16 0C7.2 0 0 7.2 0 16c0 11 16 24 16 24S32 27 32 16C32 7.2 24.8 0 16 0z" fill="${color}" opacity="0.9"/>
      <circle cx="16" cy="16" r="7" fill="white" opacity="0.9"/>
      <circle cx="16" cy="16" r="4" fill="${color}"/>
    </svg>
  `
  return L.divIcon({
    html: svg,
    className: '',
    iconSize: [32, 40],
    iconAnchor: [16, 40],
    popupAnchor: [0, -40],
  })
}

export default function MapView({ issues = [], center = [20.5937, 78.9629], zoom = 5, height = '400px', onMarkerClick }) {
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markersRef = useRef([])

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return

    const map = L.map(mapRef.current, {
      center,
      zoom,
      zoomControl: true,
    })

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map)

    mapInstanceRef.current = map
    return () => { map.remove(); mapInstanceRef.current = null }
  }, [])

  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map) return

    // Clear old markers
    markersRef.current.forEach((m) => m.remove())
    markersRef.current = []

    // Add new markers
    issues.forEach((issue) => {
      if (!issue.location?.lat || !issue.location?.lng) return
      const marker = L.marker([issue.location.lat, issue.location.lng], {
        icon: createCustomIcon(issue.status),
      })

      marker.bindPopup(`
        <div style="font-family: 'DM Sans', sans-serif; min-width: 180px;">
          <div style="font-weight: 700; font-size: 14px; color: #f1f5f9; margin-bottom: 4px;">${issue.title}</div>
          <div style="font-size: 12px; color: #94a3b8; margin-bottom: 8px;">${issue.location.address || ''}</div>
          <div style="display: flex; gap: 6px; flex-wrap: wrap;">
            <span style="background: rgba(14,165,233,0.15); color: #38bdf8; padding: 2px 8px; border-radius: 6px; font-size: 11px; font-weight: 600;">${issue.category}</span>
            <span style="background: rgba(255,255,255,0.08); color: #cbd5e1; padding: 2px 8px; border-radius: 6px; font-size: 11px;">${issue.status}</span>
          </div>
        </div>
      `)

      if (onMarkerClick) marker.on('click', () => onMarkerClick(issue))
      marker.addTo(map)
      markersRef.current.push(marker)
    })

    // Fit bounds if we have markers
    if (markersRef.current.length > 0) {
      const group = L.featureGroup(markersRef.current)
      map.fitBounds(group.getBounds().pad(0.1))
    }
  }, [issues])

  return (
    <div className="rounded-2xl overflow-hidden border border-slate-800" style={{ height }}>
      <div ref={mapRef} style={{ height: '100%', width: '100%' }} />
    </div>
  )
}
