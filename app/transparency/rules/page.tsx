'use client'

import Link from 'next/link'

export default function RulesPage() {
  return (
    <div className="min-h-screen bg-bg-primary py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link
            href="/transparency"
            className="text-accent-primary hover:underline mb-4 inline-block"
          >
            ← Back to Transparency
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-text-primary">
            Community Rules & Guidelines
          </h1>
          <p className="text-lg text-text-primary">
            Our community guidelines ensure a respectful, inclusive, and productive environment for all members.
          </p>
        </div>

        <div className="space-y-6">
          {/* General Conduct */}
          <section className="bg-card-bg p-8 rounded-lg shadow-sm border border-border-medium">
            <h2 className="text-2xl font-bold font-serif text-text-primary mb-4">
              General Conduct
            </h2>
            <ul className="space-y-3 text-text-primary">
              <li className="flex items-start">
                <span className="text-accent-primary mr-2">•</span>
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
          </section>

          {/* Forum & Discussion Rules */}
          <section className="bg-white p-8 rounded-lg shadow-sm border border-soft-gray">
            <h2 className="text-2xl font-bold font-serif text-charcoal mb-4">
              Forum & Discussion Rules
            </h2>
            <ul className="space-y-3 text-charcoal-light">
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
          </section>

          {/* Archive Contributions */}
          <section className="bg-white p-8 rounded-lg shadow-sm border border-soft-gray">
            <h2 className="text-2xl font-bold font-serif text-charcoal mb-4">
              Archive Contributions
            </h2>
            <ul className="space-y-3 text-charcoal-light">
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
          </section>

          {/* Prohibited Behavior */}
          <section className="bg-white p-8 rounded-lg shadow-sm border border-soft-gray">
            <h2 className="text-2xl font-bold font-serif text-charcoal mb-4">
              Prohibited Behavior
            </h2>
            <ul className="space-y-3 text-charcoal-light">
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
          </section>

          {/* Enforcement */}
          <section className="bg-white p-8 rounded-lg shadow-sm border border-soft-gray">
            <h2 className="text-2xl font-bold font-serif text-charcoal mb-4">
              Enforcement
            </h2>
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
          </section>

          {/* Contact */}
          <section className="bg-card-bg p-6 rounded-lg border border-border-medium">
            <p className="text-text-primary">
              <strong className="text-text-primary">Questions about these rules?</strong> Contact us at{' '}
              <a href="mailto:sebastiankiteka@utexas.edu" className="text-accent-primary hover:underline">
                sebastiankiteka@utexas.edu
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}


