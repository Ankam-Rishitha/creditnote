from flask import Flask, request, jsonify
from flask_cors import CORS

# Import your agents from your existing Agno flow script
from agents import risk_narrative_agent, scoring_agent, feedback_agent

app = Flask(__name__)
CORS(app)  # Enable CORS for all frontend requests

@app.route('/api/assess', methods=['POST'])
def assess():
    data = request.json
    query = data.get('query')
    
    if not query:
        return jsonify({'error': 'Query not provided'}), 400

    try:
        # Run risk narrative agent
        risk_narrative = risk_narrative_agent.invoke({"query": query})["output"]

        # Run scoring agent
        risk_score = scoring_agent.invoke({"query": query})["output"]

        return jsonify({
            "risk_narrative": risk_narrative,
            "score": int(risk_score)
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/feedback', methods=['POST'])
def feedback():
    data = request.json
    feedback_type = data.get('feedback')  # 'up' or 'down'
    query = data.get('query')

    if not query or not feedback_type:
        return jsonify({'error': 'Missing feedback or query'}), 400

    try:
        # Send to feedback agent (optional enhancement)
        feedback_agent.invoke({
            "query": query,
            "feedback": feedback_type
        })

        # You can also log this if needed
        print(f"Feedback received - Query: '{query}' | Type: {feedback_type}")
        
        return jsonify({'status': 'success', 'message': 'Feedback received'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
