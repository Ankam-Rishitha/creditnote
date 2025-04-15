import { useState, useEffect } from 'react';

import { useNavigate, useLocation } from 'react-router-dom';

import { ThumbsUp, ThumbsDown, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

 

function ResultPage() {

  const navigate = useNavigate();

  const { state } = useLocation();

  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);

  const [feedbackText, setFeedbackText] = useState('');

  const [scoreData, setScoreData] = useState<any>(null);

  const [isRegenerating, setIsRegenerating] = useState(false);

 

  useEffect(() => {

    if (!state) {

      navigate('/');

    } else {

      setScoreData(state);

    }

  }, [state, navigate]);

 

  const getScoreColor = (score: number) => {

    if (score >= 70) return 'text-green-400';

    if (score >= 40) return 'text-yellow-400';

    return 'text-red-400';

  };

 

  const handleFeedbackSubmit = async () => {

    if (!feedbackText.trim()) return;

   

    try {

      setIsRegenerating(true);

      // Submit feedback

      await fetch('http://localhost:5000/api/feedback', {

        method: 'POST',

        headers: { 'Content-Type': 'application/json' },

        body: JSON.stringify({

          feedback: 'narrative',

          text: feedbackText,

          query: scoreData?.query

        }),

      });

 

      // Regenerate assessment with feedback

      const response = await fetch('http://localhost:5000/api/assess', {

        method: 'POST',

        headers: { 'Content-Type': 'application/json' },

        body: JSON.stringify({

          query: scoreData?.query,

          feedback: feedbackText

        }),

      });

 

      if (!response.ok) throw new Error('Regeneration failed');

     

      const newData = await response.json();

      setScoreData({

        ...newData,

        loanDetails: scoreData?.loanDetails // Preserve loan details

      });

      setFeedback(null);

      setFeedbackText('');

 

    } catch (error) {

      console.error('Error:', error);

    } finally {

      setIsRegenerating(false);

    }

  };

 

  const handleApproveLoan = async () => {

    try {

      const response = await fetch('http://localhost:5000/api/generate-credit-note', {

        method: 'POST',

        headers: { 'Content-Type': 'application/json' },

        body: JSON.stringify({

          narrative: scoreData?.riskNarrative,

          query: scoreData?.query,

          loan_details: scoreData?.loanDetails

        }),

      });

 

      if (!response.ok) throw new Error('Credit note generation failed');

     

      const creditNoteData = await response.json();

      navigate('/credit-note', { state: creditNoteData });

 

    } catch (error) {

      console.error('Error:', error);

    }

  };

 

  if (!scoreData) return null;

 

  return (

    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-black">

      <div className="container mx-auto px-4 py-12">

        <div className="max-w-4xl mx-auto">

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-lg border border-white/20">

            {/* Score Header */}

            <div className="text-center mb-8">

              <h1 className="text-3xl font-bold text-white mb-2">

                Risk Score for {scoreData.query}

              </h1>

              <div className={`text-4xl font-bold ${getScoreColor(scoreData.score)}`}>

                {scoreData.score}/100

              </div>

            </div>

 

            {/* Risk Narrative */}

            <div className="mb-8 bg-black/20 p-6 rounded-xl">

              <h2 className="text-xl font-semibold text-white mb-4 flex items-center">

                <AlertCircle className="w-5 h-5 mr-2" />

                Risk Narrative

              </h2>

              <div className="text-blue-200 whitespace-pre-wrap">

                {scoreData.riskNarrative}

              </div>

            </div>

 

            {/* Feedback Section */}

            <div className="border-t border-white/20 pt-6">

              <h3 className="text-lg font-semibold text-white mb-4">

                {feedback === null && 'Was this Risk Narrative helpful?'}

                {feedback === 'down' && 'What could we improve?'}

                {feedback === 'up' && 'Loan Decision'}

              </h3>

 

              {feedback === null && (

                <div className="flex justify-center space-x-4">

                  <button

                    onClick={() => setFeedback('up')}

                    className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition"

                  >

                    <ThumbsUp className="w-6 h-6" />

                  </button>

                  <button

                    onClick={() => setFeedback('down')}

                    className="p-3 rounded-full bg-white/10 hover:bg-white/20 transition"

                  >

                    <ThumbsDown className="w-6 h-6" />

                  </button>

                </div>

              )}

 

              {feedback === 'down' && (

                <div className="space-y-4">

                  <textarea

                    value={feedbackText}

                    onChange={(e) => setFeedbackText(e.target.value)}

                    placeholder="Please specify what needs improvement..."

                    className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400"

                    rows={3}

                  />

                  <div className="flex justify-end space-x-3">

                    <button

                      onClick={() => setFeedback(null)}

                      className="px-4 py-2 text-blue-300 hover:text-white"

                    >

                      Cancel

                    </button>

                    <button

                      onClick={handleFeedbackSubmit}

                      disabled={isRegenerating}

                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400"

                    >

                      {isRegenerating ? 'Regenerating...' : 'Submit & Regenerate'}

                    </button>

                  </div>

                </div>

              )}

 

              {feedback === 'up' && (

                <div className="grid grid-cols-2 gap-4">

                  <button

                    onClick={handleApproveLoan}

                    className="p-4 bg-green-600/30 hover:bg-green-600/40 rounded-xl flex items-center justify-center space-x-2 transition"

                  >

                    <CheckCircle className="w-5 h-5" />

                    <span className="font-semibold">Approve Loan</span>

                  </button>

                  <button

                    onClick={() => navigate('/')}

                    className="p-4 bg-red-600/30 hover:bg-red-600/40 rounded-xl flex items-center justify-center space-x-2 transition"

                  >

                    <XCircle className="w-5 h-5" />

                    <span className="font-semibold">Reject Loan</span>

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

 