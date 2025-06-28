# ATS Resume Enhancer AI
A comprehensive AI-powered web application that analyzes, optimizes, and enhances resumes for maximum Applicant Tracking System (ATS) compatibility. Built with Flask and powered by OpenAI's GPT models, this tool helps job seekers increase their chances of passing ATS screenings and landing interviews.

![image](https://github.com/user-attachments/assets/d8f55546-da69-4335-9325-d8a97ec51c09)


## 🚀 Features

### Core Functionality
- **ATS Compatibility Analysis**: Comprehensive scoring system that evaluates resumes against job descriptions
- **Resume Optimization**: AI-powered enhancement of existing resumes with keyword optimization
- **Cover Letter Generation**: Personalized cover letters tailored to specific job postings
- **Multi-format Support**: Upload and download documents in PDF and DOCX formats

### Advanced Analytics
- **Keyword Match Analysis**: Identifies missing keywords and suggests optimal placement
- **Section Completeness Scoring**: Evaluates resume structure and completeness
- **Formatting Assessment**: Ensures ATS-friendly formatting and readability
- **Skills Balance Evaluation**: Analyzes hard vs soft skills alignment
- **Proximity Scoring**: Assesses keyword context and placement

### User Experience
- **Interactive Web Interface**: Clean, intuitive design for seamless user experience
- **Real-time Processing**: Fast analysis and optimization powered by advanced AI
- **Score Comparison**: Before/after ATS score comparison to track improvements
- **Document Preview**: Preview optimized documents before downloading
- **Multiple Export Options**: Download in PDF or DOCX formats

## 🛠️ Technology Stack

- **Backend**: Python Flask
- **AI/ML**: OpenAI GPT-4 Mini, LangChain
- **Document Processing**: PyPDF2, python-docx, ReportLab
- **Data Validation**: Pydantic
- **Environment Management**: python-dotenv
- **File Handling**: Werkzeug

## 📋 Prerequisites

- Python 3.8 or higher
- OpenAI API key
- pip package manager

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/ats-resume-optimizer.git
   cd ats-resume-optimizer
   ```

2. **Create a virtual environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Set up environment variables**
   Create a `.env` file in the root directory:
   ```env
   OPENAI_API_KEY=your_openai_api_key_here
   ```

5. **Run the application**
   ```bash
   python app.py
   ```

6. **Access the application**
   Open your browser and navigate to `http://localhost:5000`


## 🎯 Usage

### ATS Analysis & Resume Optimization

1. **Upload Resume**: Support for PDF and DOCX formats (max 5MB)
2. **Paste Job Description**: Copy and paste the target job posting
3. **Analyze**: Get comprehensive ATS compatibility scores including:
   - Keyword match percentage
   - Section completion score
   - Formatting assessment
   - Skills balance evaluation
   - Overall ATS score (0-100)

4. **Review Optimization**: Access categorized improvement suggestions:
   - Searchability enhancements
   - Skills presentation improvements
   - Formatting recommendations
   - Section completeness suggestions
   - Keyword variation coverage

5. **Download Optimized Resume**: Get your enhanced resume in PDF or DOCX format

### Cover Letter Generation

1. **Upload Resume**: Same resume used for ATS analysis
2. **Provide Job Description**: Target job posting details
3. **Generate**: AI creates a personalized, professional cover letter
4. **Download**: Export in your preferred format

## 🏗️ Project Structure

```
ats-resume-optimizer/
├── app.py                 # Main Flask application
├── requirements.txt       # Python dependencies
├── .env                  # Environment variables (create this)
├── static/               # Static files (CSS, JS, images)
├── templates/            # HTML templates
│   └── index.html       # Main interface
└── README.md            # Project documentation
```

## 🔍 API Endpoints

- `GET /` - Main application interface
- `POST /analyze-ats` - Analyze resume and generate optimization
- `POST /generate-cover-letter` - Generate personalized cover letter
- `POST /regenerate-ats/<session_id>` - Regenerate ATS analysis
- `POST /regenerate-cover-letter/<session_id>` - Regenerate cover letter
- `GET /preview/<document_type>/<session_id>` - Preview generated documents
- `GET /download/<file_type>/<document_type>/<session_id>` - Download documents

## 🎨 Key Features Deep Dive

### ATS Scoring Algorithm

The application uses a weighted scoring system:
- **Keyword Match** (35%): Exact and semantic keyword matching
- **Section Completion** (25%): Resume structure and completeness
- **Formatting** (20%): ATS-friendly formatting assessment
- **Skills Balance** (10%): Hard vs soft skills evaluation
- **Proximity Score** (10%): Keyword context and placement

### AI-Powered Optimization

- Preserves all original resume sections while enhancing content
- Incorporates job-specific keywords naturally
- Maintains professional tone and readability
- Provides quantified achievements and impact statements
- Ensures ATS-friendly formatting standards

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 💡 Future Enhancements

- [ ] Integration with job boards for automatic job description fetching
- [ ] LinkedIn profile optimization
- [ ] Industry-specific templates and recommendations
- [ ] Batch processing for multiple resumes
- [ ] Advanced analytics dashboard
- [ ] Mobile-responsive design improvements

**Made with ❤️ for job seekers everywhere**
