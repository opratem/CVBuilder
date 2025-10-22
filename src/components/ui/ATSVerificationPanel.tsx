import React from 'react';
import { CheckCircle, AlertCircle, XCircle, TrendingUp, Download, Lightbulb } from 'lucide-react';
import { ATSCheckResult, ATSCheck } from '../../utils/atsVerification';
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
    if (score >= 85) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 85) return 'bg-green-100 border-green-200';
    if (score >= 70) return 'bg-yellow-100 border-yellow-200';
    return 'bg-red-100 border-red-200';
  };

  const getCategoryIcon = (check: ATSCheck) => {
    if (check.passed) {
      return <CheckCircle className="w-5 h-5 text-green-600" />;
    }

    switch (check.category) {
      case 'critical':
        return <XCircle className="w-5 h-5 text-red-600" />;
      case 'important':
        return <AlertCircle className="w-5 h-5 text-yellow-600" />;
      default:
        return <AlertCircle className="w-5 h-5 text-blue-600" />;
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
          <h2 className="text-xl font-semibold text-gray-800">ATS Compatibility Check</h2>
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
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Checks Passed</span>
            <span>{passedChecks}/{totalChecks}</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                result.score >= 85 ? 'bg-green-500' :
                result.score >= 70 ? 'bg-yellow-500' : 'bg-red-500'
              }`}
              style={{ width: `${(passedChecks / totalChecks) * 100}%` }}
            />
          </div>
        </div>

        <div className={`p-4 rounded-lg border ${
          result.passed ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
        }`}>
          <p className={`font-medium flex items-center ${result.passed ? 'text-green-800' : 'text-red-800'}`}>
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
          <h3 className="text-lg font-medium text-red-700 mb-3 flex items-center">
            <XCircle className="w-5 h-5 mr-2" />
            Critical Issues
          </h3>
          <div className="space-y-2">
            {criticalChecks.map((check) => (
              <div key={check.id} className="flex items-start p-3 bg-red-50 border border-red-200 rounded-lg">
                {getCategoryIcon(check)}
                <div className="ml-3 flex-1">
                  <p className="font-medium text-red-800">{check.name}</p>
                  <p className="text-sm text-red-700">{check.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Important Issues */}
      {importantChecks.length > 0 && (
        <div className="mb-6">
          <h3 className="text-lg font-medium text-yellow-700 mb-3 flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" />
            Important Improvements
          </h3>
          <div className="space-y-2">
            {importantChecks.map((check) => (
              <div key={check.id} className={`flex items-start p-3 rounded-lg border ${
                check.passed
                  ? 'bg-green-50 border-green-200'
                  : 'bg-yellow-50 border-yellow-200'
              }`}>
                {getCategoryIcon(check)}
                <div className="ml-3 flex-1">
                  <p className={`font-medium ${
                    check.passed ? 'text-green-800' : 'text-yellow-800'
                  }`}>
                    {check.name}
                  </p>
                  <p className={`text-sm ${
                    check.passed ? 'text-green-700' : 'text-yellow-700'
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
          <h3 className="text-lg font-medium text-blue-700 mb-3 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2" />
            Recommended Optimizations
          </h3>
          <div className="space-y-2">
            {recommendedChecks.map((check) => (
              <div key={check.id} className={`flex items-start p-3 rounded-lg border ${
                check.passed
                  ? 'bg-green-50 border-green-200'
                  : 'bg-blue-50 border-blue-200'
              }`}>
                {getCategoryIcon(check)}
                <div className="ml-3 flex-1">
                  <p className={`font-medium ${
                    check.passed ? 'text-green-800' : 'text-blue-800'
                  }`}>
                    {check.name}
                  </p>
                  <p className={`text-sm ${
                    check.passed ? 'text-green-700' : 'text-blue-700'
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
          <h3 className="text-lg font-medium text-gray-700 mb-3 flex items-center">
            <Lightbulb className="w-5 h-5 mr-2 text-yellow-600" />
            Improvement Suggestions
          </h3>
          <ul className="space-y-2">
            {result.suggestions.map((suggestion, index) => (
              <li key={index} className="flex items-start p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                <p className="text-sm text-gray-700">{suggestion}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Export Button */}
      <div className="border-t pt-4">
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
          <p className="text-xs text-gray-600 text-center mt-2">
            Address the issues above before submitting to maximize your ATS score
          </p>
        )}
      </div>
    </Card>
  );
};

export default ATSVerificationPanel;
