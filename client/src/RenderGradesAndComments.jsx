function RenderGradesAndComments({ 
    student, 
    calculateSubjectAverage,
    editedScores,
    setEditedScores,
    editedComments,
    setEditedComments,
    updateStatus,
    setUpdateStatus,
    updateCommentStatus,
    setUpdateCommentStatus,
    setRoster,
    setFilteredData
}) {
    const handleScoreUpdate = async (student, s, assessment, updatedScore) => {
        const key = student.admissionNum + "-" + s + "-" + assessment.name;
        const scoreValue = updatedScore === '' ? null : parseFloat(updatedScore);
        const currentScore = assessment.score;

        if (scoreValue !== currentScore) {
            setUpdateStatus(prev => ({ ...prev, [key]: 'loading' }));

            try {
                const token = sessionStorage.getItem('token');
                const res = await fetch('http://localhost:3000/update-grade', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + token
                    },
                    body: JSON.stringify({
                        admissionNum: student.admissionNum,
                        name: assessment.name,
                        score: scoreValue,
                        subject: s,
                    })
                });

                const data = await res.json();

                if (!res.ok) {
                    throw new Error(data.error || 'Failed to update');
                }
                
                setUpdateStatus(prev => ({ ...prev, [key]: 'success' }));

                const updateStudentGrades = (studentList) => {
                    return studentList.map(studentItem => {
                        if (studentItem.admissionNum === student.admissionNum) {
                            return {
                                ...studentItem,
                                grades: studentItem.grades.map(grade => {
                                    if (grade.subject === s) {
                                        return {
                                            ...grade,
                                            assessments: grade.assessments.map(ass => {
                                                if (ass.name === assessment.name) {
                                                    return { ...ass, score: scoreValue };
                                                }
                                                return ass;
                                            })
                                        };
                                    }
                                    return grade;
                                })
                            };
                        }
                        return studentItem;
                    });
                };
                setRoster(updateStudentGrades);
                setFilteredData(prev => updateStudentGrades(prev));

                // Clear the edited score since it's now saved
                setEditedScores(prev => {
                    const updated = { ...prev };
                    delete updated[key];
                    return updated;
                });
                
                // Clear success message after 3 seconds
                setTimeout(() => {
                    setUpdateStatus(prev => {
                        const updated = { ...prev };
                        delete updated[key];
                        return updated;
                    });
                }, 3000);
            } catch (e) {
                setUpdateStatus(prev => ({ ...prev, [key]: 'error' }));
                console.error('Error updating grade:', e);
            }
        }
    };

    const handleCommentUpdate = async (student, s, updatedComment, existingComment) => {
        const commentKey = `${student.admissionNum}-${s}`;
        
        if (updatedComment !== existingComment) {
            setUpdateCommentStatus(prev => ({ ...prev, [commentKey]: 'loading' }));

            try {
                const token = sessionStorage.getItem('token');
                const res = await fetch('http://localhost:3000/update-comment', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer ' + token
                    },
                    body: JSON.stringify({
                        admissionNum: student.admissionNum,
                        newComment: updatedComment,
                        subject: s
                    })
                });

                const data = await res.json();

                if (!res.ok) {
                    throw new Error(data.error || 'Failed to update');
                }
                setUpdateCommentStatus(prev => ({ ...prev, [commentKey]: 'success' }));
                
                // Clear success message after 3 seconds
                setTimeout(() => {
                    setUpdateCommentStatus(prev => {
                        const updated = { ...prev };
                        delete updated[commentKey];
                        return updated;
                    });
                }, 3000);
            } catch (e) {
                setUpdateCommentStatus(prev => ({ ...prev, [commentKey]: 'error' }));
                console.error('Error updating comment:', e);
            }
        }
    };

    return (
        <div className="mt-4 border-t pt-4 space-y-6">
            <div className="mb-3 text-sm text-gray-600">
                <span className="font-medium">Days Missed:</span> {student.daysMissed || 0}
            </div>
            {student.subjects && student.subjects.length > 0 ? (
                student.subjects.map((s, idx) => {
                    const gradeForSubject = student.grades.find(g => g.subject === s);
                    
                    if (!gradeForSubject) return null;
                    if (!gradeForSubject.assessments) {
                        return (
                            <div key={idx} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                <div className="mb-3">
                                    <h4 className="text-lg font-semibold text-gray-800 flex items-center">
                                        <span className="w-3 h-3 bg-emerald-500 rounded-full mr-2"></span>
                                        {s}
                                    </h4>
                                    <p className="text-sm text-gray-500 ml-5">
                                        Classes Missed: {student.classesMissed?.[s] || 0}
                                    </p>
                                </div>
                                <div className="bg-white rounded-md p-3 border border-gray-200">
                                    <span className="text-gray-500 text-sm">No grades available</span>
                                </div>
                            </div>
                        );
                    }
                    // Get and sort assessments
                    const assessments = gradeForSubject.assessments || [];
                    const sortedAssessments = assessments.sort((a, b) => {
                        const order = { 'Midterm 1': 1, 'Endterm': 2, 'Midterm 2': 3, 'Final': 4 };
                        return (order[a.name] || 999) - (order[b.name] || 999);
                    });
                    // Calculate overall grade
                    const overall = calculateSubjectAverage(student, s);

                    const commentForSubject = student.comments.find(c => c.subject === s);
                    const commentKey = `${student.admissionNum}-${s}`;
                    const existingComment = commentForSubject?.comment || '';

                    return (
                        <div key={idx} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                            <div className="mb-4">
                                <h4 className="text-lg font-semibold text-gray-800 mb-3 flex items-center justify-between">
                                    <span className="flex items-center">
                                        <span className="w-3 h-3 bg-emerald-500 rounded-full mr-2"></span>
                                        {s}
                                    </span>
                                    <span className="text-base px-2 py-1 rounded">
                                        Overall: {overall.average.toFixed(1)}% ({overall.letterGrade})
                                    </span>
                                </h4>
                                {/* Grades Section */}
                                <div className="mb-4">
                                    <h5 className="text-sm font-medium text-gray-700 mb-2">Assessment Scores</h5>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                                        {sortedAssessments.map((assessment, i) => (
                                            <div key={i} className="bg-white rounded-md p-2 border border-gray-200 shadow-sm">
                                                <div className="flex items-center justify-between">
                                                    <label className="text-sm font-medium text-gray-700">{assessment.name}:</label>
                                                    <div className="flex items-center gap-2">
                                                        <input
                                                            type="number"
                                                            value={editedScores[student.admissionNum + "-" + s + "-" + assessment.name] !== undefined 
                                                                    ? editedScores[student.admissionNum + "-" + s + "-" + assessment.name] 
                                                                    : (assessment.score || '')}
                                                            min="0"
                                                            max="100"
                                                            placeholder="--"
                                                            className="border border-gray-300 px-1 py-1 rounded-md w-20 text-center focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition duration-200 no-print"
                                                            onChange={(e) => {
                                                                const value = e.target.value;
                                                                setEditedScores(prev => ({
                                                                    ...prev,
                                                                    [student.admissionNum + "-" + s + "-" + assessment.name]: value
                                                                }));
                                                            }}
                                                            onBlur={(e) => handleScoreUpdate(student, s, assessment, e.target.value)}
                                                        />
                                                        <span className="text-gray-500">/100</span>
                                                    </div>
                                                </div>
                                                <div className="mt-1 min-h-[20px]">
                                                    {updateStatus[`${student.admissionNum}-${s}-${assessment.name}`] === 'loading' && (
                                                        <div className="flex items-center gap-1">
                                                            <div className="w-3 h-3 border border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                                            <span className="text-xs text-blue-600">Saving...</span>
                                                        </div>
                                                    )}
                                                    {updateStatus[`${student.admissionNum}-${s}-${assessment.name}`] === 'success' && (
                                                        <div className="flex items-center gap-1">
                                                            <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                            </svg>
                                                            <span className="text-xs text-green-600">Saved</span>
                                                        </div>
                                                    )}
                                                    {updateStatus[`${student.admissionNum}-${s}-${assessment.name}`] === 'error' && (
                                                        <div className="flex items-center gap-1">
                                                            <svg className="w-3 h-3 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                            </svg>
                                                            <span className="text-xs text-red-500">Error saving</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            {/* Comments Section */}
                            <div className="border-t border-gray-200 pt-4">
                                <h5 className="text-sm font-medium text-gray-700 mb-2 flex items-center">
                                    <svg className="w-4 h-4 mr-1 text-gray-600 no-print" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                    Teacher Comment
                                </h5>
                                <div className="bg-white rounded-md border border-gray-200 shadow-sm">
                                    <textarea
                                        rows="2"
                                        placeholder={"Add a comment for this student..."}
                                        defaultValue={existingComment}
                                        className="w-full px-3 py-2 border-0 rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition duration-200 placeholder-gray-400 no-print"
                                        onChange={(e) => {
                                            setEditedComments(prev => ({
                                                ...prev,
                                                [commentKey]: e.target.value
                                            }));
                                        }}
                                        onBlur={(e) => handleCommentUpdate(student, s, e.target.value.trim(), existingComment)}
                                    />
                                    <div className="px-3 pb-2 min-h-[24px] flex items-center justify-between">
                                        <div className="flex items-center">
                                            {updateCommentStatus[commentKey] === 'loading' && (
                                                <div className="flex items-center gap-1">
                                                    <div className="w-3 h-3 border border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                                    <span className="text-xs text-blue-600">Saving comment...</span>
                                                </div>
                                            )}
                                            {updateCommentStatus[commentKey] === 'success' && (
                                                <div className="flex items-center gap-1">
                                                    <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                    </svg>
                                                    <span className="text-xs text-green-600">Comment saved</span>
                                                </div>
                                            )}
                                            {updateCommentStatus[commentKey] === 'error' && (
                                                <div className="flex items-center gap-1">
                                                    <svg className="w-3 h-3 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                    </svg>
                                                    <span className="text-xs text-red-500">Error saving comment</span>
                                                </div>
                                            )}
                                        </div>
                                        <span className="text-xs text-gray-400">
                                            {(editedComments[commentKey] || existingComment || '').length}/500
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })
            ) : (
                <div className="bg-gray-50 rounded-lg p-6 text-center border border-gray-200">
                    <svg className="w-8 h-8 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    <p className="text-gray-500">No subjects available for this student</p>
                </div>
            )}
        </div>
    );
}

export default RenderGradesAndComments;