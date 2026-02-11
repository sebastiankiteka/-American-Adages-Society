'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect, useRef } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import DarkModeToggle from './DarkModeToggle'

function NotificationBadge() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    // Only run on client
    if (typeof window === 'undefined') return

    const fetchCounts = async () => {
      try {
        const response = await fetch('/api/users/notifications/counts')
        const result = await response.json()
        if (result.success && result.data) {
          const total = (result.data.notifications || 0) + (result.data.messages || 0) + (result.data.friendRequests || 0)
          setCount(total)
        }
      } catch (err) {
        console.error('Failed to fetch notification counts:', err)
      }
    }

    fetchCounts()
    const interval = setInterval(fetchCounts, 30000)
    return () => clearInterval(interval)
  }, [])

  // Always render same structure - return null on server and client initially
  // Badge will appear after useEffect runs on client
  if (count === 0) {
    return null
  }

  return (
    <span className="absolute top-0 right-0 bg-accent-primary text-text-inverse text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
      {count > 99 ? '99+' : count}
    </span>
  )
}

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [transparencyOpen, setTransparencyOpen] = useState(false)
  const [exploreOpen, setExploreOpen] = useState(false)
  const [aboutOpen, setAboutOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [SearchModal, setSearchModal] = useState<React.ComponentType<{ isOpen: boolean; onClose: () => void }> | null>(null)
  const { data: session, status } = useSession()
  const pathname = usePathname()

  // Ensure consistent server/client render - only show session-dependent UI after mount
  useEffect(() => {
    setMounted(true)
    // Lazy load SearchModal only on client
    if (typeof window !== 'undefined') {
      import('./SearchModal').then((mod) => {
        setSearchModal(() => mod.default)
      })
    }
  }, [])
  
  const exploreRef = useRef<HTMLDivElement>(null)
  const aboutRef = useRef<HTMLDivElement>(null)
  const transparencyRef = useRef<HTMLDivElement>(null)

  // Close mobile menu on route change
  useEffect(() => {
    setIsOpen(false)
    setExploreOpen(false)
    setAboutOpen(false)
    setTransparencyOpen(false)
  }, [pathname])

  // Prevent body scroll when mobile menu is open - only run on client
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    if (isOpen) {
      const originalOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'
      return () => {
        document.body.style.overflow = originalOverflow || 'unset'
      }
    }
  }, [isOpen])

  // Close dropdowns on Escape key - only run on client
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setExploreOpen(false)
        setAboutOpen(false)
        setTransparencyOpen(false)
        setSearchOpen(false)
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('keydown', handleEscape)
    }
  }, [])

  // Click outside handler - only run on client
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node
      if (exploreRef.current && !exploreRef.current.contains(target)) {
        setExploreOpen(false)
      }
      if (aboutRef.current && !aboutRef.current.contains(target)) {
        setAboutOpen(false)
      }
      if (transparencyRef.current && !transparencyRef.current.contains(target)) {
        setTransparencyOpen(false)
      }
    }

    // Listen to both mouse and touch events for better mobile support
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('touchstart', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
    }
  }, [])

  const exploreLinks = [
    { href: '/archive', label: 'Archive' },
    { href: '/idioms', label: 'Idioms' },
    { href: '/blog', label: 'Blog' },
    { href: '/forum', label: 'Forum' },
    { href: '/events', label: 'Events' },
    { href: '/citations', label: 'Citations' },
  ]

  const aboutLinks = [
    { href: '/about', label: 'About Us' },
    { href: '/agenda', label: 'Agenda & Growth' },
    { href: '/get-involved', label: 'Get Involved' },
  ]

  const transparencySubsections = [
    { href: '/transparency', label: 'Overview' },
    { href: '/transparency#documents', label: 'Documents' },
    { href: '/transparency#rules', label: 'Rules' },
    { href: '/transparency#updates', label: 'Website Updates' },
    { href: '/transparency/sponsors', label: 'Sponsors' },
    { href: '/transparency/elections', label: 'Elections' },
    { href: '/transparency/votes', label: 'Votes' },
    { href: '/transparency/budget', label: 'Budget' },
  ]

  return (
    <nav className="bg-nav-bg text-text-inverse sticky top-0 z-50 shadow-lg relative border-b-2 border-accent-primary/20">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(245,241,232,0.15) 2px, rgba(245,241,232,0.15) 4px)',
        }}></div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-bronze to-transparent opacity-30"></div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-18 md:h-20">
            <Link href="/" className="text-xl md:text-2xl font-bold font-serif hover:text-accent-primary transition-colors flex items-center gap-2 md:gap-3 group">
            <div className="relative flex-shrink-0">
              <Image 
                src="/Favicon Logo AAS.jpeg" 
                alt="AAS Logo" 
                width={56}
                height={56}
                className="h-10 w-10 md:h-14 md:w-14 object-contain drop-shadow-lg group-hover:scale-110 transition-transform bg-text-inverse/10 rounded-lg p-1"
                style={{ minWidth: '40px', minHeight: '40px' }}
                priority
              />
              <div className="absolute inset-0 bg-accent-primary/20 rounded-lg blur-sm opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
            <span className="hidden sm:inline text-base md:text-xl">American Adages Society</span>
            <span className="sm:hidden text-base">AAS</span>
          </Link>

          <div className="hidden lg:flex items-center gap-6">
            <Link
              href="/"
              className="hover:text-accent-primary transition-colors text-sm font-semibold"
            >
              Home
            </Link>

            <div className="h-6 w-px bg-text-inverse/20"></div>

            <div 
              ref={exploreRef}
              className="relative"
            >
              <button 
                type="button"
                onClick={() => setExploreOpen(!exploreOpen)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    setExploreOpen(!exploreOpen)
                  }
                }}
                aria-expanded={exploreOpen}
                aria-haspopup="true"
                aria-label="Explore menu"
                className="hover:text-accent-primary transition-colors text-sm font-semibold flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-offset-2 focus:ring-offset-nav-bg rounded"
              >
                Explore
                <svg className={`w-4 h-4 transition-transform ${exploreOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {exploreOpen && (
                <div 
                  className="absolute top-full left-0 mt-2 w-48 bg-card-bg rounded-lg shadow-xl border border-accent-primary/20 z-50"
                  role="menu"
                  aria-label="Explore menu"
                >
                  <div className="p-2">
                    {exploreLinks.map((link, index) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setExploreOpen(false)}
                        role="menuitem"
                        className="block px-4 py-2 text-sm text-text-primary hover:bg-accent-primary/20 hover:text-accent-primary rounded transition-colors focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-inset"
                        tabIndex={0}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="h-6 w-px bg-text-inverse/20"></div>

            <div 
              ref={aboutRef}
              className="relative"
            >
              <button 
                type="button"
                onClick={() => setAboutOpen(!aboutOpen)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    setAboutOpen(!aboutOpen)
                  }
                }}
                aria-expanded={aboutOpen}
                aria-haspopup="true"
                aria-label="About menu"
                className="hover:text-accent-primary transition-colors text-sm font-semibold flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-offset-2 focus:ring-offset-nav-bg rounded"
              >
                About
                <svg className={`w-4 h-4 transition-transform ${aboutOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {aboutOpen && (
                <div 
                  className="absolute top-full left-0 mt-2 w-56 bg-card-bg rounded-lg shadow-xl border border-accent-primary/20 z-50"
                  role="menu"
                  aria-label="About menu"
                >
                  <div className="p-2">
                    {aboutLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setAboutOpen(false)}
                        role="menuitem"
                        className="block px-4 py-2 text-sm text-text-primary hover:bg-accent-primary/20 hover:text-accent-primary rounded transition-colors focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-inset"
                        tabIndex={0}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div 
              ref={transparencyRef}
              className="relative"
            >
              <button 
                type="button"
                onClick={() => setTransparencyOpen(!transparencyOpen)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    setTransparencyOpen(!transparencyOpen)
                  }
                }}
                aria-expanded={transparencyOpen}
                aria-haspopup="true"
                aria-label="Transparency menu"
                className="hover:text-accent-primary transition-colors text-sm font-semibold flex items-center gap-1 focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-offset-2 focus:ring-offset-nav-bg rounded"
              >
                Transparency
                <svg className={`w-4 h-4 transition-transform ${transparencyOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {transparencyOpen && (
                <div 
                  className="absolute top-full left-0 mt-2 w-56 bg-card-bg rounded-lg shadow-xl border border-accent-primary/20 z-50"
                  role="menu"
                  aria-label="Transparency menu"
                >
                  <div className="p-2">
                    {transparencySubsections.map((subsection) => (
                      <Link
                        key={subsection.href}
                        href={subsection.href}
                        onClick={() => setTransparencyOpen(false)}
                        role="menuitem"
                        className="block px-4 py-2 text-sm text-text-primary hover:bg-accent-primary/20 hover:text-accent-primary rounded transition-colors focus:outline-none focus:ring-2 focus:ring-accent-primary focus:ring-inset"
                        tabIndex={0}
                      >
                        {subsection.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Link
              href="/contact"
              className="hover:text-accent-primary transition-colors text-sm font-medium"
            >
              Contact
            </Link>

            <a
              href="https://utexas.campuslabs.com/engage/organization/americanadagessociety"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-accent-primary transition-colors text-xs font-medium flex items-center gap-1"
            >
              HornsLink
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>

            <div className="h-6 w-px bg-text-inverse/20"></div>
            
            <DarkModeToggle />
            
            {/* Always render same structure - server and client must match */}
            {!mounted || status === 'loading' ? (
              <div className="w-20 h-6"></div>
            ) : session ? (
              <div className="flex items-center gap-3">
                <Link
                  href="/profile"
                  className="hover:text-accent-primary transition-colors text-sm font-medium"
                >
                  Account
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="px-3 py-1 bg-accent-primary/20 text-text-inverse rounded-lg hover:bg-accent-primary/30 transition-colors text-sm"
                >
                  Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  href="/login"
                  className="hover:text-accent-primary transition-colors text-sm font-medium"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="px-3 py-1 bg-accent-primary/20 text-text-inverse rounded-lg hover:bg-accent-primary/30 transition-colors text-sm"
                >
                  Register
                </Link>
              </div>
            )}

            <button
              onClick={() => setSearchOpen(true)}
              className="hover:text-accent-primary transition-colors text-sm font-medium p-2"
              aria-label="Search"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            {/* Always render same structure - server and client must match */}
            {mounted && status === 'authenticated' && session && (
              <Link
                href="/profile/inbox"
                className="hover:text-accent-primary transition-colors text-sm font-medium p-2 relative inline-block"
                aria-label="Notifications"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <NotificationBadge />
              </Link>
            )}
          </div>

          <div className="hidden md:flex lg:hidden items-center gap-3">
            <Link
              href="/"
              className="hover:text-accent-primary transition-colors text-xs font-semibold"
            >
              Home
            </Link>
            <div className="h-4 w-px bg-text-inverse/20 mx-1"></div>
            {exploreLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="hover:text-accent-primary transition-colors text-xs font-medium"
              >
                {link.label}
              </Link>
            ))}
            <div className="h-4 w-px bg-text-inverse/20 mx-1"></div>
            {aboutLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="hover:text-accent-primary transition-colors text-xs font-medium"
              >
                {link.label}
              </Link>
            ))}
            <div className="h-4 w-px bg-text-inverse/20 mx-1"></div>
            <Link
              href="/transparency"
              className="hover:text-accent-primary transition-colors text-xs font-medium"
            >
              Transparency
            </Link>
            <div className="h-4 w-px bg-text-inverse/20 mx-1"></div>
            <Link
              href="/contact"
              className="hover:text-accent-primary transition-colors text-xs font-medium"
            >
              Contact
            </Link>
            <div className="h-4 w-px bg-text-inverse/20 mx-1"></div>
            <button
              onClick={() => setSearchOpen(true)}
              className="hover:text-accent-primary transition-colors text-xs font-medium p-1"
              aria-label="Search"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
            {/* Always render same structure - server and client must match */}
            {!mounted || status === 'loading' ? (
              <div className="w-16 h-4"></div>
            ) : session ? (
              <Link
                href="/profile"
                className="hover:text-accent-primary transition-colors text-xs font-medium"
              >
                Account
              </Link>
            ) : (
              <Link
                href="/login"
                className="hover:text-accent-primary transition-colors text-xs font-medium"
              >
                Login
              </Link>
            )}
          </div>

          <button
            className="md:hidden p-3 rounded-md hover:bg-card-bg-muted active:bg-card-bg-muted transition-colors touch-manipulation mobile-touch-target"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
            aria-expanded={isOpen}
          >
            <svg
              className="h-6 w-6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {isOpen && (
          <>
            {/* Backdrop overlay - positioned outside nav to ensure proper z-index */}
            <div
              className="fixed inset-0 bg-black/50 z-[45] md:hidden"
              onClick={() => setIsOpen(false)}
              onTouchStart={(e) => {
                // Close on touch outside
                if (e.target === e.currentTarget) {
                  setIsOpen(false)
                }
              }}
              aria-hidden="true"
            />
            {/* Mobile menu */}
            <div className="md:hidden pb-4 relative z-[60] bg-nav-bg">
              <div className="flex flex-col space-y-4">
              <div className="space-y-2">
                <Link
                  href="/"
                  className="block px-3 py-3 rounded-md hover:bg-card-bg-muted active:bg-card-bg-muted transition-colors font-medium touch-manipulation mobile-touch-target"
                  onClick={() => setIsOpen(false)}
                >
                  Home
                </Link>
              </div>

              <div className="space-y-2">
                <p className="text-xs uppercase text-text-inverse/60 font-semibold px-3 py-2">Explore</p>
                {exploreLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="block px-3 py-3 rounded-md hover:bg-card-bg-muted active:bg-card-bg-muted transition-colors touch-manipulation mobile-touch-target"
                    onClick={() => setIsOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              <div className="space-y-2 border-t border-text-inverse/20 pt-2">
                <p className="text-xs uppercase text-text-inverse/60 font-semibold px-3 py-2">About</p>
                {aboutLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="block px-3 py-3 rounded-md hover:bg-card-bg-muted active:bg-card-bg-muted transition-colors touch-manipulation mobile-touch-target"
                    onClick={() => setIsOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              <div className="space-y-2 border-t border-text-inverse/20 pt-2">
                <Link
                  href="/transparency"
                  className="block px-3 py-3 rounded-md hover:bg-card-bg-muted active:bg-card-bg-muted transition-colors font-medium touch-manipulation mobile-touch-target"
                  onClick={() => setIsOpen(false)}
                >
                  Transparency
                </Link>
                <div className="ml-4 mt-1 space-y-1">
                  {transparencySubsections.slice(1).map((subsection) => (
                    <Link
                      key={subsection.href}
                      href={subsection.href}
                      className="block px-3 py-3 rounded-md hover:bg-card-bg-muted active:bg-card-bg-muted transition-colors text-sm text-text-inverse/80 touch-manipulation mobile-touch-target"
                      onClick={() => setIsOpen(false)}
                    >
                      {subsection.label}
                    </Link>
                  ))}
                </div>
              </div>

              <div className="space-y-2 border-t border-text-inverse/20 pt-2">
                <Link
                  href="/contact"
                  className="block px-3 py-3 rounded-md hover:bg-card-bg-muted active:bg-card-bg-muted transition-colors touch-manipulation mobile-touch-target"
                  onClick={() => setIsOpen(false)}
                >
                  Contact
                </Link>
              </div>

              <div className="space-y-2 border-t border-text-inverse/20 pt-2">
                <a
                  href="https://utexas.campuslabs.com/engage/organization/americanadagessociety"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block px-3 py-3 rounded-md hover:bg-card-bg-muted active:bg-card-bg-muted transition-colors flex items-center gap-1 touch-manipulation mobile-touch-target"
                  onClick={() => setIsOpen(false)}
                >
                  HornsLink
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
              
              <button
                onClick={() => {
                  setIsOpen(false)
                  setSearchOpen(true)
                }}
                className="block w-full text-left px-3 py-3 rounded-md hover:bg-card-bg-muted active:bg-card-bg-muted transition-colors flex items-center gap-2 touch-manipulation mobile-touch-target"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Search
              </button>

              {/* Always render same structure - server and client must match */}
              {mounted && status !== 'loading' && (
                <div className="pt-4 border-t border-border-medium mt-2">
                  {session ? (
                    <div className="flex flex-col space-y-2">
                      <Link
                        href="/profile"
                        className="block px-3 py-3 rounded-md hover:bg-card-bg-muted active:bg-card-bg-muted transition-colors touch-manipulation mobile-touch-target"
                        onClick={() => setIsOpen(false)}
                      >
                        Account
                      </Link>
                      <button
                        onClick={() => {
                          setIsOpen(false)
                          signOut({ callbackUrl: '/' })
                        }}
                        className="block w-full text-left px-3 py-3 rounded-md hover:bg-card-bg-muted active:bg-card-bg-muted transition-colors touch-manipulation mobile-touch-target"
                      >
                        Logout
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col space-y-2">
                      <Link
                        href="/login"
                        className="block px-3 py-3 rounded-md hover:bg-card-bg-muted active:bg-card-bg-muted transition-colors touch-manipulation mobile-touch-target"
                        onClick={() => setIsOpen(false)}
                      >
                        Login
                      </Link>
                      <Link
                        href="/register"
                        className="block px-3 py-3 rounded-md hover:bg-card-bg-muted active:bg-card-bg-muted transition-colors touch-manipulation mobile-touch-target"
                        onClick={() => setIsOpen(false)}
                      >
                        Register
                      </Link>
                    </div>
                  )}
                </div>
              )}
              </div>
            </div>
          </>
        )}
      </div>

      {mounted && SearchModal && <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />}
    </nav>
  )
}
