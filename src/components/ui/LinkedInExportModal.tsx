import React, { useState } from 'react';
import { X, Copy, Check, Download, ExternalLink, Lightbulb } from 'lucide-react';
import { generateLinkedInProfile, downloadLinkedInProfile, type LinkedInProfile } from '../../utils/enhancedExportFormats';
import { useCVStore } from '../../store/cvStore';
import Card from './Card';
import Button from './Button';

interface LinkedInExportModalProps {
  onClose: () => void;
}

const LinkedInExportModal: React.FC<LinkedInExportModalProps> = ({ onClose }) => {
  const { cv } = useCVStore();
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [showFullPreview, setShowFullPreview] = useState(false);

  const linkedInProfile = generateLinkedInProfile(cv, { includeRecommendations: true });

  const copyToClipboard = async (text: string, section: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedSection(section);
      setTimeout(() => setCopiedSection(null), 2000);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const handleDownloadJSON = () => {
    const fileName = cv.personalInfo.fullName
      ? `${cv.personalInfo.fullName.replace(/\s+/g, '_')}_LinkedIn_Profile.json`
      : 'LinkedIn_Profile.json';
    downloadLinkedInProfile(cv, fileName);
  };

  const formatExperienceForCopy = (experience: typeof linkedInProfile.experience) => {
    return experience.map(exp => {
      const duration = exp.endDate ? `${exp.startDate} - ${exp.endDate}` : `${exp.startDate} - Present`;
      return `${exp.title}\n${exp.company}${exp.location ? ` • ${exp.location}` : ''}\n${duration}\n\n${exp.description}\n`;
    }).join('\n' + '='.repeat(50) + '\n\n');
  };

  const formatEducationForCopy = (education: typeof linkedInProfile.education) => {
    return education.map(edu => {
      const duration = edu.endYear ? `${edu.startYear} - ${edu.endYear}` : edu.startYear;
      return `${edu.degree}${edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ''}\n${edu.school}\n${duration}\n${edu.description ? `\n${edu.description}` : ''}`;
    }).join('\n\n');
  };

  const formatProjectsForCopy = (projects: typeof linkedInProfile.projects) => {
    if (!projects) return '';
    return projects.map(project => {
      const duration = project.endDate ? `${project.startDate} - ${project.endDate}` : project.startDate;
      return `${project.name}\n${project.associatedWith ? `Associated with: ${project.associatedWith}\n` : ''}${duration ? `${duration}\n` : ''}${project.url ? `URL: ${project.url}\n` : ''}\n${project.description}\n${project.skills ? `\nSkills: ${project.skills.join(', ')}` : ''}`;
    }).join('\n\n');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <ExternalLink className="w-6 h-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-bold text-gray-900">LinkedIn Profile Export</h2>
              <p className="text-sm text-gray-600">Copy sections to update your LinkedIn profile</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="p-6 space-y-6">
            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start space-x-2">
                <Lightbulb className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h3 className="font-medium text-blue-900 mb-2">How to use this export:</h3>
                  <ul className="text-blue-800 text-sm space-y-1">
                    <li>• Click the copy button next to each section to copy the text</li>
                    <li>• Paste directly into the corresponding LinkedIn sections</li>
                    <li>• Download as JSON for backup or API integrations</li>
                    <li>• Review and customize the text before publishing</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Headline */}
            <Card className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900">LinkedIn Headline</h3>
                <Button
                  onClick={() => copyToClipboard(linkedInProfile.headline, 'headline')}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                >
                  {copiedSection === 'headline' ? (
                    <>
                      <Check className="w-3 h-3 mr-1" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 mr-1" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-gray-700">{linkedInProfile.headline}</p>
              </div>
              <p className="text-xs text-gray-500 mt-2">Character limit: {linkedInProfile.headline.length}/220</p>
            </Card>

            {/* About Section */}
            <Card className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900">About Section</h3>
                <Button
                  onClick={() => copyToClipboard(linkedInProfile.about, 'about')}
                  variant="outline"
                  size="sm"
                  className="text-xs"
                >
                  {copiedSection === 'about' ? (
                    <>
                      <Check className="w-3 h-3 mr-1" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3 mr-1" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm text-gray-700 whitespace-pre-line">{linkedInProfile.about}</p>
              </div>
              <p className="text-xs text-gray-500 mt-2">Character limit: {linkedInProfile.about.length}/2600</p>
            </Card>

            {/* Experience */}
            {linkedInProfile.experience.length > 0 && (
              <Card className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">Experience ({linkedInProfile.experience.length} positions)</h3>
                  <Button
                    onClick={() => copyToClipboard(formatExperienceForCopy(linkedInProfile.experience), 'experience')}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                  >
                    {copiedSection === 'experience' ? (
                      <>
                        <Check className="w-3 h-3 mr-1" />
                        Copied All
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 mr-1" />
                        Copy All
                      </>
                    )}
                  </Button>
                </div>
                <div className="space-y-3">
                  {linkedInProfile.experience.slice(0, showFullPreview ? undefined : 2).map((exp, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-3">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="font-medium text-gray-900">{exp.title}</h4>
                          <p className="text-sm text-blue-600">{exp.company}{exp.location ? ` • ${exp.location}` : ''}</p>
                          <p className="text-xs text-gray-500">
                            {exp.startDate} - {exp.endDate || 'Present'}
                          </p>
                        </div>
                        <Button
                          onClick={() => copyToClipboard(exp.description, `experience-${index}`)}
                          variant="outline"
                          size="sm"
                          className="text-xs ml-2"
                        >
                          {copiedSection === `experience-${index}` ? (
                            <Check className="w-3 h-3" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </Button>
                      </div>
                      <p className="text-xs text-gray-700 whitespace-pre-line">{exp.description}</p>
                      {exp.skills && exp.skills.length > 0 && (
                        <div className="mt-2">
                          <p className="text-xs text-gray-600">Skills: {exp.skills.join(', ')}</p>
                        </div>
                      )}
                    </div>
                  ))}
                  {linkedInProfile.experience.length > 2 && !showFullPreview && (
                    <Button
                      onClick={() => setShowFullPreview(true)}
                      variant="outline"
                      className="text-xs w-full"
                    >
                      Show {linkedInProfile.experience.length - 2} more positions
                    </Button>
                  )}
                </div>
              </Card>
            )}

            {/* Skills */}
            {linkedInProfile.skills.length > 0 && (
              <Card className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">Skills ({linkedInProfile.skills.length} skills)</h3>
                  <Button
                    onClick={() => copyToClipboard(linkedInProfile.skills.join(', '), 'skills')}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                  >
                    {copiedSection === 'skills' ? (
                      <>
                        <Check className="w-3 h-3 mr-1" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 mr-1" />
                        Copy List
                      </>
                    )}
                  </Button>
                </div>
                <div className="bg-gray-50 rounded-lg p-3">
                  <div className="flex flex-wrap gap-2">
                    {linkedInProfile.skills.slice(0, 20).map((skill, index) => (
                      <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                        {skill}
                      </span>
                    ))}
                    {linkedInProfile.skills.length > 20 && (
                      <span className="text-xs text-gray-500">+{linkedInProfile.skills.length - 20} more</span>
                    )}
                  </div>
                </div>
              </Card>
            )}

            {/* Education */}
            {linkedInProfile.education.length > 0 && (
              <Card className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">Education</h3>
                  <Button
                    onClick={() => copyToClipboard(formatEducationForCopy(linkedInProfile.education), 'education')}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                  >
                    {copiedSection === 'education' ? (
                      <>
                        <Check className="w-3 h-3 mr-1" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 mr-1" />
                        Copy All
                      </>
                    )}
                  </Button>
                </div>
                <div className="space-y-3">
                  {linkedInProfile.education.map((edu, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-3">
                      <h4 className="font-medium text-gray-900">
                        {edu.degree}{edu.fieldOfStudy ? ` in ${edu.fieldOfStudy}` : ''}
                      </h4>
                      <p className="text-sm text-blue-600">{edu.school}</p>
                      <p className="text-xs text-gray-500">
                        {edu.startYear} - {edu.endYear || 'Present'}
                      </p>
                      {edu.description && (
                        <p className="text-xs text-gray-700 mt-2">{edu.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Projects */}
            {linkedInProfile.projects && linkedInProfile.projects.length > 0 && (
              <Card className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-gray-900">Projects</h3>
                  <Button
                    onClick={() => copyToClipboard(formatProjectsForCopy(linkedInProfile.projects!), 'projects')}
                    variant="outline"
                    size="sm"
                    className="text-xs"
                  >
                    {copiedSection === 'projects' ? (
                      <>
                        <Check className="w-3 h-3 mr-1" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 mr-1" />
                        Copy All
                      </>
                    )}
                  </Button>
                </div>
                <div className="space-y-3">
                  {linkedInProfile.projects.map((project, index) => (
                    <div key={index} className="bg-gray-50 rounded-lg p-3">
                      <h4 className="font-medium text-gray-900">{project.name}</h4>
                      {project.associatedWith && (
                        <p className="text-sm text-blue-600">Associated with: {project.associatedWith}</p>
                      )}
                      {project.url && (
                        <p className="text-xs text-gray-600">{project.url}</p>
                      )}
                      <p className="text-xs text-gray-700 mt-2">{project.description}</p>
                      {project.skills && project.skills.length > 0 && (
                        <p className="text-xs text-gray-600 mt-1">Skills: {project.skills.join(', ')}</p>
                      )}
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-600">
            LinkedIn format ready for copy & paste
          </div>
          <div className="flex space-x-3">
            <Button
              onClick={handleDownloadJSON}
              variant="outline"
            >
              <Download className="w-4 h-4 mr-2" />
              Download JSON
            </Button>
            <Button onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LinkedInExportModal;
