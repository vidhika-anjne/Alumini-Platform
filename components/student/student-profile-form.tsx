"use client"

import type React from "react"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { X } from "lucide-react"

interface StudentProfileData {
  enrollment_number?: string
  branch?: string
  year_of_study?: number
  phone?: string
  bio?: string
  skills?: string[]
  interests?: string[]
  preferences?: string[]
  linkedin_url?: string
  github_url?: string
}

interface StudentProfileFormProps {
  initialData: StudentProfileData | null
  userId: string
}

export function StudentProfileForm({ initialData, userId }: StudentProfileFormProps) {
  const [formData, setFormData] = useState({
    enrollment_number: initialData?.enrollment_number || "",
    branch: initialData?.branch || "",
    year_of_study: initialData?.year_of_study || 1,
    phone: initialData?.phone || "",
    bio: initialData?.bio || "",
    skills: initialData?.skills?.join(", ") || "",
    interests: initialData?.interests?.join(", ") || "",
    linkedin_url: initialData?.linkedin_url || "",
    github_url: initialData?.github_url || "",
  })
  const [preferences, setPreferences] = useState<string[]>(initialData?.preferences || [])
  const [preferenceInput, setPreferenceInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const router = useRouter()

  const addPreference = () => {
    if (preferenceInput.trim() && !preferences.includes(preferenceInput.trim())) {
      setPreferences([...preferences, preferenceInput.trim()])
      setPreferenceInput("")
    }
  }

  const removePreference = (pref: string) => {
    setPreferences(preferences.filter((p) => p !== pref))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    const supabase = createClient()

    const profileData = {
      id: userId,
      enrollment_number: formData.enrollment_number,
      branch: formData.branch,
      year_of_study: formData.year_of_study,
      phone: formData.phone,
      bio: formData.bio,
      skills: formData.skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      interests: formData.interests
        .split(",")
        .map((i) => i.trim())
        .filter(Boolean),
      preferences: preferences,
      linkedin_url: formData.linkedin_url || null,
      github_url: formData.github_url || null,
    }

    const { error } = initialData
      ? await supabase.from("student_profiles").update(profileData).eq("id", userId)
      : await supabase.from("student_profiles").insert(profileData)

    if (error) {
      setMessage({ type: "error", text: error.message })
    } else {
      setMessage({ type: "success", text: "Profile saved successfully!" })
      router.refresh()
    }

    setIsLoading(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
        <CardDescription>Complete your profile to connect with alumni</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="enrollment_number">Enrollment Number</Label>
              <Input
                id="enrollment_number"
                value={formData.enrollment_number}
                onChange={(e) => setFormData({ ...formData, enrollment_number: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="branch">Branch</Label>
              <Input
                id="branch"
                value={formData.branch}
                onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
                placeholder="e.g., Computer Science"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="year_of_study">Year of Study</Label>
              <Input
                id="year_of_study"
                type="number"
                min="1"
                max="4"
                value={formData.year_of_study}
                onChange={(e) => setFormData({ ...formData, year_of_study: Number.parseInt(e.target.value) })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              placeholder="Tell us about yourself..."
              rows={4}
            />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="skills">Skills (comma separated)</Label>
              <Input
                id="skills"
                value={formData.skills}
                onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                placeholder="React, Python, Java"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="interests">Interests (comma separated)</Label>
              <Input
                id="interests"
                value={formData.interests}
                onChange={(e) => setFormData({ ...formData, interests: e.target.value })}
                placeholder="Web Dev, AI, Mobile Apps"
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="preferences">
                What are you looking for? <span className="text-muted-foreground">(Add preferences)</span>
              </Label>
              <div className="flex gap-2">
                <Input
                  id="preferences"
                  value={preferenceInput}
                  onChange={(e) => setPreferenceInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault()
                      addPreference()
                    }
                  }}
                  placeholder="e.g., Career Guidance, Interview Prep, Mentorship"
                />
                <Button type="button" onClick={addPreference} variant="secondary">
                  Add
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Alumni matching your preferences will be prioritized in your directory
              </p>
              {preferences.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {preferences.map((pref, index) => (
                    <Badge key={index} variant="default" className="gap-1">
                      {pref}
                      <button
                        type="button"
                        onClick={() => removePreference(pref)}
                        className="hover:bg-primary-foreground/20 rounded-full"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="linkedin_url">LinkedIn URL</Label>
              <Input
                id="linkedin_url"
                type="url"
                value={formData.linkedin_url}
                onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                placeholder="https://linkedin.com/in/username"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="github_url">GitHub URL</Label>
              <Input
                id="github_url"
                type="url"
                value={formData.github_url}
                onChange={(e) => setFormData({ ...formData, github_url: e.target.value })}
                placeholder="https://github.com/username"
              />
            </div>
          </div>

          {message && (
            <div
              className={`text-sm p-3 rounded ${message.type === "success" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}
            >
              {message.text}
            </div>
          )}

          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Saving..." : "Save Profile"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
