from flask import Flask, request, jsonify, render_template, send_from_directory
from flask_cors import CORS
import google.generativeai as genai

app = Flask(__name__, static_folder='frontend/build', static_url_path='')
CORS(app)

# Set your Gemini API key (replace with your own)
genai.configure(api_key="AIzaSyB5s8S0XYEw6u0CFACVgaVtcAX8Rl8WZuE")
model = genai.GenerativeModel("gemini-1.5-flash")
# Helper function to interact with Gemini API
def get_gemini_response(question, fiqh):
    # Custom instructions to ensure responses are based on the specified fiqh
    fiqh_instructions = {
        'hanafi': "Answer according to Hanafi fiqh.",
        'shafi': "Answer according to Shafi'i fiqh.",
        'maliki': "Answer according to Maliki fiqh.",
        'hanbali': "Answer according to Hanbali fiqh."
    }

    # Add instructions to the prompt based on fiqh selection
    prompt = f"{fiqh_instructions.get(fiqh, 'Provide general guidance')}\nQuestion: {question}"

    # Generate response using Gemini's text generation
    response = model.generate_content(prompt)
    return response.text

# Define route to handle queries
@app.route('/api/query', methods=['POST'])
def query():
    data = request.json
    question = data.get('question')
    fiqh = data.get('fiqh')

    # Validate input
    if not question or not fiqh:
        return jsonify({"error": "Question and Fiqh are required"}), 400

    # Get response from Gemini
    answer = get_gemini_response(question, fiqh)
    return jsonify({"answer": answer})


@app.route('/', methods = ['GET'])
def home():
    return send_from_directory('frontend/build', 'index.html')

if __name__ == '__main__':
    app.run(debug=True)