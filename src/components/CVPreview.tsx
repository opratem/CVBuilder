import React from 'react';
import { useCVStore } from '../store/cvStore';
import ModernTemplate from './templates/ModernTemplate';
import ClassicTemplate from './templates/ClassicTemplate';
import MinimalTemplate from './templates/MinimalTemplate';
import ExecutiveTemplate from './templates/ExecutiveTemplate';
import CreativeTemplate from './templates/CreativeTemplate';
import TechTemplate from './templates/TechTemplate';
import AcademicTemplate from './templates/AcademicTemplate';
import Button from './ui/Button';
import ATSVerificationPanel from './ui/ATSVerificationPanel';
import LinkedInExportModal from './ui/LinkedInExportModal';
import { Download, Eye, Shield, FileText, FileSpreadsheet } from 'lucide-react';
import { verifyATSCompatibility } from '../utils/atsVerification';
import { generateTemplatePDF, type TemplatePDFOptions } from '../utils/templatePdfService';
import { generateDocCV, type DocExportOptions } from '../utils/docGenerator';
import { downloadLinkedInProfile, downloadPlainTextCV, downloadEmailHTML, downloadJSONExport, type ATSExportOptions } from '../utils/enhancedExportFormats';

interface CVPreviewProps {
  isMobile?: boolean;
}

const CVPreview: React.FC<CVPreviewProps> = ({ isMobile = false }) => {
  const { cv } = useCVStore();
  const [showPreview, setShowPreview] = React.useState(!isMobile);
  const [showATSPanel, setShowATSPanel] = React.useState(false);
  const [showLinkedInModal, setShowLinkedInModal] = React.useState(false);
  const [atsResult, setATSResult] = React.useState(() => verifyATSCompatibility(cv));
  const [isExporting, setIsExporting] = React.useState(false);

  const renderTemplate = () => {
    switch (cv.templateId) {
      case 'modern':
        return <ModernTemplate cv={cv} />;
      case 'classic':
        return <ClassicTemplate cv={cv} />;
      case 'minimal':
        return <MinimalTemplate cv={cv} />;
      case 'executive':
        return <ExecutiveTemplate cv={cv} />;
      case 'creative':
        return <CreativeTemplate cv={cv} />;
      case 'tech':
        return <TechTemplate cv={cv} />;
      case 'academic':
        return <AcademicTemplate cv={cv} />;
      default:
        return <ModernTemplate cv={cv} />;
    }
  };

  // Update ATS result when CV changes
  React.useEffect(() => {
    setATSResult(verifyATSCompatibility(cv));
  }, [cv]);

  const handleDownloadPDF = async () => {
    setIsExporting(true);

    try {
      const fileName = cv.personalInfo.fullName
        ? `${cv.personalInfo.fullName.replace(/\s+/g, '_')}_Professional_CV.pdf`
        : 'Professional_CV.pdf';

      // Generate template-specific PDF that matches the preview
      const pdfOptions: TemplatePDFOptions = {
        fileName,
        includeMetadata: true
      };

      generateTemplatePDF(cv, pdfOptions);

    } catch (error) {
      console.error('PDF generation failed:', error);
      alert('PDF generation failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadDOC = async () => {
    setIsExporting(true);

    try {
      const fileName = cv.personalInfo.fullName
        ? `${cv.personalInfo.fullName.replace(/\s+/g, '_')}_Professional_CV.docx`
        : 'Professional_CV.docx';

      const docOptions: DocExportOptions = {
        fileName,
        includeMetadata: true,
        templateStyle: cv.templateId as 'modern' | 'classic' | 'minimal'
      };

      const result = await generateDocCV(cv, docOptions);

      if (!result.success) {
        alert(`DOC generation failed: ${result.error}`);
      }

    } catch (error) {
      console.error('DOC generation failed:', error);
      alert('DOC generation failed. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleATSCheck = () => {
    setShowATSPanel(!showATSPanel);
  };

  const handleDownloadLinkedIn = () => {
    try {
      const fileName = cv.personalInfo.fullName
        ? `${cv.personalInfo.fullName.replace(/\s+/g, '_')}_LinkedIn_Profile.json`
        : 'LinkedIn_Profile.json';
      downloadLinkedInProfile(cv, fileName);
    } catch (error) {
      console.error('Error generating LinkedIn format:', error);
      alert('Failed to generate LinkedIn format. Please try again.');
    }
  };

  const handleDownloadPlainText = (optimized = true) => {
    try {
      const fileName = cv.personalInfo.fullName
        ? `${cv.personalInfo.fullName.replace(/\s+/g, '_')}_ATS_Resume.txt`
        : 'ATS_Resume.txt';

      const options: ATSExportOptions = {
        format: optimized ? 'keyword-optimized' : 'plain',
        includeKeywords: optimized,
        optimizeForJobTitle: cv.personalInfo.jobTitle
      };

      downloadPlainTextCV(cv, fileName, options);
    } catch (error) {
      console.error('Error generating plain text format:', error);
      alert('Failed to generate plain text format. Please try again.');
    }
  };

  const handleDownloadHTML = (darkMode = false) => {
    try {
      const fileName = cv.personalInfo.fullName
        ? `${cv.personalInfo.fullName.replace(/\s+/g, '_')}_Email_Resume.html`
        : 'Email_Resume.html';
      downloadEmailHTML(cv, fileName, { darkMode });
    } catch (error) {
      console.error('Error generating HTML format:', error);
      alert('Failed to generate HTML format. Please try again.');
    }
  };

  const handleDownloadJSON = () => {
    try {
      const fileName = cv.personalInfo.fullName
        ? `${cv.personalInfo.fullName.replace(/\s+/g, '_')}_CV_Export.json`
        : 'CV_Export.json';
      downloadJSONExport(cv, fileName);
    } catch (error) {
      console.error('Error generating JSON export:', error);
      alert('Failed to generate JSON export. Please try again.');
    }
  };

  return (
    <div className="flex flex-col">
      {isMobile && (
        <div className="mb-4">
          <Button
            variant="outline"
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center"
            fullWidth
          >
            <Eye className="w-4 h-4 mr-2" />
            {showPreview ? 'Hide Preview' : 'Show Preview'}
          </Button>
        </div>
      )}

      {showPreview && (
        <>
          <div className="mb-4 space-y-3">
            {/* ATS Check Button */}
            <Button
              onClick={handleATSCheck}
              variant="outline"
              className="flex items-center w-full"
            >
              <Shield className="w-4 h-4 mr-2" />
              ATS Check ({atsResult.score}%)
            </Button>

            {/* Export Options */}
            <div className="bg-white rounded-lg border p-4">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                <Download className="w-4 h-4 mr-2" />
                Export Options
              </h3>

              {/* Primary Formats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                <Button
                  onClick={handleDownloadPDF}
                  disabled={isExporting}
                  className="flex items-center justify-center"
                  variant={atsResult.passed ? "primary" : "outline"}
                >
                  <FileText className="w-4 h-4 mr-2" />
                  {isExporting ? 'Generating...' : 'Download PDF'}
                </Button>

                <Button
                  onClick={handleDownloadDOC}
                  disabled={isExporting}
                  className="flex items-center justify-center"
                  variant="outline"
                >
                  <FileSpreadsheet className="w-4 h-4 mr-2" />
                  {isExporting ? 'Generating...' : 'Download DOC'}
                </Button>
              </div>

              {/* Enhanced Export Formats */}
              <div className="border-t pt-3">
                <h4 className="text-xs font-medium text-gray-600 mb-2">Enhanced Export Formats</h4>
                <div className="grid grid-cols-2 gap-2 mb-2">
                  <Button
                    onClick={() => handleDownloadPlainText(true)}
                    variant="outline"
                    className="text-xs py-1.5"
                  >
                    ATS Optimized
                  </Button>
                  <Button
                    onClick={() => handleDownloadPlainText(false)}
                    variant="outline"
                    className="text-xs py-1.5"
                  >
                    Plain Text
                  </Button>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <Button
                    onClick={() => setShowLinkedInModal(true)}
                    variant="outline"
                    className="text-xs py-1.5"
                  >
                    LinkedIn
                  </Button>
                  <Button
                    onClick={() => handleDownloadHTML(false)}
                    variant="outline"
                    className="text-xs py-1.5"
                  >
                    Email HTML
                  </Button>
                  <Button
                    onClick={handleDownloadJSON}
                    variant="outline"
                    className="text-xs py-1.5"
                  >
                    JSON API
                  </Button>
                </div>
              </div>

              <div className="mt-3 space-y-2">
                <div className="text-xs text-center text-green-600 bg-green-50 p-2 rounded border border-green-200">
                  <strong>PDF:</strong> Professional format, ATS-compatible, ideal for applications
                </div>

                <div className="text-xs text-center text-blue-600 bg-blue-50 p-2 rounded border border-blue-200">
                  <strong>Enhanced Formats:</strong> ATS Optimized (keyword-rich), LinkedIn (profile import), Email (styled HTML), JSON (API integration)
                </div>
              </div>
            </div>

            {!atsResult.passed && (
              <div className="text-xs text-center text-amber-600 bg-amber-50 p-2 rounded border border-amber-200">
                ATS Score: {atsResult.score}% - Consider improvements before applying
              </div>
            )}

            {isExporting && (
              <div className="text-xs text-center text-purple-600 bg-purple-50 p-2 rounded border border-purple-200">
                Generating high-quality document... Please wait
              </div>
            )}
          </div>

          {showATSPanel && (
            <div className="mb-4">
              <ATSVerificationPanel
                result={atsResult}
                onExportPDF={handleDownloadPDF}
              />
            </div>
          )}

          <div className="bg-gray-100 p-4 rounded-lg overflow-auto">
            <div className="transform scale-[0.8] origin-top">
              {renderTemplate()}
            </div>
          </div>
        </>
      )}

      {/* LinkedIn Export Modal */}
      {showLinkedInModal && (
        <LinkedInExportModal onClose={() => setShowLinkedInModal(false)} />
      )}
    </div>
  );
};

export default CVPreview;
