import Link from 'next/link'

export default function IdiomsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-4xl md:text-5xl font-bold mb-8 text-text-primary">
        Idioms & Cultural Phrases
      </h1>

      <div className="prose prose-lg max-w-none text-text-primary mb-12">
        <h2 className="text-3xl font-bold mb-4 text-text-primary">
          What Is an Idiom?
        </h2>
        <p className="text-lg leading-relaxed mb-4">
          An idiom is a figurative expression whose meaning cannot be understood from the literal words alone. 
          The phrase as a whole has a meaning that is different from the meanings of the individual words.
        </p>
        <p className="text-lg leading-relaxed mb-6">
          Idioms are culturally specific expressions that often reflect the history, values, and experiences 
          of a particular language community. They add color, humor, and nuance to communication.
        </p>

        <h2 className="text-3xl font-bold mb-4 text-text-primary mt-12">
          How Idioms Differ from Adages
        </h2>
        <p className="text-lg leading-relaxed mb-4">
          While both idioms and adages are traditional expressions, they serve different purposes:
        </p>
        <ul className="list-disc list-inside space-y-2 mb-6 text-lg">
          <li>
            <strong>Adages</strong> provide wisdom, guidance, or moral lessons. They are advisory in nature 
            and express general truths about life, behavior, or decision-making.
          </li>
          <li>
            <strong>Idioms</strong> are descriptive expressions that convey meaning through figurative language. 
            They don't necessarily offer advice or wisdom, but rather describe situations, emotions, or actions 
            in colorful, culturally specific ways.
          </li>
        </ul>
        <p className="text-lg leading-relaxed mb-6">
          For example, "A stitch in time saves nine" is an adage because it offers practical advice about 
          taking action early. "Break the ice" is an idiom because it figuratively describes starting a 
          conversation, but doesn't provide wisdom or guidance.
        </p>

        <h2 className="text-3xl font-bold mb-4 text-text-primary mt-12">
          Common Idioms
        </h2>
        <p className="text-lg leading-relaxed mb-4">
          Below is a collection of common American idioms and cultural phrases:
        </p>
        <ul className="list-none space-y-2 mb-8 text-lg">
          <li>• Bite the bullet</li>
          <li>• Under the weather</li>
          <li>• Break the ice</li>
          <li>• Hit the nail on the head</li>
          <li>• Back to square one</li>
          <li>• The ball is in your court</li>
          <li>• Call it a day</li>
          <li>• Cut to the chase</li>
          <li>• On thin ice</li>
          <li>• Throw in the towel</li>
        </ul>

        <div className="bg-card-bg-muted p-6 rounded-lg border border-border-medium mt-12">
          <p className="text-text-primary leading-relaxed">
            <strong>Note:</strong> This archive focuses primarily on adages — traditional sayings that express 
            wisdom and guidance. For a comprehensive collection of idioms and cultural phrases, we recommend 
            consulting specialized linguistic resources. Our mission is to preserve and interpret the wisdom 
            embedded in adages, while recognizing that idioms and phrases are an important part of our linguistic 
            heritage.
          </p>
        </div>

        <div className="mt-12 pt-8 border-t border-border-medium">
          <Link 
            href="/archive" 
            className="text-accent-primary hover:underline font-medium text-lg"
          >
            ← Back to Archive
          </Link>
        </div>
      </div>
    </div>
  )
}

