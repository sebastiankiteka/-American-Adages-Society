'use client'

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { getLeadership, type LeadershipMember } from '@/lib/adminData'

export default function About() {
  const [leadership, setLeadership] = useState<LeadershipMember[]>(getLeadership())

  useEffect(() => {
    const refreshLeadership = () => {
      setLeadership(getLeadership())
    }
    refreshLeadership()
    window.addEventListener('storage', refreshLeadership)
    return () => window.removeEventListener('storage', refreshLeadership)
  }, [])

  return (
    <div className="min-h-screen bg-bg-primary py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Mission & Vision */}
        <section className="mb-16">
          <div className="text-center mb-8">
            <Image 
              src="/Favicon Logo AAS.jpeg" 
              alt="AAS Logo" 
              width={80}
              height={80}
              className="h-20 w-20 object-contain mx-auto mb-4"
            />
            <h1 className="text-4xl md:text-5xl font-bold mb-8 text-text-primary">
              About Us
            </h1>
          </div>
          
          <div className="bg-card-bg p-8 md:p-12 rounded-lg shadow-sm border border-border-medium mb-8">
            <h2 className="text-3xl font-bold font-serif mb-6 text-text-primary">
              Our Mission
            </h2>
            <p className="text-lg text-text-primary leading-relaxed mb-4">
              The American Adages Society (AAS) at the University of Texas - Austin is a student-led 
              organization devoted to exploring the wisdom embedded in timeless sayings. Founded on the 
              belief that adages are more than old phrases—that they are living vessels of cultural 
              memory—the AAS studies these expressions as windows into history, language, and the 
              shared human experience.
            </p>
            <p className="text-lg text-text-primary leading-relaxed mb-4">
              Our mission is to decode the origins, meanings, and transformations of adages while 
              revealing their enduring relevance in modern life. We approach adages as cultural and 
              linguistic artifacts, tracing how they shape identity, behavior, and thought across 
              generations. By connecting linguistic study, philosophy, literature, and storytelling, 
              the AAS aims to revive the art of concise wisdom in a world overwhelmed by noise.
            </p>
            <p className="text-lg text-text-primary leading-relaxed mb-4">
              Members participate in discussions, guest lectures, creative projects, and collaborative 
              research that bridge disciplines and foster critical, deeper reflection. Together, we build 
              an evolving archive of American adages—preserving insight, humor, and truth distilled 
              through centuries of human experience.
            </p>
            <p className="text-lg text-text-primary leading-relaxed mb-4">
              As a member, you'll help establish the society's foundation, projects, and legacy at our 
              university. More than a club, this is a community of thinkers exploring how collective 
              language and inherited wisdom can illuminate a strong path forward.
            </p>
            <p className="text-sm text-text-primary italic">
              Note: The American Adages Society is a recognized student organization at the 
              University of Texas - Austin, but we are not officially affiliated with the 
              university. We operate independently as a student-led group.
            </p>
          </div>

          <div className="bg-card-bg p-8 md:p-12 rounded-lg shadow-sm border border-border-medium">
            <h2 className="text-3xl font-bold font-serif mb-6 text-text-primary">
              Our Vision
            </h2>
            <p className="text-lg text-text-primary leading-relaxed mb-4">
              We envision a world where the wisdom of the past is not forgotten but actively 
              engaged with, where language is recognized as a living repository of cultural 
              knowledge, and where students and scholars come together to explore the depth 
              and richness of our linguistic heritage.
            </p>
            <p className="text-lg text-text-primary leading-relaxed">
              As a student-led organization at the University of Texas - Austin, we aim to create a 
              space for thoughtful dialogue, creative expression, and scholarly inquiry into 
              the adages that have shaped American culture and continue to influence our 
              understanding of the world.
            </p>
          </div>
        </section>

        {/* Leadership Team */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold font-serif mb-8 text-center text-text-primary">
            Leadership Team
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {leadership.map((member, index) => (
              <div
                key={index}
                className="bg-card-bg p-6 rounded-lg shadow-md border-2 border-border-medium hover:border-accent-primary transition-all hover:shadow-lg relative overflow-hidden group"
              >
                {/* Decorative accent */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-accent-primary via-text-primary to-accent-primary opacity-0 group-hover:opacity-100 transition-opacity"></div>
                {member.image && (
                  <div className="mb-4">
                    <Image 
                      src={member.image} 
                      alt={member.name}
                      width={96}
                      height={96}
                      className="w-24 h-24 rounded-full object-cover mx-auto border-2 border-accent-primary"
                    />
                  </div>
                )}
                <h3 className="text-xl font-bold font-serif mb-2 text-text-primary group-hover:text-accent-primary transition-colors">
                  {member.name}
                </h3>
                <p className="text-accent-primary font-semibold mb-3">{member.role}</p>
                <p className="text-text-primary">{member.bio}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Organization Structure */}
        <section className="bg-card-bg p-8 md:p-12 rounded-lg shadow-sm border border-border-medium">
          <h2 className="text-3xl font-bold font-serif mb-6 text-text-primary">
            Organization Structure
          </h2>
          <div className="prose prose-lg max-w-none text-text-primary">
            <p className="mb-4">
              The American Adages Society is a recognized student organization at the 
              University of Texas - Austin. We are not officially affiliated with the 
              university, but operate as an independent student-led group. We operate under 
              the guidance of our Constitution and Bylaws, which outline our structure, 
              decision-making processes, and commitment to transparency.
            </p>
            <p className="mb-4">
              Our organization is led by an elected executive board, with regular 
              general meetings open to all members. We welcome students from all 
              majors and backgrounds who share an interest in language, culture, 
              and wisdom. We recruit new members year-round and do not require 
              an application, interview, or membership dues.
            </p>
            <p className="mb-4">
              Our organization is sponsored by Professor Daniels and operates under 
              the guidance of our Constitution and Bylaws. General members typically 
              spend approximately 1 hour per week on organization activities.
            </p>
            <p className="mb-4">
              For detailed information about our governance, please see our{' '}
              <a href="/transparency" className="text-accent-primary hover:underline">
                Transparency & Trust
              </a>{' '}
              page, where you can view and download our Constitution and Bylaws.
            </p>
            <p>
              Learn more about us on{' '}
              <a 
                href="https://utexas.campuslabs.com/engage/organization/americanadagessociety" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-accent-primary hover:underline"
              >
                HornsLink
              </a>.
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}
