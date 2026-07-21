import { computed, ref, watch } from 'vue'

const STORAGE_KEY = 'scholarory-books'

export function slugifyBookTitle(value = '') {
  return (
    String(value || '')
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim()
      .replace(/&/g, ' and ')
      .replace(/['’]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'untitled-book'
  )
}

export function createEmptyBookAuthor() {
  return {
    creatorType: 'person',
    firstName: '',
    middleName: '',
    initial: '',
    nameParticle: '',
    lastName: '',
    suffix: '',
    literal: '',
    personId: null,
    organizationId: null,
  }
}

function cleanText(value) {
  return String(value ?? '')
    .replace(/\s+/g, ' ')
    .trim()
}

function looksLikeOrganization(value) {
  const text =
    cleanText(value).toLowerCase()

  return [
    'university',
    'college',
    'seminary',
    'church',
    'press',
    'journal',
    'association',
    'society',
    'committee',
    'council',
    'department',
    'ministry',
    'institute',
    'center',
    'centre',
    'agency',
    'office',
    'organization',
    'foundation',
  ].some((word) =>
    text.includes(word),
  )
}

export function normalizeBookAuthor(
  value,
) {
  if (!value) {
    return createEmptyBookAuthor()
  }

  if (
    typeof value === 'string'
  ) {
    const text = cleanText(value)

    if (!text) {
      return createEmptyBookAuthor()
    }

    if (
      looksLikeOrganization(text)
    ) {
      return {
        ...createEmptyBookAuthor(),
        creatorType: 'literal',
        literal: text,
      }
    }

    if (text.includes(',')) {
      const [
        familyName,
        ...givenParts
      ] = text
        .split(',')
        .map((part) =>
          cleanText(part),
        )

      const givenTokens =
        cleanText(
          givenParts.join(' '),
        )
          .split(' ')
          .filter(Boolean)

      return {
        ...createEmptyBookAuthor(),
        firstName:
          givenTokens.shift() || '',
        middleName:
          givenTokens.join(' '),
        lastName:
          familyName || '',
      }
    }

    const tokens =
      text
        .split(' ')
        .filter(Boolean)

    if (tokens.length === 1) {
      return {
        ...createEmptyBookAuthor(),
        lastName: tokens[0],
      }
    }

    return {
      ...createEmptyBookAuthor(),
      firstName:
        tokens.shift() || '',
      lastName:
        tokens.pop() || '',
      middleName:
        tokens.join(' '),
    }
  }

  const literal =
    cleanText(
      value.literal ||
      value.raw,
    )

  const creatorType =
    value.creatorType === 'literal' ||
    literal
      ? 'literal'
      : 'person'

  return {
    ...createEmptyBookAuthor(),
    creatorType,
    firstName:
      cleanText(
        value.firstName ||
        value.given,
      ),
    middleName:
      cleanText(
        value.middleName ||
        value.middle,
      ),
    initial:
      cleanText(value.initial),
    nameParticle:
      cleanText(
        value.nameParticle ||
        value.particle,
      ),
    lastName:
      cleanText(
        value.lastName ||
        value.family,
      ),
    suffix:
      cleanText(value.suffix),
    literal,
    personId:
      value.personId || null,
    organizationId:
      value.organizationId || null,
  }
}

export function cleanBookAuthors(
  value = [],
) {
  const source =
    Array.isArray(value)
      ? value
      : String(value || '')
          .split(';')
          .map((entry) =>
            entry.trim(),
          )
          .filter(Boolean)

  return source
    .map((author) =>
      normalizeBookAuthor(author),
    )
    .filter((author) => {
      if (
        author.creatorType ===
        'literal'
      ) {
        return Boolean(
          cleanText(author.literal),
        )
      }

      return Boolean(
        cleanText(
          [
            author.firstName,
            author.middleName,
            author.initial,
            author.nameParticle,
            author.lastName,
            author.suffix,
          ].join(' '),
        ),
      )
    })
}

export function formatBookAuthor(
  author,
) {
  const normalized =
    normalizeBookAuthor(author)

  if (
    normalized.creatorType ===
    'literal'
  ) {
    return cleanText(
      normalized.literal,
    )
  }

  return cleanText(
    [
      normalized.firstName,
      normalized.middleName,
      normalized.initial,
      normalized.nameParticle,
      normalized.lastName,
      normalized.suffix,
    ]
      .filter(Boolean)
      .join(' '),
  )
}

export function formatBookAuthors(
  authors = [],
) {
  return cleanBookAuthors(authors)
    .map((author) =>
      formatBookAuthor(author),
    )
    .filter(Boolean)
    .join('; ')
}

const bookDefaults = {
  sourceId: null,
  title: 'Untitled Book',
  slug: '',
  subtitle: '',
  author: '',
  authors: [],
  status: 'planned',
  rating: 0,
  coverUrl: '',
  publisher: '',
  publicationYear: '',
  isbn: '',
  edition: '',
  pageCount: '',
  language: 'English',
  genre: '',
  startDate: '',
  finishDate: '',
  readingGoal: '',
  currentPage: 0,
  totalPages: 0,
  summary: '',
  notes: '',
  relatedCourseIds: [],
  relatedAssignmentIds: [],
  chapters: [],
  quotes: [],
  tags: [],
  createdAt: '',
  updatedAt: '',
}

const starterBooks = [
  {
    id: 'book-1',
    sourceId: 1,
    title: 'A Short Guide to Spiritual Formation',
    subtitle: 'Finding Life in Truth, Goodness, Beauty, and Community',
    author: 'Alex Sosler',
    status: 'reading',
    rating: 0,
    coverUrl: '',
    publisher: '',
    publicationYear: '',
    isbn: '',
    edition: '',
    pageCount: '',
    language: 'English',
    genre: 'Spiritual Formation',
    startDate: '',
    finishDate: '',
    readingGoal: '',
    currentPage: 0,
    totalPages: 0,
    summary: '',
    notes: '',
    relatedCourseIds: ['1'],
    relatedAssignmentIds: [],
    chapters: [
      {
        id: 'chapter-1',
        number: 1,
        title: 'Truth',
        summary: '',
        keyIdeas: '',
        quotes: '',
        questions: '',
        application: '',
      },
      {
        id: 'chapter-2',
        number: 2,
        title: 'Goodness',
        summary: '',
        keyIdeas: '',
        quotes: '',
        questions: '',
        application: '',
      },
      {
        id: 'chapter-3',
        number: 3,
        title: 'Beauty',
        summary: '',
        keyIdeas: '',
        quotes: '',
        questions: '',
        application: '',
      },
      {
        id: 'chapter-4',
        number: 4,
        title: 'Community',
        summary: '',
        keyIdeas: '',
        quotes: '',
        questions: '',
        application: '',
      },
    ],
    quotes: [],
    tags: [
      'spiritual formation',
      'truth',
      'goodness',
      'beauty',
      'community',
    ],
    createdAt: '2026-06-12',
    updatedAt: '2026-06-12',
  },
  {
    id: 'book-2',
    sourceId: 2,
    title: 'Belong',
    subtitle:
      'Group Spiritual Direction for Christian Friendship and Communal Discernment',
    author: 'Melanie Dobson',
    status: 'planned',
    rating: 0,
    coverUrl: '',
    publisher: '',
    publicationYear: '',
    isbn: '',
    edition: '',
    pageCount: '',
    language: 'English',
    genre: 'Spiritual Direction',
    startDate: '',
    finishDate: '',
    readingGoal: '',
    currentPage: 0,
    totalPages: 0,
    summary: '',
    notes: '',
    relatedCourseIds: ['1'],
    relatedAssignmentIds: [],
    chapters: [],
    quotes: [],
    tags: [
      'spiritual direction',
      'friendship',
      'discernment',
    ],
    createdAt: '2026-06-12',
    updatedAt: '2026-06-12',
  },
]

function normalizeText(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
}

function findMatchingStarterBook(book = {}) {
  const directIdMatch = starterBooks.find(
    (starterBook) =>
      String(starterBook.id) === String(book.id),
  )

  if (directIdMatch) {
    return directIdMatch
  }

  const normalizedTitle = normalizeText(book.title)
  const normalizedAuthor = normalizeText(book.author)

  if (!normalizedTitle) {
    return null
  }

  return (
    starterBooks.find((starterBook) => {
      const sameTitle =
        normalizeText(starterBook.title) ===
        normalizedTitle

      const starterAuthor =
        normalizeText(starterBook.author)

      const sameAuthor =
        !normalizedAuthor ||
        !starterAuthor ||
        starterAuthor === normalizedAuthor

      return sameTitle && sameAuthor
    }) || null
  )
}

function copyArray(value, fallback = []) {
  const source =
    Array.isArray(value) ? value : fallback

  return source.map((item) => {
    if (item && typeof item === 'object') {
      return { ...item }
    }

    return item
  })
}

function chooseArray(book, starterBook, field) {
  if (
    Object.prototype.hasOwnProperty.call(
      book,
      field,
    )
  ) {
    return copyArray(book[field])
  }

  if (
    starterBook &&
    Object.prototype.hasOwnProperty.call(
      starterBook,
      field,
    )
  ) {
    return copyArray(starterBook[field])
  }

  return copyArray(bookDefaults[field])
}

function normalizeBook(book = {}, options = {}) {
  const {
    useStarterFallback = true,
  } = options

  const starterBook = useStarterFallback
    ? findMatchingStarterBook(book)
    : null

  const normalized = {
    ...bookDefaults,
    ...(starterBook || {}),
    ...book,
  }

  const hasBookAuthors =
    Object.prototype
      .hasOwnProperty.call(
        book,
        'authors',
      )

  const hasStarterAuthors =
    Boolean(
      starterBook &&
      Object.prototype
        .hasOwnProperty.call(
          starterBook,
          'authors',
        ),
    )

  const authorSource =
    hasBookAuthors
      ? book.authors
      : hasStarterAuthors
        ? starterBook.authors
        : normalized.author

  const normalizedAuthors =
    cleanBookAuthors(
      authorSource,
    )

  const authorDisplay =
    formatBookAuthors(
      normalizedAuthors,
    )

  return {
    ...normalized,

    id:
      normalized.id ||
      `book-${Date.now()}`,

    slug:
      normalized.slug ||
      slugifyBookTitle(
        normalized.title ||
          bookDefaults.title,
      ),

    sourceId:
      normalized.sourceId === undefined
        ? starterBook?.sourceId || null
        : normalized.sourceId,

    title:
      normalized.title ||
      'Untitled Book',

    subtitle:
      normalized.subtitle || '',

    author:
      authorDisplay,

    authors:
      normalizedAuthors,

    status:
      normalized.status || 'planned',

    rating:
      Number(normalized.rating || 0),

    currentPage:
      Number(normalized.currentPage || 0),

    totalPages:
      Number(normalized.totalPages || 0),

    relatedCourseIds: chooseArray(
      book,
      starterBook,
      'relatedCourseIds',
    ).map((id) => String(id)),

    relatedAssignmentIds: chooseArray(
      book,
      starterBook,
      'relatedAssignmentIds',
    ).map((id) => String(id)),

    chapters: chooseArray(
      book,
      starterBook,
      'chapters',
    ),

    quotes: chooseArray(
      book,
      starterBook,
      'quotes',
    ),

    tags: chooseArray(
      book,
      starterBook,
      'tags',
    )
      .map((tag) =>
        String(tag || '').trim(),
      )
      .filter(Boolean),

    createdAt:
      normalized.createdAt ||
      new Date().toISOString(),

    updatedAt:
      normalized.updatedAt ||
      normalized.createdAt ||
      new Date().toISOString(),
  }
}

function loadBooks() {
  try {
    const savedBooks =
      localStorage.getItem(STORAGE_KEY)

    if (!savedBooks) {
      return starterBooks.map((book) =>
        normalizeBook(book),
      )
    }

    const parsedBooks =
      JSON.parse(savedBooks)

    if (!Array.isArray(parsedBooks)) {
      return starterBooks.map((book) =>
        normalizeBook(book),
      )
    }

    return parsedBooks.map((book) =>
      normalizeBook(book),
    )
  } catch (error) {
    console.error(
      'Failed to load books:',
      error,
    )

    return starterBooks.map((book) =>
      normalizeBook(book),
    )
  }
}

function assignUniqueBookSlugs(
  bookList = [],
) {
  const usedSlugs = new Set()

  return bookList.map((book) => {
    const baseSlug =
      book.slug ||
      slugifyBookTitle(book.title)

    let uniqueSlug = baseSlug
    let duplicateNumber = 2

    while (usedSlugs.has(uniqueSlug)) {
      uniqueSlug =
        `${baseSlug}-${duplicateNumber}`

      duplicateNumber += 1
    }

    usedSlugs.add(uniqueSlug)

    return {
      ...book,
      slug: uniqueSlug,
    }
  })
}

const books = ref(
  assignUniqueBookSlugs(loadBooks()),
)

// Save normalized records immediately so older
// localStorage records receive newly added fields.
localStorage.setItem(
  STORAGE_KEY,
  JSON.stringify(books.value),
)

watch(
  books,
  (newBooks) => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(newBooks),
    )
  },
  {
    deep: true,
  },
)

export function useBooks() {
  const allBooks = computed(
    () => books.value,
  )

  const readingBooks = computed(() =>
    books.value.filter(
      (book) =>
        book.status === 'reading',
    ),
  )

  const plannedBooks = computed(() =>
    books.value.filter(
      (book) =>
        book.status === 'planned',
    ),
  )

  const completedBooks = computed(() =>
    books.value.filter(
      (book) =>
        book.status === 'completed',
    ),
  )

  function getBookById(id) {
    return books.value.find(
      (book) =>
        String(book.id) === String(id),
    )
  }

  function getUniqueBookSlug(
    title,
    excludedBookId = null,
  ) {
    const baseSlug =
      slugifyBookTitle(title)

    const existingSlugs = new Set(
      books.value
        .filter(
          (book) =>
            String(book.id) !==
            String(excludedBookId),
        )
        .map(
          (book) =>
            book.slug ||
            slugifyBookTitle(
              book.title,
            ),
        ),
    )

    let uniqueSlug = baseSlug
    let duplicateNumber = 2

    while (
      existingSlugs.has(uniqueSlug)
    ) {
      uniqueSlug =
        `${baseSlug}-${duplicateNumber}`

      duplicateNumber += 1
    }

    return uniqueSlug
  }

  function getBookByRouteValue(value) {
    let routeValue =
      String(value || '').trim()

    try {
      routeValue =
        decodeURIComponent(routeValue)
    } catch {
      // Keep the original value if decoding fails.
    }

    if (!routeValue) {
      return undefined
    }

    return books.value.find(
      (book) => {
        return (
          String(book.id) ===
            routeValue ||
          String(book.slug) ===
            routeValue ||
          slugifyBookTitle(
            book.title,
          ) === routeValue
        )
      },
    )
  }

  function getBookPath(bookOrId) {
    const resolvedBook =
      typeof bookOrId === 'object'
        ? bookOrId
        : getBookById(bookOrId)

    if (!resolvedBook) {
      return '/books'
    }

    const slug =
      resolvedBook.slug ||
      slugifyBookTitle(
        resolvedBook.title,
      )

    return (
      `/books/` +
      encodeURIComponent(slug)
    )
  }

  function addBook(book = {}) {
    const now =
      new Date().toISOString()

    const title =
      book.title ||
      'Untitled Book'

    const newBook = normalizeBook(
      {
        id: `book-${Date.now()}`,
        sourceId:
          book.sourceId ?? null,

        title,

        slug:
          getUniqueBookSlug(title),

        subtitle:
          book.subtitle || '',

        author:
          book.author || '',

        authors:
          Object.prototype
            .hasOwnProperty.call(
              book,
              'authors',
            )
            ? cleanBookAuthors(
                book.authors,
              )
            : cleanBookAuthors(
                book.author,
              ),

        status:
          book.status || 'planned',

        rating:
          book.rating || 0,

        coverUrl:
          book.coverUrl || '',

        publisher:
          book.publisher || '',

        publicationYear:
          book.publicationYear || '',

        isbn:
          book.isbn || '',

        edition:
          book.edition || '',

        pageCount:
          book.pageCount || '',

        language:
          book.language || 'English',

        genre:
          book.genre || '',

        startDate:
          book.startDate || '',

        finishDate:
          book.finishDate || '',

        readingGoal:
          book.readingGoal || '',

        currentPage:
          Number(
            book.currentPage || 0,
          ),

        totalPages:
          Number(
            book.totalPages || 0,
          ),

        summary:
          book.summary || '',

        notes:
          book.notes || '',

        relatedCourseIds:
          book.relatedCourseIds || [],

        relatedAssignmentIds:
          book.relatedAssignmentIds ||
          [],

        chapters:
          book.chapters || [],

        quotes:
          book.quotes || [],

        tags:
          book.tags || [],

        createdAt:
          book.createdAt || now,

        updatedAt: now,
      },
      {
        useStarterFallback: false,
      },
    )

    books.value.unshift(newBook)

    return newBook
  }

  function updateBook(
    id,
    updates = {},
  ) {
    const index =
      books.value.findIndex(
        (book) =>
          String(book.id) ===
          String(id),
      )

    if (index === -1) {
      return null
    }

    const currentBook =
      books.value[index]

    const nextTitle =
      updates.title ??
      currentBook.title

    const titleChanged =
      slugifyBookTitle(nextTitle) !==
      slugifyBookTitle(
        currentBook.title,
      )

    const nextSlug =
      titleChanged
        ? getUniqueBookSlug(
            nextTitle,
            id,
          )
        : currentBook.slug ||
          getUniqueBookSlug(
            nextTitle,
            id,
          )

    books.value[index] =
      normalizeBook(
        {
          ...currentBook,
          ...updates,
          title: nextTitle,
          slug: nextSlug,
          updatedAt:
            new Date().toISOString(),
        },
        {
          useStarterFallback: false,
        },
      )

    return books.value[index]
  }

  function deleteBook(id) {
    books.value =
      books.value.filter(
        (book) =>
          String(book.id) !==
          String(id),
      )
  }

  function addChapter(bookId) {
    const book =
      getBookById(bookId)

    if (!book) {
      return null
    }

    book.chapters ??= []

    const chapter = {
      id:
        `chapter-${Date.now()}`,

      number:
        book.chapters.length + 1,

      title:
        `Chapter ${
          book.chapters.length + 1
        }`,

      summary: '',
      keyIdeas: '',
      quotes: '',
      questions: '',
      application: '',
    }

    book.chapters.push(chapter)

    book.updatedAt =
      new Date().toISOString()

    return chapter
  }

  function updateChapter(
    bookId,
    chapterId,
    updates,
  ) {
    const book =
      getBookById(bookId)

    if (!book) {
      return null
    }

    const chapterIndex =
      book.chapters.findIndex(
        (chapter) =>
          String(chapter.id) ===
          String(chapterId),
      )

    if (chapterIndex === -1) {
      return null
    }

    book.chapters[chapterIndex] = {
      ...book.chapters[
        chapterIndex
      ],
      ...updates,
    }

    book.updatedAt =
      new Date().toISOString()

    return book.chapters[
      chapterIndex
    ]
  }

  function deleteChapter(
    bookId,
    chapterId,
  ) {
    const book =
      getBookById(bookId)

    if (!book) {
      return
    }

    book.chapters =
      book.chapters.filter(
        (chapter) =>
          String(chapter.id) !==
          String(chapterId),
      )

    book.updatedAt =
      new Date().toISOString()
  }

  function addQuote(bookId) {
    const book =
      getBookById(bookId)

    if (!book) {
      return null
    }

    book.quotes ??= []

    const quote = {
      id:
        `quote-${Date.now()}`,
      text: '',
      page: '',
      chapterId: '',
      note: '',
      tags: [],
    }

    book.quotes.push(quote)

    book.updatedAt =
      new Date().toISOString()

    return quote
  }

  function updateQuote(
    bookId,
    quoteId,
    updates,
  ) {
    const book =
      getBookById(bookId)

    if (!book) {
      return null
    }

    const quoteIndex =
      book.quotes.findIndex(
        (quote) =>
          String(quote.id) ===
          String(quoteId),
      )

    if (quoteIndex === -1) {
      return null
    }

    book.quotes[quoteIndex] = {
      ...book.quotes[
        quoteIndex
      ],
      ...updates,
    }

    book.updatedAt =
      new Date().toISOString()

    return book.quotes[
      quoteIndex
    ]
  }

  function deleteQuote(
    bookId,
    quoteId,
  ) {
    const book =
      getBookById(bookId)

    if (!book) {
      return
    }

    book.quotes =
      book.quotes.filter(
        (quote) =>
          String(quote.id) !==
          String(quoteId),
      )

    book.updatedAt =
      new Date().toISOString()
  }

  function getReadingProgress(
    book,
  ) {
    const currentPage =
      Number(
        book.currentPage || 0,
      )

    const totalPages =
      Number(
        book.totalPages ||
          book.pageCount ||
          0,
      )

    if (!totalPages) {
      return 0
    }

    return Math.min(
      100,
      Math.round(
        (currentPage /
          totalPages) *
          100,
      ),
    )
  }

  return {
    allBooks,
    readingBooks,
    plannedBooks,
    completedBooks,

    getBookById,
    getBookByRouteValue,
    getBookPath,

    addBook,
    updateBook,
    deleteBook,

    addChapter,
    updateChapter,
    deleteChapter,

    addQuote,
    updateQuote,
    deleteQuote,

    getReadingProgress,
  }
}