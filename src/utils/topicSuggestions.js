const commonWords = new Set([
  'the',
  'and',
  'for',
  'with',
  'from',
  'that',
  'this',
  'into',
  'through',
  'about',
  'your',
  'you',
  'are',
  'was',
  'were',
  'have',
  'has',
  'had',
  'not',
  'but',
  'his',
  'her',
  'their',
  'our',
  'its',
  'use',
  'uses',
  'using'
])

export function suggestTopicTags(title = '', summary = '') {
  const combinedText = `${title} ${summary}`

  return combinedText
    .replace(/[^\w\s-]/g, '')
    .split(/\s+/)
    .map((word) => word.trim())
    .filter((word) => word.length > 3)
    .filter((word) => !commonWords.has(word.toLowerCase()))
    .map((word) => capitalize(word))
    .slice(0, 8)
}

function capitalize(word) {
  return word.charAt(0).toUpperCase() + word.slice(1)
}