interface ComingSoonProps {
  title: string
  description?: string
}

export default function ComingSoon({ title, description }: ComingSoonProps) {
  return (
    <div className="min-h-screen bg-bg-primary py-12 px-4 flex items-center justify-center">
      <div className="max-w-2xl mx-auto text-center">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold font-serif text-text-primary mb-4">
            {title}
          </h1>
          <p className="text-xl text-accent-primary font-serif italic mb-2">
            This section is under development.
          </p>
          {description && (
            <p className="text-lg text-text-secondary mt-4">
              {description}
            </p>
          )}
        </div>
        <div className="mt-8">
          <div className="inline-block px-6 py-3 bg-card-bg rounded-lg shadow-sm border border-border-medium">
            <p className="text-sm text-text-primary">
              We're working hard to bring you this content soon.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}


