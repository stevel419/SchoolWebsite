import React, { useState, useEffect } from 'react';

function Staff() {
  const [staff, setStaff] = useState([]);

  useEffect(() => {
    fetch('http://localhost:3000/get-staff')
      .then(res => res.json())
      .then(data => setStaff(data))
      .catch(err => console.error(err));
  }, []);

  return (
    <section className="px-10 py-10">
      <h2 className="uppercase font-bold text-3xl pb-5 border-b-2 border-gray-500">Meet our staff</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 py-5">
        {staff.map((person, index) => (
          <div key={index}>
            <img
              src={person.image} // path to uploaded image
              alt={person.name}
              className="w-full aspect-square object-cover rounded-xl mb-2"
            />
            <p className="text-xl font-bold text-center">{person.name}</p>
            <p className="text-lg font-semibold text-center">{person.position}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Staff;
