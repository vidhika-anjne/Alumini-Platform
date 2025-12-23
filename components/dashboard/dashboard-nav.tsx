"use client"

import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { LogOut, User, MessageCircle } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface DashboardNavProps {
  role: string
  userName: string
}

export function DashboardNav({ role, userName }: DashboardNavProps) {
  const router = useRouter()

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-6">
        <div className="flex items-center gap-6">
          <Link href={`/dashboard/${role}`} className="flex items-center gap-2">
            <GraduationCap className="h-6 w-6" />
            <span className="font-bold text-lg">Alumni Platform</span>
          </Link>
          <nav className="hidden md:flex items-center gap-4">
            {role === "student" && (
              <>
                <Link href="/dashboard/student" className="text-sm hover:text-primary">
                  My Profile
                </Link>
                <Link href="/dashboard/student/alumni" className="text-sm hover:text-primary">
                  Alumni Directory
                </Link>
                <Link href="/dashboard/student/sessions" className="text-sm hover:text-primary">
                  Sessions
                </Link>
                <Link href="/dashboard/student/chat" className="text-sm hover:text-primary flex items-center gap-1">
                  <MessageCircle className="h-4 w-4" />
                  Messages
                </Link>
              </>
            )}
            {role === "alumni" && (
              <>
                <Link href="/dashboard/alumni" className="text-sm hover:text-primary">
                  My Profile
                </Link>
                <Link href="/dashboard/alumni/sessions" className="text-sm hover:text-primary">
                  My Sessions
                </Link>
                <Link href="/dashboard/alumni/chat" className="text-sm hover:text-primary flex items-center gap-1">
                  <MessageCircle className="h-4 w-4" />
                  Messages
                </Link>
              </>
            )}
            {role === "admin" && (
              <>
                <Link href="/dashboard/admin" className="text-sm hover:text-primary">
                  Dashboard
                </Link>
              </>
            )}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="text-sm font-medium capitalize">{role}</span>
          </div>
          <Button variant="ghost" size="sm" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </div>
    </header>
  )
}

function GraduationCap({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
      <path d="M6 12v5c3 3 9 3 12 0v-5" />
    </svg>
  )
}
