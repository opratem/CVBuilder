import type React from 'react';
import { CheckCircle, AlertCircle, XCircle, TrendingUp, Download, Lightbulb } from 'lucide-react';
import type { ATSCheckResult, ATSCheck } from '../../utils/atsVerification';
import Card from './Card';
import Button from './Button';

interface ATSVerificationPanelProps {
  result: ATSCheckResult;
  onExportPDF: () => void;
  className?: string;
}

const ATSVerificationPanel: React.FC<ATSVerificationPanelProps> = ({
  result,
  onExportPDF,
  className = ''
}) => {
  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-accent-light';
    if (score >= 70) return 'text-accent';
    return 'text-accent-dark';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 85) return 'bg-accent/20 border-accent/40';
    if (score >= 70) return 'bg-accent-dark/20 border-accent-dark/40';
    return 'bg-accent-hover/20 border-accent-dark/30';
  };

  const getCategoryIcon = (check: ATSCheck) => {
    if (check.passed) {
      return <CheckCircle className="w-5 h-5 text-accent-light" />;
    }

    switch (check.category) {
      case 'critical':
        return <XCircle className="w-5 h-5 text-accent-dark" />;
      case 'important':
        return <AlertCircle className="w-5 h-5 text-accent" />;
      default:
        return <AlertCircle className="w-5 h-5 text-accent-light" />;
    }
  };

  const criticalChecks = result.checks.filter(check => check.category === 'critical');
  const importantChecks = result.checks.filter(check => check.category === 'important');
  const recommendedChecks = result.checks.filter(check => check.category === 'recommended');

  const passedChecks = result.checks.filter(check => check.passed).length;
  const totalChecks = result.checks.length;

  return (
    <Card className={className}>
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-text-primary">ATS Compatibility Check</h2>
          <div className={`px-4 py-2 rounded-lg border-2 ${getScoreBgColor(result.score)}`}>
            <div className="flex items-center">
              <TrendingUp className={`w-5 h-5 mr-2 ${getScoreColor(result.score)}`} />
              <span className={`text-2xl font-bold ${getScoreColor(result.score)}`}>
                {result.score}%
              </span>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <div className="flex justify-between text-sm text-text-muted mb-1">
            <span>Checks Passed</span>
            <span>{passedChecks}/{totalChecks}</span>
          </div>
          <div className="w-full bg-secondary-dark rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                result.score >= 85 ? 'bg-accent-light' :
                result.score >= 70 ? 'bg-accent' : 'bg-accent-dark'
              }`}
              style={{ width: `${(passedChecks / totalChecks) * 100}%` }}
            />
          </div>
        </div>

        <div className={`p-4 rounded-lg border ${
          result.passed ? 'bg-accent/10 border-accent/30' : 'bg-accent-dark/10 border-accent-dark/30'
        }`}>
          <p className={`font-medium flex items-center ${result.passed ? 'text-accent-light' : 'text-accent'}`}>
            {result.passed ? (
              <>
                <CheckCircle className="w-5 h-5 mr-2" />
                Your CV is ATS-friendly and ready for submission!
              </>
            ) : (
              <>
                <AlertCircle className="w-5 h-5 mr-2" />
                Your CV needs improvements for better ATS compatibility
              </>
            )}
          </p>
        </div>
      </div>

      {/* Critical Issues */}
      {criticalChecks.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-medium text-accent-dark mb-3 flex items-center">
            <XCircle className="w-5 h-5 mr-2" />
            Critical Issues
          </h3>
          <div className="space-y-2">
            {criticalChecks.map((check) => (
              <div key={check.id} className="flex items-start p-3 bg-accent-hover/10 border border-accent-dark/30 rounded-lg">
                {getCategoryIcon(check)}
                <div className="ml-3 flex-1">
                  <p className="font-medium text-text-primary">{check.name}</p>
                  <p className="text-sm text-text-secondary">{check.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Important Issues */}
      {importantChecks.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-medium text-accent mb-3 flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            Important Improvements
          </h3>
          <div className="space-y-2">
            {importantChecks.map((check) => (
              <div key={check.id} className={`flex items-start p-3 rounded-lg border ${
                check.passed
                  ? 'bg-accent/10 border-accent/30'
                  : 'bg-accent-dark/10 border-accent/20'
              }`}>
                {getCategoryIcon(check)}
                <div className="ml-3 flex-1">
                  <p className={`font-medium ${
                    check.passed ? 'text-accent-light' : 'text-text-primary'
                  }`}>
                    {check.name}
                  </p>
                  <p className={`text-sm ${
                    check.passed ? 'text-accent' : 'text-text-secondary'
                  }`}>
                    {check.message}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommended Improvements */}
      {recommendedChecks.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-medium text-accent-light mb-3 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            Recommended Optimizations
          </h3>
          <div className="space-y-2">
            {recommendedChecks.map((check) => (
              <div key={check.id} className={`flex items-start p-3 rounded-lg border ${
                check.passed
                  ? 'bg-accent/10 border-accent/30'
                  : 'bg-accent-dark/10 border-accent/20'
              }`}>
                {getCategoryIcon(check)}
                <div className="ml-3 flex-1">
                  <p className={`font-medium ${
                    check.passed ? 'text-accent-light' : 'text-text-primary'
                  }`}>
                    {check.name}
                  </p>
                  <p className={`text-sm ${
                    check.passed ? 'text-accent' : 'text-text-secondary'
                  }`}>
                    {check.message}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Suggestions */}
      {result.suggestions.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-medium text-text-primary mb-3 flex items-center">
            <Lightbulb className="w-5 h-5 mr-2 text-accent" />
            Improvement Suggestions
          </h3>
          <ul className="space-y-2">
            {result.suggestions.map((suggestion, index) => (
              <li key={index} className="flex items-start p-3 bg-secondary/50 border border-secondary-light rounded-lg">
                <span className="w-1.5 h-1.5 bg-accent rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <p className="text-sm text-text-secondary">{suggestion}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Export Button */}
      <div className="border-t border-secondary-light pt-4">
        <Button
          onClick={onExportPDF}
          className="w-full flex items-center justify-center"
          variant={result.passed ? "primary" : "outline"}
        >
          <Download className="w-4 h-4 mr-2" />
          {result.passed
            ? 'Download ATS-Optimized PDF'
            : 'Download PDF (Improvements Recommended)'
          }
        </Button>

        {!result.passed && (
          <p className="text-xs text-text-muted text-center mt-2">
            Address the issues above before submitting to maximize your ATS score
          </p>
        )}
      </div>
    </Card>
  );
};

export default ATSVerificationPanel;
