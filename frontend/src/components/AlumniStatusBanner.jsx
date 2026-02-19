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

  const toneClasses = {
    info: 'bg-indigo-50/80 text-indigo-900 border-indigo-200 dark:bg-indigo-500/10 dark:text-indigo-100 dark:border-indigo-400/20',
    highlight: 'bg-amber-50/90 text-amber-900 border-amber-200 dark:bg-amber-500/10 dark:text-amber-100 dark:border-amber-400/30',
    success: 'bg-emerald-50/90 text-emerald-900 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-100 dark:border-emerald-400/30',
    warn: 'bg-rose-50/90 text-rose-900 border-rose-200 dark:bg-rose-500/10 dark:text-rose-100 dark:border-rose-400/30',
  }

  return (
    <div className={`px-4 py-3 ${toneClasses[tone] || toneClasses.info}`} role="status" aria-live="polite">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-4">
        <span className="flex-1 text-sm font-medium">{message}</span>
        <button
          className="inline-flex items-center rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:opacity-50 dark:bg-white dark:text-slate-900"
          disabled={!eligible || loading || converting}
          onClick={onConfirmAlumni}
          aria-disabled={!eligible || loading || converting}
          aria-label={eligible ? 'Convert to Alumni' : 'Not eligible to convert yet'}
        >
          {converting ? 'Converting…' : 'Convert to Alumni'}
        </button>
      </div>
      {!eligible && !loading && !error && decision !== 'CONFIRMED_ALUMNI' && (
        <div className="mx-auto mt-1 max-w-6xl text-xs text-slate-500 dark:text-slate-300">
          Not eligible to convert yet.
        </div>
      )}
    </div>
  )
}
