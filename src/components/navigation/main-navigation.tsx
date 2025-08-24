'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { LogOut, Menu } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle } from '@/components/ui/sheet'

const sections = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    paths: ['/dashboard']
  },
  {
    id: 'configuration',
    label: 'Configuration',
    paths: ['/configuration']
  },
  {
    id: 'settings',
    label: 'Settings',
    paths: ['/settings']
  }
]

export function MainNavigation() {
  const pathname = usePathname()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const getCurrentSection = () => {
    return sections.find(section =>
      section.paths.some(path => pathname.startsWith(path))
    )?.id || 'dashboard'
  }

  const handleLogout = async () => {
    setIsLoading(true)
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      toast.success('Goodbye! You have been logged out safely')
      router.push('/login')
      router.refresh()
    } catch (error) {
      toast.error('Failed to log out - please try again')
      console.error('Logout error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const currentSection = getCurrentSection()

  return (
    <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
      <div className="grid grid-cols-[1fr_auto_1fr] h-24 items-center px-6 lg:px-8">
        {/* Left side - Mobile Menu Button */}
        <div className="flex md:hidden justify-start">
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="md:hidden h-10 w-10 rounded-2xl p-0 hover:bg-accent/70 transition-all duration-200 focus:outline-none"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-6">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
              </SheetHeader>
              <nav className="space-y-4 mt-6">
                {sections.map((section) => {
                  const isActive = currentSection === section.id

                  return (
                    <Link
                      key={section.id}
                      href={section.paths[0] || '/dashboard'}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 focus:outline-none w-full",
                        isActive
                          ? "text-primary bg-primary/10 shadow-sm font-semibold"
                          : "text-muted-foreground hover:text-foreground hover:bg-accent/50 font-medium"
                      )}
                    >
                      {section.label}
                    </Link>
                  )
                })}
              </nav>
            </SheetContent>
          </Sheet>
        </div>

        {/* Left spacer (desktop only, invisible but same width as right controls) */}
        <div className="hidden md:flex justify-start">
          <div className="flex items-center gap-3 invisible">
            <ThemeToggle />
            <Button className="h-10 w-10" />
          </div>
        </div>

        {/* Centered Main Navigation - Desktop */}
        <nav className="hidden md:flex justify-self-center items-center space-x-8">
          {sections.map((section) => {
            const isActive = currentSection === section.id

            return (
              <Link
                key={section.id}
                href={section.paths[0] || '/dashboard'}
                className={cn(
                  "relative px-6 py-3 text-sm rounded-2xl transition-colors duration-200 focus:outline-none min-w-0 flex-shrink-0",
                  isActive
                    ? "text-primary bg-primary/10 shadow-sm font-semibold"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50 font-medium"
                )}
              >
                <span className="relative z-10 whitespace-nowrap">{section.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Right side - Theme Toggle and Logout Button */}
        <div className="w-full md:w-auto flex justify-end items-center space-x-3">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            disabled={isLoading}
            className="h-10 w-10 rounded-2xl p-0 hover:bg-accent/70 transition-all duration-200 focus:outline-none"
            title="Logout"
          >
            {isLoading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
            ) : (
              <LogOut className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>
    </header>
  )
}