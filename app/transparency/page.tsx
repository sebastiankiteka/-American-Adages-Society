'use client'

import { useState } from 'react'

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

export default function Transparency() {
  const [openSection, setOpenSection] = useState<string | null>(null)

  const toggleSection = (title: string) => {
    setOpenSection(openSection === title ? null : title)
  }

  return (
    <div className="min-h-screen bg-cream py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold mb-8 text-center text-charcoal">
          Transparency & Trust
        </h1>

        <div className="bg-white p-8 md:p-12 rounded-lg shadow-sm border border-soft-gray mb-8">
          <h2 className="text-3xl font-bold font-serif mb-6 text-charcoal">
            Our Commitment to Transparency
          </h2>
          <p className="text-lg text-charcoal-light leading-relaxed mb-4">
            The American Adages Society is committed to operating with complete transparency. 
            We believe that open governance, clear policies, and accessible documentation are 
            essential to building trust and maintaining the integrity of our organization.
          </p>
          <p className="text-lg text-charcoal-light leading-relaxed">
            Below, you can view our complete Constitution and Bylaws. These documents outline 
            our structure, decision-making processes, membership policies, and our unwavering 
            commitment to creating a safe, inclusive environment free from hazing or discrimination.
          </p>
        </div>

        {/* Constitution */}
        <section className="mb-12">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold font-serif text-charcoal">
              Constitution
            </h2>
            <a
              href="/American_Adages_-_Constitution_and_bylaws.pdf"
              download
              className="text-sm px-4 py-2 bg-bronze text-cream rounded-lg hover:bg-bronze/90 transition-colors"
            >
              Download PDF
            </a>
          </div>
          <div className="space-y-4">
            {constitutionSections.map((section, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-sm border border-soft-gray overflow-hidden"
              >
                <button
                  onClick={() => toggleSection(section.title)}
                  className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-soft-gray transition-colors"
                >
                  <h3 className="font-semibold text-charcoal">{section.title}</h3>
                  <svg
                    className={`w-5 h-5 text-bronze transition-transform ${
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
                  <div className="px-6 py-4 text-charcoal-light border-t border-soft-gray whitespace-pre-line">
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
            <h2 className="text-3xl font-bold font-serif text-charcoal">
              Bylaws
            </h2>
            <a
              href="/American_Adages_-_Constitution_and_bylaws.pdf"
              download
              className="text-sm px-4 py-2 bg-bronze text-cream rounded-lg hover:bg-bronze/90 transition-colors"
            >
              Download PDF
            </a>
          </div>
          <div className="space-y-4">
            {bylawsSections.map((section, index) => (
              <div
                key={index}
                className="bg-white rounded-lg shadow-sm border border-soft-gray overflow-hidden"
              >
                <button
                  onClick={() => toggleSection(`bylaws-${section.title}`)}
                  className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-soft-gray transition-colors"
                >
                  <h3 className="font-semibold text-charcoal">{section.title}</h3>
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
                  <div className="px-6 py-4 text-charcoal-light border-t border-soft-gray whitespace-pre-line">
                    {section.content}
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Compliance Statement */}
        <section className="bg-white p-8 md:p-12 rounded-lg shadow-sm border border-soft-gray">
          <h2 className="text-3xl font-bold font-serif mb-6 text-charcoal">
            Compliance & Non-Hazing Statement
          </h2>
          <div className="prose prose-lg max-w-none text-charcoal-light">
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
            <p className="mb-4 font-semibold text-charcoal">
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
      </div>
    </div>
  )
}

