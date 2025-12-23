"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, Users, ExternalLink } from "lucide-react"
import { useRouter } from "next/navigation"

interface Session {
  id: string
  title: string
  description: string
  session_type: string
  duration_minutes: number
  max_participants: number
  scheduled_at: string
  meeting_link: string
  status: string
  alumni_profiles?: {
    profiles?: {
      full_name: string
    }
    current_company: string
    current_position: string
  }
  registrations: { student_id: string }[]
}

export function StudentSessionsList({ userId }: { userId: string }) {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [registering, setRegistering] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetchSessions()
  }, [])

  async function fetchSessions() {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("sessions")
      .select(
        `
        *,
        alumni_profiles!sessions_alumni_id_fkey (
          id,
          current_company,
          current_position,
          profiles!alumni_profiles_id_fkey (
            full_name
          )
        ),
        session_registrations!left (
          student_id
        )
      `,
      )
      .eq("status", "upcoming")
      .order("scheduled_at", { ascending: true })

    if (!error && data) {
      // Flatten the data structure
      const formattedData = data.map((session: any) => ({
        ...session,
        registrations: session.session_registrations || [],
      }))
      setSessions(formattedData)
    } else {
      console.error("Error fetching sessions:", error)
    }
    setLoading(false)
  }

  async function handleRegister(sessionId: string) {
    setRegistering(sessionId)
    const supabase = createClient()

    const { error } = await supabase.from("session_registrations").insert({
      session_id: sessionId,
      student_id: userId,
    })

    if (!error) {
      await fetchSessions()
      router.refresh()
    }
    setRegistering(null)
  }

  function isRegistered(session: Session) {
    return session.registrations.some((reg) => reg.student_id === userId)
  }

  if (loading) {
    return <div className="text-center py-12 text-muted-foreground">Loading sessions...</div>
  }

  if (sessions.length === 0) {
    return <div className="text-center py-12 text-muted-foreground">No upcoming sessions available</div>
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {sessions.map((session) => {
        const registered = isRegistered(session)
        const registrationCount = session.registrations.length

        return (
          <Card key={session.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg">{session.title}</CardTitle>
                <Badge variant="outline" className="text-xs">
                  {session.session_type.replace("_", " ")}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mt-2">
                by {session.alumni_profiles?.profiles?.full_name || "Unknown"}
                {session.alumni_profiles?.current_position && session.alumni_profiles?.current_company && (
                  <>
                    <br />
                    {session.alumni_profiles.current_position} at {session.alumni_profiles.current_company}
                  </>
                )}
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm">{session.description}</p>

              <div className="space-y-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(session.scheduled_at).toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>{session.duration_minutes} minutes</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  <span>
                    {registrationCount}/{session.max_participants} registered
                  </span>
                </div>
              </div>

              {registered ? (
                <>
                  <Badge className="w-full justify-center">Registered</Badge>
                  {session.meeting_link && (
                    <Button variant="outline" size="sm" className="w-full bg-transparent" asChild>
                      <a href={session.meeting_link} target="_blank" rel="noopener noreferrer">
                        Join Meeting
                        <ExternalLink className="h-3 w-3 ml-2" />
                      </a>
                    </Button>
                  )}
                </>
              ) : (
                <Button
                  onClick={() => handleRegister(session.id)}
                  disabled={registering === session.id || registrationCount >= session.max_participants}
                  className="w-full"
                >
                  {registering === session.id
                    ? "Registering..."
                    : registrationCount >= session.max_participants
                      ? "Session Full"
                      : "Register"}
                </Button>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
