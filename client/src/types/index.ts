export interface OCRPage {
  index: number;
  markdown: string;
  images?: Array<{
    id: string;
    imageBase64?: string;
  }>;
}

export interface OCRResponse {
  success: boolean;
  filename?: string;
  url?: string;
  pages: OCRPage[];
  totalPages: number;
}

export interface OCRResult {
  pages: OCRPage[];
  totalPages: number;
}
