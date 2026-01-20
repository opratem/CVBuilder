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
        return <Crown className="w-5 h-5 text-[#fbbf24]" />;
      case 'creative':
        return <Palette className="w-5 h-5 text-[#a78bfa]" />;
      case 'tech':
        return <Code className="w-5 h-5 text-accent" />;
      case 'academic':
        return <GraduationCap className="w-5 h-5 text-accent-light" />;
      case 'classic':
        return <Building2 className="w-5 h-5 text-text-muted" />;
      case 'modern':
        return <Zap className="w-5 h-5 text-accent" />;
      default:
        return <Layout className="w-5 h-5 text-text-muted" />;
    }
  };

  const getTemplateCategory = (templateId: string) => {
    switch (templateId) {
      case 'classic':
        return { category: 'ATS-Optimized', color: 'tag-success' };
      case 'executive':
        return { category: 'Leadership', color: 'tag-warning' };
      case 'creative':
        return { category: 'Creative', color: 'tag-purple' };
      case 'tech':
        return { category: 'Technology', color: 'tag-accent' };
      case 'academic':
        return { category: 'Academic', color: 'tag-success' };
      default:
        return { category: 'General', color: 'tag-neutral' };
    }
  };

  const getTemplatePreview = (templateId: string) => {
    // Simple visual representation of template layout
    switch (templateId) {
      case 'modern':
        return (
          <div className="w-full h-16 bg-gradient-to-r from-accent/20 to-accent/10 rounded border border-accent/30 flex">
            <div className="w-1/3 bg-accent/30 rounded-l border-r border-accent/40"></div>
            <div className="flex-1 p-1 space-y-0.5">
              <div className="h-1 bg-accent/50 rounded"></div>
              <div className="h-1 bg-accent/30 rounded w-3/4"></div>
              <div className="h-1 bg-accent/30 rounded w-1/2"></div>
            </div>
          </div>
        );
      case 'classic':
        return (
          <div className="w-full h-16 glass-surface rounded border border-border p-1 space-y-0.5">
            <div className="h-2 bg-text-muted/50 rounded"></div>
            <div className="h-1 bg-text-muted/30 rounded w-3/4"></div>
            <div className="h-1 bg-text-muted/30 rounded w-1/2"></div>
            <div className="h-1 bg-text-muted/30 rounded w-2/3"></div>
          </div>
        );
      case 'minimal':
        return (
          <div className="w-full h-16 bg-surface-elevated rounded border border-border p-1 space-y-1">
            <div className="h-1.5 bg-text-primary/80 rounded w-1/2"></div>
            <div className="h-0.5 bg-text-muted/50 rounded w-3/4"></div>
            <div className="h-0.5 bg-text-muted/50 rounded w-1/2"></div>
            <div className="h-0.5 bg-text-muted/50 rounded w-2/3"></div>
          </div>
        );
      case 'executive':
        return (
          <div className="w-full h-16 bg-gradient-to-b from-[#fbbf24]/10 to-[#fbbf24]/20 rounded border border-[#fbbf24]/30 p-1 space-y-0.5">
            <div className="h-2 bg-[#fbbf24]/60 rounded"></div>
            <div className="h-1 bg-[#fbbf24]/40 rounded w-3/4"></div>
            <div className="h-1 bg-[#fbbf24]/30 rounded w-1/2"></div>
          </div>
        );
      case 'creative':
        return (
          <div className="w-full h-16 bg-gradient-to-br from-[#a78bfa]/20 via-[#ec4899]/10 to-accent/10 rounded border border-[#a78bfa]/30 p-1 space-y-0.5">
            <div className="h-2 bg-gradient-to-r from-[#a78bfa]/60 to-[#ec4899]/40 rounded"></div>
            <div className="h-1 bg-[#a78bfa]/40 rounded w-3/4"></div>
            <div className="h-1 bg-[#ec4899]/30 rounded w-1/2"></div>
          </div>
        );
      case 'tech':
        return (
          <div className="w-full h-16 glass-surface rounded border border-border p-1 space-y-0.5">
            <div className="h-1.5 bg-accent rounded w-1/2"></div>
            <div className="flex space-x-1">
              <div className="h-1 bg-accent/60 rounded w-1/4"></div>
              <div className="h-1 bg-accent-light/60 rounded w-1/4"></div>
              <div className="h-1 bg-[#fbbf24]/60 rounded w-1/4"></div>
            </div>
            <div className="h-1 bg-text-muted/40 rounded w-3/4"></div>
          </div>
        );
      case 'academic':
        return (
          <div className="w-full h-16 bg-accent/10 rounded border border-accent/30 p-1 space-y-0.5">
            <div className="h-1.5 bg-accent rounded w-3/4"></div>
            <div className="h-1 bg-accent/60 rounded w-1/2"></div>
            <div className="h-1 bg-accent/40 rounded w-2/3"></div>
            <div className="h-1 bg-accent/30 rounded w-1/3"></div>
          </div>
        );
      default:
        return (
          <div className="w-full h-16 glass-surface rounded border border-border"></div>
        );
    }
  };

  return (
    <Card className="mb-6">
      <h2 className="text-xl font-semibold flex items-center mb-6">
        <Layout className="mr-2" /> Choose Your Template
      </h2>

      <div className="mb-4 p-4 glass-accent rounded-lg">
        <p className="text-text-secondary text-sm flex items-center">
          <Lightbulb className="w-4 h-4 mr-2 text-accent" />
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
                border rounded-xl p-5 cursor-pointer transition-all hover:shadow-lg hover:shadow-glow
                ${cv.templateId === template.id
                  ? 'border-accent bg-accent/10 shadow-md ring-2 ring-accent/50'
                  : 'border-border hover:border-accent hover:bg-accent/5'}
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
                    <h3 className="font-semibold text-text-primary">{template.name}</h3>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${category.color}`}>
                    {category.category}
                  </span>
                </div>

                <p className="text-sm text-text-secondary leading-relaxed">{template.description}</p>

                {cv.templateId === template.id && (
                  <div className="flex items-center text-accent text-sm font-medium">
                    <div className="w-2 h-2 bg-accent rounded-full mr-2"></div>
                    Currently selected
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 p-4 glass-surface rounded-lg">
        <h4 className="font-medium text-text-primary mb-2">Need help choosing?</h4>
        <div className="text-sm text-text-secondary space-y-1">
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
