'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function Navigation() {
  const [isOpen, setIsOpen] = useState(false)

  const navLinks: Array<{ href: string; label: string; external?: boolean }> = [
    { href: '/', label: 'Home' },
    { href: '/archive', label: 'Archive' },
    { href: '/blog', label: 'Blog' },
    { href: '/events', label: 'Events' },
    { href: '/about', label: 'About' },
    { href: '/agenda', label: 'Agenda' },
    { href: '/get-involved', label: 'Get Involved' },
    { href: '/transparency', label: 'Transparency' },
    { href: '/contact', label: 'Contact' },
    { 
      href: 'https://utexas.campuslabs.com/engage/organization/americanadagessociety', 
      label: 'HornsLink',
      external: true 
    },
  ]

  return (
    <nav className="bg-charcoal text-cream sticky top-0 z-50 shadow-lg relative border-b-2 border-bronze/20">
      {/* Enhanced academic texture */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(245,241,232,0.15) 2px, rgba(245,241,232,0.15) 4px)`,
        }}></div>
      </div>
      {/* Decorative accent line */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-bronze to-transparent opacity-30"></div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-18 md:h-20">
          <Link href="/" className="text-xl md:text-2xl font-bold font-serif hover:text-bronze transition-colors flex items-center gap-3 group">
            <div className="relative flex-shrink-0">
              <img 
                src="/Favicon Logo AAS.jpeg" 
                alt="AAS Logo" 
                className="h-12 w-12 md:h-16 md:w-16 object-contain drop-shadow-lg group-hover:scale-110 transition-transform bg-cream/10 rounded-lg p-1"
                style={{ minWidth: '48px', minHeight: '48px' }}
              />
              <div className="absolute inset-0 bg-bronze/20 rounded-lg blur-sm opacity-0 group-hover:opacity-100 transition-opacity"></div>
            </div>
            <span className="hidden sm:inline">American Adages Society</span>
            <span className="sm:hidden">AAS</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex space-x-6 items-center">
            {navLinks.map((link) => {
              if (link.external) {
                return (
                  <a
                    key={link.href}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-bronze transition-colors text-sm font-medium flex items-center gap-1"
                  >
                    {link.label}
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                )
              }
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="hover:text-bronze transition-colors text-sm font-medium"
                >
                  {link.label}
                </Link>
              )
            })}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-md hover:bg-charcoal-light transition-colors"
            onClick={() => setIsOpen(!isOpen)}
            aria-label="Toggle menu"
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

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="md:hidden pb-4">
            <div className="flex flex-col space-y-2">
              {navLinks.map((link) => {
                if (link.external) {
                  return (
                    <a
                      key={link.href}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block px-3 py-2 rounded-md hover:bg-charcoal-light transition-colors flex items-center gap-1"
                      onClick={() => setIsOpen(false)}
                    >
                      {link.label}
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  )
                }
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="block px-3 py-2 rounded-md hover:bg-charcoal-light transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    {link.label}
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

