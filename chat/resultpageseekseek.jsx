import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ThumbsUp, ThumbsDown, CheckCircle, XCircle } from 'lucide-react';

function ResultPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { score, riskNarrative, query } = location.state || {};

  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);
  const [feedbackText, setFeedbackText] = useState('');

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-500';
    if (score >= 40) return 'text-yellow-500';
    return 'text-red-500';
  };

  const handleFeedbackSubmit = async () => {
    await fetch('http://localhost:5000/api/feedback', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ feedback, query }),
    });
    setFeedbackText('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-black">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-8 shadow-lg border border-white border-opacity-20">
          <h2 className="text-2xl font-bold text-white mb-6">Risk Assessment Results</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex flex-col items-center justify-center">
              <div className="relative w-48 h-48">
                <div className="absolute inset-0 rounded-full border-8 border-gray-700"></div>
                <div
                  className="absolute inset-0 rounded-full border-8 border-transparent"
                  style={{
                    borderTopColor: score >= 70 ? '#22c55e' : score >= 40 ? '#eab308' : '#ef4444',
                    transform: `rotate(${score * 3.6}deg)`,
                    transition: 'transform 1s ease-out',
                  }}
                ></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className={`text-4xl font-bold ${getScoreColor(score)}`}>{score}</span>
                </div>
              </div>
              <p className="mt-4 text-lg text-white">Risk Score</p>
            </div>

            <div className="text-white whitespace-pre-wrap">
              <h3 className="text-xl font-semibold mb-4">Risk Narrative</h3>
              <div className="text-blue-200">{riskNarrative}</div>
            </div>
          </div>

          {/* Feedback Section */}
          <div className="mt-8 pt-8 border-t border-white border-opacity-20">
            <h3 className="text-xl font-semibold text-white mb-4">Was this assessment helpful?</h3>
            <div className="flex space-x-4 mb-6">
              <button
                onClick={() => setFeedback('up')}
                className={`p-3 rounded-full ${feedback === 'up' ? 'bg-green-500' : 'bg-white bg-opacity-10 hover:bg-opacity-20'}`}
              >
                <ThumbsUp className="w-6 h-6" />
              </button>
              <button
                onClick={() => setFeedback('down')}
                className={`p-3 rounded-full ${feedback === 'down' ? 'bg-red-500' : 'bg-white bg-opacity-10 hover:bg-opacity-20'}`}
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
                  className="w-full px-4 py-3 rounded-xl bg-white bg-opacity-10 text-white"
                  rows={4}
                />
                <button
                  onClick={handleFeedbackSubmit}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Submit Feedback
                </button>
              </div>
            )}

            {feedback === 'up' && (
              <div className="flex space-x-4">
                <button className="flex-1 py-3 px-6 bg-green-600 text-white rounded-xl flex items-center justify-center space-x-2">
                  <CheckCircle className="w-5 h-5" />
                  <span>Approve Loan</span>
                </button>
                <button className="flex-1 py-3 px-6 bg-red-600 text-white rounded-xl flex items-center justify-center space-x-2">
                  <XCircle className="w-5 h-5" />
                  <span>Reject Loan</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResultPage;
