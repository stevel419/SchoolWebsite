import { useState } from "react";

const token = sessionStorage.getItem('token');

const StudentForm = () => {
    const [admissionNum, setAdmissionNum] = useState('');
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [DOB, setDOB] = useState('');
    const [sex, setSex] = useState('');
    const [religion, setReligion] = useState('');
    const [form, setForm] = useState('');
    const [subjects, setSubjects] = useState(['']);
    const [gName, setGName] = useState('');
    const [gNumber, setGNumber] = useState('');
    const [gOccupation, setGOccupation] = useState('');
    const [address, setAddress] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleChange = (index, value) => {
        const updatedSubjects = [...subjects];
        updatedSubjects[index] = value;
        setSubjects(updatedSubjects);
    };

    const addSubjectField = () => {
        setSubjects([...subjects, '']);
    };

    const removeSubjectField = (index) => {
        const updatedSubjects = subjects.filter((_, i) => i !== index);
        setSubjects(updatedSubjects);
    };

    const handleAddStudent = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const guardian = {name: gName, phone: gNumber, occupation: gOccupation};
            const studentData = {
                admissionNum: Number(admissionNum), 
                firstName, 
                lastName, 
                dateOfBirth: new Date(DOB), 
                gender: sex, 
                religion, 
                guardian, 
                address, 
                form: Number(form), 
                subjects: subjects.filter(subject => subject.trim() !== '')
            };

            const res = await fetch('http://localhost:5000/save-student', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                body: JSON.stringify(studentData)
            });

            const data = await res.json();
            if (res.ok) {
                setSuccess(data.message || 'Student added successfully!');
                
                setAdmissionNum('');
                setFirstName('');
                setLastName('');
                setDOB('');
                setSex('');
                setReligion('');
                setForm('');
                setSubjects(['']);
                setGName('');
                setGNumber('');
                setGOccupation('');
                setAddress('');
            } else {
                setError(data.error || 'Failed to create student');
            }
        } catch (err) {
            setError('Failed to add student. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
            <div className="space-y-6">
                {/* Student Information Section */}
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-gray-800 border-b border-gray-200 pb-2">
                        Student Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-700 font-medium mb-2">
                                Admission Number
                            </label>
                            <input
                                type="number"
                                required
                                value={admissionNum}
                                onChange={(e) => setAdmissionNum(e.target.value)}
                                placeholder="Enter admission number"
                                className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 font-medium mb-2">
                                Form
                            </label>
                            <input
                                type="number"
                                min="1"
                                max="6"
                                required
                                value={form}
                                onChange={(e) => setForm(e.target.value)}
                                placeholder="Enter form (1-6)"
                                className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-700 font-medium mb-2">
                                First Name
                            </label>
                            <input
                                type="text"
                                required
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                placeholder="Enter first name"
                                className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 font-medium mb-2">
                                Last Name
                            </label>
                            <input
                                type="text"
                                required
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                                placeholder="Enter last name"
                                className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            />
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-700 font-medium mb-2">
                                Date of Birth
                            </label>
                            <input
                                type="date"
                                required
                                value={DOB}
                                onChange={(e) => setDOB(e.target.value)}
                                className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 font-medium mb-2">
                                Sex
                            </label>
                            <select
                                required
                                value={sex}
                                onChange={(e) => setSex(e.target.value)}
                                className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            >
                                <option value="" disabled>-- Select one --</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                            </select>
                        </div>
                    </div>
                    <div>
                        <label className="block text-gray-700 font-medium mb-2">
                            Religion
                        </label>
                        <input
                            type="text"
                            required
                            value={religion}
                            onChange={(e) => setReligion(e.target.value)}
                            placeholder="Enter religion"
                            className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        />
                    </div>
                    <div>
                        <label className="block text-gray-700 font-medium mb-2">
                            Subjects
                        </label>
                        <div className="space-y-3">
                            {subjects.map((subject, index) => (
                                <div key={index} className="flex gap-2">
                                    <input
                                        type="text"
                                        value={subject}
                                        onChange={(e) => handleChange(index, e.target.value)}
                                        placeholder={`Subject ${index + 1}`}
                                        required
                                        className="flex-1 px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                    />
                                    {subjects.length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeSubjectField(index)}
                                            className="px-3 py-2 bg-red-500 hover:bg-red-600 text-white rounded-md transition duration-200 text-sm"
                                        >
                                            Remove
                                        </button>
                                    )}
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={addSubjectField}
                                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md transition duration-200 text-sm font-medium"
                            >
                                Add Subject
                            </button>
                        </div>
                    </div>
                </div>
                {/* Guardian Information Section */}
                <div className="space-y-4">
                    <h3 className="text-lg font-bold text-gray-800 border-b border-gray-200 pb-2">
                        Guardian Information
                    </h3>
                    <div>
                        <label className="block text-gray-700 font-medium mb-2">
                            Guardian Full Name
                        </label>
                        <input
                            type="text"
                            required
                            value={gName}
                            onChange={(e) => setGName(e.target.value)}
                            placeholder="Enter guardian's full name"
                            className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-gray-700 font-medium mb-2">
                                Guardian Phone Number
                            </label>
                            <input
                                type="tel"
                                required
                                value={gNumber}
                                onChange={(e) => setGNumber(e.target.value)}
                                placeholder="Enter phone number"
                                className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 font-medium mb-2">
                                Guardian Occupation
                            </label>
                            <input
                                type="text"
                                required
                                value={gOccupation}
                                onChange={(e) => setGOccupation(e.target.value)}
                                placeholder="Enter occupation"
                                className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-gray-700 font-medium mb-2">
                            Place of Domicile
                        </label>
                        <input
                            type="text"
                            required
                            value={address}
                            onChange={(e) => setAddress(e.target.value)}
                            placeholder="Enter address"
                            className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                        />
                    </div>
                </div>
                {/* Messages */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-md p-3">
                        <p className="text-red-600 text-sm">{error}</p>
                    </div>
                )}
                {success && (
                    <div className="bg-green-50 border border-green-200 rounded-md p-3">
                        <p className="text-green-600 text-sm">{success}</p>
                    </div>
                )}
                {/* Submit Button */}
                <button
                    onClick={handleAddStudent}
                    disabled={loading}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-medium py-3 px-4 rounded-md transition duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                >
                    {loading ? 'Adding Student...' : 'Add Student'}
                </button>
            </div>
        </div>
    );
};

function StudentRecords() {
    const [name, setName] = useState('');
    const [openForm, setOpenForm] = useState(false);

    const handleSearchStudent = async (e) => {
        e.preventDefault();

    }

    return (
        <section className="pt-40 pb-20 px-4 max-w-6xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Student Records</h1>
                <p className="text-gray-600">Search for existing students or add new ones to the system</p>
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
                    <button 
                        type="submit"
                        className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-md transition duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 whitespace-nowrap"
                    >
                        Search Student
                    </button>
                </form>
            </div>
            <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-800">Add New Student</h2>
                    <button 
                        onClick={() => setOpenForm((prev) => !prev)}
                        className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-md transition duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                    >
                        <span>{openForm ? 'Hide Form' : 'Add New Student'}</span>
                        <span className={`text-lg font-bold transition-transform duration-200 ${openForm ? 'rotate-45' : ''}`}>
                            +
                        </span>
                    </button>
                </div>
                <div className={`transition-all duration-300 ease-in-out ${
                    openForm ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'
                }`}>
                    {openForm && <StudentForm />}
                </div>
            </div>
        </section>
    );
}

export default StudentRecords;