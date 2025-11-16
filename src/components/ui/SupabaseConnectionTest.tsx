import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import Button from './Button';
import Card from './Card';

export const SupabaseConnectionTest = () => {
  const [status, setStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [message, setMessage] = useState('Checking connection...');
  const [details, setDetails] = useState<any>(null);

  const testConnection = async () => {
    setStatus('checking');
    setMessage('Testing connection to Supabase...');
    setDetails(null);

    try {
      // Test 1: Check if we can connect to Supabase
      const { data, error } = await supabase.auth.getSession();

      if (error && error.message.includes('Invalid API key')) {
        setStatus('error');
        setMessage('❌ Connection failed: Invalid API key');
        setDetails(error);
        return;
      }

      // Test 2: Try to query a simple endpoint
      const { data: healthData, error: healthError } = await supabase
        .from('profiles')
        .select('count')
        .limit(0);

      if (healthError) {
        // If table doesn't exist, that's okay - connection still works
        if (healthError.message.includes('relation') || healthError.message.includes('does not exist')) {
          setStatus('connected');
          setMessage('✅ Connected successfully! (Note: Database tables may need to be set up)');
          setDetails({
            url: import.meta.env.VITE_SUPABASE_URL,
            hasApiKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
            note: 'Database tables not found - you may need to run migrations'
          });
        } else {
          setStatus('error');
          setMessage('❌ Connection error');
          setDetails(healthError);
        }
      } else {
        setStatus('connected');
        setMessage('✅ Connected successfully! Database is ready.');
        setDetails({
          url: import.meta.env.VITE_SUPABASE_URL,
          hasApiKey: !!import.meta.env.VITE_SUPABASE_ANON_KEY,
          session: data?.session ? 'User logged in' : 'No active session'
        });
      }
    } catch (err: any) {
      setStatus('error');
      setMessage('❌ Connection failed');
      setDetails(err);
    }
  };

  useEffect(() => {
    testConnection();
  }, []);

  return (
    <Card className="p-6 max-w-2xl mx-auto my-8">
      <h2 className="text-2xl font-bold mb-4">Supabase Connection Test</h2>

      <div className="space-y-4">
        <div className={`p-4 rounded-lg ${
          status === 'checking' ? 'bg-blue-50 text-blue-900' :
          status === 'connected' ? 'bg-green-50 text-green-900' :
          'bg-red-50 text-red-900'
        }`}>
          <p className="font-semibold">{message}</p>
        </div>

        {details && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Connection Details:</h3>
            <pre className="text-xs overflow-auto">
              {JSON.stringify(details, null, 2)}
            </pre>
          </div>
        )}

        <div className="flex gap-2">
          <Button onClick={testConnection} disabled={status === 'checking'}>
            {status === 'checking' ? 'Testing...' : 'Test Again'}
          </Button>
        </div>

        <div className="text-sm text-gray-600 space-y-2">
          <p><strong>Project URL:</strong> {import.meta.env.VITE_SUPABASE_URL || 'Not configured'}</p>
          <p><strong>API Key Configured:</strong> {import.meta.env.VITE_SUPABASE_ANON_KEY ? '✓ Yes' : '✗ No'}</p>
        </div>
      </div>
    </Card>
  );
};
