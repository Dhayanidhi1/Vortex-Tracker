import { Linkedin, Github, User, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"

// Custom Vortex Tracker Icon Component
const VortexIcon = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
    <path d="M12 2v4" />
    <path d="M12 18v4" />
    <path d="M2 12h4" />
    <path d="M18 12h4" />
    <path d="M4.93 4.93l2.83 2.83" />
    <path d="M16.24 16.24l2.83 2.83" />
    <path d="M19.07 4.93l-2.83 2.83" />
    <path d="M7.76 16.24l-2.83 2.83" />
  </svg>
)

export default function InfoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        {/* Back to Home Button */}
        <div className="mb-8">
          <Link href="/">
            <Button variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </Link>
        </div>

        {/* Main Info Card */}
        <div className="max-w-2xl mx-auto">
          <Card className="border-primary/20 bg-card/80 backdrop-blur">
            <CardHeader className="text-center pb-6">
              <div className="flex justify-center mb-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-cyan-400">
                  <VortexIcon className="h-8 w-8 text-white" />
                </div>
              </div>
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-transparent">
                Vortex Tracker
              </CardTitle>
              <CardDescription className="text-lg">
                Advanced LinkedIn Post Monitoring & Analytics
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-8">
              {/* About Section */}
              <div className="text-center space-y-4">
                <h2 className="text-xl font-semibold">About This Project</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Vortex Tracker is a powerful LinkedIn post monitoring tool that helps you track mentions, 
                  analyze engagement, and discover valuable insights from LinkedIn content. Built with modern 
                  web technologies and real-time scraping capabilities.
                </p>
              </div>

              {/* Developer Info */}
              <div className="border-t pt-8">
                <div className="text-center space-y-6">
                  <div className="flex justify-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                      <User className="h-6 w-6 text-muted-foreground" />
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-2xl font-bold">Dhayanidhi R</h3>
                    <p className="text-muted-foreground">Full Stack Developer</p>
                  </div>

                  {/* Social Links */}
                  <div className="flex justify-center gap-4">
                    <Link 
                      href="https://www.linkedin.com/in/dhayanidhi-r-4200b5286/" 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      <Button variant="outline" className="gap-2 hover:bg-blue-50 hover:border-blue-200 dark:hover:bg-blue-950">
                        <Linkedin className="h-4 w-4 text-blue-600" />
                        LinkedIn Profile
                      </Button>
                    </Link>
                    
                    <Link 
                      href="https://github.com/Dhayanidhi1" 
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      <Button variant="outline" className="gap-2 hover:bg-gray-50 hover:border-gray-200 dark:hover:bg-gray-950">
                        <Github className="h-4 w-4" />
                        GitHub Profile
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Features Section */}
              <div className="border-t pt-8">
                <h3 className="text-xl font-semibold text-center mb-6">Key Features</h3>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <h4 className="font-medium">🚀 Real-time Scraping</h4>
                    <p className="text-sm text-muted-foreground">
                      Live post extraction with instant dashboard updates
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">📊 Advanced Analytics</h4>
                    <p className="text-sm text-muted-foreground">
                      Comprehensive charts and engagement metrics
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">🔍 Smart Filtering</h4>
                    <p className="text-sm text-muted-foreground">
                      Filter by keywords, authors, dates, and post types
                    </p>
                  </div>
                  <div className="space-y-2">
                    <h4 className="font-medium">⚡ Lightning Fast</h4>
                    <p className="text-sm text-muted-foreground">
                      Optimized performance with background processing
                    </p>
                  </div>
                </div>
              </div>

              {/* Tech Stack */}
              <div className="border-t pt-8">
                <h3 className="text-xl font-semibold text-center mb-4">Built With</h3>
                <div className="flex flex-wrap justify-center gap-2">
                  {[
                    "Next.js", "React", "TypeScript", "Tailwind CSS", 
                    "Python", "Playwright", "SQLite", "Node.js"
                  ].map((tech) => (
                    <span 
                      key={tech}
                      className="px-3 py-1 bg-muted rounded-full text-sm font-medium"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}