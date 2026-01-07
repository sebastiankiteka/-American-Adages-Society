'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { format } from 'date-fns'

const constitutionSections = [
  {
    title: 'Article I: Name and Purpose',
    content: `The name of this organization shall be the American Adages Society (AAS).

The purpose of this organization is to:
1. Preserve and document American adages as cultural artifacts
2. Foster scholarly and creative engagement with linguistic wisdom
3. Create a community for students interested in language, culture, and philosophy
4. Maintain a searchable archive of adages with definitions, origins, and cultural context`,
  },
  {
    title: 'Article II: Membership',
    content: `Membership in the American Adages Society is open to all currently enrolled students at the University of Texas - Austin.

Membership requirements:
1. Attendance at one general meeting or event
2. Completion of membership interest form
3. Commitment to the organization's mission and values

There are no membership dues required. All members have equal voting rights and may run for leadership positions.`,
  },
  {
    title: 'Article III: Leadership Structure',
    content: `The organization shall be led by an elected Executive Board consisting of:
- President: Oversees organization operations and represents AAS
- Vice President: Assists the President and manages events
- Treasurer: Manages finances and partnerships
- Secretary: Documents meetings and maintains records

Elections are held annually in the spring semester. All members in good standing are eligible to run for office.`,
  },
  {
    title: 'Article IV: Meetings',
    content: `General meetings shall be held monthly, typically on the second Tuesday of each month at 6:00 PM.

Special meetings may be called by the Executive Board or by petition of at least 10% of the membership.

Meeting locations will be announced at least one week in advance via email and social media.`,
  },
  {
    title: 'Article V: Non-Hazing Policy',
    content: `The American Adages Society strictly prohibits hazing in any form. Hazing is defined as any action or situation that recklessly or intentionally endangers the mental or physical health or safety of a student for the purpose of initiation or admission into or affiliation with the organization.

We are committed to creating an inclusive, respectful environment where all members feel welcome and valued. Any violation of this policy will result in immediate disciplinary action, up to and including removal from the organization.`,
  },
  {
    title: 'Article VI: Amendments',
    content: `This Constitution may be amended by a two-thirds majority vote of the membership present at a general meeting, provided that:
1. The proposed amendment has been submitted in writing to the Executive Board at least two weeks prior to the meeting
2. All members have been notified of the proposed amendment at least one week in advance
3. The amendment is consistent with University of Texas policies and regulations`,
  },
]

const bylawsSections = [
  {
    title: 'Section 1: Archive Management',
    content: `The Archive shall be maintained by the Secretary and volunteer members. All adage entries must include:
- The adage text
- Definition
- Origin/etymology
- Historical context
- Cultural interpretation
- Modern practicality

Proposed adages may be submitted by any member and will be reviewed by the Archive Committee.`,
  },
  {
    title: 'Section 2: Event Planning',
    content: `Events shall be planned by the Vice President with input from the membership. All events must:
- Align with the organization's mission
- Be open to all members and the public (unless otherwise specified)
- Be announced at least two weeks in advance
- Follow University policies and procedures`,
  },
  {
    title: 'Section 3: Financial Management',
    content: `The Treasurer shall maintain accurate financial records and provide quarterly reports to the membership.

All expenditures over $50 must be approved by the Executive Board. Major expenses (over $200) require membership approval at a general meeting.`,
  },
  {
    title: 'Section 4: Code of Conduct',
    content: `All members are expected to:
- Treat others with respect and dignity
- Contribute constructively to discussions
- Uphold academic integrity in all research and documentation
- Follow University policies and regulations
- Maintain the organization's commitment to inclusivity and diversity`,
  },
]

interface WebsiteUpdate {
  id: string
  date: string
  title: string
  description: string
  category: 'feature' | 'improvement' | 'fix' | 'announcement'
}

const websiteUpdates: WebsiteUpdate[] = [
  {
    id: '1',
    date: new Date().toISOString(),
    title: 'Enhanced Search Feature',
    description: 'Added advanced search with filters, tags, date ranges, and content type filtering. Search results now show grouped results by type with comprehensive filtering options.',
    category: 'feature',
  },
  {
    id: '2',
    date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    title: 'Forum Reply Management',
    description: 'Users can now edit, delete, and report forum replies. Admins can manage replies from the forum management panel.',
    category: 'feature',
  },
  {
    id: '3',
    date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    title: 'Mailing List Notifications',
    description: 'Admin notifications for weekly email sends. Admins receive alerts when it\'s time to send the weekly featured adage email.',
    category: 'feature',
  },
  {
    id: '4',
    date: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
    title: 'Related Sources in Citations',
    description: 'Citation page now shows related sources for each citation, helping users discover additional references and sources.',
    category: 'improvement',
  },
]

export default function Transparency() {
  const [openSection, setOpenSection] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'documents' | 'rules' | 'updates'>('documents')

  const toggleSection = (title: string) => {
    setOpenSection(openSection === title ? null : title)
  }

  return (
    <div className="min-h-screen bg-bg-primary py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold mb-8 text-center text-text-primary">
          Transparency & Trust
        </h1>

        <div className="bg-card-bg p-8 md:p-12 rounded-lg shadow-sm border border-border-medium mb-8">
          <h2 className="text-3xl font-bold font-serif mb-6 text-text-primary">
            Our Commitment to Transparency
          </h2>
          <p className="text-lg text-text-primary leading-relaxed mb-4">
            The American Adages Society is committed to operating with complete transparency. 
            We believe that open governance, clear policies, and accessible documentation are 
            essential to building trust and maintaining the integrity of our organization.
          </p>
          <p className="text-lg text-text-primary leading-relaxed">
            Below, you can view our complete Constitution and Bylaws, website updates, and 
            organizational documents. These resources outline our structure, decision-making 
            processes, membership policies, and our unwavering commitment to creating a safe, 
            inclusive environment free from hazing or discrimination.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-border-medium">
          <button
            onClick={() => setActiveTab('documents')}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === 'documents'
                ? 'text-accent-primary border-b-2 border-accent-primary'
                : 'text-text-metadata hover:text-text-primary'
            }`}
          >
            Documents
          </button>
          <button
            onClick={() => setActiveTab('rules')}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === 'rules'
                ? 'text-accent-primary border-b-2 border-accent-primary'
                : 'text-text-metadata hover:text-text-primary'
            }`}
          >
            Rules
          </button>
          <button
            onClick={() => setActiveTab('updates')}
            className={`px-6 py-3 font-semibold transition-colors ${
              activeTab === 'updates'
                ? 'text-accent-primary border-b-2 border-accent-primary'
                : 'text-text-metadata hover:text-text-primary'
            }`}
          >
            Website Updates
          </button>
        </div>

        {/* Documents Tab */}
        {activeTab === 'documents' && (
          <>

        {/* Constitution */}
        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold font-serif text-text-primary">
              Constitution
            </h2>
            <div className="flex flex-col items-end gap-2">
              <Link
                href="/transparency/pdf/American_Adages_-_Constitution_and_bylaws"
                className="text-sm px-4 py-2 bg-accent-primary text-text-inverse rounded-lg hover:bg-accent-hover transition-colors"
              >
                View PDF
              </Link>
              <p className="text-xs text-text-metadata text-right max-w-[200px]">
                Print page to download
              </p>
            </div>
          </div>
          <div className="space-y-4">
            {constitutionSections.map((section, index) => (
              <div
                key={index}
                className="bg-card-bg rounded-lg shadow-sm border border-border-medium overflow-hidden"
              >
                <button
                  onClick={() => toggleSection(section.title)}
                  className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-card-bg-muted transition-colors"
                >
                  <h3 className="font-semibold text-text-primary">{section.title}</h3>
                  <svg
                    className={`w-5 h-5 text-accent-primary transition-transform ${
                      openSection === section.title ? 'transform rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openSection === section.title && (
                  <div className="px-6 py-4 text-text-primary border-t border-border-medium whitespace-pre-line">
                    {section.content}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Bylaws */}
        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold font-serif text-text-primary">
              Bylaws
            </h2>
            <div className="flex flex-col items-end gap-2">
              <Link
                href="/transparency/pdf/American_Adages_-_Constitution_and_bylaws"
                className="text-sm px-4 py-2 bg-bronze text-cream rounded-lg hover:bg-bronze/90 transition-colors"
              >
                View PDF
              </Link>
              <p className="text-xs text-text-metadata text-right max-w-[200px]">
                Print page to download
              </p>
            </div>
          </div>
          <div className="space-y-4">
            {bylawsSections.map((section, index) => (
              <div
                key={index}
                className="bg-card-bg rounded-lg shadow-sm border border-border-medium overflow-hidden"
              >
                <button
                  onClick={() => toggleSection(`bylaws-${section.title}`)}
                  className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-card-bg-muted transition-colors"
                >
                  <h3 className="font-semibold text-text-primary">{section.title}</h3>
                  <svg
                    className={`w-5 h-5 text-bronze transition-transform ${
                      openSection === `bylaws-${section.title}` ? 'transform rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openSection === `bylaws-${section.title}` && (
                  <div className="px-6 py-4 text-text-primary border-t border-border-medium whitespace-pre-line">
                    {section.content}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Compliance Statement */}
        <section className="bg-card-bg p-8 md:p-12 rounded-lg shadow-sm border border-border-medium">
          <h2 className="text-3xl font-bold font-serif mb-6 text-text-primary">
            Compliance & Non-Hazing Statement
          </h2>
          <div className="prose prose-lg max-w-none text-text-primary">
            <p className="mb-4">
              The American Adages Society is a registered student organization at the University 
              of Texas at Austin. We operate in full compliance with all University policies, 
              including but not limited to:
            </p>
            <ul className="list-disc list-inside space-y-2 mb-4 ml-4">
              <li>Student Organization policies and procedures</li>
              <li>Non-discrimination and equal opportunity policies</li>
              <li>Hazing prevention policies</li>
              <li>Financial transparency requirements</li>
            </ul>
            <p className="mb-4 font-semibold text-text-primary">
              Non-Hazing Commitment:
            </p>
            <p className="mb-4">
              The American Adages Society strictly prohibits hazing in any form. We are committed 
              to creating an inclusive, respectful environment where all members feel welcome and 
              valued. Our organization does not engage in, condone, or tolerate any form of hazing, 
              initiation rituals, or activities that could endanger the physical or mental well-being 
              of our members.
            </p>
            <p>
              If you have concerns about compliance or wish to report a violation, please contact 
              us at{' '}
              <a href="mailto:sebastiankiteka@utexas.edu" className="text-bronze hover:underline">
                sebastiankiteka@utexas.edu
              </a>{' '}
              or reach out to the University's Student Activities office.
            </p>
          </div>
        </section>
          </>
        )}

        {/* Rules Tab */}
        {activeTab === 'rules' && (
          <section className="space-y-6">
            <div className="bg-surface dark:bg-surface p-8 rounded-lg shadow-sm border border-border">
              <h2 className="text-2xl font-bold font-serif text-charcoal mb-6">
                Community Rules & Guidelines
              </h2>
              <p className="text-text-primary mb-6">
                Our community guidelines ensure a respectful, inclusive, and productive environment for all members.
              </p>

              {/* General Conduct */}
              <div className="mb-8">
                <h3 className="text-xl font-bold font-serif text-text-primary mb-4">
                  General Conduct
                </h3>
                <ul className="space-y-3 text-text-primary">
                  <li className="flex items-start">
                    <span className="text-bronze mr-2">•</span>
                    <span>Treat all members with respect and dignity, regardless of background, beliefs, or opinions.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-bronze mr-2">•</span>
                    <span>Engage in constructive dialogue and contribute meaningfully to discussions.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-bronze mr-2">•</span>
                    <span>Maintain academic integrity in all research, documentation, and contributions.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-bronze mr-2">•</span>
                    <span>Follow all University of Texas policies and regulations.</span>
                  </li>
                </ul>
              </div>

              {/* Forum & Discussion Rules */}
              <div className="mb-8">
                <h3 className="text-xl font-bold font-serif text-text-primary mb-4">
                  Forum & Discussion Rules
                </h3>
                <ul className="space-y-3 text-text-primary">
                  <li className="flex items-start">
                    <span className="text-bronze mr-2">•</span>
                    <span>Stay on topic and contribute relevant content to discussions.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-bronze mr-2">•</span>
                    <span>Do not spam, post duplicate content, or engage in self-promotion without permission.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-bronze mr-2">•</span>
                    <span>Respect intellectual property rights and cite sources appropriately.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-bronze mr-2">•</span>
                    <span>Report inappropriate content or behavior to moderators.</span>
                  </li>
                </ul>
              </div>

              {/* Archive Contributions */}
              <div className="mb-8">
                <h3 className="text-xl font-bold font-serif text-text-primary mb-4">
                  Archive Contributions
                </h3>
                <ul className="space-y-3 text-text-primary">
                  <li className="flex items-start">
                    <span className="text-bronze mr-2">•</span>
                    <span>All adage submissions must include accurate definitions, origins, and cultural context.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-bronze mr-2">•</span>
                    <span>Provide reliable sources and citations for historical information.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-bronze mr-2">•</span>
                    <span>Submissions will be reviewed by the Archive Committee before publication.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-bronze mr-2">•</span>
                    <span>Respect the scholarly nature of the archive and maintain high standards of documentation.</span>
                  </li>
                </ul>
              </div>

              {/* Prohibited Behavior */}
              <div className="mb-8">
                <h3 className="text-xl font-bold font-serif text-text-primary mb-4">
                  Prohibited Behavior
                </h3>
                <ul className="space-y-3 text-text-primary">
                  <li className="flex items-start">
                    <span className="text-bronze mr-2">•</span>
                    <span>Harassment, discrimination, or hate speech of any kind.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-bronze mr-2">•</span>
                    <span>Hazing in any form (see our Non-Hazing Policy).</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-bronze mr-2">•</span>
                    <span>Sharing personal information of others without consent.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-bronze mr-2">•</span>
                    <span>Posting malicious content, viruses, or attempting to compromise site security.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-bronze mr-2">•</span>
                    <span>Creating multiple accounts to circumvent restrictions or bans.</span>
                  </li>
                </ul>
              </div>

              {/* Enforcement */}
              <div className="mb-6">
                <h3 className="text-xl font-bold font-serif text-text-primary mb-4">
                  Enforcement
                </h3>
                <div className="text-text-primary space-y-3">
                  <p>
                    Violations of these rules may result in:
                  </p>
                  <ul className="list-disc list-inside space-y-2 ml-4">
                    <li>Warnings and educational conversations</li>
                    <li>Temporary restrictions on posting or commenting</li>
                    <li>Content removal or moderation</li>
                    <li>Account suspension or removal from the organization</li>
                  </ul>
                  <p className="mt-4">
                    All enforcement actions are documented and can be appealed through the proper channels.
                    For questions or concerns about moderation decisions, please contact the Executive Board.
                  </p>
                </div>
              </div>

              {/* Contact */}
              <div className="bg-card-bg p-6 rounded-lg border border-border-medium">
                <p className="text-text-primary">
                  <strong className="text-text-primary">Questions about these rules?</strong> Contact us at{' '}
                  <a href="mailto:sebastiankiteka@utexas.edu" className="text-bronze hover:underline">
                    sebastiankiteka@utexas.edu
                  </a>
                </p>
              </div>
            </div>
          </section>
        )}

        {/* Website Updates Tab */}
        {activeTab === 'updates' && (
          <section className="space-y-4">
            <div className="bg-card-bg p-6 rounded-lg shadow-sm border border-border-medium">
              <h2 className="text-2xl font-bold font-serif text-text-primary mb-4">
                Recent Website Updates
              </h2>
              <p className="text-text-primary mb-6">
                Stay informed about new features, improvements, and changes to the American Adages Society website.
              </p>
              
              <div className="space-y-4">
                {websiteUpdates.map((update) => (
                  <div
                    key={update.id}
                    className="border-l-4 border-accent-primary pl-4 py-3 bg-card-bg rounded-r-lg"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-semibold text-text-primary">
                        {update.title}
                      </h3>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        update.category === 'feature' ? 'bg-green-100 text-green-800' :
                        update.category === 'improvement' ? 'bg-blue-100 text-blue-800' :
                        update.category === 'fix' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {update.category}
                      </span>
                    </div>
                    <p className="text-sm text-text-primary mb-2">
                      {update.description}
                    </p>
                    <p className="text-xs text-text-metadata">
                      {format(new Date(update.date), 'MMMM d, yyyy')}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Future Subdivisions Notice */}
        <section className="bg-card-bg p-6 rounded-lg shadow-sm border border-border-medium mt-8">
          <h2 className="text-xl font-bold font-serif text-text-primary mb-4">
            Coming Soon
          </h2>
          <p className="text-text-primary mb-4">
            The Transparency section will be expanded to include:
          </p>
          <ul className="list-disc list-inside space-y-2 text-text-primary ml-4">
            <li><strong className="text-text-primary">Sponsors:</strong> Information about our sponsors and partners</li>
            <li><strong className="text-text-primary">Elections:</strong> Election results and voting records</li>
            <li><strong className="text-text-primary">Votes:</strong> Member voting history and outcomes</li>
            <li><strong className="text-text-primary">Budget:</strong> Financial transparency and budget reports</li>
          </ul>
        </section>
      </div>
    </div>
  )
}

