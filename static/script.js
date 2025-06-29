// ResumeAI JavaScript for handling interactions and API calls - Updated for Celery tasks

document.addEventListener('DOMContentLoaded', function() {
    // Element references
    const resumeForm = document.getElementById('resume-form');
    const resumeInput = document.getElementById('resume');
    const fileInfo = document.getElementById('file-info');
    const uploadSection = document.getElementById('upload-section');
    const loadingSection = document.getElementById('loading-section');
    const atsResultsSection = document.getElementById('ats-results-section');
    const coverLetterResultsSection = document.getElementById('cover-letter-results-section');
    const restartButton = document.getElementById('restart-button');
    const restartCoverLetterButton = document.getElementById('restart-cover-letter-button');
    const progressBarFill = document.getElementById('progress-bar-fill');
    const progressStep = document.getElementById('progress-step');
    const loadingTitle = document.getElementById('loading-title');
    const loadingDescription = document.getElementById('loading-description');
    
    // Action buttons
    const analyzeAtsBtn = document.getElementById('analyze-ats-btn');
    const generateCoverLetterBtn = document.getElementById('generate-cover-letter-btn');
    const regenerateAtsBtn = document.getElementById('regenerate-ats-btn');
    const regenerateCoverLetterBtn = document.getElementById('regenerate-cover-letter-btn');
    const downloadResumeBtn = document.getElementById('download-resume-btn');
    const downloadCoverLetterBtn = document.getElementById('download-cover-letter-btn');
    
    // Preview modal elements
    const previewModal = document.getElementById('preview-modal');
    const previewTitle = document.getElementById('preview-title');
    const previewContent = document.getElementById('preview-content');
    const closePreviewBtn = document.getElementById('close-preview');
    const cancelDownloadBtn = document.getElementById('cancel-download');
    const confirmDownloadPdfBtn = document.getElementById('confirm-download-pdf');
    const confirmDownloadDocxBtn = document.getElementById('confirm-download-docx');
    
    // Score comparison elements (for resume preview)
    const scoreComparisonSection = document.getElementById('score-comparison');
    const originalScoreValue = document.getElementById('original-score-value');
    const optimizedScoreValue = document.getElementById('optimized-score-value');
    const improvementValue = document.getElementById('improvement-value');
    const improvementPercentage = document.getElementById('improvement-percentage');
    
    // Current session data
    let currentAtsSessionId = null;
    let currentCoverLetterSessionId = null;
    let currentPreviewType = null;
    let currentTaskId = null;
    
    // Handle file selection display
    resumeInput.addEventListener('change', function() {
        if (this.files && this.files.length > 0) {
            fileInfo.textContent = this.files[0].name;
        } else {
            fileInfo.textContent = 'No file selected';
        }
    });
    
    // Add click event listeners to expandable score items
    document.querySelectorAll('.score-item.expandable .score-header').forEach(header => {
        header.addEventListener('click', function() {
            const scoreItem = this.closest('.score-item');
            scoreItem.classList.toggle('expanded');
        });
    });
    
    // Action button event listeners
    analyzeAtsBtn.addEventListener('click', function() {
        if (validateForm()) {
            startAtsAnalysis();
        }
    });
    
    generateCoverLetterBtn.addEventListener('click', function() {
        if (validateForm()) {
            startCoverLetterGeneration();
        }
    });
    
    regenerateAtsBtn.addEventListener('click', function() {
        if (currentAtsSessionId) {
            regenerateAtsAnalysis();
        }
    });
    
    regenerateCoverLetterBtn.addEventListener('click', function() {
        if (currentCoverLetterSessionId) {
            regenerateCoverLetter();
        }
    });
    
    downloadResumeBtn.addEventListener('click', function() {
        if (currentAtsSessionId) {
            showPreview('resume', currentAtsSessionId);
        }
    });
    
    downloadCoverLetterBtn.addEventListener('click', function() {
        if (currentCoverLetterSessionId) {
            showPreview('cover_letter', currentCoverLetterSessionId);
        }
    });
    
    // Restart button event listeners
    restartButton.addEventListener('click', function() {
        resetApplication();
    });
    
    restartCoverLetterButton.addEventListener('click', function() {
        resetApplication();
    });
    
    // Preview modal event listeners
    closePreviewBtn.addEventListener('click', function() {
        hidePreview();
    });
    
    cancelDownloadBtn.addEventListener('click', function() {
        hidePreview();
    });
    
    confirmDownloadPdfBtn.addEventListener('click', function() {
        if (currentPreviewType && (currentAtsSessionId || currentCoverLetterSessionId)) {
            const sessionId = currentPreviewType === 'resume' ? currentAtsSessionId : currentCoverLetterSessionId;
            downloadDocument('pdf', currentPreviewType, sessionId);
            hidePreview();
        }
    });
    
    confirmDownloadDocxBtn.addEventListener('click', function() {
        if (currentPreviewType && (currentAtsSessionId || currentCoverLetterSessionId)) {
            const sessionId = currentPreviewType === 'resume' ? currentAtsSessionId : currentCoverLetterSessionId;
            downloadDocument('docx', currentPreviewType, sessionId);
            hidePreview();
        }
    });
    
    // Form validation
    function validateForm() {
        const resumeFile = resumeInput.files[0];
        const jobDescription = document.getElementById('job-description').value.trim();
        
        if (!resumeFile) {
            alert('Please upload your resume file');
            return false;
        }
        
        if (!jobDescription) {
            alert('Please enter the job description');
            return false;
        }
        
        return true;
    }
    
    // Start ATS analysis
    function startAtsAnalysis() {
        const resumeFile = resumeInput.files[0];
        const jobDescription = document.getElementById('job-description').value.trim();
        
        // Show loading screen
        showLoadingScreen('ATS Analysis', 'Analyzing your resume for ATS compatibility and generating optimization recommendations...');
        
        // Create form data
        const formData = new FormData();
        formData.append('resume', resumeFile);
        formData.append('job_description', jobDescription);
        
        // Simulate progress steps for ATS analysis
        simulateAtsProgress();
        
        // Send API request
        fetch('/analyze-ats', {
            method: 'POST',
            body: formData
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => {
                    throw new Error(err.error || `Server error: ${response.status}`);
                });
            }
            return response.json();
        })
        .then(data => {
            // Store session ID and task ID
            currentAtsSessionId = data.session_id;
            currentTaskId = data.task_id;
            
            // Start polling task status
            pollTaskStatus(currentTaskId, 'ats');
        })
        .catch(error => {
            console.error('Error:', error);
            alert(`An error occurred during ATS analysis: ${error.message}`);
            resetApplication();
        });
    }
    
    // Start cover letter generation
    function startCoverLetterGeneration() {
        const resumeFile = resumeInput.files[0];
        const jobDescription = document.getElementById('job-description').value.trim();
        
        // Show loading screen
        showLoadingScreen('Cover Letter Generation', 'Creating a personalized cover letter based on your resume and the job description...');
        
        // Create form data
        const formData = new FormData();
        formData.append('resume', resumeFile);
        formData.append('job_description', jobDescription);
        
        // Simulate progress steps for cover letter
        simulateCoverLetterProgress();
        
        // Send API request
        fetch('/generate-cover-letter', {
            method: 'POST',
            body: formData
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => {
                    throw new Error(err.error || `Server error: ${response.status}`);
                });
            }
            return response.json();
        })
        .then(data => {
            // Store session ID and task ID
            currentCoverLetterSessionId = data.session_id;
            currentTaskId = data.task_id;
            
            // Start polling task status
            pollTaskStatus(currentTaskId, 'cover_letter');
        })
        .catch(error => {
            console.error('Error:', error);
            alert(`An error occurred during cover letter generation: ${error.message}`);
            resetApplication();
        });
    }
    
    // Poll task status until completion
    function pollTaskStatus(taskId, taskType) {
        fetch(`/task-status/${taskId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to get task status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.state === 'SUCCESS') {
                // Task completed successfully
                completeProgress();
                
                // Fetch the results
                setTimeout(() => {
                    if (taskType === 'ats') {
                        fetchAtsResults(currentAtsSessionId);
                    } else {
                        fetchCoverLetterResults(currentCoverLetterSessionId);
                    }
                }, 500);
            } 
            else if (data.state === 'FAILURE') {
                throw new Error(data.status || 'Task failed');
            }
            else if (data.state === 'PENDING' || data.state === 'PROGRESS') {
                // Still processing, check again after 2 seconds
                setTimeout(() => pollTaskStatus(taskId, taskType), 2000);
            }
        })
        .catch(error => {
            console.error('Error polling task:', error);
            alert(`An error occurred: ${error.message}`);
            resetApplication();
        });
    }
    
    // Fetch ATS results after task completion
    function fetchAtsResults(sessionId) {
        fetch(`/preview/resume/${sessionId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to fetch results: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            // Populate ATS results
            populateAtsResults(data);
            
            // Hide loading and show results
            loadingSection.classList.add('hidden');
            atsResultsSection.classList.remove('hidden');
        })
        .catch(error => {
            console.error('Error fetching results:', error);
            alert(`Failed to load ATS results: ${error.message}`);
            resetApplication();
        });
    }
    
    // Fetch cover letter results after task completion
    function fetchCoverLetterResults(sessionId) {
        fetch(`/preview/cover_letter/${sessionId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to fetch results: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            populateCoverLetterResults(data);
            loadingSection.classList.add('hidden');
            coverLetterResultsSection.classList.remove('hidden');
        })
        .catch(error => {
            console.error('Error fetching results:', error);
            alert(`Failed to load cover letter results: ${error.message}`);
            resetApplication();
        });
    }
    
    // Regenerate ATS analysis
    function regenerateAtsAnalysis() {
        showLoadingScreen('Regenerating ATS Analysis', 'Re-analyzing your resume with fresh insights...');
        simulateAtsProgress();
        
        fetch(`/regenerate-ats/${currentAtsSessionId}`, {
            method: 'POST'
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => {
                    throw new Error(err.error || `Server error: ${response.status}`);
                });
            }
            return response.json();
        })
        .then(data => {
            currentTaskId = data.task_id;
            pollTaskStatus(currentTaskId, 'ats');
        })
        .catch(error => {
            console.error('Error:', error);
            alert(`An error occurred during regeneration: ${error.message}`);
            atsResultsSection.classList.remove('hidden');
            loadingSection.classList.add('hidden');
        });
    }
    
    // Regenerate cover letter
    function regenerateCoverLetter() {
        showLoadingScreen('Regenerating Cover Letter', 'Creating a new version of your cover letter...');
        simulateCoverLetterProgress();
        
        fetch(`/regenerate-cover-letter/${currentCoverLetterSessionId}`, {
            method: 'POST'
        })
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => {
                    throw new Error(err.error || `Server error: ${response.status}`);
                });
            }
            return response.json();
        })
        .then(data => {
            currentTaskId = data.task_id;
            pollTaskStatus(currentTaskId, 'cover_letter');
        })
        .catch(error => {
            console.error('Error:', error);
            alert(`An error occurred during regeneration: ${error.message}`);
            coverLetterResultsSection.classList.remove('hidden');
            loadingSection.classList.add('hidden');
        });
    }
    
    // Show loading screen
    function showLoadingScreen(title, description) {
        uploadSection.classList.add('hidden');
        atsResultsSection.classList.add('hidden');
        coverLetterResultsSection.classList.add('hidden');
        loadingSection.classList.remove('hidden');
        
        loadingTitle.textContent = title;
        loadingDescription.textContent = description;
        
        // Reset progress
        progressBarFill.style.width = '0%';
        progressStep.textContent = 'Initializing...';
    }
    
    // Simulate progress steps for ATS analysis
    function simulateAtsProgress() {
        const steps = [
            'Analyzing document format...',
            'Extracting resume content...',
            'Identifying key skills and experiences...',
            'Matching keywords with job description...',
            'Calculating ATS compatibility score...',
            'Generating optimization suggestions...',
            'Creating improved resume sections...',
            'Finalizing recommendations...'
        ];
        
        simulateProgressSteps(steps);
    }
    
    // Simulate progress steps for cover letter
    function simulateCoverLetterProgress() {
        const steps = [
            'Analyzing your resume...',
            'Understanding job requirements...',
            'Identifying key selling points...',
            'Crafting opening paragraph...',
            'Developing body content...',
            'Creating compelling closing...',
            'Formatting cover letter...',
            'Finalizing document...'
        ];
        
        simulateProgressSteps(steps);
    }
    
    // Generic progress simulation
    function simulateProgressSteps(steps) {
        let currentStep = 0;
        const totalSteps = steps.length;
        
        const progressInterval = setInterval(() => {
            if (currentStep < totalSteps) {
                const progress = Math.min((currentStep + 1) / totalSteps * 85, 85); // Cap at 85%
                progressBarFill.style.width = `${progress}%`;
                progressStep.textContent = steps[currentStep];
                currentStep++;
            } else {
                clearInterval(progressInterval);
            }
        }, 1500);
    }
    
    // Complete progress animation
    function completeProgress() {
        progressBarFill.style.width = '100%';
        progressStep.textContent = 'Analysis complete! Preparing results...';
    }
    
    // Populate ATS results in the UI
    function populateAtsResults(data) {
        // Extract ATS Analysis from data (using original analysis for display)
        const atsAnalysis = data.original_ats_analysis || {};
        const optimizedAtsAnalysis = data.optimized_ats_analysis || {};
        const optimization = data.optimization_result || {};
        
        // Ensure all required fields are present with defaults
        const atsScores = {
            keyword_match_percentage: parseFloat(atsAnalysis.keyword_match_percentage || 0),
            hard_soft_skills_balance: parseFloat(atsAnalysis.hard_soft_skills_balance || 0),
            formatting_readability_score: parseFloat(atsAnalysis.formatting_readability_score || 0),
            section_completion_percentage: parseFloat(atsAnalysis.section_completion_percentage || 0),
            proximity_score: parseFloat(atsAnalysis.proximity_score || 0),
            total_ats_score: parseFloat(atsAnalysis.total_ats_score || 0)
        };
        
        const optimizedScores = {
            total_ats_score: parseFloat(optimizedAtsAnalysis.total_ats_score || 0)
        };
        
        // Group suggestions by their proper categories
        const categorizedSuggestions = {
            searchability: atsAnalysis.searchability_suggestions || [],
            skills: atsAnalysis.skills_suggestions || [],
            formatting: atsAnalysis.formatting_suggestions || [],
            sections: atsAnalysis.section_suggestions || [],
            synonyms: atsAnalysis.synonym_suggestions || []
        };
        
        // Total score circle (show original score in main display)
        const totalScore = Math.round(atsScores.total_ats_score);
        document.getElementById('total-score-value').textContent = totalScore;
        setScoreCircleColor('total-score-circle', totalScore);
        
        // Individual score bars
        updateScoreBar('searchability', atsScores.keyword_match_percentage);
        updateScoreBar('skills-balance', atsScores.hard_soft_skills_balance);
        updateScoreBar('formatting', atsScores.formatting_readability_score);
        updateScoreBar('section-completion', atsScores.section_completion_percentage);
        updateScoreBar('synonym', atsScores.proximity_score);

        // Update the issues count for each section
        document.getElementById('searchability-issues').textContent = 
            calculateIssuesCount(atsAnalysis.keyword_match_percentage);
        document.getElementById('skills-issues').textContent = 
            calculateIssuesCount(atsAnalysis.hard_soft_skills_balance);
        document.getElementById('formatting-issues').textContent = 
            calculateIssuesCount(atsAnalysis.formatting_readability_score);
        document.getElementById('section-issues').textContent = 
            calculateIssuesCount(atsAnalysis.section_completion_percentage);
        document.getElementById('synonym-issues').textContent = 
            calculateIssuesCount(atsAnalysis.proximity_score);

        // Populate improvement suggestions by category
        populateCategoryImprovements(
            document.getElementById('searchability-improvements'), 
            atsScores.keyword_match_percentage, 
            categorizedSuggestions.searchability
        );
        
        populateCategoryImprovements(
            document.getElementById('skills-balance-improvements'), 
            atsScores.hard_soft_skills_balance, 
            categorizedSuggestions.skills
        );
        
        populateCategoryImprovements(
            document.getElementById('formatting-improvements'), 
            atsScores.formatting_readability_score, 
            categorizedSuggestions.formatting
        );
        
        populateCategoryImprovements(
            document.getElementById('section-completion-improvements'), 
            atsScores.section_completion_percentage, 
            categorizedSuggestions.sections
        );
        
        populateCategoryImprovements(
            document.getElementById('synonym-improvements'), 
            atsScores.proximity_score, 
            categorizedSuggestions.synonyms
        );
            
        // Missing keywords
        const missingKeywordsContainer = document.getElementById('missing-keywords-list');
        missingKeywordsContainer.innerHTML = '';
        
        const missingKeywords = atsAnalysis.missing_keywords || [];
        if (missingKeywords.length > 0) {
            missingKeywords.forEach(keyword => {
                const keywordElement = document.createElement('div');
                keywordElement.className = 'keyword missing-keyword';
                keywordElement.textContent = keyword;
                missingKeywordsContainer.appendChild(keywordElement);
            });
        } else {
            missingKeywordsContainer.innerHTML = '<p>Great job! No critical keywords missing.</p>';
        }
        
        // Resume optimization
        
        // Improved summary
        const improvedSummaryElement = document.getElementById('improved-summary');
        if (improvedSummaryElement && optimization.improved_summary) {
            improvedSummaryElement.textContent = optimization.improved_summary;
        }
        
        // Improved bullets
        const improvedBulletsContainer = document.getElementById('improved-bullets');
        if (improvedBulletsContainer) {
            improvedBulletsContainer.innerHTML = '';
            
            if (optimization.improved_bullets) {
                Object.entries(optimization.improved_bullets).forEach(([section, bullets]) => {
                    const sectionElement = document.createElement('div');
                    sectionElement.className = 'bullet-section';
                    
                    const sectionTitle = document.createElement('h4');
                    sectionTitle.textContent = section;
                    sectionElement.appendChild(sectionTitle);
                    
                    const bulletList = document.createElement('ul');
                    bullets.forEach(bullet => {
                        const bulletItem = document.createElement('li');
                        bulletItem.textContent = bullet;
                        bulletList.appendChild(bulletItem);
                    });
                    
                    sectionElement.appendChild(bulletList);
                    improvedBulletsContainer.appendChild(sectionElement);
                });
            }
        }
        
        // Suggested skills
        const skillsContainer = document.getElementById('suggested-skills-list');
        if (skillsContainer) {
            skillsContainer.innerHTML = '';
            
            if (optimization.suggested_skills) {
                optimization.suggested_skills.forEach(skill => {
                    const skillElement = document.createElement('div');
                    skillElement.className = 'skill-tag';
                    skillElement.textContent = skill;
                    skillsContainer.appendChild(skillElement);
                });
            }
        }
        
        // General improvement suggestions
        const suggestionsContainer = document.getElementById('improvement-suggestions');
        if (suggestionsContainer) {
            suggestionsContainer.innerHTML = '';
            
            if (atsAnalysis.improvement_suggestions) {
                atsAnalysis.improvement_suggestions.forEach(suggestion => {
                    const suggestionItem = document.createElement('li');
                    suggestionItem.textContent = suggestion;
                    suggestionsContainer.appendChild(suggestionItem);
                });
            }
        }
        
        // Show score improvement
        const improvement = optimizedScores.total_ats_score - atsScores.total_ats_score;
        if (improvement > 0) {
            document.getElementById('score-improvement').textContent = 
                `+${Math.round(improvement)} points after optimization`;
        }
    }
    
    // Populate cover letter results
    function populateCoverLetterResults(data) {
        const coverLetterPreview = document.getElementById('cover-letter-preview');
        if (coverLetterPreview && data.cover_letter) {
            coverLetterPreview.textContent = data.cover_letter.cover_letter_text;
        }
    }
    
    // Show document preview modal
    function showPreview(documentType, sessionId) {
        currentPreviewType = documentType;
        
        fetch(`/preview/${documentType}/${sessionId}`)
        .then(response => {
            if (!response.ok) {
                return response.json().then(err => {
                    throw new Error(err.error || 'Failed to load preview');
                });
            }
            return response.json();
        })
        .then(data => {
            previewTitle.textContent = documentType === 'resume' ? 'Resume Preview' : 'Cover Letter Preview';
            
            // Format content with preserved structure
            if (documentType === 'resume') {
                previewContent.innerHTML = formatResumeContent(data.content);
            } else {
                previewContent.innerHTML = formatCoverLetterContent(data.content);
            }
            
            // Show score comparison for resume preview
            if (documentType === 'resume' && data.score_comparison && scoreComparisonSection) {
                scoreComparisonSection.classList.remove('hidden');
                
                const originalScore = Math.round(data.score_comparison.original_score);
                const optimizedScore = Math.round(data.score_comparison.optimized_score);
                const improvement = optimizedScore - originalScore;
                
                if (originalScoreValue) originalScoreValue.textContent = originalScore;
                if (optimizedScoreValue) optimizedScoreValue.textContent = optimizedScore;
                if (improvementValue) improvementValue.textContent = improvement;
                if (improvementPercentage) {
                    const percentage = Math.round((improvement / originalScore) * 100);
                    improvementPercentage.textContent = percentage > 0 ? `+${percentage}%` : `${percentage}%`;
                }
            } else if (scoreComparisonSection) {
                scoreComparisonSection.classList.add('hidden');
            }
            
            previewModal.classList.remove('hidden');
        })
        .catch(error => {
            console.error('Error loading preview:', error);
            alert(`Failed to load document preview: ${error.message}`);
        });
    }

    // Format resume content with styling
    function formatResumeContent(content) {
        let html = '<div class="resume-preview">';
        const sections = content.split('\n\n');
        
        sections.forEach(section => {
            if (section.trim()) {
                // Check for section headings
                if (section.toUpperCase() === section || section.endsWith(':')) {
                    html += `<h3 class="resume-section">${section}</h3>`;
                } else {
                    // Process bullet points
                    const bullets = section.split('\n');
                    if (bullets.length > 1) {
                        html += '<ul class="resume-bullets">';
                        bullets.forEach(bullet => {
                            if (bullet.trim()) {
                                html += `<li>${bullet.replace('• ', '')}</li>`;
                            }
                        });
                        html += '</ul>';
                    } else {
                        html += `<p class="resume-paragraph">${section}</p>`;
                    }
                }
            }
        });
        
        html += '</div>';
        return html;
    }

    // Format cover letter content with styling
    function formatCoverLetterContent(content) {
        let html = '<div class="cover-letter-preview">';
        const paragraphs = content.split('\n\n');
        
        paragraphs.forEach(para => {
            if (para.trim()) {
                html += `<p class="cover-letter-paragraph">${para}</p>`;
            }
        });
        
        html += '</div>';
        return html;
    }
    
    // Hide preview modal
    function hidePreview() {
        previewModal.classList.add('hidden');
        currentPreviewType = null;
        if (scoreComparisonSection) {
            scoreComparisonSection.classList.add('hidden');
        }
    }
    
    // Helper function to calculate the number of issues based on score
    function calculateIssuesCount(score) {
        const normalizedScore = score > 1 ? score : score * 100;
        
        if (normalizedScore == 100) return 0;
        if (normalizedScore >= 90) return 1;
        if (normalizedScore >= 80) return 2;
        if (normalizedScore >= 70) return 3;
        if (normalizedScore >= 60) return 4;
        if (normalizedScore >= 50) return 5;
        return 6; 
    }
    
    // Helper function to populate each category's improvement content
    function populateCategoryImprovements(element, score, suggestions) {
        if (!element) return;
        
        const normalizedScore = score > 1 ? score : score * 100;
        
        let content = '';
        
        // Generic advice based on score
        if (normalizedScore >= 90) {
            content = '<p>Excellent! Your resume performs well in this category.</p>';
        } else if (normalizedScore >= 70) {
            content = '<p>Good job! With a few adjustments, you can improve this score.</p>';
        } else if (normalizedScore >= 50) {
            content = '<p>This area needs attention to improve your ATS compatibility.</p>';
        } else {
            content = '<p>This is a critical area that requires significant improvement.</p>';
        }
        
        // Add specific suggestions if available
        if (suggestions && suggestions.length > 0) {
            content += '<ul>';
            suggestions.forEach(suggestion => {
                let priorityClass = 'medium-priority';
                if (suggestion.toLowerCase().includes('critical') || 
                    suggestion.toLowerCase().includes('important') || 
                    suggestion.toLowerCase().includes('missing')) {
                    priorityClass = 'high-priority';
                } else if (suggestion.toLowerCase().includes('consider') || 
                           suggestion.toLowerCase().includes('could')) {
                    priorityClass = 'low-priority';
                }
                
                content += `<li class="${priorityClass}">${suggestion}</li>`;
            });
            content += '</ul>';
        } else {
            if (normalizedScore < 90) {
                content += '<p>No specific suggestions were provided for this category.</p>';
            }
        }
        
        element.innerHTML = content;
    }
    
    // Update the score bars with animation
    function updateScoreBar(id, value) {
        const bar = document.getElementById(`${id}-bar`);
        const percent = document.getElementById(`${id}-percent`);
        
        if (!bar || !percent) return;
        
        const normalizedValue = value > 1 ? value : value * 100;
        const roundedValue = Math.round(normalizedValue);
        
        bar.style.setProperty('--score-width', `${roundedValue}%`);
        percent.textContent = `${roundedValue}%`;
        
        setTimeout(() => {
            bar.style.width = `${roundedValue}%`;
        }, 100);
    }
    
    // Set the color of the score circle based on the score value
    function setScoreCircleColor(elementId, score) {
        const element = document.getElementById(elementId);
        if (!element) return;
        
        if (score >= 80) {
            element.style.background = 'linear-gradient(135deg, #28a745, #1e7e34)';
        } else if (score >= 60) {
            element.style.background = 'linear-gradient(135deg, #17a2b8, #117a8b)';
        } else if (score >= 40) {
            element.style.background = 'linear-gradient(135deg, #ffc107, #d39e00)';
        } else {
            element.style.background = 'linear-gradient(135deg, #dc3545, #bd2130)';
        }
    }
    
    // Download document function
    function downloadDocument(fileType, documentType, sessionId) {
        window.location.href = `/download/${fileType}/${documentType}/${sessionId}`;
    }
    
    // Reset application to initial state
    function resetApplication() {
        // Reset form
        resumeForm.reset();
        fileInfo.textContent = 'No file selected';
        
        // Reset progress bar
        progressBarFill.style.width = '0%';
        progressStep.textContent = 'Initializing...';
        
        // Show upload section
        uploadSection.classList.remove('hidden');
        loadingSection.classList.add('hidden');
        atsResultsSection.classList.add('hidden');
        coverLetterResultsSection.classList.add('hidden');
        
        // Reset session IDs
        currentAtsSessionId = null;
        currentCoverLetterSessionId = null;
        currentTaskId = null;
    }
});