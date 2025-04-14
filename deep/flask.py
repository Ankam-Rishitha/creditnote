# Add these imports at the top
from flask import Flask, request, jsonify
from flask_cors import CORS

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS

# Add this endpoint above the existing main()
@app.route('/api/analyze', methods=['POST'])
def analyze():
    try:
        data = request.get_json()
        user_query = data.get('query', '')
        
        # Generate risk narrative
        narrative_response = risk_analysis_narrative_agent.run(user_query)
        score_response = risk_calculation_narrative_agent.run(narrative_response.content)
        
        return jsonify({
            'narrative': narrative_response.content,
            'score': score_response.score,
            'status': 'success'
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Add feedback endpoint
@app.route('/api/feedback', methods=['POST'])
def handle_feedback():
    try:
        data = request.get_json()
        print("Received feedback:", data)  # Replace with your storage logic
        return jsonify({'status': 'success'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Modify the main block at the bottom
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)