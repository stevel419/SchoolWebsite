import { useState, useEffect } from 'react';

function UpdateWebsite() {
  const [slides, setSlides] = useState([]);
  const [staff, setStaff] = useState([]);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [slideText, setSlideText] = useState('');
  const [slideImage, setSlideImage] = useState(null);
  const [staffName, setStaffName] = useState('');
  const [staffPosition, setStaffPosition] = useState('');
  const [staffImage, setStaffImage] = useState(null);

  const [newYear, setNewYear] = useState('');
  const [newLink, setNewLink] = useState('');
  const [examResults, setExamResults] = useState([]);

  useEffect(() => {
    const baseURL = import.meta.env.VITE_API_BASE_URL
    if (isAuthorized) {
      // Fetch slides and staff only after login
      fetch(`${baseURL}/get-slides`)
        .then(res => res.json())
        .then(data => setSlides(data));
      fetch(`${baseURL}/get-staff`)
        .then(res => res.json())
        .then(data => setStaff(data));
      fetch(`${baseURL}/get-exam-results`)
        .then(res => res.json())
        .then(data => setExamResults(data));
    }
  }, [isAuthorized]);

  const checkPassword = async (e) => {
    const baseURL = import.meta.env.VITE_API_BASE_URL
    e.preventDefault();
    setLoading(true);
    setError('');
    const res = await fetch(`${baseURL}/check-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: passwordInput })
    });
    if (res.ok) setIsAuthorized(true);
    else setError('Incorrect password');
    setLoading(false);
  };

  const handleAddSlide = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('image', slideImage);
    formData.append('text', slideText);
    const baseURL = import.meta.env.VITE_API_BASE_URL
    await fetch(`${baseURL}/add-slide`, {
      method: 'POST',
      body: formData
    });

    setSlideText('');
    setSlideImage(null);

    const updated = await fetch(`${baseURL}/get-slides`).then(res => res.json());
    setSlides(updated);
  };

  const handleDeleteSlide = async (index) => {
    const baseURL = import.meta.env.VITE_API_BASE_URL
    await fetch(`${baseURL}/delete-slide/${index}`, { method: 'DELETE' });

    const updated = await fetch(`${baseURL}/get-slides`).then(res => res.json());
    setSlides(updated);
  };

  const handleAddStaff = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    const baseURL = import.meta.env.VITE_API_BASE_URL
    formData.append('image', staffImage);
    formData.append('name', staffName);
    formData.append('position', staffPosition);

    await fetch(`${baseURL}/add-staff`, {
      method: 'POST',
      body: formData
    });

    setStaffName('');
    setStaffPosition('');
    setStaffImage(null);

    const updated = await fetch(`${baseURL}/get-staff`).then(res => res.json());
    setStaff(updated);
  };

  const handleDeleteStaff = async (index) => {
    const baseURL = import.meta.env.VITE_API_BASE_URL
    await fetch(`${baseURL}/delete-staff/${index}`, { method: 'DELETE' });
    const updated = await fetch(`${baseURL}/get-staff`).then(res => res.json());
    setStaff(updated);
  };

  const handleAddExamResult = async () => {
    if (!newYear || !newLink) return;

    const updated = [...examResults, { year: newYear, link: newLink }];
    setExamResults(updated);
    setNewYear('');
    setNewLink('');
    const baseURL = import.meta.env.VITE_API_BASE_URL
    await fetch(`${baseURL}/update-exam-results`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ results: updated })
    });
  };

  const handleDeleteExamResult = async (index) => {
    const updated = examResults.filter((_, i) => i !== index);
    setExamResults(updated);
    const baseURL = import.meta.env.VITE_API_BASE_URL
    await fetch(`${baseURL}/update-exam-results`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ results: updated })
    });
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
          {error && (
            <p className="text-red-500 text-sm mb-2">{error}</p>
          )}
          <button className="bg-emerald-600 text-white w-full p-2 rounded-md flex items-center justify-center">
            {loading ? (<div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>) : 'Login'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="space-y-10 p-6 pt-40">
      {/* Add Slide */}
      <form onSubmit={handleAddSlide} className="space-y-2 border p-4 rounded-lg">
        <h2 className="font-bold">Add Slide</h2>
        <label htmlFor="slideFileInput" className="bg-emerald-600 text-white px-4 py-2 rounded-lg cursor-pointer mb-4 inline-block">Choose Image</label>
        <input id="slideFileInput" type="file" onChange={e => setSlideImage(e.target.files[0])} className="hidden" required />
        {slideImage && <p className="text-sm mt-2 mb-4">Selected: {slideImage.name}</p>}
        <textarea value={slideText} onChange={e => setSlideText(e.target.value)} placeholder="Slide text" required className="w-full p-2 border" />
        <button className="bg-emerald-600 text-white px-4 py-2 rounded-lg">Add Slide</button>
      </form>

      {/* Delete Slides */}
      <div className="border p-4 rounded-lg space-y-2">
        <h2 className="font-bold">Delete Slides</h2>
        {slides.map((s, index) => (
          <div key={index} className="flex items-center justify-between border-b py-2">
            <span>{s.text}</span>
            <button onClick={() => handleDeleteSlide(index)} className="bg-red-600 text-white px-2 py-1 rounded-lg">Delete</button>
          </div>
        ))}
      </div>

      {/* Add Staff */}
      <form onSubmit={handleAddStaff} className="space-y-2 border p-4 rounded-lg">
        <h2 className="font-bold">Add Staff</h2>
        <label htmlFor="staffFileInput" className="bg-emerald-600 text-white px-4 py-2 rounded-lg cursor-pointer mb-4 inline-block">Choose Image</label>
        <input id="staffFileInput" type="file" onChange={e => setStaffImage(e.target.files[0])} className="hidden" required />
        {staffImage && <p className="text-sm mt-2 mb-4">Selected: {staffImage.name}</p>}
        <input value={staffName} onChange={e => setStaffName(e.target.value)} placeholder="Name" className="w-full p-2 border" required />
        <input value={staffPosition} onChange={e => setStaffPosition(e.target.value)} placeholder="Position" className="w-full p-2 border" required />
        <button className="bg-emerald-600 text-white px-4 py-2 rounded-lg">Add Staff</button>
      </form>

      {/* Delete Staff */}
      <div className="border p-4 rounded-lg space-y-2">
        <h2 className="font-bold">Delete Staff</h2>
        {staff.map((s, index) => (
          <div key={index} className="flex items-center justify-between border-b py-2">
            <span>{s.name} — {s.position}</span>
            <button onClick={() => handleDeleteStaff(index)} className="bg-red-600 text-white px-2 py-1 rounded-lg">Delete</button>
          </div>
        ))}
      </div>

      {/* Add Exam Result */}
      <div className="border p-4 rounded-lg space-y-4">
        <h2 className="font-bold text-lg">Add Exam Result Link</h2>
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="number"
            value={newYear}
            onChange={e => setNewYear(e.target.value)}
            placeholder="Year"
            className="p-2 border rounded w-full sm:w-32"
          />
          <input
            type="text"
            value={newLink}
            onChange={e => setNewLink(e.target.value)}
            placeholder="NECTA Exam Result Link"
            className="p-2 border rounded-lg flex-grow"
          />
          <button
            onClick={handleAddExamResult}
            disabled={!newYear || !newLink}
            className="bg-emerald-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
          >
            Add Result Link
          </button>
        </div>
      </div>

      {/* Delete Exam Results */}
      <div className="border p-4 rounded-lg space-y-2">
        <h2 className="font-bold text-lg">Delete Exam Result Links</h2>
        {examResults.map((r, index) => (
          <div key={index} className="flex items-center justify-between border-b py-2">
            <span>{r.year} — <a href={r.link} className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">View Result</a></span>
            <button
              onClick={() => handleDeleteExamResult(index)}
              className="bg-red-600 text-white px-2 py-1 rounded-lg"
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
