import React from 'react';
import Button from './Button';
import ATSVerificationPanel from './ATSVerificationPanel';
import LinkedInExportModal from './LinkedInExportModal';
import { Download, Shield, FileText, FileSpreadsheet } from 'lucide-react';
import { verifyATSCompatibility } from '../../utils/atsVerification';
import { generateTemplatePDF, type TemplatePDFOptions } from '../../utils/templatePdfService';
import { generateDocCV, type DocExportOptions } from '../../utils/docGenerator';
import { downloadPlainTextCV, downloadEmailHTML, downloadJSONExport, type ATSExportOptions } from '../../utils/enhancedExportFormats';
import { useCVStore } from '../../store/cvStore';

const ExportPanel: React.FC = () => {
  const { cv } = useCVStore();
  const [showATSPanel, setShowATSPanel] = React.useState(false);
  const [showLinkedInModal, setShowLinkedInModal] = React.useState(false);
  const [atsResult, setATSResult] = React.useState(() => verifyATSCompatibility(cv));
  const [isExporting, setIsExporting] = React.useState(false);

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
    <>
      {/* Header */}
      <div className="px-5 py-3 border-b border-secondary-light bg-gradient-to-r from-primary-dark to-primary-light">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center mr-3">
            <Download className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-text-primary">ATS Check & Export</h3>
            <p className="text-xs text-text-secondary">Verify and download your CV</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="space-y-3">
          {/* ATS Check Button */}
          <button
            onClick={handleATSCheck}
            type="button"
            style={{
              backgroundColor: '#1A1B26',
              color: '#E5E7EB',
              borderColor: '#4EAA93',
              borderWidth: '2px'
            }}
            className="flex items-center w-full px-4 py-2 rounded-lg border-2 font-medium transition-colors hover:bg-[#252A30] focus:outline-none focus:ring-2 focus:ring-[#4EAA93]"
          >
            <Shield className="w-4 h-4 mr-2" style={{ color: '#4EAA93' }} />
            <span style={{ color: '#E5E7EB' }}>ATS Check ({atsResult.score}%)</span>
          </button>

          {/* Export Options */}
          <div className="bg-secondary rounded-lg border border-secondary-light p-4">
            <h3 className="text-sm font-semibold text-text-primary mb-3 flex items-center">
              <Download className="w-4 h-4 mr-2 text-accent" />
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
            <div className="border-t border-secondary-light pt-3">
              <h4 className="text-xs font-medium text-text-muted mb-2">Enhanced Export Formats</h4>
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
              <div className="text-xs text-center text-accent-light bg-accent/10 p-2 rounded border border-accent/30">
                <strong>PDF:</strong> Professional format, ATS-compatible, ideal for applications
              </div>

              <div className="text-xs text-center text-text-secondary bg-primary/30 p-2 rounded border border-accent/20">
                <strong>Enhanced Formats:</strong> ATS Optimized (keyword-rich), LinkedIn (profile import), Email (styled HTML), JSON (API integration)
              </div>
            </div>
          </div>

          {!atsResult.passed && (
            <div className="text-xs text-center text-text-secondary bg-accent-dark/20 p-2 rounded border border-accent-dark/50">
              ATS Score: {atsResult.score}% - Consider improvements before applying
            </div>
          )}

          {isExporting && (
            <div className="text-xs text-center text-accent-light bg-accent/10 p-2 rounded border border-accent/30">
              Generating high-quality document... Please wait
            </div>
          )}
        </div>

        {showATSPanel && (
          <div className="mt-4">
            <ATSVerificationPanel
              result={atsResult}
              onExportPDF={handleDownloadPDF}
            />
          </div>
        )}
      </div>

      {/* LinkedIn Export Modal */}
      {showLinkedInModal && (
        <LinkedInExportModal onClose={() => setShowLinkedInModal(false)} />
      )}
    </>
  );
};

export default ExportPanel;
