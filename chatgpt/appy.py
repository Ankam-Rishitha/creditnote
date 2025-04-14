from flask import Flask, request, jsonify
from flask_cors import CORS
from main import risk_analysis_narrative_agent, risk_calculation_narrative_agent  # from your backend
from agno.utils.pprint import pprint_run_response
from agno.agent import RunResponse

app = Flask(__name__)
CORS(app)  # Allow CORS for React frontend

@app.route("/api/generate", methods=["POST"])
def generate_risk_data():
    data = request.json
    company_query = data.get("query")

    if not company_query:
        return jsonify({"error": "Missing company query"}), 400

    try:
        # Run narrative agent
        narrative_response: RunResponse = risk_analysis_narrative_agent.run(company_query)
        narrative = narrative_response.content.strip()

        # Run scoring agent
        score_response: RunResponse = risk_calculation_narrative_agent.run(narrative)
        score_data = score_response.model_dump()

        return jsonify({
            "narrative": narrative,
            "score": score_data.get("score", 0.0)
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(debug=True, port=5000)
