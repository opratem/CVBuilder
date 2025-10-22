import type React from 'react';
import { useCVStore } from '../../store/cvStore';
import { templates } from '../../types/cv';
import Card from '../ui/Card';
import { Layout, Crown, Palette, Code, GraduationCap, Building2, Zap, Lightbulb } from 'lucide-react';

const TemplateSelector: React.FC = () => {
  const { cv, setTemplateId } = useCVStore();

  const getTemplateIcon = (templateId: string) => {
    switch (templateId) {
      case 'executive':
        return <Crown className="w-5 h-5 text-amber-600" />;
      case 'creative':
        return <Palette className="w-5 h-5 text-purple-600" />;
      case 'tech':
        return <Code className="w-5 h-5 text-blue-600" />;
      case 'academic':
        return <GraduationCap className="w-5 h-5 text-green-600" />;
      case 'classic':
        return <Building2 className="w-5 h-5 text-gray-600" />;
      case 'modern':
        return <Zap className="w-5 h-5 text-indigo-600" />;
      default:
        return <Layout className="w-5 h-5 text-gray-600" />;
    }
  };

  const getTemplateCategory = (templateId: string) => {
    switch (templateId) {
      case 'classic':
        return { category: 'ATS-Optimized', color: 'bg-green-100 text-green-800' };
      case 'executive':
        return { category: 'Leadership', color: 'bg-amber-100 text-amber-800' };
      case 'creative':
        return { category: 'Creative', color: 'bg-purple-100 text-purple-800' };
      case 'tech':
        return { category: 'Technology', color: 'bg-blue-100 text-blue-800' };
      case 'academic':
        return { category: 'Academic', color: 'bg-green-100 text-green-800' };
      default:
        return { category: 'General', color: 'bg-gray-100 text-gray-800' };
    }
  };

  const getTemplatePreview = (templateId: string) => {
    // Simple visual representation of template layout
    switch (templateId) {
      case 'modern':
        return (
          <div className="w-full h-16 bg-gradient-to-r from-indigo-100 to-blue-100 rounded border flex">
            <div className="w-1/3 bg-indigo-200 rounded-l border-r border-indigo-300"></div>
            <div className="flex-1 p-1 space-y-0.5">
              <div className="h-1 bg-indigo-300 rounded"></div>
              <div className="h-1 bg-indigo-200 rounded w-3/4"></div>
              <div className="h-1 bg-indigo-200 rounded w-1/2"></div>
            </div>
          </div>
        );
      case 'classic':
        return (
          <div className="w-full h-16 bg-gray-50 rounded border p-1 space-y-0.5">
            <div className="h-2 bg-gray-300 rounded"></div>
            <div className="h-1 bg-gray-200 rounded w-3/4"></div>
            <div className="h-1 bg-gray-200 rounded w-1/2"></div>
            <div className="h-1 bg-gray-200 rounded w-2/3"></div>
          </div>
        );
      case 'minimal':
        return (
          <div className="w-full h-16 bg-white rounded border p-1 space-y-1">
            <div className="h-1.5 bg-gray-800 rounded w-1/2"></div>
            <div className="h-0.5 bg-gray-400 rounded w-3/4"></div>
            <div className="h-0.5 bg-gray-400 rounded w-1/2"></div>
            <div className="h-0.5 bg-gray-400 rounded w-2/3"></div>
          </div>
        );
      case 'executive':
        return (
          <div className="w-full h-16 bg-gradient-to-b from-amber-50 to-amber-100 rounded border p-1 space-y-0.5">
            <div className="h-2 bg-amber-600 rounded"></div>
            <div className="h-1 bg-amber-400 rounded w-3/4"></div>
            <div className="h-1 bg-amber-300 rounded w-1/2"></div>
          </div>
        );
      case 'creative':
        return (
          <div className="w-full h-16 bg-gradient-to-br from-purple-100 via-pink-100 to-blue-100 rounded border p-1 space-y-0.5">
            <div className="h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded"></div>
            <div className="h-1 bg-purple-300 rounded w-3/4"></div>
            <div className="h-1 bg-pink-300 rounded w-1/2"></div>
          </div>
        );
      case 'tech':
        return (
          <div className="w-full h-16 bg-slate-50 rounded border p-1 space-y-0.5">
            <div className="h-1.5 bg-blue-600 rounded w-1/2"></div>
            <div className="flex space-x-1">
              <div className="h-1 bg-blue-400 rounded w-1/4"></div>
              <div className="h-1 bg-green-400 rounded w-1/4"></div>
              <div className="h-1 bg-yellow-400 rounded w-1/4"></div>
            </div>
            <div className="h-1 bg-slate-300 rounded w-3/4"></div>
          </div>
        );
      case 'academic':
        return (
          <div className="w-full h-16 bg-green-50 rounded border p-1 space-y-0.5">
            <div className="h-1.5 bg-green-600 rounded w-3/4"></div>
            <div className="h-1 bg-green-400 rounded w-1/2"></div>
            <div className="h-1 bg-green-300 rounded w-2/3"></div>
            <div className="h-1 bg-green-200 rounded w-1/3"></div>
          </div>
        );
      default:
        return (
          <div className="w-full h-16 bg-gray-100 rounded border"></div>
        );
    }
  };

  return (
    <Card className="mb-6">
      <h2 className="text-xl font-semibold flex items-center mb-6">
        <Layout className="mr-2" /> Choose Your Template
      </h2>

      <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-blue-800 text-sm flex items-center">
          <Lightbulb className="w-4 h-4 mr-2 text-blue-600" />
          <strong>Pro Tip:</strong> For most job applications, we recommend the "Classic (ATS-Optimized)" template
          as it's designed to pass through Applicant Tracking Systems used by most companies.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => {
          const category = getTemplateCategory(template.id);
          return (
            <div
              key={template.id}
              className={`
                border rounded-xl p-5 cursor-pointer transition-all hover:shadow-lg
                ${cv.templateId === template.id
                  ? 'border-blue-500 bg-blue-50 shadow-md ring-2 ring-blue-200'
                  : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'}
              `}
              onClick={() => setTemplateId(template.id)}
            >
              {/* Template Preview */}
              <div className="mb-4">
                {getTemplatePreview(template.id)}
              </div>

              {/* Template Info */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    {getTemplateIcon(template.id)}
                    <h3 className="font-semibold text-gray-900">{template.name}</h3>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${category.color}`}>
                    {category.category}
                  </span>
                </div>

                <p className="text-sm text-gray-600 leading-relaxed">{template.description}</p>

                {cv.templateId === template.id && (
                  <div className="flex items-center text-blue-600 text-sm font-medium">
                    <div className="w-2 h-2 bg-blue-600 rounded-full mr-2"></div>
                    Currently selected
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">Need help choosing?</h4>
        <div className="text-sm text-gray-600 space-y-1">
          <p>• <strong>Corporate/Finance:</strong> Classic or Executive</p>
          <p>• <strong>Tech/Engineering:</strong> Tech Professional or Modern</p>
          <p>• <strong>Design/Marketing:</strong> Creative or Modern</p>
          <p>• <strong>Research/Academia:</strong> Academic or Classic</p>
        </div>
      </div>
    </Card>
  );
};

export default TemplateSelector;
