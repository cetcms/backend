export interface Site {
  id: number;
  documentId: number;
  enabled: boolean;
  title: string;
  updatedAt: string;
  locale: string;
  url: string;
  robots: string;
  head: string;
  foot: string;
  inquiryEmail: string;
  index: boolean;
}
