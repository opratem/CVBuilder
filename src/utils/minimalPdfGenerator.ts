import { jsPDF } from 'jspdf';
import type { CV } from '../types/cv';

export interface MinimalPDFOptions {
  fileName?: string;
  includeMetadata?: boolean;
}

export class MinimalPDFGenerator {
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

  constructor(options: MinimalPDFOptions = {}) {
    this.pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
      precision: 2
    });

    this.pageWidth = this.pdf.internal.pageSize.getWidth();
    this.pageHeight = this.pdf.internal.pageSize.getHeight();
    // Minimal template: Larger margins for clean, spacious look
    this.margins = { top: 20, right: 20, bottom: 20, left: 20 };
    this.currentY = this.margins.top;
    this.lineHeight = 1.3; // More spacing for minimal clean look
    this.sectionSpacing = 8;

    // Minimal template: Clean typography with more space
    this.fonts = {
      name: 18,           // Smaller name for minimal look
      title: 11,          // Subtle job title
      sectionHeader: 11,  // Understated section headers
      body: 10,           // Standard body text
      small: 9,           // Small details
      contact: 9          // Minimal contact info
    };

    if (options.includeMetadata !== false) {
      this.addMetadata();
    }
  }

  private addMetadata(): void {
    this.pdf.setProperties({
      title: 'Minimal Professional CV',
      subject: 'Curriculum Vitae - Minimal Template',
      author: 'CV Builder',
      keywords: 'cv, resume, professional, minimal',
      creator: 'Minimal CV Builder'
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

    // Minimal template: Simple left-aligned headers with subtle underlines
    this.addText(title.toUpperCase(), this.margins.left, this.fonts.sectionHeader, 'bold');
    this.currentY += this.fonts.sectionHeader * this.lineHeight * 0.35;

    // Subtle underline for minimal template
    this.pdf.setLineWidth(0.5); // Thinner line for minimal look
    this.pdf.setDrawColor(150, 150, 150); // Light gray for subtle effect
    this.pdf.line(
      this.margins.left,
      this.currentY - 1,
      this.pageWidth - this.margins.right,
      this.currentY - 1
    );

    this.currentY += 6; // More space for better visual hierarchy
  }

  private formatDate(dateString: string): string {
    if (!dateString) return '';

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

    // Minimal template: Simple left-aligned name
    this.addText(
      personalInfo.fullName || 'Your Name',
      this.margins.left,
      this.fonts.name,
      'bold',
      'left'
    );
    this.currentY += this.fonts.name * this.lineHeight * 0.35 + 1;

    // Job title - subtle, smaller
    if (personalInfo.jobTitle) {
      this.addText(
        personalInfo.jobTitle,
        this.margins.left,
        this.fonts.title,
        'normal',
        'left'
      );
      this.currentY += this.fonts.title * this.lineHeight * 0.35 + 6;
    }

    // Minimal template: Simple contact info, one per line
    const contactInfo = [];
    if (personalInfo.email) contactInfo.push(personalInfo.email);
    if (personalInfo.phone) contactInfo.push(personalInfo.phone);
    if (personalInfo.location) contactInfo.push(personalInfo.location);
    if (personalInfo.linkedin) contactInfo.push(personalInfo.linkedin);
    if (personalInfo.website) contactInfo.push(personalInfo.website);
    if (personalInfo.github) contactInfo.push(personalInfo.github);

    if (contactInfo.length > 0) {
      contactInfo.forEach(contact => {
        this.addText(contact, this.margins.left, this.fonts.contact, 'normal');
        this.currentY += this.fonts.contact * this.lineHeight * 0.35;
      });
      this.currentY += 6;
    }

    // Professional Summary
    if (personalInfo.summary) {
      this.addSectionHeader('Summary');
      this.addMultilineText(
        personalInfo.summary,
        this.margins.left,
        this.pageWidth - this.margins.left - this.margins.right,
        this.fonts.body
      );
      this.currentY += 6;
    }
  }

  private addWorkExperience(cv: CV): void {
    if (cv.workExperience.length === 0) return;

    this.addSectionHeader('Experience');

    cv.workExperience.forEach((exp, index) => {
      this.checkPageBreak(35);

      const startDate = this.formatDate(exp.startDate);
      const endDate = exp.isCurrentJob ? 'Present' : this.formatDate(exp.endDate || '');
      const dateRange = endDate ? `${startDate} - ${endDate}` : startDate;

      // Minimal: Company and position on same line
      let titleLine = exp.position;
      if (exp.company) {
        titleLine += ` at ${exp.company}`;
      }

      this.addText(titleLine, this.margins.left, this.fonts.body, 'bold');

      if (dateRange) {
        this.addText(
          dateRange,
          this.pageWidth - this.margins.right,
          this.fonts.small,
          'normal',
          'right'
        );
      }
      this.currentY += this.fonts.body * this.lineHeight * 0.35 + 2;

      // Location if provided
      if (exp.location) {
        this.addText(exp.location, this.margins.left, this.fonts.small, 'normal');
        this.currentY += this.fonts.small * this.lineHeight * 0.35 + 2;
      }

      // Bullet points with minimal styling
      exp.bulletPoints.forEach(bullet => {
        this.checkPageBreak(15);
        this.addText('•', this.margins.left + 2, this.fonts.body);
        this.addMultilineText(
          bullet.text,
          this.margins.left + 6,
          this.pageWidth - this.margins.left - this.margins.right - 6,
          this.fonts.body
        );
        this.currentY += 2;
      });

      if (index < cv.workExperience.length - 1) {
        this.currentY += 8; // More space between entries
      }
    });
  }

  private addEducation(cv: CV): void {
    if (cv.education.length === 0) return;

    this.addSectionHeader('Education');

    cv.education.forEach((edu, index) => {
      this.checkPageBreak(25);

      // Minimal: Degree and institution on same line
      let educationLine = edu.degree;
      if (edu.institution) {
        educationLine += ` at ${edu.institution}`;
      }

      this.addText(educationLine, this.margins.left, this.fonts.body, 'bold');

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

      // Class of degree if provided
      if (edu.classOfDegree) {
        const displayGrade = this.mapClassOfDegree(edu.classOfDegree);
        this.addText(displayGrade, this.margins.left, this.fonts.small, 'normal');
        this.currentY += this.fonts.small * this.lineHeight * 0.35 + 1;
      }

      if (index < cv.education.length - 1) {
        this.currentY += 6;
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

    // Minimal: Simple comma-separated list
    const skillsText = cv.skills.map(skill => skill.name).join(', ');
    this.addMultilineText(
      skillsText,
      this.margins.left,
      this.pageWidth - this.margins.left - this.margins.right,
      this.fonts.body
    );
    this.currentY += 4;
  }

  private addProjects(cv: CV): void {
    if (cv.projects.length === 0) return;

    this.addSectionHeader('Projects');

    cv.projects.forEach((project, index) => {
      this.checkPageBreak(30);

      this.addText(project.name, this.margins.left, this.fonts.body, 'bold');
      this.currentY += this.fonts.body * this.lineHeight * 0.35 + 1;

      if (project.description) {
        this.addMultilineText(
          project.description,
          this.margins.left,
          this.pageWidth - this.margins.left - this.margins.right,
          this.fonts.body
        );
        this.currentY += 1;
      }

      if (project.technologies) {
        this.addText(`Tech: ${project.technologies}`, this.margins.left, this.fonts.small, 'normal');
        this.currentY += this.fonts.small * this.lineHeight * 0.35;
      }

      if (project.link) {
        this.addText(project.link, this.margins.left, this.fonts.small, 'normal');
        this.currentY += this.fonts.small * this.lineHeight * 0.35;
      }

      if (index < cv.projects.length - 1) {
        this.currentY += 6;
      }
    });
  }

  private addCertifications(cv: CV): void {
    if (cv.certifications.length === 0) return;

    this.addSectionHeader('Certifications');

    cv.certifications.forEach((cert, index) => {
      this.checkPageBreak(20);

      // Minimal: Certification and issuer on same line
      let certLine = cert.name;
      if (cert.issuer) {
        certLine += ` by ${cert.issuer}`;
      }

      this.addText(certLine, this.margins.left, this.fonts.body, 'bold');

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

      if (cert.credentialId) {
        this.addText(`ID: ${cert.credentialId}`, this.margins.left, this.fonts.small, 'normal');
        this.currentY += this.fonts.small * this.lineHeight * 0.35;
      }

      if (index < cv.certifications.length - 1) {
        this.currentY += 4;
      }
    });
  }

  private addExtracurricular(cv: CV): void {
    if (cv.extracurricular.length === 0) return;

    this.addSectionHeader('Activities');

    cv.extracurricular.forEach((activity, index) => {
      this.checkPageBreak(25);

      const startDate = this.formatDate(activity.startDate);
      const endDate = this.formatDate(activity.endDate);
      const dateRange = endDate ? `${startDate} - ${endDate}` : startDate;

      // Minimal: Title and organization on same line
      let activityLine = activity.title;
      if (activity.organization) {
        activityLine += ` at ${activity.organization}`;
      }

      this.addText(activityLine, this.margins.left, this.fonts.body, 'bold');

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

      if (activity.description) {
        this.addMultilineText(
          activity.description,
          this.margins.left,
          this.pageWidth - this.margins.left - this.margins.right,
          this.fonts.body
        );
      }

      if (index < cv.extracurricular.length - 1) {
        this.currentY += 6;
      }
    });
  }

  public generatePDF(cv: CV, fileName?: string): void {
    this.addPersonalHeader(cv);
    this.addWorkExperience(cv);
    this.addEducation(cv);
    this.addSkills(cv);
    this.addProjects(cv);
    this.addCertifications(cv);
    this.addExtracurricular(cv);

    const finalFileName = fileName ||
      (cv.personalInfo.fullName ?
        `${cv.personalInfo.fullName.replace(/\s+/g, '_')}_Minimal_CV.pdf` :
        'Minimal_CV.pdf');

    this.pdf.save(finalFileName);
  }

  public getPDFBlob(cv: CV): Blob {
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
export const generateMinimalPDF = (cv: CV, options?: MinimalPDFOptions): void => {
  const generator = new MinimalPDFGenerator(options);
  generator.generatePDF(cv, options?.fileName);
};

export const getMinimalPDFBlob = (cv: CV, options?: MinimalPDFOptions): Blob => {
  const generator = new MinimalPDFGenerator(options);
  return generator.getPDFBlob(cv);
};
