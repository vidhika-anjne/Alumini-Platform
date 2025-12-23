"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, X, ExternalLink } from "lucide-react"
import { useRouter } from "next/navigation"

interface AlumniProfile {
  id: string
  profiles: {
    full_name: string
    email: string
  }
  enrollment_number: string
  graduation_year: number
  branch: string
  current_company: string
  current_position: string
  years_of_experience: number
  linkedin_url: string
  verification_status: string
}

export function AlumniVerificationList() {
  const [alumni, setAlumni] = useState<AlumniProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    fetchPendingAlumni()
  }, [])

  async function fetchPendingAlumni() {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("alumni_profiles")
      .select(
        `
        id,
        enrollment_number,
        graduation_year,
        branch,
        current_company,
        current_position,
        years_of_experience,
        linkedin_url,
        verification_status,
        profiles!alumni_profiles_id_fkey (
          full_name,
          email
        )
      `,
      )
      .eq("verification_status", "pending")
      .order("created_at", { ascending: false })

    if (!error && data) {
      console.log("Fetched pending alumni:", data)
      setAlumni(data as unknown as AlumniProfile[])
    } else {
      console.error("Error fetching alumni:", error)
    }
    setLoading(false)
  }

  async function handleVerification(alumniId: string, status: "approved" | "rejected") {
    setProcessingId(alumniId)
    const supabase = createClient()

    const { error } = await supabase
      .from("alumni_profiles")
      .update({
        verification_status: status,
        is_verified: status === "approved",
        verified_at: new Date().toISOString(),
      })
      .eq("id", alumniId)

    if (!error) {
      await fetchPendingAlumni()
      router.refresh()
    }
    setProcessingId(null)
  }

  if (loading) {
    return <div className="text-center py-8 text-muted-foreground">Loading pending verifications...</div>
  }

  if (alumni.length === 0) {
    return <div className="text-center py-8 text-muted-foreground">No pending verification requests</div>
  }

  return (
    <div className="space-y-4">
      {alumni.map((alumnus) => (
        <div key={alumnus.id} className="flex items-start justify-between border rounded-lg p-4 hover:bg-muted/50">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">{alumnus.profiles.full_name}</h3>
              <Badge variant="outline">{alumnus.verification_status}</Badge>
            </div>
            <p className="text-sm text-muted-foreground">{alumnus.profiles.email}</p>
            <div className="grid grid-cols-2 gap-2 text-sm mt-2">
              <div className="col-span-2 p-2 bg-primary/5 rounded border border-primary/20">
                <span className="font-medium text-primary">Enrollment Number:</span>{" "}
                <span className="font-mono font-bold">{alumnus.enrollment_number}</span>
              </div>
              <div>
                <span className="font-medium">Graduation Year:</span> {alumnus.graduation_year}
              </div>
              <div>
                <span className="font-medium">Branch:</span> {alumnus.branch}
              </div>
              <div>
                <span className="font-medium">Company:</span> {alumnus.current_company}
              </div>
              <div>
                <span className="font-medium">Position:</span> {alumnus.current_position}
              </div>
              <div>
                <span className="font-medium">Experience:</span> {alumnus.years_of_experience} years
              </div>
              {alumnus.linkedin_url && (
                <div>
                  <a
                    href={alumnus.linkedin_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline flex items-center gap-1"
                  >
                    LinkedIn <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
            </div>
          </div>
          <div className="flex gap-2 ml-4">
            <Button
              size="sm"
              variant="default"
              onClick={() => handleVerification(alumnus.id, "approved")}
              disabled={processingId === alumnus.id}
            >
              <Check className="h-4 w-4 mr-1" />
              Approve
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => handleVerification(alumnus.id, "rejected")}
              disabled={processingId === alumnus.id}
            >
              <X className="h-4 w-4 mr-1" />
              Reject
            </Button>
          </div>
        </div>
      ))}
    </div>
  )
}
