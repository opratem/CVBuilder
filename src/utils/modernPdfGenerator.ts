import { jsPDF } from 'jspdf';
import type { CV } from '../types/cv';

export interface ModernPDFOptions {
  fileName?: string;
  includeMetadata?: boolean;
}

export class ModernPDFGenerator {
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

  constructor(options: ModernPDFOptions = {}) {
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
    this.sectionSpacing = 6;

    // Modern template fonts with centered styling
    this.fonts = {
      name: 22,           // Slightly larger for modern look
      title: 13,          // Job title
      sectionHeader: 12,  // Section headers
      body: 10,           // Body text
      small: 9,           // Dates, details
      contact: 10         // Contact information
    };

    if (options.includeMetadata !== false) {
      this.addMetadata();
    }
  }

  private addMetadata(): void {
    this.pdf.setProperties({
      title: 'Modern Professional CV',
      subject: 'Curriculum Vitae - Modern Template',
      author: 'CV Builder',
      keywords: 'cv, resume, professional, modern',
      creator: 'Modern CV Builder'
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
    this.pdf.setFont('times', fontWeight);
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
    this.pdf.setFont('times', fontWeight);
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

    // Modern template: Left-aligned section headers with full underlines
    this.addText(
      title.toUpperCase(),
      this.margins.left,
      this.fonts.sectionHeader,
      'bold',
      'left'
    );
    this.currentY += this.fonts.sectionHeader * this.lineHeight * 0.35;

    // Full-width underline for modern look
    this.pdf.setLineWidth(0.8);
    this.pdf.setDrawColor(0, 0, 0);
    this.pdf.line(
      this.margins.left,
      this.currentY - 1, // Closer to the heading
      this.pageWidth - this.margins.right,
      this.currentY - 1
    );

    this.currentY += 8; // More space before content for better visual hierarchy
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

    // Modern template: Centered name and title
    this.addText(
      personalInfo.fullName || 'Your Name',
      this.pageWidth / 2,
      this.fonts.name,
      'bold',
      'center'
    );
    this.currentY += this.fonts.name * this.lineHeight * 0.35 + 2;

    // Job title - centered
    if (personalInfo.jobTitle) {
      this.addText(
        personalInfo.jobTitle,
        this.pageWidth / 2,
        this.fonts.title,
        'normal',
        'center'
      );
      this.currentY += this.fonts.title * this.lineHeight * 0.35 + 4;
    }

    // Modern template: Contact info wrapped across multiple centered lines if needed
    // Order: Email | Phone | GitHub | LinkedIn (no location, no website)
    const contactInfo = [];
    if (personalInfo.email) contactInfo.push(personalInfo.email);
    if (personalInfo.phone) contactInfo.push(personalInfo.phone);

    const socialLinks = [];
    if (personalInfo.github) socialLinks.push(personalInfo.github);
    if (personalInfo.linkedin) socialLinks.push(personalInfo.linkedin);

    // Render first contact line (email, phone) in black
    if (contactInfo.length > 0) {
      const contactLine = contactInfo.join(' | ');
      this.pdf.setFontSize(this.fonts.contact);
      this.pdf.setFont('times', 'normal');
      this.pdf.setTextColor(0, 0, 0);
      const textWidth = this.pdf.getTextWidth(contactLine);
      this.pdf.text(contactLine, (this.pageWidth - textWidth) / 2, this.currentY);
      this.currentY += this.fonts.contact * this.lineHeight * 0.35;
    }

    // Render second line (GitHub and LinkedIn) in blue
    if (socialLinks.length > 0) {
      const socialLine = socialLinks.join(' | ');
      this.pdf.setFontSize(this.fonts.contact);
      this.pdf.setFont('times', 'normal');
      this.pdf.setTextColor(0, 0, 255); // Blue color for links
      const textWidth = this.pdf.getTextWidth(socialLine);
      this.pdf.text(socialLine, (this.pageWidth - textWidth) / 2, this.currentY);
      this.pdf.setTextColor(0, 0, 0); // Reset to black
      this.currentY += this.fonts.contact * this.lineHeight * 0.35;
    }

    this.currentY += 6;

    // Professional Summary
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

      // Position title and date range
      const startDate = this.formatDate(exp.startDate);
      const endDate = exp.isCurrentJob ? 'Present' : this.formatDate(exp.endDate || '');
      const dateRange = endDate ? `${startDate} - ${endDate}` : startDate;

      this.addText(exp.position, this.margins.left, this.fonts.body, 'bold');

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

      // Company name only (without location)
      this.addText(exp.company, this.margins.left, this.fonts.body, 'normal');
      this.currentY += this.fonts.body * this.lineHeight * 0.35 + 3;

      // Bullet points
      exp.bulletPoints.forEach(bullet => {
        this.checkPageBreak(15);
        this.addText('•', this.margins.left + 3, this.fonts.body);
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

      // Class of Degree on separate line
      if (edu.classOfDegree) {
        const displayGrade = this.mapClassOfDegree(edu.classOfDegree);
        this.addText(displayGrade, this.margins.left, this.fonts.small, 'normal');
        this.currentY += this.fonts.small * this.lineHeight * 0.35 + 1;
      }

      const institutionText = edu.institution;

      this.addText(institutionText, this.margins.left, this.fonts.body, 'normal');
      this.currentY += this.fonts.body * this.lineHeight * 0.35 + 1;

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

      // Project Name (Bold)
      this.addText(project.name, this.margins.left, this.fonts.body, 'bold');
      this.currentY += this.fonts.body * this.lineHeight * 0.35 + 2;

      // Technologies Used
      if (project.technologies && project.technologies.length > 0) {
        const techString = Array.isArray(project.technologies)
          ? project.technologies.join(', ')
          : project.technologies;

        this.pdf.setFontSize(this.fonts.small);
        this.pdf.setFont('times', 'bold');
        this.pdf.text('Technologies: ', this.margins.left, this.currentY);

        this.pdf.setFont('times', 'normal');
        const techLabelWidth = this.pdf.getTextWidth('Technologies: ');
        this.pdf.text(techString, this.margins.left + techLabelWidth, this.currentY);

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

      // Project Link
      if (project.link) {
        this.pdf.setFontSize(this.fonts.small);
        this.pdf.setFont('times', 'bold');
        this.pdf.text('Link: ', this.margins.left, this.currentY);

        this.pdf.setFont('times', 'normal');
        this.pdf.setTextColor(0, 0, 255);
        const linkLabelWidth = this.pdf.getTextWidth('Link: ');
        this.pdf.text(project.link, this.margins.left + linkLabelWidth, this.currentY);
        this.pdf.setTextColor(0, 0, 0);

        this.currentY += this.fonts.small * this.lineHeight * 0.35 + 2;
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
      this.checkPageBreak(20);

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

      this.addText(cert.issuer, this.margins.left, this.fonts.body, 'normal');
      this.currentY += this.fonts.body * this.lineHeight * 0.35;

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

      this.addText(activity.organization, this.margins.left, this.fonts.body, 'normal');
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
        this.currentY += 4;
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
        `${cv.personalInfo.fullName.replace(/\s+/g, '_')}_Modern_CV.pdf` :
        'Modern_CV.pdf');

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
export const generateModernPDF = (cv: CV, options?: ModernPDFOptions): void => {
  const generator = new ModernPDFGenerator(options);
  generator.generatePDF(cv, options?.fileName);
};

export const getModernPDFBlob = (cv: CV, options?: ModernPDFOptions): Blob => {
  const generator = new ModernPDFGenerator(options);
  return generator.getPDFBlob(cv);
};
