"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Users, Plus, Trash2 } from "lucide-react"
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
  session_registrations: { id: string }[]
}

interface AlumniSessionsManagerProps {
  userId: string
  isVerified: boolean
}

export function AlumniSessionsManager({ userId, isVerified }: AlumniSessionsManagerProps) {
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    session_type: "mentorship",
    duration_minutes: 60,
    max_participants: 10,
    scheduled_at: "",
    meeting_link: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  useEffect(() => {
    if (isVerified) {
      fetchSessions()
    } else {
      setLoading(false)
    }
  }, [isVerified])

  async function fetchSessions() {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("sessions")
      .select(
        `
        *,
        session_registrations (id)
      `,
      )
      .eq("alumni_id", userId)
      .order("scheduled_at", { ascending: false })

    if (!error && data) {
      setSessions(data as unknown as Session[])
    }
    setLoading(false)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsSubmitting(true)

    const supabase = createClient()

    const { error } = await supabase.from("sessions").insert({
      alumni_id: userId,
      ...formData,
    })

    if (!error) {
      await fetchSessions()
      setShowForm(false)
      setFormData({
        title: "",
        description: "",
        session_type: "mentorship",
        duration_minutes: 60,
        max_participants: 10,
        scheduled_at: "",
        meeting_link: "",
      })
      router.refresh()
    }

    setIsSubmitting(false)
  }

  async function handleDelete(sessionId: string) {
    if (!confirm("Are you sure you want to delete this session?")) return

    const supabase = createClient()
    const { error } = await supabase.from("sessions").delete().eq("id", sessionId)

    if (!error) {
      await fetchSessions()
      router.refresh()
    }
  }

  if (!isVerified) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        Please wait for admin verification to create sessions
      </div>
    )
  }

  if (loading) {
    return <div className="text-center py-12 text-muted-foreground">Loading sessions...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-2" />
          {showForm ? "Cancel" : "Create Session"}
        </Button>
      </div>

      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Session</CardTitle>
            <CardDescription>Schedule a mentorship session for students</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="title">Session Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="e.g., Career Guidance for Software Engineers"
                    required
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe what students will learn..."
                    rows={4}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="session_type">Session Type</Label>
                  <Select
                    value={formData.session_type}
                    onValueChange={(value) => setFormData({ ...formData, session_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mentorship">Mentorship</SelectItem>
                      <SelectItem value="technical">Technical</SelectItem>
                      <SelectItem value="career_guidance">Career Guidance</SelectItem>
                      <SelectItem value="interview_prep">Interview Prep</SelectItem>
                      <SelectItem value="project_review">Project Review</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="duration_minutes">Duration (minutes)</Label>
                  <Input
                    id="duration_minutes"
                    type="number"
                    min="15"
                    step="15"
                    value={formData.duration_minutes}
                    onChange={(e) => setFormData({ ...formData, duration_minutes: Number.parseInt(e.target.value) || 60 })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="max_participants">Max Participants</Label>
                  <Input
                    id="max_participants"
                    type="number"
                    min="1"
                    value={formData.max_participants}
                    onChange={(e) => setFormData({ ...formData, max_participants: Number.parseInt(e.target.value) || 10 })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="scheduled_at">Schedule Date & Time</Label>
                  <Input
                    id="scheduled_at"
                    type="datetime-local"
                    value={formData.scheduled_at}
                    onChange={(e) => setFormData({ ...formData, scheduled_at: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="meeting_link">Meeting Link</Label>
                  <Input
                    id="meeting_link"
                    type="url"
                    value={formData.meeting_link}
                    onChange={(e) => setFormData({ ...formData, meeting_link: e.target.value })}
                    placeholder="https://meet.google.com/..."
                  />
                </div>
              </div>

              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Session"}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {sessions.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          No sessions created yet. Create your first session to connect with students!
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {sessions.map((session) => (
            <Card key={session.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-lg">{session.title}</CardTitle>
                  <Badge variant={session.status === "upcoming" ? "default" : "secondary"}>{session.status}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground line-clamp-2">{session.description}</p>

                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{new Date(session.scheduled_at).toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>{session.duration_minutes} minutes</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {session.session_registrations.length}/{session.max_participants} registered
                    </span>
                  </div>
                </div>

                <Button variant="destructive" size="sm" onClick={() => handleDelete(session.id)} className="w-full">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete Session
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
