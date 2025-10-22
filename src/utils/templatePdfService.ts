import type { CV } from '../types/cv';
import { generateClassicPDF, type ClassicPDFOptions } from './classicPdfGenerator';
import { generateModernPDF, type ModernPDFOptions } from './modernPdfGenerator';
import { generateMinimalPDF, type MinimalPDFOptions } from './minimalPdfGenerator';

export interface TemplatePDFOptions {
  fileName?: string;
  includeMetadata?: boolean;
}

/**
 * Generate PDF using the correct template-specific generator
 * This ensures that each template has its own unique PDF layout
 */
export const generateTemplatePDF = (cv: CV, options: TemplatePDFOptions = {}): void => {
  const fileName = options.fileName ||
    (cv.personalInfo.fullName
      ? `${cv.personalInfo.fullName.replace(/\s+/g, '_')}_Professional_CV.pdf`
      : 'Professional_CV.pdf');

  // Route to the correct PDF generator based on template
  switch (cv.templateId) {
    case 'classic':
      generateClassicPDF(cv, {
        fileName,
        includeMetadata: options.includeMetadata
      } as ClassicPDFOptions);
      break;

    case 'modern':
      generateModernPDF(cv, {
        fileName,
        includeMetadata: options.includeMetadata
      } as ModernPDFOptions);
      break;

    case 'minimal':
      generateMinimalPDF(cv, {
        fileName,
        includeMetadata: options.includeMetadata
      } as MinimalPDFOptions);
      break;

    default:
      // Default to classic for ATS compatibility
      generateClassicPDF(cv, {
        fileName,
        includeMetadata: options.includeMetadata
      } as ClassicPDFOptions);
      break;
  }
};

/**
 * Get PDF blob using the correct template-specific generator
 */
export const getTemplatePDFBlob = (cv: CV, options: TemplatePDFOptions = {}): Blob => {
  // Import the blob functions - need to check if they exist first
  try {
    switch (cv.templateId) {
      case 'classic':
        const { getClassicPDFBlob } = require('./classicPdfGenerator');
        return getClassicPDFBlob(cv, options);

      case 'modern':
        const { getModernPDFBlob } = require('./modernPdfGenerator');
        return getModernPDFBlob(cv, options);

      case 'minimal':
        const { getMinimalPDFBlob } = require('./minimalPdfGenerator');
        return getMinimalPDFBlob(cv, options);

      default:
        const { getClassicPDFBlob: defaultBlob } = require('./classicPdfGenerator');
        return defaultBlob(cv, options);
    }
  } catch (error) {
    console.error('Error generating PDF blob:', error);
    // Fallback to classic
    const { getClassicPDFBlob } = require('./classicPdfGenerator');
    return getClassicPDFBlob(cv, options);
  }
};
