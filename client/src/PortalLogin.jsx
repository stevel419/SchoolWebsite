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
        <section className="pt-20">
            <div>
                <label>Username:</label>
                <input
                    type="text"
                    required
                    value={ username }
                    onChange={ (e) => setUsername(e.target.value) }
                />
                <label>Password:</label>
                <input
                    type={ showPassword ? "text" : "password" }
                    required
                    value={ password }
                    onChange={ (e) => setPassword(e.target.value) }
                />
                <button type="button" onClick={ togglePassword }>
                    <FontAwesomeIcon icon={ showPassword ? faEyeSlash : faEye } />
                </button>
                <Link to="/PortalSignup">Sign up</Link>
                <button onClick={ handleLogin }>Login</button>
            </div>
        </section>
    );
}

export default PortalLogin;