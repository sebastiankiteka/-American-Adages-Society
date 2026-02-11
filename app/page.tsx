import Link from 'next/link'
import Image from 'next/image'
import WeeklyAdage from '@/components/WeeklyAdage'
import MailingListSignup from '@/components/MailingListSignup'
import BackToTop from '@/components/BackToTop'

export default function Home() {
  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-b from-bg-primary to-bg-secondary py-20 px-4 md:py-32 overflow-hidden">
        {/* Subtle academic texture background */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 35px, rgba(44,44,44,0.03) 35px, rgba(44,44,44,0.03) 70px)`,
          }}></div>
        </div>
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <div className="mb-6 flex justify-center">
              <Image 
                src="/Favicon Logo AAS.jpeg" 
                alt="American Adages Society Logo" 
                width={128}
                height={128}
                className="h-24 w-24 md:h-32 md:w-32 object-contain drop-shadow-lg"
                priority
              />
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-4 text-text-primary">
              American Adages Society
            </h1>
            <p className="text-2xl md:text-3xl text-accent-primary font-serif italic mb-2">
              Big Wisdom, small sentences.
            </p>
            <p className="text-lg text-text-secondary">
              at the University of Texas - Austin
            </p>
          </div>
          <p className="text-lg md:text-xl text-text-primary max-w-2xl mx-auto leading-relaxed">
            The American Adages Society explores the timeless wisdom within language, 
            preserving and interpreting adages as cultural artifacts.
          </p>
          <p className="text-xs text-text-metadata mt-4 text-center">
            {today}
          </p>
        </div>
      </section>

      {/* What Is an Adage? Section */}
      <section className="relative py-16 px-4 bg-bg-primary overflow-hidden">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-text-primary">
            What Is an Adage?
          </h2>
          <p className="text-lg text-text-primary leading-relaxed mb-4">
            An adage is a traditional saying that expresses a general truth, practical wisdom, or guiding principle for life.  
            Adages are advisory in nature — they offer insight into behavior, consequence, character, or decision-making.
          </p>
          <ul className="list-disc list-inside mb-6 text-text-primary space-y-2">
            <li>Convey durable wisdom</li>
            <li>Apply broadly across situations</li>
            <li>Often carry moral, strategic, or practical guidance</li>
          </ul>
          <div className="bg-card-bg-muted p-6 rounded-lg border border-border-medium">
            <h3 className="text-xl font-semibold mb-3 text-text-primary">Examples:</h3>
            <ul className="list-none space-y-1 text-text-primary">
              <li>• A stitch in time saves nine</li>
              <li>• Look before you leap</li>
              <li>• You reap what you sow</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Idioms & Cultural Phrases Section */}
      <section className="relative py-16 px-4 bg-card-bg overflow-hidden border-t border-section">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-6 text-text-primary">
            Idioms & Cultural Phrases
          </h2>
          <p className="text-lg text-text-primary leading-relaxed mb-4">
            Many inherited expressions are often called "adages" in everyday speech — but linguistically, they are different.
          </p>
          <p className="text-lg text-text-primary leading-relaxed mb-6">
            An idiom is a figurative expression whose meaning cannot be understood from the literal words alone.
          </p>
          <div className="bg-card-bg-muted p-6 rounded-lg border border-border-medium mb-6">
            <h3 className="text-xl font-semibold mb-3 text-text-primary">Examples:</h3>
            <ul className="list-none space-y-1 text-text-primary">
              <li>• Cooked his goose</li>
              <li>• Happy as a clam</li>
              <li>• Close but no cigar</li>
            </ul>
          </div>
          <p className="text-lg text-text-primary leading-relaxed mb-6">
            Language evolves through both wisdom and color.  
            While adages provide guidance, idioms and phrases capture lived experience, humor, frustration, and cultural texture.
          </p>
          <p className="text-lg text-text-primary leading-relaxed mb-4">
            For clarity and scholarly integrity, this archive separates:
          </p>
          <ul className="list-disc list-inside text-text-primary space-y-2">
            <li>Adages (wisdom statements)</li>
            <li>Proverbs (traditional cultural wisdom)</li>
            <li>Idioms & Phrases (descriptive expressions)</li>
          </ul>
        </div>
      </section>

      {/* Weekly Featured Adage */}
      <WeeklyAdage />

      {/* Quick Navigation */}
      <section className="relative py-16 px-4 bg-bg-primary overflow-hidden">
        {/* Decorative border accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-accent-primary via-text-primary to-accent-primary"></div>
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12 text-text-primary">
            Explore Our Work
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link 
              href="/archive" 
              className="bg-card-bg p-8 rounded-lg hover:shadow-lg transition-all border-2 border-border-subtle hover:border-accent-primary group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-accent-primary opacity-0 group-hover:opacity-10 rounded-bl-full transition-opacity"></div>
              <h3 className="text-2xl font-bold mb-3 text-text-primary group-hover:text-accent-primary relative z-10">
                The Archive
              </h3>
              <p className="text-text-primary relative z-10">
                Browse our searchable dictionary of adages, each with definitions, 
                origins, and cultural context.
              </p>
            </Link>

            <Link 
              href="/blog" 
              className="bg-card-bg p-8 rounded-lg hover:shadow-lg transition-all border-2 border-border-subtle hover:border-accent-primary group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-accent-primary opacity-0 group-hover:opacity-10 rounded-bl-full transition-opacity"></div>
              <h3 className="text-2xl font-bold mb-3 text-text-primary group-hover:text-accent-primary relative z-10">
                Blog & Announcements
              </h3>
              <p className="text-text-primary relative z-10">
                Read updates on our programs, initiatives, and reflections on 
                language and culture.
              </p>
            </Link>

            <Link 
              href="/events" 
              className="bg-card-bg p-8 rounded-lg hover:shadow-lg transition-all border-2 border-border-subtle hover:border-accent-primary group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-accent-primary opacity-0 group-hover:opacity-10 rounded-bl-full transition-opacity"></div>
              <h3 className="text-2xl font-bold mb-3 text-text-primary group-hover:text-accent-primary relative z-10">
                Events & Calendar
              </h3>
              <p className="text-text-primary relative z-10">
                Join our discussions, workshops, and guest speaker events. 
                Sync with your calendar.
              </p>
            </Link>

            <Link 
              href="/about" 
              className="bg-card-bg p-8 rounded-lg hover:shadow-lg transition-all border-2 border-border-subtle hover:border-accent-primary group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-accent-primary opacity-0 group-hover:opacity-10 rounded-bl-full transition-opacity"></div>
              <h3 className="text-2xl font-bold mb-3 text-text-primary group-hover:text-accent-primary relative z-10">
                About Us
              </h3>
              <p className="text-text-primary relative z-10">
                Learn about our mission, vision, and the team leading the 
                American Adages Society.
              </p>
            </Link>

            <Link 
              href="/agenda" 
              className="bg-card-bg p-8 rounded-lg hover:shadow-lg transition-all border-2 border-border-subtle hover:border-accent-primary group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-accent-primary opacity-0 group-hover:opacity-10 rounded-bl-full transition-opacity"></div>
              <h3 className="text-2xl font-bold mb-3 text-text-primary group-hover:text-accent-primary relative z-10">
                Agenda & Growth
              </h3>
              <p className="text-text-primary relative z-10">
                Discover our goals, long-term vision, and how you can help 
                us make an impact.
              </p>
            </Link>

            <Link 
              href="/get-involved" 
              className="bg-card-bg p-8 rounded-lg hover:shadow-lg transition-all border-2 border-border-subtle hover:border-accent-primary group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-20 h-20 bg-accent-primary opacity-0 group-hover:opacity-10 rounded-bl-full transition-opacity"></div>
              <h3 className="text-2xl font-bold mb-3 text-text-primary group-hover:text-accent-primary relative z-10">
                Get Involved
              </h3>
              <p className="text-text-primary relative z-10">
                Volunteer, join our mailing list, or partner with us. 
                Find answers to common questions.
              </p>
            </Link>
          </div>
        </div>
      </section>

      {/* Mailing List Signup */}
      <section className="relative py-16 px-4 bg-bg-primary overflow-hidden">
        <div className="max-w-4xl mx-auto">
          <MailingListSignup source="homepage" />
        </div>
      </section>

      {/* Mission Statement */}
      <section className="relative py-16 px-4 bg-card-bg-olive overflow-hidden border-t border-section">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle, rgba(139,115,85,0.3) 1px, transparent 1px)`,
            backgroundSize: '20px 20px',
          }}></div>
        </div>
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-8 text-center text-on-olive">
            Our Mission
          </h2>
          <div className="prose prose-lg max-w-none text-on-olive">
            <p className="text-lg leading-relaxed mb-4 text-on-olive">
              The American Adages Society is dedicated to preserving, interpreting, 
              and celebrating the wisdom embedded in our language. We believe that 
              adages—those concise expressions of truth passed down through generations—are 
              more than mere sayings; they are cultural artifacts that reflect our values, 
              history, and collective wisdom.
            </p>
            <p className="text-lg leading-relaxed mb-4 text-on-olive">
              Our organization serves students, scholars, and anyone interested in exploring 
              how language shapes thought and culture. Through research, discussion, and creative 
              exploration, we seek to understand how these timeless phrases continue to shape 
              our thinking and guide our actions in the modern world.
            </p>
            <p className="text-sm text-on-olive italic">
              Note: The American Adages Society is a recognized student organization at the 
              University of Texas - Austin, but we are not officially affiliated with the 
              university. We operate independently as a student-led group.
            </p>
          </div>
        </div>
      </section>
      <BackToTop />
    </div>
  )
}

