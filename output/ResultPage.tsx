import { useLocation } from 'react-router-dom';

 

function ResultPage() {

  const { state } = useLocation();

 

  return (

    <div className="min-h-screen bg-black flex items-center justify-center p-6">

      <div className="bg-white/10 backdrop-blur p-8 rounded-2xl w-full max-w-4xl border border-white/20">

        <h1 className="text-3xl font-bold text-white mb-6">

          Assessment for: {state.query}

        </h1>

       

        <div className="mb-8">

          <h2 className="text-xl font-semibold text-blue-400 mb-2">

            Risk Score: {state.score}/100

          </h2>

          <div className="w-full bg-gray-800 rounded-full h-4">

            <div

              className="bg-blue-600 h-4 rounded-full"

              style={{ width: `${state.score}%` }}

            ></div>

          </div>

        </div>

 

        <div className="space-y-6">

          <div className="bg-black/30 p-6 rounded-xl">

            <h3 className="text-xl font-semibold text-white mb-4">Risk Narrative</h3>

            <div className="text-gray-300 whitespace-pre-wrap">

              {state.riskNarrative}

            </div>

          </div>

 

          <button

            onClick={() => window.history.back()}

            className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"

          >

            Back to Assessment

          </button>

        </div>

      </div>

    </div>

  );

}

 

export default ResultPage;

