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

interface AlumniProfileData {
  enrollment_number?: string
  graduation_year?: number
  branch?: string
  current_company?: string
  current_position?: string
  years_of_experience?: number
  phone?: string
  bio?: string
  skills?: string[]
  expertise_areas?: string[]
  linkedin_url?: string
  github_url?: string
  verification_status?: string
}

interface AlumniProfileFormProps {
  initialData: AlumniProfileData | null
  userId: string
}

export function AlumniProfileForm({ initialData, userId }: AlumniProfileFormProps) {
  const [formData, setFormData] = useState({
    enrollment_number: initialData?.enrollment_number || "",
    graduation_year: initialData?.graduation_year || new Date().getFullYear(),
    branch: initialData?.branch || "",
    current_company: initialData?.current_company || "",
    current_position: initialData?.current_position || "",
    years_of_experience: initialData?.years_of_experience || 0,
    phone: initialData?.phone || "",
    bio: initialData?.bio || "",
    skills: initialData?.skills?.join(", ") || "",
    expertise_areas: initialData?.expertise_areas?.join(", ") || "",
    linkedin_url: initialData?.linkedin_url || "",
    github_url: initialData?.github_url || "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    const supabase = createClient()

    const profileData = {
      id: userId,
      enrollment_number: formData.enrollment_number,
      graduation_year: formData.graduation_year,
      branch: formData.branch,
      current_company: formData.current_company,
      current_position: formData.current_position,
      years_of_experience: formData.years_of_experience,
      phone: formData.phone,
      bio: formData.bio,
      skills: formData.skills
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean),
      expertise_areas: formData.expertise_areas
        .split(",")
        .map((e) => e.trim())
        .filter(Boolean),
      linkedin_url: formData.linkedin_url || null,
      github_url: formData.github_url || null,
      verification_status: initialData ? initialData.verification_status : "pending",
    }

    const { error } = initialData
      ? await supabase.from("alumni_profiles").update(profileData).eq("id", userId)
      : await supabase.from("alumni_profiles").insert(profileData)

    if (error) {
      console.error("Error saving alumni profile:", error)
      setMessage({ type: "error", text: error.message })
    } else {
      console.log("Profile saved successfully with status:", profileData.verification_status)
      setMessage({ type: "success", text: "Profile saved successfully!" })
      router.refresh()
    }

    setIsLoading(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
        <CardDescription>Complete your profile to help students connect with you</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="enrollment_number">
                Enrollment Number <span className="text-destructive">*</span>
              </Label>
              <Input
                id="enrollment_number"
                value={formData.enrollment_number}
                onChange={(e) => setFormData({ ...formData, enrollment_number: e.target.value })}
                placeholder="e.g., 2020CS001"
                required
              />
              <p className="text-xs text-muted-foreground">Your college enrollment number for verification</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="graduation_year">Graduation Year</Label>
              <Input
                id="graduation_year"
                type="number"
                min="1950"
                max={new Date().getFullYear()}
                value={formData.graduation_year}
                onChange={(e) => setFormData({ ...formData, graduation_year: Number.parseInt(e.target.value) })}
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
              <Label htmlFor="current_company">Current Company</Label>
              <Input
                id="current_company"
                value={formData.current_company}
                onChange={(e) => setFormData({ ...formData, current_company: e.target.value })}
                placeholder="e.g., Google"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="current_position">Current Position</Label>
              <Input
                id="current_position"
                value={formData.current_position}
                onChange={(e) => setFormData({ ...formData, current_position: e.target.value })}
                placeholder="e.g., Software Engineer"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="years_of_experience">Years of Experience</Label>
              <Input
                id="years_of_experience"
                type="number"
                min="0"
                value={formData.years_of_experience}
                onChange={(e) => setFormData({ ...formData, years_of_experience: Number.parseInt(e.target.value) })}
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
              placeholder="Tell students about your journey..."
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
              <Label htmlFor="expertise_areas">Expertise Areas (comma separated)</Label>
              <Input
                id="expertise_areas"
                value={formData.expertise_areas}
                onChange={(e) => setFormData({ ...formData, expertise_areas: e.target.value })}
                placeholder="Web Dev, Cloud, DevOps"
              />
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
