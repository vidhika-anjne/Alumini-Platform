import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardNav } from "@/components/dashboard/dashboard-nav"
import { AlumniProfileForm } from "@/components/alumni/alumni-profile-form"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle } from "lucide-react"

export default async function AlumniDashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (!profile || profile.role !== "alumni") {
    redirect(`/dashboard/${profile?.role || "student"}`)
  }

  const { data: alumniProfile } = await supabase.from("alumni_profiles").select("*").eq("id", user.id).single()

  return (
    <div className="flex min-h-screen flex-col bg-muted/40">
      <DashboardNav role="alumni" userName={profile.full_name || "Alumni"} />

      <main className="flex-1 p-6 md:p-10">
        <div className="mx-auto max-w-4xl space-y-8">
          <div>
            <h1 className="text-3xl font-bold">My Profile</h1>
            <p className="text-muted-foreground mt-2">Manage your alumni profile information</p>
          </div>

          {alumniProfile && alumniProfile.verification_status === "pending" && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Verification Pending</AlertTitle>
              <AlertDescription>
                Your profile is under review by the admin. You&apos;ll be notified once it&apos;s verified.
              </AlertDescription>
            </Alert>
          )}

          {alumniProfile && alumniProfile.verification_status === "approved" && alumniProfile.is_verified && (
            <Alert className="border-green-200 bg-green-50 text-green-900">
              <CheckCircle className="h-4 w-4" />
              <AlertTitle>Profile Verified</AlertTitle>
              <AlertDescription>
                Your profile has been verified! Students can now see your profile and register for your sessions.
              </AlertDescription>
            </Alert>
          )}

          {alumniProfile && alumniProfile.verification_status === "rejected" && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Verification Rejected</AlertTitle>
              <AlertDescription>
                Your profile verification was rejected. Please update your information and resubmit.
              </AlertDescription>
            </Alert>
          )}

          <AlumniProfileForm initialData={alumniProfile} userId={user.id} />
        </div>
      </main>
    </div>
  )
}
