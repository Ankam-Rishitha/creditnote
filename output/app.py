from flask import Flask, request, jsonify

from flask_cors import CORS

from agentic import (

    risk_analysis_narrative_agent,

    risk_calculation_narrative_agent,

    feedback_agent,

)

 

app = Flask(__name__)

CORS(app)

 

@app.route('/api/assess', methods=['POST'])

def assess():

    data = request.json

    query = data.get('query')

   

    if not query:

        return jsonify({'error': 'Query not provided'}), 400

 

    try:

        # Run risk narrative agent

        narrative_response = risk_analysis_narrative_agent.run(query)

        risk_narrative = narrative_response.content

 

        # Run scoring agent with the generated narrative

        score_response = risk_calculation_narrative_agent.run(risk_narrative)

        risk_score = score_response.content.score

 

        return jsonify({

            "risk_narrative": risk_narrative,

            "score": int(risk_score)

        })

 

    except Exception as e:

        return jsonify({'error': str(e)}), 500

 

@app.route('/api/feedback', methods=['POST'])

def feedback():

    data = request.json

    feedback_type = data.get('feedback')

    query = data.get('query')

    feedback_text = data.get('text', '')

 

    if not query or not feedback_type:

        return jsonify({'error': 'Missing feedback or query'}), 400

 

    try:

        # Process feedback using the appropriate method

        if feedback_type == 'narrative':

            processed_feedback = feedback_agent.process_feedback_narrative(feedback_text)

        elif feedback_type == 'note':

            processed_feedback = feedback_agent.process_feedback_note(feedback_text)

        else:

            return jsonify({'error': 'Invalid feedback type'}), 400

 

        # You can store the feedback in your database here

        print(f"Feedback received - Type: {feedback_type} | Query: '{query}'")

       

        return jsonify({

            'status': 'success',

            'message': 'Feedback processed',

            'processed_feedback': processed_feedback

        })

       

    except Exception as e:

        return jsonify({'error': str(e)}), 500

 

if __name__ == '__main__':

    app.run(debug=True)