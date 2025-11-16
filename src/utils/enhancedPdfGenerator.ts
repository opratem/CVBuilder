import { jsPDF } from 'jspdf';
import type { CV } from '../types/cv';

export interface EnhancedPDFOptions {
  fileName?: string;
  template?: 'classic' | 'modern' | 'minimal';
  includeMetadata?: boolean;
  atsOptimized?: boolean;
}

export class EnhancedPDFGenerator {
  private pdf: jsPDF;
  private currentY: number;
  private pageWidth: number;
  private pageHeight: number;
  private margins: { top: number; right: number; bottom: number; left: number };
  private colors: { primary: string; secondary: string; text: string; accent: string };
  private fonts: { name: number; title: number; section: number; body: number; small: number };
  private lineHeight: number;
  private template: string;

  constructor(options: EnhancedPDFOptions = {}) {
    this.pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
      precision: 2
    });

    this.pageWidth = this.pdf.internal.pageSize.getWidth();
    this.pageHeight = this.pdf.internal.pageSize.getHeight();
    this.margins = { top: 15, right: 15, bottom: 15, left: 15 };
    this.currentY = this.margins.top;
    this.lineHeight = 1.2;
    this.template = options.template || 'classic';

    // Professional color scheme
    this.colors = {
      primary: '#2C3E50',    // Dark blue-gray
      secondary: '#34495E',   // Medium blue-gray
      text: '#2C3E50',       // Dark text
      accent: '#3498DB'      // Professional blue
    };

    // Professional font sizes (optimized for ATS)
    this.fonts = {
      name: 16,      // Name header
      title: 11,     // Job title
      section: 12,   // Section headers
      body: 10,      // Body text
      small: 9       // Small details
    };

    // Add metadata for better ATS parsing
    if (options.includeMetadata !== false) {
      this.addMetadata();
    }
  }

  private addMetadata(): void {
    this.pdf.setProperties({
      title: 'Professional CV',
      subject: 'Curriculum Vitae',
      author: 'CV Builder Enhanced',
      keywords: 'cv, resume, professional, ats-optimized',
      creator: 'CV Builder Enhanced'
    });
  }

  private hexToRgb(hex: string): { r: number; g: number; b: number } {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: Number.parseInt(result[1], 16),
      g: Number.parseInt(result[2], 16),
      b: Number.parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  }

  private setTextColor(color: string): void {
    const rgb = this.hexToRgb(color);
    this.pdf.setTextColor(rgb.r, rgb.g, rgb.b);
  }

  private setDrawColor(color: string): void {
    const rgb = this.hexToRgb(color);
    this.pdf.setDrawColor(rgb.r, rgb.g, rgb.b);
  }

  private checkPageBreak(additionalHeight = 15): void {
    if (this.currentY + additionalHeight > this.pageHeight - this.margins.bottom) {
      this.pdf.addPage();
      this.currentY = this.margins.top;
    }
  }

  private addText(text: string, x: number, fontSize: number, fontWeight: 'normal' | 'bold' = 'normal', color: string = this.colors.text): void {
    this.pdf.setFontSize(fontSize);
    this.pdf.setFont('helvetica', fontWeight);
    this.setTextColor(color);
    this.pdf.text(text, x, this.currentY);
  }

  private addMultilineText(text: string, x: number, maxWidth: number, fontSize: number, fontWeight: 'normal' | 'bold' = 'normal', color: string = this.colors.text): void {
    if (!text.trim()) return;

    this.pdf.setFontSize(fontSize);
    this.pdf.setFont('helvetica', fontWeight);
    this.setTextColor(color);

    const lines = this.pdf.splitTextToSize(text.trim(), maxWidth);

    for (const line of lines) {
      this.checkPageBreak(fontSize * 0.4);
      this.pdf.text(line, x, this.currentY);
      this.currentY += fontSize * this.lineHeight * 0.35;
    }
  }

  private addSectionHeader(title: string): void {
    this.checkPageBreak(20);
    this.currentY += 6;

    // Add section line
    this.setDrawColor(this.colors.accent);
    this.pdf.setLineWidth(0.8);
    this.pdf.line(this.margins.left, this.currentY - 2, this.pageWidth - this.margins.right, this.currentY - 2);

    // Add section title
    this.addText(title.toUpperCase(), this.margins.left, this.fonts.section, 'bold', this.colors.primary);
    this.currentY += this.fonts.section * this.lineHeight * 0.35 + 4;
  }

  private addPersonalHeader(cv: CV): void {
    const { personalInfo } = cv;

    // Full Name
    this.addText(personalInfo.fullName, this.margins.left, this.fonts.name, 'bold', this.colors.primary);
    this.currentY += this.fonts.name * this.lineHeight * 0.35 + 2;

    // Professional Title
    if (personalInfo.jobTitle) {
      this.addText(personalInfo.jobTitle, this.margins.left, this.fonts.title, 'normal', this.colors.secondary);
      this.currentY += this.fonts.title * this.lineHeight * 0.35 + 4;
    }

    // Contact Information - Formatted professionally
    const contactLines = [];

    // Line 1: Email and Phone
    const line1 = [];
    if (personalInfo.email) line1.push(personalInfo.email);
    if (personalInfo.phone) line1.push(personalInfo.phone);
    if (line1.length > 0) contactLines.push({ text: line1.join(' | '), color: this.colors.text });

    // Line 2: GitHub and LinkedIn (in blue)
    const line2 = [];
    if (personalInfo.github) line2.push(personalInfo.github);
    if (personalInfo.linkedin) line2.push(personalInfo.linkedin);
    if (line2.length > 0) contactLines.push({ text: line2.join(' | '), color: [0, 0, 255] }); // Blue color

    // Add contact lines
    contactLines.forEach(lineObj => {
      this.addText(lineObj.text, this.margins.left, this.fonts.small, 'normal', lineObj.color);
      this.currentY += this.fonts.small * this.lineHeight * 0.35 + 1;
    });

    this.currentY += 3;

    // Professional Summary
    if (personalInfo.summary) {
      this.addSectionHeader('Professional Summary');
      this.addMultilineText(
        personalInfo.summary,
        this.margins.left,
        this.pageWidth - this.margins.left - this.margins.right,
        this.fonts.body
      );
      this.currentY += 2;
    }
  }

  private addWorkExperience(cv: CV): void {
    if (cv.workExperience.length === 0) return;

    this.addSectionHeader('Professional Experience');

    cv.workExperience.forEach((exp, index) => {
      this.checkPageBreak(25);

      // Job Title and Company (on same line, different formatting)
      const titleCompanyText = `${exp.jobTitle} • ${exp.company}`;
      this.addText(titleCompanyText, this.margins.left, this.fonts.body, 'bold', this.colors.primary);
      this.currentY += this.fonts.body * this.lineHeight * 0.35 + 1;

      // Date Range only (without location)
      const dateText = exp.isCurrentJob
        ? `${exp.startDate} - Present`
        : `${exp.startDate} - ${exp.endDate || 'Present'}`;

      this.addText(dateText, this.margins.left, this.fonts.small, 'normal', this.colors.secondary);
      this.currentY += this.fonts.small * this.lineHeight * 0.35 + 3;

      // Bullet Points with professional formatting
      exp.bulletPoints.forEach(bullet => {
        this.checkPageBreak(12);

        // Bullet symbol
        this.addText('•', this.margins.left + 3, this.fonts.body, 'normal', this.colors.accent);

        // Bullet text with proper indentation
        this.addMultilineText(
          bullet.text,
          this.margins.left + 8,
          this.pageWidth - this.margins.left - this.margins.right - 8,
          this.fonts.body
        );
        this.currentY += 1;
      });

      if (index < cv.workExperience.length - 1) {
        this.currentY += 4;
      }
    });
  }

  private addEducation(cv: CV): void {
    if (cv.education.length === 0) return;

    this.addSectionHeader('Education');

    cv.education.forEach((edu, index) => {
      this.checkPageBreak(15);

      // Degree and Institution
      const educationText = `${edu.degree} • ${edu.institution}`;
      this.addText(educationText, this.margins.left, this.fonts.body, 'bold', this.colors.primary);
      this.currentY += this.fonts.body * this.lineHeight * 0.35 + 1;

      // Class of Degree on separate line
      if (edu.classOfDegree) {
        const displayGrade = this.mapClassOfDegree(edu.classOfDegree);
        this.addText(displayGrade, this.margins.left, this.fonts.small, 'normal', this.colors.secondary);
        this.currentY += this.fonts.small * this.lineHeight * 0.35 + 1;
      }

      // Details line
      const details = [];
      if (edu.endDate) details.push(edu.endDate);
      if (edu.gpa) details.push(`GPA: ${edu.gpa}`);
      if (edu.location) details.push(edu.location);

      if (details.length > 0) {
        this.addText(details.join('  •  '), this.margins.left, this.fonts.small, 'normal', this.colors.secondary);
        this.currentY += this.fonts.small * this.lineHeight * 0.35;
      }

      if (index < cv.education.length - 1) {
        this.currentY += 3;
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

    this.addSectionHeader('Core Competencies');

    // Group skills by category if available, otherwise just list them
    const skillsText = cv.skills.map(skill => skill.name).join(' • ');
    this.addMultilineText(
      skillsText,
      this.margins.left,
      this.pageWidth - this.margins.left - this.margins.right,
      this.fonts.body
    );
  }

  private addProjects(cv: CV): void {
    if (cv.projects.length === 0) return;

    this.addSectionHeader('Key Projects');

    cv.projects.forEach((project, index) => {
      this.checkPageBreak(20);

      // Project Name
      this.addText(project.name, this.margins.left, this.fonts.body, 'bold', this.colors.primary);
      this.currentY += this.fonts.body * this.lineHeight * 0.35 + 1;

      // Technologies and Timeline
      const details = [];
      if (project.technologies && project.technologies.length > 0) {
        const techString = Array.isArray(project.technologies)
          ? project.technologies.join(', ')
          : project.technologies;
        details.push(`Technologies: ${techString}`);
      }
      if (project.startDate) {
        const dateRange = project.endDate
          ? `${project.startDate} - ${project.endDate}`
          : `${project.startDate} - Present`;
        details.push(dateRange);
      }

      if (details.length > 0) {
        this.addText(details.join('  •  '), this.margins.left, this.fonts.small, 'normal', this.colors.secondary);
        this.currentY += this.fonts.small * this.lineHeight * 0.35 + 2;
      }

      // Project Description
      if (project.description) {
        this.addMultilineText(
          project.description,
          this.margins.left,
          this.pageWidth - this.margins.left - this.margins.right,
          this.fonts.body
        );
        this.currentY += 2;
      }

      // Project URL
      if (project.url) {
        this.addText(`URL: ${project.url}`, this.margins.left, this.fonts.small, 'normal', this.colors.accent);
        this.currentY += this.fonts.small * this.lineHeight * 0.35 + 1;
      }

      if (index < cv.projects.length - 1) {
        this.currentY += 4;
      }
    });
  }

  private addCertifications(cv: CV): void {
    if (cv.certifications.length === 0) return;

    this.addSectionHeader('Certifications');

    cv.certifications.forEach((cert, index) => {
      this.checkPageBreak(12);

      // Certification Name and Issuer
      const certText = `${cert.name} • ${cert.issuer}`;
      this.addText(certText, this.margins.left, this.fonts.body, 'bold', this.colors.primary);
      this.currentY += this.fonts.body * this.lineHeight * 0.35 + 1;

      // Date and Credential details
      const details = [];
      if (cert.date) details.push(cert.date);
      if (cert.credentialId) details.push(`Credential ID: ${cert.credentialId}`);

      if (details.length > 0) {
        this.addText(details.join('  •  '), this.margins.left, this.fonts.small, 'normal', this.colors.secondary);
        this.currentY += this.fonts.small * this.lineHeight * 0.35;
      }

      if (index < cv.certifications.length - 1) {
        this.currentY += 3;
      }
    });
  }

  private addExtracurricular(cv: CV): void {
    if (cv.extracurricular.length === 0) return;

    this.addSectionHeader('Additional Activities');

    cv.extracurricular.forEach((activity, index) => {
      this.checkPageBreak(15);

      // Activity Name and Organization
      const activityText = activity.organization
        ? `${activity.name} • ${activity.organization}`
        : (activity.name || '');
      this.addText(activityText, this.margins.left, this.fonts.body, 'bold', this.colors.primary);
      this.currentY += this.fonts.body * this.lineHeight * 0.35 + 1;

      // Role and Timeline
      const details = [];
      if (activity.role) details.push(activity.role);
      if (activity.startDate) {
        const dateRange = activity.endDate
          ? `${activity.startDate} - ${activity.endDate}`
          : `${activity.startDate} - Present`;
        details.push(dateRange);
      }

      if (details.length > 0) {
        this.addText(details.join('  •  '), this.margins.left, this.fonts.small, 'normal', this.colors.secondary);
        this.currentY += this.fonts.small * this.lineHeight * 0.35 + 1;
      }

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
        this.currentY += 3;
      }
    });
  }

  public generatePDF(cv: CV, fileName?: string): void {
    // Build the complete CV
    this.addPersonalHeader(cv);
    this.addWorkExperience(cv);
    this.addEducation(cv);
    this.addSkills(cv);
    this.addProjects(cv);
    this.addCertifications(cv);
    this.addExtracurricular(cv);

    // Determine filename
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
export const generateEnhancedPDF = (cv: CV, options?: EnhancedPDFOptions): void => {
  const generator = new EnhancedPDFGenerator(options);
  generator.generatePDF(cv, options?.fileName);
};

export const getEnhancedPDFBlob = (cv: CV, options?: EnhancedPDFOptions): Blob => {
  const generator = new EnhancedPDFGenerator(options);
  return generator.getPDFBlob(cv);
};
