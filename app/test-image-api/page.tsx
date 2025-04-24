'use client';

import { useState } from 'react';

export default function TestImageApiPage() {
  const [prompt, setPrompt] = useState('A modern cozy bedroom with a large mattress, soft lighting, and minimalist decor');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ url?: string; error?: string } | null>(null);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    setLogs(prev => [...prev, `${new Date().toISOString()}: ${message}`]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    
    try {
      addLog(`Sending request with prompt: ${prompt.substring(0, 30)}...`);
      
      const response = await fetch('/api/testGptImage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });
      
      addLog(`Received response with status: ${response.status}`);
      const data = await response.json();
      
      if (!response.ok) {
        addLog(`Error: ${data.error || 'Unknown error'}`);
        setResult({ error: data.message || JSON.stringify(data) });
      } else {
        addLog(`Success! Image URL received`);
        setResult({ url: data.url });
      }
    } catch (error: any) {
      addLog(`Fetch error: ${error?.message || 'Unknown error'}`);
      setResult({ error: error?.message || 'Unknown error occurred' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Test GPT-Image-1 API</h1>
      
      <form onSubmit={handleSubmit} className="mb-8">
        <div className="mb-4">
          <label htmlFor="prompt" className="block text-sm font-medium mb-2">
            Image Prompt
          </label>
          <textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
            rows={4}
          />
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded-md disabled:bg-blue-300"
        >
          {loading ? 'Generating...' : 'Generate Image'}
        </button>
      </form>
      
      {result && (
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Result</h2>
          
          {result.error ? (
            <div className="p-4 bg-red-100 border border-red-400 rounded-md">
              <h3 className="text-red-800 font-medium">Error</h3>
              <pre className="mt-2 whitespace-pre-wrap text-sm">{result.error}</pre>
            </div>
          ) : result.url ? (
            <div>
              <p className="mb-2">Image generated successfully:</p>
              <img 
                src={result.url} 
                alt="Generated" 
                className="max-w-full h-auto border border-gray-200 rounded-md"
              />
            </div>
          ) : null}
        </div>
      )}
      
      <div>
        <h2 className="text-xl font-semibold mb-4">Logs</h2>
        <div className="bg-gray-100 p-4 rounded-md max-h-64 overflow-y-auto">
          {logs.length === 0 ? (
            <p className="text-gray-500">No logs yet. Generate an image to see logs.</p>
          ) : (
            <ul className="space-y-1">
              {logs.map((log, index) => (
                <li key={index} className="text-sm font-mono">{log}</li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
} 