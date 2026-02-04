import { useEffect, useState } from 'react'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'

function daysUntil(dateStr) {
  if (!dateStr) return null
  const today = new Date()
  const target = new Date(dateStr)
  // Normalize times
  today.setHours(0, 0, 0, 0)
  target.setHours(0, 0, 0, 0)
  const ms = target - today
  return Math.ceil(ms / (1000 * 60 * 60 * 24))
}

export default function AlumniStatusBanner() {
  const { userType, token, switchAccount } = useAuth()
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [converting, setConverting] = useState(false)

  useEffect(() => {
    const load = async () => {
      // Only for students and when authenticated
      if (userType !== 'student' || !token) return
      setLoading(true)
      setError('')
      try {
        const { data } = await api.get('/api/v1/student/status')
        setStatus(data || null)
      } catch (e) {
        setError('Could not load alumni status')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [userType, token])

  if (userType !== 'student') return null

  const expectedEndDate = status?.expectedEndDate
  const nextPromptDate = status?.nextPromptDate
  const isPastExpectedEndDate = !!status?.isPastExpectedEndDate
  const shouldPromptForAlumni = !!status?.shouldPromptForAlumni
  const decision = status?.alumniDecisionStatus

  const eligible = shouldPromptForAlumni && decision !== 'CONFIRMED_ALUMNI'

  const onConfirmAlumni = async () => {
    if (!eligible || converting) return
    setConverting(true)
    setError('')
    try {
      const { data } = await api.post('/api/v1/student/confirm-alumni')
      const tok = data?.token
      const alumni = data?.alumni
      if (tok && alumni) {
        switchAccount('alumni', tok, alumni)
        // Update local status view to reflect conversion
        setStatus({ ...status, alumniDecisionStatus: 'CONFIRMED_ALUMNI', shouldPromptForAlumni: false })
      }
    } catch (e) {
      setError(e?.response?.data?.message || 'Conversion failed')
    } finally {
      setConverting(false)
    }
  }

  const daysLeft = expectedEndDate ? daysUntil(expectedEndDate) : null
  const daysToNextPrompt = nextPromptDate ? daysUntil(nextPromptDate) : null

  let message = ''
  let tone = 'info'

  if (error) {
    message = error
    tone = 'warn'
  } else if (loading) {
    message = 'Checking your alumni status…'
    tone = 'info'
  } else if (!status) {
    message = 'Alumni status unavailable.'
    tone = 'warn'
  } else if (decision === 'CONFIRMED_ALUMNI') {
    message = 'You have been converted to Alumni. Please use your alumni login.'
    tone = 'success'
  } else if (!isPastExpectedEndDate) {
    if (typeof daysLeft === 'number' && daysLeft > 0) {
      message = `You have ${daysLeft} day${daysLeft === 1 ? '' : 's'} left until alumni eligibility (on ${expectedEndDate}).`
    } else if (daysLeft === 0) {
      message = `Today is your eligibility date (${expectedEndDate}).`
    } else {
      message = `You will become eligible on ${expectedEndDate}.`
    }
    tone = 'info'
  } else if (shouldPromptForAlumni) {
    message = 'You are eligible to convert to Alumni now.'
    tone = 'highlight'
  } else if (decision === 'DELAYED') {
    if (typeof daysToNextPrompt === 'number' && daysToNextPrompt > 0) {
      message = `You delayed conversion. We will ask again in ${daysToNextPrompt} day${daysToNextPrompt === 1 ? '' : 's'} (on ${nextPromptDate}).`
    } else if (daysToNextPrompt === 0) {
      message = `Your next prompt is today (${nextPromptDate}).`
    } else {
      message = `You delayed conversion. Next prompt date: ${nextPromptDate || 'TBD'}.`
    }
    tone = 'info'
  } else {
    message = 'Your alumni status is up to date.'
    tone = 'info'
  }

  return (
    <div className={`banner banner-${tone}`} role="status" aria-live="polite">
      <div className="container banner-inner" style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span className="banner-text" style={{ flex: 1 }}>{message}</span>
        {/* Convert button is always visible, disabled unless eligible */}
        <button
          className="button primary"
          disabled={!eligible || loading || converting}
          onClick={onConfirmAlumni}
          aria-disabled={!eligible || loading || converting}
          aria-label={eligible ? 'Convert to Alumni' : 'Not eligible to convert yet'}
        >
          {converting ? 'Converting…' : 'Convert to Alumni'}
        </button>
      </div>
      {!eligible && !loading && !error && decision !== 'CONFIRMED_ALUMNI' && (
        <div className="container" style={{ paddingBottom: 10 }}>
          <span className="small">Not eligible to convert yet.</span>
        </div>
      )}
    </div>
  )
}
