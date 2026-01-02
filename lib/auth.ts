// Authentication utilities using NextAuth v5
import NextAuth from 'next-auth'
import Credentials from 'next-auth/providers/credentials'
import { supabase } from './supabase'
import bcrypt from 'bcryptjs'

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        // Fetch user from database
        const { data: user, error } = await supabase
          .from('users')
          .select('*')
          .eq('email', credentials.email as string)
          .is('deleted_at', null)
          .single()

        if (error || !user) {
          return null
        }

        // Check if user is banned
        if (user.role === 'banned') {
          return null
        }

        // Verify password
        if (!user.password_hash) {
          return null
        }

        const isValid = await bcrypt.compare(credentials.password as string, user.password_hash)
        if (!isValid) {
          return null
        }

        // Update last login
        await supabase
          .from('users')
          .update({ last_login_at: new Date().toISOString() })
          .eq('id', user.id)

        return {
          id: user.id,
          email: user.email,
          name: user.display_name || user.username || user.email,
          role: user.role,
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as any).role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id as string
        (session.user as any).role = token.role as string
      }
      return session
    }
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: 'jwt',
  },
})

// Helper function to hash passwords
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

// Helper function to check if user has required role
export function hasRole(userRole: string, requiredRole: string): boolean {
  const roleHierarchy: Record<string, number> = {
    banned: 0,
    restricted: 1,
    probation: 2,
    user: 3,
    moderator: 4,
    admin: 5,
  }

  return (roleHierarchy[userRole] || 0) >= (roleHierarchy[requiredRole] || 0)
}

