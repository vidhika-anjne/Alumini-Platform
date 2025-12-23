import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardNav } from "@/components/dashboard/dashboard-nav"
import { AlumniSessionsManager } from "@/components/alumni/alumni-sessions-manager"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export default async function AlumniSessionsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (!profile || profile.role !== "alumni") {
    redirect(`/dashboard/${profile?.role || "student"}`)
  }

  const { data: alumniProfile } = await supabase
    .from("alumni_profiles")
    .select("is_verified")
    .eq("id", user.id)
    .single()

  return (
    <div className="flex min-h-screen flex-col bg-muted/40">
      <DashboardNav role="alumni" userName={profile.role} />

      <main className="flex-1 p-6 md:p-10">
        <div className="mx-auto max-w-7xl space-y-8">
          <div>
            <h1 className="text-3xl font-bold">My Sessions</h1>
            <p className="text-muted-foreground mt-2">Create and manage your mentorship sessions</p>
          </div>

          {!alumniProfile?.is_verified && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Verification Required</AlertTitle>
              <AlertDescription>
                Your profile needs to be verified by an admin before you can create sessions. Please complete your
                profile and wait for admin approval.
              </AlertDescription>
            </Alert>
          )}

          <AlumniSessionsManager userId={user.id} isVerified={alumniProfile?.is_verified || false} />
        </div>
      </main>
    </div>
  )
}
