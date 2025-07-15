import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';
import { useEffect } from "react";

function PortalSignup() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isAdmin, setIsAdmin] = useState(null);
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [subject, setSubject] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const togglePassword = () => {
        setShowPassword(prev => !prev);
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const baseURL = import.meta.env.VITE_API_BASE_URL

            const res = await fetch(`${baseURL}/create-user`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({firstName, lastName, subject, username, password, isAdmin})
            });

            const data = await res.json();
            
            if (res.ok) {
                setSuccess(data.message || 'Teacher created successfully!');

                setUsername('');
                setPassword('');
                setFirstName('');
                setLastName('');
                setSubject('');
                setIsAdmin(null);
            } else {
                setError(data.error || 'Failed to create teacher');
            }
        } catch (err) {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    function TeacherList() {
        const [teachers, setTeachers] = useState([]);
        const [status, setStatus] = useState({});
        const [showPasswordModal, setShowPasswordModal] = useState(false);
        const [selectedTeacher, setSelectedTeacher] = useState(null);
        const [newPassword, setNewPassword] = useState('');
        const [showNewPassword, setShowNewPassword] = useState(false);
        const [passwordChangeLoading, setPasswordChangeLoading] = useState(false);

        useEffect(() => {
            const fetchTeachers = async () => {
                try {
                    const baseURL = import.meta.env.VITE_API_BASE_URL
                    
                    const res = await fetch(`${baseURL}/get-teachers`);
                    const data = await res.json();
                    if (res.ok) setTeachers(data);
                } catch (err) {
                    console.error("Failed to fetch teachers:", err);
                }
            };
            fetchTeachers();
        }, []);

        const handleDeactivate = async (teacherId) => {
            if (!window.confirm("Are you sure you want to deactivate this teacher?")) return;
            try {
                setStatus(prev => ({ ...prev, [teacherId]: 'loading' }));
                const baseURL = import.meta.env.VITE_API_BASE_URL

                const res = await fetch(`${baseURL}/deactivate-teacher`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ teacherId, confirm: true })
                });

                const data = await res.json();
                if (!res.ok) throw new Error(data.error || 'Failed');

                setTeachers(prev =>
                    prev.map(t => t._id === teacherId ? { ...t, isActive: false } : t)
                );
                setStatus(prev => ({ ...prev, [teacherId]: 'success' }));
                setTimeout(() => {
                    setStatus(prev => {
                        const updated = { ...prev };
                        delete updated[teacherId];
                        return updated;
                    });
                }, 2000);
            } catch (err) {
                console.error(err);
                setStatus(prev => ({ ...prev, [teacherId]: 'error' }));
            }
        };

        const handleChangePassword = (teacher) => {
            setSelectedTeacher(teacher);
            setNewPassword('');
            setShowPasswordModal(true);
        };

        const handlePasswordSubmit = async (e) => {
            e.preventDefault();
            if (!newPassword.trim()) return;

            setPasswordChangeLoading(true);
            try {
                const baseURL = import.meta.env.VITE_API_BASE_URL;
                
                const res = await fetch(`${baseURL}/change-password`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        teacherId: selectedTeacher._id,
                        newPassword
                    })
                });

                const data = await res.json();
                if (res.ok) {
                    setSuccess('Password changed successfully!');
                    setShowPasswordModal(false);
                    setNewPassword('');
                    setSelectedTeacher(null);
                    setTimeout(() => setSuccess(''), 3000);
                } else {
                    setError(data.error || 'Failed to change password');
                    setTimeout(() => setError(''), 3000);
                }
            } catch (err) {
                setError('Network error. Please try again.');
                setTimeout(() => setError(''), 3000);
            } finally {
                setPasswordChangeLoading(false);
            }
        };

        const closePasswordModal = () => {
            setShowPasswordModal(false);
            setSelectedTeacher(null);
            setNewPassword('');
            setShowNewPassword(false);
        };

        return (
            <div className="space-y-4">
                {teachers.map(teacher => (
                    <div key={teacher._id} className="p-4 border rounded-lg shadow-sm bg-white hover:shadow-md transition-shadow">
                        <div className="flex justify-between items-start gap-4">
                            <div className="flex-1">
                                <p className="font-semibold text-gray-800 text-lg">{teacher.firstName} {teacher.lastName}</p>
                                <div className="mt-2 space-y-1">
                                    <p className="text-sm text-gray-600">
                                        <span className="font-medium">Subject:</span> {teacher.subject}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        <span className="font-medium">Username:</span> {teacher.username}
                                    </p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                            teacher.isActive 
                                                ? 'bg-green-100 text-green-800' 
                                                : 'bg-red-100 text-red-800'
                                        }`}>
                                            {teacher.isActive ? 'Active' : 'Deactivated'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-2 min-w-fit">
                                {teacher.isActive && (
                                    <button
                                        onClick={() => handleChangePassword(teacher)}
                                        className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200 whitespace-nowrap"
                                    >
                                        Change Password
                                    </button>
                                )}
                                
                                {teacher.isActive ? (
                                    <button
                                        onClick={() => handleDeactivate(teacher._id)}
                                        disabled={status[teacher._id] === 'loading'}
                                        className={`px-4 py-2 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors duration-200 whitespace-nowrap ${
                                            status[teacher._id] === 'loading'
                                                ? 'bg-gray-400 text-white cursor-not-allowed'
                                                : 'bg-red-600 text-white hover:bg-red-700'
                                        }`}
                                    >
                                        {status[teacher._id] === 'loading' ? (
                                            <div className="flex items-center gap-2">
                                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                                Processing...
                                            </div>
                                        ) : 'Deactivate'}
                                    </button>
                                ) : (
                                    <div className="flex items-center px-4 py-2 text-sm text-gray-400 bg-gray-100 rounded-md border border-gray-200 whitespace-nowrap">
                                        Deactivated
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}

                {/* Password Change Modal */}
                {showPasswordModal && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white p-6 rounded-lg shadow-xl max-w-md w-full mx-4">
                            <h3 className="text-lg font-bold text-gray-800 mb-4">
                                Change Password for {selectedTeacher?.firstName} {selectedTeacher?.lastName}
                            </h3>
                            <form onSubmit={handlePasswordSubmit} className="space-y-4">
                                <div>
                                    <label className="block text-gray-700 font-medium mb-2">
                                        New Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showNewPassword ? "text" : "password"}
                                            required
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            placeholder="Enter new password"
                                            className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 pr-10"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                                        >
                                            <FontAwesomeIcon 
                                                icon={showNewPassword ? faEyeSlash : faEye} 
                                                className="h-5 w-5"
                                            />
                                        </button>
                                    </div>
                                </div>
                                <div className="flex gap-3 justify-end">
                                    <button
                                        type="button"
                                        onClick={closePasswordModal}
                                        className="px-4 py-2 text-gray-600 bg-gray-200 rounded hover:bg-gray-300"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={passwordChangeLoading}
                                        className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 disabled:bg-emerald-400"
                                    >
                                        {passwordChangeLoading ? 'Changing...' : 'Change Password'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 py-20">
            <div className="max-w-2xl w-full bg-white rounded-lg shadow-lg p-8">
                <h1 className="text-2xl font-bold text-emerald-700 text-center mb-8">
                    Create New Teacher Account
                </h1>
                <form onSubmit={handleCreateUser} className="space-y-6">
                    {/* Account Information Section */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold text-gray-800 border-b border-gray-200 pb-2">
                            Account Information
                        </h3>    
                        <div>
                            <label className="block text-gray-700 font-medium mb-2">
                                Username
                            </label>
                            <input
                                type="text"
                                required
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Enter username"
                                className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 font-medium mb-2">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter password"
                                    className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={togglePassword}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-gray-700"
                                >
                                    <FontAwesomeIcon 
                                        icon={showPassword ? faEyeSlash : faEye} 
                                        className="h-5 w-5"
                                    />
                                </button>
                            </div>
                        </div>
                        <div>
                            <label className="block text-gray-700 font-medium mb-3">
                                User Role
                            </label>
                            <div className="space-y-2">
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        name="userType"
                                        value="admin"
                                        onChange={() => setIsAdmin(true)}
                                        required
                                        checked={isAdmin === true}
                                        className="w-4 h-4 text-emerald-600 bg-gray-100 border-gray-300"
                                    />
                                    <span className="ml-2 text-gray-700">Administrator</span>
                                </label>
                                <label className="flex items-center">
                                    <input
                                        type="radio"
                                        name="userType"
                                        value="teacher"
                                        onChange={() => setIsAdmin(false)}
                                        required
                                        checked={isAdmin === false}
                                        className="w-4 h-4 text-emerald-600 bg-gray-100 border-gray-300"
                                    />
                                    <span className="ml-2 text-gray-700">Teacher</span>
                                </label>
                            </div>
                        </div>
                    </div>
                    {/* Teacher Information Section */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-bold text-gray-800 border-b border-gray-200 pb-2">
                            Teacher Information
                        </h3>
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
                        <div>
                            <label className="block text-gray-700 font-medium mb-2">
                                Subject
                            </label>
                            <input
                                type="text"
                                required
                                value={subject}
                                onChange={(e) => setSubject(e.target.value)}
                                placeholder="Ex: Subject-Last Name or None (if admin)"
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
                        type="submit"
                        disabled={loading}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-medium py-3 px-4 rounded-md transition duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                    >
                        {loading ? 'Creating Account...' : 'Create New Teacher'}
                    </button>
                </form>
                {/* Navigation */}
                <div className="mt-6 text-center">
                    <button
                        onClick={() => navigate('/PortalLogin')}
                        className="text-emerald-600 hover:text-emerald-700 text-sm font-medium"
                    >
                        Back to Login
                    </button>
                </div>
                <div className="mt-10 border-t pt-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">Current Teachers</h3>
                        <TeacherList />
                </div>
            </div>
        </div>
    );
}

export default PortalSignup;