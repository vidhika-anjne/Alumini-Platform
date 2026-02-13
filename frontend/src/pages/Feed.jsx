import { useEffect, useState } from 'react'
import api from '../api/client'
import { useAuth } from '../context/AuthContext'
import { useTheme } from '../context/ThemeContext'
import PostForm from '../components/PostForm'
import '../styles.css'

export default function Feed() {
  const [posts, setPosts] = useState([])
  const [postPrompt, setPostPrompt] = useState('')
  const { userType } = useAuth()
  const { theme } = useTheme()

  const load = async () => {
    const { data } = await api.get('/api/v1/posts')
    // Backend returns a plain List<Post>, not a paginated "content" field
    const items = Array.isArray(data)
      ? data
      : Array.isArray(data?.content)
        ? data.content
        : []
    setPosts(items)
  }

  const handleSuggestionClick = (suggestion) => {
    setPostPrompt(suggestion.prompt)
    // Scroll to top where post form is located
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  useEffect(() => { load() }, [])

  return (
    <div className="container bg-neutral-section max-w-4xl p-4 mx-auto rounded-xl">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Community Feed</h2>
      </div>

      {userType === 'alumni' && (
        <PostForm 
          onCreated={() => {
            load()
            setPostPrompt('')
          }} 
          initialPrompt={postPrompt}
        />
      )}
      
      <div className="grid">
        {Array.isArray(posts) && posts.map((p) => (
          <article key={p.id} className="card card-soft">
            <p>{p.content}</p>
            {p.mediaUrl && (
              p.mediaUrl.match(/\.mp4|\.webm$/i) ? (
                <video src={p.mediaUrl} controls className="max-w-full rounded-lg" />
              ) : (
                <img src={p.mediaUrl} alt="media" className="max-w-full rounded-lg" />
              )
            )}
            <div className="small">by alumni #{p.alumni?.id}</div>
          </article>
        ))}
      </div>

      {userType === 'alumni' && (
        <div
          className={`mt-8 p-6 rounded-2xl ${
            theme === 'dark'
              ? 'bg-slate-900/60 border border-slate-700'
              : 'bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50'
          }`}
        >
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
              ✨ Share Your Wisdom & Inspire Others ✨
            </h3>
            <p className={`text-sm ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              Click any card below to start sharing your valuable insights
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "🎯 Career Advice",
                description: "Share interview tips, resume guidance, and first job experiences",
                gradient: "from-indigo-500 via-purple-500 to-purple-600",
                icon: "💼",
                prompt: "Share a career advice tip that helped you in your professional journey. Consider topics like: interview preparation, resume building, job searching strategies, or early career decisions."
              },
              {
                title: "🏢 Industry Insights", 
                description: "Share latest trends, required skills, and company cultures",
                gradient: "from-pink-500 via-rose-500 to-red-500",
                icon: "📈",
                prompt: "What industry trends or insights would you share with students entering your field? Think about: emerging technologies, required skills, market demands, or workplace culture."
              },
              {
                title: "📚 Learning Resources",
                description: "Recommend courses, books, tools, or certifications",
                gradient: "from-blue-500 via-cyan-500 to-teal-500",
                icon: "🎓",
                prompt: "Recommend a learning resource that significantly impacted your career. This could be a course, book, certification, tool, or platform that helped you grow professionally."
              },
              {
                title: "🤝 Networking Tips",
                description: "Share how to build professional connections effectively",
                gradient: "from-green-500 via-emerald-500 to-teal-500",
                icon: "🌐",
                prompt: "Share a networking tip or strategy that has worked for you. How do you build and maintain professional relationships? What networking mistakes should students avoid?"
              },
              {
                title: "💪 Personal Stories",
                description: "Tell about challenges and how you overcame them",
                gradient: "from-orange-500 via-pink-500 to-red-500",
                icon: "🌟",
                prompt: "Share a personal challenge or setback you faced in your career and how you overcame it. Your story could inspire someone facing similar difficulties."
              },
              {
                title: "🌟 Mentorship Offer",
                description: "Offer guidance sessions or answer questions",
                gradient: "from-purple-500 via-violet-500 to-pink-500",
                icon: "🎯",
                prompt: "Are you available for mentorship or guidance? Share what areas you can help with, your expertise, and how students can connect with you for advice."
              }
            ].map((suggestion, index) => (
              <div
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className={`group relative bg-gradient-to-br ${suggestion.gradient} text-white p-6 rounded-2xl shadow-xl cursor-pointer transform hover:scale-[1.02] hover:shadow-2xl transition-all duration-300 border border-white/20 hover:border-white/40 backdrop-blur-sm overflow-hidden`}
              >
                {/* Decorative background pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white rounded-full transform translate-x-16 -translate-y-16"></div>
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-white rounded-full transform -translate-x-12 translate-y-12"></div>
                </div>
                
                {/* Content */}
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-bold text-xl group-hover:scale-105 transition-transform duration-200">
                      {suggestion.title}
                    </h4>
                    <div className="text-3xl opacity-80 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
                      {suggestion.icon}
                    </div>
                  </div>
                  
                  <p className="text-sm opacity-90 leading-relaxed mb-4 group-hover:opacity-100 transition-opacity duration-200">
                    {suggestion.description}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="text-xs opacity-80 italic group-hover:opacity-100 transition-opacity duration-200">
                      Click to create post
                    </div>
                    <div className="text-lg group-hover:translate-x-1 transition-transform duration-200">
                      →
                    </div>
                  </div>
                </div>
                
                {/* Hover glow effect */}
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/0 to-white/0 group-hover:from-white/10 group-hover:to-transparent transition-all duration-300"></div>
              </div>
            ))}
          </div>
          
          <div
            className={`text-center mt-8 p-4 rounded-xl border backdrop-blur-sm ${
              theme === 'dark'
                ? 'bg-slate-900/70 border-slate-700'
                : 'bg-white/20 border-white/30'
            }`}
          >
            <p className={`${theme === 'dark' ? 'text-gray-100' : 'text-gray-700'} font-medium`}>
              🚀 Your experience can make a real difference in someone's career journey!
            </p>
            <p className={`text-sm mt-1 ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}>
              Every shared insight helps build a stronger alumni community
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
