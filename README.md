# American Adages Society Website

A clean, calm, and mobile-friendly website for the American Adages Society (AAS), a student-led organization at the University of Texas at Austin.

## Features

- **Home Page**: Hero banner with mission statement and quick navigation
- **Archive**: Searchable, filterable dictionary of adages with definitions, origins, and cultural context
- **Blog**: Announcements and reflections with tagging and sorting
- **Events**: Interactive calendar with iCal and Google Calendar integration
- **About**: Mission, vision, and leadership team information
- **Agenda & Growth Plan**: Goals, vision, and roadmap
- **Get Involved**: Volunteer forms, FAQ, and membership information
- **Transparency**: Constitution, Bylaws, and compliance statements
- **Contact**: Contact form and social media links

## Design

- **Color Palette**: Cream, soft gray, charcoal, and bronze (no UT burnt orange)
- **Typography**: Merriweather (serif) for headings, Inter (sans-serif) for body text
- **Style**: Minimal, academic aesthetic with soft shadows and rounded edges
- **Accessibility**: High contrast, clear hierarchy, keyboard navigation support

## Getting Started

### Prerequisites

- Node.js 18+ and npm (or yarn)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Open [http://localhost:3000](http://localhost:3000) in your browser

### Building for Production

```bash
npm run build
npm start
```

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── archive/           # Archive pages
│   ├── blog/              # Blog pages
│   ├── events/            # Events page
│   ├── about/             # About page
│   ├── agenda/            # Agenda & Growth Plan
│   ├── get-involved/      # Get Involved & FAQ
│   ├── transparency/     # Transparency & Trust
│   ├── contact/           # Contact page
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   └── globals.css        # Global styles
├── components/            # Reusable components
│   ├── Navigation.tsx     # Main navigation
│   ├── Footer.tsx         # Site footer
│   ├── AdageCard.tsx      # Adage card component
│   ├── EventCard.tsx      # Event card component
│   └── BlogCard.tsx       # Blog card component
└── public/                # Static assets
```

## Customization

### Adding Adages

Edit the `sampleAdages` array in `app/archive/page.tsx` or connect to a database/API.

### Adding Blog Posts

Edit the `samplePosts` array in `app/blog/page.tsx` or integrate with a CMS.

### Adding Events

Edit the `sampleEvents` array in `app/events/page.tsx` or connect to a calendar API.

### Updating Leadership

Edit the `leadership` array in `app/about/page.tsx`.

## Technologies

- **Next.js 14**: React framework with App Router
- **TypeScript**: Type safety
- **Tailwind CSS**: Utility-first CSS framework
- **React**: UI library

## Notes

- Forms currently log to console - connect to a backend API for production
- Sample data is included for demonstration - replace with real data sources
- Constitution/Bylaws PDF should be placed in the `public` directory
- Social media links are placeholders - update with actual URLs

## License

This project is for the American Adages Society at the University of Texas at Austin.

