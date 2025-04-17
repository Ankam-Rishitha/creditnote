import { useState, ChangeEvent, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, FileText, AlertCircle, Gauge, Loader2 } from 'lucide-react';

interface FormData {
  companyName: string;
  loanAmount: string;
  loanTerm: string;
  loanPurpose: string;
  file: File | null;
}

function HomePage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    companyName: '',
    loanAmount: '1000000',
    loanTerm: '12',
    loanPurpose: 'Working capital',
    file: null,
  });
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState('');

  const validateForm = () => {
    const errors: Record<string, string> = {};
    
    if (!formData.companyName.trim()) {
      errors.companyName = 'Company name is required';
    }
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({ ...prev, file: e.target.files[0] }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    setApiError('');

    try {
      // Initialize assessment session with Flask backend
      const initResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/init-assessment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: formData.companyName,
          loan_details: {
            amount: formData.loanAmount,
            term: formData.loanTerm,
            purpose: formData.loanPurpose
          }
        }),
        credentials: 'include' // Required for session cookies
      });

      if (!initResponse.ok) {
        const errorData = await initResponse.json();
        throw new Error(errorData.error || 'Session initialization failed');
      }

      // Generate initial narrative with Flask backend
      const narrativeResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/generate-narrative`, {
        method: 'POST',
        credentials: 'include' // Send session cookies
      });

      if (!narrativeResponse.ok) {
        const errorData = await narrativeResponse.json();
        throw new Error(errorData.error || 'Failed to generate narrative');
      }

      const narrativeData = await narrativeResponse.json();

      navigate('/result', {
        state: {
          score: narrativeData.score,
          riskNarrative: narrativeData.narrative,
          sessionId: narrativeData.session_id,
          query: formData.companyName,
          loanDetails: {
            amount: formData.loanAmount,
            term: formData.loanTerm,
            purpose: formData.loanPurpose
          }
        }
      });

    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Failed to start assessment');
    } finally {
      setIsSubmitting(false);
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
          {apiError && (
            <div className="mb-6 p-4 bg-red-500/30 text-red-200 rounded-xl border border-red-400/50">
              {apiError}
            </div>
          )}

          {/* Main Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white bg-opacity-5 backdrop-blur-lg rounded-2xl p-8 shadow-[inset_0_2px_4px_rgba(255,255,255,0.1)] border border-white border-opacity-20">
              {/* Company Name Input */}
              <div className="mb-6">
                <label className="block text-blue-200 mb-2 font-medium">
                  Company Name *
                </label>
                <input
                  type="text"
                  className={`w-full px-4 py-3 rounded-xl bg-white/5 border ${
                    validationErrors.companyName ? 'border-red-400/50' : 'border-white/20'
                  } text-blue-100 placeholder-blue-300 transition`}
                  placeholder="Enter company name (e.g., Microsoft)"
                  value={formData.companyName}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    companyName: e.target.value
                  }))}
                />
                {validationErrors.companyName && (
                  <span className="text-red-400 text-sm mt-1">
                    {validationErrors.companyName}
                  </span>
                )}
              </div>

              {/* File Upload (Optional) */}
              <div className="mb-6">
                <label className="block text-blue-200 mb-2 font-medium">
                  Upload Documents (Optional)
                </label>
                <div className="relative">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="flex items-center justify-center w-full px-4 py-6 rounded-xl border-2 border-dashed border-blue-300/50 hover:border-blue-200 cursor-pointer transition-colors"
                  >
                    <div className="text-center">
                      <Upload className="w-8 h-8 text-blue-200 mx-auto mb-2" />
                      <p className="text-sm text-blue-200">
                        Drop your PDF here or click to upload
                      </p>
                    </div>
                  </label>
                </div>
              </div>

              {/* Loan Details */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div>
                  <label className="block text-blue-200 mb-2 font-medium">
                    Loan Amount
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-200">$</span>
                    <input
                      type="number"
                      className="w-full pl-8 pr-4 py-3 rounded-xl bg-white/5 border border-white/20 text-blue-100 transition"
                      value={formData.loanAmount}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        loanAmount: e.target.value
                      }))}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-blue-200 mb-2 font-medium">
                    Loan Term (months)
                  </label>
                  <input
                    type="number"
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/20 text-blue-100 transition"
                    value={formData.loanTerm}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      loanTerm: e.target.value
                    }))}
                  />
                </div>

                <div>
                  <label className="block text-blue-200 mb-2 font-medium">
                    Loan Purpose
                  </label>
                  <select
                    className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/20 text-blue-100 transition"
                    value={formData.loanPurpose}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      loanPurpose: e.target.value
                    }))}
                  >
                    <option value="Working capital">Working Capital</option>
                    <option value="Equipment purchase">Equipment Purchase</option>
                    <option value="Expansion">Business Expansion</option>
                    <option value="Debt refinancing">Debt Refinancing</option>
                  </select>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-blue-600 to-blue-800 text-white font-semibold text-lg hover:from-blue-700 hover:to-blue-900 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                <div className="flex items-center justify-center space-x-2">
                  {isSubmitting ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : (
                    <Gauge className="w-6 h-6" />
                  )}
                  <span>
                    {isSubmitting ? 'Generating Assessment...' : 'Generate Risk Assessment'}
                  </span>
                </div>
              </button>
            </div>
          </form>

          {/* Features Section */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="p-6 rounded-xl bg-white bg-opacity-10 backdrop-blur-lg border border-white border-opacity-20">
              <FileText className="w-8 h-8 text-blue-200 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Document Analysis</h3>
              <p className="text-blue-200">Advanced PDF parsing and analysis for comprehensive risk assessment</p>
            </div>
            <div className="p-6 rounded-xl bg-white bg-opacity-10 backdrop-blur-lg border border-white border-opacity-20">
              <AlertCircle className="w-8 h-8 text-blue-200 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Risk Scoring</h3>
              <p className="text-blue-200">Sophisticated AI algorithms to evaluate credit worthiness</p>
            </div>
            <div className="p-6 rounded-xl bg-white bg-opacity-10 backdrop-blur-lg border border-white border-opacity-20">
              <Gauge className="w-8 h-8 text-blue-200 mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">Instant Results</h3>
              <p className="text-blue-200">Get detailed risk analysis reports in seconds</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;