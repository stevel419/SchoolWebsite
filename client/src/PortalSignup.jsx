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
    const navigate = useNavigate();

    const togglePassword = () => {
        setShowPassword(prev => !prev);
    };

    const handleCreateUser = async (e) => {
        e.preventDefault();
        const res = await fetch ('http://localhost:5000/create-user', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({firstName, lastName, subject, username, password, isAdmin})
        });

        const data = res.json();
        if (res.ok) {
            alert(data.message);
        } else {
            alert(data.error);
        }
    }

    return (
        <section className="pt-20">
            <div>
                <h2>Sign up a new teacher</h2>
                <form onSubmit={ handleCreateUser }>
                    <label>Username</label>
                    <input
                        type="text"
                        required
                        value={ username }
                        onChange={ (e) => setUsername(e.target.value) }
                        placeholder="Enter username"
                    />
                    <label>Password</label>
                    <input
                        type={ showPassword ? "text" : "password" }
                        required
                        value={ password }
                        onChange={ (e) => setPassword(e.target.value) }
                        placeholder="Enter password"
                    />
                    <button type="button" onClick={ togglePassword }>
                        <FontAwesomeIcon icon={ showPassword ? faEyeSlash : faEye } />
                    </button>
                    <label>User Role</label>
                    <label>
                        <input
                            type="radio"
                            name="userType"
                            value="admin"
                            onChange={() => setIsAdmin(true)}
                            required
                            checked={isAdmin === true}
                        />
                        Administrator
                    </label>
                    <label>
                        <input
                            type="radio"
                            name="userType"
                            value="teacher"
                            onChange={() => setIsAdmin(false)}
                            required
                            checked={isAdmin === false}
                        />
                        Teacher
                    </label>
                    <label>Teacher Information</label>
                    <label>First Name</label>
                    <input
                        type="text"
                        required
                        value={ firstName }
                        onChange={ (e) => setFirstName(e.target.value) }
                        placeholder="Enter first name"
                    />
                    <label>Last Name</label>
                    <input
                        type="text"
                        required
                        value={ lastName }
                        onChange={ (e) => setLastName(e.target.value) }
                        placeholder="Enter last name"
                    />
                    <label>Subject</label>
                    <input
                        type="text"
                        required
                        value={ subject }
                        onChange={ (e) => setSubject(e.target.value) }
                        placeholder="Enter subject"
                    />
                    <button type="submit">Create New Teacher</button>
                </form>
                <button onClick={() => navigate('/PortalLogin')}>Back to Login</button>
            </div>
        </section>
    );
}

export default PortalSignup;