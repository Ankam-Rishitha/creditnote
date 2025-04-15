import { useState, ChangeEvent } from 'react';

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

 

    if (!formData.description.trim()) {

      setError('Please enter a company name');

      return;

    }

 

    setIsLoading(true);

    setError('');

 

    try {

      const response = await fetch('http://localhost:5000/api/assess', {

        method: 'POST',

        headers: { 'Content-Type': 'application/json' },

        body: JSON.stringify({ query: formData.description }),

      });

 

      const data = await response.json();

     

      if (!response.ok) {

        throw new Error(data.error || 'Failed to get assessment');

      }

 

      navigate('/result', {

        state: {

          score: data.score,

          riskNarrative: data.risk_narrative,

          query: formData.description,

        }

      });

 

    } catch (err) {

      setError(err.message || 'Failed to connect to server');

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

            <div className="mb-6 p-4 bg-red-500/30 text-red-200 rounded-xl border border-red-400/50">

              {error}

            </div>

          )}

 

          {/* Main Form */}

          <form onSubmit={handleSubmit} className="space-y-6">

            <div className="bg-white bg-opacity-5 backdrop-blur-lg rounded-2xl p-8 shadow-[inset_0_2px_4px_rgba(255,255,255,0.1)] border border-white border-opacity-20">

              {/* Company Name Input */}

              <div className="mb-6">

                <label className="block text-blue-200 mb-2 font-medium">

                  Company Name

                </label>

                <textarea

                  className="w-full h-32 px-4 py-3 rounded-xl bg-white bg-opacity-5 border border-white border-opacity-20

                    text-blue-100 placeholder-blue-300 placeholder-opacity-60

                    focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"

                  placeholder="Enter your company name..."

                  value={formData.description}

                  onChange={(e) => setFormData(prev => ({

                    ...prev,

                    description: e.target.value

                  }))}

                />

              </div>

 

              {/* File Upload */}

              <div className="mb-6">

                <label className="block text-blue-200 mb-2 font-medium">

                  Upload Documents

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

                    className="flex items-center justify-center w-full px-4 py-6 rounded-xl border-2 border-dashed border-blue-300 border-opacity-50 cursor-pointer hover:border-blue-200 transition-colors"

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

 

              {/* Numeric Inputs */}

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">

                <div>

                  <label className="block text-blue-200 mb-2 font-medium">

                    Loan Amount

                  </label>

                  <div className="relative">

                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-200">$</span>

                    <input

                      type="number"

                      className="w-full px-8 py-3 rounded-xl bg-white bg-opacity-5 border border-white border-opacity-20

                        text-blue-100 placeholder-blue-300 placeholder-opacity-60

                        focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"

                      placeholder="50000"

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

                    className="w-full px-4 py-3 rounded-xl bg-white bg-opacity-5 border border-white border-opacity-20

                      text-blue-100 placeholder-blue-300 placeholder-opacity-60

                      focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"

                    placeholder="36"

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

                  <input

                    type="text"

                    className="w-full px-4 py-3 rounded-xl bg-white bg-opacity-5 border border-white border-opacity-20

                      text-blue-100 placeholder-blue-300 placeholder-opacity-60

                      focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"

                    placeholder="Enter loan purpose..."

                    value={formData.reason}

                    onChange={(e) => setFormData(prev => ({

                      ...prev,

                      reason: e.target.value

                    }))}

                  />

                </div>

              </div>

 

              {/* Submit Button */}

              <button

                type="submit"

                disabled={isLoading}

                className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-blue-600 to-blue-800 text-white font-semibold text-lg hover:from-blue-700 hover:to-blue-900 transform hover:scale-[1.02] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 disabled:cursor-not-allowed"

              >

                <div className="flex items-center justify-center space-x-2">

                  <Gauge className="w-6 h-6" />

                  <span>

                    {isLoading ? 'Generating Assessment...' : 'Generate Risk Assessment'}

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