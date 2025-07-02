import { useState } from "react";
import StudentForm from './PortalStudentForm.jsx';

function PortalStudentRecords() {
    const [name, setName] = useState('');
    const [openForm, setOpenForm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [studentData, setStudentData] = useState([]);
    const [expandedStudentIds, setExpandedStudentIds] = useState([]);

    const toggleStudentDetails = (id) => {
        setExpandedStudentIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const removeStudentFromList = (deletedAdmissionNum) => {
        setStudentData(prev => prev.filter(student => student.admissionNum !== deletedAdmissionNum));
        setExpandedStudentIds(prev => prev.filter(id => id !== deletedAdmissionNum));
    };

    const handleSearchStudent = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const baseURL = import.meta.env.VITE_API_BASE_URL
            const token = sessionStorage.getItem('token');

            const res = await fetch(`${baseURL}/search-students?name=${encodeURIComponent(name)}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                }
            });

            const data = await res.json();
            if (res.ok) {
                setStudentData(data);
                setName('');
            } else {
                setError(data.error || 'Cannot find matching students');
            }
        } catch (e) {
            setError('Failed to search student. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <section className="pt-40 pb-20 px-4 max-w-6xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Student Records</h1>
                <p className="text-gray-600">Search for existing students or add new ones to the system</p>
            </div>
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
                {/* Student Info */}
                {studentData.length > 0 && (
                    <div className="mt-6 space-y-4">
                        {studentData.map(student => {
                            const isOpen = expandedStudentIds.includes(student._id);
                            return (
                                <div key={student._id} className="border rounded-lg shadow-sm p-4">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="font-semibold text-lg">{student.firstName} {student.lastName}</p>
                                            <p className="text-sm text-gray-600">Form: {student.form}</p>
                                        </div>
                                        <button
                                            onClick={() => toggleStudentDetails(student._id)}
                                            className="text-emerald-600 hover:underline font-medium"
                                        >
                                            {isOpen ? 'Hide Details' : 'View Details'}
                                        </button>
                                    </div>

                                    {isOpen && (
                                        <div className="mt-4 border-t pt-4">
                                            <StudentForm 
                                                mode="edit" 
                                                student={student}
                                                onDeleteSuccess={() => removeStudentFromList(student.admissionNum)}
                                            />
                                            <div className="mt-6 border-t pt-6">
                                                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                                    <svg className="w-5 h-5 text-emerald-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                    </svg>
                                                    Academic Records
                                                </h3>
                                                {student.reports && student.reports.length > 0 ? (
                                                    <div className="space-y-3">
                                                        {student.reports.sort((a, b) => a.form - b.form).map((report, index) => (
                                                            <div key={index} className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-lg p-4 border border-emerald-200 hover:shadow-md transition-all duration-200">
                                                                <div className="flex items-center justify-between">
                                                                    <div className="flex items-center">
                                                                        <div className="w-3 h-3 bg-emerald-500 rounded-full mr-3 flex-shrink-0"></div>
                                                                        <div>
                                                                            <a
                                                                                href={report.url}
                                                                                target="_blank" 
                                                                                rel="noopener noreferrer"
                                                                                className="font-medium text-gray-800 hover:underline hover:text-gray-600"
                                                                            >
                                                                                Form {report.form} Student Report
                                                                            </a>
                                                                        </div>
                                                                    </div>
                                                                    <a
                                                                        href={report.url}
                                                                        target="_blank" 
                                                                        rel="noopener noreferrer"
                                                                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                                                                    >
                                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                                        </svg>
                                                                        Download
                                                                    </a>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="bg-gray-50 rounded-lg p-8 text-center border-2 border-dashed border-gray-200">
                                                        <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                                        </svg>
                                                        <h4 className="text-lg font-medium text-gray-700 mb-2">No Academic Records</h4>
                                                        <p className="text-gray-500">No student reports have been uploaded for this student yet.</p>
                                                        <div className="mt-4">
                                                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                                Reports will appear here once uploaded
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
            <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-2xl font-semibold text-gray-800">Add New Student</h2>
                    <button 
                        onClick={() => setOpenForm((prev) => !prev)}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-md transition duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                    >
                        <span>{openForm ? 'Hide Form' : 'Add Student'}</span>
                        <span className={`text-lg font-bold transition-transform duration-200 ${openForm ? 'rotate-45' : ''}`}>
                            +
                        </span>
                    </button>
                </div>
                <div className={`transition-all duration-300 ease-in-out ${
                    openForm ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
                }`}>
                    {openForm && <StudentForm mode="add" />}
                </div>
            </div>
        </section>
    );
}

export default PortalStudentRecords;