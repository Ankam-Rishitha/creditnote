import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ThumbsUp, ThumbsDown, CheckCircle, XCircle } from 'lucide-react';

function ResultPage() {
  const navigate = useNavigate();
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);
  const [feedbackText, setFeedbackText] = useState('');

  // Dummy score
  const score = 75;

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-500';
    if (score >= 40) return 'text-yellow-500';
    return 'text-red-500';
  };

  const positives = [
    'Strong cash flow position',
    'Excellent credit history',
    'Stable industry sector',
    'Significant market presence',
  ];

  const negatives = [
    'High debt-to-equity ratio',
    'Recent market volatility',
    'Limited collateral assets',
  ];

  const handleFeedbackSubmit = () => {
    console.log('Feedback submitted:', feedbackText);
    setFeedbackText('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-black">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-8 shadow-lg border border-white border-opacity-20">
            <h2 className="text-2xl font-bold text-white mb-6">Risk Assessment Results</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Score Meter */}
              <div className="flex flex-col items-center justify-center">
                <div className="relative w-48 h-48">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      stroke="#334155"
                      strokeWidth="10"
                      fill="none"
                    />
                    <circle
                      cx="50"
                      cy="50"
                      r="45"
                      stroke={score >= 70 ? '#22c55e' : score >= 40 ? '#eab308' : '#ef4444'}
                      strokeWidth="10"
                      fill="none"
                      strokeDasharray="282.6"
                      strokeDashoffset={282.6 - (282.6 * score) / 100}
                      strokeLinecap="round"
                      className="transition-all duration-700"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className={`text-4xl font-bold ${getScoreColor(score)}`}>
                      {score}
                    </span>
                  </div>
                </div>
                <p className="mt-4 text-lg text-white">Risk Score</p>
              </div>

              {/* Analysis Lists */}
              <div className="space-y-8">
                <div>
                  <h3 className="text-xl font-semibold text-green-400 mb-4">Positive Factors</h3>
                  <ul className="space-y-3">
                    {positives.map((item, index) => (
                      <li key={index} className="flex items-center text-green-200">
                        <CheckCircle className="w-5 h-5 mr-3" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-red-400 mb-4">Risk Factors</h3>
                  <ul className="space-y-3">
                    {negatives.map((item, index) => (
                      <li key={index} className="flex items-center text-red-200">
                        <XCircle className="w-5 h-5 mr-3" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Feedback Section */}
            <div className="mt-10 pt-10 border-t border-white border-opacity-20">
              <h3 className="text-xl font-semibold text-white mb-4">
                Was this assessment helpful?
              </h3>
              <div className="flex space-x-4 mb-6">
                <button
                  onClick={() => setFeedback('up')}
                  className={`p-3 rounded-full transition-colors ${
                    feedback === 'up'
                      ? 'bg-green-500'
                      : 'bg-white bg-opacity-10 hover:bg-opacity-20'
                  }`}
                >
                  <ThumbsUp className="w-6 h-6" />
                </button>
                <button
                  onClick={() => setFeedback('down')}
                  className={`p-3 rounded-full transition-colors ${
                    feedback === 'down'
                      ? 'bg-red-500'
                      : 'bg-white bg-opacity-10 hover:bg-opacity-20'
                  }`}
                >
                  <ThumbsDown className="w-6 h-6" />
                </button>
              </div>

              {feedback === 'down' && (
                <div className="space-y-4">
                  <textarea
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    placeholder="Please tell us how we can improve..."
                    className="w-full px-4 py-3 rounded-xl bg-white bg-opacity-10 border border-white border-opacity-20 text-white placeholder-blue-200 placeholder-opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
                    rows={4}
                  />
                  <button
                    onClick={handleFeedbackSubmit}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    Submit Feedback
                  </button>
                </div>
              )}

              {feedback === 'up' && (
                <div className="flex space-x-4 mt-6">
                  <button
                    onClick={() => navigate('/credit-note')}
                    className="flex-1 py-3 px-6 bg-green-600 text-white rounded-xl hover:bg-green-700 transition flex items-center justify-center space-x-2"
                  >
                    <CheckCircle className="w-5 h-5" />
                    <span>Approve Loan</span>
                  </button>
                  <button
                    className="flex-1 py-3 px-6 bg-red-600 text-white rounded-xl hover:bg-red-700 transition flex items-center justify-center space-x-2"
                  >
                    <XCircle className="w-5 h-5" />
                    <span>Reject Loan</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResultPage;
