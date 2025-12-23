// models/pdf.model.ts
export interface PdfFile {
  id?: string;
  name: string;
  url: string;
  size: string;
  type: string;
  lastModified: Date;
  path?: string; // Chemin dans Firebase Storage
}
