export default function Agenda() {
  return (
    <div className="min-h-screen bg-cream py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-bold mb-8 text-center text-charcoal">
          Agenda & Growth Plan
        </h1>

        {/* Goals Section */}
        <section className="bg-white p-8 md:p-12 rounded-lg shadow-sm border border-soft-gray mb-8">
          <h2 className="text-3xl font-bold font-serif mb-6 text-charcoal">
            Our Goals
          </h2>
          <div className="space-y-4 text-charcoal-light">
            <div className="flex items-start">
              <span className="text-bronze text-2xl mr-4">•</span>
              <p className="text-lg">
                <strong className="text-charcoal">Expand the Archive:</strong> Build a comprehensive, 
                searchable database of American adages with detailed definitions, origins, and cultural context.
              </p>
            </div>
            <div className="flex items-start">
              <span className="text-bronze text-2xl mr-4">•</span>
              <p className="text-lg">
                <strong className="text-charcoal">Foster Dialogue:</strong> Create regular opportunities 
                for students to engage with language, wisdom, and cultural heritage through discussions 
                and workshops.
              </p>
            </div>
            <div className="flex items-start">
              <span className="text-bronze text-2xl mr-4">•</span>
              <p className="text-lg">
                <strong className="text-charcoal">Build Community:</strong> Connect students, faculty, 
                and community members who share a passion for language, philosophy, and cultural preservation.
              </p>
            </div>
            <div className="flex items-start">
              <span className="text-bronze text-2xl mr-4">•</span>
              <p className="text-lg">
                <strong className="text-charcoal">Promote Scholarship:</strong> Support research and 
                creative projects that explore the significance of adages in contemporary culture.
              </p>
            </div>
          </div>
        </section>

        {/* Long-term Vision */}
        <section className="bg-white p-8 md:p-12 rounded-lg shadow-sm border border-soft-gray mb-8">
          <h2 className="text-3xl font-bold font-serif mb-6 text-charcoal">
            Long-term Vision
          </h2>
          <div className="prose prose-lg max-w-none text-charcoal-light">
            <p className="mb-4">
              Over the next five years, we envision the American Adages Society as a recognized 
              center for the study and preservation of linguistic wisdom. Our goals include:
            </p>
            <ul className="list-disc list-inside space-y-2 mb-4 ml-4">
              <li>Establishing partnerships with academic departments, libraries, and cultural institutions</li>
              <li>Publishing an annual journal featuring student research and creative work</li>
              <li>Hosting an annual conference on language, culture, and wisdom</li>
              <li>Creating educational resources for K-12 educators</li>
              <li>Expanding our digital archive to include multimedia content and interactive features</li>
            </ul>
            <p>
              We believe that by preserving and engaging with the wisdom of the past, we can 
              better understand the present and shape a more thoughtful future.
            </p>
          </div>
        </section>

        {/* Roadmap */}
        <section className="bg-white p-8 md:p-12 rounded-lg shadow-sm border border-soft-gray mb-8">
          <h2 className="text-3xl font-bold font-serif mb-6 text-charcoal">
            Roadmap
          </h2>
          <div className="space-y-6">
            <div className="border-l-4 border-bronze pl-6">
              <h3 className="text-xl font-bold font-serif mb-2 text-charcoal">
                Spring 2026
              </h3>
              <ul className="list-disc list-inside space-y-1 text-charcoal-light ml-4">
                <li>Launch website and digital archive</li>
                <li>Host monthly discussion series</li>
                <li>Begin creative writing workshop program</li>
                <li>Recruit new members and volunteers</li>
              </ul>
            </div>

            <div className="border-l-4 border-bronze pl-6">
              <h3 className="text-xl font-bold font-serif mb-2 text-charcoal">
                Fall 2026
              </h3>
              <ul className="list-disc list-inside space-y-1 text-charcoal-light ml-4">
                <li>Expand archive to 100+ adages</li>
                <li>Host guest speaker series</li>
                <li>Establish partnerships with academic departments</li>
                <li>Launch community outreach initiatives</li>
              </ul>
            </div>

            <div className="border-l-4 border-bronze pl-6">
              <h3 className="text-xl font-bold font-serif mb-2 text-charcoal">
                2027 & Beyond
              </h3>
              <ul className="list-disc list-inside space-y-1 text-charcoal-light ml-4">
                <li>Publish first annual journal</li>
                <li>Host inaugural conference</li>
                <li>Develop educational resources</li>
                <li>Expand digital platform capabilities</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Impact & Support */}
        <section className="bg-white p-8 md:p-12 rounded-lg shadow-sm border border-soft-gray">
          <h2 className="text-3xl font-bold font-serif mb-6 text-charcoal">
            How Support Translates to Impact
          </h2>
          <div className="prose prose-lg max-w-none text-charcoal-light">
            <p className="mb-4">
              Your support—whether through membership, volunteering, partnerships, or donations—directly 
              enables us to:
            </p>
            <ul className="list-disc list-inside space-y-2 mb-4 ml-4">
              <li>Maintain and expand our digital archive with quality research and documentation</li>
              <li>Host engaging events, workshops, and guest speakers</li>
              <li>Provide resources and opportunities for student research and creative projects</li>
              <li>Build a sustainable organization that can serve future generations of students</li>
              <li>Create educational materials that benefit the broader community</li>
            </ul>
            <p className="mb-6">
              Every contribution helps us preserve linguistic heritage and foster thoughtful dialogue 
              about the wisdom embedded in our language.
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href="/get-involved"
                className="inline-block px-6 py-3 bg-bronze text-cream rounded-lg hover:bg-bronze/90 transition-colors font-medium"
              >
                Get Involved
              </a>
              <a
                href="/contact"
                className="inline-block px-6 py-3 bg-soft-gray text-charcoal rounded-lg hover:bg-bronze hover:text-cream transition-colors font-medium"
              >
                Partner With Us
              </a>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

