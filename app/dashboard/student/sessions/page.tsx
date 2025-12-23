import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardNav } from "@/components/dashboard/dashboard-nav"
import { StudentSessionsList } from "@/components/student/student-sessions-list"

export default async function StudentSessionsPage() {
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

  return (
    <div className="flex min-h-screen flex-col bg-muted/40">
      <DashboardNav role="student" userName={profile.role} />

      <main className="flex-1 p-6 md:p-10">
        <div className="mx-auto max-w-7xl space-y-8">
          <div>
            <h1 className="text-3xl font-bold">Available Sessions</h1>
            <p className="text-muted-foreground mt-2">Browse and register for sessions hosted by alumni</p>
          </div>

          <StudentSessionsList userId={user.id} />
        </div>
      </main>
    </div>
  )
}
