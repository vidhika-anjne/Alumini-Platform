import React from 'react'

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    // You can send this to a logging service
    // console.error('ErrorBoundary caught:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="mx-auto max-w-3xl px-4 py-16 text-center">
          <h2 className="text-2xl font-bold text-rose-600">Something went wrong.</h2>
          <p className="mt-2 text-sm text-rose-400">{String(this.state.error)}</p>
          <button
            className="mt-6 rounded-full border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-600 transition hover:border-indigo-500 hover:text-indigo-600"
            onClick={() => window.location.reload()}
          >
            Reload
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
