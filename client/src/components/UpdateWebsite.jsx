import { useState, useEffect } from 'react';

function UpdateWebsite() {
  const [slides, setSlides] = useState([]);
  const [staff, setStaff] = useState([]);
  const [isAuthorized, setIsAuthorized] = useState(false); // Authorized flag
  const [passwordInput, setPasswordInput] = useState(''); // Password input

  // State for slide and staff data
  const [slideText, setSlideText] = useState('');
  const [slideImage, setSlideImage] = useState(null);
  const [staffName, setStaffName] = useState('');
  const [staffPosition, setStaffPosition] = useState('');
  const [staffImage, setStaffImage] = useState(null);

  useEffect(() => {
    if (isAuthorized) {
      // Fetch slides and staff only after login
      fetch('http://localhost:5000/get-slides')
        .then(res => res.json())
        .then(data => setSlides(data));
      fetch('http://localhost:5000/get-staff')
        .then(res => res.json())
        .then(data => setStaff(data));
    }
  }, [isAuthorized]);

  const checkPassword = async (e) => {
    e.preventDefault();
    const res = await fetch('http://localhost:5000/check-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: passwordInput })
    });

    if (res.ok) setIsAuthorized(true);
    else alert('Incorrect password');
  };

  const handleAddSlide = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('image', slideImage);
    formData.append('text', slideText);

    await fetch('http://localhost:5000/add-slide', {
      method: 'POST',
      body: formData
    });

    setSlideText('');
    setSlideImage(null);

    const updated = await fetch('http://localhost:5000/get-slides').then(res => res.json());
    setSlides(updated);
  };

  const handleDeleteSlide = async (index) => {
    await fetch(`http://localhost:5000/delete-slide/${index}`, { method: 'DELETE' });

    const updated = await fetch('http://localhost:5000/get-slides').then(res => res.json());
    setSlides(updated);
  };

  const handleAddStaff = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('image', staffImage);
    formData.append('name', staffName);
    formData.append('position', staffPosition);

    await fetch('http://localhost:5000/add-staff', { method: 'POST', body: formData });

    setStaffName('');
    setStaffPosition('');
    setStaffImage(null);

    const updated = await fetch('http://localhost:5000/get-staff').then(res => res.json());
    setStaff(updated);
  };

  const handleDeleteStaff = async (index) => {
    await fetch(`http://localhost:5000/delete-staff/${index}`, { method: 'DELETE' });

    const updated = await fetch('http://localhost:5000/get-staff').then(res => res.json());
    setStaff(updated);
  };

  if (!isAuthorized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <h2 className="text-2xl font-bold mb-4">Admin Login</h2>
        <form onSubmit={checkPassword} className="space-y-2 w-64">
          <input
            type="password"
            placeholder="Enter password"
            className="w-full p-2 border rounded"
            value={passwordInput}
            onChange={e => setPasswordInput(e.target.value)}
          />
          <button className="bg-emerald-600 text-white w-full p-2 rounded">Login</button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-10 p-6 pt-20">
      {/* Add Slide */}
      <form onSubmit={handleAddSlide} className="space-y-2 border p-4 rounded">
        <h2 className="font-bold">Add Slide</h2>
        <label
          htmlFor="slideFileInput"
          className="bg-emerald-600 text-white px-4 py-2 rounded cursor-pointer mb-4 inline-block"
        >
          Choose Image
        </label>
        <input
          id="slideFileInput"
          type="file"
          onChange={e => setSlideImage(e.target.files[0])}
          className="hidden"
          required
        />
        {slideImage && <p className="text-sm mt-2 mb-4">Selected: {slideImage.name}</p>}
        <textarea
          value={slideText}
          onChange={e => setSlideText(e.target.value)}
          placeholder="Slide text"
          required
          className="w-full p-2 border"
        />
        <button className="bg-emerald-600 text-white px-4 py-2 rounded">Add Slide</button>
      </form>
  
      {/* Delete Slides */}
      <div className="border p-4 rounded space-y-2">
        <h2 className="font-bold">Delete Slides</h2>
        {slides.map((s, index) => (
          <div key={index} className="flex items-center justify-between border-b py-2">
            <span>{s.text}</span>
            <button
              onClick={() => handleDeleteSlide(index)}
              className="bg-red-600 text-white px-2 py-1 rounded"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
  
      {/* Add Staff */}
      <form onSubmit={handleAddStaff} className="space-y-2 border p-4 rounded">
        <h2 className="font-bold">Add Staff</h2>
        <label
          htmlFor="staffFileInput"
          className="bg-emerald-600 text-white px-4 py-2 rounded cursor-pointer mb-4 inline-block"
        >
          Choose Image
        </label>
        <input
          id="staffFileInput"
          type="file"
          onChange={e => setStaffImage(e.target.files[0])}
          className="hidden"
          required
        />
        {staffImage && <p className="text-sm mt-2 mb-4">Selected: {staffImage.name}</p>}
        <input
          value={staffName}
          onChange={e => setStaffName(e.target.value)}
          placeholder="Name"
          className="w-full p-2 border"
          required
        />
        <input
          value={staffPosition}
          onChange={e => setStaffPosition(e.target.value)}
          placeholder="Position"
          className="w-full p-2 border"
          required
        />
        <button className="bg-emerald-600 text-white px-4 py-2 rounded">Add Staff</button>
      </form>
  
      {/* Delete Staff */}
      <div className="border p-4 rounded space-y-2">
        <h2 className="font-bold">Delete Staff</h2>
        {staff.map((s, index) => (
          <div key={index} className="flex items-center justify-between border-b py-2">
            <span>{s.name} — {s.position}</span>
            <button
              onClick={() => handleDeleteStaff(index)}
              className="bg-red-600 text-white px-2 py-1 rounded"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default UpdateWebsite;
