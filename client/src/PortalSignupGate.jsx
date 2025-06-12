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
        <section className="pt-20">
            <div>
                <label>Administrator Password:</label>
                <input
                    type={ showPassword ? "text" : "password" }
                    required
                    value={ password }
                    onChange={ (e) => setPassword(e.target.value) }
                />
                <button type="button" onClick={ togglePassword }>
                    <FontAwesomeIcon icon={ showPassword ? faEyeSlash : faEye } />
                </button>
                { error && <p>{error}</p> }
                <button onClick={ handleSubmit }>Submit</button>
            </div>
        </section>
    );
}

export default PortalSignupGate;