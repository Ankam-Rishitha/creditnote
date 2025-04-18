import { useState, useEffect } from 'react';

import { useNavigate, useLocation } from 'react-router-dom';

import { ThumbsUp, ThumbsDown, Download, CheckCircle, Loader2, AlertCircle } from 'lucide-react';

 

interface CreditNoteData {

  credit_note: string;

  company: string;

  loan_details: {

    amount: string;

    term: string;

    purpose: string;

  };

  sessionId: string;

  feedbackCount: number;

}

 

function CreditNotePage() {

  const navigate = useNavigate();

  const { state } = useLocation();

  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);

  const [feedbackText, setFeedbackText] = useState('');

  const [creditNoteData, setCreditNoteData] = useState<CreditNoteData | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [apiError, setApiError] = useState('');

  const [isLoading, setIsLoading] = useState(true);

 

  useEffect(() => {

    if (!state) {

      navigate('/');

    } else {

      console.log('Received state:', state);

      setCreditNoteData({

        credit_note: (state as any).creditNote || (state as any).credit_note,

        company: (state as any).company,

        loan_details: (state as any).loanDetails || (state as any).loan_details,

        sessionId: (state as any).sessionId,

        feedbackCount: (state as any).feedback_count || 0 // Add feedback count

      });

      setIsLoading(false);

    }

  }, [state, navigate]);  

  if (isLoading) {

    return <div className=""><Loader2 className="animate-spin" /></div>;

  }

 

  const handleDownload = () => {

    if (!creditNoteData) return;

    const element = document.createElement('a');

    const file = new Blob([creditNoteData.credit_note], { type: 'text/plain' });

    element.href = URL.createObjectURL(file);

    element.download = `${creditNoteData.company}-credit-note.txt`;

    document.body.appendChild(element);

    element.click();

  };

 

  const handleFeedbackSubmit = async () => {

    if (!feedbackText.trim() || !creditNoteData) return;

 

    try {

      setIsSubmitting(true);

      setApiError('');

 

      // Submit to credit note specific endpoint

      const response = await fetch(`http://localhost:5000/api/submit-creditnote-feedback`, {

        method: 'POST',

        headers: { 'Content-Type': 'application/json' },

        body: JSON.stringify({

          text: feedbackText,

          session_id: creditNoteData.sessionId

        }),

        credentials: 'include'

      });

 

      if (!response.ok) {

        const errorData = await response.json();

        throw new Error(errorData.error || 'Feedback submission failed');

      }

 

      // Regenerate credit note with feedback

      const regenerateResponse = await fetch(`http://localhost:5000/api/generate-credit-note`, {

        method: 'POST',

        credentials: 'include'

      });

 

      if (!regenerateResponse.ok) {

        throw new Error('Credit note regeneration failed');

      }

 

      const newData = await regenerateResponse.json();

 

      // Update state with new credit note and feedback count

      setCreditNoteData(prev => ({

        ...prev!,

        credit_note: newData.credit_note,

        feedbackCount: newData.feedback_count

      }));

 

      setFeedback(null);

      setFeedbackText('');

 

    } catch (err) {

      setApiError(err instanceof Error ? err.message : 'Failed to submit feedback');

    } finally {

      setIsSubmitting(false);

    }

  };

 

 

  if (!creditNoteData) return (

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

 

          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-lg border border-white/20">

            {/* Header */}

            <div className="mb-8 text-center">

              <h1 className="text-3xl font-bold text-white">

                Credit Note for {creditNoteData.company}

              </h1>

              <p className="text-blue-300 mt-2">

                Generated on {new Date().toLocaleDateString()}

              </p>

            </div>

 

            {/* Loan Details */}

            <div className="grid grid-cols-2 gap-4 mb-8">

              <div className="bg-white/5 p-4 rounded-xl">

                <p className="text-blue-300">Loan Amount</p>

                <p className="text-2xl font-semibold text-white">

                  ${Number(creditNoteData.loan_details.amount).toLocaleString()}

                </p>

              </div>

              <div className="bg-white/5 p-4 rounded-xl">

                <p className="text-blue-300">Loan Term</p>

                <p className="text-2xl font-semibold text-white">

                  {creditNoteData.loan_details.term} months

                </p>

              </div>

            </div>

 

            {/* Credit Note Content */}

            <div className="mb-8 bg-black/20 p-6 rounded-xl">

              <pre className="whitespace-pre-wrap text-blue-200 font-mono">

                {creditNoteData.credit_note}

              </pre>

            </div>

 

            {/* Download Section */}

            <div className="mb-8">

              <button

                onClick={handleDownload}

                className="w-full py-3 px-6 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition flex items-center justify-center space-x-2"

              >

                <Download className="w-5 h-5" />

                <span>Download Credit Note</span>

              </button>

            </div>

 

            {/* Feedback Section */}

            <div className="border-t border-white/20 pt-6">

              <h3 className="text-lg font-semibold text-white mb-4">

                Was this credit note helpful?

              </h3>

 

              <div className="flex justify-center space-x-4 mb-4">

                <button

                  onClick={() => setFeedback('up')}

                  className={`p-3 rounded-full transition-colors ${

                    feedback === 'up' ? 'bg-green-500' : 'bg-white/10 hover:bg-white/20'

                  }`}

                >

                  <ThumbsUp className="w-6 h-6" />

                </button>

                <button

                  onClick={() => setFeedback('down')}

                  className={`p-3 rounded-full transition-colors ${

                    feedback === 'down' ? 'bg-red-500' : 'bg-white/10 hover:bg-white/20'

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

                    placeholder="Please specify what needs improvement..."

                    className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-400"

                    rows={3}

                    disabled={isSubmitting}

                  />

                  <div className="flex justify-end space-x-3">

                    <button

                      onClick={() => setFeedback(null)}

                      className="px-4 py-2 text-blue-300 hover:text-white disabled:opacity-50"

                      disabled={isSubmitting}

                    >

                      Cancel

                    </button>

                    <button

                      onClick={handleFeedbackSubmit}

                      disabled={isSubmitting || !feedbackText.trim()}

                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 flex items-center"

                    >

                      {isSubmitting && (

                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />

                      )}

                      {isSubmitting ? 'Submitting...' : 'Submit Feedback'}

                    </button>

                  </div>

                </div>

              )}

 

              {feedback === 'up' && (

                <div className="text-center text-green-400 mt-4">

                  <CheckCircle className="w-8 h-8 mx-auto mb-2" />

                  Thank you for your feedback!

                </div>

              )}

            </div>

          </div>

        </div>

      </div>

    </div>

  );

}

 

export default CreditNotePage;