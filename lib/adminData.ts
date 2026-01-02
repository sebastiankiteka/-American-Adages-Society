// Admin data management using localStorage
// This allows editing content without a backend

import { Adage, adages as defaultAdages } from './data'
import { BlogPost, blogPosts as defaultBlogPosts } from './data'

// Re-export types for convenience
export type { Adage, BlogPost }

// Events Management
export interface Event {
  id: string
  title: string
  date: string
  time?: string
  location?: string
  description: string
  type?: 'discussion' | 'workshop' | 'speaker' | 'other'
}

const STORAGE_KEYS = {
  ADAGES: 'aas_adages',
  BLOG_POSTS: 'aas_blog_posts',
  EVENTS: 'aas_events',
  LEADERSHIP: 'aas_leadership',
}

// Adages Management
export function getAdages(): Adage[] {
  if (typeof window === 'undefined') return defaultAdages
  const stored = localStorage.getItem(STORAGE_KEYS.ADAGES)
  return stored ? JSON.parse(stored) : defaultAdages
}

export function saveAdages(adages: Adage[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEYS.ADAGES, JSON.stringify(adages))
}

export function addAdage(adage: Adage): void {
  const adages = getAdages()
  adages.push(adage)
  saveAdages(adages)
}

export function updateAdage(id: string, updated: Partial<Adage>): void {
  const adages = getAdages()
  const index = adages.findIndex(a => a.id === id)
  if (index !== -1) {
    adages[index] = { ...adages[index], ...updated }
    saveAdages(adages)
  }
}

export function deleteAdage(id: string): void {
  const adages = getAdages()
  const filtered = adages.filter(a => a.id !== id)
  saveAdages(filtered)
}

// Blog Posts Management
export function getBlogPosts(): BlogPost[] {
  if (typeof window === 'undefined') return defaultBlogPosts
  const stored = localStorage.getItem(STORAGE_KEYS.BLOG_POSTS)
  return stored ? JSON.parse(stored) : defaultBlogPosts
}

export function saveBlogPosts(posts: BlogPost[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEYS.BLOG_POSTS, JSON.stringify(posts))
}

export function addBlogPost(post: BlogPost): void {
  const posts = getBlogPosts()
  posts.push(post)
  saveBlogPosts(posts)
}

export function updateBlogPost(id: string, updated: Partial<BlogPost>): void {
  const posts = getBlogPosts()
  const index = posts.findIndex(p => p.id === id)
  if (index !== -1) {
    posts[index] = { ...posts[index], ...updated }
    saveBlogPosts(posts)
  }
}

export function deleteBlogPost(id: string): void {
  const posts = getBlogPosts()
  const filtered = posts.filter(p => p.id !== id)
  saveBlogPosts(filtered)
}

// Events Management
export interface Event {
  id: string
  title: string
  date: string
  time?: string
  location?: string
  description: string
  type?: 'discussion' | 'workshop' | 'speaker' | 'other'
}

const defaultEvents: Event[] = [
  {
    id: '1',
    title: 'Monthly Discussion: "Actions Speak Louder Than Words"',
    date: 'February 15, 2024',
    time: '6:00 PM - 7:30 PM',
    location: 'University of Texas - Austin, RLP 4.102',
    description: 'Join us for an engaging discussion on how this timeless adage applies to modern leadership, relationships, and personal development.',
    type: 'discussion',
  },
  {
    id: '2',
    title: 'Creative Writing Workshop: Adages in Poetry',
    date: 'February 22, 2024',
    time: '4:00 PM - 6:00 PM',
    location: 'University of Texas - Austin, PAR 301',
    description: 'Explore how adages can inspire creative writing. We\'ll examine examples from literature and create our own pieces.',
    type: 'workshop',
  },
  {
    id: '3',
    title: 'Guest Speaker: Dr. Maria Santos on Etymology',
    date: 'March 5, 2024',
    time: '5:30 PM - 7:00 PM',
    location: 'University of Texas - Austin, GEA 100',
    description: 'Dr. Santos, linguistics professor, will discuss the evolution of American adages and their cultural significance.',
    type: 'speaker',
  },
  {
    id: '4',
    title: 'Archive Contribution Session',
    date: 'March 12, 2024',
    time: '6:00 PM - 7:00 PM',
    location: 'University of Texas - Austin, RLP 4.102',
    description: 'Help us expand our archive! Bring adages you\'ve researched, and we\'ll work together to document them properly.',
    type: 'workshop',
  },
]

export function getEvents(): Event[] {
  if (typeof window === 'undefined') return defaultEvents
  const stored = localStorage.getItem(STORAGE_KEYS.EVENTS)
  return stored ? JSON.parse(stored) : defaultEvents
}

export function saveEvents(events: Event[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEYS.EVENTS, JSON.stringify(events))
}

export function addEvent(event: Event): void {
  const events = getEvents()
  events.push(event)
  saveEvents(events)
}

export function updateEvent(id: string, updated: Partial<Event>): void {
  const events = getEvents()
  const index = events.findIndex(e => e.id === id)
  if (index !== -1) {
    events[index] = { ...events[index], ...updated }
    saveEvents(events)
  }
}

export function deleteEvent(id: string): void {
  const events = getEvents()
  const filtered = events.filter(e => e.id !== id)
  saveEvents(filtered)
}

// Leadership Management
export interface LeadershipMember {
  name: string
  role: string
  bio: string
  image?: string
}

// Note: Event and LeadershipMember are already exported above

const defaultLeadership: LeadershipMember[] = [
  {
    name: 'Sebastian Kiteka',
    role: 'President',
    bio: 'Leading the American Adages Society in exploring the wisdom embedded in timeless sayings and preserving cultural memory through language.',
  },
  {
    name: 'Christian Hinojosa',
    role: 'Vice President',
    bio: 'Supporting the organization\'s mission to decode the origins, meanings, and transformations of adages while revealing their enduring relevance.',
  },
  {
    name: 'Kaelon Osby',
    role: 'Treasurer',
    bio: 'Managing finances and resources to ensure the society can continue its mission of preserving and sharing adages with the community.',
  },
  {
    name: 'Aneta Rota',
    role: 'Secretary',
    bio: 'Documenting meetings, maintaining our archive, and coordinating communication to help build our evolving archive of American adages.',
  },
]

export function getLeadership(): LeadershipMember[] {
  if (typeof window === 'undefined') return defaultLeadership
  const stored = localStorage.getItem(STORAGE_KEYS.LEADERSHIP)
  return stored ? JSON.parse(stored) : defaultLeadership
}

export function saveLeadership(leadership: LeadershipMember[]): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEYS.LEADERSHIP, JSON.stringify(leadership))
}

export function addLeadershipMember(member: LeadershipMember): void {
  const leadership = getLeadership()
  leadership.push(member)
  saveLeadership(leadership)
}

export function updateLeadershipMember(index: number, updated: Partial<LeadershipMember>): void {
  const leadership = getLeadership()
  if (leadership[index]) {
    leadership[index] = { ...leadership[index], ...updated }
    saveLeadership(leadership)
  }
}

export function deleteLeadershipMember(index: number): void {
  const leadership = getLeadership()
  leadership.splice(index, 1)
  saveLeadership(leadership)
}

