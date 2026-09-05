import rawBookData from './ai-book-data.json'
import rawPagesData from './ai-book-pages.json'

export interface BookSection {
  id: string
  title: string
  shortTitle: string
  paragraphs: string[]
}

export interface BookPage {
  pageNumber: number
  chapterIndex: number
  chapterTitle: string
  shortTitle: string
  paragraphs: string[]
}

export interface BookData {
  title: string
  subtitle: string
  series: string
  author: string
  year: string
  sections: BookSection[]
}

export const aiBookData: BookData = rawBookData as BookData
export const aiBookPages: BookPage[] = rawPagesData as BookPage[]
