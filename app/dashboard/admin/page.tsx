import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, UserCheck, GraduationCap, Calendar } from "lucide-react"
import { AlumniVerificationList } from "@/components/admin/alumni-verification-list"
import { DashboardNav } from "@/components/dashboard/dashboard-nav"

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (!profile || profile.role !== "admin") {
    redirect("/dashboard/student")
  }

  // Get statistics
  const { count: studentsCount } = await supabase.from("student_profiles").select("*", { count: "exact", head: true })

  const { count: alumniCount } = await supabase
    .from("alumni_profiles")
    .select("*", { count: "exact", head: true })
    .eq("is_verified", true)

  const { count: pendingCount } = await supabase
    .from("alumni_profiles")
    .select("*", { count: "exact", head: true })
    .eq("verification_status", "pending")

  const { count: sessionsCount } = await supabase.from("sessions").select("*", { count: "exact", head: true })

  return (
    <div className="flex min-h-screen flex-col bg-muted/40">
      <DashboardNav role="admin" userName={profile?.role || "Admin"} />

      <main className="flex-1 p-6 md:p-10">
        <div className="mx-auto max-w-7xl space-y-8">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-2">Manage alumni verification and platform overview</p>
          </div>

          {/* Statistics Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Students</CardTitle>
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{studentsCount || 0}</div>
                <p className="text-xs text-muted-foreground">Registered students</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Verified Alumni</CardTitle>
                <UserCheck className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{alumniCount || 0}</div>
                <p className="text-xs text-muted-foreground">Active alumni</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Verification</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pendingCount || 0}</div>
                <p className="text-xs text-muted-foreground">Awaiting approval</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{sessionsCount || 0}</div>
                <p className="text-xs text-muted-foreground">Scheduled sessions</p>
              </CardContent>
            </Card>
          </div>

          {/* Alumni Verification Section */}
          <Card>
            <CardHeader>
              <CardTitle>Alumni Verification Requests</CardTitle>
              <CardDescription>Review and approve alumni profiles</CardDescription>
            </CardHeader>
            <CardContent>
              <AlumniVerificationList />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
