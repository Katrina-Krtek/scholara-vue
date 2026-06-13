import { computed, ref, watch } from 'vue'

const STORAGE_KEY = 'scholarory-books'

const starterBooks = [
  {
    id: 'book-1',
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
    tags: ['spiritual formation', 'truth', 'goodness', 'beauty', 'community'],
  },
  {
    id: 'book-2',
    title: 'Belong',
    subtitle: 'Group Spiritual Direction for Christian Friendship and Communal Discernment',
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
    tags: ['spiritual direction', 'friendship', 'discernment'],
  },
]

const savedBooks = localStorage.getItem(STORAGE_KEY)

const books = ref(savedBooks ? JSON.parse(savedBooks) : starterBooks)

watch(
  books,
  (newBooks) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newBooks))
  },
  { deep: true },
)

export function useBooks() {
  const allBooks = computed(() => books.value)

  const readingBooks = computed(() =>
    books.value.filter((book) => book.status === 'reading'),
  )

  const plannedBooks = computed(() =>
    books.value.filter((book) => book.status === 'planned'),
  )

  const completedBooks = computed(() =>
    books.value.filter((book) => book.status === 'completed'),
  )

  function getBookById(id) {
    return books.value.find((book) => book.id === id)
  }

  function addBook(book = {}) {
    const newBook = {
      id: `book-${Date.now()}`,
      title: book.title || 'Untitled Book',
      subtitle: book.subtitle || '',
      author: book.author || '',
      status: book.status || 'planned',
      rating: book.rating || 0,
      coverUrl: book.coverUrl || '',
      publisher: book.publisher || '',
      publicationYear: book.publicationYear || '',
      isbn: book.isbn || '',
      edition: book.edition || '',
      pageCount: book.pageCount || '',
      language: book.language || 'English',
      genre: book.genre || '',
      startDate: book.startDate || '',
      finishDate: book.finishDate || '',
      readingGoal: book.readingGoal || '',
      currentPage: Number(book.currentPage || 0),
      totalPages: Number(book.totalPages || 0),
      summary: book.summary || '',
      notes: book.notes || '',
      relatedCourseIds: book.relatedCourseIds || [],
      relatedAssignmentIds: book.relatedAssignmentIds || [],
      chapters: book.chapters || [],
      quotes: book.quotes || [],
      tags: book.tags || [],
    }

    books.value.unshift(newBook)
    return newBook
  }

  function updateBook(id, updates) {
    const index = books.value.findIndex((book) => book.id === id)
    if (index === -1) return null

    books.value[index] = {
      ...books.value[index],
      ...updates,
    }

    return books.value[index]
  }

  function deleteBook(id) {
    books.value = books.value.filter((book) => book.id !== id)
  }

  function addChapter(bookId) {
    const book = getBookById(bookId)
    if (!book) return null

    book.chapters ??= []

    const chapter = {
      id: `chapter-${Date.now()}`,
      number: book.chapters.length + 1,
      title: `Chapter ${book.chapters.length + 1}`,
      summary: '',
      keyIdeas: '',
      quotes: '',
      questions: '',
      application: '',
    }

    book.chapters.push(chapter)
    return chapter
  }

  function updateChapter(bookId, chapterId, updates) {
    const book = getBookById(bookId)
    if (!book) return null

    const chapterIndex = book.chapters.findIndex(
      (chapter) => chapter.id === chapterId,
    )

    if (chapterIndex === -1) return null

    book.chapters[chapterIndex] = {
      ...book.chapters[chapterIndex],
      ...updates,
    }

    return book.chapters[chapterIndex]
  }

  function deleteChapter(bookId, chapterId) {
    const book = getBookById(bookId)
    if (!book) return

    book.chapters = book.chapters.filter(
      (chapter) => chapter.id !== chapterId,
    )
  }

  function addQuote(bookId) {
    const book = getBookById(bookId)
    if (!book) return null

    book.quotes ??= []

    const quote = {
      id: `quote-${Date.now()}`,
      text: '',
      page: '',
      chapterId: '',
      note: '',
      tags: [],
    }

    book.quotes.push(quote)
    return quote
  }

  function updateQuote(bookId, quoteId, updates) {
    const book = getBookById(bookId)
    if (!book) return null

    const quoteIndex = book.quotes.findIndex((quote) => quote.id === quoteId)

    if (quoteIndex === -1) return null

    book.quotes[quoteIndex] = {
      ...book.quotes[quoteIndex],
      ...updates,
    }

    return book.quotes[quoteIndex]
  }

  function deleteQuote(bookId, quoteId) {
    const book = getBookById(bookId)
    if (!book) return

    book.quotes = book.quotes.filter((quote) => quote.id !== quoteId)
  }

  function getReadingProgress(book) {
    const currentPage = Number(book.currentPage || 0)
    const totalPages = Number(book.totalPages || book.pageCount || 0)

    if (!totalPages) return 0

    return Math.min(100, Math.round((currentPage / totalPages) * 100))
  }

  return {
    allBooks,
    readingBooks,
    plannedBooks,
    completedBooks,
    getBookById,
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