import { useState, useEffect } from 'react';

import { useNavigate, useLocation } from 'react-router-dom';

import { ThumbsUp, ThumbsDown, Download } from 'lucide-react';

 

function CreditNotePage() {

  const navigate = useNavigate();

  const { state } = useLocation();

  const [feedback, setFeedback] = useState<'up' | 'down' | null>(null);

  const [feedbackText, setFeedbackText] = useState('');

  const [creditNoteData, setCreditNoteData] = useState<any>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

 

  useEffect(() => {

    if (!state) {

      navigate('/');

    } else {

      setCreditNoteData(state);

    }

  }, [state, navigate]);

 

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

      const response = await fetch('http://localhost:5000/api/feedback', {

        method: 'POST',

        headers: { 'Content-Type': 'application/json' },

        body: JSON.stringify({

          feedback: 'note',

          text: feedbackText,

          query: creditNoteData.company

        }),

      });

 

      if (!response.ok) throw new Error('Feedback submission failed');

     

      setFeedback(null);

      setFeedbackText('');

    } catch (error) {

      console.error('Feedback error:', error);

    } finally {

      setIsSubmitting(false);

    }

  };

 

  if (!creditNoteData) return null;

 

  return (

    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-black">

      <div className="container mx-auto px-4 py-12">

        <div className="max-w-4xl mx-auto">

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

                  ${creditNoteData.loan_details?.amount || 'N/A'}

                </p>

              </div>

              <div className="bg-white/5 p-4 rounded-xl">

                <p className="text-blue-300">Loan Term</p>

                <p className="text-2xl font-semibold text-white">

                  {creditNoteData.loan_details?.term || 'N/A'} months

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

                      disabled={isSubmitting}

                      className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400"

                    >

                      {isSubmitting ? 'Submitting...' : 'Submit Feedback'}

                    </button>

                  </div>

                </div>

              )}

 

              {feedback === 'up' && (

                <div className="text-center text-green-400">

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