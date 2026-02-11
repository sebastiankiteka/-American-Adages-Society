'use client'

import { ThemeProvider as NextThemesProvider } from 'next-themes'

export function ThemeProvider({ 
  children, 
  ...props 
}: { 
  children: React.ReactNode 
  [key: string]: any 
}) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      storageKey="theme"
      enableColorScheme={false}
      forcedTheme={undefined}
      {...props}
    >
      {children}
    </NextThemesProvider>
  )
}

