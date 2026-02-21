import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapPin, Upload, X, Locate, AlertTriangle } from 'lucide-react'
import toast from 'react-hot-toast'
import L from 'leaflet'
import imageCompression from 'browser-image-compression'
import { issueService } from '../../services/issueService'
import { ISSUE_CATEGORIES, PRIORITIES } from '../../utils/helpers'

export default function ReportIssue() {
  const navigate = useNavigate()
  const mapRef = useRef(null)
  const mapInstanceRef = useRef(null)
  const markerRef = useRef(null)

  const [form, setForm] = useState({
    title: '', category: '', description: '', priority: 'medium',
    location: { lat: null, lng: null, address: '' },
  })
  const [images, setImages] = useState([])
  const [imageFiles, setImageFiles] = useState([])
  const [loading, setLoading] = useState(false)
  const [locating, setLocating] = useState(false)
  const [step, setStep] = useState(1) // 1=details, 2=location, 3=review

  // Init map on step 2
  useEffect(() => {
    if (step !== 2 || !mapRef.current || mapInstanceRef.current) return

    const map = L.map(mapRef.current, { center: [20.5937, 78.9629], zoom: 5 })
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap',
    }).addTo(map)

    map.on('click', (e) => setLocationFromLatLng(e.latlng.lat, e.latlng.lng, map))
    mapInstanceRef.current = map

    return () => { map.remove(); mapInstanceRef.current = null }
  }, [step])

  const setLocationFromLatLng = async (lat, lng, map) => {
    const mapInst = map || mapInstanceRef.current
    if (!mapInst) return

    if (markerRef.current) markerRef.current.remove()
    markerRef.current = L.marker([lat, lng]).addTo(mapInst)
    mapInst.setView([lat, lng], 15)

    // Reverse geocode using OpenStreetMap Nominatim (free)
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`)
      const data = await res.json()
      const address = data.display_name || `${lat.toFixed(5)}, ${lng.toFixed(5)}`
      setForm((prev) => ({ ...prev, location: { lat, lng, address } }))
    } catch {
      setForm((prev) => ({ ...prev, location: { lat, lng, address: `${lat.toFixed(5)}, ${lng.toFixed(5)}` } }))
    }
  }

  const handleGeolocate = () => {
    if (!navigator.geolocation) return toast.error('Geolocation not supported')
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setLocationFromLatLng(coords.latitude, coords.longitude)
        setLocating(false)
      },
      () => { toast.error('Could not get location'); setLocating(false) }
    )
  }

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files)
    if (images.length + files.length > 3) return toast.error('Max 3 images allowed')

    for (const file of files) {
      try {
        const compressed = await imageCompression(file, { maxSizeMB: 1, maxWidthOrHeight: 1280 })
        const url = URL.createObjectURL(compressed)
        setImages((prev) => [...prev, url])
        setImageFiles((prev) => [...prev, compressed])
      } catch {
        toast.error('Image compression failed')
      }
    }
  }

  const removeImage = (i) => {
    setImages((prev) => prev.filter((_, idx) => idx !== i))
    setImageFiles((prev) => prev.filter((_, idx) => idx !== i))
  }

  const handleSubmit = async () => {
    if (!form.location.lat) return toast.error('Please select a location on the map')
    setLoading(true)
    try {
      let imageUrls = []
      if (imageFiles.length > 0) {
        const uploadRes = await issueService.uploadImages(imageFiles)
        imageUrls = uploadRes.data.urls
      }
      await issueService.create({ ...form, images: imageUrls })
      toast.success('Issue reported successfully!')
      navigate('/citizen/complaints')
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to submit issue')
    } finally {
      setLoading(false)
    }
  }

  const steps = ['Details', 'Location', 'Review']

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="page-title mb-1">Report an Issue</h1>
        <p className="font-body text-slate-500">Help improve your city by reporting civic problems</p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {steps.map((s, i) => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-display font-bold transition-all
              ${step > i + 1 ? 'bg-emerald-500 text-white' : step === i + 1 ? 'bg-civic-500 text-white' : 'bg-slate-800 text-slate-500'}`}>
              {step > i + 1 ? '✓' : i + 1}
            </div>
            <span className={`text-sm font-display ${step === i + 1 ? 'text-slate-100' : 'text-slate-500'}`}>{s}</span>
            {i < steps.length - 1 && <div className={`flex-1 h-px ${step > i + 1 ? 'bg-emerald-500/40' : 'bg-slate-800'}`} />}
          </div>
        ))}
      </div>

      {/* Step 1: Details */}
      {step === 1 && (
        <div className="card p-6 space-y-5 animate-slide-up">
          <div>
            <label className="label">Issue Title *</label>
            <input className="input-field" placeholder="e.g., Large pothole on Main Street"
              value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          </div>

          <div>
            <label className="label">Category *</label>
            <div className="grid grid-cols-2 gap-2">
              {ISSUE_CATEGORIES.map((cat) => (
                <button key={cat.value} type="button"
                  onClick={() => setForm({ ...form, category: cat.value })}
                  className={`flex items-center gap-2 p-3 rounded-xl border text-sm font-display text-left transition-all
                    ${form.category === cat.value ? 'border-civic-500/60 bg-civic-500/10 text-slate-100' : 'border-slate-700 bg-slate-800/40 text-slate-400 hover:border-slate-600'}`}>
                  <span>{cat.icon}</span> {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label">Description *</label>
            <textarea className="input-field resize-none" rows={4}
              placeholder="Describe the issue in detail. Include any relevant information that might help authorities resolve it..."
              value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>

          <div>
            <label className="label">Priority</label>
            <div className="flex gap-2">
              {PRIORITIES.map((p) => (
                <button key={p.value} type="button"
                  onClick={() => setForm({ ...form, priority: p.value })}
                  className={`flex-1 py-2 rounded-xl border text-sm font-display transition-all
                    ${form.priority === p.value
                      ? p.value === 'high' ? 'border-red-500/60 bg-red-500/10 text-red-400'
                        : p.value === 'medium' ? 'border-amber-500/60 bg-amber-500/10 text-amber-400'
                        : 'border-slate-500/60 bg-slate-500/10 text-slate-300'
                      : 'border-slate-700 bg-slate-800/40 text-slate-500 hover:border-slate-600'}`}>
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="label">Photos (optional, max 3)</label>
            <div className="flex gap-3 flex-wrap">
              {images.map((img, i) => (
                <div key={i} className="relative w-20 h-20">
                  <img src={img} className="w-20 h-20 object-cover rounded-xl border border-slate-700" alt="" />
                  <button onClick={() => removeImage(i)}
                    className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                    <X size={10} className="text-white" />
                  </button>
                </div>
              ))}
              {images.length < 3 && (
                <label className="w-20 h-20 rounded-xl border-2 border-dashed border-slate-700 hover:border-civic-500/60 flex flex-col items-center justify-center cursor-pointer transition-all bg-slate-800/30">
                  <Upload size={16} className="text-slate-500" />
                  <span className="text-xs text-slate-600 mt-1">Add</span>
                  <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
                </label>
              )}
            </div>
          </div>

          <button
            onClick={() => { if (!form.title || !form.category || !form.description) return toast.error('Fill all required fields'); setStep(2) }}
            className="btn-primary w-full"
          >
            Next: Set Location →
          </button>
        </div>
      )}

      {/* Step 2: Location */}
      {step === 2 && (
        <div className="card p-6 space-y-4 animate-slide-up">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-display font-semibold text-slate-100">Pin the Location</h3>
              <p className="text-slate-500 text-sm font-body">Click on the map or use GPS to set the issue location</p>
            </div>
            <button onClick={handleGeolocate} disabled={locating}
              className="btn-secondary flex items-center gap-2 text-sm">
              {locating ? <div className="spinner" /> : <Locate size={14} />}
              Use GPS
            </button>
          </div>

          <div className="rounded-2xl overflow-hidden border border-slate-700" style={{ height: 350 }}>
            <div ref={mapRef} style={{ height: '100%', width: '100%' }} />
          </div>

          {form.location.address && (
            <div className="flex items-start gap-2 p-3 bg-civic-500/10 border border-civic-500/20 rounded-xl">
              <MapPin size={14} className="text-civic-400 mt-0.5 flex-shrink-0" />
              <span className="text-sm font-body text-slate-300">{form.location.address}</span>
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={() => setStep(1)} className="btn-secondary flex-1">← Back</button>
            <button
              onClick={() => { if (!form.location.lat) return toast.error('Please select a location'); setStep(3) }}
              className="btn-primary flex-1"
            >
              Next: Review →
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Review */}
      {step === 3 && (
        <div className="card p-6 space-y-5 animate-slide-up">
          <div className="flex items-center gap-2 text-amber-400 mb-2">
            <AlertTriangle size={16} />
            <span className="font-display font-semibold text-sm">Review before submitting</span>
          </div>

          {[
            { label: 'Title', val: form.title },
            { label: 'Category', val: ISSUE_CATEGORIES.find((c) => c.value === form.category)?.label },
            { label: 'Priority', val: form.priority.toUpperCase() },
            { label: 'Location', val: form.location.address },
          ].map(({ label, val }) => (
            <div key={label} className="flex justify-between py-2 border-b border-slate-800">
              <span className="text-slate-500 text-sm font-display">{label}</span>
              <span className="text-slate-200 text-sm font-body text-right max-w-xs">{val}</span>
            </div>
          ))}

          <div>
            <span className="text-slate-500 text-sm font-display block mb-1">Description</span>
            <p className="text-slate-300 text-sm font-body leading-relaxed">{form.description}</p>
          </div>

          {images.length > 0 && (
            <div>
              <span className="text-slate-500 text-sm font-display block mb-2">Photos ({images.length})</span>
              <div className="flex gap-2">
                {images.map((img, i) => (
                  <img key={i} src={img} className="w-20 h-20 object-cover rounded-xl border border-slate-700" alt="" />
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button onClick={() => setStep(2)} className="btn-secondary flex-1">← Back</button>
            <button onClick={handleSubmit} disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2">
              {loading ? <div className="spinner" /> : 'Submit Report'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
