"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Briefcase, Calendar, ExternalLink, Search, Star, MessageCircle } from "lucide-react"
import { getOrCreateConversation } from "@/lib/supabase/chat"
import { useToast } from "@/hooks/use-toast"

interface AlumniProfile {
  id: string
  profiles: {
    full_name: string
    email: string
  }
  graduation_year: number
  branch: string
  current_company: string
  current_position: string
  years_of_experience: number
  bio: string
  skills: string[]
  expertise_areas: string[]
  linkedin_url: string
  matchScore?: number
}

interface AlumniDirectoryProps {
  studentPreferences?: string[]
}

export function AlumniDirectory({ studentPreferences = [] }: AlumniDirectoryProps) {
  const [alumni, setAlumni] = useState<AlumniProfile[]>([])
  const [filteredAlumni, setFilteredAlumni] = useState<AlumniProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [messagingUserId, setMessagingUserId] = useState<string | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    fetchAlumni()
  }, [])

  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredAlumni(alumni)
    } else {
      const filtered = alumni.filter(
        (alumnus) =>
          alumnus.profiles.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          alumnus.branch.toLowerCase().includes(searchTerm.toLowerCase()) ||
          alumnus.current_company.toLowerCase().includes(searchTerm.toLowerCase()) ||
          alumnus.current_position.toLowerCase().includes(searchTerm.toLowerCase()) ||
          alumnus.skills?.some((skill) => skill.toLowerCase().includes(searchTerm.toLowerCase())) ||
          alumnus.expertise_areas?.some((area) => area.toLowerCase().includes(searchTerm.toLowerCase())),
      )
      setFilteredAlumni(filtered)
    }
  }, [searchTerm, alumni])

  function calculateMatchScore(alumnus: AlumniProfile): number {
    if (!studentPreferences || studentPreferences.length === 0) return 0

    let score = 0
    const normalizedPrefs = studentPreferences.map((p) => p.toLowerCase())

    // Check expertise areas
    alumnus.expertise_areas?.forEach((area) => {
      if (normalizedPrefs.some((pref) => area.toLowerCase().includes(pref) || pref.includes(area.toLowerCase()))) {
        score += 3
      }
    })

    // Check skills
    alumnus.skills?.forEach((skill) => {
      if (normalizedPrefs.some((pref) => skill.toLowerCase().includes(pref) || pref.includes(skill.toLowerCase()))) {
        score += 2
      }
    })

    // Check position
    if (normalizedPrefs.some((pref) => alumnus.current_position.toLowerCase().includes(pref))) {
      score += 1
    }

    return score
  }

  async function fetchAlumni() {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("alumni_profiles")
      .select(
        `
        id,
        graduation_year,
        branch,
        current_company,
        current_position,
        years_of_experience,
        bio,
        skills,
        expertise_areas,
        linkedin_url,
        profiles!inner (
          full_name,
          email
        )
      `,
      )
      .eq("is_verified", true)
      .order("created_at", { ascending: false })

    if (error) {
      console.error('Error fetching alumni:', error)
    }

    if (!error && data) {
      console.log('Fetched alumni:', data)
      const alumniWithScores = (data as unknown as AlumniProfile[]).map((alumnus) => ({
        ...alumnus,
        matchScore: calculateMatchScore(alumnus),
      }))

      // Sort by match score (highest first), then by created date
      alumniWithScores.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0))

      setAlumni(alumniWithScores)
      setFilteredAlumni(alumniWithScores)
    }
    setLoading(false)
  }

  async function handleStartChat(alumniId: string) {
    try {
      setMessagingUserId(alumniId)
      const conversationId = await getOrCreateConversation(alumniId)
      router.push(`/dashboard/student/chat?conversation=${conversationId}`)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to start conversation",
        variant: "destructive",
      })
    } finally {
      setMessagingUserId(null)
    }
  }

  if (loading) {
    return <div className="text-center py-12 text-muted-foreground">Loading alumni...</div>
  }

  return (
    <div className="space-y-6">
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, company, skills, expertise..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {studentPreferences && studentPreferences.length > 0 && (
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
          <p className="text-sm font-medium mb-2">Matching your preferences:</p>
          <div className="flex flex-wrap gap-2">
            {studentPreferences.map((pref, index) => (
              <Badge key={index} variant="default">
                {pref}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {filteredAlumni.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          {searchTerm ? "No alumni found matching your search" : "No verified alumni yet"}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredAlumni.map((alumnus) => (
            <Card key={alumnus.id} className="hover:shadow-lg transition-shadow relative">
              {alumnus.matchScore && alumnus.matchScore > 0 && (
                <div className="absolute top-3 right-3">
                  <Badge variant="default" className="gap-1">
                    <Star className="h-3 w-3 fill-current" />
                    Match
                  </Badge>
                </div>
              )}
              <CardHeader>
                <div className="space-y-2">
                  <h3 className="font-bold text-lg">{alumnus.profiles.full_name}</h3>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Briefcase className="h-4 w-4" />
                    <span>{alumnus.current_position}</span>
                  </div>
                  <p className="font-medium text-sm">{alumnus.current_company}</p>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>
                      Class of {alumnus.graduation_year} • {alumnus.branch}
                    </span>
                  </div>
                  <p className="text-muted-foreground">{alumnus.years_of_experience} years experience</p>
                </div>

                {alumnus.bio && <p className="text-sm text-muted-foreground line-clamp-2">{alumnus.bio}</p>}

                {alumnus.expertise_areas && alumnus.expertise_areas.length > 0 && (
                  <div>
                    <p className="text-xs font-medium mb-2 text-muted-foreground">Expertise:</p>
                    <div className="flex flex-wrap gap-2">
                      {alumnus.expertise_areas.slice(0, 3).map((area, index) => (
                        <Badge key={index} variant="default" className="text-xs">
                          {area}
                        </Badge>
                      ))}
                      {alumnus.expertise_areas.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{alumnus.expertise_areas.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {alumnus.skills && alumnus.skills.length > 0 && (
                  <div>
                    <p className="text-xs font-medium mb-2 text-muted-foreground">Skills:</p>
                    <div className="flex flex-wrap gap-2">
                      {alumnus.skills.slice(0, 3).map((skill, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {alumnus.skills.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{alumnus.skills.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {alumnus.linkedin_url && (
                  <Button variant="outline" size="sm" className="w-full bg-transparent" asChild>
                    <a href={alumnus.linkedin_url} target="_blank" rel="noopener noreferrer">
                      View LinkedIn
                      <ExternalLink className="h-3 w-3 ml-2" />
                    </a>
                  </Button>
                )}

                <Button
                  variant="default"
                  size="sm"
                  className="w-full"
                  onClick={() => handleStartChat(alumnus.id)}
                  disabled={messagingUserId === alumnus.id}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  {messagingUserId === alumnus.id ? "Starting..." : "Message"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
