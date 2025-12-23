import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { GraduationCap, Users, Calendar, Award, ArrowRight } from "lucide-react"
import Link from "next/link"

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-6 md:px-10">
          <Link href="/" className="flex items-center gap-2">
            <GraduationCap className="h-6 w-6" />
            <span className="font-bold text-lg">Alumni Platform</span>
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/auth/login">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link href="/auth/register">
              <Button>Get Started</Button>
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 to-indigo-100 py-20 md:py-32">
        <div className="container px-6 md:px-10">
          <div className="mx-auto max-w-4xl text-center space-y-8">
            <h1 className="text-4xl md:text-6xl font-bold text-balance leading-tight">
              Connect Students with
              <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                {" "}
                Industry Professionals
              </span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground text-balance max-w-2xl mx-auto">
              Bridge the gap between education and industry. Our platform connects current students with verified alumni
              for mentorship, career guidance, and professional development.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/register">
                <Button size="lg" className="w-full sm:w-auto">
                  Join as Student
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/auth/register">
                <Button size="lg" variant="outline" className="w-full sm:w-auto bg-transparent">
                  Register as Alumni
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 md:py-32 bg-background">
        <div className="container px-6 md:px-10">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl md:text-4xl font-bold">How It Works</h2>
            <p className="text-lg text-muted-foreground text-balance max-w-2xl mx-auto">
              A simple, three-step process to connect students with experienced professionals
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3 max-w-6xl mx-auto">
            <Card className="border-2 hover:border-primary transition-colors">
              <CardContent className="pt-6 space-y-4">
                <div className="h-12 w-12 rounded-lg bg-blue-100 flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold">Register & Create Profile</h3>
                <p className="text-muted-foreground">
                  Students and alumni create detailed profiles showcasing their skills, interests, and expertise areas.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary transition-colors">
              <CardContent className="pt-6 space-y-4">
                <div className="h-12 w-12 rounded-lg bg-indigo-100 flex items-center justify-center">
                  <Award className="h-6 w-6 text-indigo-600" />
                </div>
                <h3 className="text-xl font-bold">Admin Verification</h3>
                <p className="text-muted-foreground">
                  Alumni profiles are verified by administrators to ensure authenticity and quality of mentorship.
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 hover:border-primary transition-colors">
              <CardContent className="pt-6 space-y-4">
                <div className="h-12 w-12 rounded-lg bg-purple-100 flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold">Schedule Sessions</h3>
                <p className="text-muted-foreground">
                  Verified alumni create mentorship sessions that students can browse and register for.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 md:py-32 bg-muted/40">
        <div className="container px-6 md:px-10">
          <div className="grid gap-12 md:grid-cols-2 max-w-6xl mx-auto items-center">
            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold text-balance">For Students</h2>
              <ul className="space-y-4">
                <li className="flex gap-3">
                  <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="h-2 w-2 rounded-full bg-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Learn from Experience</h4>
                    <p className="text-sm text-muted-foreground">
                      Get real-world insights from professionals working in your desired field
                    </p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="h-2 w-2 rounded-full bg-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Career Guidance</h4>
                    <p className="text-sm text-muted-foreground">
                      Receive personalized advice on career paths, skills, and industry trends
                    </p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="h-2 w-2 rounded-full bg-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Build Network</h4>
                    <p className="text-sm text-muted-foreground">
                      Connect with alumni working at top companies and expand your professional network
                    </p>
                  </div>
                </li>
              </ul>
            </div>

            <div className="space-y-6">
              <h2 className="text-3xl md:text-4xl font-bold text-balance">For Alumni</h2>
              <ul className="space-y-4">
                <li className="flex gap-3">
                  <div className="h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="h-2 w-2 rounded-full bg-indigo-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Give Back</h4>
                    <p className="text-sm text-muted-foreground">
                      Share your knowledge and help the next generation of professionals
                    </p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <div className="h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="h-2 w-2 rounded-full bg-indigo-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Stay Connected</h4>
                    <p className="text-sm text-muted-foreground">
                      Maintain ties with your alma mater and contribute to its growth
                    </p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <div className="h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <div className="h-2 w-2 rounded-full bg-indigo-600" />
                  </div>
                  <div>
                    <h4 className="font-semibold">Flexible Sessions</h4>
                    <p className="text-sm text-muted-foreground">
                      Create sessions on your schedule for mentorship, technical discussions, or career advice
                    </p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32 bg-gradient-to-br from-blue-600 to-indigo-600 text-white">
        <div className="container px-6 md:px-10">
          <div className="mx-auto max-w-3xl text-center space-y-8">
            <h2 className="text-3xl md:text-5xl font-bold text-balance">Ready to Get Started?</h2>
            <p className="text-lg md:text-xl text-blue-100 text-balance">
              Join thousands of students and alumni already connected through our platform
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/register">
                <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                  Create Account
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto bg-transparent text-white border-white hover:bg-white/10"
                >
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/40 py-12">
        <div className="container px-6 md:px-10">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              <span className="font-semibold">Alumni Platform</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Built for technical colleges to connect students with alumni professionals
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
