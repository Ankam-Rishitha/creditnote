import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ThumbsUp, ThumbsDown, CheckCircle, XCircle, AlertCircle, Loader2 } from 'lucide-react';

interface ScoreData {
  score: number;
  riskNarrative: string;
  query: string;
  sessionId: string;
  loanDetails: {
    amount: string;
    term: string;
    purpose: string;
  };
}

function ResultPage() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [scoreData, setScoreData] = useState<ScoreData | null>(null);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [apiError, setApiError] = useState('');

  useEffect(() => {
    if (!state) {
      navigate('/');
    } else {
      setScoreData(state as ScoreData);
    }
  }, [state, navigate]);

  const getScoreColor = (score: number) => {
    if (score <= 30) return 'text-green-400';
    if (score <= 70) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getRiskCategory = (score: number) => {
    if (score <= 30) return 'Low Risk';
    if (score <= 70) return 'Medium Risk';
    return 'High Risk';
  };

  const handleFeedbackSubmit = async () => {
    if (!feedbackText.trim() || !scoreData) return;
    
    try {
      setIsRegenerating(true);
      setApiError('');

      // Submit feedback to Flask backend
      const feedbackResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/submit-feedback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: feedbackText,
          session_id: scoreData.sessionId
        }),
        credentials: 'include'
      });

      if (!feedbackResponse.ok) {
        throw new Error('Feedback submission failed');
      }

      // Regenerate narrative with Flask backend
      const assessResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/generate-narrative`, {
        method: 'POST',
        credentials: 'include'
      });

      if (!assessResponse.ok) {
        const errorData = await assessResponse.json();
        throw new Error(errorData.error || 'Regeneration failed');
      }

      const newData = await assessResponse.json();
      setScoreData({
        ...newData,
        sessionId: scoreData.sessionId,
        loanDetails: scoreData.loanDetails
      });
      setFeedback(null);
      setFeedbackText('');

    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Request failed');
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleApproveLoan = async () => {
    if (!scoreData) return;

    try {
      setApiError('');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/generate-credit-note`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: scoreData.sessionId
        }),
        credentials: 'include'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Credit note generation failed');
      }

      const creditNoteData = await response.json();
      navigate('/credit-note', { state: creditNoteData });

    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Approval failed');
    }
  };

  if (!scoreData) return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-black flex items-center justify-center">
      <Loader2 className="w-12 h-12 text-blue-400 animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-black">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {apiError && (
            <div className="mb-6 p-4 bg-red-500/30 text-red-200 rounded-xl border border-red-400/50">
              <AlertCircle className="inline mr-2" />
              {apiError}
            </div>
          )}

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-xl border border-white/20">
            {/* Score Header */}
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-white mb-2">
                {scoreData.query} Credit Assessment
              </h1>
              <div className="flex flex-col items-center">
                <div className={`text-6xl font-bold ${getScoreColor(scoreData.score)} mb-2`}>
                  {scoreData.score}
                  <span className="text-2xl ml-2 text-blue-200">/100</span>
                </div>
                <div className="text-lg font-semibold text-blue-200">
                  {getRiskCategory(scoreData.score)} Category
                </div>
              </div>
            </div>

            {/* Loan Details */}
            <div className="grid grid-cols-3 gap-4 mb-8 bg-black/20 p-4 rounded-xl">
              <div className="text-center">
                <div className="text-sm text-blue-300">Loan Amount</div>
                <div className="text-lg text-white">
                  ${Number(scoreData.loanDetails.amount).toLocaleString()}
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-blue-300">Term</div>
                <div className="text-lg text-white">
                  {scoreData.loanDetails.term} months
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-blue-300">Purpose</div>
                <div className="text-lg text-white capitalize">
                  {scoreData.loanDetails.purpose.toLowerCase()}
                </div>
              </div>
            </div>

            {/* Risk Narrative */}
            <div className="mb-8 bg-black/20 p-6 rounded-xl">
              <h2 className="text-xl font-semibold text-white mb-4 flex items-center">
                <AlertCircle className="w-5 h-5 mr-2" />
                AI Risk Analysis
              </h2>
              <div className="text-blue-200 whitespace-pre-wrap leading-relaxed">
                {scoreData.riskNarrative}
              </div>
            </div>

            {/* Feedback Section */}
            <div className="border-t border-white/20 pt-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                {feedback === null && 'How would you rate this analysis?'}
                {feedback === 'down' && 'What needs improvement?'}
                {feedback === 'up' && 'Final Loan Decision'}
              </h3>

              {feedback === null && (
                <div className="flex justify-center space-x-4">
                  <button
                    onClick={() => setFeedback('up')}
                    className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition transform hover:scale-110"
                    aria-label="Positive feedback"
                  >
                    <ThumbsUp className="w-6 h-6 text-green-400" />
                  </button>
                  <button
                    onClick={() => setFeedback('down')}
                    className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition transform hover:scale-110"
                    aria-label="Negative feedback"
                  >
                    <ThumbsDown className="w-6 h-6 text-red-400" />
                  </button>
                </div>
              )}

              {feedback === 'down' && (
                <div className="space-y-4">
                  <textarea
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    placeholder="Specific feedback helps us improve..."
                    className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400"
                    rows={3}
                    disabled={isRegenerating}
                  />
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => setFeedback(null)}
                      className="px-4 py-2 text-blue-300 hover:text-white disabled:opacity-50"
                      disabled={isRegenerating}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleFeedbackSubmit}
                      disabled={isRegenerating || !feedbackText.trim()}
                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 flex items-center"
                    >
                      {isRegenerating && (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      )}
                      {isRegenerating ? 'Processing...' : 'Submit & Improve'}
                    </button>
                  </div>
                </div>
              )}

              {feedback === 'up' && (
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={handleApproveLoan}
                    className="p-4 bg-green-600/30 hover:bg-green-600/40 rounded-xl flex flex-col items-center justify-center space-y-2 transition transform hover:scale-[1.02]"
                  >
                    <CheckCircle className="w-8 h-8 text-green-400" />
                    <span className="font-semibold">Approve Loan</span>
                    <span className="text-sm text-green-200">Generate Credit Note</span>
                  </button>
                  <button
                    onClick={() => navigate('/')}
                    className="p-4 bg-red-600/30 hover:bg-red-600/40 rounded-xl flex flex-col items-center justify-center space-y-2 transition transform hover:scale-[1.02]"
                  >
                    <XCircle className="w-8 h-8 text-red-400" />
                    <span className="font-semibold">Reject Application</span>
                    <span className="text-sm text-red-200">Return to Dashboard</span>
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