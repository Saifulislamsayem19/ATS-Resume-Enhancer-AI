import os
import tempfile
import uuid
import json
import asyncio
from werkzeug.utils import secure_filename
from flask import Flask, render_template, request, jsonify, send_file
from datetime import datetime
from dotenv import load_dotenv
from resume_optimization import (
    process_resume_file,
    create_ats_analysis_chain,
    create_resume_optimization_chain,
    create_cover_letter_chain,
    create_docx_document,
    create_pdf_document
)

# Initialize Flask app
app = Flask(__name__, static_folder='static')
app.config['UPLOAD_FOLDER'] = tempfile.mkdtemp()
app.config['MAX_CONTENT_LENGTH'] = 5 * 1024 * 1024  # 5MB max file size

# Configure environment variables
load_dotenv()
openai_api_key = os.getenv("OPENAI_API_KEY")

# Async helper functions
async def run_async(func, *args, **kwargs):
    loop = asyncio.get_event_loop()
    if asyncio.iscoroutinefunction(func):
        return await func(*args, **kwargs)
    else:
        return await loop.run_in_executor(None, lambda: func(*args, **kwargs))

# Flask routes
@app.route('/')
def index():
    return render_template('index.html')

@app.route('/analyze-ats', methods=['POST'])
async def analyze_ats():
    if 'resume' not in request.files:
        return jsonify({'error': 'No resume file uploaded'}), 400
    
    resume_file = request.files['resume']
    job_description = request.form.get('job_description', '')
    
    if resume_file.filename == '':
        return jsonify({'error': 'No resume file selected'}), 400
    
    if not job_description:
        return jsonify({'error': 'Job description is required'}), 400
    
    # Process resume
    resume_text, file_path = await process_resume_file(resume_file, app.config['UPLOAD_FOLDER'])
    if not resume_text:
        return jsonify({'error': 'Could not extract text from resume'}), 400
    
    # Create chains
    ats_chain = create_ats_analysis_chain(openai_api_key)
    optimization_chain = create_resume_optimization_chain(openai_api_key)
    
    # Run ATS analysis
    original_ats_result = await run_async(ats_chain.invoke, {
        "resume_text": resume_text,
        "job_description": job_description
    })
    
    # Optimize resume
    optimization_result = await run_async(optimization_chain.invoke, {
        "resume_text": resume_text,
        "job_description": job_description,
        "ats_analysis": json.dumps(original_ats_result.model_dump())
    })
    
    # Create session
    session_id = str(uuid.uuid4())
    temp_dir = os.path.join(app.config['UPLOAD_FOLDER'], session_id)
    os.makedirs(temp_dir, exist_ok=True)
    
    # Store data
    await run_async(lambda: json.dump({
        'resume_text': resume_text,
        'job_description': job_description,
        'original_ats_analysis': original_ats_result.model_dump(),
        'optimization_result': optimization_result.model_dump()
    }, open(os.path.join(temp_dir, 'ats_data.json'), 'w')))
    
    return jsonify({
        'session_id': session_id,
        'ats_analysis': original_ats_result.model_dump(),
        'optimization_result': optimization_result.model_dump()
    })

@app.route('/generate-cover-letter', methods=['POST'])
async def generate_cover_letter():
    if 'resume' not in request.files:
        return jsonify({'error': 'No resume file uploaded'}), 400
    
    resume_file = request.files['resume']
    job_description = request.form.get('job_description', '')
    
    if resume_file.filename == '':
        return jsonify({'error': 'No resume file selected'}), 400
    
    if not job_description:
        return jsonify({'error': 'Job description is required'}), 400
    
    # Process resume
    resume_text, file_path = await run_async(process_resume_file, resume_file, app.config['UPLOAD_FOLDER'])
    if not resume_text:
        return jsonify({'error': 'Could not extract text from resume'}), 400
    
    # Generate cover letter
    cover_letter_chain = create_cover_letter_chain(openai_api_key)
    cover_letter_result = await run_async(cover_letter_chain.invoke, {
        "resume_text": resume_text,
        "job_description": job_description
    })
    
    # Create session
    session_id = str(uuid.uuid4())
    temp_dir = os.path.join(app.config['UPLOAD_FOLDER'], session_id)
    os.makedirs(temp_dir, exist_ok=True)
    
    # Store data
    await run_async(lambda: json.dump({
        'resume_text': resume_text,
        'job_description': job_description,
        'cover_letter': cover_letter_result.model_dump()  
    }, open(os.path.join(temp_dir, 'cover_letter_data.json'), 'w')))
    
    return jsonify({
        'session_id': session_id,
        'cover_letter': cover_letter_result.cover_letter_text  
    })

@app.route('/regenerate-ats/<session_id>', methods=['POST'])
async def regenerate_ats(session_id):
    temp_dir = os.path.join(app.config['UPLOAD_FOLDER'], session_id)
    data_file = os.path.join(temp_dir, 'ats_data.json')
    
    if not os.path.exists(data_file):
        return jsonify({'error': 'Session data not found'}), 404
    
    data = await run_async(lambda: json.load(open(data_file, 'r')))
    
    resume_text = data['resume_text']
    job_description = data['job_description']
    
    # Re-run analysis
    ats_chain = create_ats_analysis_chain(openai_api_key)
    original_ats_result = await run_async(ats_chain.invoke, {
        "resume_text": resume_text,
        "job_description": job_description
    })
    
    # Re-run optimization
    optimization_chain = create_resume_optimization_chain(openai_api_key)
    optimization_result = await run_async(optimization_chain.invoke, {
        "resume_text": resume_text,
        "job_description": job_description,
        "ats_analysis": json.dumps(original_ats_result.model_dump())
    })
    
    # Update data
    await run_async(lambda: json.dump({
        'resume_text': resume_text,
        'job_description': job_description,
        'original_ats_analysis': original_ats_result.model_dump(),
        'optimization_result': optimization_result.model_dump()
    }, open(data_file, 'w')))
    
    return jsonify({
        'ats_analysis': original_ats_result.model_dump(),
        'optimization_result': optimization_result.model_dump()
    })

@app.route('/regenerate-cover-letter/<session_id>', methods=['POST'])
async def regenerate_cover_letter(session_id):
    temp_dir = os.path.join(app.config['UPLOAD_FOLDER'], session_id)
    data_file = os.path.join(temp_dir, 'cover_letter_data.json')
    
    if not os.path.exists(data_file):
        return jsonify({'error': 'Session data not found'}), 404
    
    data = await run_async(lambda: json.load(open(data_file, 'r')))
    
    resume_text = data['resume_text']
    job_description = data['job_description']
    
    # Re-generate cover letter
    cover_letter_chain = create_cover_letter_chain(openai_api_key)
    cover_letter_result = await run_async(cover_letter_chain.invoke, {
        "resume_text": resume_text,
        "job_description": job_description
    })
    
    # Update data 
    await run_async(lambda: json.dump({
        'resume_text': resume_text,
        'job_description': job_description,
        'cover_letter': cover_letter_result.model_dump()  
    }, open(data_file, 'w')))
    
    return jsonify({
        'cover_letter': cover_letter_result.cover_letter_text  
    })

@app.route('/preview/<document_type>/<session_id>')
async def preview_document(document_type, session_id):
    temp_dir = os.path.join(app.config['UPLOAD_FOLDER'], session_id)
    
    if document_type == 'resume':
        data_file = os.path.join(temp_dir, 'ats_data.json')
        if not os.path.exists(data_file):
            return jsonify({'error': 'Session data not found'}), 404
        
        with open(data_file, 'r') as f:
            data = json.load(f)
        
        # Run optimized ATS analysis if needed
        if 'optimized_ats_analysis' not in data:
            ats_chain = create_ats_analysis_chain(openai_api_key)
            optimized_ats_result = ats_chain.invoke({
                "resume_text": data['optimization_result']['improved_resume_text'],
                "job_description": data['job_description']
            })
            data['optimized_ats_analysis'] = optimized_ats_result.model_dump()
            with open(data_file, 'w') as f:
                json.dump(data, f)
        
        content = data['optimization_result']['improved_resume_text']
        original_score = data['original_ats_analysis']['total_ats_score']
        optimized_score = data.get('optimized_ats_analysis', {}).get('total_ats_score', 0)
        
        # Return JSON response directly instead of using jsonify
        return {
            'content': content,
            'score_comparison': {
                'original_score': original_score,
                'optimized_score': optimized_score
            }
        }
        
    elif document_type == 'cover_letter':
        data_file = os.path.join(temp_dir, 'cover_letter_data.json')
        if not os.path.exists(data_file):
            return {'error': 'Session data not found'}, 404
        
        with open(data_file, 'r') as f:
            data = json.load(f)
        
        content = data['cover_letter']['cover_letter_text']
        return {'content': content}
    else:
        return {'error': 'Invalid document type'}, 400

@app.route('/download/<file_type>/<document_type>/<session_id>')
async def download_document(file_type, document_type, session_id):
    temp_dir = os.path.join(app.config['UPLOAD_FOLDER'], session_id)
    
    if document_type == 'resume':
        data_file = os.path.join(temp_dir, 'ats_data.json')
        if not os.path.exists(data_file):
            return jsonify({'error': 'Session data not found'}), 404
        
        with open(data_file, 'r') as f:
            data = json.load(f)
        
        content = data['optimization_result']['improved_resume_text']
        filename = f"optimized_resume.{file_type}"
        
    elif document_type == 'cover_letter':
        data_file = os.path.join(temp_dir, 'cover_letter_data.json')
        if not os.path.exists(data_file):
            return jsonify({'error': 'Session data not found'}), 404
        
        with open(data_file, 'r') as f:
            data = json.load(f)
        
        content = data['cover_letter']['cover_letter_text']
        filename = f"cover_letter.{file_type}"
    else:
        return jsonify({'error': 'Invalid document type'}), 400
    
    # Generate file asynchronously
    if file_type == 'docx':
        file_obj = await create_docx_document(content, document_type)
        mimetype = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    elif file_type == 'pdf':
        file_obj = await create_pdf_document(content, document_type)
        mimetype = 'application/pdf'
    else:
        return jsonify({'error': 'Invalid file type'}), 400
    
    return send_file(
        file_obj,
        mimetype=mimetype,
        as_attachment=True,
        download_name=filename
    )

if __name__ == '__main__':
    # Use hypercorn for production ASGI server
    app.run(host='0.0.0.0', port=5000, debug=True)