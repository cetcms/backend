export interface Page {
  id: number;
  apiId: string;
  document: string;
  documentId: string;
  dataType: 'single' | 'collection';
  dataTypeName: string;
  url: string;
  title: string;
}
