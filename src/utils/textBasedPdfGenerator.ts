import { jsPDF } from 'jspdf';
import type { CV } from '../types/cv';

export interface PDFGenerationOptions {
  fileName?: string;
  pageMargins?: { top: number; right: number; bottom: number; left: number };
  fontSizes?: {
    name: number;
    title: number;
    sectionHeader: number;
    body: number;
    small: number;
  };
  colors?: {
    primary: string;
    text: string;
    accent: string;
  };
}

export class TextBasedPDFGenerator {
  private pdf: jsPDF;
  private currentY: number;
  private pageWidth: number;
  private pageHeight: number;
  private margins: { top: number; right: number; bottom: number; left: number };
  private fontSizes: any;
  private colors: any;
  private lineHeight: number;

  constructor(options: PDFGenerationOptions = {}) {
    this.pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    this.pageWidth = this.pdf.internal.pageSize.getWidth();
    this.pageHeight = this.pdf.internal.pageSize.getHeight();

    this.margins = options.pageMargins || { top: 20, right: 20, bottom: 20, left: 20 };
    this.fontSizes = options.fontSizes || {
      name: 22,
      title: 12,
      sectionHeader: 14,
      body: 10,
      small: 9
    };
    this.colors = options.colors || {
      primary: '#1f2937',
      text: '#374151',
      accent: '#3b82f6'
    };

    this.currentY = this.margins.top;
    this.lineHeight = 1.4;
  }

  private checkPageBreak(additionalHeight = 10): void {
    if (this.currentY + additionalHeight > this.pageHeight - this.margins.bottom) {
      this.pdf.addPage();
      this.currentY = this.margins.top;
    }
  }

  private setFont(size: number, style: 'normal' | 'bold' = 'normal'): void {
    this.pdf.setFontSize(size);
    this.pdf.setFont('helvetica', style);
  }

  private addText(text: string, x: number, fontSize: number, style: 'normal' | 'bold' = 'normal', color: string = this.colors.text): void {
    this.setFont(fontSize, style);
    this.pdf.setTextColor(color);
    this.pdf.text(text, x, this.currentY);
  }

  private addWrappedText(text: string, x: number, maxWidth: number, fontSize: number, style: 'normal' | 'bold' = 'normal'): void {
    this.setFont(fontSize, style);
    const lines = this.pdf.splitTextToSize(text, maxWidth);

    for (const line of lines) {
      this.checkPageBreak();
      this.pdf.text(line, x, this.currentY);
      this.currentY += fontSize * this.lineHeight * 0.35;
    }
  }

  private addSection(title: string): void {
    this.checkPageBreak(15);
    this.currentY += 5;

    // Add section divider line
    this.pdf.setLineWidth(0.5);
    this.pdf.setDrawColor(this.colors.accent);
    this.pdf.line(this.margins.left, this.currentY, this.pageWidth - this.margins.right, this.currentY);
    this.currentY += 3;

    // Add section title
    this.addText(title.toUpperCase(), this.margins.left, this.fontSizes.sectionHeader, 'bold', this.colors.primary);
    this.currentY += this.fontSizes.sectionHeader * this.lineHeight * 0.35 + 3;
  }

  private addPersonalInfo(cv: CV): void {
    const { personalInfo } = cv;

    // Name
    this.addText(personalInfo.fullName, this.margins.left, this.fontSizes.name, 'bold', this.colors.primary);
    this.currentY += this.fontSizes.name * this.lineHeight * 0.35;

    // Job Title
    if (personalInfo.jobTitle) {
      this.addText(personalInfo.jobTitle, this.margins.left, this.fontSizes.title, 'normal', this.colors.accent);
      this.currentY += this.fontSizes.title * this.lineHeight * 0.35 + 2;
    }

    // Contact Information
    const contactInfo = [];
    if (personalInfo.email) contactInfo.push(`Email: ${personalInfo.email}`);
    if (personalInfo.phone) contactInfo.push(`Phone: ${personalInfo.phone}`);
    if (personalInfo.location) contactInfo.push(`Location: ${personalInfo.location}`);
    if (personalInfo.linkedin) contactInfo.push(`LinkedIn: ${personalInfo.linkedin}`);
    if (personalInfo.website) contactInfo.push(`Website: ${personalInfo.website}`);

    const contactText = contactInfo.join(' | ');
    if (contactText) {
      this.addWrappedText(contactText, this.margins.left, this.pageWidth - this.margins.left - this.margins.right, this.fontSizes.body);
      this.currentY += 3;
    }

    // Professional Summary
    if (personalInfo.summary) {
      this.addSection('Professional Summary');
      this.addWrappedText(personalInfo.summary, this.margins.left, this.pageWidth - this.margins.left - this.margins.right, this.fontSizes.body);
      this.currentY += 3;
    }
  }

  private addWorkExperience(cv: CV): void {
    if (cv.workExperience.length === 0) return;

    this.addSection('Professional Experience');

    cv.workExperience.forEach((exp, index) => {
      this.checkPageBreak(20);

      // Job Title and Company
      const titleText = `${exp.jobTitle} at ${exp.company}`;
      this.addText(titleText, this.margins.left, this.fontSizes.body, 'bold', this.colors.primary);
      this.currentY += this.fontSizes.body * this.lineHeight * 0.35;

      // Date and Location
      const dateText = exp.isCurrentJob
        ? `${exp.startDate} - Present`
        : `${exp.startDate} - ${exp.endDate || 'Present'}`;
      const locationText = exp.location ? ` | ${exp.location}` : '';
      this.addText(dateText + locationText, this.margins.left, this.fontSizes.small, 'normal', this.colors.text);
      this.currentY += this.fontSizes.small * this.lineHeight * 0.35 + 2;

      // Bullet Points
      exp.bulletPoints.forEach(bullet => {
        this.checkPageBreak(8);
        this.addText('•', this.margins.left + 5, this.fontSizes.body);
        this.addWrappedText(bullet.text, this.margins.left + 10, this.pageWidth - this.margins.left - this.margins.right - 15, this.fontSizes.body);
        this.currentY += 1;
      });

      if (index < cv.workExperience.length - 1) {
        this.currentY += 3;
      }
    });
  }

  private addEducation(cv: CV): void {
    if (cv.education.length === 0) return;

    this.addSection('Education');

    cv.education.forEach((edu, index) => {
      this.checkPageBreak(15);

      // Degree and Institution
      const degreeText = `${edu.degree} - ${edu.institution}`;
      this.addText(degreeText, this.margins.left, this.fontSizes.body, 'bold', this.colors.primary);
      this.currentY += this.fontSizes.body * this.lineHeight * 0.35;

      // Class of Degree on separate line
      if (edu.classOfDegree) {
        const displayGrade = this.mapClassOfDegree(edu.classOfDegree);
        this.addText(displayGrade, this.margins.left, this.fontSizes.small, 'normal', this.colors.text);
        this.currentY += this.fontSizes.small * this.lineHeight * 0.35;
      }

      // Date and GPA
      const details = [];
      if (edu.endDate) details.push(edu.endDate);
      if (edu.gpa) details.push(`GPA: ${edu.gpa}`);
      if (edu.location) details.push(edu.location);

      if (details.length > 0) {
        this.addText(details.join(' | '), this.margins.left, this.fontSizes.small, 'normal', this.colors.text);
        this.currentY += this.fontSizes.small * this.lineHeight * 0.35;
      }

      if (index < cv.education.length - 1) {
        this.currentY += 3;
      }
    });
  }

  private addSkills(cv: CV): void {
    if (cv.skills.length === 0) return;

    this.addSection('Skills');

    const skillsText = cv.skills.map(skill => skill.name).join(' • ');
    this.addWrappedText(skillsText, this.margins.left, this.pageWidth - this.margins.left - this.margins.right, this.fontSizes.body);
  }

  private addProjects(cv: CV): void {
    if (cv.projects.length === 0) return;

    this.addSection('Projects');

    cv.projects.forEach((project, index) => {
      this.checkPageBreak(15);

      // Project Name
      this.addText(project.name, this.margins.left, this.fontSizes.body, 'bold', this.colors.primary);
      this.currentY += this.fontSizes.body * this.lineHeight * 0.35;

      // Technologies and Date
      const details = [];
      if (project.technologies) details.push(`Technologies: ${project.technologies}`);
      if (project.startDate) {
        const dateRange = project.endDate
          ? `${project.startDate} - ${project.endDate}`
          : `${project.startDate} - Present`;
        details.push(dateRange);
      }

      if (details.length > 0) {
        this.addText(details.join(' | '), this.margins.left, this.fontSizes.small, 'normal', this.colors.text);
        this.currentY += this.fontSizes.small * this.lineHeight * 0.35 + 1;
      }

      // Description
      if (project.description) {
        this.addWrappedText(project.description, this.margins.left, this.pageWidth - this.margins.left - this.margins.right, this.fontSizes.body);
      }

      // Project URL
      if (project.url) {
        this.addText(`URL: ${project.url}`, this.margins.left, this.fontSizes.small, 'normal', this.colors.accent);
        this.currentY += this.fontSizes.small * this.lineHeight * 0.35;
      }

      if (index < cv.projects.length - 1) {
        this.currentY += 3;
      }
    });
  }

  private addCertifications(cv: CV): void {
    if (cv.certifications.length === 0) return;

    this.addSection('Certifications');

    cv.certifications.forEach((cert, index) => {
      this.checkPageBreak(10);

      // Certification Name and Issuer
      const certText = `${cert.name} - ${cert.issuer}`;
      this.addText(certText, this.margins.left, this.fontSizes.body, 'bold', this.colors.primary);
      this.currentY += this.fontSizes.body * this.lineHeight * 0.35;

      // Date and Credential ID
      const details = [];
      if (cert.date) details.push(cert.date);
      if (cert.credentialId) details.push(`ID: ${cert.credentialId}`);

      if (details.length > 0) {
        this.addText(details.join(' | '), this.margins.left, this.fontSizes.small, 'normal', this.colors.text);
        this.currentY += this.fontSizes.small * this.lineHeight * 0.35;
      }

      if (index < cv.certifications.length - 1) {
        this.currentY += 2;
      }
    });
  }

  private addExtracurricular(cv: CV): void {
    if (cv.extracurricular.length === 0) return;

    this.addSection('Extracurricular Activities');

    cv.extracurricular.forEach((activity, index) => {
      this.checkPageBreak(10);

      // Activity Name and Organization
      const activityText = activity.organization
        ? `${activity.name} - ${activity.organization}`
        : activity.name;
      this.addText(activityText, this.margins.left, this.fontSizes.body, 'bold', this.colors.primary);
      this.currentY += this.fontSizes.body * this.lineHeight * 0.35;

      // Date and Role
      const details = [];
      if (activity.role) details.push(activity.role);
      if (activity.startDate) {
        const dateRange = activity.endDate
          ? `${activity.startDate} - ${activity.endDate}`
          : `${activity.startDate} - Present`;
        details.push(dateRange);
      }

      if (details.length > 0) {
        this.addText(details.join(' | '), this.margins.left, this.fontSizes.small, 'normal', this.colors.text);
        this.currentY += this.fontSizes.small * this.lineHeight * 0.35;
      }

      // Description
      if (activity.description) {
        this.addWrappedText(activity.description, this.margins.left, this.pageWidth - this.margins.left - this.margins.right, this.fontSizes.body);
      }

      if (index < cv.extracurricular.length - 1) {
        this.currentY += 3;
      }
    });
  }

  public generatePDF(cv: CV, fileName?: string): void {
    // Add all sections
    this.addPersonalInfo(cv);
    this.addWorkExperience(cv);
    this.addEducation(cv);
    this.addSkills(cv);
    this.addProjects(cv);
    this.addCertifications(cv);
    this.addExtracurricular(cv);

    // Save the PDF
    const finalFileName = fileName ||
      (cv.personalInfo.fullName ?
        `${cv.personalInfo.fullName.replace(/\s+/g, '_')}_CV.pdf` :
        'CV.pdf');

    this.pdf.save(finalFileName);
  }

  public getPDFBlob(cv: CV): Blob {
    // Generate PDF content
    this.addPersonalInfo(cv);
    this.addWorkExperience(cv);
    this.addEducation(cv);
    this.addSkills(cv);
    this.addProjects(cv);
    this.addCertifications(cv);
    this.addExtracurricular(cv);

    return this.pdf.output('blob');
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
}

export const generateTextBasedPDF = (cv: CV, options?: PDFGenerationOptions): void => {
  const generator = new TextBasedPDFGenerator(options);
  generator.generatePDF(cv, options?.fileName);
};

export const getTextBasedPDFBlob = (cv: CV, options?: PDFGenerationOptions): Blob => {
  const generator = new TextBasedPDFGenerator(options);
  return generator.getPDFBlob(cv);
};
