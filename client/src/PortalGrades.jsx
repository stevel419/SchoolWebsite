import { useEffect, useState, useRef } from "react";
import RenderStudentGradesAndComments from './RenderGradesAndComments.jsx';
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
        
        const assessments = gradeForSubject.assessments;

        const weights = {
            "Midterm 1" : 0.2,
            "Midterm 2" : 0.2,
            "Endterm" : 0.3,
            "Final" : 0.3
        };

        let total = 0;
        let weightSum = 0;
        for (const a of assessments) {
            const weight = weights[a.name];
            if (weight && a.score != null && a.score !== undefined) {
                total += a.score * weight;
                weightSum += weight;
            }
        }

        if (weightSum === 0) {
            return { average: 0, letterGrade: 'N/A', hasGrades: false };
        }

        const average = total / weightSum;
        
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
                                                {expandedStudents.has(student.admissionNum) ? 'Hide' : 'View'}
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
                                            <RenderStudentGradesAndComments
                                                student={student}
                                                calculateSubjectAverage={calculateSubjectAverage}
                                                editedScores={editedScores}
                                                setEditedScores={setEditedScores}
                                                editedComments={editedComments}
                                                setEditedComments={setEditedComments}
                                                updateStatus={updateStatus}
                                                setUpdateStatus={setUpdateStatus}
                                                updateCommentStatus={updateCommentStatus}
                                                setUpdateCommentStatus={setUpdateCommentStatus}
                                                setRoster={setRoster}
                                                setFilteredData={setFilteredData}
                                            />
                                        </div>
                                        <button
                                            className="ml-auto block my-4 mr-4 px-4 py-2 bg-gray-500 hover:bg-gray-700 text-white font-medium rounded-md transition duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                                        
                                        >Save Report</button>
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