# Leadership Team Update Instructions

To update the leadership team information from HornsLink:

1. Visit: https://utexas.campuslabs.com/engage/organization/americanadagessociety

2. Find the current leadership/officer information

3. Update the `leadership` array in `app/about/page.tsx`:

```typescript
const leadership: LeadershipMember[] = [
  {
    name: 'Full Name',
    role: 'President', // or Vice President, Treasurer, Secretary, etc.
    bio: 'Brief bio about the person, their background, and their role in AAS.',
  },
  // Add more members as needed
]
```

4. If you have photos of leadership members, you can:
   - Add them to the `public/` folder
   - Update the `LeadershipMember` interface to include an optional `image` field
   - Display the images in the leadership cards

Example with images:
```typescript
interface LeadershipMember {
  name: string
  role: string
  bio: string
  image?: string // Optional: path to image in public folder
}

const leadership: LeadershipMember[] = [
  {
    name: 'Full Name',
    role: 'President',
    bio: 'Brief bio...',
    image: '/leadership/president.jpg', // if you add images
  },
]
```

Then in the component, you can display:
```tsx
{member.image && (
  <img 
    src={member.image} 
    alt={member.name}
    className="w-24 h-24 rounded-full object-cover mb-4"
  />
)}
```

