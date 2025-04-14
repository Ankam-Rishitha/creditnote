import { useState } from 'react';

import { useNavigate } from 'react-router-dom';

 

function HomePage() {

  const [company, setCompany] = useState('');

  const [loanPurpose, setLoanPurpose] = useState('');

  const [isLoading, setIsLoading] = useState(false);

  const [error, setError] = useState('');

  const navigate = useNavigate();

 

  const handleSubmit = async () => {

    if (!company.trim()) {

      setError('Please enter a company name');

      return;

    }

   

    setIsLoading(true);

    setError('');

 

    try {

      const response = await fetch('http://localhost:5000/api/assess', {

        method: 'POST',

        headers: { 'Content-Type': 'application/json' },

        body: JSON.stringify({ query: company }),

      });

 

      const data = await response.json();

     

      if (!response.ok) {

        throw new Error(data.error || 'Failed to get assessment');

      }

 

      navigate('/result', {

        state: {

          score: data.score,

          riskNarrative: data.risk_narrative,

          query: company,

        }

      });

 

    } catch (err) {

      setError(err.message || 'Failed to connect to server');

    } finally {

      setIsLoading(false);

    }

  };

 

  return (

    <div className="min-h-screen bg-black flex items-center justify-center p-6">

      <div className="bg-white/10 backdrop-blur p-8 rounded-2xl w-full max-w-xl border border-white/20">

        <h2 className="text-white text-2xl font-bold mb-6">Credit Risk Assessment</h2>

 

        {error && (

          <div className="mb-4 p-3 bg-red-500/30 text-red-200 rounded-lg">

            {error}

          </div>

        )}

 

        <div className="space-y-6">

          <input

            type="text"

            value={company}

            onChange={(e) => setCompany(e.target.value)}

            placeholder="Enter Company Name or Query"

            className="w-full px-4 py-3 rounded-lg bg-white/20 text-white placeholder-blue-200 border border-white/30 focus:outline-none"

          />

          <input

            type="text"

            value={loanPurpose}

            onChange={(e) => setLoanPurpose(e.target.value)}

            placeholder="Purpose of Loan"

            className="w-full px-4 py-3 rounded-lg bg-white/20 text-white placeholder-blue-200 border border-white/30 focus:outline-none"

          />

          <button

            onClick={handleSubmit}

            disabled={isLoading}

            className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed"

          >

            {isLoading ? 'Generating Assessment...' : 'Generate Risk Assessment'}

          </button>

        </div>

      </div>

    </div>

  );

}

 

export default HomePage;