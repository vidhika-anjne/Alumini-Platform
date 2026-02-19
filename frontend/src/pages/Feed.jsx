import { useEffect, useState } from 'react'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import PostForm from '../components/PostForm'

const promptSuggestions = [
  {
    title: 'Career Advice',
    description: 'Interview prep, resumes, first jobs',
    icon: '💼',
    accent: 'from-blue-500 to-indigo-500',
    prompt: 'Share the most practical career advice you received entering your industry. Mention interview prep, resume tweaks, or early-role lessons.'
  },
  {
    title: 'Industry Insights',
    description: 'Trends, tools, skill gaps',
    icon: '📊',
    accent: 'from-orange-500 to-pink-500',
    prompt: 'What current industry trend should juniors watch? Highlight emerging tools, in-demand skills, and how to stay relevant.'
  },
  {
    title: 'Learning Resources',
    description: 'Books, courses, labs',
    icon: '🎓',
    accent: 'from-emerald-500 to-teal-500',
    prompt: 'Recommend a learning resource that accelerated your growth. Explain why it stands out and who should try it.'
  },
  {
    title: 'Networking Wins',
    description: 'Events, cold reach-outs, alumni clubs',
    icon: '🤝',
    accent: 'from-violet-500 to-purple-500',
    prompt: 'Share a networking strategy that consistently works for you. Include specific steps or templates students can copy.'
  },
  {
    title: 'Personal Story',
    description: 'Challenges, pivots, comebacks',
    icon: '🌟',
    accent: 'from-rose-500 to-red-500',
    prompt: 'Tell a short story about a challenge you faced and how you bounced back. Focus on decisions, mindset, and key takeaways.'
  },
  {
    title: 'Mentor Office Hours',
    description: 'Offer Q&A slots',
    icon: '🗓️',
    accent: 'from-sky-500 to-cyan-500',
    prompt: 'Offer mentorship time this month. Share topics you can guide on and how mentees should prepare or reach you.'
  }
]

const feedFilters = ['Top', 'Latest', 'Mentorship', 'Opportunities', 'Resources']

const formatRelativeTime = (value) => {
  if (!value) return 'Just now'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Recently'
  const diff = Date.now() - date.getTime()
  const hours = Math.max(1, Math.round(diff / 3600000))
  if (hours < 24) return `${hours}h`
  const days = Math.round(hours / 24)
  if (days < 7) return `${days}d`
  const weeks = Math.round(days / 7)
  if (weeks < 4) return `${weeks}w`
  return date.toLocaleDateString()
}

const getInitials = (name) => {
  if (!name) return 'AL'
  const parts = name.trim().split(' ')
  if (!parts.length) return 'AL'
  return parts.slice(0, 2).map((chunk) => chunk[0]?.toUpperCase() || '').join('')
}

const getTimestamp = (value) => {
  const time = value ? new Date(value).getTime() : NaN
  return Number.isFinite(time) ? time : 0
}

const sortPostsByDate = (list) => [...list].sort((a, b) => getTimestamp(b.createdAt) - getTimestamp(a.createdAt))

export default function Feed() {
  const [posts, setPosts] = useState([])
  const [postPrompt, setPostPrompt] = useState('')
  const [activeFilter, setActiveFilter] = useState(feedFilters[0])
  const { userType, user } = useAuth()
  const { theme } = useTheme()

  const load = async () => {
    try {
      const { data } = await api.get('/api/v1/posts')
      const items = Array.isArray(data)
        ? data
        : Array.isArray(data?.content)
          ? data.content
          : []
      setPosts(sortPostsByDate(items))
    } catch (error) {
      console.error('Unable to load posts', error)
      setPosts([])
    }
  }

  const handleSuggestionClick = (suggestion) => {
    setPostPrompt(suggestion.prompt)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  useEffect(() => { load() }, [])

  const surface = theme === 'dark'
    ? 'bg-slate-900/60 border border-slate-800 shadow-[0_0_0_1px_rgba(15,23,42,0.65)]'
    : 'bg-white border border-slate-200 shadow-sm'
  const subtleText = theme === 'dark' ? 'text-slate-400' : 'text-slate-500'
  const heroAccent = theme === 'dark'
    ? 'bg-gradient-to-r from-slate-800 to-slate-900'
    : 'bg-gradient-to-r from-sky-100 via-indigo-100 to-purple-100'
  const postsList = Array.isArray(posts) ? posts : []
  const initials = getInitials(user?.fullName || user?.name)

  return (
    <div
      className={`min-h-screen w-full ${
        theme === 'dark'
          ? 'bg-slate-950 text-slate-100'
          : 'bg-slate-100 text-slate-900'
      } py-8 px-4 sm:px-6`}
    >
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 lg:flex-row">
        <aside className="flex flex-col gap-6 lg:w-[260px]">
          <section className={`${surface} overflow-hidden rounded-2xl`}>
            <div className={`${heroAccent} h-20 w-full`} />
            <div className="space-y-4 px-5 pb-6 pt-0">
              <div className="-mt-8 flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-lg font-semibold text-indigo-600 shadow-lg">
                  {initials}
                </div>
                <div>
                  <p className="text-lg font-semibold leading-tight">
                    {user?.fullName || user?.name || 'Welcome back'}
                  </p>
                  <p className={`text-sm ${subtleText}`}>
                    {user?.designation || user?.currentCompany || 'Alumni contributor'}
                  </p>
                </div>
              </div>
              <div className="rounded-xl  p-4 text-sm dark:bg-slate-900/40">
                <dl className="space-y-2">
                  <div className="flex items-center justify-between">
                    <dt className={`${subtleText}`}>Weekly reach</dt>
                    <dd className="font-semibold">+24%</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className={`${subtleText}`}>Mentorship pings</dt>
                    <dd className="font-semibold">9</dd>
                  </div>
                  <div className="flex items-center justify-between">
                    <dt className={`${subtleText}`}>Profile views</dt>
                    <dd className="font-semibold">312</dd>
                  </div>
                </dl>
              </div>
            </div>
          </section>

          <section className={`${surface} rounded-2xl p-5 space-y-4`}>
            <p className="text-sm font-semibold">Quick actions</p>
            <div className="flex flex-col gap-3 text-sm">
              <button
                type="button"
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="flex items-center justify-between rounded-xl border border-dashed border-slate-300/80 px-4 py-3 text-left font-medium transition hover:border-indigo-400 hover:text-indigo-600 dark:border-slate-700"
              >
                Start a post
                <span aria-hidden className="text-xl">✍️</span>
              </button>
              <button
                type="button"
                className="flex items-center justify-between rounded-xl px-4 py-3 font-medium transition hover:bg-slate-100 dark:hover:bg-slate-800/70"
              >
                Schedule mentorship
                <span aria-hidden className="text-xl">🗂️</span>
              </button>
              <button
                type="button"
                className="flex items-center justify-between rounded-xl px-4 py-3 font-medium transition hover:bg-slate-100 dark:hover:bg-slate-800/70"
              >
                Share opportunity
                <span aria-hidden className="text-xl">🚀</span>
              </button>
            </div>
          </section>
        </aside>

        <main className="flex-1 space-y-6">
          <header className={`${surface} rounded-2xl p-6 space-y-4`}>
            <div>
              <p className="text-2xl font-semibold">Community Feed</p>
              <p className={`text-sm ${subtleText}`}>
                Stay close to alumni moves, mentoring moments, and curated opportunities
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              {feedFilters.map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setActiveFilter(filter)}
                  className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${
                    activeFilter === filter
                      ? 'border-indigo-500 bg-indigo-50 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-200'
                      : 'border-slate-200 text-slate-500 hover:border-indigo-200 hover:text-indigo-600 dark:border-slate-700'
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </header>

          {userType === 'alumni' && (
            <section className={`${surface} rounded-2xl p-6 space-y-4`}>
              <p className="text-sm font-semibold">Share an update with the community</p>
              <PostForm
                onCreated={() => {
                  load()
                  setPostPrompt('')
                }}
                initialPrompt={postPrompt}
              />
              <div className="flex flex-wrap gap-3">
                {promptSuggestions.slice(0, 3).map((suggestion) => (
                  <button
                    key={suggestion.title}
                    type="button"
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="rounded-full bg-slate-100 px-4 py-1.5 text-xs font-medium text-slate-700 transition hover:bg-indigo-100 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                  >
                    {suggestion.icon} {suggestion.title}
                  </button>
                ))}
              </div>
            </section>
          )}

          <section className="space-y-4">
            {postsList.length === 0 && (
              <div className={`${surface} rounded-2xl p-10 text-center`}>
                <p className="text-lg font-semibold">Your network is quiet</p>
                <p className={`mt-2 text-sm ${subtleText}`}>
                  Once alumni start sharing, fresh updates will appear here. Meanwhile, spark the first conversation.
                </p>
              </div>
            )}

            {postsList.map((post) => {
              const authorName = post.alumni?.fullName || post.alumni?.name || 'Alumni contributor'
              const authorHeadline = post.alumni?.designation || post.alumni?.currentCompany || 'Community mentor'
              const authorInitials = getInitials(authorName)

              return (
                <article key={post.id} className={`${surface} rounded-2xl p-6 space-y-4`}>
                  <div className="flex items-start gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-base font-semibold text-white">
                      {authorInitials}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold leading-tight">{authorName}</p>
                      <p className={`text-sm ${subtleText}`}>{authorHeadline}</p>
                      <p className={`text-xs ${subtleText} mt-1`}>
                        {formatRelativeTime(post.createdAt)} · {post.alumni?.location || 'Global'}
                      </p>
                    </div>
                    <button
                      type="button"
                      className="rounded-full border border-slate-200 px-4 py-1 text-xs font-semibold text-slate-500 transition hover:border-indigo-200 hover:text-indigo-600 dark:border-slate-700"
                    >
                      Follow
                    </button>
                  </div>

                  {post.content && (
                    <p className="text-sm leading-relaxed text-black-900 dark:text-slate-200">
                      {post.content}
                    </p>
                  )}

                  {post.mediaUrl && (
                    post.mediaUrl.match(/\.mp4|\.webm$/i)
                      ? (
                        <video
                          src={post.mediaUrl}
                          controls
                          className="w-full rounded-2xl border border-slate-200/50"
                        />
                      ) : (
                        <img
                          src={post.mediaUrl}
                          alt="Shared media"
                          className="w-full rounded-2xl border border-slate-200/50 object-cover"
                        />
                      )
                  )}

                  <div className="flex items-center justify-between border-t border-slate-100 pt-4 text-xs text-slate-500 dark:border-slate-800">
                    <div className="flex items-center gap-4">
                      <button type="button" className="flex items-center gap-1 font-medium transition hover:text-indigo-600">
                        <span aria-hidden>👍</span> React
                      </button>
                      <button type="button" className="flex items-center gap-1 font-medium transition hover:text-indigo-600">
                        <span aria-hidden>💬</span> Comment
                      </button>
                      <button type="button" className="flex items-center gap-1 font-medium transition hover:text-indigo-600">
                        <span aria-hidden>🔗</span> Share
                      </button>
                    </div>
                    <span className={`${subtleText}`}>
                      by alumni #{post.alumni?.id || 'community'}
                    </span>
                  </div>
                </article>
              )
            })}
          </section>
        </main>

        <aside className="hidden lg:flex w-[280px] flex-col gap-6">
          <section className={`${surface} rounded-2xl p-6 space-y-4`}>
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold">Trending in alumni circles</p>
              <span className={`text-xs ${subtleText}`}>Last 24h</span>
            </div>
            <ul className="space-y-3 text-sm">
              {['AI product roles', 'Design hiring sprints', 'Global grad fellowships', 'Remote culture playbooks', 'Scholarship deadlines'].map((topic) => (
                <li key={topic} className="flex items-center justify-between">
                  <button type="button" className="text-left font-medium text-slate-700 transition hover:text-indigo-600 dark:text-slate-100">
                    {topic}
                  </button>
                  <span className={`text-xs ${subtleText}`}>• 1.2k reads</span>
                </li>
              ))}
            </ul>
          </section>

          {userType === 'alumni' && (
            <section className={`${surface} rounded-2xl p-6 space-y-4`}>
              <div>
                <p className="text-sm font-semibold">Need a spark?</p>
                <p className={`text-xs ${subtleText}`}>Tap a card to auto-fill your post prompt</p>
              </div>
              <div className="space-y-3">
                {promptSuggestions.map((suggestion) => (
                  <button
                    key={suggestion.title}
                    type="button"
                    onClick={() => handleSuggestionClick(suggestion)}
                    className={`w-full rounded-2xl bg-gradient-to-r ${suggestion.accent} p-4 text-left text-sm font-semibold text-white shadow-sm transition hover:scale-[1.01]`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{suggestion.icon} {suggestion.title}</span>
                      <span className="text-xs font-normal opacity-80">Write</span>
                    </div>
                    <p className="mt-1 text-xs font-normal opacity-80">{suggestion.description}</p>
                  </button>
                ))}
              </div>
            </section>
          )}

          <section className={`${surface} rounded-2xl p-6 space-y-4`}>
            <p className="text-sm font-semibold">Coming up</p>
            <div className="space-y-3 text-sm">
              <div className="rounded-xl border border-dashed border-slate-300/70 p-4 dark:border-slate-700/70">
                <p className="font-semibold">Product AMA • Feb 20</p>
                <p className={`text-xs ${subtleText}`}>Hosted by alumni product leads</p>
              </div>
              <div className="rounded-xl border border-dashed border-slate-300/70 p-4 dark:border-slate-700/70">
                <p className="font-semibold">Mentor office hours</p>
                <p className={`text-xs ${subtleText}`}>Drop-in slots every Friday</p>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </div>
  )
}
