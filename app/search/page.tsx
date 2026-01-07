import { Suspense } from 'react'
import SearchClient from './SearchClient'

export default function SearchResults() {
  return (
    <Suspense fallback={null}>
      <SearchClient />
    </Suspense>
  )
}
