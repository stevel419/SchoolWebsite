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

    const handleSubmit = async (e) => {
        e.preventDefault();
        const admissionInfo = {
          firstName, lastName, DOB, sex, religion,
          gFirstName, gLastName, gNumber, gOccupation, address
        };
      
        try {
          const res = await fetch('http://localhost:3000/submit-application', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(admissionInfo),
          });
      
          const data = await res.json();
          if (!res.ok) throw new Error(data.error);
          alert("Application submitted successfully!");
        } catch (err) {
          console.error(err);
          alert("Failed to submit application.");
        }
      };

    return (
        <section className="min-h-screen bg-gray-50 py-15 px-4">
            <div className="max-w-2xl mx-auto">
                <h2 className="font-bold text-3xl text-center pb-10">Interested in Kiguruyembe Secondary School?</h2>
                <div className="bg-white rounded-xl shadow-xl p-6 md:p-8">
                    <h2 className="font-bold text-2xl md:text-3xl mb-8">
                        Apply Here!
                    </h2>
                    <div className="space-y-6">
                        <div className="space-y-4">
                            <h3 className="text-xl font-semibold border-b border-gray-500 pb-2">
                                Student Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block font-medium text-gray-800 mb-1">
                                        First Name
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={ firstName }
                                        onChange={ (e) => setFirstName(e.target.value) }
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
                                        placeholder="Enter first name"
                                    />
                                </div>
                                <div>
                                    <label className="block font-medium text-gray-800 mb-1">
                                        Last Name
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={ lastName }
                                        onChange={ (e) => setLastName(e.target.value) }
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
                                        placeholder="Enter last name"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block font-medium text-gray-800 mb-1">
                                        Date of Birth
                                    </label>
                                    <input
                                        type="date"
                                        required
                                        value={ DOB }
                                        onChange={ (e) => setDOB(e.target.value) }
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
                                    />
                                </div>
                                <div>
                                    <label className="block font-medium text-gray-800 mb-1">
                                        Sex
                                    </label>
                                    <select
                                        required
                                        value={ sex }
                                        onChange={ (e) => setSex(e.target.value) }
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
                                    >
                                        <option value="" disabled>-- Select one --</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="block font-medium text-gray-800 mb-1">
                                    Religion
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={ religion }
                                    onChange={ (e) => setReligion(e.target.value) }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
                                    placeholder="Enter religion"
                                />
                            </div>
                        </div>
                        <div className="space-y-4">
                            <h3 className="text-xl font-semibold border-b border-gray-500 pb-2">
                                Guardian Information
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block font-medium text-gray-800 mb-1">
                                        Guardian First Name
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={ gFirstName }
                                        onChange={ (e) => setGFirstName(e.target.value) }
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
                                        placeholder="Enter guardian's first name"
                                    />
                                </div>
                                <div>
                                    <label className="block font-medium text-gray-800 mb-1">
                                        Guardian Last Name
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={ gLastName }
                                        onChange={ (e) => setGLastName(e.target.value) }
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
                                        placeholder="Enter guardian's last name"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block font-medium text-gray-800 mb-1">
                                        Guardian Phone Number
                                    </label>
                                    <input
                                        type="tel"
                                        required
                                        value={ gNumber }
                                        onChange={ (e) => setGNumber(e.target.value) }
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
                                        placeholder="Enter phone number"
                                    />
                                </div>
                                <div>
                                    <label className="block font-medium text-gray-800 mb-1">
                                        Guardian Occupation
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={ gOccupation }
                                        onChange={ (e) => setGOccupation(e.target.value) }
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
                                        placeholder="Enter occupation"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block font-medium text-gray-800 mb-1">
                                    Place of Domicile
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={ address }
                                    onChange={ (e) => setAddress(e.target.value) }
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:border-transparent"
                                    placeholder="Enter address"
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            onClick={ handleSubmit }
                            className="w-full bg-emerald-600 hover:bg-emerald-800 text-white font-semibold py-3 px-4 rounded-md transition duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                            Submit Application
                        </button>
                    </div>
                </div>
            </div>
        </section>
    );
}

export default Application;