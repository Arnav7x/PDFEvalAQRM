export interface Region {
  id: string;
  questionNumber: string;
  page: number; // 1-based
  x: number; // percentage (0 to 100)
  y: number; // percentage (0 to 100)
  width: number; // percentage (0 to 100)
  height: number; // percentage (0 to 100)
}

export interface Template {
  id: string;
  name: string;
  pageCount: number;
  regions: Region[];
  createdAt: string;
}

export interface PageOffset {
  x: number; // horizontal translation offset in percentage (-100 to 100)
  y: number; // vertical translation offset in percentage (-100 to 100)
  scale: number; // scaling factor (default: 1.0)
}

export interface StudentPaper {
  id: string;
  studentName: string;
  fileName: string;
  fileSize: string;
  pdfUrl: string; // Blob URL or base64 encoded data
  templateId?: string;
  regions: Region[]; // Applied and possibly adjusted regions
  offsets: { [page: number]: PageOffset }; // Per-page adjustment offsets
  grades: {
    [questionNumber: string]: {
      score?: number;
      feedback?: string;
    };
  };
  createdAt: string;
}
