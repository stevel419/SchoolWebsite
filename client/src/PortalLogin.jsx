import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faEyeSlash } from '@fortawesome/free-solid-svg-icons';

function PortalLogin() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const navigate = useNavigate();

    const togglePassword = () => {
        setShowPassword(prev => !prev);
    };

    async function login(username, password) {
        const res = await fetch ('http://localhost:5000/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({username, password})
        });

        const data = await res.json();
        if (res.ok) {
            sessionStorage.setItem('token', data.token);
            navigate('/Portal');
        } else {
            throw new Error(data.error);
        }
    }

    async function handleLogin(e) {
        e.preventDefault();
        try {
            await login(username, password);
            alert('Login successful!');
        } catch (e) {
            alert('Login failed: ' + e.message);
        }
    }

    return (
<section className="min-h-screen pt-24 bg-gray-100 flex items-center justify-center">
  <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md space-y-6">
    <h2 className="text-2xl font-semibold text-center text-emerald-700">Teacher Login</h2>

    <div className="space-y-4">
      <div>
        <label className="block text-gray-700 font-medium mb-1">Username</label>
        <input
          type="text"
          required
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      <div>
        <label className="block text-gray-700 font-medium mb-1">Password</label>
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

      <div className="flex justify-between items-center">
        <Link
          to="/PortalSignupGate"
          className="text-sm text-emerald-600 hover:underline"
        >
          Don't have an account? Sign up
        </Link>
        <button
          onClick={handleLogin}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2 rounded-md shadow-md transition"
        >
          Login
        </button>
      </div>
    </div>
  </div>
</section>
    );
}

export default PortalLogin;