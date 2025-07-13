import { useState, useEffect } from "react";
import StudentForm from './PortalStudentForm.jsx';

function PortalStudentRecords() {
    const [name, setName] = useState('');
    const [openForm, setOpenForm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [expandedStudentIds, setExpandedStudentIds] = useState([]);
    const [roster, setRoster] = useState([]);
    const [rosterLoading, setRosterLoading] = useState(false);
    const [rosterError, setRosterError] = useState('');
    const [filteredData, setFilteredData] = useState([]);
    const [filterForm, setFilterForm] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [filterPayment, setFilterPayment] = useState('');
    const [sortBy, setSortBy] = useState('name');

    const toggleStudentDetails = (id) => {
        setExpandedStudentIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const removeStudentFromList = (deletedAdmissionNum) => {
        setFilteredData(prev => prev.filter(student => student.admissionNum !== deletedAdmissionNum));
        setExpandedStudentIds(prev => prev.filter(id => id !== deletedAdmissionNum));
    };

    const handleSearchStudent = async (e) => {
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
        setRosterLoading(true);
        setRosterError('');

        try {
            const baseURL = import.meta.env.VITE_API_BASE_URL
            const token = sessionStorage.getItem('token');

            const res = await fetch(`${baseURL}/get-students`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                }
            });

            const data = await res.json();
            if (res.ok) {
                setRoster(data);
                setFilteredData(data);
            } else {
                setRosterError(data.error || 'Cannot retrieve roster');
            }
        } catch (e) {
            setRosterError('Failed to retrieve roster. Reload the page to try again.');
        } finally {
            setRosterLoading(false);
        }
    }

    useEffect(() => {
        handleGetRoster();
    }, []);

    const getFilteredAndSortedRoster = () => {
        let filtered = filteredData;
        
        if (filterForm) {
            filtered = filtered.filter(student => student.form === Number(filterForm));
        }
        if (filterStatus) {
            filtered = filtered.filter(student => student.status === filterStatus);
        }
        if (filterPayment) {
            if (filterPayment === 'outstanding') {
                filtered = filtered.filter(student => student.tuitionOwed > 0);
            } else {
                filtered = filtered.filter(student => student.tuitionOwed === 0);
            }
        }
        
        return filtered.sort((a, b) => {
            switch (sortBy) {
                case 'name':
                    return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
                case 'form':
                    return a.form - b.form;
                case 'dateOfBirth':
                    return new Date(a.dateOfBirth) - new Date(b.dateOfBirth);
                default:
                    return 0;
            }
        });
    };

    const uniqueForms = [...new Set(roster.map(student => student.form))].sort();
    const filteredRoster = getFilteredAndSortedRoster();
    const hasFilterError = filteredRoster.length === 0 && (filterForm || filterStatus) && roster.length > 0;

    useEffect(() => {}, [sortBy]);

    return (
        <section className="pt-40 pb-20 px-4 max-w-6xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Student Records</h1>
                <p className="text-gray-600">Search for existing students or add new ones to the system</p>
            </div>
            {/* Search Student */}
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
            {/* Add New Student */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
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
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        >
                            <option value="">All Status</option>
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                            <option value="Graduated">Graduated</option>
                        </select>

                        <select
                            value={filterPayment}
                            onChange={(e) => setFilterPayment(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        >
                            <option value="">All Payment Status</option>
                            <option value="outstanding">Outstanding Charges</option>
                            <option value="paid">Paid in Full</option>
                        </select>
                        
                        <select
                            value={sortBy}
                            onChange={(e) => setSortBy(e.target.value)}
                            className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        >
                            <option value="name">Sort by Name</option>
                            <option value="form">Sort by Form</option>
                            <option value="dateOfBirth">Sort by Age</option>
                        </select>
                    </div>
                </div>
                {/* Filter Error Message */}
                {hasFilterError && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4">
                        <div className="flex items-center">
                            <svg className="w-5 h-5 text-yellow-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                            <p className="text-yellow-600 text-sm font-medium">No students found with current filters.</p>
                        </div>
                    </div>
                )}

                {filteredRoster.length > 0 && (
                    <div className="space-y-3">
                        {filteredRoster.map(student => {
                            const isOpen = expandedStudentIds.includes(student._id);
                            return (
                                <div key={student._id} className="border rounded-lg shadow-sm p-4">
                                    <div className="flex justify-between items-center">
                                        <div>
                                            <p className="font-semibold text-lg">{student.firstName} {student.lastName}</p>
                                            <p className="text-sm text-gray-600">Admission Number: {student.admissionNum}</p>
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

                {rosterLoading && (
                    <div className="flex items-center justify-center py-12">
                        <div className="flex items-center space-x-3">
                            <div className="w-6 h-6 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-lg font-medium text-emerald-600">Loading roster...</span>
                        </div>
                    </div>
                )}
                {rosterError && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
                        <div className="flex items-center">
                            <svg className="w-5 h-5 text-red-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                            </svg>
                            <p className="text-red-600 text-sm font-medium">{rosterError}</p>
                        </div>
                    </div>
                )}
            </div>
        </section>
    );
}

export default PortalStudentRecords;