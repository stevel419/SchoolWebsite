import printStylesCSS from './printStyles.css?inline';

// Utility functions for print functionality
export const getScoreClass = (score) => {
    if (score >= 75) return 'print-score-high';
    if (score >= 50) return 'print-score-medium';
    return 'print-score-low';
};

export const getGradeClass = (grade) => {
    switch(grade) {
        case 'A': return 'print-grade-a';
        case 'B': return 'print-grade-b';
        case 'C': return 'print-grade-c';
        case 'D': return 'print-grade-d';
        default: return 'print-grade-f';
    }
};

export const generatePrintContent = (student, calculateSubjectAverage) => {
    return `
        <!-- Header -->
        <div class="print-report-header">
            <div class="print-school-name">Kiguruyembe Secondary School</div>
            <div class="print-report-title">Student Academic Progress Report</div>
            <div class="print-report-date">Generated on ${new Date().toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            })}</div>
        </div>

        <!-- Student Information -->
        <div class="print-student-info">
            <div class="print-student-name">${student.firstName} ${student.lastName}</div>
            <div class="print-student-details">
                <div class="print-detail-item">
                    <div class="print-detail-label">Form</div>
                    <div class="print-detail-value">${student.form}</div>
                </div>
                <div class="print-detail-item">
                    <div class="print-detail-label">Gender</div>
                    <div class="print-detail-value">${student.gender}</div>
                </div>
                <div class="print-detail-item">
                    <div class="print-detail-label">Date of Birth</div>
                    <div class="print-detail-value">${new Date(student.dateOfBirth).toLocaleDateString()}</div>
                </div>
            </div>
        </div>

        <!-- Subjects -->
        <div class="print-subjects-container">
            ${student.subjects && student.subjects.length > 0 ? 
                student.subjects.map(subject => {
                    const gradeForSubject = student.grades.find(g => g.subject === subject);
                    if (!gradeForSubject || !gradeForSubject.assessments) {
                        return `
                            <div class="print-subject-section">
                                <div class="print-subject-header">
                                    <div class="print-subject-name">
                                        <span class="print-subject-icon"></span>
                                        ${subject}
                                    </div>
                                    <div class="print-overall-grade">No Grades</div>
                                </div>
                                <div class="print-no-comment">No assessment data available</div>
                            </div>
                        `;
                    }

                    const assessments = gradeForSubject.assessments || [];
                    const sortedAssessments = assessments.sort((a, b) => {
                        const order = { 'Midterm 1': 1, 'Endterm': 2, 'Midterm 2': 3, 'Final': 4 };
                        return (order[a.name] || 999) - (order[b.name] || 999);
                    });

                    const overall = calculateSubjectAverage(student, subject);
                    const commentForSubject = student.comments.find(c => c.subject === subject);

                    return `
                        <div class="print-subject-section">
                            <div class="print-subject-header">
                                <div class="print-subject-name">
                                    <span class="print-subject-icon"></span>
                                    ${subject}
                                </div>
                                <div class="print-overall-grade ${getGradeClass(overall.letterGrade)}">
                                    Overall: ${overall.average.toFixed(1)}% (${overall.letterGrade})
                                </div>
                            </div>
                            
                            <div class="print-assessments-section">
                                <div class="print-section-title">Assessment Scores</div>
                                <div class="print-assessment-grid">
                                    ${sortedAssessments.map(assessment => `
                                        <div class="print-assessment-item">
                                            <div class="print-assessment-name">${assessment.name}</div>
                                            <div class="print-assessment-score ${getScoreClass(assessment.score || 0)}">
                                                ${assessment.score !== null && assessment.score !== undefined ? 
                                                    `${assessment.score}/100` : '--/100'}
                                            </div>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                            
                            <div class="print-comments-section">
                                <div class="print-section-title">Teacher Comments</div>
                                ${commentForSubject && commentForSubject.comment ? 
                                    `<div class="print-comment-content">${commentForSubject.comment}</div>` :
                                    `<div class="print-no-comment">No comments available</div>`
                                }
                            </div>
                        </div>
                    `;
                }).join('') :
                '<div class="print-subject-section"><div class="print-no-comment">No subjects available for this student</div></div>'
            }
        </div>

        <!-- Footer -->
        <div class="print-report-footer">
            <p>This report was generated automatically by the Kiguruyembe Secondary School Student Management System</p>
            <div class="print-confidential">CONFIDENTIAL DOCUMENT</div>
        </div>
    `;
};

export const handlePrint = (student, calculateSubjectAverage) => {
    if (!student) return;

    const printWindow = window.open('', '', 'width=800,height=600');
    
    const printContent = generatePrintContent(student, calculateSubjectAverage);
    
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>Student Report - ${student.firstName} ${student.lastName}</title>
            <meta charset="utf-8">
            <style>
                ${printStylesCSS}
            </style>
        </head>
        <body class="print-styles">
            <div class="print-page">
                ${printContent}
            </div>
        </body>
        </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
    printWindow.close();
};