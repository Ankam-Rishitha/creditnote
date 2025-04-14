import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function HomePage() {
  const [company, setCompany] = useState('');
  const [loanPurpose, setLoanPurpose] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/assess', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: company }),
      });

      const data = await res.json();
      if (res.ok) {
        navigate('/result', {
          state: {
            score: data.score,
            riskNarrative: data.risk_narrative,
            query: company,
          }
        });
      } else {
        alert(data.error || 'Error fetching assessment');
      }
    } catch (err) {
      alert('Server error');
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-950 via-blue-900 to-black">
      {/* keep your existing HomePage design intact */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-8 shadow-lg border border-white border-opacity-20">
          <h2 className="text-white text-2xl font-bold mb-6">Credit Risk Assessment</h2>

          <div className="space-y-6">
            <input
              type="text"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Enter Company Name or Query"
              className="w-full px-4 py-3 rounded-lg bg-white bg-opacity-10 text-white placeholder-blue-200 border border-white border-opacity-20 focus:outline-none"
            />
            <input
              type="text"
              value={loanPurpose}
              onChange={(e) => setLoanPurpose(e.target.value)}
              placeholder="Purpose of Loan (Not used for now)"
              className="w-full px-4 py-3 rounded-lg bg-white bg-opacity-10 text-white placeholder-blue-200 border border-white border-opacity-20"
            />

            <button
              onClick={handleSubmit}
              className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Generate Risk Assessment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;
