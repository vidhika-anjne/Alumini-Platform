from flask import Flask, request, jsonify
from sentence_transformers import SentenceTransformer
import numpy as np

app = Flask(__name__)

# Load model once at startup (380MB download, one-time)
model = SentenceTransformer('all-MiniLM-L6-v2')  # Small, fast, free

@app.route('/embed', methods=['POST'])
def embed():
    data = request.json
    text = data.get('text', '')
    
    # Generate embedding
    embedding = model.encode(text)
    
    return jsonify({
        'embedding': embedding.tolist()
    })

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok'})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)
