'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

import Layout from '@/app/components/Layout'; 

export default function RecommendationsPage() {
  const { status } = useSession();
  const router = useRouter();

  // State for homepage analysis
  const [isAnalyzingHomepage, setIsAnalyzingHomepage] = useState(false);
  const [homepageResult, setHomepageResult] = useState(null);
  const [homepageError, setHomepageError] = useState('');

  // --- NEW STATE for product analysis ---
  const [isAnalyzingProducts, setIsAnalyzingProducts] = useState(false);
  const [productResult, setProductResult] = useState(null);
  const [productError, setProductError] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') { router.push('/'); }
  }, [status, router]);
  
  const handleAnalyzeHomepage = async () => {
    setIsAnalyzingHomepage(true);
    setHomepageResult(null);
    setHomepageError('');
    try {
      const res = await fetch('/api/ai/analyze-homepage', { method: 'POST' });
      const result = await res.json();
      if (!res.ok) throw new Error(result.message || 'Failed to analyze homepage.');
      setHomepageResult(result);
    } catch (error) {
      setHomepageError(error.message);
    } finally {
      setIsAnalyzingHomepage(false);
    }
  };

  // --- NEW handler for product analysis ---
  const handleAnalyzeProducts = async () => {
    setIsAnalyzingProducts(true);
    setProductResult(null);
    setProductError('');
    try {
        const res = await fetch('/api/ai/analyze-products', { method: 'POST' });
        const result = await res.json();
        if (!res.ok) throw new Error(result.message || 'Failed to analyze products.');
        setProductResult(result);
    } catch (error) {
        setProductError(error.message);
    } finally {
        setIsAnalyzingProducts(false);
    }
  };


  if (status === 'loading') { return <Layout><p>Loading...</p></Layout>; }

  return (
    <Layout>
      <div className="mb-8">
        <h2 className="text-3xl font-bold">AI Recommendations</h2>
        <p className="mt-1 text-sm text-gray-500">Generate reports to improve your site&apos;s performance.</p>
      </div>

      <div className="space-y-8 max-w-4xl">
        {/* Corrected: Restored the Homepage Analysis JSX */}
        <div className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between">
                <div>
                    <h4 className="font-semibold text-gray-800">Analyze Homepage</h4>
                    <p className="mt-1 text-sm text-gray-600">Get AI recommendations on your homepage&apos;s layout, copy, and performance.</p>
                </div>
                <button
                    onClick={handleAnalyzeHomepage}
                    disabled={isAnalyzingHomepage}
                    className="ml-4 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:bg-blue-300"
                >
                    {isAnalyzingHomepage ? 'Analyzing...' : 'Generate Report'}
                </button>
            </div>
            <div className="mt-4">
                {homepageError && <p className="text-sm text-red-600">{homepageError}</p>}
                {homepageResult && (
                    <div className="p-4 bg-gray-50 rounded-md border">
                        <h5 className="font-semibold mb-4 text-gray-800">Homepage Analysis Complete:</h5>
                        <div className="space-y-6">
                            {Object.entries(homepageResult).map(([category, recommendations]) => (
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

        {/* --- Product Performance Analysis Section --- */}
        <div className="p-4 border border-gray-200 rounded-lg">
            <div className="flex items-center justify-between">
                <div>
                    <h4 className="font-semibold text-gray-800">Analyze Product Performance</h4>
                    <p className="mt-1 text-sm text-gray-600">Get suggestions for improving underperforming product titles and descriptions.</p>
                </div>
                <button
                    onClick={handleAnalyzeProducts}
                    disabled={isAnalyzingProducts}
                    className="ml-4 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:bg-blue-300"
                >
                    {isAnalyzingProducts ? 'Analyzing...' : 'Generate Suggestions'}
                </button>
            </div>
            <div className="mt-4">
                {productError && <p className="text-sm text-red-600">{productError}</p>}
                {productResult && (
                    <div className="p-4 bg-gray-50 rounded-md border">
                        <h5 className="font-semibold mb-4 text-gray-800">Product Suggestions:</h5>
                        {Array.isArray(productResult) ? (
                            <div className="space-y-4">
                                {productResult.map((p, i) => (
                                    <div key={i}>
                                        <p className="font-semibold text-sm text-gray-800">{p.originalName}</p>
                                        <p className="text-sm text-gray-500 mt-1">Suggested Name: <span className="font-medium text-gray-900">{p.newName}</span></p>
                                        {/* Corrected: Replaced "" with &quot; */}
                                        <p className="text-sm text-gray-500 mt-1">Suggested Description: <span className="italic">&quot;{p.newDescription}&quot;</span></p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-gray-600">{productResult.message}</p>
                        )}
                    </div>
                )}
            </div>
        </div>
      </div>
    </Layout>
  );
}
