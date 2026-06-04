import { useState, useRef, useMemo, useCallback } from 'react'
import './App.css'

// ── Types ────────────────────────────────────────────────────────
type Page = 1 | 2 | 3

type ActivityId = 'dinner' | 'movie' | 'picnic' | 'games' | 'city' | 'custom'

interface DateFormData {
  activities:      ActivityId[]
  customActivity:  string
  dateTime:        string
  specialRequests: string
}

// ── Constants ────────────────────────────────────────────────────
const ACTIVITIES: { id: Exclude<ActivityId, 'custom'>; emoji: string; label: string }[] = [
  { id: 'dinner', emoji: '🍽️', label: 'Fancy Dinner' },
  { id: 'movie',  emoji: '🎬', label: 'Movie Night'  },
  { id: 'picnic', emoji: '🌿', label: 'Picnic in the Park' },
  { id: 'games',  emoji: '🎳', label: 'Fun & Games'  },
  { id: 'city',   emoji: '🌆', label: 'City Exploration' },
]

const HEART_SYMBOLS = ['💕', '💗', '💖', '💓', '🌸', '🌷', '💝', '❤️', '🌹']

// ── Helpers ──────────────────────────────────────────────────────
function formatDateTime(dt: string): string {
  if (!dt) return ''
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year:    'numeric',
    month:   'long',
    day:     'numeric',
    hour:    'numeric',
    minute:  '2-digit',
  }).format(new Date(dt))
}

function getActivityDisplay(data: DateFormData): string {
  return data.activities
    .map(id => {
      if (id === 'custom') return data.customActivity.trim()
      const found = ACTIVITIES.find(a => a.id === id)
      return found ? `${found.emoji} ${found.label}` : ''
    })
    .filter(Boolean)
    .join(' · ')
}

// ── Confetti (page 3) ────────────────────────────────────────────
const CONF_COLORS = [
  '#ff85a1','#ffc2d4','#ffb3c6','#e8537a','#ff6b9d',
  '#ffd6e0','#c9184a','#ffcad4','#a8dadc','#ffb347',
  '#b5e48c','#90e0ef',
]

function Confetti() {
  const pieces = useMemo(() =>
    Array.from({ length: 90 }, (_, i) => ({
      id:       i,
      left:     `${(i * 1.11) % 100}%`,
      delay:    `${(i % 22) * 0.13}s`,
      duration: `${2.4 + (i % 12) * 0.25}s`,
      color:    CONF_COLORS[i % CONF_COLORS.length],
      width:    `${6 + (i % 7)}px`,
      height:   i % 3 === 0 ? `${6 + (i % 7)}px` : `${14 + (i % 6) * 2}px`,
      radius:   i % 3 === 0 ? '50%' : '3px',
    })),
  [])

  return (
    <div className="confetti-layer" aria-hidden="true">
      {pieces.map(p => (
        <div
          key={p.id}
          className="confetti-piece"
          style={{
            left:              p.left,
            animationDelay:    p.delay,
            animationDuration: p.duration,
            backgroundColor:   p.color,
            width:             p.width,
            height:            p.height,
            borderRadius:      p.radius,
          }}
        />
      ))}
    </div>
  )
}

// ── Rising hearts (page 3) ───────────────────────────────────────
function RisingHearts() {
  const hearts = useMemo(() =>
    Array.from({ length: 22 }, (_, i) => ({
      id:       i,
      symbol:   HEART_SYMBOLS[i % HEART_SYMBOLS.length],
      left:     `${(i * 4.76) % 98}%`,
      delay:    `${(i * 0.38) % 6}s`,
      duration: `${4.5 + (i % 6) * 0.6}s`,
      size:     `${0.95 + (i % 5) * 0.38}rem`,
    })),
  [])

  return (
    <div className="hearts-layer" aria-hidden="true">
      {hearts.map(h => (
        <span
          key={h.id}
          className="heart-rise"
          style={{
            left:              h.left,
            animationDelay:    h.delay,
            animationDuration: h.duration,
            fontSize:          h.size,
          }}
        >
          {h.symbol}
        </span>
      ))}
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════
//  PAGE 1 – The Big Question
// ══════════════════════════════════════════════════════════════════
function Page1({ onYes }: { onYes: () => void }) {
  const btnRef = useRef<HTMLButtonElement>(null)

  const dodge = useCallback(() => {
    const btn = btnRef.current
    if (!btn) return
    const margin = 16
    const w = btn.offsetWidth  || 140
    const h = btn.offsetHeight || 44
    const maxX = Math.max(margin + w, window.innerWidth  - w - margin)
    const maxY = Math.max(margin + h, window.innerHeight - h - margin)
    const newX = margin + Math.floor(Math.random() * (maxX - margin))
    const newY = margin + Math.floor(Math.random() * (maxY - margin))
    btn.style.position = 'fixed'
    btn.style.margin   = '0'
    btn.style.zIndex   = '9999'
    btn.style.left     = `${newX}px`
    btn.style.top      = `${newY}px`
  }, [])

  return (
    <div className="page page-1">
      <div className="card">
        <span className="card-emoji-top">💝</span>
        <h1 className="question-title">Will you go out on a date with me?</h1>
        <p className="question-subtitle">🙏 Pretty please? 🙏</p>
        <div className="button-group">
          <button className="btn btn-yes" onClick={onYes}>
            Yes! 🥰
          </button>
          <button
            ref={btnRef}
            className="btn btn-maybe"
            onMouseEnter={dodge}
            onTouchStart={(e) => { e.preventDefault(); dodge() }}
          >
            Maybe later 🙈
          </button>
        </div>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════
//  PAGE 2 – The Date Planner (step-by-step)
// ══════════════════════════════════════════════════════════════════
type Step = 1 | 2 | 3

function Page2({ onSubmit }: { onSubmit: (data: DateFormData) => void }) {
  const [form, setForm] = useState<DateFormData>({
    activities:      [],
    customActivity:  '',
    dateTime:        '',
    specialRequests: '',
  })
  const [step,             setStep]             = useState<Step>(1)
  const [stepDir,          setStepDir]          = useState<'forward' | 'back'>('forward')
  const [stepTransitioning,setStepTransitioning] = useState(false)

  const showCustom = form.activities.includes('custom')

  function toggleActivity(id: ActivityId) {
    setForm(f => {
      const already     = f.activities.includes(id)
      const activities  = already ? f.activities.filter(a => a !== id) : [...f.activities, id]
      const customActivity = activities.includes('custom') ? f.customActivity : ''
      return { ...f, activities, customActivity }
    })
  }

  function goToStep(next: Step, dir: 'forward' | 'back') {
    setStepDir(dir)
    setStepTransitioning(true)
    setTimeout(() => {
      setStep(next)
      setStepTransitioning(false)
    }, 240)
  }

  const canNext =
    step === 1
      ? form.activities.length > 0 && (!form.activities.includes('custom') || form.customActivity.trim() !== '')
      : step === 2
        ? form.dateTime !== ''
        : true

  function handleNext() {
    if (step < 3) goToStep((step + 1) as Step, 'forward')
    else onSubmit(form)
  }

  const stepAnimClass = stepTransitioning
    ? (stepDir === 'forward' ? 'step-exit-left' : 'step-exit-right')
    : (stepDir === 'forward' ? 'step-enter-right' : 'step-enter-left')

  return (
    <div className="page page-2">
      <div className="card planner-card">
        <div className="planner-header">
          <span className="party-emoji">🎉</span>
          <h1 className="page-title">Yay! I knew you'd say yes!</h1>
          <p className="page-subtitle">Now let's plan our perfect date... ✨</p>
        </div>

        <div className="step-indicator" aria-label={`Step ${step} of 3`}>
          {([1, 2, 3] as const).map(s => (
            <div
              key={s}
              className={`step-dot${step === s ? ' active' : step > s ? ' done' : ''}`}
            />
          ))}
        </div>

        <div
          className={`step-content ${stepAnimClass}`}
          style={{ pointerEvents: stepTransitioning ? 'none' : undefined }}
        >
          {step === 1 && (
            <div className="form-section">
              <label className="form-label">🗺️ Where would you like to go?</label>
              <p className="form-hint">Pick as many as you like! 🌟</p>
              <div className="activity-grid">
                {ACTIVITIES.map(act => (
                  <button
                    key={act.id}
                    type="button"
                    className={`activity-card${form.activities.includes(act.id) ? ' selected' : ''}`}
                    onClick={() => toggleActivity(act.id)}
                  >
                    {form.activities.includes(act.id) && <span className="activity-check">✓</span>}
                    <span className="activity-emoji">{act.emoji}</span>
                    <span className="activity-label">{act.label}</span>
                  </button>
                ))}
                <button
                  type="button"
                  className={`activity-card${form.activities.includes('custom') ? ' selected' : ''}`}
                  onClick={() => toggleActivity('custom')}
                >
                  {form.activities.includes('custom') && <span className="activity-check">✓</span>}
                  <span className="activity-emoji">✏️</span>
                  <span className="activity-label">Something else...</span>
                </button>
              </div>
              {showCustom && (
                <input
                  type="text"
                  className="custom-input custom-input-enter"
                  placeholder="Tell me your dream date idea! 💭"
                  value={form.customActivity}
                  onChange={e => setForm(f => ({ ...f, customActivity: e.target.value }))}
                />
              )}
            </div>
          )}

          {step === 2 && (
            <div className="form-section">
              <label className="form-label" htmlFor="date-picker">
                📅 When are you free?
              </label>
              <input
                id="date-picker"
                type="datetime-local"
                className="datetime-input"
                value={form.dateTime}
                onChange={e => setForm(f => ({ ...f, dateTime: e.target.value }))}
              />
            </div>
          )}

          {step === 3 && (
            <div className="form-section">
              <label className="form-label" htmlFor="requests">
                💌 Any special requests or things you'd love?
              </label>
              <textarea
                id="requests"
                className="textarea-input"
                placeholder="Dietary needs, a dream activity, anything at all... 🌟"
                value={form.specialRequests}
                onChange={e => setForm(f => ({ ...f, specialRequests: e.target.value }))}
                rows={4}
              />
            </div>
          )}
        </div>

        <div className="step-nav">
          {step > 1 && (
            <button
              type="button"
              className="btn btn-back"
              onClick={() => goToStep((step - 1) as Step, 'back')}
            >
              ← Back
            </button>
          )}
          <button
            type="button"
            className="btn btn-submit"
            disabled={!canNext}
            onClick={handleNext}
          >
            {step === 3 ? "Book it! 💕" : 'Next →'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════
//  PAGE 3 – Sweet Confirmation
// ══════════════════════════════════════════════════════════════════
function Page3({ formData }: { formData: DateFormData }) {
  const dateStr     = formatDateTime(formData.dateTime)
  const activityStr = getActivityDisplay(formData)

  return (
    <div className="page page-3">
      <Confetti />
      <RisingHearts />
      <div className="card confirmation-card">
        <span className="confirm-badge">💍</span>
        <h1 className="confirm-title">It's a date! 📅</h1>

        <div className="date-summary-box">
          <div className="summary-row">
            <span className="summary-icon">📅</span>
            <span className="summary-text">{dateStr}</span>
          </div>
          <div className="summary-sep" />
          <div className="summary-row">
            <span className="summary-icon">✨</span>
            <span className="summary-text">{activityStr}</span>
          </div>
          {formData.specialRequests.trim() && (
            <>
              <div className="summary-sep" />
              <div className="summary-row">
                <span className="summary-icon">💌</span>
                <span className="summary-text">{formData.specialRequests.trim()}</span>
              </div>
            </>
          )}
        </div>

        <p className="confirm-message">I can't wait! ❤️</p>
        <p className="confirm-sub">This is going to be the best date ever 🌹</p>
      </div>
    </div>
  )
}

// ══════════════════════════════════════════════════════════════════
//  ROOT APP
// ══════════════════════════════════════════════════════════════════
function App() {
  const [page,         setPage]         = useState<Page>(1)
  const [transitioning,setTransitioning] = useState(false)
  const [formData,     setFormData]      = useState<DateFormData | null>(null)

  const goTo = useCallback((next: Page) => {
    setTransitioning(true)
    setTimeout(() => {
      setPage(next)
      setTransitioning(false)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }, 380)
  }, [])

  const handleYes    = useCallback(() => goTo(2), [goTo])
  const handleSubmit = useCallback((data: DateFormData) => {
    setFormData(data)
    goTo(3)
  }, [goTo])

  return (
    <div className="app">
      <div className={`page-wrapper ${transitioning ? 'page-exit' : 'page-enter'}`}>
        {page === 1 && <Page1 onYes={handleYes} />}
        {page === 2 && <Page2 onSubmit={handleSubmit} />}
        {page === 3 && formData && <Page3 formData={formData} />}
      </div>
    </div>
  )
}

export default App
