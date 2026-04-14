/**
 * Tag facet rules for the public Archive filter (no tag renames).
 * System tags are hidden from filters and from “content tag” counts in audits.
 */

/** Never shown in archive filters or as public content tags on cards. */
export const SYSTEM_HIDDEN_TAGS = new Set(['archive'])

/** Literal language/dialect labels only — must match stored tag strings exactly. */
export const LANGUAGE_TAGS = new Set([
  'English',
  'American English',
  'Chinese',
  'Japanese',
  'Welsh',
  'Latin',
])

/** Form / register — optional facet, shown only if present. */
export const TYPE_TAGS = new Set(['idiom'])

export type PublicTagFacet = 'languages' | 'themes' | 'type'

export function isHiddenSystemTag(tag: string): boolean {
  return SYSTEM_HIDDEN_TAGS.has(tag)
}

export function getPublicTagFacet(tag: string): PublicTagFacet | null {
  if (isHiddenSystemTag(tag)) return null
  if (LANGUAGE_TAGS.has(tag)) return 'languages'
  if (TYPE_TAGS.has(tag)) return 'type'
  return 'themes'
}

/** Tags that appear in the archive filter (excludes system). */
export function filterPublicTags(tags: string[] | undefined | null): string[] {
  if (!tags?.length) return []
  return tags.filter((t) => !isHiddenSystemTag(t))
}

export function partitionTagsByFacet(tags: string[]): {
  languages: string[]
  themes: string[]
  type: string[]
} {
  const languages: string[] = []
  const themes: string[] = []
  const type: string[] = []
  const seen = new Set<string>()
  for (const raw of tags) {
    if (isHiddenSystemTag(raw) || seen.has(raw)) continue
    seen.add(raw)
    const facet = getPublicTagFacet(raw)
    if (facet === 'languages') languages.push(raw)
    else if (facet === 'type') type.push(raw)
    else themes.push(raw)
  }
  const sort = (a: string, b: string) => a.localeCompare(b)
  languages.sort(sort)
  themes.sort(sort)
  type.sort(sort)
  return { languages, themes, type }
}
