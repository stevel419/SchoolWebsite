import { useState } from 'react';
import { Trash2, AlertTriangle, X, Pencil, SquarePlus } from 'lucide-react';

const PortalStudentForm = ({ mode = 'add', student = {}, onDeleteSuccess }) => {
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
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [studentToDelete, setStudentToDelete] = useState(null);
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [deleteError, setDeleteError] = useState('');
    const [deleteSuccess, setDeleteSuccess] = useState('');

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
                isActive,
                isEditMode: mode === 'edit'
            };
            const baseURL = import.meta.env.VITE_API_BASE_URL
            const token = sessionStorage.getItem('token');

            const res = await fetch(`${baseURL}/save-student`, {
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

    const handleDelete = async (e) => {
        e.preventDefault();
        setDeleteLoading(true);
        setDeleteError('');
        setDeleteSuccess('');

        try {
            const baseURL = import.meta.env.VITE_API_BASE_URL
            const token = sessionStorage.getItem("token");

            const res = await fetch(`${baseURL}/delete-student/${encodeURIComponent(studentToDelete)}`, {
                method : 'DELETE',
                headers : {
                    'Authorization': 'Bearer ' + token
                }
            });

            const data = await res.json();
            if (res.ok) {
                setDeleteSuccess(data.message || 'Student deleted successfully');

                setTimeout(() => {
                    if (onDeleteSuccess) onDeleteSuccess();
                    closeModal();
                }, 800);
            } else {
                setDeleteError(data.error || 'Failed to delete student');
            }
        } catch (e) {
            setDeleteError('Failed to process student. Please try again.');
        } finally {
            setDeleteLoading(false);
        }
    }

    const closeModal = () => {
        if (!deleteLoading) {
            setShowConfirmModal(false);
            setStudentToDelete(null);
            setDeleteError('');
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
                <div className="pt-4 border-t border-gray-200">
                    {mode === 'edit' ? (
                        <div className="flex flex-col sm:flex-row gap-4">
                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="flex-1 inline-flex justify-center items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                            >
                                {loading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                        Updating Student...
                                    </>
                                ) : (
                                    <>
                                        <Pencil className="h-4 w-4" />
                                        Update Student
                                    </>
                                )}
                            </button>
                            
                            <button
                                onClick={() => {
                                    setStudentToDelete(student.admissionNum);
                                    setShowConfirmModal(true);
                                }}
                                disabled={deleteLoading || loading}
                                className="flex-1 inline-flex justify-center items-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed text-white font-medium py-3 px-4 rounded-lg transition duration-200 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                            >
                                <Trash2 className="h-4 w-4" />
                                Delete Student
                            </button>
                        </div>
                    ) : (
                        <div className="flex justify-center">
                            <button
                                onClick={handleSubmit}
                                disabled={loading}
                                className="inline-flex justify-center items-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 disabled:cursor-not-allowed text-white font-medium py-3 px-8 rounded-lg transition duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 min-w-[200px]"
                            >
                                {loading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                                        Adding Student...
                                    </>
                                ) : (
                                    <>
                                        <SquarePlus className="h-4 w-4" />
                                        Add Student
                                    </>
                                )}
                            </button>
                        </div>
                    )}
                </div>
                {mode === 'edit' && (
                    <>
                        {showConfirmModal && (
                            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4">
                                <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden">
                                    <div className="flex items-center justify-between p-6 border-b border-gray-200">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-red-100 rounded-full">
                                                <AlertTriangle className="h-6 w-6 text-red-600" />
                                            </div>
                                            <h2 className="text-xl font-semibold text-gray-900">Delete Student</h2>
                                        </div>
                                        <button
                                            onClick={closeModal}
                                            disabled={deleteLoading}
                                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <X className="h-5 w-5 text-gray-500" />
                                        </button>
                                    </div>
                                    <div className="p-6">
                                        <p className="text-gray-700 mb-4">
                                            Are you sure you want to delete <strong>{student.firstName} {student.lastName}</strong>?
                                        </p>
                                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                            <div className="flex items-start gap-2">
                                                <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                                                <div>
                                                    <p className="text-yellow-800 font-medium text-sm">Warning</p>
                                                    <p className="text-yellow-700 text-sm mt-1">
                                                        This action cannot be undone. All records for this student will be deleted.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        {/* Delete Messages */}
                                        {deleteSuccess && (
                                            <div className="mt-4 bg-green-50 border border-green-200 rounded-lg p-3">
                                                <p className="text-green-600 text-sm">{deleteSuccess}</p>
                                            </div>
                                        )}
                                        {deleteError && (
                                            <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3">
                                                <p className="text-red-600 text-sm">{deleteError}</p>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex gap-3 p-6 bg-gray-50 border-t border-gray-200">
                                        <button
                                            onClick={closeModal}
                                            disabled={deleteLoading}
                                            className="flex-1 px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                                        >
                                            No, Don't Delete
                                        </button>
                                        <button
                                            onClick={handleDelete}
                                            disabled={deleteLoading}
                                            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                                        >
                                            {deleteLoading ? (
                                                <><div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>Deleting...</>
                                            ) : (
                                                <><Trash2 className="h-4 w-4" />Yes, Delete</>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default PortalStudentForm;