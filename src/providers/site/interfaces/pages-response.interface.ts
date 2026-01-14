export interface Page {
  id: number;
  itemId: number;
  isItem: boolean;
  apiId: string;
  document: string;
  documentId: string;
  documentType: 'single' | 'collection';
  documentName: string;
  resource: string;
  url: string;
  title: string;
  locale: string;
  keywords: string;
}

export interface PagesResponse {
  locale: string;
  total: number;
  pages: Page[];
}
