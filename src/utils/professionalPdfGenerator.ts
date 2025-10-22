import { jsPDF } from 'jspdf';
import type { CV } from '../types/cv';

export interface ProfessionalPDFOptions {
  fileName?: string;
  includeMetadata?: boolean;
}

export class ProfessionalPDFGenerator {
  private pdf: jsPDF;
  private currentY: number;
  private pageWidth: number;
  private pageHeight: number;
  private margins: { top: number; right: number; bottom: number; left: number };
  private fonts: {
    name: number;
    title: number;
    sectionHeader: number;
    body: number;
    small: number;
    contact: number;
  };
  private lineHeight: number;
  private sectionSpacing: number;

  constructor(options: ProfessionalPDFOptions = {}) {
    this.pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
      precision: 2
    });

    this.pageWidth = this.pdf.internal.pageSize.getWidth();
    this.pageHeight = this.pdf.internal.pageSize.getHeight();
    // Improved margins for better professional look
    this.margins = { top: 15, right: 15, bottom: 15, left: 15 };
    this.currentY = this.margins.top;
    this.lineHeight = 1.2;
    this.sectionSpacing = 6;

    // Professional font sizes optimized for modern CVs and ATS
    this.fonts = {
      name: 20,           // Full name - prominent
      title: 12,          // Job title
      sectionHeader: 12,  // Section headers - consistent with title
      body: 10,           // Body text - readable
      small: 9,           // Dates, details
      contact: 10         // Contact information
    };

    // Add metadata for better document properties
    if (options.includeMetadata !== false) {
      this.addMetadata();
    }
  }

  private addMetadata(): void {
    this.pdf.setProperties({
      title: 'Professional CV',
      subject: 'Curriculum Vitae',
      author: 'CV Builder',
      keywords: 'cv, resume, professional, ats',
      creator: 'Professional CV Builder'
    });
  }

  private checkPageBreak(additionalHeight = 20): void {
    if (this.currentY + additionalHeight > this.pageHeight - this.margins.bottom) {
      this.pdf.addPage();
      this.currentY = this.margins.top;
    }
  }

  private addText(
    text: string,
    x: number,
    fontSize: number,
    fontWeight: 'normal' | 'bold' = 'normal',
    align: 'left' | 'center' | 'right' = 'left'
  ): void {
    this.pdf.setFontSize(fontSize);
    // Use Arial/Helvetica for better ATS compatibility and modern look
    this.pdf.setFont('helvetica', fontWeight);
    this.pdf.setTextColor(0, 0, 0);

    if (align === 'center') {
      this.pdf.text(text, x, this.currentY, { align: 'center' });
    } else if (align === 'right') {
      this.pdf.text(text, x, this.currentY, { align: 'right' });
    } else {
      this.pdf.text(text, x, this.currentY);
    }
  }

  private addMultilineText(
    text: string,
    x: number,
    maxWidth: number,
    fontSize: number,
    fontWeight: 'normal' | 'bold' = 'normal'
  ): void {
    if (!text.trim()) return;

    this.pdf.setFontSize(fontSize);
    this.pdf.setFont('helvetica', fontWeight);
    this.pdf.setTextColor(0, 0, 0);

    const lines = this.pdf.splitTextToSize(text.trim(), maxWidth);

    for (const line of lines) {
      this.checkPageBreak(fontSize * 0.6);
      this.pdf.text(line, x, this.currentY);
      this.currentY += fontSize * this.lineHeight * 0.35;
    }
  }

  private addSectionHeader(title: string): void {
    this.checkPageBreak(25);
    this.currentY += this.sectionSpacing;

    // Section title in bold, professional case
    this.addText(title.toUpperCase(), this.margins.left, this.fonts.sectionHeader, 'bold');
    this.currentY += this.fonts.sectionHeader * this.lineHeight * 0.35;

    // Add a clean underline with better spacing - closer to heading
    this.pdf.setLineWidth(0.8);
    this.pdf.setDrawColor(0, 0, 0);
    this.pdf.line(
      this.margins.left,
      this.currentY + 0.5, // Closer to the heading
      this.pageWidth - this.margins.right,
      this.currentY + 0.5
    );

    this.currentY += 6; // More space before content
  }

  private formatDate(dateString: string): string {
    if (!dateString) return '';

    // Handle different date formats
    if (dateString.includes('-')) {
      const [year, month] = dateString.split('-');
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                         'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      if (month && monthNames[Number.parseInt(month) - 1]) {
        return `${monthNames[Number.parseInt(month) - 1]} ${year}`;
      }
      return year;
    }

    return dateString;
  }

  private addPersonalHeader(cv: CV): void {
    const { personalInfo } = cv;

    // Full Name - Left aligned, bold, prominent
    this.addText(
      personalInfo.fullName || 'Your Name',
      this.margins.left,
      this.fonts.name,
      'bold',
      'left'
    );
    this.currentY += this.fonts.name * this.lineHeight * 0.35 + 2;

    // Job Title - Left aligned, slightly smaller
    if (personalInfo.jobTitle) {
      this.addText(
        personalInfo.jobTitle,
        this.margins.left,
        this.fonts.title,
        'normal',
        'left'
      );
      this.currentY += this.fonts.title * this.lineHeight * 0.35 + 4;
    }

    // Contact Information - Clean layout
    const contactLeft = [];
    const contactRight = [];

    if (personalInfo.email) contactLeft.push(`Email: ${personalInfo.email}`);
    if (personalInfo.phone) contactLeft.push(`Phone: ${personalInfo.phone}`);
    if (personalInfo.location) contactRight.push(`Location: ${personalInfo.location}`);
    if (personalInfo.linkedin) contactRight.push(`LinkedIn: ${personalInfo.linkedin}`);

    // Left column contact info
    if (contactLeft.length > 0) {
      contactLeft.forEach(contact => {
        this.addText(contact, this.margins.left, this.fonts.contact, 'normal');
        this.currentY += this.fonts.contact * this.lineHeight * 0.35;
      });
    }

    // Reset Y position for right column
    const rightStartY = this.currentY - (contactLeft.length * this.fonts.contact * this.lineHeight * 0.35);
    let tempY = rightStartY;

    // Right column contact info
    if (contactRight.length > 0) {
      contactRight.forEach(contact => {
        this.pdf.setFontSize(this.fonts.contact);
        this.pdf.setFont('helvetica', 'normal');
        this.pdf.text(contact, this.pageWidth / 2 + 10, tempY);
        tempY += this.fonts.contact * this.lineHeight * 0.35;
      });
    }

    // Ensure we're past both columns
    this.currentY = Math.max(this.currentY, tempY) + 6;

    // Professional Summary/Objective
    if (personalInfo.summary) {
      this.addSectionHeader('Professional Summary');
      this.addMultilineText(
        personalInfo.summary,
        this.margins.left,
        this.pageWidth - this.margins.left - this.margins.right,
        this.fonts.body
      );
      this.currentY += 4;
    }
  }

  private addWorkExperience(cv: CV): void {
    if (cv.workExperience.length === 0) return;

    this.addSectionHeader('Professional Experience');

    cv.workExperience.forEach((exp, index) => {
      this.checkPageBreak(35);

      // Job Title and Date Range on same line
      const startDate = this.formatDate(exp.startDate);
      const endDate = exp.isCurrentJob ? 'Present' : this.formatDate(exp.endDate || '');
      const dateRange = endDate ? `${startDate} - ${endDate}` : startDate;

      // Position title - Bold on left
      this.addText(exp.position, this.margins.left, this.fonts.body, 'bold');

      // Date range on right
      if (dateRange) {
        this.addText(
          dateRange,
          this.pageWidth - this.margins.right,
          this.fonts.small,
          'normal',
          'right'
        );
      }
      this.currentY += this.fonts.body * this.lineHeight * 0.35 + 1;

      // Company and Location
      let companyText = exp.company;
      if (exp.location) {
        companyText += ` | ${exp.location}`;
      }
      this.addText(companyText, this.margins.left, this.fonts.body, 'normal');
      this.currentY += this.fonts.body * this.lineHeight * 0.35 + 3;

      // Bullet points with proper formatting
      exp.bulletPoints.forEach(bullet => {
        this.checkPageBreak(15);

        // Bullet symbol with better positioning
        this.addText('•', this.margins.left + 3, this.fonts.body);

        // Bullet text with proper indentation and spacing
        this.addMultilineText(
          bullet.text,
          this.margins.left + 8,
          this.pageWidth - this.margins.left - this.margins.right - 8,
          this.fonts.body
        );
        this.currentY += 2;
      });

      if (index < cv.workExperience.length - 1) {
        this.currentY += 6;
      }
    });
  }

  private addEducation(cv: CV): void {
    if (cv.education.length === 0) return;

    this.addSectionHeader('Education');

    cv.education.forEach((edu, index) => {
      this.checkPageBreak(25);

      // Degree and Date on same line
      this.addText(edu.degree, this.margins.left, this.fonts.body, 'bold');

      if (edu.endDate) {
        const gradDate = this.formatDate(edu.endDate);
        this.addText(
          gradDate,
          this.pageWidth - this.margins.right,
          this.fonts.small,
          'normal',
          'right'
        );
      }
      this.currentY += this.fonts.body * this.lineHeight * 0.35 + 1;

      // Institution
      this.addText(edu.institution, this.margins.left, this.fonts.body, 'normal');
      this.currentY += this.fonts.body * this.lineHeight * 0.35 + 1;

      // Class of Degree on separate line
      if (edu.classOfDegree) {
        const displayGrade = this.mapClassOfDegree(edu.classOfDegree);
        this.addText(displayGrade, this.margins.left, this.fonts.small, 'normal');
        this.currentY += this.fonts.small * this.lineHeight * 0.35 + 1;
      }

      if (index < cv.education.length - 1) {
        this.currentY += 4;
      }
    });
  }

  private mapClassOfDegree(classValue: string): string {
    const classMapping: Record<string, string> = {
      'first': 'First Class',
      'upperSecond': 'Second Class Upper',
      'lowerSecond': 'Second Class Lower',
      'third': 'Third Class',
      'pass': 'Pass',
      'other': 'Other'
    };
    return classMapping[classValue] || classValue;
  }

  private addSkills(cv: CV): void {
    if (cv.skills.length === 0) return;

    this.addSectionHeader('Skills');

    // Create a formatted skills list with better organization
    const skillsText = cv.skills.map(skill => skill.name).join(' • ');
    this.addMultilineText(
      skillsText,
      this.margins.left,
      this.pageWidth - this.margins.left - this.margins.right,
      this.fonts.body
    );
    this.currentY += 2;
  }

  private addProjects(cv: CV): void {
    if (cv.projects.length === 0) return;

    this.addSectionHeader('Projects');

    cv.projects.forEach((project, index) => {
      this.checkPageBreak(30);

      // Project name - Bold
      this.addText(project.name, this.margins.left, this.fonts.body, 'bold');
      this.currentY += this.fonts.body * this.lineHeight * 0.35 + 1;

      // Technologies on same line as name
      if (project.technologies) {
        this.addText(`Technologies: ${project.technologies}`, this.margins.left, this.fonts.small, 'normal');
        this.currentY += this.fonts.small * this.lineHeight * 0.35 + 2;
      }

      // Description
      if (project.description) {
        this.addMultilineText(
          project.description,
          this.margins.left,
          this.pageWidth - this.margins.left - this.margins.right,
          this.fonts.body
        );
      }

      // URL
      if (project.link) {
        this.addText(`Link: ${project.link}`, this.margins.left, this.fonts.small, 'normal');
        this.currentY += this.fonts.small * this.lineHeight * 0.35;
      }

      if (index < cv.projects.length - 1) {
        this.currentY += 5;
      }
    });
  }

  private addCertifications(cv: CV): void {
    if (cv.certifications.length === 0) return;

    this.addSectionHeader('Certifications');

    cv.certifications.forEach((cert, index) => {
      this.checkPageBreak(20);

      // Certification name and date on same line
      this.addText(cert.name, this.margins.left, this.fonts.body, 'bold');

      if (cert.date) {
        const certDate = this.formatDate(cert.date);
        this.addText(
          certDate,
          this.pageWidth - this.margins.right,
          this.fonts.small,
          'normal',
          'right'
        );
      }
      this.currentY += this.fonts.body * this.lineHeight * 0.35 + 1;

      // Issuer
      this.addText(cert.issuer, this.margins.left, this.fonts.body, 'normal');
      this.currentY += this.fonts.body * this.lineHeight * 0.35;

      // Credential ID
      if (cert.credentialId) {
        this.addText(`Credential ID: ${cert.credentialId}`, this.margins.left, this.fonts.small, 'normal');
        this.currentY += this.fonts.small * this.lineHeight * 0.35;
      }

      if (index < cv.certifications.length - 1) {
        this.currentY += 4;
      }
    });
  }

  private addExtracurricular(cv: CV): void {
    if (cv.extracurricular.length === 0) return;

    this.addSectionHeader('Extracurricular Activities');

    cv.extracurricular.forEach((activity, index) => {
      this.checkPageBreak(25);

      // Activity title and date range
      const startDate = this.formatDate(activity.startDate);
      const endDate = this.formatDate(activity.endDate);
      const dateRange = endDate ? `${startDate} - ${endDate}` : startDate;

      this.addText(activity.title, this.margins.left, this.fonts.body, 'bold');

      if (dateRange) {
        this.addText(
          dateRange,
          this.pageWidth - this.margins.right,
          this.fonts.small,
          'normal',
          'right'
        );
      }
      this.currentY += this.fonts.body * this.lineHeight * 0.35 + 1;

      // Organization
      this.addText(activity.organization, this.margins.left, this.fonts.body, 'normal');
      this.currentY += this.fonts.body * this.lineHeight * 0.35 + 1;

      // Description
      if (activity.description) {
        this.addMultilineText(
          activity.description,
          this.margins.left,
          this.pageWidth - this.margins.left - this.margins.right,
          this.fonts.body
        );
      }

      if (index < cv.extracurricular.length - 1) {
        this.currentY += 4;
      }
    });
  }

  public generatePDF(cv: CV, fileName?: string): void {
    // Build the complete CV in professional order
    this.addPersonalHeader(cv);
    this.addWorkExperience(cv);
    this.addEducation(cv);
    this.addSkills(cv);
    this.addProjects(cv);
    this.addCertifications(cv);
    this.addExtracurricular(cv);

    // Generate filename
    const finalFileName = fileName ||
      (cv.personalInfo.fullName ?
        `${cv.personalInfo.fullName.replace(/\s+/g, '_')}_Professional_CV.pdf` :
        'Professional_CV.pdf');

    // Save the PDF
    this.pdf.save(finalFileName);
  }

  public getPDFBlob(cv: CV): Blob {
    // Build the complete CV
    this.addPersonalHeader(cv);
    this.addWorkExperience(cv);
    this.addEducation(cv);
    this.addSkills(cv);
    this.addProjects(cv);
    this.addCertifications(cv);
    this.addExtracurricular(cv);

    return this.pdf.output('blob');
  }
}

// Convenience functions
export const generateProfessionalPDF = (cv: CV, options?: ProfessionalPDFOptions): void => {
  const generator = new ProfessionalPDFGenerator(options);
  generator.generatePDF(cv, options?.fileName);
};

export const getProfessionalPDFBlob = (cv: CV, options?: ProfessionalPDFOptions): Blob => {
  const generator = new ProfessionalPDFGenerator(options);
  return generator.getPDFBlob(cv);
};
