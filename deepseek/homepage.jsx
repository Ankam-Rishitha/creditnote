import React, { useState, ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, AlertCircle, Gauge } from 'lucide-react';

function HomePage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    description: '',
    loanAmount: '',
    loanTerm: '',
    reason: '',
    file: null as File | null,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({ ...prev, file: e.target.files![0] }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const form = new FormData();
      form.append('company', formData.description);
      form.append('loanAmount', formData.loanAmount);
      form.append('loanTerm', formData.loanTerm);
      form.append('reason', formData.reason);
      form.append('description', formData.description);
      if (formData.file) {
        form.append('file', formData.file);
      }

      const response = await fetch('/api/analyze', {
        method: 'POST',
        body: form,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Analysis failed');
      }

      const data = await response.json();
      navigate('/result', { state: data });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyze data');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-black">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold text-white mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-blue-100">
              AI Credit Risk Analyst
            </h1>
            <p className="text-blue-200 text-lg">
              Advanced risk assessment powered by artificial intelligence
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/20 border border-red-500/30 rounded-xl text-red-200">
              {error}
            </div>
          )}

          {/* Main Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-8 shadow-[inset_0_2px_4px_rgba(255,255,255,0.1)] border border-white border-opacity-20">
              {/* Form inputs remain the same as before */}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-4 px-6 rounded-xl bg-gradient-to-r from-blue-600 to-blue-800 text-white font-semibold text-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                  isLoading ? 'opacity-75 cursor-not-allowed' : 'hover:from-blue-700 hover:to-blue-900 hover:scale-[1.02]'
                }`}
              >
                <div className="flex items-center justify-center space-x-2">
                  {isLoading ? (
                    <div className="h-6 w-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Gauge className="w-6 h-6" />
                      <span>Generate Risk Assessment</span>
                    </>
                  )}
                </div>
              </button>
            </div>
          </form>

          {/* Features section remains the same as before */}
        </div>
      </div>
    </div>
  );
}

export default HomePage;