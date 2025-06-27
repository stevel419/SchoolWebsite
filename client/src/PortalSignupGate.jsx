import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

function PortalSignupGate() {
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const masterPassword = "12345678";
    const navigate = useNavigate();

    const togglePassword = () => {
        setShowPassword(prev => !prev);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (password === masterPassword) {
            setError('');
            navigate('/PortalSignup');
        } else {
            setError('Incorrect password.');
        }
    }

    return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center px-8">
            <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
                <h1 className="text-2xl font-bold text-emerald-700 text-center mb-8">
                    Administrator Access
                </h1>
                <form onSubmit={ handleSubmit } className="space-y-6">
                    <div>
                        <label className="block text-gray-700 font-medium mb-2">
                            Administrator Password
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 pr-10"
                                placeholder="Enter admin password"
                            />
                            <button
                                type="button"
                                onClick={togglePassword}
                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500 hover:text-emerald-600"
                            >
                                <FontAwesomeIcon 
                                    icon={showPassword ? faEyeSlash : faEye} 
                                    className="h-5 w-5"
                                />
                            </button>
                        </div>
                        {error && (
                            <p className="text-red-500 text-sm mt-2">{error}</p>
                        )}
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 px-4 rounded-md transition duration-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
                    >
                        Access Sign Up
                    </button>
                </form>
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

export default PortalSignupGate;