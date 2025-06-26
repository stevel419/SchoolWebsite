import { useState, useEffect } from 'react';

const PortalStudentForm = ({ mode = 'add', student = {} }) => {
    const [admissionNum, setAdmissionNum] = useState(student.admissionNum || '');
    const [firstName, setFirstName] = useState(student.firstName || '');
    const [lastName, setLastName] = useState(student.lastName || '');
    const [DOB, setDOB] = useState(student.dateOfBirth ? new Date(student.dateOfBirth).toISOString().split('T')[0] : '');
    const [sex, setSex] = useState(student.gender || '');
    const [religion, setReligion] = useState(student.religion || '');
    const [form, setForm] = useState(student.form || '');
    const [subjects, setSubjects] = useState(student.subjects || ['']);
    const [isActive, setIsActive] = useState(student.isActive ?? null);
    const [gName, setGName] = useState(student.guardian?.name || '');
    const [gNumber, setGNumber] = useState(student.guardian?.phone || '');
    const [gOccupation, setGOccupation] = useState(student.guardian?.occupation || '');
    const [address, setAddress] = useState(student.address || '');
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const guardian = {name: gName, phone: gNumber, occupation: gOccupation};
            const studentData = {
                admissionNum: admissionNum.trim(),
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                dateOfBirth: new Date(DOB), 
                gender: sex, 
                religion, 
                guardian, 
                address, 
                form: Number(form), 
                subjects: subjects.filter(subject => subject.trim() !== ''),
                isActive
            };
            const token = sessionStorage.getItem('token');

            const res = await fetch('http://localhost:#000/save-student', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token
                },
                body: JSON.stringify(studentData)
            });

            const data = await res.json();
            if (res.ok) {
                setSuccess(data.message || `Student ${mode === 'edit' ? 'updated' : 'added'} successfully`);
                
                if (mode === 'add') {
                    setAdmissionNum('');
                    setFirstName('');
                    setLastName('');
                    setDOB('');
                    setSex('');
                    setReligion('');
                    setForm('');
                    setSubjects(['']);
                    setIsActive(null);
                    setGName('');
                    setGNumber('');
                    setGOccupation('');
                    setAddress('');
                }
            } else {
                setError(data.error || 'Failed to save student');
            }
        } catch (err) {
            setError('Failed to process student. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-lg p-6 mt-3">
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
                                type="text"
                                required
                                value={admissionNum}
                                onChange={(e) => setAdmissionNum(e.target.value)}
                                placeholder="Enter admission number"
                                className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                                readOnly={mode === 'edit'}
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
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
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
                    <div>
                        <label className="block text-gray-700 font-medium mb-2">
                            Enrollment Status
                        </label>
                        <div className="space-y-2">
                            <label className="flex items-center">
                                <input
                                    type="radio"
                                    name="status"
                                    value="active"
                                    onChange={() => setIsActive(true)}
                                    required
                                    checked={isActive === true}
                                    className="w-4 h-4 text-emerald-600 bg-gray-100 border-gray-300"
                                />
                                <span className="ml-2 text-gray-700">Active</span>
                            </label>
                            <label className="flex items-center">
                                <input
                                    type="radio"
                                    name="status"
                                    value="graduated"
                                    onChange={() => setIsActive(false)}
                                    required
                                    checked={isActive === false}
                                    className="w-4 h-4 text-emerald-600 bg-gray-100 border-gray-300"
                                />
                                <span className="ml-2 text-gray-700">Graduated</span>
                            </label>
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
                    onClick={handleSubmit}
                    disabled={loading}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-medium py-3 px-4 rounded-md transition duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                >
                    {loading 
                        ? (mode === 'edit') ? 'Updating Student...' : 'Adding Student...' 
                        : (mode === 'edit') ? 'Update Student' : 'Add Student'}
                </button>
            </div>
        </div>
    );
};

export default PortalStudentForm;