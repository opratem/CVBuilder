import type React from 'react';
import { useState, useRef } from 'react';
import { useCVStore } from '../../store/cvStore';
import Button from '../ui/Button';
import Input from '../ui/Input';
import TextArea from '../ui/TextArea';
import Card from '../ui/Card';
import LinkedInImportService, {
  type LinkedInImportData,
  type LinkedInProfileData,
  type LinkedInImportResult,
  LINKEDIN_IMPORT_GUIDE
} from '../../utils/linkedinImportService';
import { Linkedin, Upload, CheckCircle, AlertTriangle, Info, X, FileText, Download } from 'lucide-react';

interface LinkedInImportProps {
  onClose?: () => void;
}

const LinkedInImport: React.FC<LinkedInImportProps> = ({ onClose }) => {
  const { cv, updateCV } = useCVStore();
  const [importStep, setImportStep] = useState<'guide' | 'manual' | 'file' | 'review' | 'complete'>('guide');
  const [manualData, setManualData] = useState<Partial<LinkedInProfileData>>({});
  const [importData, setImportData] = useState<LinkedInImportData | null>(null);
  const [importResult, setImportResult] = useState<LinkedInImportResult | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleManualDataChange = (field: keyof LinkedInProfileData, value: string) => {
    setManualData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadedFile(file);
    setIsProcessing(true);

    try {
      const result = await LinkedInImportService.processLinkedInFile(file);
      setImportResult(result);

      if (result.success && result.data) {
        setImportData(result.data);
        setImportStep('review');
      } else {
        // Show errors but stay on file upload step
        setImportStep('file');
      }
    } catch (error) {
      setImportResult({
        success: false,
        errors: ['Failed to process file. Please try again or use manual import.'],
        warnings: [],
        suggestions: []
      });
      setImportStep('file');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleParseManualData = () => {
    try {
      const result = LinkedInImportService.parseLinkedInData(manualData as LinkedInProfileData);
      setImportResult(result);

      if (result.success && result.data) {
        setImportData(result.data);
        setImportStep('review');
      } else {
        // Show validation errors on manual step
      }
    } catch (error) {
      console.error('Error parsing LinkedIn data:', error);
      setImportResult({
        success: false,
        errors: ['Failed to parse your information. Please check and try again.'],
        warnings: [],
        suggestions: []
      });
    }
  };

  const handleApplyImport = () => {
    if (!importData) return;

    try {
      const updatedCV = LinkedInImportService.applyLinkedInImport(cv, importData);
      updateCV(updatedCV);
      setImportStep('complete');
    } catch (error) {
      console.error('Error applying LinkedIn import:', error);
      setImportResult({
        success: false,
        errors: ['Failed to apply import. Please try again.'],
        warnings: [],
        suggestions: []
      });
    }
  };

  const renderGuideStep = () => (
    <div className="space-y-6">
      <div className="text-center">
        <Linkedin className="w-12 h-12 text-blue-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Import from LinkedIn</h2>
        <p className="text-gray-600">
          Quickly fill your CV with information from your LinkedIn profile
        </p>
      </div>

      <div className="bg-teal-900/20 border border-teal-700/50 rounded-lg p-4">
        <h3 className="font-semibold text-white mb-2">{LINKEDIN_IMPORT_GUIDE.title}</h3>
        <div className="space-y-3">
          {LINKEDIN_IMPORT_GUIDE.steps.map((step, index) => (
            <div key={index} className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-teal-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                {index + 1}
              </div>
              <div>
                <h4 className="font-medium text-white">{step.title}</h4>
                <p className="text-gray-200 text-sm">{step.description}</p>
                <p className="text-gray-300 text-xs mt-1">{step.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-4 hover:shadow-md transition-shadow">
          <div className="text-center space-y-3">
            <Upload className="w-8 h-8 text-green-600 mx-auto" />
            <h3 className="font-semibold text-gray-900">Upload LinkedIn Data</h3>
            <p className="text-gray-600 text-sm">
              Upload your LinkedIn data export or resume file
            </p>
            <div className="text-xs text-gray-500">
              <p className="font-medium mb-1">Supported formats:</p>
              <ul className="space-y-0.5">
                {LINKEDIN_IMPORT_GUIDE.fileFormats.map((format, index) => (
                  <li key={index}>• {format}</li>
                ))}
              </ul>
            </div>
            <Button
              onClick={() => setImportStep('file')}
              variant="primary"
              className="w-full"
            >
              Upload File
            </Button>
          </div>
        </Card>

        <Card className="p-4 hover:shadow-md transition-shadow">
          <div className="text-center space-y-3">
            <FileText className="w-8 h-8 text-blue-600 mx-auto" />
            <h3 className="font-semibold text-gray-900">Manual Import</h3>
            <p className="text-gray-600 text-sm">
              Manually copy information from your LinkedIn profile
            </p>
            <div className="text-xs text-gray-500">
              <p className="font-medium mb-1">Best for:</p>
              <ul className="space-y-0.5">
                <li>• Quick profile updates</li>
                <li>• Selective information import</li>
                <li>• When you don't have data export</li>
              </ul>
            </div>
            <Button
              onClick={() => setImportStep('manual')}
              variant="outline"
              className="w-full"
            >
              Start Manual Import
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );

  const renderFileUploadStep = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Upload LinkedIn Data</h2>
        <Button
          onClick={() => setImportStep('guide')}
          variant="outline"
          size="sm"
        >
          Back to Guide
        </Button>
      </div>

      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileUpload}
          accept=".json,.csv,.pdf,.docx,.txt,.zip"
          className="hidden"
          disabled={isProcessing}
        />

        <div className="space-y-4">
          <Upload className="w-12 h-12 text-gray-400 mx-auto" />
          <div>
            <h3 className="text-lg font-medium text-gray-900">Choose a file to upload</h3>
            <p className="text-gray-600 text-sm mt-1">
              Drag and drop your LinkedIn data file here, or click to browse
            </p>
          </div>

          <Button
            onClick={() => fileInputRef.current?.click()}
            variant="primary"
            disabled={isProcessing}
            className="mx-auto"
          >
            {isProcessing ? 'Processing...' : 'Select File'}
          </Button>

          <div className="text-xs text-gray-500">
            <p className="font-medium">Supported formats:</p>
            <p>JSON, CSV, PDF, Word Document, Text file, ZIP</p>
          </div>
        </div>
      </div>

      {uploadedFile && (
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <FileText className="w-5 h-5 text-blue-600" />
            <div className="flex-1">
              <p className="font-medium text-gray-900">{uploadedFile.name}</p>
              <p className="text-sm text-gray-600">
                {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
            {isProcessing && (
              <div className="text-blue-600 text-sm">Processing...</div>
            )}
          </div>
        </Card>
      )}

      {importResult && !importResult.success && (
        <Card className="p-4">
          <div className="space-y-3">
            {importResult.errors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                  <h4 className="font-medium text-red-900">Upload Issues</h4>
                </div>
                <ul className="text-red-700 text-sm space-y-1">
                  {importResult.errors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            )}

            {importResult.suggestions.length > 0 && (
              <div className="bg-teal-900/20 border border-teal-700/50 rounded-lg p-3">
                <div className="flex items-center space-x-2 mb-2">
                  <Info className="w-4 h-4 text-teal-400" />
                  <h4 className="font-medium text-white">Suggestions</h4>
                </div>
                <ul className="text-gray-200 text-sm space-y-1">
                  {importResult.suggestions.map((suggestion, index) => (
                    <li key={index}>• {suggestion}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex space-x-3">
              <Button
                onClick={() => fileInputRef.current?.click()}
                variant="primary"
                className="flex-1"
              >
                Try Another File
              </Button>
              <Button
                onClick={() => setImportStep('manual')}
                variant="outline"
              >
                Use Manual Import
              </Button>
            </div>
          </div>
        </Card>
      )}

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Download className="w-5 h-5 text-amber-600 mt-0.5" />
          <div>
            <h4 className="font-medium text-amber-900">How to get your LinkedIn data</h4>
            <ol className="text-amber-700 text-sm mt-2 space-y-1 list-decimal list-inside">
              <li>Go to LinkedIn Settings & Privacy</li>
              <li>Click "Data Privacy" in the left sidebar</li>
              <li>Select "Get a copy of your data"</li>
              <li>Choose "Want something in particular? Select the data files you're most interested in"</li>
              <li>Select "Profile", "Connections", "Skills", and "Positions"</li>
              <li>Click "Request archive" and wait for the download link via email</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );

  const renderManualStep = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Manual LinkedIn Import</h2>
        <Button
          onClick={() => setImportStep('guide')}
          variant="outline"
          size="sm"
        >
          Back to Guide
        </Button>
      </div>

      {importResult && !importResult.success && (
        <Card className="p-4">
          {importResult.errors.length > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-3">
              <div className="flex items-center space-x-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-red-600" />
                <h4 className="font-medium text-red-900">Please fix these issues:</h4>
              </div>
              <ul className="text-red-700 text-sm space-y-1">
                {importResult.errors.map((error, index) => (
                  <li key={index}>• {error}</li>
                ))}
              </ul>
            </div>
          )}
        </Card>
      )}

      <div className="grid gap-6">
        {/* Basic Information */}
        <Card className="p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="First Name"
              value={manualData.firstName || ''}
              onChange={(e) => handleManualDataChange('firstName', e.target.value)}
              placeholder="Your first name"
              required
            />
            <Input
              label="Last Name"
              value={manualData.lastName || ''}
              onChange={(e) => handleManualDataChange('lastName', e.target.value)}
              placeholder="Your last name"
              required
            />
          </div>
          <Input
            label="Professional Headline"
            value={manualData.headline || ''}
            onChange={(e) => handleManualDataChange('headline', e.target.value)}
            placeholder="e.g., Software Engineer | Full-Stack Developer"
            className="mt-4"
          />
          <TextArea
            label="Summary/About"
            value={manualData.summary || ''}
            onChange={(e) => handleManualDataChange('summary', e.target.value)}
            placeholder="Your professional summary from LinkedIn"
            rows={4}
            className="mt-4"
          />
        </Card>

        {/* Contact Information */}
        <Card className="p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Contact Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Email Address"
              type="email"
              value={manualData.emailAddress || ''}
              onChange={(e) => handleManualDataChange('emailAddress', e.target.value)}
              placeholder="your.email@example.com"
            />
            <Input
              label="Location"
              value={manualData.location?.name || ''}
              onChange={(e) => handleManualDataChange('location', e.target.value)}
              placeholder="City, Country"
            />
          </div>
          <Input
            label="LinkedIn Profile URL"
            value={manualData.publicProfileUrl || ''}
            onChange={(e) => handleManualDataChange('publicProfileUrl', e.target.value)}
            placeholder="https://linkedin.com/in/yourprofile"
            className="mt-4"
          />
        </Card>

        {/* Instructions */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Info className="w-5 h-5 text-amber-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-amber-900">How to find this information</h4>
              <ul className="text-amber-700 text-sm mt-2 space-y-1">
                <li>• Open your LinkedIn profile in a web browser</li>
                <li>• Copy and paste the information from your profile sections</li>
                <li>• Your work experience and education can be added in the next step</li>
                <li>• Skills will be imported and suggested based on your profile</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex space-x-3">
          <Button
            onClick={handleParseManualData}
            variant="primary"
            className="flex-1"
            disabled={!manualData.firstName || !manualData.lastName}
          >
            Continue to Review
          </Button>
          <Button
            onClick={() => setImportStep('guide')}
            variant="outline"
          >
            Cancel
          </Button>
        </div>
      </div>
    </div>
  );

  const renderReviewStep = () => {
    if (!importData || !importResult) return null;

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Review Import Data</h2>
          <div className="flex items-center space-x-2">
            {importResult.data && 'completeness' in importResult && typeof importResult.completeness === 'number' && (
              <div className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                {importResult.completeness}% Complete
              </div>
            )}
            <Button
              onClick={() => setImportStep(uploadedFile ? 'file' : 'manual')}
              variant="outline"
              size="sm"
            >
              Edit
            </Button>
          </div>
        </div>

        {/* Validation Alerts */}
        {importResult.errors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <h3 className="font-medium text-red-900">Issues Found</h3>
            </div>
            <ul className="text-red-700 text-sm space-y-1">
              {importResult.errors.map((error, index) => (
                <li key={index}>• {error}</li>
              ))}
            </ul>
          </div>
        )}

        {importResult.warnings.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              <h3 className="font-medium text-amber-900">Warnings</h3>
            </div>
            <ul className="text-amber-700 text-sm space-y-1">
              {importResult.warnings.map((warning, index) => (
                <li key={index}>• {warning}</li>
              ))}
            </ul>
          </div>
        )}

        {importResult.suggestions.length > 0 && (
          <div className="bg-teal-900/20 border border-teal-700/50 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Info className="w-5 h-5 text-teal-600" />
              <h3 className="font-medium text-white">Suggestions</h3>
            </div>
            <ul className="text-gray-200 text-sm space-y-1">
              {importResult.suggestions.map((suggestion, index) => (
                <li key={index}>• {suggestion}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Preview of imported data */}
        <div className="grid gap-4">
          {importData.personalInfo && (
            <Card className="p-4">
              <h3 className="font-semibold text-gray-900 mb-2">Personal Information</h3>
              <div className="text-sm text-gray-600 space-y-1">
                {importData.personalInfo.fullName && (
                  <p><strong>Name:</strong> {importData.personalInfo.fullName}</p>
                )}
                {importData.personalInfo.jobTitle && (
                  <p><strong>Job Title:</strong> {importData.personalInfo.jobTitle}</p>
                )}
                {importData.personalInfo.email && (
                  <p><strong>Email:</strong> {importData.personalInfo.email}</p>
                )}
                {importData.personalInfo.location && (
                  <p><strong>Location:</strong> {importData.personalInfo.location}</p>
                )}
                {importData.personalInfo.linkedin && (
                  <p><strong>LinkedIn:</strong> {importData.personalInfo.linkedin}</p>
                )}
              </div>
            </Card>
          )}

          {importData.workExperience.length > 0 && (
            <Card className="p-4">
              <h3 className="font-semibold text-gray-900 mb-2">
                Work Experience ({importData.workExperience.length} positions)
              </h3>
              <div className="space-y-2">
                {importData.workExperience.slice(0, 3).map((exp, index) => (
                  <div key={index} className="text-sm text-gray-600">
                    <p><strong>{exp.position}</strong> at {exp.company}</p>
                    {exp.startDate && (
                      <p className="text-xs text-gray-500">
                        {exp.startDate} - {exp.endDate || 'Present'}
                      </p>
                    )}
                  </div>
                ))}
                {importData.workExperience.length > 3 && (
                  <p className="text-xs text-gray-500">
                    ... and {importData.workExperience.length - 3} more positions
                  </p>
                )}
              </div>
            </Card>
          )}

          {importData.education.length > 0 && (
            <Card className="p-4">
              <h3 className="font-semibold text-gray-900 mb-2">
                Education ({importData.education.length} entries)
              </h3>
              <div className="space-y-2">
                {importData.education.slice(0, 2).map((edu, index) => (
                  <div key={index} className="text-sm text-gray-600">
                    <p><strong>{edu.degree}</strong> {edu.fieldOfStudy && `in ${edu.fieldOfStudy}`}</p>
                    <p className="text-xs text-gray-500">{edu.institution}</p>
                  </div>
                ))}
                {importData.education.length > 2 && (
                  <p className="text-xs text-gray-500">
                    ... and {importData.education.length - 2} more entries
                  </p>
                )}
              </div>
            </Card>
          )}

          {importData.skills.length > 0 && (
            <Card className="p-4">
              <h3 className="font-semibold text-gray-900 mb-2">
                Skills ({importData.skills.length} skills)
              </h3>
              <div className="flex flex-wrap gap-2">
                {importData.skills.slice(0, 12).map((skill, index) => (
                  <span
                    key={index}
                    className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded"
                  >
                    {skill}
                  </span>
                ))}
                {importData.skills.length > 12 && (
                  <span className="text-xs text-gray-500">
                    +{importData.skills.length - 12} more
                  </span>
                )}
              </div>
            </Card>
          )}
        </div>

        <div className="flex space-x-3">
          <Button
            onClick={handleApplyImport}
            variant="primary"
            className="flex-1"
            disabled={!importResult.success}
          >
            {importResult.success ? 'Import to CV' : 'Fix Issues First'}
          </Button>
          <Button
            onClick={() => setImportStep(uploadedFile ? 'file' : 'manual')}
            variant="outline"
          >
            Go Back
          </Button>
        </div>
      </div>
    );
  };

  const renderCompleteStep = () => (
    <div className="text-center space-y-6">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
        <CheckCircle className="w-8 h-8 text-green-600" />
      </div>
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Import Successful!</h2>
        <p className="text-gray-600">
          Your LinkedIn information has been imported into your CV. You can now review and edit the imported data.
        </p>
      </div>

      {importData && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-left">
          <h3 className="font-medium text-green-900 mb-2">Successfully imported:</h3>
          <ul className="text-green-700 text-sm space-y-1">
            <li>✓ Personal information</li>
            {importData.workExperience.length > 0 && (
              <li>✓ {importData.workExperience.length} work experience entries</li>
            )}
            {importData.education.length > 0 && (
              <li>✓ {importData.education.length} education entries</li>
            )}
            {importData.skills.length > 0 && (
              <li>✓ {importData.skills.length} skills</li>
            )}
          </ul>
        </div>
      )}

      <div className="space-y-3">
        <Button
          onClick={onClose}
          variant="primary"
          className="w-full"
        >
          Continue Editing CV
        </Button>
        <p className="text-xs text-gray-500">
          Tip: Review each section to ensure accuracy and add any missing details
        </p>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="p-6">
        {onClose && (
          <div className="flex justify-end mb-4">
            <Button
              onClick={onClose}
              variant="outline"
              size="sm"
              className="p-2"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}

        {importStep === 'guide' && renderGuideStep()}
        {importStep === 'file' && renderFileUploadStep()}
        {importStep === 'manual' && renderManualStep()}
        {importStep === 'review' && renderReviewStep()}
        {importStep === 'complete' && renderCompleteStep()}
      </Card>
    </div>
  );
};

export default LinkedInImport;
