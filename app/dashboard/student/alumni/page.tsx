import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardNav } from "@/components/dashboard/dashboard-nav"
import { AlumniDirectory } from "@/components/student/alumni-directory"

export default async function AlumniDirectoryPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (!profile || profile.role !== "student") {
    redirect(`/dashboard/${profile?.role || "admin"}`)
  }

  const { data: studentProfile } = await supabase
    .from("student_profiles")
    .select("preferences")
    .eq("id", user.id)
    .single()

  return (
    <div className="flex min-h-screen flex-col bg-muted/40">
      <DashboardNav role="student" userName={profile.role} />

      <main className="flex-1 p-6 md:p-10">
        <div className="mx-auto max-w-7xl space-y-8">
          <div>
            <h1 className="text-3xl font-bold">Alumni Directory</h1>
            <p className="text-muted-foreground mt-2">Connect with verified alumni from your college</p>
          </div>

          <AlumniDirectory studentPreferences={studentProfile?.preferences || []} />
        </div>
      </main>
    </div>
  )
}
