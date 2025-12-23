import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardNav } from "@/components/dashboard/dashboard-nav"
import { StudentProfileForm } from "@/components/student/student-profile-form"

export default async function StudentDashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (!profile || profile.role !== "student") {
    redirect(`/dashboard/${profile?.role || "admin"}`)
  }

  const { data: studentProfile } = await supabase.from("student_profiles").select("*").eq("id", user.id).single()

  return (
    <div className="flex min-h-screen flex-col bg-muted/40">
      <DashboardNav role="student" userName={profile.full_name || "Student"} />

      <main className="flex-1 p-6 md:p-10">
        <div className="mx-auto max-w-4xl space-y-8">
          <div>
            <h1 className="text-3xl font-bold">My Profile</h1>
            <p className="text-muted-foreground mt-2">Manage your student profile information</p>
          </div>

          <StudentProfileForm initialData={studentProfile} userId={user.id} />
        </div>
      </main>
    </div>
  )
}
