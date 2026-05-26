import { bookSchema } from '../models/book';
import type { Book } from '../models/book';

const STORAGE_KEY = 'keepsake.books';

function readBooks(): Book[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const parsed = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '[]');
    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed
      .map((item) => bookSchema.safeParse(item))
      .filter((result) => result.success)
      .map((result) => result.data);
  } catch {
    return [];
  }
}

function writeBooks(books: Book[]) {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
  }
}

export function getBooks() {
  return readBooks().sort((first, second) => new Date(second.updatedAt).getTime() - new Date(first.updatedAt).getTime());
}

export function getBook(id: string) {
  return getBooks().find((book) => book.id === id);
}

export function saveBook(book: Book) {
  const books = getBooks();
  const existingIndex = books.findIndex((item) => item.id === book.id);
  const nextBooks = existingIndex >= 0 ? books.map((item) => (item.id === book.id ? book : item)) : [book, ...books];
  writeBooks(nextBooks);
  return book;
}
