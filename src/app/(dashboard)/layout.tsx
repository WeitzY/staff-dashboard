import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { MainNavigation } from '@/components/navigation/main-navigation'
import { ThemeProvider } from '@/components/ui/theme-provider'
import { Toaster } from '@/components/ui/sonner'
import { MotionWrapper } from '@/components/ui/motion-wrapper'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  // Verify authentication
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/login')
  }

  // Get hotel staff profile for role-based access
  const { data: staffProfile, error: staffError } = await supabase
    .from('hotel_staff')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (staffError) {
    // Intentionally not exposing server errors to client logs
  }

  if (!staffProfile) {
    // If no profile is found, it's a genuine error or the user isn't in the staff table.
    // The RLS policy should prevent this for valid users.
    redirect('/login')
  }

  return (
    <ThemeProvider defaultTheme="dark" storageKey="velin-dashboard-theme">
      <div className="min-h-screen bg-background">
        {/* Header spans full width */}
        <MainNavigation />

        {/* Main content with modern spacing and layout */}
        <main className="px-6 py-8 lg:px-8 lg:py-12">
          <div className="mx-auto max-w-7xl">
            <MotionWrapper>
              {children}
            </MotionWrapper>
          </div>
        </main>

        {/* Toast notifications */}
        <Toaster />
      </div>
    </ThemeProvider>
  )
} 