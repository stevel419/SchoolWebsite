import { useEffect, useState, useRef } from "react";
import { handlePrint } from './printUtils.js';

function PortalGrades() {
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [editedScores, setEditedScores] = useState({});
    const [editedComments, setEditedComments] = useState({});
    const [updateStatus, setUpdateStatus] = useState({});
    const [updateCommentStatus, setUpdateCommentStatus] = useState({});
    const [roster, setRoster] = useState([]);
    const [rosterError, setRosterError] = useState('');
    const [filteredData, setFilteredData] = useState([]);
    const [expandedStudents, setExpandedStudents] = useState(new Set());
    const [filterForm, setFilterForm] = useState('');
    const [sortBy, setSortBy] = useState('name');
    const [sortSubject, setSortSubject] = useState('');
    const [sortOrder, setSortOrder] = useState('desc');

    const studentRefs = useRef([]);

    const handleStudentPrint = (idx) => {
        const student = filteredData[idx];
        handlePrint(student, calculateSubjectAverage);
    };

    const handleSearchStudent = (e) => {
        if (e) {
            e.preventDefault();
        }
        setLoading(true);
        setError('');

        const term = name.trim().toLowerCase();
        
        if (!term) {
            setFilteredData(roster);
            setLoading(false);
            return;
        }

        const nameParts = term.split(/\s+/);
        let result = [];

        if (nameParts.length === 1) {
            const partial = nameParts[0];
            result = roster.filter(student =>
                student.firstName.toLowerCase().includes(partial) ||
                student.lastName.toLowerCase().includes(partial)
            );
        } else {
            const first = nameParts[0];
            const last = nameParts.slice(1).join(' ');

            result = roster.filter(student => {
                const studentFirst = student.firstName.toLowerCase();
                const studentLast = student.lastName.toLowerCase();

                return (
                    (studentFirst.includes(first) && studentLast.includes(last)) ||
                    (studentFirst.includes(last) && studentLast.includes(first))
                );
            });
        }

        setFilteredData(result);
        
        if (result.length === 0 && term) {
            setError('No matching students found');
        } else {
            setError('');
        }
        
        setLoading(false);
    }

    const handleGetRoster = async () => {
        setRosterError('');

        try {
            const token = sessionStorage.getItem('token');

            const res = await fetch('http://localhost:3000/get-students', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                }
            });

            const data = await res.json();
            if (res.ok) {
                const activeStudents = data.filter(student => student.isActive);
                setRoster(activeStudents);
                setFilteredData(activeStudents);
            } else {
                setRosterError(data.error || 'Cannot retrieve roster');
            }
        } catch (e) {
            setRosterError('Failed to retrieve roster. Reload the page to try again.');
        }
    }

    useEffect(() => {
        handleGetRoster();
    }, []);

    const toggleStudentExpansion = (studentId) => {
        setExpandedStudents(prev => {
            const newSet = new Set(prev);
            if (newSet.has(studentId)) {
                newSet.delete(studentId);
            } else {
                newSet.add(studentId);
            }
            return newSet;
        });
    };

    const calculateSubjectAverage = (student, subject) => {
        const gradeForSubject = student.grades.find(g => g.subject === subject);
        if (!gradeForSubject || !gradeForSubject.assessments) {
            return { average: 0, letterGrade: 'N/A', hasGrades: false };
        }
        
        const assessments = gradeForSubject.assessments || [];
        const validScores = assessments.filter(a => a.score !== null && a.score !== undefined);
        
        if (validScores.length === 0) {
            return { average: 0, letterGrade: 'N/A', hasGrades: false };
        }
        
        const sum = validScores.reduce((acc, assessment) => acc + assessment.score, 0);
        const average = sum / validScores.length;
        
        let letterGrade;
        if (student.form >= 5) {
            if (average >= 80) letterGrade = 'A';
            else if (average >= 70) letterGrade = 'B';
            else if (average >= 60) letterGrade = 'C';
            else if (average >= 50) letterGrade = 'D';
            else if (average >= 40) letterGrade = 'E';
            else if (average >= 35) letterGrade = 'S';
            else letterGrade = 'F';
        } else {
            if (average >= 75) letterGrade = 'A';
            else if (average >= 65) letterGrade = 'B';
            else if (average >= 45) letterGrade = 'C';
            else if (average >= 30) letterGrade = 'D';
            else letterGrade = 'F';
        }
        
        return { average, letterGrade, hasGrades: true };
    };

    const getAllSubjects = () => {
        const subjects = new Set();
        roster.forEach(student => {
            if (student.subjects && Array.isArray(student.subjects)) {
                student.subjects.forEach(subject => {
                    const gradeForSubject = student.grades.find(g => g.subject === subject);
                    if (gradeForSubject) {
                        subjects.add(subject);
                    }
                });
            }
        });
        return Array.from(subjects).sort();
    };

    const getFilteredAndSortedRoster = () => {
        let filtered = filteredData;
        
        if (filterForm) {
            filtered = filtered.filter(student => student.form === Number(filterForm));
        }
        if (sortSubject) {
            filtered = filtered.filter(student => Array.isArray(student.subjects) && student.subjects.includes(sortSubject));
        }
        
        return filtered.sort((a, b) => {
            switch (sortBy) {
                case 'name':
                    return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
                case 'form':
                    return a.form - b.form;
                case 'dateOfBirth':
                    return new Date(a.dateOfBirth) - new Date(b.dateOfBirth);
                case 'subjectGrades':
                    if (!sortSubject) return 0;
                    
                    const aAverage = calculateSubjectAverage(a, sortSubject).average;
                    const bAverage = calculateSubjectAverage(b, sortSubject).average;
                    
                    return sortOrder === 'asc' ? aAverage - bAverage : bAverage - aAverage;
                default:
                    return 0;
            }
        });
    };

    const renderStudentGradesAndComment = (student) => {
        return (
            <div className="mt-4 border-t pt-4 space-y-6">
                {student.subjects && student.subjects.length > 0 ? (
                    student.subjects.map((s, idx) => {
                        const gradeForSubject = student.grades.find(g => g.subject === s);
                        
                        if (!gradeForSubject) return null;
                        if (!gradeForSubject.assessments) {
                            return (
                                <div key={idx} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                                    <h4 className="text-lg font-semibold text-gray-800 mb-3">
                                        <span className="flex items-center">
                                            <span className="w-3 h-3 bg-emerald-500 rounded-full mr-2"></span>
                                            {s}
                                        </span>
                                    </h4>
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
                                            <span className="w-3 h-3 bg-emerald-500 rounded-full"></span>
                                            {s}
                                                <span className="text-sm text-gray-600 font-normal ml-6">
                                                Classes Missed: {student.classesMissed?.[s] ?? 0}
                                                </span>
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
                                                                onBlur={async (e) => {
                                                                    const updatedScore = e.target.value;
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
                                                                }}
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
                                            onBlur={async (e) => {
                                                const updatedComment = e.target.value.trim();
                                                
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
                                            }}
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
    };

    const uniqueForms = [...new Set(roster.map(student => student.form))].sort();
    const allSubjects = getAllSubjects();
    const filteredRoster = getFilteredAndSortedRoster();

    useEffect(() => {
        if (sortBy !== 'subjectGrades') {
            setSortSubject('');
            setSortOrder('desc');
        }
    }, [sortBy]);

    return (
        <section className="pt-40 pb-20 px-4 max-w-6xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Grades</h1>
                <p className="text-gray-600">Search for existing students or check roster to enter grades</p>
            </div>
            {/* Search */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">Search Student</h2>
                <form onSubmit={handleSearchStudent} className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                        <input
                            type="text"
                            required
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Search by student name"
                            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition duration-200"
                        />
                    </div>
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-md p-3">
                            <p className="text-red-600 text-sm">{error}</p>
                        </div>
                    )}
                    <button 
                        type="submit"
                        disabled={loading}
                        className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-md transition duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 whitespace-nowrap"
                    >
                        {loading ? 'Searching Student...' : 'Search Student'}
                    </button>
                </form>
            </div>
            {/* Roster */}
            <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <h2 className="text-2xl font-semibold text-gray-800">Roster ({filteredRoster.length} students)</h2>
                    {/* Filter and Sort Controls */}
                    <div className="flex flex-col md:flex-row gap-3">
                        <select
                            value={filterForm}
                            onChange={(e) => setFilterForm(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        >
                            <option value="">All Forms</option>
                            {uniqueForms.map(form => (
                                <option key={form} value={form}>Form {form}</option>
                            ))}
                        </select>
                        
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        >
                            <option value="name">Sort by Name</option>
                            <option value="form">Sort by Form</option>
                            <option value="dateOfBirth">Sort by Age</option>
                            <option value="subjectGrades">Sort by Subject Grades</option>
                        </select>
                        {sortBy === 'subjectGrades' && (
                            <>
                                <select
                                    value={sortSubject}
                                    onChange={(e) => setSortSubject(e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                >
                                    <option value="">Select Subject</option>
                                    {allSubjects.map(subject => (
                                        <option key={subject} value={subject}>{subject}</option>
                                    ))}
                                </select>
                                <select
                                    value={sortOrder}
                                    onChange={(e) => setSortOrder(e.target.value)}
                                    className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                >
                                    <option value="desc">Highest to Lowest</option>
                                    <option value="asc">Lowest to Highest</option>
                                </select>
                            </>
                        )}
                    </div>
                </div>

                {filteredRoster.length > 0 && (
                    <div className="space-y-3">
                        {filteredRoster.map((student, studentIdx) => (
                            <div key={studentIdx} ref={el => studentRefs.current[studentIdx] = el} className="border rounded-lg shadow-sm">
                                {/* Student Basic Info */}
                                <div 
                                    className="p-4 cursor-pointer hover:bg-gray-50 hover:rounded-lg"
                                    onClick={() => toggleStudentExpansion(student.admissionNum)}
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex flex-col sm:flex-row sm:items-center sm:gap-6">
                                            <p className="font-semibold text-lg">{student.firstName} {student.lastName}</p>
                                            <div className="flex flex-col sm:flex-row sm:gap-6 text-sm text-gray-600">
                                                <span>Form: {student.form}</span>
                                                <span>Sex: {student.gender}</span>
                                                <span>DOB: {new Date(student.dateOfBirth).toLocaleDateString()}</span>
                                                <span>Days Missed: {student.daysMissed || 0}</span> {/* Added this */}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 no-print">
                                            <span className="text-sm text-gray-500">
                                                {expandedStudents.has(student.admissionNum) ? 'Hide' : 'Show'} Grades
                                            </span>
                                            <svg 
                                                className={`w-5 h-5 transition-transform ${expandedStudents.has(student.admissionNum) ? 'rotate-180' : ''}`}
                                                fill="none" 
                                                stroke="currentColor" 
                                                viewBox="0 0 24 24"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                                {/* Student Grades And Comment */}
                                {expandedStudents.has(student.admissionNum) && (
                                    <>
                                        <div className="px-4">
                                            {renderStudentGradesAndComment(student)}
                                        </div>
                                        <button
                                            className="ml-auto block my-4 mr-4 px-4 py-2 bg-blue-500 hover:bg-blue-700 text-white font-medium rounded-md transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                                            onClick={() => handleStudentPrint(studentIdx)}
                                        >Print Report</button>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {rosterError && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-3">
                        <p className="text-red-600 text-sm">{rosterError}</p>
                    </div>
                )}
            </div>
        </section>
    );
}

export default PortalGrades;