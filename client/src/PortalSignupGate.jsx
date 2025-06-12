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
<section className="min-h-screen pt-24 bg-gray-100 flex items-center justify-center">
  <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md space-y-6">
    <h2 className="text-2xl font-semibold text-center text-emerald-700">Admin Access</h2>

    <div className="space-y-4">
      <div>
        <label className="block text-gray-700 font-medium mb-1">Administrator Password</label>
        <div className="flex items-center border rounded-md overflow-hidden">
          <input
            type={showPassword ? "text" : "password"}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 focus:outline-none"
          />
          <button
            type="button"
            onClick={togglePassword}
            className="px-4 text-gray-500 hover:text-emerald-600"
          >
            <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
          </button>
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-600 text-center font-medium">
          {error}
        </p>
      )}

      <div className="text-center">
        <button
          onClick={handleSubmit}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-md shadow-md transition"
        >
          Submit
        </button>
      </div>
    </div>
  </div>
</section>
    );
}

export default PortalSignupGate;