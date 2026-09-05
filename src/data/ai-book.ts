import rawBookData from './ai-book-data.json'

export interface BookSection {
  id: string
  title: string
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
