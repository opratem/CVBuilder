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
import { Eye } from 'lucide-react';

interface CVPreviewProps {
  isMobile?: boolean;
  hideControls?: boolean;
}

const CVPreview: React.FC<CVPreviewProps> = ({ isMobile = false, hideControls = false }) => {
  const { cv } = useCVStore();
  const [showPreview, setShowPreview] = React.useState(!isMobile);

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

  // If hideControls is true, render template directly without wrapper
  if (hideControls) {
    return renderTemplate();
  }

  return (
    <div className="flex flex-col">
      {isMobile && !hideControls && (
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
        <div className="bg-secondary/30 p-1 rounded-lg overflow-auto border border-secondary-light">
          <div className="transform scale-[0.8] origin-top">
            {renderTemplate()}
          </div>
        </div>
      )}
    </div>
  );
};

export default CVPreview;
