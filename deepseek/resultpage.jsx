import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ThumbsUp, ThumbsDown, CheckCircle, XCircle } from 'lucide-react';

interface ResultData {
  score: number;
  positives: string[];
  negatives: string[];
  ml_features: string[];
  ml_score: number;
}

function ResultPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackError, setFeedbackError] = useState('');
  const [scoreProgress, setScoreProgress] = useState(0);

  // Get data from navigation state
  const resultData: ResultData = location.state || {
    score: 75,
    positives: [],
    negatives: [],
    ml_features: [],
    ml_score: 0
  };

  const { score, positives, negatives, ml_features, ml_score } = resultData;

  // Score animation
  useEffect(() => {
    const animateScore = setTimeout(() => {
      setScoreProgress(score);
    }, 100);
    return () => clearTimeout(animateScore);
  }, [score]);

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-500';
    if (score >= 40) return 'text-yellow-500';
    return 'text-red-500';
  };

  const handleFeedbackSubmit = async () => {
    if (!feedbackText.trim()) return;
    
    try {
      setIsSubmitting(true);
      setFeedbackError('');
      
      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'narrative',
          text: feedbackText
        })
      });

      if (!response.ok) throw new Error('Feedback submission failed');
      
      setFeedbackText('');
      setFeedback(null);
    } catch (err) {
      setFeedbackError(err instanceof Error ? err.message : 'Failed to submit feedback');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-black">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Results Container */}
          <div className="bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-8 shadow-lg border border-white border-opacity-20">
            <h2 className="text-2xl font-bold text-white mb-6">Risk Assessment Results</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Score Circle */}
              <div className="flex flex-col items-center justify-center">
                <div className="relative w-48 h-48">
                  <div className="absolute inset-0 rounded-full border-8 border-gray-700"></div>
                  <div 
                    className="absolute inset-0 rounded-full border-8 border-transparent"
                    style={{
                      borderTopColor: score >= 70 ? '#22c55e' : score >= 40 ? '#eab308' : '#ef4444',
                      transform: `rotate(${scoreProgress * 3.6}deg)`,
                      transition: 'transform 1s ease-out',
                    }}
                  ></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className={`text-4xl font-bold ${getScoreColor(score)}`>
                      {score}
                    </span>
                  </div>
                </div>
                <div className="mt-4 text-blue-200 text-sm">
                  ML Model Score: {ml_score.toFixed(1)}
                </div>
                <p className="mt-2 text-lg text-white">Risk Score</p>
              </div>

              <div className="space-y-8">
                {/* ML Features */}
                <div className="p-4 bg-white/5 rounded-xl">
                  <h3 className="text-sm font-semibold text-blue-300 mb-2">Key ML Factors</h3>
                  <div className="flex flex-wrap gap-2">
                    {ml_features.map((feature, index) => (
                      <span 
                        key={index}
                        className="px-3 py-1 text-xs bg-blue-900/30 text-blue-200 rounded-full"
                      >
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Positives */}
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

                {/* Negatives */}
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
            <div className="mt-8 pt-8 border-t border-white border-opacity-20">
              <h3 className="text-xl font-semibold text-white mb-4">Was this assessment helpful?</h3>
              <div className="flex space-x-4 mb-6">
                <button
                  onClick={() => setFeedback('up')}
                  className={`p-3 rounded-full transition-colors ${
                    feedback === 'up' ? 'bg-green-500' : 'bg-white bg-opacity-10 hover:bg-opacity-20'
                  }`}
                  aria-label="Positive feedback"
                >
                  <ThumbsUp className="w-6 h-6" />
                </button>
                <button
                  onClick={() => setFeedback('down')}
                  className={`p-3 rounded-full transition-colors ${
                    feedback === 'down' ? 'bg-red-500' : 'bg-white bg-opacity-10 hover:bg-opacity-20'
                  }`}
                  aria-label="Negative feedback"
                >
                  <ThumbsDown className="w-6 h-6" />
                </button>
              </div>

              {feedbackError && (
                <div className="mb-4 text-red-300 text-sm">{feedbackError}</div>
              )}

              {feedback === 'down' && (
                <div className="space-y-4">
                  <textarea
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    placeholder="Please tell us how we can improve..."
                    className="w-full px-4 py-3 rounded-xl bg-white bg-opacity-10 border border-white border-opacity-20 text-white placeholder-blue-200 placeholder-opacity-50 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent transition"
                    rows={4}
                    aria-label="Feedback input"
                  />
                  <button
                    onClick={handleFeedbackSubmit}
                    disabled={isSubmitting}
                    className={`px-6 py-2 bg-blue-600 text-white rounded-lg transition ${
                      isSubmitting ? 'opacity-75 cursor-not-allowed' : 'hover:bg-blue-700'
                    }`}
                  >
                    {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                  </button>
                </div>
              )}

              {feedback === 'up' && (
                <div className="flex space-x-4">
                  <button
                    onClick={() => navigate('/credit-note', { state: resultData })}
                    className="flex-1 py-3 px-6 bg-green-600 text-white rounded-xl hover:bg-green-700 transition flex items-center justify-center space-x-2"
                  >
                    <CheckCircle className="w-5 h-5" />
                    <span>Approve Loan</span>
                  </button>
                  <button
                    onClick={() => navigate('/')}
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