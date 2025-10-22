declare module 'jspdf' {
  export interface jsPDFOptions {
    orientation?: 'portrait' | 'landscape';
    unit?: 'mm' | 'cm' | 'in' | 'px' | 'pt' | 'pc' | 'em' | 'ex';
    format?: string | number[];
    compress?: boolean;
    precision?: number;
    userUnit?: number;
    lineWidth?: number;
    putOnlyUsedFonts?: boolean;
    floatPrecision?: number;
    hotfixes?: string[];
  }

  export class jsPDF {
    constructor(options?: jsPDFOptions);

    internal: {
      pageSize: {
        getWidth(): number;
        getHeight(): number;
      };
    };

    setFontSize(size: number): void;
    setFont(fontName: string, fontStyle?: string): void;
    setTextColor(color: string): void;
    setTextColor(r: number, g: number, b: number): void;
    setLineWidth(width: number): void;
    setDrawColor(color: string): void;
    setDrawColor(r: number, g: number, b: number): void;

    text(text: string, x: number, y: number): void;
    text(text: string[], x: number, y: number): void;
    splitTextToSize(text: string, maxWidth: number): string[];

    line(x1: number, y1: number, x2: number, y2: number): void;

    addPage(): void;

    save(filename: string): void;
    output(type: 'blob'): Blob;
    output(type: 'datauristring'): string;
    output(type: 'datauri'): string;
  }
}
