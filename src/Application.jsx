import { useState } from "react";

function Application() {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [DOB, setDOB] = useState('');
    const [sex, setSex] = useState('');
    const [religion, setReligion] = useState('');
    const [gFirstName, setGFirstName] = useState('');
    const [gLastName, setGLastName] = useState('');
    const [gNumber, setGNumber] = useState('');
    const [gOccupation, setGOccupation] = useState('');
    const [address, setAddress] = useState('');

    const handleSubmit = (e) => {
        const admissionInfo = { 
            firstName, lastName, DOB, sex, religion, gFirstName, gLastName, gNumber, gOccupation, address 
        }
        console.log(admissionInfo);
    }

    return (
        <section>
            <form onSubmit={ handleSubmit }>
                <label>Student Info</label>
                <label>First Name:</label>
                <input
                    type="text"
                    required
                    value={ firstName }
                    onChange={ (e) => setFirstName(e.target.value) }
                ></input>
                <label>Last Name:</label>
                <input
                    type="text"
                    required
                    value={ lastName }
                    onChange={ (e) => setLastName(e.target.value) }
                ></input>
                <label>Date of Birth:</label>
                <input
                    type="date"
                    required
                    value={ DOB }
                    onChange={ (e) => setDOB(e.target.value) }
                ></input>
                <label>Sex:</label>
                <select
                    required
                    value={ sex }
                    onChange={ (e) => setSex(e.target.value) }
                >
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                </select>
                <label>Religion:</label>
                <input
                    type="text"
                    required
                    value={ religion }
                    onChange={ (e) => setReligion(e.target.value) }
                ></input>
                <label>Guardian Info</label>
                <label>Guardian First Name:</label>
                <input
                    type="text"
                    required
                    value={ gFirstName }
                    onChange={ (e) => setGFirstName(e.target.value) }
                ></input>
                <label>Guardian Last Name:</label>
                <input
                    type="text"
                    required
                    value={ gLastName }
                    onChange={ (e) => setGLastName(e.target.value) }
                ></input>
                <label>Guardian Phone Number:</label>
                <input
                    type="tel"
                    required
                    value={ gNumber }
                    onChange={ (e) => setGNumber(e.target.value) }
                ></input>
                <label>Guardian Occupation:</label>
                <input
                    type="text"
                    required
                    value={ gOccupation }
                    onChange={ (e) => setGOccupation(e.target.value) }
                ></input>
                <label>Place of Domicile:</label>
                <input
                    type="text"
                    required
                    value={ address }
                    onChange={ (e) => setAddress(e.target.value) }
                ></input>
                <button>Apply</button>
            </form>
        </section>
    );
}

export default Application;