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
            const token = sessionStorage.getItem('token');

            const res = await fetch(`http://localhost:5000/search-students?name=${encodeURIComponent(name)}`, {
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