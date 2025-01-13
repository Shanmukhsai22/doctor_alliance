from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from werkzeug.utils import secure_filename
import os
import jwt
from datetime import datetime, timedelta
from supabase import create_client, Client
from functools import wraps
import logging

app = Flask(__name__)
CORS(app)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configuration
app.config['SECRET_KEY'] = 'your-secret-key'  # Change this to a secure secret key
app.config['UPLOAD_FOLDER'] = 'uploads'
ALLOWED_EXTENSIONS = {'pdf'}

# Supabase configuration
SUPABASE_URL = "https://gxmepzketsyrnkjfsrjf.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4bWVwemtldHN5cm5ramZzcmpmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNjcxMTQ0MywiZXhwIjoyMDUyMjg3NDQzfQ.G7r7iQ9QmMJx8tVARxXUr57DdWYjuHiWABucjcpedes"
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Create uploads directory if it doesn't exist
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            token = request.headers['Authorization'].split(" ")[1]
        
        if not token:
            return jsonify({'message': 'Token is missing'}), 401

        try:
            jwt.decode(token, app.config['SECRET_KEY'], algorithms=["HS256"])
        except jwt.ExpiredSignatureError:
            return jsonify({'message': 'Token has expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'message': 'Invalid token'}), 401

        return f(*args, **kwargs)
    return decorated

@app.route('/login', methods=['POST'])
def login():
    try:
        data = request.json
        username = data.get('username')
        password = data.get('password')

        if not username or not password:
            return jsonify({'message': 'Missing username or password'}), 400

        # For demonstration, using dummy credentials
        if username == "admin" and password == "admin":
            token = jwt.encode({
                'user': username,
                'exp': datetime.utcnow() + timedelta(hours=24)
            }, app.config['SECRET_KEY'], algorithm="HS256")
            
            return jsonify({'token': token})
        
        return jsonify({'message': 'Invalid credentials'}), 401

    except Exception as e:
        logger.error(f"Login error: {str(e)}")
        return jsonify({'message': 'An error occurred during login'}), 500

@app.route('/upload', methods=['POST'])
@token_required
def upload_file():
    try:
        if 'resume' not in request.files:
            return jsonify({'message': 'No file part'}), 400
        
        file = request.files['resume']
        name = request.form.get('name')
        submission_date = request.form.get('submission_date')

        if not all([file, name, submission_date]):
            return jsonify({'message': 'Missing required fields'}), 400

        if file.filename == '':
            return jsonify({'message': 'No selected file'}), 400

        if not allowed_file(file.filename):
            return jsonify({'message': 'File type not allowed'}), 400

        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)

        data = {
            'name': name,
            'submission_date': submission_date,
            'resume_file_name': filename,
            'upload_date': datetime.utcnow().isoformat()
        }
        
        result = supabase.table('uploads').insert(data).execute()
        
        return jsonify({
            'message': 'File uploaded successfully',
            'filename': filename
        }), 200

    except Exception as e:
        logger.error(f"Upload error: {str(e)}")
        return jsonify({'message': f'Error: {str(e)}'}), 500

@app.route('/uploads', methods=['GET'])
@token_required
def get_uploads():
    try:
        result = supabase.table('uploads').select('*').execute()
        return jsonify(result.data), 200
    except Exception as e:
        logger.error(f"Get uploads error: {str(e)}")
        return jsonify({'message': f'Error: {str(e)}'}), 500

@app.route('/download/<filename>', methods=['GET'])
@token_required
def download_file(filename):
    try:
        result = supabase.table('uploads').select('*').eq('resume_file_name', filename).execute()
        
        if not result.data:
            return jsonify({'message': 'File not found in database'}), 404

        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        
        if os.path.exists(file_path):
            return send_file(
                file_path,
                mimetype='application/pdf',
                as_attachment=True,
                download_name=filename
            )
        else:
            return jsonify({'message': 'File not found on server'}), 404

    except Exception as e:
        logger.error(f"Download error: {str(e)}")
        return jsonify({'message': f'Error: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(debug=True)