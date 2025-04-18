from flask import Flask, request, jsonify, session

from flask_session import Session

from flask_cors import CORS

import os

from dotenv import load_dotenv

from agentic import (

    risk_analysis_narrative_agent,

    risk_calculation_narrative_agent,

    feedback_agent,

    credit_note_agent

)

 

# Load environment variables

load_dotenv()

 

# Configure Flask app

app = Flask(__name__)

CORS(app, supports_credentials=True)

 

# Configure server-side sessions

app.config.update(

    SESSION_TYPE='filesystem',

    SECRET_KEY=os.getenv('FLASK_SECRET_KEY', 'fallback-secret-key'),

    SESSION_FILE_DIR='./flask_session',

    SESSION_COOKIE_SAMESITE='Lax'

)

 

Session(app)

 

@app.route('/api/init-assessment', methods=['POST'])

def init_assessment():

    """Initialize a new assessment session"""

    try:

        data = request.json

        session.clear()

       

        # Initialize session data

        session['original_query'] = data.get('query')

        session['feedback_history'] = []

        session['creditnote_feedback_history'] = []

        session['current_narrative'] = None

        session['current_score'] = None

        session['loan_details'] = data.get('loan_details', {})

       

        return jsonify({

            "status": "session_initialized",

            "session_id": session.sid

        })

       

    except Exception as e:

        return jsonify({"error": str(e)}), 500

 

@app.route('/api/generate-narrative', methods=['POST'])

def generate_narrative():

    """Generate or regenerate risk narrative with feedback"""

    try:

        # Build context from feedback history

        context = "Previous Feedback:\n" + "\n".join(session.get('feedback_history',[]))

        input_data = f"{session['original_query']}\n\n{context}"

       

        # Generate narrative

        narrative = risk_analysis_narrative_agent.run(input_data)

       

        # Store in session

        session['current_narrative'] = narrative.content  # Add this line

        session.modified = True  # Ensure session is saved

       

        # Calculate score

        score = risk_calculation_narrative_agent.run(narrative.content)

       

        return jsonify({

            "narrative": narrative.content,

            "score": score.content.score,

            "feedback_count": len(session['feedback_history'])

        })

       

    except Exception as e:

        return jsonify({"error": str(e)}), 500

 

 

@app.route('/api/submit-feedback', methods=['POST'])

def submit_feedback():

    """Process user feedback and update session"""

    try:

        data = request.json

        feedback_text = data.get('text', '')

       

        # Process feedback

        structured_feedback = feedback_agent.process_feedback_narrative(feedback_text)

       

        # Update session

        session['feedback_history'].append(structured_feedback)

        session.modified = True

       

        return jsonify({

            "status": "feedback_accepted",

            "feedback_count": len(session['feedback_history'])

        })

       

    except Exception as e:

        return jsonify({"error": str(e)}), 500

   

@app.route('/api/submit-creditnote-feedback', methods=['POST'])

def submit_creditnote_feedback():

    """Process user feedback for credit notes"""

    try:

        data = request.json

        feedback_text = data.get('text', '')

       

        # Process feedback using appropriate agent

        structured_feedback = feedback_agent.process_feedback_note(feedback_text)

       

        # Update session with credit note specific feedback

        session['creditnote_feedback_history'].append(structured_feedback)

        session.modified = True

       

        return jsonify({

            "status": "creditnote_feedback_accepted",

            "feedback_count": len(session['creditnote_feedback_history'])

        })

       

    except Exception as e:

        return jsonify({"error": str(e)}), 500

 

 

@app.route('/api/generate-credit-note', methods=['POST'])

def generate_credit_note():

    """Generate final credit note with feedback context"""

    try:

        # Build context from credit note feedback history

        context = "Credit Note Feedback:\n" + "\n".join(session.get('creditnote_feedback_history', []))

       

        # Generate credit note with context

        credit_note = credit_note_agent.generate_credit_note(

            narrative=session['current_narrative'],

            user_query=f"{session['original_query']}\n\n{context}",

            # loan_details=session.get('loan_details', {})

        )

       

        return jsonify({

            "credit_note": credit_note,

            "company": session['original_query'],

            "loan_details": session.get('loan_details', {}),

            "feedback_count": len(session['creditnote_feedback_history'])

        })

       

    except Exception as e:

        print("Credit Note Error:", str(e))

        return jsonify({"error": str(e)}), 500

 

if __name__ == '__main__':

    # Create session directory if not exists

    if not os.path.exists(app.config['SESSION_FILE_DIR']):

        os.makedirs(app.config['SESSION_FILE_DIR'])

    app.run(debug=True)