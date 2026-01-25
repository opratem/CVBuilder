import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Database, CheckCircle, XCircle, Loader2, RefreshCw, Server, Key, Table } from 'lucide-react';
import Button from './Button';
import Card from './Card';

interface TestResult {
  name: string;
  status: 'pending' | 'success' | 'error' | 'warning';
  message: string;
}

export const SupabaseConnectionTest = () => {
  const [status, setStatus] = useState<'checking' | 'connected' | 'error' | 'warning'>('checking');
  const [tests, setTests] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const runTests = async () => {
    setIsRunning(true);
    setStatus('checking');
    const results: TestResult[] = [];

    // Test 1: Check environment variables
    const hasUrl = !!import.meta.env.VITE_SUPABASE_URL;
    const hasKey = !!import.meta.env.VITE_SUPABASE_ANON_KEY;

    results.push({
      name: 'Environment Variables',
      status: hasUrl && hasKey ? 'success' : 'error',
      message: hasUrl && hasKey
        ? 'Supabase URL and API Key are configured'
        : `Missing: ${!hasUrl ? 'VITE_SUPABASE_URL ' : ''}${!hasKey ? 'VITE_SUPABASE_ANON_KEY' : ''}`
    });
    setTests([...results]);

    if (!hasUrl || !hasKey) {
      setStatus('error');
      setIsRunning(false);
      return;
    }

    // Test 2: Auth Connection
    try {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        results.push({
          name: 'Auth Connection',
          status: 'error',
          message: error.message
        });
      } else {
        results.push({
          name: 'Auth Connection',
          status: 'success',
          message: data?.session ? `Logged in as ${data.session.user?.email}` : 'Connected (no active session)'
        });
      }
    } catch (err: any) {
      results.push({
        name: 'Auth Connection',
        status: 'error',
        message: err.message || 'Connection failed'
      });
    }
    setTests([...results]);

    // Test 3: Profiles Table
    try {
      const { error: profilesError } = await supabase
        .from('profiles')
        .select('id')
        .limit(1);

      if (profilesError) {
        const isTableMissing = profilesError.message.includes('relation') ||
                              profilesError.message.includes('does not exist');
        results.push({
          name: 'Profiles Table',
          status: isTableMissing ? 'warning' : 'error',
          message: isTableMissing ? 'Table not found - needs migration' : profilesError.message
        });
      } else {
        results.push({
          name: 'Profiles Table',
          status: 'success',
          message: 'Table exists and accessible'
        });
      }
    } catch (err: any) {
      results.push({
        name: 'Profiles Table',
        status: 'error',
        message: err.message || 'Query failed'
      });
    }
    setTests([...results]);

    // Test 4: CV Data Table
    try {
      const { error: cvError } = await supabase
        .from('cv_data')
        .select('id')
        .limit(1);

      if (cvError) {
        const isTableMissing = cvError.message.includes('relation') ||
                              cvError.message.includes('does not exist');
        const isRLSError = cvError.message.includes('RLS') ||
                          cvError.message.includes('policy') ||
                          cvError.code === '42501';

        results.push({
          name: 'CV Data Table',
          status: isTableMissing ? 'warning' : isRLSError ? 'warning' : 'error',
          message: isTableMissing
            ? 'Table not found - needs migration'
            : isRLSError
              ? 'RLS policy may be blocking access (normal when not logged in)'
              : cvError.message
        });
      } else {
        results.push({
          name: 'CV Data Table',
          status: 'success',
          message: 'Table exists and accessible'
        });
      }
    } catch (err: any) {
      results.push({
        name: 'CV Data Table',
        status: 'error',
        message: err.message || 'Query failed'
      });
    }
    setTests([...results]);

    // Determine overall status
    const hasErrors = results.some(r => r.status === 'error');
    const hasWarnings = results.some(r => r.status === 'warning');
    setStatus(hasErrors ? 'error' : hasWarnings ? 'warning' : 'connected');
    setIsRunning(false);
  };

  useEffect(() => {
    runTests();
  }, []);

  const getStatusIcon = (testStatus: TestResult['status']) => {
    switch (testStatus) {
      case 'pending':
        return <Loader2 className="w-4 h-4 animate-spin text-text-muted" />;
      case 'success':
        return <CheckCircle className="w-4 h-4 text-emerald-400" />;
      case 'warning':
        return <XCircle className="w-4 h-4 text-yellow-400" />;
      case 'error':
        return <XCircle className="w-4 h-4 text-red-400" />;
    }
  };

  const getStatusBadge = () => {
    switch (status) {
      case 'checking':
        return <span className="tag-info px-2 py-1 rounded text-xs font-medium">Testing...</span>;
      case 'connected':
        return <span className="tag-success px-2 py-1 rounded text-xs font-medium">Connected</span>;
      case 'warning':
        return <span className="tag-warning px-2 py-1 rounded text-xs font-medium">Partial</span>;
      case 'error':
        return <span className="tag-error px-2 py-1 rounded text-xs font-medium">Error</span>;
    }
  };

  return (
    <div className="glass-card rounded-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg glass-accent flex items-center justify-center">
            <Database className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-text-primary">Database Connection</h3>
            <p className="text-sm text-text-muted">Supabase connectivity test</p>
          </div>
        </div>
        {getStatusBadge()}
      </div>

      <div className="space-y-3 mb-6">
        {tests.map((test, index) => (
          <div
            key={test.name}
            className={`flex items-start gap-3 p-3 rounded-lg glass-surface ${
              test.status === 'error' ? 'border-red-500/20' :
              test.status === 'warning' ? 'border-yellow-500/20' :
              test.status === 'success' ? 'border-emerald-500/20' : ''
            }`}
          >
            {getStatusIcon(test.status)}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-text-primary">{test.name}</p>
              <p className="text-xs text-text-muted truncate">{test.message}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3 pt-4 border-t border-border">
        <Button
          onClick={runTests}
          disabled={isRunning}
          variant="outline"
          size="sm"
          className="glass-surface"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isRunning ? 'animate-spin' : ''}`} />
          {isRunning ? 'Testing...' : 'Run Tests'}
        </Button>

        <div className="flex-1 flex items-center gap-4 text-xs text-text-muted">
          <span className="flex items-center gap-1">
            <Server className="w-3 h-3" />
            {import.meta.env.VITE_SUPABASE_URL ? 'URL configured' : 'No URL'}
          </span>
          <span className="flex items-center gap-1">
            <Key className="w-3 h-3" />
            {import.meta.env.VITE_SUPABASE_ANON_KEY ? 'Key configured' : 'No key'}
          </span>
        </div>
      </div>

      {status === 'warning' && (
        <div className="mt-4 p-3 glass-warning rounded-lg">
          <p className="text-sm text-yellow-300">
            <strong>Note:</strong> Some tables may not exist yet. Make sure you've run the Supabase migrations or created the required tables (profiles, cv_data) in your Supabase dashboard.
          </p>
        </div>
      )}

      {status === 'error' && tests.some(t => t.name === 'Environment Variables' && t.status === 'error') && (
        <div className="mt-4 p-3 glass-error rounded-lg">
          <p className="text-sm text-red-300">
            <strong>Configuration Error:</strong> Please ensure your <code className="px-1 py-0.5 bg-black/30 rounded">.env.local</code> file contains valid VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY values.
          </p>
        </div>
      )}
    </div>
  );
};
