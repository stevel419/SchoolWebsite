import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

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
            const res = await fetch('http://localhost:3000/create-user', {
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

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4 pt-40 pb-20">
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
                                placeholder="Enter subject (e.g., Mathematics, English, Science)"
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
            </div>
        </div>
    );
}

export default PortalSignup;