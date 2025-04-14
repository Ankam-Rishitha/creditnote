# app.py (Flask Backend)
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import tempfile
from your_backend_code import (  # Import your existing backend components
    risk_analysis_narrative_agent,
    risk_calculation_narrative_agent,
    credit_note_agent,
    feedback_agent,
    ScoreStructure,
    ml_model
)

app = Flask(__name__, static_folder='../frontend/build', static_url_path='')
CORS(app)

# Helper function to process uploaded PDF
def process_pdf(file):
    with tempfile.NamedTemporaryFile(delete=False) as tmp:
        file.save(tmp.name)
        # Add your PDF processing logic here
        return tmp.name

@app.route('/api/analyze', methods=['POST'])
def analyze_risk():
    try:
        # Get form data
        data = request.form
        file = request.files.get('file')
        
        # Process PDF if uploaded
        pdf_path = None
        if file and file.filename.endswith('.pdf'):
            pdf_path = process_pdf(file)
        
        # Construct query string
        query = f"""
        Company: {data.get('company')}
        Loan Amount: {data.get('loanAmount')}
        Loan Term: {data.get('loanTerm')} months
        Purpose: {data.get('reason')}
        Additional Details: {data.get('description')}
        """
        
        # Run risk analysis
        narrative_response = risk_analysis_narrative_agent.run(query)
        score_response = risk_calculation_narrative_agent.run(narrative_response.content)
        
        # Get ML model results
        ml_results = json.loads(ml_model())
        
        # Prepare response data
        response_data = {
            'score': score_response.score,
            'narrative': narrative_response.content,
            'positives': [
                'Strong cash flow position',
                'Excellent credit history',
                'Stable industry sector',
                'Significant market presence'
            ],
            'negatives': [
                'High debt-to-equity ratio',
                'Recent market volatility',
                'Limited collateral assets'
            ],
            'ml_features': ml_results['features_list'],
            'ml_score': ml_results['score']
        }
        
        return jsonify(response_data), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/feedback', methods=['POST'])
def handle_feedback():
    data = request.json
    feedback_type = data.get('type')
    feedback_text = data.get('text', '')
    
    if feedback_type == 'narrative':
        processed = feedback_agent.process_feedback_narrative(feedback_text)
    elif feedback_type == 'credit_note':
        processed = feedback_agent.process_feedback_note(feedback_text)
    else:
        return jsonify({'error': 'Invalid feedback type'}), 400
    
    return jsonify({'processed_feedback': processed}), 200

@app.route('/api/generate-credit-note', methods=['POST'])
def generate_credit_note():
    data = request.json
    narrative = data.get('narrative')
    query = data.get('query')
    
    try:
        credit_note = credit_note_agent.generate_credit_note(narrative, query)
        return jsonify({'credit_note': credit_note}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# Serve React Frontend
@app.route('/')
def serve():
    return send_from_directory(app.static_folder, 'index.html')

@app.errorhandler(404)
def not_found(e):
    return send_from_directory(app.static_folder, 'index.html')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)