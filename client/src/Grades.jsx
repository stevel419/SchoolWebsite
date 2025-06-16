import { useState } from "react";

function Grades() {
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [studentData, setStudentData] = useState([]);

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
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Grades</h1>
                <p className="text-gray-600">Search for existing students or check roster to enter grades</p>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Search Student</h2>
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
        </section>
    );
}

export default Grades;