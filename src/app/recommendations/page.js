'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import Layout from '@/app/components/Layout'; 

export default function RecommendationsPage() {
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
  
  const handleAnalyzeHomepage = async () => {
    setIsAnalyzing(true);
    setAnalysisResult(null);
    setAnalysisError('');
    try {
      const res = await fetch('/api/ai/analyze-homepage', { method: 'POST' });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Failed to analyze homepage.');
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
        <h2 className="text-3xl font-bold">AI Recommendations</h2>
        <p className="mt-1 text-sm text-gray-500">Generate reports and recommendations to improve your site&apos;s performance.</p>
      </div>

      <div className="max-w-4xl">
        <div className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between">
                <div>
                    <h4 className="font-semibold text-gray-800">Analyze Homepage</h4>
                    <p className="mt-1 text-sm text-gray-600">Get AI recommendations on your homepage&apos;s layout, copy, and performance.</p>
                </div>
                <button
                    onClick={handleAnalyzeHomepage}
                    disabled={isAnalyzing}
                    className="ml-4 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:bg-blue-300"
                >
                    {isAnalyzing ? 'Analyzing...' : 'Generate Report'}
                </button>
            </div>

            <div className="mt-4">
                {analysisError && <p className="text-sm text-red-600">{analysisError}</p>}
                {analysisResult && (
                    <div className="p-4 bg-gray-50 rounded-md border">
                        <h5 className="font-semibold mb-4 text-gray-800">Analysis Complete:</h5>
                        <div className="space-y-6">
                            {Object.entries(analysisResult).map(([category, recommendations]) => (
                                <div key={category}>
                                    <h6 className="font-semibold text-gray-700 capitalize">{category}</h6>
                                    <ul className="mt-2 list-disc list-inside space-y-2 text-sm text-gray-600">
                                        {Array.isArray(recommendations) && recommendations.map((rec, index) => (
                                           <li key={index}>{rec.recommendation} <span className="text-gray-400">(Confidence: {Math.round(rec.confidence * 100)}%)</span></li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
        {/* You can add more analysis sections here in the future */}
      </div>
    </Layout>
  );
}
