'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

import Layout from '@/app/components/Layout'; 

export default function ProductRecommendationsPage() {
  const { status } = useSession();
  const router = useRouter();

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [analysisError, setAnalysisError] = useState('');

  // Protect the route
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    }
  }, [status, router]);
  
  const handleAnalyzeProducts = async () => {
    setIsAnalyzing(true);
    setAnalysisResult(null);
    setAnalysisError('');
    try {
        const res = await fetch('/api/ai/analyze-products', { method: 'POST' });
        const result = await res.json();
        if (!res.ok) throw new Error(result.message || 'Failed to analyze products.');
        setAnalysisResult(result);
    } catch (error) {
        setAnalysisError(error.message);
    } finally {
        setIsAnalyzing(false);
    }
  };

  if (status === 'loading') {
    return <Layout><p className="p-6">Loading...</p></Layout>;
  }

  return (
    <Layout>
      <div className="mb-8">
        <h2 className="text-3xl font-bold">AI Product Recommendations</h2>
        <p className="mt-1 text-sm text-gray-500">Get AI-powered suggestions to improve your product listings and boost sales.</p>
      </div>

      <div className="space-y-8 max-w-4xl">
        <div className="p-4 border border-gray-200 rounded-lg bg-white">
            <div className="flex items-center justify-between">
                <div>
                    <h4 className="font-semibold text-gray-800">Analyze Product Performance</h4>
                    <p className="mt-1 text-sm text-gray-600">Get suggestions for improving underperforming product titles and descriptions.</p>
                </div>
                <button
                    onClick={handleAnalyzeProducts}
                    disabled={isAnalyzing}
                    className="ml-4 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:bg-blue-300"
                >
                    {isAnalyzing ? 'Analyzing...' : 'Generate Suggestions'}
                </button>
            </div>
            <div className="mt-4">
                {analysisError && <p className="text-sm text-red-600">{analysisError}</p>}
                {analysisResult && (
                    <div className="p-4 bg-gray-50 rounded-md border">
                        <h5 className="font-semibold mb-4 text-gray-800">Product Suggestions:</h5>
                        {Array.isArray(analysisResult) ? (
                            <div className="space-y-4">
                                {analysisResult.map((p, i) => (
                                    <div key={i} className="pb-4 border-b last:border-b-0">
                                        <p className="font-semibold text-sm text-gray-800">{p.originalName}</p>
                                        <p className="text-sm text-gray-500 mt-2">Suggested Name: <span className="font-medium text-gray-900">{p.newName}</span></p>
                                        <p className="text-sm text-gray-500 mt-1">Suggested Description: <span className="italic">&quot;{p.newDescription}&quot;</span></p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-600">{analysisResult.message}</p>
                        )}
                    </div>
                )}
            </div>
        </div>
      </div>
    </Layout>
  );
}
